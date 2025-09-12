import 'package:geolocator/geolocator.dart';


class LocationService {
  /// One-time location fetch
  static Future<Position> getCurrentLocation() async {
    await _ensurePermissions();
    const settings = LocationSettings(accuracy: LocationAccuracy.high);
    return await Geolocator.getCurrentPosition(locationSettings: settings);
  }

  /// Stream of location updates (for real-time tracking)
  /// [intervalSeconds]: minimum time between updates
  /// [distanceFilterMeters]: minimum distance (in meters) to trigger update
  static Stream<Position> getLocationStream({int intervalSeconds = 10, double distanceFilterMeters = 10}) async* {
    await _ensurePermissions();
    final settings = LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: distanceFilterMeters.toInt(),
    );
    yield* Geolocator.getPositionStream(locationSettings: settings);
  }

  /// Ensure location permissions are granted
  static Future<void> _ensurePermissions() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw Exception('Location services are disabled.');
    }
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw Exception('Location permissions are denied');
      }
    }
    if (permission == LocationPermission.deniedForever) {
      throw Exception('Location permissions are permanently denied.');
    }
  }
}
