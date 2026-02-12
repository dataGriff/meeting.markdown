# 📅 Meeting Planner & Notes

A lightweight, markdown-backed meeting planner and note-taking application. Create, manage, and export your meeting notes as markdown files that can be committed to your Git repository.

## ✨ Features

- 📝 **Easy Meeting Creation**: Simple form interface to create new meetings
- 📋 **Structured Notes**: Organize meetings with title, date, time, attendees, agenda, notes, and action items
- 💾 **Markdown Export**: Download meeting notes as properly formatted markdown files
- 🔍 **Meeting History**: View and manage all your past meetings
- 💻 **Local Storage**: All data stored in your browser's local storage
- 🎨 **Modern UI**: Clean, responsive design that works on desktop and mobile
- 🚀 **Static Site**: No backend required - runs entirely in the browser
- 🔒 **Privacy First**: All data stays in your browser, no external servers

## 🚀 Quick Start

### Option 1: Use GitHub Pages (Recommended)

1. Fork this repository
2. Go to repository Settings → Pages
3. Under "Source", select the `main` branch
4. Click Save
5. Your site will be available at `https://[your-username].github.io/meeting.markdown/`

### Option 2: Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/dataGriff/meeting.markdown.git
   cd meeting.markdown
   ```

2. Open `index.html` in your web browser:
   ```bash
   # On macOS
   open index.html
   
   # On Linux
   xdg-open index.html
   
   # On Windows
   start index.html
   ```

   Or use a local web server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

3. Navigate to `http://localhost:8000` in your browser

## 📖 How to Use

### Creating a Meeting

1. Fill in the meeting details in the form:
   - **Title** (required): Name of the meeting
   - **Date** (required): When the meeting takes place
   - **Time** (optional): Specific time of the meeting
   - **Attendees** (optional): Comma-separated list of participants
   - **Agenda** (optional): What will be discussed
   - **Notes** (optional): Meeting notes and discussion points
   - **Action Items** (optional): Follow-up tasks and responsibilities

2. Click "Create Meeting" to save

### Viewing Meetings

- All your meetings appear in the "Your Meetings" section
- Click on any meeting to view full details

### Managing Meetings

When viewing a meeting, you can:
- **Edit**: Modify meeting details
- **Download Markdown**: Export as a `.md` file
- **Delete**: Remove the meeting
- **Close**: Return to the meetings list

### Exporting to Git

1. Download your meeting notes as markdown files
2. Save them to the `meetings/` directory in your repository
3. Commit and push to Git:
   ```bash
   git add meetings/
   git commit -m "Add meeting notes for [meeting name]"
   git push
   ```

## 📁 Repository Structure

```
meeting.markdown/
├── index.html          # Main application page
├── styles.css          # Application styling
├── app.js             # Application logic
├── meetings/          # Directory for exported markdown files
│   ├── 2026-02-12_team_standup.md
│   └── 2026-02-14_project_kickoff_meeting.md
└── README.md          # This file
```

## 🌐 Alternative Deployment Options

### Netlify

1. Push your code to GitHub
2. Go to [Netlify](https://www.netlify.com/)
3. Click "New site from Git"
4. Select your repository
5. Click "Deploy site"

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/dataGriff/meeting.markdown)

### Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/)
3. Click "Import Project"
4. Select your repository
5. Click "Deploy"

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/dataGrif/meeting.markdown)

### Cloudflare Pages

1. Push your code to GitHub
2. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
3. Create a new project
4. Connect your GitHub repository
5. Deploy

### GitLab Pages

Add a `.gitlab-ci.yml` file:

```yaml
pages:
  stage: deploy
  script:
    - mkdir .public
    - cp -r * .public
    - mv .public public
  artifacts:
    paths:
      - public
  only:
    - main
```

### Self-Hosted

Simply copy all files to your web server's document root:

```bash
scp -r * user@your-server.com:/var/www/html/meeting-planner/
```

## 🔧 Technologies Used

- **HTML5**: Structure and semantics
- **CSS3**: Styling with modern features (Grid, Flexbox, CSS Variables)
- **Vanilla JavaScript**: No frameworks or dependencies
- **Local Storage API**: Browser-based data persistence
- **Markdown**: Standard format for exported notes

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

Built with ❤️ for simple, effective meeting management using markdown.

---

**Note**: This application stores all data in your browser's local storage. Remember to export important meetings as markdown files to back them up in your Git repository!