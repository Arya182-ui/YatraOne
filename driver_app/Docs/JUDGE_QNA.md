# YatraOne Driver App - Judge Q&A

## What is the purpose of this app?
This app is designed for public transport drivers to securely manage their routes, report incidents, receive notifications, and access analytics, in compliance with SIH requirements.

## How does the app ensure driver privacy and security?
- Secure authentication and session management
- Data stored locally is encrypted and only accessible to the driver
- All communication with backend uses HTTPS and JWT tokens

## How does the app support accessibility and multilingual features?
- Adjustable text size and dark mode
- Language selection (English/Hindi)
- Simple, clear UI for all screens

## What happens if the driver loses connectivity?
- Offline mode caches essential data locally
- Actions (e.g., feedback, incident) are queued and sent when online

## How are notifications delivered?
- Real-time push and in-app notifications via backend API
- Notification Center screen for history

## How does the app handle emergencies?
- SOS screen for instant emergency alerts
- Incident screen for detailed reporting

## How is feedback managed?
- Feedback screen allows direct submission to admin
- Feedback is stored and visible in backend analytics

## How is the app SIH-compliant?
- Accessibility, privacy, multilingual, open data, and modular design
- All features mapped to SIH guidelines

## How can the app be extended?
- Modular codebase allows easy addition of new features (e.g., driver analytics, external APIs)

## What are the backend dependencies?
- REST API endpoints for all features
- Firebase, FastAPI, JWT, and other SIH-compliant technologies

---

# Deployment Guide

## Prerequisites
- Flutter SDK (latest stable)
- Android Studio or VS Code
- Backend API running and accessible

## Steps
1. Clone the repository:
   ```
   git clone https://github.com/Arya182-ui/YatraOne.git
   ```
2. Navigate to the driver app folder:
   ```
   cd YatraOne/driver_app
   ```
3. Install dependencies:
   ```
   flutter pub get
   ```
4. Configure backend URLs in service files if needed.
5. Run the app on emulator or device:
   ```
   flutter run
   ```
6. For release build:
   ```
   flutter build apk --release
   ```
7. Distribute APK to drivers or upload to Play Store (follow Google Play guidelines).

## Notes
- Ensure backend endpoints are live and accessible from the device.
- For iOS, follow Apple deployment steps and update Info.plist for network permissions.
- For production, enable crash reporting and analytics as needed.

## Support
Contact support@yatraone.com for deployment or technical issues.
