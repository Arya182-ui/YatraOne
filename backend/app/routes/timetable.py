
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import RedirectResponse
from app.firebase import bucket

router = APIRouter()

@router.post('/timetable/upload')
async def upload_timetable(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail='Only PDF files are allowed.')
    blob = bucket.blob(f"timetables/{file.filename}")
    content = await file.read()
    blob.upload_from_string(content, content_type='application/pdf')
    blob.make_public()
    return {"message": "Timetable uploaded to Firebase Storage.", "filename": file.filename, "url": blob.public_url}

@router.get('/timetable/{filename}')
def get_timetable(filename: str):
    blob = bucket.blob(f"timetables/{filename}")
    if not blob.exists():
        raise HTTPException(status_code=404, detail='Timetable not found.')
    # Option 1: Redirect to public URL if made public
    return RedirectResponse(blob.public_url)
