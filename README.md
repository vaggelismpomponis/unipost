# UniPost 📚

Μια πλατφόρμα για φοιτητές που επιτρέπει τη διαχείριση βαθμολογιών, αναρτήσεων και στατιστικών.

## 🚀 Χαρακτηριστικά

- **Διαχείριση Βαθμολογιών**: Καταχώρηση και προβολή βαθμολογιών με στατιστικά
- **Αναρτήσεις**: Δημιουργία και διαχείριση αναρτήσεων με σχόλια
- **Στατιστικά**: Γραφήματα και αναλύσεις βαθμολογιών
- **Dark Mode**: Υποστήριξη σκοτεινό θέματος
- **Authentication**: Εγγραφή με πανεπιστημιακό email
- **Responsive Design**: Προσαρμογή σε όλες τις συσκευές

## 🛠️ Τεχνολογίες

### Frontend
- React 18 + TypeScript
- Material-UI (MUI)
- React Router
- i18next (ελληνικά)
- Zustand (state management)

### Backend
- Supabase (database + auth)
- Edge Functions
- PostgreSQL

### Deployment
- Vercel (frontend)
- Supabase (backend)

## 📁 Project Structure

```
unipost/
├── frontend/          # React frontend
├── backend/           # Supabase functions
├── docs/             # Documentation
└── README.md
```

## 🚀 Εγκατάσταση

### Προαπαιτούμενα
- Node.js 18+
- npm/yarn
- Git

### Setup
```bash
# Clone repository
git clone [repository-url]
cd unipost

# Install dependencies
cd frontend
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

## 📝 License

MIT License

## uth-sis-extension

Περιέχει τον κώδικα για το browser extension (Chrome/Edge) που κάνει scraping βαθμών από το φοιτητολόγιο του ΠΘ (UTH SIS). Χρήση: εγκατάσταση ως unpacked extension στον browser.
