# Study Notes Web App

A modern React application designed for students and learners to organize and manage their study notes efficiently with cloud storage using Turso database.

## Features

- **Subject Organization**: Group your notes by subjects with custom colors
- **Rich Text Editing**: Write notes with Markdown support
- **Real-time Preview**: See your formatted notes as you type
- **Tagging System**: Add tags to your notes for better organization
- **Search Functionality**: Quickly find notes across all subjects
- **Filter & Sort**: Easily filter and sort your notes by various criteria
- **Responsive Design**: Works great on desktop and mobile devices
- **Cloud Storage**: Your notes are securely stored in Turso, a serverless SQLite database

## Getting Started

### Prerequisites

- Node.js (v14 or later recommended)
- npm or yarn
- Turso account and database (see below for setup)

### Setting Up Turso Database

1. Create a Turso account at [turso.tech](https://turso.tech)
2. Install the Turso CLI:
   ```bash
   curl -sSfL https://get.turso.tech/install.sh | bash
   ```
3. Log in to your Turso account:
   ```bash
   turso auth login
   ```
4. Create a new database:
   ```bash
   turso db create study-notes
   ```
5. Get your database URL:
   ```bash
   turso db show study-notes --url
   ```
   Note: The URL should look like `libsql://database-name.turso.io`
6. Create an auth token:
   ```bash
   turso db tokens create study-notes
   ```
7. Update your database credentials in `src/config/tursoConfig.js`:
   ```javascript
   const tursoConfig = {
     dbUrl: "libsql://your-database-name.turso.io", // Make sure to use the libsql:// protocol
     authToken: "your-auth-token-here",
   };
   ```

### Installation

1. Clone this repository
```bash
git clone https://github.com/yourusername/study-notes-web.git
cd study-notes-web
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Configure your Turso credentials in `src/config/tursoConfig.js` (as described above)

4. Start the development server
```bash
npm start
# or
yarn start
```

5. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser

## Deployment

This application can be deployed to various hosting services that support static site hosting:

1. First, update the Turso credentials in `src/config/tursoConfig.js`
2. Build the application:
   ```bash
   npm run build
   # or
   yarn build
   ```
3. Deploy the contents of the `build` folder to your chosen hosting provider:
   - Netlify
   - Vercel
   - GitHub Pages
   - Firebase Hosting
   - Render
   - Any other static hosting service

## Technologies Used

- React.js
- React Router for navigation
- Styled Components for styling
- Framer Motion for animations
- React Icons for icons
- Marked for Markdown parsing
- DOMPurify for sanitizing HTML
- Turso for database storage
- LibSQL client for database connection

## Database Schema

The app uses the following database schema:

- **subjects**: Stores subject information
  - id (primary key)
  - name
  - color
  - icon

- **notes**: Stores note content
  - id (primary key)
  - subject_id (foreign key)
  - title
  - content
  - created_at
  - updated_at

- **note_tags**: Stores the relationship between notes and tags
  - note_id (primary key, foreign key)
  - tag_name (primary key)

## Usage Tips

- Create subjects to organize your notes by topic
- Use Markdown to format your notes:
  - `# Heading 1`, `## Heading 2`, etc. for headings
  - `*italic*` for *italic* text
  - `**bold**` for **bold** text
  - `- item` for bullet lists
  - `1. item` for numbered lists
  - `[link text](url)` for links
  - ``` ```code``` ``` for code blocks
- Add tags to notes to create cross-subject connections
- Use the search function to find notes across all subjects
- Filter notes by tags to focus on specific topics

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Created with ❤️ for students and learners
