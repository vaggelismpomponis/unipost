const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// UTH SIS Configuration
const SIS_BASE_URL = 'https://sis-web.uth.gr';
const CAS_LOGIN_URL = 'https://cas.uth.gr/login?service=https%3A%2F%2Fsis-web.uth.gr%2Flogin%2Fcas';

// Store sessions (in production, use Redis or database)
const sessions = new Map();

// Helper function to extract grades from HTML
function extractGradesFromHTML(html) {
  const $ = cheerio.load(html);
  const grades = [];
  
  // Look for tables with grade data
  $('table').each((tableIndex, table) => {
    const rows = $(table).find('tr');
    
    rows.each((rowIndex, row) => {
      const cells = $(row).find('td');
      
      if (cells.length >= 5) {
        const code = $(cells[0]).text().trim();
        const course = $(cells[1]).text().trim();
        let gradeRaw = $(cells[2]).text().trim();
        const period = $(cells[3]).text().trim();
        const year = $(cells[4]).text().trim();
        
        // Convert grade (e.g., "5,7" -> 5.7)
        let grade = null;
        if (gradeRaw) {
          gradeRaw = gradeRaw.replace(',', '.');
          grade = parseFloat(gradeRaw);
          if (isNaN(grade)) grade = null;
        }
        
        // Only extract if we have course name and valid grade
        if (course && grade !== null && !isNaN(grade)) {
          grades.push({
            code,
            course,
            grade,
            period,
            year,
            extractedAt: new Date().toISOString()
          });
        }
      }
    });
  });
  
  return grades;
}

// Login endpoint
app.post('/api/sis/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Χρειάζονται username και password' 
      });
    }

    // Create axios instance with session cookies
    const axiosInstance = axios.create({
      withCredentials: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Step 1: Get CAS login page to get execution parameter
    const casResponse = await axiosInstance.get(CAS_LOGIN_URL);
    const $ = cheerio.load(casResponse.data);
    const execution = $('input[name="execution"]').val();

    if (!execution) {
      return res.status(400).json({ 
        success: false, 
        error: 'Δεν μπόρεσε να βρεθεί το execution parameter' 
      });
    }

    // Step 2: Submit login form
    const loginData = new URLSearchParams({
      username,
      password,
      execution,
      _eventId: 'submit'
    });

    const loginResponse = await axiosInstance.post(CAS_LOGIN_URL, loginData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      maxRedirects: 5
    });

    // Check if login was successful
    if (loginResponse.data.includes('error') || loginResponse.data.includes('Invalid')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Λάθος username ή password' 
      });
    }

    // Store session cookies
    const sessionId = Math.random().toString(36).substring(7);
    sessions.set(sessionId, {
      cookies: axiosInstance.defaults.headers.Cookie || loginResponse.headers['set-cookie'],
      username,
      createdAt: new Date()
    });

    res.json({ 
      success: true, 
      sessionId,
      message: 'Επιτυχής σύνδεση' 
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

    // Create axios instance with stored cookies
    const axiosInstance = axios.create({
      withCredentials: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cookie': session.cookies
      }
    });

    // Fetch grades page
    const gradesResponse = await axiosInstance.get(`${SIS_BASE_URL}/pls/studweb/studweb.grades`);
    
    if (gradesResponse.status !== 200) {
      return res.status(500).json({ 
        success: false, 
        error: 'Δεν μπόρεσε να φορτώσει η σελίδα βαθμών' 
      });
    }

    // Extract grades from HTML
    const grades = extractGradesFromHTML(gradesResponse.data);
    
    if (grades.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Δεν βρέθηκαν βαθμοί στη σελίδα' 
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
}); 