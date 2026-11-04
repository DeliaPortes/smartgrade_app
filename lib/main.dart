import 'dart:convert';

import 'package:file_picker/file_picker.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

import 'data/tracked_api_client.dart';
import 'services/push_notification_service.dart';

const _apiBaseUrl = String.fromEnvironment('TRACKED_API_BASE_URL');
const _tokenStorageKey = 'tracked_access_token';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  PushNotificationService? pushNotifications;

  try {
    await Firebase.initializeApp();
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
    pushNotifications = await PushNotificationService.create();
  } on FirebaseException catch (error) {
    debugPrint(
      'TrackEd Firebase setup failed: ${error.code}: ${error.message}',
    );
  }

  runApp(
    TrackEdApp(api: TrackedApiClient(), pushNotifications: pushNotifications),
  );
}

class TrackEdApp extends StatelessWidget {
  const TrackEdApp({
    required this.api,
    required this.pushNotifications,
    super.key,
  });

  final TrackedApiClient api;
  final PushNotificationService? pushNotifications;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'TrackEd',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF2A76C9),
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF5F4F0),
      ),
      home: TrackEdWebView(api: api, pushNotifications: pushNotifications),
    );
  }
}

class TrackEdWebView extends StatefulWidget {
  const TrackEdWebView({
    required this.api,
    required this.pushNotifications,
    super.key,
  });

  final TrackedApiClient api;
  final PushNotificationService? pushNotifications;

  @override
  State<TrackEdWebView> createState() => _TrackEdWebViewState();
}

class _TrackEdWebViewState extends State<TrackEdWebView> {
  static const _downloadChannel = MethodChannel('tracked_app/downloads');
  static const _externalLinkChannel = MethodChannel(
    'tracked_app/external_links',
  );

