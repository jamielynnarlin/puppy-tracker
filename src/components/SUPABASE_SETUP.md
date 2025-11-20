# Supabase Setup Instructions

## Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click "Start your project" (it's free!)
3. Sign up with GitHub or email
4. Create a new organization (you can name it anything)

## Step 2: Create a New Project

1. Click "New Project"
2. Fill in the details:
   - **Name**: puppy-tracker (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free
3. Click "Create new project"
4. Wait 2-3 minutes for your project to be ready

## Step 3: Set Up the Database

1. In your Supabase dashboard, click "SQL Editor" in the left sidebar
2. Click "New Query"
3. Copy ALL the contents from `src/components/database/schema.sql`
4. Paste into the SQL Editor
5. Click "Run" or press Ctrl+Enter
6. You should see "Success. No rows returned" - this is good!

## Step 4: Get Your API Keys

1. Click "Settings" (gear icon) in the left sidebar
2. Click "API" under Project Settings
3. You'll see two important values:
   - **Project URL**: Something like `https://xxxxx.supabase.co`
   - **anon public key**: A long string starting with `eyJ...`
4. Keep this page open, you'll need these values next

## Step 5: Configure Your App

1. In your project root (`C:\projects\jamie\StartProject\src\components`), create a new file called `.env`
2. Add these lines (replace with YOUR actual values):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Save the file

## Step 6: Add .env to .gitignore

Make sure your `.env` file is NOT committed to GitHub:

1. Open `.gitignore` in your project root
2. Add this line if it's not already there:
```
.env
.env.local
```

## Step 7: Restart Your Dev Server

1. Stop your dev server (Ctrl+C in terminal)
2. Restart it: `npm run dev`
3. Your app will now connect to Supabase!

## Migration

The app will automatically migrate your existing localStorage data to Supabase on first load. Your existing data will be preserved!

## Verify Setup

1. Open your app in browser
2. Check browser console (F12)
3. You should see migration success messages
4. Try logging a meal or potty break
5. Open your phone browser to the same URL
6. You should see the same data! 🎉

## Troubleshooting

**Error: "Invalid API key"**
- Double-check your VITE_SUPABASE_ANON_KEY in .env
- Make sure there are no extra spaces
- Restart dev server after changing .env

**Error: "Failed to fetch"**
- Check your VITE_SUPABASE_URL is correct
- Make sure you ran the SQL schema
- Check your internet connection

**Data not syncing**
- Open browser console and look for errors
- Make sure both devices are using the same Supabase project
- Try refreshing the page

## Need Help?

- Supabase Docs: https://supabase.com/docs
- Check browser console for error messages
- Verify SQL schema ran successfully in Supabase
