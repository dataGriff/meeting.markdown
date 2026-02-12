// Meeting Planner Application
class MeetingPlanner {
    constructor() {
        this.meetings = this.loadMeetings();
        this.currentMeetingId = null;
        this.editMode = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderMeetings();
        this.setDefaultDate();
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

        document.getElementById('download-markdown-btn').addEventListener('click', () => {
            this.downloadMarkdown();
        });
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('meeting-date').value = today;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    saveMeeting() {
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
            id: this.editMode && this.currentMeetingId ? this.currentMeetingId : this.generateId(),
            title,
            date,
            time,
            attendees: attendees.split(',').map(a => a.trim()).filter(a => a),
            agenda,
            notes,
            actionItems,
            createdAt: this.editMode && this.currentMeetingId ? 
                this.meetings.find(m => m.id === this.currentMeetingId).createdAt : 
                new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (this.editMode && this.currentMeetingId) {
            const index = this.meetings.findIndex(m => m.id === this.currentMeetingId);
            this.meetings[index] = meeting;
            this.editMode = false;
            this.currentMeetingId = null;
        } else {
            this.meetings.unshift(meeting);
        }

        this.storeMeetings();
        this.renderMeetings();
        this.resetForm();
        this.showMeetingDetail(meeting.id);

        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    resetForm() {
        document.getElementById('new-meeting-form').reset();
        this.setDefaultDate();
        this.editMode = false;
        this.currentMeetingId = null;
    }

    loadMeetings() {
        const stored = localStorage.getItem('meetings');
        return stored ? JSON.parse(stored) : [];
    }

    storeMeetings() {
        localStorage.setItem('meetings', JSON.stringify(this.meetings));
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

            const timeFormatted = meeting.time ? 
                new Date(`2000-01-01T${meeting.time}`).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                }) : '';

            return `
                <div class="meeting-item" data-id="${meeting.id}">
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
                this.showMeetingDetail(item.dataset.id);
            });
        });
    }

    showMeetingDetail(meetingId) {
        const meeting = this.meetings.find(m => m.id === meetingId);
        if (!meeting) return;

        this.currentMeetingId = meetingId;

        const detailSection = document.getElementById('meeting-detail');
        const detailTitle = document.getElementById('detail-title');
        const detailContent = document.getElementById('detail-content');

        detailTitle.textContent = meeting.title;

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

        let content = `
            <h3>📅 Date & Time</h3>
            <p><strong>Date:</strong> ${dateFormatted}</p>
            ${meeting.time ? `<p><strong>Time:</strong> ${timeFormatted}</p>` : ''}
        `;

        if (meeting.attendees.length > 0) {
            content += `
                <h3>👥 Attendees</h3>
                <ul>
                    ${meeting.attendees.map(a => `<li>${this.escapeHtml(a)}</li>`).join('')}
                </ul>
            `;
        }

        if (meeting.agenda) {
            content += `
                <h3>📋 Agenda</h3>
                <p>${this.escapeHtml(meeting.agenda).replace(/\n/g, '<br>')}</p>
            `;
        }

        if (meeting.notes) {
            content += `
                <h3>📝 Notes</h3>
                <p>${this.escapeHtml(meeting.notes).replace(/\n/g, '<br>')}</p>
            `;
        }

        if (meeting.actionItems) {
            content += `
                <h3>✅ Action Items</h3>
                <p>${this.escapeHtml(meeting.actionItems).replace(/\n/g, '<br>')}</p>
            `;
        }

        detailContent.innerHTML = content;
        detailSection.classList.remove('hidden');

        // Scroll to detail section
        detailSection.scrollIntoView({ behavior: 'smooth' });
    }

    closeDetail() {
        document.getElementById('meeting-detail').classList.add('hidden');
        this.currentMeetingId = null;
        this.editMode = false;
    }

    editMeeting() {
        const meeting = this.meetings.find(m => m.id === this.currentMeetingId);
        if (!meeting) return;

        // Populate form
        document.getElementById('meeting-title').value = meeting.title;
        document.getElementById('meeting-date').value = meeting.date;
        document.getElementById('meeting-time').value = meeting.time || '';
        document.getElementById('meeting-attendees').value = meeting.attendees.join(', ');
        document.getElementById('meeting-agenda').value = meeting.agenda || '';
        document.getElementById('meeting-notes').value = meeting.notes || '';
        document.getElementById('meeting-action-items').value = meeting.actionItems || '';

        this.editMode = true;
        this.closeDetail();

        // Scroll to form
        document.getElementById('meeting-form').scrollIntoView({ behavior: 'smooth' });
    }

    deleteMeeting() {
        if (!confirm('Are you sure you want to delete this meeting?')) {
            return;
        }

        this.meetings = this.meetings.filter(m => m.id !== this.currentMeetingId);
        this.storeMeetings();
        this.renderMeetings();
        this.closeDetail();
    }

    generateMarkdown(meeting) {
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

        if (meeting.attendees.length > 0) {
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

    downloadMarkdown() {
        const meeting = this.meetings.find(m => m.id === this.currentMeetingId);
        if (!meeting) return;

        const markdown = this.generateMarkdown(meeting);
        const filename = `${meeting.date}_${meeting.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;

        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
