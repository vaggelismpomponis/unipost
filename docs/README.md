# UniPost Documentation 📚

## Επισκόπηση

Το UniPost είναι μια πλατφόρμα για φοιτητές που επιτρέπει τη διαχείριση βαθμολογιών, αναρτήσεων και στατιστικών.

## Αρχιτεκτονική

### Frontend
- **React 18** με TypeScript
- **Material-UI (MUI)** για UI components
- **React Router** για routing
- **i18next** για internationalization (ελληνικά)
- **Zustand** για state management
- **Vite** για build tool

### Backend
- **Supabase** για database και authentication
- **PostgreSQL** για database
- **Edge Functions** για custom logic
- **Row Level Security (RLS)** για ασφάλεια

## Database Schema

### Πίνακες

#### `profiles`
- Επεκτείνει τον `auth.users` πίνακα
- Περιέχει προσωπικές πληροφορίες φοιτητή

#### `grades`
- Βαθμολογίες φοιτητών
- Σύνδεση με `profiles` μέσω `user_id`

#### `posts`
- Αναρτήσεις φοιτητών
- Κατηγορίες: general, academic, social, technical

#### `comments`
- Σχόλια σε αναρτήσεις
- Σύνδεση με `posts` και `profiles`

#### `likes`
- Likes σε αναρτήσεις
- Unique constraint για post_id + user_id

## Authentication

### Email Verification
- Εγγραφή με πανεπιστημιακό email
- Verification code αποστολή
- Support για πανεπιστήμια με API

### RLS Policies
- Χρήστες μπορούν να δουν μόνο τα δικά τους δεδομένα
- Δημόσιες αναρτήσεις ορατές σε όλους
- Ασφαλής διαχείριση δεδομένων

## Deployment

### Frontend (Vercel)
```bash
npm run build
vercel --prod
```

### Backend (Supabase)
```bash
supabase db push
supabase functions deploy
```

## Development

### Local Setup
```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
supabase start
```

### Environment Variables
```bash
# Frontend (.env.local)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## API Endpoints

### Authentication
- `POST /auth/signup` - Εγγραφή
- `POST /auth/signin` - Σύνδεση
- `POST /auth/signout` - Αποσύνδεση

### Grades
- `GET /grades` - Λήψη βαθμολογιών
- `POST /grades` - Προσθήκη βαθμολογίας
- `PUT /grades/:id` - Ενημέρωση βαθμολογίας
- `DELETE /grades/:id` - Διαγραφή βαθμολογίας

### Posts
- `GET /posts` - Λήψη αναρτήσεων
- `POST /posts` - Δημιουργία ανάρτησης
- `PUT /posts/:id` - Ενημέρωση ανάρτησης
- `DELETE /posts/:id` - Διαγραφή ανάρτησης

### Statistics
- `GET /statistics/average` - Μέσος όρος
- `GET /statistics/semester/:semester` - Στατιστικά εξαμήνου
- `GET /statistics/subject/:subject` - Στατιστικά μαθήματος

## Contributing

1. Fork το repository
2. Δημιουργήστε ένα feature branch
3. Κάντε commit τις αλλαγές
4. Push στο branch
5. Δημιουργήστε Pull Request

## License

MIT License 