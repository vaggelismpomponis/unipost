const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const { fetchGradesWithPlaywright } = require('./playwright-sis-login');
const { supabase } = require('./supabaseClient');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// UTH SIS Configuration
const CAS_BASE_URL = 'https://cas.uth.gr/login';
const SIS_BASE_URL = 'https://sis-web.uth.gr';
const GRADES_URL = `${SIS_BASE_URL}/student/grades`;

// Store sessions (in production, use Redis or database)
const sessions = new Map();

// Helper function to extract grades from HTML using proper XPath-like selectors
function extractGradesFromHTML(html) {
  const $ = cheerio.load(html);
  const grades = [];
  
  console.log('Extracting grades from HTML...');
  
  // Approach 1: Look for the specific grades table (gvGrades)
  const gradesTable = $('#gvGrades');
  if (gradesTable.length > 0) {
    console.log('Found gvGrades table');
    
    gradesTable.find('tr').each((index, row) => {
      if (index === 0) return; // Skip header row
      
      const cells = $(row).find('td');
      if (cells.length >= 7) {
        const code = $(cells[1]).text().trim();
        const title = $(cells[2]).text().trim();
        const gradeText = $(cells[4]).text().trim();
        const ects = $(cells[5]).text().trim();
        const date = $(cells[6]).text().trim();
        
        // Parse grade
        let grade = null;
        if (gradeText) {
          const gradeNum = parseFloat(gradeText.replace(',', '.'));
          if (!isNaN(gradeNum) && gradeNum >= 0 && gradeNum <= 10) {
            grade = gradeNum;
          }
        }
        
        if (title && grade !== null) {
          grades.push({
            code,
            course: title,
            grade,
            ects: parseFloat(ects) || 0,
            date,
            status: grade >= 5 ? 'passed' : 'failed',
            extractedAt: new Date().toISOString()
          });
          console.log(`Found grade: ${title} - ${grade}`);
        }
      }
    });
  }
  
  // Approach 2: Look for any table with grade-like data
  if (grades.length === 0) {
    console.log('gvGrades table not found, trying generic table search...');
    
    $('table').each((tableIndex, table) => {
      const rows = $(table).find('tr');
      console.log(`Table ${tableIndex}: ${rows.length} rows`);
      
      rows.each((rowIndex, row) => {
        const cells = $(row).find('td');
        
        if (cells.length >= 3) {
          const course = $(cells[0]).text().trim();
          let gradeRaw = $(cells[1]).text().trim();
          const semester = $(cells[2]).text().trim();
          
          // Try to parse grade
          let grade = null;
          if (gradeRaw) {
            gradeRaw = gradeRaw.replace(/[^\d,.]/g, '');
            gradeRaw = gradeRaw.replace(',', '.');
            grade = parseFloat(gradeRaw);
            if (isNaN(grade)) grade = null;
          }
          
          // Only extract if we have course name and valid grade
          if (course && grade !== null && !isNaN(grade) && grade > 0 && grade <= 10) {
            grades.push({
              course,
              grade,
              semester: semester || 'Άγνωστο',
              status: grade >= 5 ? 'passed' : 'failed',
              extractedAt: new Date().toISOString()
            });
            console.log(`Found grade: ${course} - ${grade}`);
          }
        }
      });
    });
  }
  
  console.log(`Total grades found: ${grades.length}`);
  return grades;
}

