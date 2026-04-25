# Mental Health Check-In Plugin for Hermes Dashboard

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Hermes Plugin](https://img.shields.io/badge/Hermes-Plugin-green.svg)

A simple, privacy-focused mental health check-in plugin for Hermes Dashboard. Track your daily mood, keep notes, and visualize your emotional trends over time.

## 🧠 Features

- **Daily Mood Tracking**: Rate your mood on a 1-5 scale with emoji feedback
- **Optional Notes**: Add context to your check-ins with optional notes
- **Streak Tracking**: Stay motivated with a daily check-in streak counter
- **Visual History**: 7-day bar chart visualization of your mood trends
- **Statistics Dashboard**: See your average mood and total check-ins
- **Data Export**: Export all your check-in data as JSON
- **Local Storage**: All data stored locally on your machine (no cloud, no tracking)

## 🚀 Installation

### Prerequisites

- Hermes Agent with dashboard feature enabled
- Python 3.7+ with Flask

### Quick Install

1. Clone this repository:
   ```bash
   git clone https://github.com/[your-username]/hermes-mental-health-checkin.git
   cd hermes-mental-health-checkin
   ```

2. Copy the plugin to your Hermes plugins directory:
   ```bash
   mkdir -p ~/.hermes/plugins/
   cp -r . ~/.hermes/plugins/mental-health-checkin/
   ```

3. Restart your Hermes dashboard:
   ```bash
   hermes dashboard
   ```

4. The "Mental Health" tab should appear automatically!

## 📖 Usage

### Checking In

1. Click on the "Mental Health" tab in your Hermes dashboard
2. Select your current mood (1 = Very Low 😢, 5 = Great 😄)
3. Optionally add a note about your day
4. Click "Check In ✨"

### Viewing History

- Your last 7 check-ins are displayed as a bar chart
- Recent check-ins are listed below with dates and notes
- Statistics show at the top (total check-ins, average mood, streak)

### Exporting Data

Click the "Export Data 📥" button to download all your check-ins as a JSON file.

## 📸 Screenshots

### Check-In Interface
![Check-In Screenshot](screenshots/checkin.png)

### Mood History Chart
![History Screenshot](screenshots/history.png)

*Add your screenshots to the `screenshots/` folder!*

## 🔧 Technical Details

### Plugin Structure

```
mental-health-checkin/
├── manifest.json       # Plugin metadata
├── backend.py          # Flask API routes
├── frontend.js         # UI logic
├── styles.css          # Plugin styling
├── data/              # Local data storage (auto-created)
│   └── checkins.json # Your check-in data
└── README.md
```

### API Endpoints

- `POST /api/plugins/mental-health/checkin` - Create a new check-in
- `GET /api/plugins/mental-health/checkins?days=30` - Get check-ins (with optional day filter)
- `GET /api/plugins/mental-health/export` - Export all data as JSON

### Data Privacy

All data is stored locally in `~/.hermes/plugins/mental-health-checkin/data/checkins.json`. No data is sent to external servers.

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs via Issues
- Suggest features
- Submit pull requests

## 🏆 Hackathon

This plugin was created for the Hermes Dashboard Hackathon - Plugin Track.

**Prize**: $600 in OpenRouter credits for the best plugin!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ to help you track and improve your mental well-being.

**Remember**: This plugin is for self-tracking and reflection only. If you're struggling with mental health, please reach out to a professional. You matter! 💙
