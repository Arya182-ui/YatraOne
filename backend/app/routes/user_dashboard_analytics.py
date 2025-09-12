from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from app.firebase import firestore_db
from fastapi import Request
from app.services.user_service import get_user_by_id
import jwt
import os

router = APIRouter()

def get_current_user(request: Request):
    user_id = request.query_params.get('user_id')
    if not user_id:
        raise HTTPException(status_code=401, detail='Missing user_id in query params')
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    return user

def get_dashboard_analytics(user_id: str) -> Dict[str, Any]:
    user_ref = firestore_db.collection('users').document(user_id)
    user_doc = user_ref.get()
    if not user_doc.exists:
        raise HTTPException(status_code=404, detail='User not found')
    user_data = user_doc.to_dict()

    points = user_data.get('points', 0)
    level = user_data.get('level', 1)

    # --- Points history for last month growth ---
    import datetime
    now = datetime.datetime.now()
    last_month = (now.replace(day=1) - datetime.timedelta(days=1)).strftime('%Y-%m')
    points_history_ref = user_ref.collection('points_history').document(last_month)
    last_month_doc = points_history_ref.get()
    last_month_points = last_month_doc.to_dict().get('points', 0) if last_month_doc.exists else 0

    # --- Level progress calculation ---
    # Example: Level 1: 0-999, Level 2: 1000-1999, Level 3: 2000-2999, ...
    LEVEL_STEP = 1000
    level_start_points = (level - 1) * LEVEL_STEP
    next_level_points = level * LEVEL_STEP
    if points >= next_level_points:
        level_progress = 1.0
    else:
        level_progress = (points - level_start_points) / (next_level_points - level_start_points) if next_level_points > level_start_points else 0.0

    achievements_ref = firestore_db.collection('achievements')
    achievements = [a for a in achievements_ref.stream()]
    total_achievements = len(achievements)
    user_achievements_ref = user_ref.collection('achievements')
    user_achievements = [a for a in user_achievements_ref.stream() if a.to_dict().get('isCompleted')]
    completed_achievements = len(user_achievements)

    buses_ref = firestore_db.collection('buses')
    buses = [b for b in buses_ref.stream()]
    total_buses = len(buses)
    active_buses = len([b for b in buses if b.to_dict().get('status') == 'active'])

    return {
        'points': points,
        'level': level,
        'last_month_points': last_month_points,
        'level_progress': level_progress,
        'total_achievements': total_achievements,
        'completed_achievements': completed_achievements,
        'total_buses': total_buses,
        'active_buses': active_buses,
    }

@router.get('/user-dashboard-analytics', tags=["User Dashboard"])
def user_dashboard_analytics(current_user=Depends(get_current_user)):
    analytics = get_dashboard_analytics(current_user['id'])
    return analytics


