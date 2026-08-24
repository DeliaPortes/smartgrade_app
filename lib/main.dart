import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';

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

  @override
  void initState() {
    super.initState();

    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
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

    loadTrackEd();
  }

  Future<void> loadTrackEd() async {
    final html = await rootBundle.loadString('assets/tracked/index.html');

    await controller.loadHtmlString(
      html,
      baseUrl: 'file:///android_asset/flutter_assets/assets/tracked/',
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(child: WebViewWidget(controller: controller)),
    );
  }
}
