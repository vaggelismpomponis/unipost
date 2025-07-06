# Λήψη Βαθμολογιών - UniPost

## Επισκόπηση

Το UniPost προσφέρει δύο τρόπους για τη λήψη βαθμολογιών από το σύστημα SIS του Πανεπιστημίου Θεσσαλίας:

1. **Server-side Proxy** (Προτεινόμενη λύση)
2. **Browser Extension** (Εναλλακτική λύση)

## 1. Server-side Proxy (Προτεινόμενη λύση)

### Πώς λειτουργεί

Ο server-side proxy λειτουργεί ως ενδιάμεσος μεταξύ του frontend και του SIS:

```
Frontend → Backend Server → UTH SIS → Backend Server → Frontend
```

### Πλεονεκτήματα

- ✅ **Δεν χρειάζεται browser extension**
- ✅ **Αποφεύγει CORS περιορισμούς**
- ✅ **Ασφαλές** - οι κωδικοί δεν αποθηκεύονται
- ✅ **Απλό για τον χρήστη**
- ✅ **Όμοιο με το UniStudents**

### Αρχιτεκτονική

```
backend/
├── server.js          # Express server με proxy endpoints
├── package.json       # Dependencies (express, axios, cheerio)
└── ...

frontend/
└── src/pages/
    └── GradesFetchPage.tsx  # Ενημερωμένο UI
```

### API Endpoints

#### POST `/api/sis/login`
```json
{
  "username": "student_id",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "abc123",
  "message": "Επιτυχής σύνδεση"
}
```

#### POST `/api/sis/grades`
```json
{
  "sessionId": "abc123"
}
```

**Response:**
```json
{
  "success": true,
  "grades": [
    {
      "code": "CS101",
      "course": "Εισαγωγή στην Πληροφορική",
      "grade": 8.5,
      "period": "1ο Εξάμηνο",
      "year": "2023-2024",
      "extractedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "count": 1,
  "extractedAt": "2024-01-15T10:30:00.000Z"
}
```

### Εκκίνηση

1. **Εγκατάσταση dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Εκκίνηση server:**
   ```bash
   npm run server:dev
   ```

3. **Εκκίνηση frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

## 2. Browser Extension (Εναλλακτική λύση)

### Πώς λειτουργεί

Το browser extension τρέχει απευθείας στον browser του χρήστη:

```
Browser Extension → UTH SIS → Local Storage → JSON Export
```

### Πλεονεκτήματα

- ✅ **Δεν χρειάζεται server**
- ✅ **Λειτουργεί offline**
- ✅ **Πλήρης έλεγχος από τον χρήστη**

### Μειονεκτήματα

- ❌ **Περίπλοκη εγκατάσταση**
- ❌ **Εξαρτάται από browser**
- ❌ **Δεν είναι ενσωματωμένο στο UI**

### Αρχιτεκτονική

```
uth-sis-extension/
├── manifest.json      # Extension configuration
├── popup.html         # Extension UI
├── popup.js          # Extension logic
├── content.js        # Page scraping
├── background.js     # Background tasks
└── ...
```

## Σύγκριση Λύσεων

| Χαρακτηριστικό | Server Proxy | Browser Extension |
|----------------|--------------|-------------------|
| **Εγκατάσταση** | Απλή | Περίπλοκη |
| **CORS** | Λυμένο | Προβληματικό |
| **Ασφάλεια** | Υψηλή | Μέτρια |
| **UX** | Καλή | Περίπλοκη |
| **Maintenance** | Εύκολο | Δύσκολο |
| **Offline** | Όχι | Ναι |

## Προτεινόμενη Προσέγγιση

**Χρησιμοποιήστε το Server-side Proxy** για:

1. **Καλύτερη εμπειρία χρήστη**
2. **Απλότερη εγκατάσταση**
3. **Όμοια λειτουργία με το UniStudents**
4. **Καλύτερη ασφάλεια**

Το browser extension μπορεί να παραμείνει ως εναλλακτική λύση για χρήστες που προτιμούν τον πλήρη έλεγχο.

## Ανάπτυξη

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

1. **Server testing:**
   ```bash
   curl -X POST http://localhost:3001/api/sis/login \
     -H "Content-Type: application/json" \
     -d '{"username":"test","password":"test"}'
   ```

2. **Frontend testing:**
   - Ανοίξτε `http://localhost:5173/grades-fetch`
   - Δοκιμάστε login με test credentials
   - Ελέγξτε grade extraction

## Ασφάλεια

### Server-side Proxy

- ✅ **Δεν αποθηκεύονται κωδικοί**
- ✅ **Sessions λήγουν μετά από 1 ώρα**
- ✅ **HTTPS encryption**
- ✅ **Input validation**

### Browser Extension

- ⚠️ **Κωδικοί αποθηκεύονται τοπικά**
- ⚠️ **Χρειάζεται χειροκίνητη εγκατάσταση**
- ✅ **Δεν στέλνονται δεδομένα σε server**

## Deployment

### Server-side Proxy

1. **Deploy σε VPS/Cloud:**
   ```bash
   # Production dependencies
   npm install --production
   
   # Environment variables
   export NODE_ENV=production
   export PORT=3001
   
   # Start server
   npm run server
   ```

2. **Reverse proxy με Nginx:**
   ```nginx
   location /api/ {
       proxy_pass http://localhost:3001;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
   }
   ```

3. **SSL certificate:**
   ```bash
   certbot --nginx -d yourdomain.com
   ```

### Browser Extension

1. **Build extension:**
   ```bash
   cd uth-sis-extension
   zip -r extension.zip .
   ```

2. **Upload σε Chrome Web Store** (optional)

## Troubleshooting

### Server-side Proxy Issues

**Σφάλμα: "Δεν μπόρεσε να βρεθεί το execution parameter"**
- Το CAS login page άλλαξε
- Ενημερώστε το `extractExecutionParameter()` function

**Σφάλμα: "Λάθος username ή password"**
- Ελέγξτε τα credentials
- Το SIS μπορεί να έχει άλλαξει το login form

**Σφάλμα: "Δεν βρέθηκαν βαθμοί"**
- Η σελίδα βαθμών άλλαξε
- Ενημερώστε το `extractGradesFromHTML()` function

### Browser Extension Issues

**Extension δεν φορτώνει:**
- Ελέγξτε το manifest.json
- Reload το extension στο chrome://extensions/

**Content script error:**
- Ελέγξτε τα permissions στο manifest.json
- Ελέγξτε τα matches patterns

**Grades δεν εξάγονται:**
- Ελέγξτε αν είστε στη σωστή σελίδα
- Ελέγξτε το content.js parsing logic 