# GitHub Upload Guide - Weather App

## Project Location
Your complete weather app is ready at:
```
/mnt/okcomputer/output/weather-app/
```

---

## Quick Upload Steps

### Step 1: Create a GitHub Repository

1. Go to https://github.com/new
2. Enter repository name: `weather-app` (or any name you prefer)
3. Choose **Public** visibility (required for PM Accelerator to access)
4. Do NOT initialize with README (we already have one)
5. Click **Create repository**

### Step 2: Initialize Git and Upload

Open a terminal and run these commands:

```bash
# Navigate to your project folder
cd /mnt/okcomputer/output/weather-app

# Initialize git
git init

# Add all files
git add .

# Commit with a descriptive message
git commit -m "Initial commit - Weather App for PM Accelerator Technical Assessment"

# Add your GitHub repository as remote
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/weather-app.git

# Push to GitHub
git push -u origin main
```

### Step 3: Verify Upload

1. Go to your GitHub repository URL
2. You should see all your files listed
3. The README should display on the main page

---

## Alternative: Using GitHub Desktop

1. Download GitHub Desktop: https://desktop.github.com/
2. Open GitHub Desktop
3. Click "Add Existing Repository"
4. Select `/mnt/okcomputer/output/weather-app` folder
5. Publish the repository to GitHub

---

## Alternative: Direct File Upload

If you prefer not to use Git:

1. Go to your GitHub repository
2. Click "Add file" → "Upload files"
3. Drag and drop all files from `/mnt/okcomputer/output/weather-app`
4. Commit the changes

---

## Files Included in the Project

```
weather-app/
├── server/
│   └── index.js              # Express backend server
├── src/
│   ├── components/           # (for future components)
│   ├── services/
│   │   └── api.ts            # API service functions
│   ├── types/
│   │   └── weather.ts        # TypeScript types
│   ├── App.tsx               # Main React component
│   ├── main.tsx              # React entry point
│   ├── index.css             # Global styles
│   └── vite-env.d.ts         # Vite types
├── index.html                # HTML template
├── package.json              # Dependencies & scripts
├── tsconfig.json             # TypeScript config
├── tsconfig.node.json        # TypeScript node config
├── vite.config.ts            # Vite configuration
├── tailwind.config.js        # Tailwind CSS config
├── postcss.config.js         # PostCSS config
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
└── README.md                 # Project documentation
```

---

## Important Notes for PM Accelerator

### Repository Must Be Public
The PM Accelerator tech team needs to access your code. Make sure:
- ✅ Repository is set to **Public**
- ✅ Or add `PMA-Community` as a collaborator if private

### Include All Required Files
Make sure these files are in your repo:
- ✅ `package.json` - Shows dependencies
- ✅ `README.md` - Documentation
- ✅ `.env.example` - Environment template
- ✅ Source code files

### What NOT to Include
- ❌ `node_modules/` folder (listed in .gitignore)
- ❌ `server/database.json` (auto-generated)
- ❌ `.env` file with your actual API key

---

## Testing Your App Locally

Before submitting, test that everything works:

```bash
# Navigate to project
cd /mnt/okcomputer/output/weather-app

# Install dependencies
npm install

# Start the app (runs both frontend and backend)
npm run dev
```

Then open http://localhost:5173 in your browser.

---

## Demo Video Requirements

Don't forget to record a demo video showing:
1. Your code structure
2. The app running locally
3. Key features working (search, forecast, save records, export)

Upload to YouTube, Google Drive, or Vimeo and include the link in your submission.

---

## Submission Checklist

- [ ] Code uploaded to GitHub (Public repository)
- [ ] README is complete and accurate
- [ ] Demo video recorded and uploaded
- [ ] Google form submission completed
- [ ] Repository link shared
- [ ] Demo video link shared

---

## Need Help?

If you encounter any issues:
1. Check the README.md in your project folder
2. Verify Node.js version (18+)
3. Make sure all dependencies installed correctly
4. Check that ports 3001 and 5173 are available

Good luck with your submission! 🚀
