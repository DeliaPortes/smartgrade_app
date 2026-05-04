import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const SmartGradeApp());
}

class SmartGradeApp extends StatelessWidget {
  const SmartGradeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SmartGrade',
      debugShowCheckedModeBanner: false,
      home: const SmartGradePage(),
    );
  }
}

class SmartGradePage extends StatefulWidget {
  const SmartGradePage({super.key});

  @override
  State<SmartGradePage> createState() => _SmartGradePageState();
}

class _SmartGradePageState extends State<SmartGradePage> {
  late InAppWebViewController webViewController;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: InAppWebView(
          initialFile: 'assets/index.html',
          initialSettings: InAppWebViewSettings(
            javaScriptEnabled: true,
            allowFileAccessFromFileURLs: true,
            allowUniversalAccessFromFileURLs: true,
            mediaPlaybackRequiresUserGesture: false,
            useWideViewPort: false,
            loadWithOverviewMode: true,
            supportZoom: false,
            builtInZoomControls: false,
            displayZoomControls: false,
          ),
          onWebViewCreated: (controller) {
            webViewController = controller;
          },
          onLoadStop: (controller, url) async {
            // Inject CSS to force mobile fit after page loads
            await controller.evaluateJavascript(source: """
              var meta = document.querySelector('meta[name="viewport"]');
              if (meta) {
                meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no');
              }
              document.body.style.overflowX = 'hidden';
              document.documentElement.style.overflowX = 'hidden';
            """);
            debugPrint('Page loaded: $url');
          },
          onReceivedError: (controller, request, error) {
            debugPrint('Error: \${error.description}');
          },
        ),
      ),
    );
  }
}
