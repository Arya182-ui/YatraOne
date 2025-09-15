from fastapi import Body
from fastapi import APIRouter, HTTPException
from app.firebase import firestore_db
from typing import List, Optional
from app.utils.notifications import push_notification

router = APIRouter()

@router.get("/buses/{bus_id}")
def get_bus_by_id(bus_id: str):
    """
    Retrieve a single bus by its ID.
    Args:
        bus_id (str): Bus ID to fetch.
    Returns:
        dict: Bus data if found.
    """
    doc_ref = firestore_db.collection('buses').document(bus_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Bus not found")
    bus = doc.to_dict()
    bus['id'] = doc.id
    return bus

@router.get("/buses")
def get_buses():
    """
    Retrieve all buses from the database.
    Returns:
        list: List of bus dicts.
    """
    buses_ref = firestore_db.collection('buses')
    buses_docs = list(buses_ref.stream())
    buses = []
    for doc in buses_docs:
        d = doc.to_dict()
        d['id'] = doc.id
        buses.append(d)
    return buses

@router.post("/buses")
def add_bus(bus: dict):
    """
    Add a new bus to the database and notify admin.
    Args:
        bus (dict): Bus fields.
    Returns:
        dict: Bus data with new ID.
    """
    doc_ref = firestore_db.collection('buses').document()
    doc_ref.set(bus)
    # Notify admin
    push_notification(
        title="New Bus Added",
        message=f"Bus added: {bus.get('number', doc_ref.id)}.",
        user_type="admin",
        extra={"event": "bus_added", "busId": doc_ref.id}
    )
    return {"id": doc_ref.id, **bus}

@router.delete("/buses/{bus_id}")
def delete_bus(bus_id: str):
    """
    Delete a bus by ID and notify admin.
    Args:
        bus_id (str): Bus ID to delete.
    Returns:
        dict: Success status.
    """
    doc_ref = firestore_db.collection('buses').document(bus_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Bus not found")
    doc_ref.delete()
    # Notify admin
    push_notification(
        title="Bus Deleted",
        message=f"Bus deleted: {bus_id}.",
        user_type="admin",
        extra={"event": "bus_deleted", "busId": bus_id}
    )
    return {"success": True}

@router.patch("/buses/{bus_id}")
def update_bus(bus_id: str, bus: dict):
    """
    Update a bus's fields and notify admin/users if status changes.
    Args:
        bus_id (str): Bus ID to update.
        bus (dict): Fields to update.
    Returns:
        dict: Updated bus data.
    """
    doc_ref = firestore_db.collection('buses').document(bus_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Bus not found")
    doc_ref.update(bus)
    # Notify admin if bus status is changed
    if 'status' in bus:
        push_notification(
            title="Bus Status Updated",
            message=f"Bus {bus_id} status changed to {bus['status']}.",
            user_type="admin",
            extra={"event": "bus_status", "busId": bus_id, "status": bus['status']}
        )
        # Notify users if bus is delayed or cancelled
        if bus['status'] in ["delayed", "cancelled"]:
            push_notification(
                title=f"Bus {bus['status'].title()}",
                message=f"Bus {bus_id} is {bus['status']}.",
                user_type="user",
                extra={"event": "bus_status", "busId": bus_id, "status": bus['status']}
            )
    return {"id": bus_id, **bus}

@router.post("/buses/{bus_id}/assign-driver")
def assign_driver(bus_id: str, driver_id: str):
    """
    Assign a driver to a bus and notify the driver.
    Args:
        bus_id (str): Bus ID.
        driver_id (str): Driver's user ID.
    Returns:
        dict: Success status.
    """
    doc_ref = firestore_db.collection('buses').document(bus_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Bus not found")
    doc_ref.update({"driverId": driver_id})
    # Notify driver
    push_notification(
        title="Bus Assignment",
        message=f"You have been assigned to bus {bus_id}.",
        user_type="driver",
        user_id=driver_id,
        extra={"event": "bus_assign", "busId": bus_id, "driverId": driver_id}
    )
    return {"success": True}

@router.post("/buses/{bus_id}/assign-routes")
def assign_routes(bus_id: str, route_ids: List[str] = Body(..., embed=True)):
    """
    Assign one or more routes to a bus and notify admin.
    Args:
        bus_id (str): Bus ID.
        route_ids (List[str]): List of route IDs to assign.
    Returns:
        dict: Success status and updated route IDs.
    """
    doc_ref = firestore_db.collection('buses').document(bus_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Bus not found")
    bus_data = doc_ref.get().to_dict() or {}
    current_route_ids = set(bus_data.get("routeIds", []))
    new_route_ids = set(route_ids)
    updated_route_ids = list(current_route_ids.union(new_route_ids))
    doc_ref.update({"routeIds": updated_route_ids})
    # Notify admin
    push_notification(
        title="Bus Routes Assigned",
        message=f"Bus {bus_id} assigned to routes: {', '.join(updated_route_ids)}.",
        user_type="admin",
        extra={"event": "bus_routes_assign", "busId": bus_id, "routeIds": updated_route_ids}
    )
    return {"success": True, "routeIds": updated_route_ids}

@router.post("/buses/{bus_id}/change-status")
def change_status(bus_id: str, status: str):
    """
    Change the status of a bus (e.g., active, delayed, cancelled).
    Args:
        bus_id (str): Bus ID.
        status (str): New status.
    Returns:
        dict: Success status.
    """
    doc_ref = firestore_db.collection('buses').document(bus_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Bus not found")
    doc_ref.update({"status": status})
    return {"success": True}
