# Deployment Guide for Study Notes Web App

This guide explains how to deploy your Study Notes Web App with Turso database integration to various hosting platforms.

## Before You Deploy

1. Make sure you have a Turso database set up:
   ```bash
   # Install Turso CLI if you haven't already
   curl -sSfL https://get.turso.tech/install.sh | bash
   
   # Log in to your Turso account
   turso auth login
   
   # Create a database (if you don't have one yet)
   turso db create study-notes
   
   # Get your database URL
   turso db show study-notes --url
   
   # Create an auth token
   turso db tokens create study-notes
   ```

2. Update your Turso credentials in `src/config/tursoConfig.js`:
   ```javascript
   const tursoConfig = {
     dbUrl: "libsql://your-database-name.turso.io",
     authToken: "your-auth-token-here",
   };
   ```

3. Build your application:
   ```bash
   npm run build
   # or
   yarn build
   ```

## Deployment Options

### 1. Netlify

**Option A: Deploy via Netlify CLI**

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Log in to Netlify:
   ```bash
   netlify login
   ```

3. Initialize and deploy your site:
   ```bash
   netlify init
   netlify deploy --prod
   ```

**Option B: Deploy via Netlify UI**

1. Go to [Netlify](https://app.netlify.com/) and log in
2. Click "New site from Git" or drag and drop your `build` folder onto the Netlify dashboard
3. Follow the prompts to complete deployment

### 2. Vercel

**Option A: Deploy via Vercel CLI**

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```bash
   vercel login
   ```

3. Deploy your site:
   ```bash
   vercel --prod
   ```

**Option B: Deploy via Vercel UI**

1. Go to [Vercel](https://vercel.com/) and log in
2. Click "New Project" and import your Git repository
3. Configure project settings and deploy

### 3. GitHub Pages

1. Install gh-pages package:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add these scripts to your `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```

3. Add homepage field to your `package.json`:
   ```json
   "homepage": "https://yourusername.github.io/study-notes-web"
   ```

4. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

5. For client-side routing to work properly, you'll need to add a custom 404.html file to redirect back to index.html or switch to HashRouter in your app.

### 4. Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Log in to Firebase:
   ```bash
   firebase login
   ```

3. Initialize your Firebase project:
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project or create a new one
   - Specify "build" as your public directory
   - Configure as a single-page app: Yes

4. Deploy to Firebase:
   ```bash
   firebase deploy
   ```

### 5. Render

1. Create an account on [Render](https://render.com/)
2. Create a new Static Site
3. Connect to your GitHub repository or upload your build directory
4. Set the build command to `npm run build` and the publish directory to `build`
5. Click "Create Static Site"

## Troubleshooting

### Cross-Origin Resource Sharing (CORS)

If you encounter CORS issues with Turso:

1. Make sure your Turso database allows connections from your deployed domain
2. You may need to update CORS settings via Turso dashboard or CLI:
   ```bash
   turso db cors add study-notes --allow-host yourdomain.com
   ```

### Client-Side Routing

For applications using React Router with BrowserRouter:

1. Create a `_redirects` file in your `public` folder (for Netlify):
   ```
   /*    /index.html   200
   ```

2. Or create a `vercel.json` file (for Vercel):
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

3. For GitHub Pages or similar static hosts, consider using HashRouter instead of BrowserRouter.

## Security Considerations

When deploying to production, be aware that:

1. Your Turso auth token is included in your client-side code and could potentially be exposed
2. For a production app, consider implementing:
   - User authentication
   - Backend API to proxy database requests
   - Row-level security in your database

## Post-Deployment

After deploying your app:

1. Test all functionality to ensure everything works correctly
2. Verify database connections are established
3. Check that data persists between sessions
4. Test on different devices and browsers