from fastapi import APIRouter, HTTPException, Depends
from app.firebase import firestore_db
from pydantic import BaseModel

router = APIRouter()

class DriverStatusUpdate(BaseModel):
    user_id: str
    online: bool

@router.post('/drivers/status')
def update_driver_status(data: DriverStatusUpdate):
    """
    Update the online/offline status of a driver.
    """
    user_ref = firestore_db.collection('users').document(data.user_id)
    if not user_ref.get().exists:
        raise HTTPException(status_code=404, detail='Driver not found')
    user_ref.update({'online': data.online})
    return {'success': True, 'user_id': data.user_id, 'online': data.online}
