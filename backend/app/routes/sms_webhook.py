from fastapi import APIRouter, Request, Response, status
from fastapi.responses import PlainTextResponse
import os
from twilio.twiml.messaging_response import MessagingResponse
from ..services.bus_info import get_eta_and_next_stop_for_bus

router = APIRouter()

@router.post("/sms-webhook", response_class=PlainTextResponse)
async def sms_webhook(request: Request):
    form = await request.form()
    print("Received SMS webhook form:", dict(form))  # Debug log
    incoming_msg = form.get("Body", "").strip()
    bus_number = incoming_msg.upper()
    # Call your service to get bus info
    info = get_eta_and_next_stop_for_bus(bus_number)
    if info:
        reply = (
            f"Bus {info['bus_number']}\n"
            f"Current Location: {info['current_location']}\n"
            f"Next Stop: {info['next_stop']}\n"
            f"ETA: {info['eta']} min"
        )
    else:
        reply = f"Bus {bus_number} not found or not online. Please check the number."
    twiml = MessagingResponse()
    twiml.message(reply)
    xml_response = str(twiml)
    print("Responding with TwiML:\n", xml_response)  # Debug log
    return Response(content=xml_response, media_type="application/xml")
