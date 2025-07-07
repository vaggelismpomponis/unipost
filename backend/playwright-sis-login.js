const { chromium } = require('playwright');
const fs = require('fs');

async function fetchGradesWithPlaywright({ username, password }) {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    try {
      // 1. Πήγαινε στην αρχική σελίδα του SIS
      await page.goto('https://sis-web.uth.gr/student/', { waitUntil: 'domcontentloaded' });
  
      // 2. Αν βρεθείς στη σελίδα login, κάνε login
      if (page.url().includes('cas.uth.gr/login')) {
        await page.fill('input[name="username"]', username);
        await page.fill('input[name="password"]', password);
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
          page.click('input[type="submit"],button[type="submit"],input[name="submit"]'),
        ]);
      }
  
      // 3. Πήγαινε στο main dashboard (αν δεν γίνεται redirect αυτόματα)
      await page.goto('https://sis-web.uth.gr/student/main', { waitUntil: 'domcontentloaded' });
  
      // 4. Βρες το link για βαθμούς (με το σωστό p=)
      const gradesLink = await page.getAttribute('a[href*="grades/list_diploma"]', 'href');
      if (!gradesLink) {
        throw new Error('Δεν βρέθηκε link για βαθμούς στο dashboard!');
      }
  
      // 5. Πήγαινε στο σωστό URL (πάντα σωστό format)
      const fullGradesUrl = new URL(gradesLink, 'https://sis-web.uth.gr').toString();
      await page.goto(fullGradesUrl, { waitUntil: 'domcontentloaded' });
  
      // 6. Περίμενε να φορτώσει ο πίνακας βαθμών
      await page.waitForSelector('#student_grades_diploma');
  
      // 7. Scrape τους βαθμούς (όπως ήδη κάνεις)
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
      await browser.close();
      return grades;
    } catch (error) {
      await browser.close();
      throw error;
    }
  }

// CLI usage: node playwright-sis-login.js username password gradesUrl
if (require.main === module) {
  const [,, username, password] = process.argv;
  if (!username || !password) {
    console.error('Usage: node playwright-sis-login.js <username> <password>');
    process.exit(1);
  }
  const gradesUrl = "https://sis-web.uth.gr/student/grades/list_diploma?p=";
  fetchGradesWithPlaywright({ username, password, gradesUrl })
    .then(() => console.log('Done!'))
    .catch(err => console.error('Error:', err));
}

module.exports = { fetchGradesWithPlaywright }; 