# 📅 Meeting Planner & Notes

A Git-backed meeting planner and note-taking application. Create, manage, and automatically commit your meeting notes as markdown files directly to your Git repository.

## ✨ Features

- 📝 **Easy Meeting Creation**: Simple form interface to create new meetings
- 📋 **Structured Notes**: Organize meetings with title, date, time, attendees, agenda, notes, and action items
- 🔄 **Automatic Git Commits**: Every create, update, or delete operation is automatically committed to Git
- 📁 **Markdown Storage**: All meetings stored as properly formatted markdown files in `/meetings` directory
- 🔍 **Meeting History**: View and manage all your past meetings
- 🎨 **Modern UI**: Clean, responsive design that works on desktop and mobile
- 🔒 **Version Control**: Full Git history for all meeting changes

## 🚀 Quick Start

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dataGriff/meeting.markdown.git
   cd meeting.markdown
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser to `http://localhost:3000`

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

2. Click "Create Meeting" - the meeting is automatically saved as a markdown file and committed to Git

### Viewing Meetings

- All your meetings appear in the "Your Meetings" section
- Click on any meeting to view full details
- Meeting details are loaded from the markdown files in the repository

### Managing Meetings

When viewing a meeting, you can:
- **Edit**: Modify meeting details (creates a new Git commit)
- **Delete**: Remove the meeting (creates a Git commit removing the file)
- **Close**: Return to the meetings list

### Git Integration

Every operation creates a Git commit:
- Creating a meeting: `Add meeting: [Meeting Title]`
- Updating a meeting: `Update meeting: [Meeting Title]`
- Deleting a meeting: `Delete meeting: [filename]`

All markdown files are stored in the `/meetings` directory and can be viewed, edited, or shared through Git.

## 📁 Repository Structure

```
meeting.markdown/
├── server.js          # Node.js backend with Git integration
├── package.json       # Node.js dependencies
├── index.html         # Main application page
├── styles.css         # Application styling
├── app.js            # Frontend application logic
├── meetings/         # Git-tracked markdown meeting files
│   ├── 2026-02-12_team_standup.md
│   └── 2026-02-14_project_kickoff_meeting.md
└── README.md         # This file
```

## 🌐 Deployment Options

### Local Development

For development with auto-restart:
```bash
npm run dev
```

### Production

#### Self-Hosted Server

1. Install Node.js on your server
2. Clone the repository
3. Install dependencies: `npm install`
4. Start with a process manager:
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start server.js --name meeting-planner
   
   # Using systemd (create a service file)
   # Or use forever, nodemon, etc.
   ```

#### Environment Variables

- `PORT`: Server port (default: 3000)

Example:
```bash
PORT=8080 npm start
```

## 🔧 Technologies Used

- **Backend**: Node.js with Express
- **Git Integration**: simple-git library
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Storage**: Git repository (markdown files)
- **Version Control**: Native Git commits

## ⚙️ Requirements

- Node.js 14 or higher
- Git installed and configured
- Write access to the repository directory

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

Built with ❤️ for Git-backed meeting management.

---

**Note**: This application commits directly to your Git repository. All meetings are version-controlled and stored as markdown files in the `/meetings` directory. Push your changes to share with your team!