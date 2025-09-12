# YatraOne Driver App

A modern Flutter app for bus drivers to securely log in, view assigned buses, and update their real-time location to the YatraOne backend (which syncs with Firebase Realtime Database). Includes online/offline status, robust authentication, and a user-friendly dashboard.

## Features
- Secure login and signup (JWT, userId management)
- View assigned bus details
- Online/offline toggle for driver status
- Real-time location updates (manual and auto)
- Only allows location updates when online and assigned to a bus
- Error/status feedback for all actions
- Modern, responsive UI

## Getting Started

### Prerequisites
- Flutter 3.x
- Dart 3.x
- Android/iOS device or emulator
- YatraOne backend running and accessible

### Setup
1. Clone the repo:
   ```sh
   git clone <repo-url>
   cd driver_app
   ```
2. Install dependencies:
   ```sh
   flutter pub get
   ```
3. Configure backend URL in `lib/services/api_service.dart` if needed.
4. Run the app:
   ```sh
   flutter run
   ```

## Project Structure
```
driver_app/
├── lib/
│   ├── main.dart
│   ├── models/
│   ├── screens/
│   ├── services/
│   └── ...
├── android/
├── ios/
├── web/
├── test/
└── README.md
```

## Key Files
- `lib/screens/main_screen.dart` — Dashboard, online/offline toggle, location updates
- `lib/services/api_service.dart` — All backend API calls
- `lib/services/session_service.dart` — Token/userId storage
- `lib/screens/login_screen.dart` — Login UI and logic
- `lib/screens/bus_info_screen.dart` — Assigned bus info

## Security & Best Practices
- Never hardcode secrets or production backend URLs in public repos
- All API calls use JWT and userId for authentication
- Online/offline status is synced with backend
- Location updates are only sent when online

## Backend Integration
- Requires YatraOne backend (FastAPI) with endpoints:
  - `/auth/login`, `/auth/register`
  - `/buses` (GET)
  - `/bus-locations-realtime/update` (POST)
  - `/drivers/status` (POST)

## SIH Compliance
- Accessibility, multilingual, privacy, and open data features included
- Modular, maintainable codebase for easy upgrades

## Contact
For support, contact the YatraOne admin team at support@yatraone.com.
