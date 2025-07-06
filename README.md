# UniPost - Student Management Platform

Ένα πλήρες σύστημα διαχείρισης φοιτητών παρόμοιο με το UniStudents, με focus στην ελληνική γλώσσα και dark mode.

## 🚀 Χαρακτηριστικά

- **🔐 Αυθεντικοποίηση** με Supabase Auth
- **👤 Προφίλ φοιτητή** με setup wizard
- **📊 Διαχείριση βαθμολογιών** με αυτόματη λήψη από SIS
- **🌙 Dark mode** support
- **🇬🇷 Ελληνικό interface**
- **📱 Responsive design**

## 🏗️ Τεχνολογίες

### Frontend
- **React 18** με TypeScript
- **Material-UI** για UI components
- **React Router** για navigation
- **Zustand** για state management
- **Vite** για development

### Backend
- **Supabase** για database και auth
- **Express.js** για server-side proxy
- **Axios** για HTTP requests
- **Cheerio** για HTML parsing

## 📁 Δομή Project

```
UniPost/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── store/          # State management
│   │   └── utils/          # Utility functions
│   └── package.json
├── backend/                 # Express server
│   ├── server.js           # Server-side proxy
│   ├── package.json        # Server dependencies
│   └── supabase/           # Database migrations
├── uth-sis-extension/      # Browser extension (εναλλακτική)
└── docs/                   # Documentation
```

## 🚀 Εκκίνηση

### 1. Εγκατάσταση Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
npm install
```

### 2. Εκκίνηση Supabase

```bash
cd backend
npm run dev
```

### 3. Εκκίνηση Backend Server

```bash
cd backend
npm run server:dev
```

### 4. Εκκίνηση Frontend

```bash
cd frontend
npm run dev
```

### 5. Άνοιγμα Browser

Ανοίξτε το `http://localhost:5173`

## 📊 Λήψη Βαθμολογιών

Το UniPost προσφέρει δύο τρόπους για τη λήψη βαθμολογιών:

### 🎯 Server-side Proxy (Προτεινόμενη λύση)

**Πλεονεκτήματα:**
- ✅ Δεν χρειάζεται browser extension
- ✅ Αποφεύγει CORS περιορισμούς
- ✅ Ασφαλές - οι κωδικοί δεν αποθηκεύονται
- ✅ Απλό για τον χρήστη
- ✅ Όμοιο με το UniStudents

**Χρήση:**
1. Πλοηγηθείτε στη σελίδα "Λήψη Βαθμολογιών"
2. Εισάγετε τα credentials του SIS
3. Κάντε κλικ στο "Σύνδεση"
4. Μετά την επιτυχημένη σύνδεση, κάντε κλικ στο "Λήψη Βαθμών"

### 🔌 Browser Extension (Εναλλακτική λύση)

**Πλεονεκτήματα:**
- ✅ Δεν χρειάζεται server
- ✅ Λειτουργεί offline
- ✅ Πλήρης έλεγχος από τον χρήστη

**Χρήση:**
1. Εγκαταστήστε το extension από το φάκελο `uth-sis-extension`
2. Ανοίξτε τη σελίδα του SIS και συνδεθείτε
3. Πλοηγηθείτε στη σελίδα των βαθμών
4. Κάντε κλικ στο extension και εξάγετε τους βαθμούς
5. Κατεβάστε το JSON αρχείο και ανεβάστε το στο frontend

## 🔧 Ανάπτυξη

### Προσθήκη νέου πανεπιστημίου

1. **Ενημέρωση server.js:**
   ```javascript
   const UNIVERSITY_CONFIG = {
     'uth': {
       baseUrl: 'https://sis-web.uth.gr',
       loginUrl: 'https://cas.uth.gr/login?service=...',
       gradesUrl: '/pls/studweb/studweb.grades',
       parser: extractUTHGrades
     }
   }
   ```

2. **Προσθήκη parser function:**
   ```javascript
   function extractUTHGrades(html) {
     // Custom parsing logic for UTH
   }
   ```

3. **Ενημέρωση frontend:**
   ```typescript
   const universities = [
     { id: 'uth', name: 'Πανεπιστήμιο Θεσσαλίας' },
     { id: 'uoa', name: 'ΕΚΠΑ' }
   ]
   ```

### Testing

```bash
# Server testing
curl -X POST http://localhost:3001/api/sis/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'

# Frontend testing
# Ανοίξτε http://localhost:5173/grades-fetch
```

## 🛡️ Ασφάλεια

### Server-side Proxy
- ✅ Δεν αποθηκεύονται κωδικοί
- ✅ Sessions λήγουν μετά από 1 ώρα
- ✅ HTTPS encryption
- ✅ Input validation

### Browser Extension
- ⚠️ Κωδικοί αποθηκεύονται τοπικά
- ⚠️ Χρειάζεται χειροκίνητη εγκατάσταση
- ✅ Δεν στέλνονται δεδομένα σε server

## 📚 Documentation

- [Λήψη Βαθμολογιών](./docs/GRADES_FETCHING.md) - Πλήρης οδηγός για τη λήψη βαθμολογιών
- [Supabase Setup](./docs/SUPABASE_SETUP.md) - Οδηγίες για το Supabase
- [Deployment](./docs/DEPLOYMENT.md) - Οδηγίες για deployment

## 🤝 Contributing

1. Fork το repository
2. Δημιουργήστε ένα feature branch (`git checkout -b feature/amazing-feature`)
3. Κάντε commit τις αλλαγές (`git commit -m 'Add amazing feature'`)
4. Push στο branch (`git push origin feature/amazing-feature`)
5. Ανοίξτε ένα Pull Request

## 📄 License

Αυτό το project είναι υπό την MIT License - δείτε το [LICENSE](LICENSE) αρχείο για λεπτομέρειες.

## 🙏 Acknowledgments

- **UniStudents** για την έμπνευση
- **Supabase** για το backend infrastructure
- **Material-UI** για τα UI components
