// UTH SIS Grades Extension
// Handles login and grade fetching from UTH SIS system

class UTHGradesFetcher {
  constructor() {
    this.baseUrl = 'https://sis-web.uth.gr';
    this.loginUrl = 'https://cas.uth.gr/login?service=https%3A%2F%2Fsis-web.uth.gr%2Flogin%2Fcas';
    this.gradesUrl = 'https://sis-web.uth.gr/pls/studweb/studweb.grades';
  }

  async openSISPage() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'openSISPage' });
      return response.success;
    } catch (error) {
      console.error('Error opening SIS page:', error);
      throw error;
    }
  }

  async extractGradesFromCurrentPage() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'extractGradesFromPage' });
      return response;
    } catch (error) {
      console.error('Error extracting grades:', error);
      throw error;
    }
  }

  async saveGrades(grades) {
    try {
      const response = await chrome.runtime.sendMessage({ 
        action: 'saveGrades', 
        grades: grades 
      });
      return response.success;
    } catch (error) {
      console.error('Error saving grades:', error);
      throw error;
    }
  }

  async getStoredGrades() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getStoredGrades' });
      return response;
    } catch (error) {
      console.error('Error getting stored grades:', error);
      throw error;
    }
  }
}

// UI Handler
class UIHandler {
  constructor() {
    this.fetcher = new UTHGradesFetcher();
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    const form = document.getElementById('login-form');
    const loadStoredButton = document.getElementById('load-stored');
    const extractCurrentButton = document.getElementById('extract-current');

    form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    loadStoredButton.addEventListener('click', () => this.loadStoredGrades());
    extractCurrentButton.addEventListener('click', () => this.extractFromCurrentPage());
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const errorDiv = document.getElementById('error');
    const resultDiv = document.getElementById('result');
    const submitButton = document.querySelector('button[type="submit"]');

    // Clear previous results
    errorDiv.textContent = '';
    resultDiv.innerHTML = '';

    // Disable form during processing
    submitButton.disabled = true;
    submitButton.textContent = 'Άνοιγμα σελίδας...';

    try {
      // Open SIS page
      await this.fetcher.openSISPage();
      
      submitButton.textContent = 'Εξαγωγή βαθμών...';
      
      // Wait a bit for the page to load, then extract grades
      setTimeout(async () => {
        try {
          const result = await this.fetcher.extractGradesFromCurrentPage();
          
          if (result.success && result.grades.length > 0) {
            // Save grades
            await this.fetcher.saveGrades(result.grades);
            this.displayGrades(result.grades);
          } else {
            this.showError('Δεν βρέθηκαν βαθμοί. Παρακαλώ βεβαιωθείτε ότι είστε συνδεδεμένοι στη σελίδα των βαθμών.');
          }
        } catch (error) {
          this.showError('Σφάλμα κατά την εξαγωγή: ' + error.message);
        } finally {
          submitButton.disabled = false;
          submitButton.textContent = 'Εξαγωγή βαθμών';
        }
      }, 3000);
      
    } catch (error) {
      this.showError(error.message);
      submitButton.disabled = false;
      submitButton.textContent = 'Εξαγωγή βαθμών';
    }
  }

  showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
  }

  async loadStoredGrades() {
    try {
      const result = await this.fetcher.getStoredGrades();
      
      if (result.success && result.grades.length > 0) {
        this.displayGrades(result.grades);
        
        if (result.lastUpdated) {
          const date = new Date(result.lastUpdated);
          const dateStr = date.toLocaleDateString('el-GR');
          const timeStr = date.toLocaleTimeString('el-GR');
          
          const resultDiv = document.getElementById('result');
          resultDiv.innerHTML += `<p style="font-size: 12px; color: #666; margin-top: 8px;">
            Τελευταία ενημέρωση: ${dateStr} ${timeStr}
          </p>`;
        }
      } else {
        this.showError('Δεν βρέθηκαν αποθηκευμένοι βαθμοί');
      }
    } catch (error) {
      this.showError('Σφάλμα κατά τη φόρτωση: ' + error.message);
    }
  }

  async extractFromCurrentPage() {
    const submitButton = document.getElementById('extract-current');
    const originalText = submitButton.textContent;
    
    submitButton.disabled = true;
    submitButton.textContent = 'Εξαγωγή...';
    
    try {
      const result = await this.fetcher.extractGradesFromCurrentPage();
      
      if (result && result.success && result.grades.length > 0) {
        await this.fetcher.saveGrades(result.grades);
        this.displayGrades(result.grades);
      } else if (result && result.error) {
        this.showError('Σφάλμα κατά την εξαγωγή: ' + result.error);
      } else {
        this.showError('Δεν βρέθηκαν βαθμοί ή το extension δεν έχει πρόσβαση στη σελίδα. Βεβαιώσου ότι είσαι στη σελίδα των βαθμών και κάνε refresh.');
      }
    } catch (error) {
      this.showError('Σφάλμα κατά την εξαγωγή: ' + error.message);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  }

  displayGrades(grades) {
    const resultDiv = document.getElementById('result');
    
    if (grades.length === 0) {
      resultDiv.innerHTML = '<p>Δεν βρέθηκαν βαθμοί ή υπάρχει πρόβλημα με την ανάλυση της σελίδας.</p>';
      return;
    }

    let html = '<h3>Βαθμοί που βρέθηκαν:</h3>';
    html += '<table style="width: 100%; border-collapse: collapse;">';
    html += '<tr><th>Μάθημα</th><th>Βαθμός</th><th>Εξάμηνο</th></tr>';
    
    grades.forEach(grade => {
      html += `<tr>
        <td>${grade.course}</td>
        <td style="text-align: center;">${grade.grade}</td>
        <td>${grade.semester}</td>
      </tr>`;
    });
    
    html += '</table>';
    
    // Add export button
    html += `<button onclick="exportGrades()" style="margin-top: 12px; width: 100%;">Εξαγωγή σε JSON</button>`;
    
    resultDiv.innerHTML = html;
    
    // Store grades globally for export
    window.currentGrades = grades;
  }
}

// Export function
function exportGrades() {
  if (!window.currentGrades) {
    alert('Δεν υπάρχουν βαθμοί για εξαγωγή');
    return;
  }

  const dataStr = JSON.stringify(window.currentGrades, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = 'uth-grades.json';
  link.click();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new UIHandler();
}); 