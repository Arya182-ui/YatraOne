# YatraOne Driver App - Deployment Guide

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