  static const _secureStorage = FlutterSecureStorage();
  late final WebViewController _controller;
  String? _sessionToken;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..addJavaScriptChannel(
        'TrackEdSecureStorage',
        onMessageReceived: _handleSecureStorage,
      )
      ..addJavaScriptChannel(
        'TrackEdDownload',
        onMessageReceived: (message) => _saveDownload(message.message),
      )
      ..addJavaScriptChannel(
        'TrackEdOpenDownload',
        onMessageReceived: (message) => _openSavedDownload(message.message),
      )
      ..addJavaScriptChannel(
        'TrackEdExternalLink',
        onMessageReceived: (message) => _openExternalLink(message.message),
      )
      ..setBackgroundColor(Colors.white)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (url) async {
            debugPrint('TrackEd WebView loaded: $url');
            await _controller.runJavaScript(
              'window.configureTrackedApiBaseUrl(${jsonEncode(_apiBaseUrl)});',
            );
          },
          onNavigationRequest: (request) {
            final uri = Uri.tryParse(request.url);
            if (uri != null &&
                (uri.scheme == 'file' || uri.scheme == 'about')) {
              return NavigationDecision.navigate;
            }
            return NavigationDecision.prevent;
          },
          onWebResourceError: (error) {
            debugPrint('TrackEd WebView error: ${error.description}');
          },
        ),
      );

    if (_controller.platform is AndroidWebViewController) {
      final androidController =
          _controller.platform as AndroidWebViewController;
      androidController.setOnShowFileSelector(_selectFiles);
      androidController.setOnConsoleMessage((message) {
        debugPrint('TrackEd WebView console: ${message.message}');
      });
    }

    _controller.loadFlutterAsset('assets/tracked/index.html');
  }

  Future<List<String>> _selectFiles(FileSelectorParams params) async {
    final isImage = params.acceptTypes.any((type) => type.startsWith('image/'));
    try {
      final result = await FilePicker.platform.pickFiles(
        type: isImage ? FileType.image : FileType.custom,
        allowedExtensions: isImage ? null : ['csv', 'xls', 'xlsx'],
        dialogTitle: isImage ? 'Select profile picture' : 'Select file',
      );
      final path = result == null || result.files.isEmpty
          ? null
          : result.files.first.path;
      return path == null ? <String>[] : [Uri.file(path).toString()];
    } catch (error) {
      debugPrint('TrackEd file selection failed: $error');
      await _controller.runJavaScript(
        "if (typeof toast === 'function') toast('Could not open the file picker. Please try again.', 'error');",
      );
      return <String>[];
    }
  }

  Future<void> _handleSecureStorage(JavaScriptMessage message) async {
    String? requestId;
    Object? result;
    String? errorMessage;

    try {
      final request = jsonDecode(message.message);
      if (request is! Map<String, dynamic> ||
          request['id'] is! String ||
          request['action'] is! String) {
        throw const FormatException('The secure-storage request is invalid.');
      }

      requestId = request['id'] as String;
      switch (request['action']) {
        case 'read':
          result = await _secureStorage.read(key: _tokenStorageKey);
          result ??= _sessionToken;
          if (result is String) {
            widget.api.setToken(result);
          }
          break;
        case 'write':
          final token = request['value'];
          if (token is! String || token.isEmpty) {
            throw const FormatException('The access token is invalid.');
          }
          await _secureStorage.write(key: _tokenStorageKey, value: token);
          _sessionToken = null;
          widget.api.setToken(token);
          break;
        case 'session':
          final token = request['value'];
          if (token is! String || token.isEmpty) {
            throw const FormatException('The access token is invalid.');
          }
          await _secureStorage.delete(key: _tokenStorageKey);
          _sessionToken = token;
          widget.api.setToken(token);
          break;
        case 'delete':
          await widget.pushNotifications?.unregisterDevice(widget.api);
          await _secureStorage.delete(key: _tokenStorageKey);
          _sessionToken = null;
          widget.api.setToken(null);
          break;
        case 'activate':
          final token = await _secureStorage.read(key: _tokenStorageKey) ??
              _sessionToken;
          widget.api.setToken(token);
          if (token != null) {
            await widget.pushNotifications?.registerDevice(widget.api);
          }
          result = null;
          break;
        default:
          throw const FormatException('The secure-storage action is unknown.');
      }
    } catch (error) {
      errorMessage = error.toString();
      debugPrint('TrackEd secure-storage request failed: $error');
    }

    if (requestId == null) return;
    final response = jsonEncode({
      'id': requestId,
      'value': result,
      'error': errorMessage,
    });
    await _controller.runJavaScript(
      'window.resolveTrackedSecureStorage($response);',
    );
  }

  Future<void> _openExternalLink(String url) async {
    final uri = Uri.tryParse(url);
    if (uri == null || uri.scheme != 'https' || uri.host != 't.me') return;
    await _externalLinkChannel.invokeMethod<void>('openUrl', {
      'url': uri.toString(),
    });
  }

  Future<void> _saveDownload(String message) async {
    var filename = 'tracked-export.pdf';
    try {
      final payload = jsonDecode(message) as Map<String, dynamic>;
      filename = (payload['filename'] as String? ?? filename).replaceAll(
        RegExp(r'[^A-Za-z0-9._-]'),
        '_',
      );
      final dataUri = payload['dataUri'] as String;
      final separator = dataUri.indexOf(',');
      if (separator < 0) {
        throw const FormatException('The exported file data is invalid.');
      }
      final bytes = base64Decode(dataUri.substring(separator + 1));
      if (bytes.isEmpty) {
        throw const FormatException('The exported file is empty.');
      }
      final saveResult = await _downloadChannel
          .invokeMapMethod<String, dynamic>('saveFile', {
            'filename': filename,
            'bytes': bytes,
          });
      final savedUri = saveResult?['uri'] as String?;
      final notificationsEnabled = saveResult?['notificationsEnabled'] == true;
      await _controller.runJavaScript(
        'window.handleNativeDownloadResult && window.handleNativeDownloadResult(true, ${jsonEncode(filename)}, ${jsonEncode(savedUri)}, $notificationsEnabled);',
      );
    } catch (error) {
      debugPrint('TrackEd download failed: $error');
      await _controller.runJavaScript(
        'window.handleNativeDownloadResult && window.handleNativeDownloadResult(false, ${jsonEncode(filename)});',
      );
    }
  }

  Future<void> _openSavedDownload(String message) async {
    var filename = 'exported file';
    try {
      final payload = jsonDecode(message) as Map<String, dynamic>;
      filename = payload['filename'] as String? ?? filename;
      final uri = payload['uri'] as String?;
      if (uri == null) {
        throw const FormatException('The saved file location is unavailable.');
      }
      await _downloadChannel.invokeMethod<void>('openFile', {'uri': uri});
      await _controller.runJavaScript(
        'window.handleNativeDownloadOpenResult && window.handleNativeDownloadOpenResult(true, ${jsonEncode(filename)});',
      );
    } catch (error) {
      debugPrint('Opening TrackEd export failed: $error');
      await _controller.runJavaScript(
        'window.handleNativeDownloadOpenResult && window.handleNativeDownloadOpenResult(false, ${jsonEncode(filename)});',
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(child: WebViewWidget(controller: _controller)),
    );
  }
}
