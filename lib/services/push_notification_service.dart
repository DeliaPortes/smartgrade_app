import 'dart:io';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import '../data/tracked_api_client.dart';

class PushNotificationService {
  PushNotificationService._();

  static const _channel = AndroidNotificationChannel(
    'tracked_messages',
    'TrackEd notifications',
    description: 'School updates and messages from TrackEd.',
    importance: Importance.high,
  );

  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();
  String? _deviceId;

  static Future<PushNotificationService> create() async {
    final service = PushNotificationService._();
    await service._initialize();
    return service;
  }

  Future<void> _initialize() async {
    await _localNotifications.initialize(
      settings: const InitializationSettings(
        android: AndroidInitializationSettings('@mipmap/ic_launcher'),
      ),
    );
    await _localNotifications
        .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin
        >()
        ?.createNotificationChannel(_channel);

    FirebaseMessaging.onMessage.listen(
      (message) {
        _showForegroundNotification(message);
      },
      onError: (Object error) {
        debugPrint('TrackEd foreground notification stream failed: $error');
      },
    );
    // The FCM HTTP v1 backend requires an FCM registration token, not an
    // installation ID from Firebase Messaging's newer registration stream.
    // ignore: deprecated_member_use
    FirebaseMessaging.instance.onTokenRefresh.listen(
      (token) async {
        final api = _activeApi;
        if (api == null) return;
        await _registerToken(api, token);
      },
      onError: (Object error) {
        debugPrint('TrackEd notification token refresh failed: $error');
      },
    );
  }

  TrackedApiClient? _activeApi;

  Future<void> registerDevice(TrackedApiClient api) async {
    if (!Platform.isAndroid) return;
    _activeApi = api;

    try {
      final permission = await FirebaseMessaging.instance.requestPermission();
      if (permission.authorizationStatus == AuthorizationStatus.denied) {
        debugPrint('TrackEd push notifications were denied by the user.');
        return;
      }

      // ignore: deprecated_member_use
      final token = await FirebaseMessaging.instance.getToken();
      if (token == null || token.isEmpty) {
        debugPrint('TrackEd Firebase did not return a registration token.');
        return;
      }
      await _registerToken(api, token);
    } on FirebaseException catch (error) {
      debugPrint(
        'TrackEd device registration failed: ${error.code}: ${error.message}',
      );
    } on ApiException catch (error) {
      debugPrint('TrackEd device registration failed: $error');
    }
  }

  Future<void> _registerToken(TrackedApiClient api, String token) async {
    try {
      final response = await api.post(
        '/devices',
        body: {'token': token, 'platform': 'android'},
      );
      if (response is Map<String, dynamic>) {
        _deviceId = response['id']?.toString();
      }
    } on ApiException catch (error) {
      debugPrint('TrackEd device registration failed: $error');
    }
  }

  Future<void> unregisterDevice(TrackedApiClient api) async {
    _activeApi = null;
    final deviceId = _deviceId;
    _deviceId = null;
    if (deviceId == null) return;

    try {
      await api.delete('/devices/$deviceId');
    } on ApiException catch (error) {
      debugPrint('TrackEd device unregistration failed: $error');
    }
  }

  Future<void> _showForegroundNotification(RemoteMessage message) async {
    final title = message.notification?.title ?? message.data['title'];
    final body = message.notification?.body ?? message.data['body'];
    if ((title == null || title.isEmpty) && (body == null || body.isEmpty)) {
      return;
    }

    await _localNotifications.show(
      id: message.messageId?.hashCode ?? message.hashCode,
      title: title ?? 'TrackEd',
      body: body,
      notificationDetails: NotificationDetails(
        android: AndroidNotificationDetails(
          _channel.id,
          _channel.name,
          channelDescription: _channel.description,
          importance: Importance.high,
          priority: Priority.high,
        ),
      ),
    );
  }
}
