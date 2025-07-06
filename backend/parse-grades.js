const cheerio = require('cheerio');
const fs = require('fs');

const html = fs.readFileSync('playwright_grades_page.html', 'utf8');
const $ = cheerio.load(html);

const grades = [];

$('#student_grades_diploma tbody tr').each((i, row) => {
  const tds = $(row).find('td');
  console.log(`Row ${i}: tds.length = ${tds.length}`);
  if (tds.length > 0) {
    console.log('Row HTML:', $(row).html());
  }
  if (tds.length < 13) return; // Αγνόησε group headers

  grades.push({
    code: $(tds[0]).text().trim(),
    name: $(tds[1]).text().trim(),
    grade: $(tds[2]).text().trim(),
    period: $(tds[3]).text().trim(),
    year: $(tds[4]).text().trim(),
    bp: $(tds[5]).find('input').is(':checked'),
    pp: $(tds[6]).find('input').is(':checked'),
    dm: $(tds[7]).text().trim(),
    ects: $(tds[8]).text().trim(),
    type: $(tds[9]).text().trim(),
    category: $(tds[10]).text().trim(),
    direction: $(tds[11]).text().trim(),
    group: $(tds[12]).text().trim(),
  });
});

console.log('Extracted grades:', JSON.stringify(grades, null, 2)); 