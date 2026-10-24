import Flutter
import UIKit

@main
@objc class AppDelegate: FlutterAppDelegate, FlutterImplicitEngineDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  func didInitializeImplicitFlutterEngine(_ engineBridge: FlutterImplicitEngineBridge) {
    GeneratedPluginRegistrant.register(with: engineBridge.pluginRegistry)

    let registrar = engineBridge.pluginRegistry.registrar(forPlugin: "TrackEdDownloads")
    let channel = FlutterMethodChannel(
      name: "tracked_app/downloads",
      binaryMessenger: registrar.messenger()
    )
    channel.setMethodCallHandler { call, result in
      guard call.method == "saveFile" || call.method == "savePdf" else {
        result(FlutterMethodNotImplemented)
        return
      }
      guard
        let arguments = call.arguments as? [String: Any],
        let requestedName = arguments["filename"] as? String,
        let fileData = arguments["bytes"] as? FlutterStandardTypedData
      else {
        result(FlutterError(code: "INVALID_FILE", message: "File data is missing.", details: nil))
        return
      }

      let filename = URL(fileURLWithPath: requestedName).lastPathComponent
      guard !filename.isEmpty else {
        result(FlutterError(code: "INVALID_FILE", message: "A filename is required.", details: nil))
        return
      }

      do {
        let documents = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let destination = documents.appendingPathComponent(filename)
        try fileData.data.write(to: destination, options: .atomic)
        result(destination.path)
      } catch {
        result(FlutterError(code: "SAVE_FAILED", message: error.localizedDescription, details: nil))
      }
    }
  }
}
