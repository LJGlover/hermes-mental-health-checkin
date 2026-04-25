"""
Mental Health Check-In Plugin Backend
FastAPI router for storing and retrieving mood check-ins.
"""
import sys
sys.stderr.write("PLUGIN mental-health-checkin loading\n")

from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
import json
import os

router = APIRouter()

# Plugin data directory
DATA_DIR = os.path.expanduser("~/.hermes/plugins/hermes-mental-health-checkin/dashboard/data")
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


@router.post("/checkin")
async def create_checkin(data: dict):
    """Create a new mood check-in."""
    mood = data.get('mood')
    note = data.get('note', '')
    
    if mood is None or not isinstance(mood, int) or mood < 1 or mood > 5:
        raise HTTPException(status_code=400, detail="Invalid mood value. Must be 1-5.")
    
    checkin = {
        "id": datetime.now().isoformat(),
        "timestamp": datetime.now().isoformat(),
        "mood": mood,
        "note": note
    }
    
    checkins = load_checkins()
    checkins.append(checkin)
    save_checkins(checkins)
    
    return {"success": True, "checkin": checkin}


@router.get("/checkins")
async def get_checkins(days: int = 30):
    """Retrieve check-ins with optional date filtering."""
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
    
    return {
        "checkins": checkins,
        "stats": {
            "count": len(checkins),
            "average_mood": round(avg_mood, 2),
            "streak": streak
        }
    }


@router.get("/export")
async def export_checkins():
    """Export check-ins as JSON."""
    checkins = load_checkins()
    return {
        "export_date": datetime.now().isoformat(),
        "count": len(checkins),
        "checkins": checkins
    }
