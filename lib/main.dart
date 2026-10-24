import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:file_picker/file_picker.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const TrackEdApp());
}

class TrackEdApp extends StatelessWidget {
  const TrackEdApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'TrackEd',
      theme: ThemeData(useMaterial3: true),
      home: const TrackEdWebView(),
    );
  }
}

class TrackEdWebView extends StatefulWidget {
  const TrackEdWebView({super.key});

  @override
  State<TrackEdWebView> createState() => _TrackEdWebViewState();
}

class _TrackEdWebViewState extends State<TrackEdWebView> {
  late final WebViewController controller;
  static const _downloadChannel = MethodChannel('tracked_app/downloads');
  static const _openDownloadChannel = MethodChannel(
    'tracked_app/open_download',
  );
  static const _externalLinkChannel = MethodChannel(
    'tracked_app/external_links',
  );

  @override
  void initState() {
    super.initState();

    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
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
          onPageStarted: (url) {
            debugPrint('Loading: $url');
          },
          onPageFinished: (url) {
            debugPrint('Loaded: $url');
          },
          onWebResourceError: (error) {
            debugPrint('WebView Error: ${error.description}');
          },
        ),
      );

    if (controller.platform is AndroidWebViewController) {
      final androidController = controller.platform as AndroidWebViewController;

      androidController.setOnShowFileSelector((params) async {
        final isImage = params.acceptTypes.any(
          (type) => type.startsWith('image/'),
        );
        try {
          final files = await FilePicker.pickFiles(
            type: isImage ? FileType.image : FileType.custom,
            allowedExtensions: isImage ? null : ['csv', 'xls', 'xlsx'],
            dialogTitle: isImage ? 'Select profile picture' : 'Select file',
          );
          final path = files.isEmpty ? null : files.first.path;
          return path == null ? <String>[] : [Uri.file(path).toString()];
        } catch (error) {
          debugPrint('TrackEd file selection failed: $error');
          await controller.runJavaScript(
            "if (typeof toast === 'function') toast('Could not open the file picker. Please try again.', 'error');",
          );
          return <String>[];
        }
      });

      androidController.setOnConsoleMessage((message) {
        debugPrint('TrackEd WebView Console: ${message.message}');
      });
    }

    loadTrackEd();
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
      await controller.runJavaScript(
        'window.handleNativeDownloadResult && window.handleNativeDownloadResult(true, ${jsonEncode(filename)}, ${jsonEncode(savedUri)}, $notificationsEnabled);',
      );
    } catch (error) {
      debugPrint('Download failed: $error');
      await controller.runJavaScript(
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
      await _openDownloadChannel.invokeMethod<void>('openFile', {'uri': uri});
      await controller.runJavaScript(
        'window.handleNativeDownloadOpenResult && window.handleNativeDownloadOpenResult(true, ${jsonEncode(filename)});',
      );
    } catch (error) {
      debugPrint('Opening exported file failed: $error');
      await controller.runJavaScript(
        'window.handleNativeDownloadOpenResult && window.handleNativeDownloadOpenResult(false, ${jsonEncode(filename)});',
      );
    }
  }

  Future<void> loadTrackEd() async {
    await controller.loadFlutterAsset('assets/tracked/index.html');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(child: WebViewWidget(controller: controller)),
    );
  }
}
