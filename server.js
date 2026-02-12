const express = require('express');
const simpleGit = require('simple-git');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const git = simpleGit();
const PORT = process.env.PORT || 3000;
const MEETINGS_DIR = path.join(__dirname, 'meetings');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Ensure meetings directory exists
async function ensureMeetingsDir() {
    try {
        await fs.access(MEETINGS_DIR);
    } catch {
        await fs.mkdir(MEETINGS_DIR, { recursive: true });
    }
}

// Generate markdown content for a meeting
function generateMarkdown(meeting) {
    const dateFormatted = new Date(meeting.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const timeFormatted = meeting.time ? 
        new Date(`2000-01-01T${meeting.time}`).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        }) : '';

    let markdown = `# ${meeting.title}\n\n`;
    
    markdown += `## 📅 Date & Time\n\n`;
    markdown += `**Date:** ${dateFormatted}\n`;
    if (meeting.time) {
        markdown += `**Time:** ${timeFormatted}\n`;
    }
    markdown += `\n`;

    if (meeting.attendees && meeting.attendees.length > 0) {
        markdown += `## 👥 Attendees\n\n`;
        meeting.attendees.forEach(attendee => {
            markdown += `- ${attendee}\n`;
        });
        markdown += `\n`;
    }

    if (meeting.agenda) {
        markdown += `## 📋 Agenda\n\n`;
        markdown += `${meeting.agenda}\n\n`;
    }

    if (meeting.notes) {
        markdown += `## 📝 Notes\n\n`;
        markdown += `${meeting.notes}\n\n`;
    }

    if (meeting.actionItems) {
        markdown += `## ✅ Action Items\n\n`;
        markdown += `${meeting.actionItems}\n\n`;
    }

    markdown += `---\n\n`;
    markdown += `*Created: ${new Date(meeting.createdAt).toLocaleString()}*\n`;
    markdown += `*Last Updated: ${new Date(meeting.updatedAt).toLocaleString()}*\n`;

    return markdown;
}

// Generate filename from meeting
function generateFilename(meeting) {
    const filename = `${meeting.date}_${meeting.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    return path.join(MEETINGS_DIR, filename);
}

// API: Get all meetings
app.get('/api/meetings', async (req, res) => {
    try {
        await ensureMeetingsDir();
        const files = await fs.readdir(MEETINGS_DIR);
        const mdFiles = files.filter(f => f.endsWith('.md'));
        
        const meetings = await Promise.all(mdFiles.map(async (file) => {
            const content = await fs.readFile(path.join(MEETINGS_DIR, file), 'utf-8');
            const lines = content.split('\n');
            const title = lines[0].replace(/^#\s*/, '');
            
            // Extract date from filename
            const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})/);
            const date = dateMatch ? dateMatch[1] : '';
            
            // Parse content for metadata
            let time = '';
            let attendees = [];
            
            const timeMatch = content.match(/\*\*Time:\*\*\s*(.+)/);
            if (timeMatch) time = timeMatch[1];
            
            const attendeesSection = content.match(/## 👥 Attendees\n\n((?:- .+\n)+)/);
            if (attendeesSection) {
                attendees = attendeesSection[1].split('\n')
                    .filter(line => line.startsWith('- '))
                    .map(line => line.substring(2));
            }
            
            return {
                filename: file,
                title,
                date,
                time,
                attendees
            };
        }));
        
        // Sort by date descending
        meetings.sort((a, b) => b.date.localeCompare(a.date));
        
        res.json(meetings);
    } catch (error) {
        console.error('Error reading meetings:', error);
        res.status(500).json({ error: 'Failed to read meetings' });
    }
});

// API: Get single meeting
app.get('/api/meetings/:filename', async (req, res) => {
    try {
        const filepath = path.join(MEETINGS_DIR, req.params.filename);
        const content = await fs.readFile(filepath, 'utf-8');
        res.json({ filename: req.params.filename, content });
    } catch (error) {
        console.error('Error reading meeting:', error);
        res.status(404).json({ error: 'Meeting not found' });
    }
});

// API: Create meeting
app.post('/api/meetings', async (req, res) => {
    try {
        await ensureMeetingsDir();
        const meeting = {
            ...req.body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const markdown = generateMarkdown(meeting);
        const filename = generateFilename(meeting);
        const filenameOnly = path.basename(filename);
        
        await fs.writeFile(filename, markdown, 'utf-8');
        
        // Git commit
        await git.add(filename);
        await git.commit(`Add meeting: ${meeting.title}`);
        
        res.json({ 
            success: true, 
            filename: filenameOnly,
            message: 'Meeting created and committed to Git'
        });
    } catch (error) {
        console.error('Error creating meeting:', error);
        res.status(500).json({ error: 'Failed to create meeting' });
    }
});

// API: Update meeting
app.put('/api/meetings/:filename', async (req, res) => {
    try {
        const meeting = {
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        
        const markdown = generateMarkdown(meeting);
        const oldFilepath = path.join(MEETINGS_DIR, req.params.filename);
        const newFilename = generateFilename(meeting);
        const newFilenameOnly = path.basename(newFilename);
        
        // Remove old file if filename changed
        if (oldFilepath !== newFilename) {
            await fs.unlink(oldFilepath);
            await git.rm(oldFilepath);
        }
        
        await fs.writeFile(newFilename, markdown, 'utf-8');
        
        // Git commit
        await git.add(newFilename);
        await git.commit(`Update meeting: ${meeting.title}`);
        
        res.json({ 
            success: true, 
            filename: newFilenameOnly,
            message: 'Meeting updated and committed to Git'
        });
    } catch (error) {
        console.error('Error updating meeting:', error);
        res.status(500).json({ error: 'Failed to update meeting' });
    }
});

// API: Delete meeting
app.delete('/api/meetings/:filename', async (req, res) => {
    try {
        const filepath = path.join(MEETINGS_DIR, req.params.filename);
        
        await fs.unlink(filepath);
        
        // Git commit
        await git.rm(filepath);
        await git.commit(`Delete meeting: ${req.params.filename}`);
        
        res.json({ 
            success: true,
            message: 'Meeting deleted and committed to Git'
        });
    } catch (error) {
        console.error('Error deleting meeting:', error);
        res.status(500).json({ error: 'Failed to delete meeting' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Meeting Planner server running on http://localhost:${PORT}`);
    console.log(`Meetings directory: ${MEETINGS_DIR}`);
    ensureMeetingsDir();
});
