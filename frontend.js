/**
 * Mental Health Check-In Plugin - Frontend
 * Provides UI for daily mood tracking and history visualization
 */

(function() {
    'use strict';
    
    const SDK = window.__HERMES_PLUGIN_SDK__;
    
    // Mood emoji mapping
    const MOOD_EMOJIS = {
        1: '😢',
        2: '😔',
        3: '😐',
        4: '🙂',
        5: '😄'
    };
    
    const MOOD_LABELS = {
        1: 'Very Low',
        2: 'Low',
        3: 'Neutral',
        4: 'Good',
        5: 'Great'
    };
    
    // Main render function
    function render(container) {
        container.innerHTML = `
            <div class="mh-plugin">
                <div class="mh-header">
                    <h2>🧠 Mental Health Check-In</h2>
                    <div class="mh-stats" id="mh-stats"></div>
                </div>
                
                <div class="mh-checkin-form">
                    <h3>How are you feeling today?</h3>
                    <div class="mh-mood-selector">
                        ${[1,2,3,4,5].map(m => `
                            <button class="mh-mood-btn" data-mood="${m}">
                                <span class="mh-emoji">${MOOD_EMOJIS[m]}</span>
                                <span class="mh-label">${MOOD_LABELS[m]}</span>
                            </button>
                        `).join('')}
                    </div>
                    <div class="mh-note-input">
                        <textarea id="mh-note" placeholder="Optional: Add a note about your day..."></textarea>
                    </div>
                    <button class="mh-submit-btn" id="mh-submit" disabled>
                        Check In ✨
                    </button>
                </div>
                
                <div class="mh-history">
                    <h3>Recent Check-Ins</h3>
                    <div class="mh-chart" id="mh-chart"></div>
                    <div class="mh-checkins-list" id="mh-list"></div>
                    <button class="mh-export-btn" id="mh-export">Export Data 📥</button>
                </div>
            </div>
        `;
        
        attachEventListeners();
        loadCheckins();
        loadStats();
    }
    
    let selectedMood = null;
    
    function attachEventListeners() {
        // Mood selection
        document.querySelectorAll('.mh-mood-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mh-mood-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedMood = parseInt(btn.dataset.mood);
                document.getElementById('mh-submit').disabled = false;
            });
        });
        
        // Submit check-in
        document.getElementById('mh-submit').addEventListener('click', submitCheckin);
        
        // Export
        document.getElementById('mh-export').addEventListener('click', exportData);
    }
    
    async function submitCheckin() {
        const note = document.getElementById('mh-note').value;
        const btn = document.getElementById('mh-submit');
        
        btn.disabled = true;
        btn.textContent = 'Checking in...';
        
        try {
            const response = await fetch('/api/plugins/mental-health/checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mood: selectedMood,
                    note: note
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Check-in recorded! 🎉', 'success');
                document.getElementById('mh-note').value = '';
                selectedMood = null;
                document.querySelectorAll('.mh-mood-btn').forEach(b => b.classList.remove('selected'));
                document.getElementById('mh-submit').disabled = true;
                loadCheckins();
                loadStats();
            } else {
                showNotification('Error: ' + result.error, 'error');
            }
        } catch (error) {
            showNotification('Failed to submit: ' + error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Check In ✨';
        }
    }
    
    async function loadCheckins() {
        try {
            const response = await fetch('/api/plugins/mental-health/checkins?days=7');
            const data = await response.json();
            renderChart(data.checkins);
            renderList(data.checkins);
        } catch (error) {
            console.error('Failed to load check-ins:', error);
        }
    }
    
    async function loadStats() {
        try {
            const response = await fetch('/api/plugins/mental-health/checkins?days=30');
            const data = await response.json();
            
            const statsEl = document.getElementById('mh-stats');
            statsEl.innerHTML = `
                <div class="mh-stat">
                    <span class="mh-stat-value">${data.stats.count}</span>
                    <span class="mh-stat-label">Check-ins</span>
                </div>
                <div class="mh-stat">
                    <span class="mh-stat-value">${data.stats.average_mood.toFixed(1)}</span>
                    <span class="mh-stat-label">Avg Mood</span>
                </div>
                <div class="mh-stat">
                    <span class="mh-stat-value">${data.stats.streak}</span>
                    <span class="mh-stat-label">Day Streak</span>
                </div>
            `;
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }
    
    function renderChart(checkins) {
        const chartEl = document.getElementById('mh-chart');
        if (!checkins || checkins.length === 0) {
            chartEl.innerHTML = '<p class="mh-empty">No check-ins yet. Start tracking your mood!</p>';
            return;
        }
        
        // Simple bar chart
        const maxMood = 5;
        chartEl.innerHTML = `
            <div class="mh-bars">
                ${checkins.slice(-7).map(c => {
                    const height = (c.mood / maxMood) * 100;
                    const date = new Date(c.timestamp);
                    return `
                        <div class="mh-bar-wrapper">
                            <div class="mh-bar" style="height: ${height}%">
                                <span class="mh-bar-emoji">${MOOD_EMOJIS[c.mood]}</span>
                            </div>
                            <span class="mh-bar-date">${date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    function renderList(checkins) {
        const listEl = document.getElementById('mh-list');
        if (!checkins || checkins.length === 0) {
            return;
        }
        
        listEl.innerHTML = checkins.slice(-10).reverse().map(c => {
            const date = new Date(c.timestamp);
            return `
                <div class="mh-checkin-item">
                    <span class="mh-checkin-emoji">${MOOD_EMOJIS[c.mood]}</span>
                    <div class="mh-checkin-info">
                        <span class="mh-checkin-mood">${MOOD_LABELS[c.mood]}</span>
                        ${c.note ? `<span class="mh-checkin-note">${c.note}</span>` : ''}
                    </div>
                    <span class="mh-checkin-date">${date.toLocaleDateString()}</span>
                </div>
            `;
        }).join('');
    }
    
    async function exportData() {
        try {
            const response = await fetch('/api/plugins/mental-health/export');
            const data = await response.json();
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `mental-health-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            showNotification('Data exported successfully! 📥', 'success');
        } catch (error) {
            showNotification('Export failed: ' + error.message, 'error');
        }
    }
    
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `mh-notification mh-notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Register with Hermes Plugin SDK
    if (SDK && SDK.registerPlugin) {
        SDK.registerPlugin('mental-health-checkin', { render });
    }
    
    // Export for manual initialization if needed
    window.MentalHealthPlugin = { render };
})();