// CAS SSO Login endpoint
app.post('/api/sis/login', async (req, res) => {
  try {
    const { username, password, gradesUrl } = req.body;
    if (!username || !password || !gradesUrl) {
      return res.status(400).json({ 
        success: false, 
        error: 'Χρειάζονται username, password και gradesUrl' 
      });
    }

    console.log('Starting CAS SSO login...');

    // Create axios instance with browser-like headers
    const axiosInstance = axios.create({
      withCredentials: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'el,en;q=0.9',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    // Step 1: GET CAS login page to get cookies (no need to extract lt/execution)
    const serviceUrl = encodeURIComponent(gradesUrl);
    const casLoginUrl = `${CAS_BASE_URL}?service=${serviceUrl}`;
    
    console.log('Fetching CAS login page (GET)...');
    const casGetResponse = await axiosInstance.get(casLoginUrl);
    const cookiesFromGet = casGetResponse.headers['set-cookie'] || [];
    // No need to extract lt/execution
    
    // Step 2: POST login form with cookies from GET
    const loginData = new URLSearchParams({
      username,
      password,
      _eventId: 'submit'
    });

    console.log('Submitting login credentials (POST)...');
    const loginResponse = await axiosInstance.post(casLoginUrl, loginData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookiesFromGet.join('; '),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'el,en;q=0.9',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      maxRedirects: 0, // We want to handle the redirect manually
      validateStatus: (status) => status < 400 || status === 302 // Accept 302
    });

    // Check for redirect to service URL (with ticket)
    const redirectUrl = loginResponse.headers.location;
    let cookies = loginResponse.headers['set-cookie'] || [];
    let finalCookies = cookies.join('; ');

    if (redirectUrl) {
      console.log('Following CAS redirect to service URL:', redirectUrl);
      // Follow the redirect to establish session in SIS
      const followResponse = await axiosInstance.get(redirectUrl, {
        headers: {
          'Cookie': finalCookies,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        maxRedirects: 5,
        validateStatus: (status) => status < 400 || status === 302
      });
      // Merge any new cookies
      const followCookies = followResponse.headers['set-cookie'] || [];
      if (followCookies.length > 0) {
        finalCookies += '; ' + followCookies.join('; ');
      }
      console.log('SIS session established after redirect.');
    }

    // Check if we have CASTGC or JSESSIONID in cookies
    if (!finalCookies.includes('CASTGC') && !finalCookies.includes('JSESSIONID')) {
      console.error('Login failed - no CASTGC or JSESSIONID cookie found');
      return res.status(401).json({ 
        success: false, 
        error: 'Λάθος username ή password ή αποτυχία CAS flow' 
      });
    }

    // Store session cookies and gradesUrl
    const sessionId = Math.random().toString(36).substring(7);
    sessions.set(sessionId, {
      cookies: finalCookies,
      username,
      gradesUrl,
      createdAt: new Date()
    });

    res.json({ 
      success: true, 
      sessionId,
      message: 'Επιτυχής σύνδεση με CAS SSO' 
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Σφάλμα κατά τη σύνδεση: ' + error.message 
    });
  }
});

// Fetch grades endpoint
app.post('/api/sis/grades', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Χρειάζεται sessionId' 
      });
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(401).json({ 
        success: false, 
        error: 'Ληγμένη ή άκυρη session' 
      });
    }

    console.log('Fetching grades with session cookies...');

    // Create axios instance with stored cookies
    const axiosInstance = axios.create({
      withCredentials: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cookie': session.cookies
      }
    });

    // Fetch grades page using the stored gradesUrl
    console.log('Fetching grades page...');
    const gradesResponse = await axiosInstance.get(session.gradesUrl);
    
    if (gradesResponse.status !== 200) {
      console.error('Grades page fetch failed:', gradesResponse.status);
      return res.status(500).json({ 
        success: false, 
        error: 'Δεν μπόρεσε να φορτώσει η σελίδα βαθμών' 
      });
    }

    console.log('Grades page fetched successfully');
    console.log('Page length:', gradesResponse.data.length);
    
    // Extract grades from HTML
    const grades = extractGradesFromHTML(gradesResponse.data);
    
    if (grades.length === 0) {
      console.log('No grades found in the page');
      // Save HTML for debugging
      const fs = require('fs');
      fs.writeFileSync('debug_page.html', gradesResponse.data);
      console.log('Saved page HTML to debug_page.html');
      
      return res.status(404).json({ 
        success: false, 
        error: 'Δεν βρέθηκαν βαθμοί στη σελίδα. Ελέγξτε ότι είστε στη σωστή σελίδα βαθμών.' 
      });
    }

    res.json({
      success: true,
      grades,
      count: grades.length,
      extractedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Grades fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Σφάλμα κατά την ανάκτηση βαθμών: ' + error.message 
    });
  }
});

// Playwright-based grades fetch endpoint
app.post('/api/sis/playwright-grades', async (req, res) => {
  const { username, password } = req.body;
  const gradesUrl = "https://sis-web.uth.gr/student/grades/list_diploma?p=";
  try {
    // ... pass gradesUrl to your Playwright logic
    const grades = await fetchGradesWithPlaywright({ username, password, gradesUrl });
    res.json({ success: true, grades });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint για αποθήκευση βαθμών στο Supabase
app.post('/api/sis/save-grades', async (req, res) => {
  try {
    const { username, grades } = req.body;
    if (!username || !grades || !Array.isArray(grades)) {
      return res.status(400).json({ success: false, error: 'Χρειάζονται username και grades array' });
    }
    const { error } = await supabase
      .from('grades_history')
      .insert([{ username, grades }]);
    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ success: false, error: 'Σφάλμα κατά την αποθήκευση στο Supabase' });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('Save grades error:', err);
    return res.status(500).json({ success: false, error: 'Σφάλμα κατά την αποθήκευση' });
  }
});

// Endpoint για λήψη ιστορικού βαθμών από το Supabase
app.get('/api/sis/grades-history', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ success: false, error: 'Απαιτείται username' });
    }
    const { data, error } = await supabase
      .from('grades_history')
      .select('id, grades, fetched_at')
      .eq('username', username)
      .order('fetched_at', { ascending: false });
    if (error) {
      console.error('Supabase fetch error:', error);
      return res.status(500).json({ success: false, error: 'Σφάλμα κατά τη λήψη ιστορικού' });
    }
    return res.json({ success: true, history: data });
  } catch (err) {
    console.error('Grades history error:', err);
    return res.status(500).json({ success: false, error: 'Σφάλμα κατά τη λήψη ιστορικού' });
  }
});

// Cleanup old sessions (run every hour)
setInterval(() => {
  const now = new Date();
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.createdAt > 60 * 60 * 1000) { // 1 hour
      sessions.delete(sessionId);
    }
  }
}, 60 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('UTH SIS Grades Fetcher - UniStudents Architecture');
}); 