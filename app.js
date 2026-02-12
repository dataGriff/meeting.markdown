// Meeting Planner Application - Git-backed version
class MeetingPlanner {
    constructor() {
        this.meetings = [];
        this.currentFilename = null;
        this.editMode = false;
        this.apiBase = window.location.origin + '/api';
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setDefaultDate();
        await this.loadMeetings();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('new-meeting-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMeeting();
        });

        // Meeting detail actions
        document.getElementById('close-detail-btn').addEventListener('click', () => {
            this.closeDetail();
        });

        document.getElementById('edit-meeting-btn').addEventListener('click', () => {
            this.editMeeting();
        });

        document.getElementById('delete-meeting-btn').addEventListener('click', () => {
            this.deleteMeeting();
        });

        // Remove download markdown button functionality - no longer needed
        document.getElementById('download-markdown-btn').style.display = 'none';
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('meeting-date').value = today;
    }

    async saveMeeting() {
        const title = document.getElementById('meeting-title').value.trim();
        const date = document.getElementById('meeting-date').value;
        const time = document.getElementById('meeting-time').value;
        const attendees = document.getElementById('meeting-attendees').value.trim();
        const agenda = document.getElementById('meeting-agenda').value.trim();
        const notes = document.getElementById('meeting-notes').value.trim();
        const actionItems = document.getElementById('meeting-action-items').value.trim();

        if (!title || !date) {
            alert('Please fill in required fields (Title and Date)');
            return;
        }

        const meeting = {
            title,
            date,
            time,
            attendees: attendees.split(',').map(a => a.trim()).filter(a => a),
            agenda,
            notes,
            actionItems,
            createdAt: this.editMode && this.currentFilename ? 
                this.meetings.find(m => m.filename === this.currentFilename)?.createdAt : 
                new Date().toISOString()
        };

        try {
            let response;
            if (this.editMode && this.currentFilename) {
                response = await fetch(`${this.apiBase}/meetings/${this.currentFilename}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(meeting)
                });
            } else {
                response = await fetch(`${this.apiBase}/meetings`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(meeting)
                });
            }

            const result = await response.json();
            
            if (response.ok) {
                alert(result.message);
                this.editMode = false;
                this.currentFilename = null;
                this.resetForm();
                await this.loadMeetings();
                
                // Show the newly created/updated meeting
                const meetingToShow = this.meetings.find(m => m.filename === result.filename);
                if (meetingToShow) {
                    await this.showMeetingDetail(meetingToShow.filename);
                }
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            console.error('Error saving meeting:', error);
            alert('Failed to save meeting. Is the server running?');
        }
    }

    resetForm() {
        document.getElementById('new-meeting-form').reset();
        this.setDefaultDate();
        this.editMode = false;
        this.currentFilename = null;
    }

    async loadMeetings() {
        try {
            const response = await fetch(`${this.apiBase}/meetings`);
            if (response.ok) {
                this.meetings = await response.json();
                this.renderMeetings();
            } else {
                console.error('Failed to load meetings');
                this.meetings = [];
                this.renderMeetings();
            }
        } catch (error) {
            console.error('Error loading meetings:', error);
            this.meetings = [];
            this.renderMeetings();
        }
    }

    renderMeetings() {
        const container = document.getElementById('meetings-container');
        
        if (this.meetings.length === 0) {
            container.innerHTML = '<p class="empty-state">No meetings yet. Create your first meeting above!</p>';
            return;
        }

        container.innerHTML = this.meetings.map(meeting => {
            const dateFormatted = new Date(meeting.date).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            // Time is already formatted from the server
            const timeFormatted = meeting.time || '';

            return `
                <div class="meeting-item" data-filename="${meeting.filename}">
                    <h3>${this.escapeHtml(meeting.title)}</h3>
                    <div class="meeting-meta">
                        <span>📅 ${dateFormatted}</span>
                        ${timeFormatted ? `<span>⏰ ${timeFormatted}</span>` : ''}
                        ${meeting.attendees.length > 0 ? `<span>👥 ${meeting.attendees.length} attendee(s)</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Add click listeners to meeting items
        document.querySelectorAll('.meeting-item').forEach(item => {
            item.addEventListener('click', () => {
                this.showMeetingDetail(item.dataset.filename);
            });
        });
    }

    async showMeetingDetail(filename) {
        const meeting = this.meetings.find(m => m.filename === filename);
        if (!meeting) return;

        this.currentFilename = filename;

        const detailSection = document.getElementById('meeting-detail');
        const detailTitle = document.getElementById('detail-title');
        const detailContent = document.getElementById('detail-content');

        detailTitle.textContent = meeting.title;

        try {
            const response = await fetch(`${this.apiBase}/meetings/${filename}`);
            if (!response.ok) {
                throw new Error('Failed to load meeting details');
            }
            
            const data = await response.json();
            const content = data.content;
            
            // Convert markdown to HTML for display
            const htmlContent = content
                .replace(/^# (.+)$/gm, '<h3>$1</h3>')
                .replace(/^## (.+)$/gm, '<h3>$1</h3>')
                .replace(/^\*\*(.+?):\*\* (.+)$/gm, '<p><strong>$1:</strong> $2</p>')
                .replace(/^- (.+)$/gm, '<li>$1</li>')
                .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
                .replace(/\n\n/g, '</p><p>')
                .replace(/^(?!<[uh])/gm, '<p>')
                .replace(/(?<![>])$/gm, '</p>')
                .replace(/<p><\/p>/g, '');

            detailContent.innerHTML = htmlContent;
            detailSection.classList.remove('hidden');

            // Scroll to detail section
            detailSection.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error loading meeting detail:', error);
            alert('Failed to load meeting details');
        }
    }

    closeDetail() {
        document.getElementById('meeting-detail').classList.add('hidden');
        this.currentFilename = null;
        this.editMode = false;
    }

    async editMeeting() {
        const meeting = this.meetings.find(m => m.filename === this.currentFilename);
        if (!meeting) return;

        // Load full meeting content
        try {
            const response = await fetch(`${this.apiBase}/meetings/${this.currentFilename}`);
            if (!response.ok) {
                throw new Error('Failed to load meeting');
            }
            
            const data = await response.json();
            const content = data.content;
            
            // Parse markdown content back to form fields
            const agendaMatch = content.match(/## 📋 Agenda\n\n([\s\S]*?)\n\n##/);
            const notesMatch = content.match(/## 📝 Notes\n\n([\s\S]*?)\n\n##/);
            const actionItemsMatch = content.match(/## ✅ Action Items\n\n([\s\S]*?)\n\n---/);
            
            // Populate form
            document.getElementById('meeting-title').value = meeting.title;
            document.getElementById('meeting-date').value = meeting.date;
            document.getElementById('meeting-time').value = meeting.time || '';
            document.getElementById('meeting-attendees').value = meeting.attendees.join(', ');
            document.getElementById('meeting-agenda').value = agendaMatch ? agendaMatch[1].trim() : '';
            document.getElementById('meeting-notes').value = notesMatch ? notesMatch[1].trim() : '';
            document.getElementById('meeting-action-items').value = actionItemsMatch ? actionItemsMatch[1].trim() : '';

            this.editMode = true;
            this.closeDetail();

            // Scroll to form
            document.getElementById('meeting-form').scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error loading meeting for edit:', error);
            alert('Failed to load meeting for editing');
        }
    }

    async deleteMeeting() {
        if (!confirm('Are you sure you want to delete this meeting? This will be committed to Git.')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/meetings/${this.currentFilename}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            
            if (response.ok) {
                alert(result.message);
                this.closeDetail();
                await this.loadMeetings();
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            console.error('Error deleting meeting:', error);
            alert('Failed to delete meeting. Is the server running?');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new MeetingPlanner();
});
