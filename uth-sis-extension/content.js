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
      
      // Method 1: Look for structured tables
      const tables = document.querySelectorAll('table');
      
      for (const table of tables) {
        const rows = table.querySelectorAll('tr');
        
        for (const row of rows) {
          const cells = row.querySelectorAll('td');
          
          if (cells.length >= 2) {
            // Try to identify course and grade columns
            const courseCell = this.findCourseCell(cells);
            const gradeCell = this.findGradeCell(cells);
            
            if (courseCell && gradeCell) {
              const course = courseCell.textContent.trim();
              const grade = this.parseGrade(gradeCell.textContent.trim());
              
              if (course && grade !== null) {
                grades.push({
                  course: course,
                  grade: grade,
                  semester: this.extractSemester(cells),
                  extractedAt: new Date().toISOString()
                });
              }
            }
          }
        }
      }

      // Method 2: Look for grade patterns in text
      if (grades.length === 0) {
        const textContent = document.body.textContent;
        const gradeMatches = this.findGradePatterns(textContent);
        grades.push(...gradeMatches);
      }

      return {
        success: true,
        grades: grades,
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

  findCourseCell(cells) {
    // Look for cells that might contain course names
    for (const cell of cells) {
      const text = cell.textContent.trim();
      if (text.length > 10 && text.length < 100 && 
          !text.match(/^\d+$/) && 
          !text.match(/^[0-9.]+$/) &&
          text.includes(' ')) {
        return cell;
      }
    }
    return null;
  }

  findGradeCell(cells) {
    // Look for cells that might contain grades
    for (const cell of cells) {
      const text = cell.textContent.trim();
      const grade = this.parseGrade(text);
      if (grade !== null) {
        return cell;
      }
    }
    return null;
  }

  parseGrade(text) {
    // Remove common non-grade text
    const cleanText = text.replace(/[^\d.]/g, '');
    const grade = parseFloat(cleanText);
    
    // Check if it's a valid grade (0-10 scale)
    if (!isNaN(grade) && grade >= 0 && grade <= 10) {
      return grade;
    }
    
    return null;
  }

  extractSemester(cells) {
    // Try to find semester information
    for (const cell of cells) {
      const text = cell.textContent.trim().toLowerCase();
      if (text.includes('εξάμηνο') || text.includes('semester') || 
          text.match(/\d{4}-\d{4}/) || text.match(/\d{4}\/\d{4}/)) {
        return cell.textContent.trim();
      }
    }
    return 'Άγνωστο';
  }

  findGradePatterns(text) {
    const grades = [];
    
    // Pattern 1: Course name followed by grade
    const pattern1 = /([Α-Ωα-ω\s]{10,50})\s*([0-9]+(?:\.[0-9]+)?)/g;
    let match;
    
    while ((match = pattern1.exec(text)) !== null) {
      const course = match[1].trim();
      const grade = parseFloat(match[2]);
      
      if (grade >= 0 && grade <= 10) {
        grades.push({
          course: course,
          grade: grade,
          semester: 'Άγνωστο',
          extractedAt: new Date().toISOString()
        });
      }
    }
    
    return grades;
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