import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  el: {
    translation: {
      // Common
      'common.loading': 'Φόρτωση...',
      'common.error': 'Σφάλμα',
      'common.success': 'Επιτυχία',
      'common.cancel': 'Ακύρωση',
      'common.save': 'Αποθήκευση',
      'common.edit': 'Επεξεργασία',
      'common.delete': 'Διαγραφή',
      'common.confirm': 'Επιβεβαίωση',
      
      // Navigation
      'nav.home': 'Αρχική',
      'nav.dashboard': 'Πίνακας Ελέγχου',
      'nav.grades': 'Βαθμολογίες',
      'nav.posts': 'Αναρτήσεις',
      'nav.statistics': 'Στατιστικά',
      'nav.profile': 'Προφίλ',
      'nav.logout': 'Αποσύνδεση',
      
      // Authentication
      'auth.login': 'Σύνδεση',
      'auth.register': 'Εγγραφή',
      'auth.email': 'Email',
      'auth.password': 'Κωδικός',
      'auth.confirmPassword': 'Επιβεβαίωση Κωδικού',
      'auth.forgotPassword': 'Ξεχάσατε τον κωδικό;',
      'auth.noAccount': 'Δεν έχετε λογαριασμό;',
      'auth.hasAccount': 'Έχετε ήδη λογαριασμό;',
      'auth.universityEmail': 'Χρησιμοποιήστε το πανεπιστημιακό σας email',
      
      // Dashboard
      'dashboard.welcome': 'Καλώς ήρθες',
      'dashboard.today': 'Σήμερα',
      'dashboard.newPosts': 'νέες αναρτήσεις',
      'dashboard.averageGrade': 'Μέσος όρος',
      'dashboard.quickActions': 'Γρήγορες Ενέργειες',
      'dashboard.addGrade': 'Προσθήκη βαθμολογίας',
      'dashboard.newPost': 'Νέα ανάρτηση',
      'dashboard.viewStats': 'Προβολή στατιστικών',
      'dashboard.recentActivity': 'Πρόσφατη Δραστηριότητα',
      
      // Grades
      'grades.title': 'Βαθμολογίες',
      'grades.add': 'Προσθήκη Βαθμολογίας',
      'grades.export': 'Εξαγωγή',
      'grades.statistics': 'Στατιστικά',
      'grades.subject': 'Μάθημα',
      'grades.grade': 'Βαθμός',
      'grades.semester': 'Εξάμηνο',
      'grades.date': 'Ημ/νία',
      'grades.average': 'Μέσος Όρος',
      
      // Posts
      'posts.title': 'Αναρτήσεις',
      'posts.new': 'Νέα Ανάρτηση',
      'posts.filter': 'Φίλτρα',
      'posts.search': 'Αναζήτηση',
      'posts.content': 'Περιεχόμενο',
      'posts.category': 'Κατηγορία',
      'posts.publish': 'Δημοσίευση',
      'posts.edit': 'Επεξεργασία',
      'posts.delete': 'Διαγραφή',
      'posts.comments': 'σχόλια',
      'posts.likes': 'μου αρέσει',
      
      // Statistics
      'stats.title': 'Στατιστικά',
      'stats.semester': 'Εξάμηνο',
      'stats.subject': 'Μάθημα',
      'stats.period': 'Χρονικό',
      'stats.trend': 'Τάση',
      'stats.best': 'Καλύτερο',
      'stats.worst': 'Χειρότερο',
      'stats.semesterChart': 'Γράφημα Εξαμήνων',
      'stats.bestSubjects': 'Καλύτερα Μαθήματα',
      'stats.worstSubjects': 'Χειρότερα Μαθήματα',
      
      // Profile
      'profile.title': 'Προφίλ',
      'profile.personalInfo': 'Προσωπικές Πληροφορίες',
      'profile.firstName': 'Όνομα',
      'profile.lastName': 'Επώνυμο',
      'profile.university': 'Πανεπιστήμιο',
      'profile.department': 'Τμήμα',
      'profile.semester': 'Εξάμηνο',
      'profile.update': 'Ενημέρωση Προφίλ',
      
      // Dark Mode
      'theme.light': 'Φωτεινό',
      'theme.dark': 'Σκοτεινό',
      'theme.toggle': 'Εναλλαγή θέματος',
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'el',
    fallbackLng: 'el',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n 