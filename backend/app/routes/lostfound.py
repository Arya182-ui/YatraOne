
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from pydantic import BaseModel, Field
from uuid import uuid4
from datetime import datetime
from app.utils.notifications import push_notification
from app.firebase import firestore_db

router = APIRouter()



# --- Pydantic Models ---
class ContactInfo(BaseModel):
    preferredMethod: str
    email: Optional[str] = None
    phone: Optional[str] = None
    anonymous: bool = False

class LostFoundItem(BaseModel):
    id: str
    reporterId: str
    type: str  # 'lost' or 'found'
    category: str
    itemName: str
    description: str
    color: Optional[str] = None
    brand: Optional[str] = None
    busId: Optional[str] = None
    routeId: Optional[str] = None
    stopId: Optional[str] = None
    dateReported: str
    dateFound: Optional[str] = None
    location: str
    status: str  # 'open', 'matched', 'returned', 'closed'
    images: List[str] = []
    contactInfo: ContactInfo
    matchedItemId: Optional[str] = None

class LostFoundCreate(BaseModel):
    reporterId: str
    type: str
    category: str
    itemName: str
    description: str
    color: Optional[str] = None
    brand: Optional[str] = None
    busId: Optional[str] = None
    routeId: Optional[str] = None
    stopId: Optional[str] = None
    location: str
    images: List[str] = []
    contactInfo: ContactInfo

class StatusUpdate(BaseModel):
    status: str

# --- Routes ---
@router.post("/lostfound", response_model=LostFoundItem)
def report_lost_found(item: LostFoundCreate):
    """
    Report a lost or found item. Increments reporter's points and notifies admins.
    Args:
        item (LostFoundCreate): Lost/found item details.
    Returns:
        LostFoundItem: Created lost/found item.
    """
    new_id = str(uuid4())
    now = datetime.utcnow().isoformat()
    new_item = LostFoundItem(
        id=new_id,
        dateReported=now,
        status="open",
        **item.dict()
    )
    # Store in Firestore
    firestore_db.collection("lostfound").document(new_id).set(new_item.dict())
    # Increment reporter's points in Firestore
    try:
        user_ref = firestore_db.collection('users').document(item.reporterId)
        doc = user_ref.get()
        if doc.exists:
            data = doc.to_dict()
            current_points = data.get('points', 0)
            user_ref.update({'points': current_points + 1})
    except Exception as e:
        print(f"[WARN] Could not increment points for user {item.reporterId}: {e}")
    # Send notification to admins
    push_notification(
        title=f"New {item.type.title()} Item Reported",
        message=f"{item.itemName} ({item.category}) reported as {item.type}.",
        user_type="admin",
        extra={"event": "lostfound", "itemId": new_id}
    )
    return new_item

@router.get("/lostfound", response_model=List[LostFoundItem])
def get_lost_found_items():
    """
    Retrieve all lost and found items.
    Returns:
        list: List of LostFoundItem objects.
    """
    docs = firestore_db.collection("lostfound").stream()
    items = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        # Ensure all required fields are present (for backward compatibility)
        if "status" not in data:
            data["status"] = "open"
        if "dateReported" not in data:
            data["dateReported"] = ""
        items.append(LostFoundItem(**data))
    # Sort by dateReported desc
    items.sort(key=lambda x: x.dateReported or "", reverse=True)
    return items

@router.patch("/lostfound/{item_id}/status", response_model=LostFoundItem)
def update_lost_found_status(item_id: str, status_update: StatusUpdate):
    """
    Update the status of a lost/found item (e.g., open, matched, returned, closed).
    Args:
        item_id (str): Item ID.
        status_update (StatusUpdate): New status value.
    Returns:
        LostFoundItem: Updated item.
    """
    doc_ref = firestore_db.collection("lostfound").document(item_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Item not found")
    data = doc.to_dict()
    data["status"] = status_update.status
    if status_update.status == "returned":
        data["dateFound"] = datetime.utcnow().isoformat()
    doc_ref.update(data)
    data["id"] = item_id
    return LostFoundItem(**data)

@router.delete("/lostfound/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lost_found_item(item_id: str):
    """
    Delete a lost/found item by ID.
    Args:
        item_id (str): Item ID to delete.
    Returns:
        None
    """
    doc_ref = firestore_db.collection("lostfound").document(item_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Item not found")
    doc_ref.delete()
    return
