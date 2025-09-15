import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';

class DriverLocationWebSocketService {
  WebSocketChannel? _channel;

  // Toggle this flag to switch between local and Render backend
  static const bool useLocal = true; // true = local, false = Render
  static const String localIp = '192.168.1.5'; // Change to your PC's IP
  static const int localPort = 8000;
  static String getLocalUrl(String busId) {
    return 'ws://$localIp:$localPort/ws/bus-location/$busId';
  }
  static String getRenderUrl(String busId) {
    return 'wss://yatraone-backend.onrender.com/api/ws/bus-location/$busId';
  }

  void connect(String busId, {required void Function() onConnected, required void Function(dynamic) onError}) {
    final url = useLocal ? getLocalUrl(busId) : getRenderUrl(busId);
    try {
      _channel = WebSocketChannel.connect(Uri.parse(url));
      onConnected();
    } catch (e) {
      onError(e);
    }
  }

  void sendLocation({
    required double latitude,
    required double longitude,
    required double speed,
    required String driverId,
    String? timestamp,
  }) {
    if (_channel == null) return;
    final data = {
      'latitude': latitude,
      'longitude': longitude,
      'speed': speed,
      'driver_id': driverId,
      if (timestamp != null) 'timestamp': timestamp,
    };
    _channel!.sink.add(jsonEncode(data));
  }

  void disconnect() {
    _channel?.sink.close();
    _channel = null;
  }
}
