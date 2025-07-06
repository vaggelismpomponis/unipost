const { chromium } = require('playwright');
const fs = require('fs');

async function fetchGradesWithPlaywright({ username, password, gradesUrl }) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    console.log('Navigating to grades URL:', gradesUrl);
    await page.goto(gradesUrl, { waitUntil: 'domcontentloaded' });

    // If redirected to CAS login, fill the form
    if (page.url().includes('cas.uth.gr/login')) {
      console.log('On CAS login page, filling credentials...');
      await page.fill('input[name="username"]', username);
      await page.fill('input[name="password"]', password);
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
        page.click('input[type="submit"],button[type="submit"],input[name="submit"]'),
      ]);
      console.log('Submitted login form. Current URL:', page.url());
      // Μετά το login, ξαναπήγαινε στη σελίδα βαθμών
      await page.goto(gradesUrl, { waitUntil: 'domcontentloaded' });
    }

    // Περίμενε να φορτώσει ο πίνακας βαθμών
    await page.waitForSelector('#student_grades_diploma');

    // Extract grades data directly from the DOM
    const grades = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('#student_grades_diploma tbody tr'));
      return rows
        .map(row => {
          const tds = row.querySelectorAll('td');
          if (tds.length < 13) return null;
          return {
            code: tds[0].innerText.trim(),
            name: tds[1].innerText.trim(),
            grade: tds[2].innerText.trim(),
            period: tds[3].innerText.trim(),
            year: tds[4].innerText.trim(),
            bp: tds[5].querySelector('input')?.checked || false,
            pp: tds[6].querySelector('input')?.checked || false,
            dm: tds[7].innerText.trim(),
            ects: tds[8].innerText.trim(),
            type: tds[9].innerText.trim(),
            category: tds[10].innerText.trim(),
            direction: tds[11].innerText.trim(),
            group: tds[12].innerText.trim(),
          };
        })
        .filter(Boolean);
    });

    fs.writeFileSync('grades.json', JSON.stringify(grades, null, 2));
    console.log('Grades extracted and saved to grades.json');
    await browser.close();
    return grades;
  } catch (error) {
    await browser.close();
    throw error;
  }
}

// CLI usage: node playwright-sis-login.js username password gradesUrl
if (require.main === module) {
  const [,, username, password, gradesUrl] = process.argv;
  if (!username || !password || !gradesUrl) {
    console.error('Usage: node playwright-sis-login.js <username> <password> <gradesUrl>');
    process.exit(1);
  }
  fetchGradesWithPlaywright({ username, password, gradesUrl })
    .then(() => console.log('Done!'))
    .catch(err => console.error('Error:', err));
}

module.exports = { fetchGradesWithPlaywright }; 