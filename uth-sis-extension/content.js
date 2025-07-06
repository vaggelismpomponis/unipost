// Prevent double-injection of the content script
if (window.__UTH_SIS_CONTENT_SCRIPT_LOADED__) {
  // Already loaded, do nothing
  console.log('Content script already loaded, skipping...');
} else {
  window.__UTH_SIS_CONTENT_SCRIPT_LOADED__ = true;

  // Content Script for UTH SIS
  // Runs on the SIS pages to extract grades and other data

  class SISContentScript {
    constructor() {
      this.init();
    }

    init() {
      // Listen for messages from popup
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'extractGrades') {
          this.extractGrades().then(sendResponse);
          return true; // Keep message channel open for async response
        }
      });

      // Auto-extract grades when on grades page
      if (window.location.href.includes('grades')) {
        this.autoExtractGrades();
      }
    }

    async extractGrades() {
      try {
        const grades = [];
        
        // Βρίσκω τον πίνακα με τα μαθήματα (πρώτος <table> με πολλές στήλες)
        const tables = document.querySelectorAll('table');
        let found = false;
        for (const table of tables) {
          const rows = table.querySelectorAll('tr');
          
          for (const row of rows) {
            const cells = row.querySelectorAll('td');
            
            // Ελέγχω αν η γραμμή έχει τουλάχιστον 5 στήλες και η 3η στήλη είναι αριθμός (βαθμός)
            if (cells.length >= 5 && cells[2]) {
              const code = cells[0]?.textContent?.trim();
              const course = cells[1]?.textContent?.trim();
              let gradeRaw = cells[2]?.textContent?.trim();
              const period = cells[3]?.textContent?.trim();
              const year = cells[4]?.textContent?.trim();
              // Μετατροπή βαθμού (π.χ. "5,7" -> 5.7)
              let grade = null;
              if (gradeRaw) {
                gradeRaw = gradeRaw.replace(',', '.');
                grade = parseFloat(gradeRaw);
                if (isNaN(grade)) grade = null;
              }
              // Εξάγω μόνο αν υπάρχει όνομα μαθήματος και βαθμός
              if (course && grade !== null && !isNaN(grade)) {
                grades.push({
                  code,
                  course,
                  grade,
                  period,
                  year
                });
                found = true;
              }
            }
          }
        }
        if (!found) {
          return { success: false, error: 'Δεν βρέθηκαν βαθμοί στον πίνακα.' };
        }
        return {
          success: true,
          grades,
          url: window.location.href,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        console.error('Error extracting grades:', error);
        return {
          success: false,
          error: error.message,
          url: window.location.href,
          timestamp: new Date().toISOString()
        };
      }
    }

    autoExtractGrades() {
      // Automatically extract grades when on grades page
      setTimeout(() => {
        this.extractGrades().then(result => {
          if (result.success && result.grades.length > 0) {
            console.log('Auto-extracted grades:', result.grades);
            
            // Send to popup if it's open
            chrome.runtime.sendMessage({
              action: 'autoExtractedGrades',
              data: result
            });
          }
        });
      }, 2000); // Wait for page to load
    }
  }

  // Initialize content script
  new SISContentScript();
} 