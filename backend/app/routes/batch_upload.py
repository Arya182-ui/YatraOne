
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from app.firebase import firestore_db
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter()


# Pydantic model for batch upload
class BatchUploadRequest(BaseModel):
    data: List[Dict[str, Any]]

@router.post("/batch-upload/{data_type}")
async def batch_upload(data_type: str, body: BatchUploadRequest):
    """
    Batch upload data to Firestore for a given data type (buses, users, routes, lostfound).
    Args:
        data_type (str): The type of data to upload (buses, users, routes, lostfound).
        body (BatchUploadRequest): Request body with 'data' list.
    Returns:
        JSONResponse: Success status and count of uploaded items.
    """
    data = body.data
    if not data or not isinstance(data, list):
        raise HTTPException(status_code=400, detail="Invalid or missing data")

    if data_type == "buses":
        ref = firestore_db.collection('buses')
    elif data_type == "users":
        ref = firestore_db.collection('users')
    elif data_type == "routes":
        ref = firestore_db.collection('routes')
    elif data_type == "lostfound":
        ref = firestore_db.collection('lostfound')
    else:
        raise HTTPException(status_code=400, detail="Invalid data type")

    for item in data:
        item_id = item.get('id')
        if item_id:
            ref.document(str(item_id)).set(item, merge=True)
        else:
            ref.document().set(item)

    return JSONResponse({"success": True, "count": len(data)})
