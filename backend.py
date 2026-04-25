"""
Mental Health Check-In Plugin Backend
Provides API endpoints for storing and retrieving mood check-ins.
"""

from flask import Flask, request, jsonify
from datetime import datetime, timedelta
import json
import os

# Plugin data directory
DATA_DIR = os.path.expanduser("~/.hermes/plugins/mental-health-checkin/data")
os.makedirs(DATA_DIR, exist_ok=True)

CHECKINS_FILE = os.path.join(DATA_DIR, "checkins.json")


def load_checkins():
    """Load all check-ins from disk."""
    if not os.path.exists(CHECKINS_FILE):
        return []
    try:
        with open(CHECKINS_FILE, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return []


def save_checkins(checkins):
    """Save check-ins to disk."""
    with open(CHECKINS_FILE, 'w') as f:
        json.dump(checkins, f, indent=2)


def register_routes(app):
    """Register plugin routes with the Flask app."""
    
    @app.route('/api/plugins/mental-health/checkin', methods=['POST'])
    def create_checkin():
        """Create a new mood check-in."""
        try:
            data = request.get_json()
            mood = data.get('mood')
            note = data.get('note', '')
            
            if mood is None or not isinstance(mood, int) or mood < 1 or mood > 5:
                return jsonify({"error": "Invalid mood value. Must be 1-5."}), 400
            
            checkin = {
                "id": datetime.now().isoformat(),
                "timestamp": datetime.now().isoformat(),
                "mood": mood,
                "note": note
            }
            
            checkins = load_checkins()
            checkins.append(checkin)
            save_checkins(checkins)
            
            return jsonify({"success": True, "checkin": checkin})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    @app.route('/api/plugins/mental-health/checkins', methods=['GET'])
    def get_checkins():
        """Retrieve check-ins with optional date filtering."""
        try:
            days = request.args.get('days', default=30, type=int)
            checkins = load_checkins()
            
            # Filter by date if requested
            if days:
                cutoff = datetime.now() - timedelta(days=days)
                checkins = [
                    c for c in checkins 
                    if datetime.fromisoformat(c['timestamp']) > cutoff
                ]
            
            # Calculate stats
            if checkins:
                avg_mood = sum(c['mood'] for c in checkins) / len(checkins)
                streak = calculate_streak(checkins)
            else:
                avg_mood = 0
                streak = 0
            
            return jsonify({
                "checkins": checkins,
                "stats": {
                    "count": len(checkins),
                    "average_mood": round(avg_mood, 2),
                    "streak": streak
                }
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    @app.route('/api/plugins/mental-health/export', methods=['GET'])
    def export_checkins():
        """Export check-ins as JSON."""
        try:
            checkins = load_checkins()
            return jsonify({
                "export_date": datetime.now().isoformat(),
                "count": len(checkins),
                "checkins": checkins
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500


def calculate_streak(checkins):
    """Calculate current streak of consecutive daily check-ins."""
    if not checkins:
        return 0
    
    # Sort by timestamp, newest first
    sorted_checkins = sorted(
        checkins, 
        key=lambda x: datetime.fromisoformat(x['timestamp']), 
        reverse=True
    )
    
    streak = 0
    current_date = datetime.now().date()
    
    for checkin in sorted_checkins:
        checkin_date = datetime.fromisoformat(checkin['timestamp']).date()
        
        if checkin_date == current_date:
            streak += 1
            current_date -= timedelta(days=1)
        elif checkin_date == current_date - timedelta(days=streak):
            continue
        else:
            break
    
    return streak


# Plugin SDK registration
def register_plugin(app):
    """Main entry point for plugin registration."""
    register_routes(app)
    return {
        "name": "mental-health-checkin",
        "label": "Mental Health Check-In",
        "ready": True
    }
