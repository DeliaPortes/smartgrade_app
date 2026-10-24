package com.example.tracked_app

import android.content.Intent
import android.content.ClipData
import android.content.ActivityNotFoundException
import android.net.Uri
import android.os.Environment
import android.os.Build
import android.content.ContentValues
import android.content.Context
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.DownloadManager
import android.Manifest
import android.content.pm.PackageManager
import android.provider.MediaStore
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.embedding.android.FlutterActivity
import io.flutter.plugin.common.MethodChannel

private const val DOWNLOAD_CHANNEL = "tracked_app/downloads"
private const val NOTIFICATION_CHANNEL_ID = "file_downloads"
private const val NOTIFICATION_PERMISSION_REQUEST = 4812

class MainActivity : FlutterActivity() {
	private var pendingDownloadAfterPermission: (() -> Unit)? = null

	override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
		super.configureFlutterEngine(flutterEngine)
		MethodChannel(flutterEngine.dartExecutor.binaryMessenger, DOWNLOAD_CHANNEL)
			.setMethodCallHandler { call, result ->
				if (call.method != "saveFile" && call.method != "savePdf") {
					if (call.method == "openFile") {
						try {
							val uri = Uri.parse(call.argument<String>("uri") ?: "")
							if (uri.scheme != "content" || uri.authority != MediaStore.AUTHORITY) {
								throw IllegalArgumentException("The saved file location is invalid.")
							}
							val filename = contentResolver.query(
								uri,
								arrayOf(MediaStore.Downloads.DISPLAY_NAME),
								null,
								null,
								null,
							)?.use { cursor ->
								if (cursor.moveToFirst()) cursor.getString(0).orEmpty().lowercase() else ""
							}.orEmpty()
							val mimeType = when {
								filename.endsWith(".pdf") -> "application/pdf"
								filename.endsWith(".csv") -> "text/csv"
								else -> "application/octet-stream"
							}
							val viewIntent = Intent(Intent.ACTION_VIEW).apply {
								setDataAndType(uri, mimeType)
								addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
							}
							val canOpenDirectly = packageManager.queryIntentActivities(
								viewIntent,
								android.content.pm.PackageManager.MATCH_DEFAULT_ONLY,
							).isNotEmpty()
							if (canOpenDirectly) {
								startActivity(Intent.createChooser(viewIntent, "Open exported file"))
							} else {
								val shareIntent = Intent(Intent.ACTION_SEND).apply {
									type = mimeType
									putExtra(Intent.EXTRA_STREAM, uri)
									clipData = ClipData.newUri(contentResolver, "Exported file", uri)
									addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
								}
								startActivity(Intent.createChooser(shareIntent, "Open or share exported file"))
							}
							result.success(null)
						} catch (error: ActivityNotFoundException) {
							result.error(
								"OPEN_FAILED",
								"No compatible app is available to open or share this file.",
								null,
							)
						} catch (error: Exception) {
							result.error("OPEN_FAILED", error.message ?: "Could not open the exported file.", null)
						}
						return@setMethodCallHandler
					}
					result.notImplemented()
					return@setMethodCallHandler
				}
				val filename = call.argument<String>("filename") ?: "tracked-export.pdf"
				val bytes = call.argument<ByteArray>("bytes")
				if (filename.isBlank() || bytes == null || bytes.isEmpty()) {
					result.error("INVALID_FILE", "A filename and file data are required.", null)
					return@setMethodCallHandler
				}
				val save = { saveDownloadedFile(filename, bytes, result) }
				if (
					Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
					checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
				) {
					if (pendingDownloadAfterPermission != null) {
						result.error("DOWNLOAD_BUSY", "Another export is waiting for notification permission.", null)
						return@setMethodCallHandler
					}
					pendingDownloadAfterPermission = save
					requestPermissions(
						arrayOf(Manifest.permission.POST_NOTIFICATIONS),
						NOTIFICATION_PERMISSION_REQUEST,
					)
					return@setMethodCallHandler
				}
				save()
			}
		MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "tracked_app/external_links")
			.setMethodCallHandler { call, result ->
				if (call.method != "openUrl") {
					result.notImplemented()
					return@setMethodCallHandler
				}
				val uri = Uri.parse(call.argument<String>("url") ?: "")
				if (uri.scheme != "https" || uri.host != "t.me") {
					result.error("INVALID_URL", "Only Telegram links are allowed.", null)
					return@setMethodCallHandler
				}
				startActivity(Intent(Intent.ACTION_VIEW, uri))
				result.success(null)
			}
	}

	override fun onRequestPermissionsResult(
		requestCode: Int,
		permissions: Array<out String>,
		grantResults: IntArray,
	) {
		super.onRequestPermissionsResult(requestCode, permissions, grantResults)
		if (requestCode == NOTIFICATION_PERMISSION_REQUEST) {
			val pendingDownload = pendingDownloadAfterPermission
			pendingDownloadAfterPermission = null
			pendingDownload?.invoke()
		}
	}

	private fun saveDownloadedFile(
		filename: String,
		bytes: ByteArray,
		result: MethodChannel.Result,
	) {
		var uri: Uri? = null
		val notificationId = filename.hashCode() and 0x7fffffff
		try {
			if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
				val directory = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS)
					?: throw IllegalStateException("Device storage is unavailable.")
				if (!directory.exists() && !directory.mkdirs()) {
					throw IllegalStateException("The export folder could not be created.")
				}
				val file = java.io.File(directory, filename)
				file.writeBytes(bytes)
				result.success(
					mapOf(
						"uri" to file.absolutePath,
						"notificationsEnabled" to areDownloadNotificationsEnabled(),
					),
				)
				return
			}
			val values = ContentValues().apply {
				put(MediaStore.Downloads.DISPLAY_NAME, filename)
				put(MediaStore.MediaColumns.IS_PENDING, 1)
				put(
					MediaStore.Downloads.MIME_TYPE,
					when (filename.substringAfterLast('.', "").lowercase()) {
						"csv" -> "text/csv"
						"pdf" -> "application/pdf"
						else -> "application/octet-stream"
					},
				)
				put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
			}
			val insertedUri = contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
				?: throw IllegalStateException("Device storage is unavailable.")
			uri = insertedUri
			showDownloadProgress(notificationId, filename, bytes.size, 0)
			val output = contentResolver.openOutputStream(insertedUri)
				?: throw IllegalStateException("Device storage is unavailable.")
			output.use { stream ->
				var offset = 0
				val chunkSize = 64 * 1024
				while (offset < bytes.size) {
					val length = minOf(chunkSize, bytes.size - offset)
					stream.write(bytes, offset, length)
					offset += length
					showDownloadProgress(notificationId, filename, bytes.size, offset)
				}
			}
			val completed = ContentValues().apply {
				put(MediaStore.MediaColumns.IS_PENDING, 0)
			}
			if (contentResolver.update(insertedUri, completed, null, null) == 0) {
				throw IllegalStateException("The export could not be published to Downloads.")
			}
			val notificationsEnabled = areDownloadNotificationsEnabled()
			if (notificationsEnabled) {
				showDownloadComplete(notificationId, filename)
			}
			result.success(
				mapOf(
					"uri" to insertedUri.toString(),
					"notificationsEnabled" to notificationsEnabled,
				),
			)
		} catch (error: Exception) {
			uri?.let {
				try {
					contentResolver.delete(it, null, null)
				} catch (cleanupError: Exception) {
					error.addSuppressed(cleanupError)
				}
			}
			(getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager)
				.cancel(notificationId)
			result.error("SAVE_FAILED", error.message ?: "Could not save the file.", null)
		}
	}

	private fun areDownloadNotificationsEnabled(): Boolean {
		if (
			Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
			checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
		) {
			return false
		}
		val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
		return Build.VERSION.SDK_INT < Build.VERSION_CODES.N || manager.areNotificationsEnabled()
	}

	private fun showDownloadProgress(id: Int, filename: String, total: Int, current: Int) {
		if (!areDownloadNotificationsEnabled()) return
		val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
		ensureDownloadNotificationChannel(manager)
		val notification = notificationBuilder()
			.setContentTitle("Downloading $filename")
			.setContentText("Saving to Downloads")
			.setSmallIcon(android.R.drawable.stat_sys_download)
			.setProgress(total, current, false)
			.setOngoing(true)
			.build()
		manager.notify(id, notification)
	}

	private fun showDownloadComplete(id: Int, filename: String) {
		val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
		ensureDownloadNotificationChannel(manager)
		val openDownloads = PendingIntent.getActivity(
			this,
			id,
			Intent(DownloadManager.ACTION_VIEW_DOWNLOADS),
			PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
		)
		val notification = notificationBuilder()
			.setContentTitle("Download complete")
			.setContentText(filename)
			.setSmallIcon(android.R.drawable.stat_sys_download_done)
			.setProgress(0, 0, false)
			.setOngoing(false)
			.setAutoCancel(true)
			.setContentIntent(openDownloads)
			.build()
		manager.notify(id, notification)
	}

	private fun notificationBuilder(): Notification.Builder {
		return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
			Notification.Builder(this, NOTIFICATION_CHANNEL_ID)
		} else {
			@Suppress("DEPRECATION")
			Notification.Builder(this)
		}
	}

	private fun ensureDownloadNotificationChannel(manager: NotificationManager) {
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
			manager.createNotificationChannel(
				NotificationChannel(
					NOTIFICATION_CHANNEL_ID,
					"File downloads",
					NotificationManager.IMPORTANCE_DEFAULT,
				).apply {
					description = "Progress and completion alerts for exported files"
				},
			)
		}
	}
}
