
# Akbar Khan Technical and Vocational Institute (Regd. TTB)

## 🚀 Getting Started

### 1. Database Connectivity (Supabase)
To connect the Admission Portal and LMS to your database:
1. Go to [Supabase](https://supabase.com/) and create a new project.
2. Go to **SQL Editor** and paste the contents of `supabase_schema.sql` (found in this project) to create the tables.
3. Go to **Project Settings > API** and copy the `Project URL` and `anon public` key.

### 2. AI Features (Gemini)
To enable the AI Career Advisor and Multilingual Assistant:
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Generate an API Key.

### 3. Environment Variables
Create a `.env` file in the root directory and add your keys:

```env
API_KEY=your_gemini_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🛠️ Tech Stack
- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS (Fuchsia/Slate Theme)
- **Database**: Supabase
- **AI**: Google Gemini API
- **Deployment**: Netlify / Vercel
