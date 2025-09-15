from fastapi import APIRouter
from app.firebase import firestore_db

router = APIRouter()

@router.get("/analytics")
def analytics():
    # Users
    users_ref = firestore_db.collection('users')
    users_docs = list(users_ref.stream())
    total_users = len(users_docs)
    active_users = sum(1 for doc in users_docs if doc.to_dict().get('isActive', True))

    # User Growth (by day, last 30 days)
    from collections import defaultdict
    import datetime
    user_growth_map = defaultdict(lambda: {"users": 0, "newUsers": 0})
    for doc in users_docs:
        d = doc.to_dict()
        created = d.get('createdAt')
        if created:
            try:
                date = datetime.datetime.fromisoformat(created[:19]).date()
            except Exception:
                continue
            user_growth_map[date]["users"] += 1
    # Calculate new users per day
    all_dates = sorted(user_growth_map.keys())
    prev_total = 0
    for date in all_dates:
        today_total = user_growth_map[date]["users"]
        user_growth_map[date]["newUsers"] = today_total - prev_total if today_total - prev_total > 0 else today_total
        prev_total = today_total
    user_growth = [
        {"date": str(date), "users": user_growth_map[date]["users"], "newUsers": user_growth_map[date]["newUsers"]}
        for date in all_dates[-30:]
    ]

    # Buses
    buses_ref = firestore_db.collection('buses')
    buses_docs = list(buses_ref.stream())
    total_buses = len(buses_docs)
    active_buses = sum(1 for doc in buses_docs if doc.to_dict().get('status', 'active') == 'active')

    # Feedback
    feedback_ref = firestore_db.collection('feedback')
    feedback_docs = list(feedback_ref.stream())
    total_feedback = len(feedback_docs)
    resolved_feedback = sum(1 for doc in feedback_docs if doc.to_dict().get('status') in ['resolved', 'closed'])

    # Feedback Trends (by day, last 30 days)
    feedback_trends_map = defaultdict(lambda: {"complaints": 0, "suggestions": 0, "compliments": 0})
    for doc in feedback_docs:
        d = doc.to_dict()
        created = d.get('createdAt')
        ftype = d.get('type', '').lower()
        if created and ftype:
            try:
                date = datetime.datetime.fromisoformat(created[:19]).date()
            except Exception:
                continue
            if ftype == 'complaint':
                feedback_trends_map[date]["complaints"] += 1
            elif ftype == 'suggestion':
                feedback_trends_map[date]["suggestions"] += 1
            elif ftype == 'compliment':
                feedback_trends_map[date]["compliments"] += 1
    feedback_trends = [
        {"date": str(date), **feedback_trends_map[date]}
        for date in sorted(feedback_trends_map.keys())[-30:]
    ]

    # Lost & Found
    lostfound_ref = firestore_db.collection('lostfound')
    lostfound_docs = list(lostfound_ref.stream())
    total_lostfound = len(lostfound_docs)
    matched_items = sum(1 for doc in lostfound_docs if doc.to_dict().get('status') == 'matched')

    # Bus Utilization (last 30 days, by bus)
    # Assume each bus doc has 'utilization' (0-1), 'busNumber', 'totalTrips'
    bus_utilization = []
    for doc in buses_docs:
        d = doc.to_dict()
        bus_utilization.append({
            "busId": doc.id,
            "busNumber": d.get('busNumber', ''),
            "utilization": float(d.get('utilization', 0)),
            "totalTrips": int(d.get('totalTrips', 0)),
        })
    # Popular Routes (top 5 by ridership)
    # Assume each bus doc has 'routeId', 'routeName', 'ridership', 'growth'
    route_map = {}
    for doc in buses_docs:
        d = doc.to_dict()
        route_id = d.get('routeId')
        if not route_id:
            continue
        if route_id not in route_map:
            route_map[route_id] = {
                "routeId": route_id,
                "routeName": d.get('routeName', ''),
                "ridership": 0,
                "growth": d.get('growth', 0),
            }
        route_map[route_id]["ridership"] += int(d.get('ridership', 0))
    popular_routes = sorted(route_map.values(), key=lambda x: x["ridership"], reverse=True)[:5]

    return {
        "totalUsers": total_users,
        "activeUsers": active_users,
        "totalBuses": total_buses,
        "activeBuses": active_buses,
        "totalFeedback": total_feedback,
        "resolvedFeedback": resolved_feedback,
        "totalLostFound": total_lostfound,
        "matchedItems": matched_items,
        "userGrowth": user_growth,
        "feedbackTrends": feedback_trends,
        "busUtilization": bus_utilization,
        "popularRoutes": popular_routes,
    }
