import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class ApiException implements Exception {
  const ApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

class TrackedApiClient {
  TrackedApiClient({http.Client? client}) : _client = client ?? http.Client();

  static const _configuredBaseUrl = String.fromEnvironment(
    'TRACKED_API_BASE_URL',
  );
  static const _timeout = Duration(seconds: 20);

  final http.Client _client;
  String? _token;

  void setToken(String? token) => _token = token;

  Future<dynamic> get(String path) => _request('GET', path);

  Future<dynamic> post(String path, {Map<String, dynamic>? body}) =>
      _request('POST', path, body: body);

  Future<dynamic> patch(String path, {Map<String, dynamic>? body}) =>
      _request('PATCH', path, body: body);

  Future<dynamic> delete(String path) => _request('DELETE', path);

  Future<dynamic> _request(
    String method,
    String path, {
    Map<String, dynamic>? body,
  }) async {
    final baseUrl = _configuredBaseUrl.trim();
    if (baseUrl.isEmpty) {
      throw const ApiException(
        'TrackEd API is not configured. Set TRACKED_API_BASE_URL to the Laravel API URL.',
      );
    }

    final baseUri = Uri.tryParse(baseUrl);
    if (baseUri == null ||
        !baseUri.hasAuthority ||
        !{'http', 'https'}.contains(baseUri.scheme) ||
        baseUri.host.isEmpty ||
        baseUri.query.isNotEmpty ||
        baseUri.fragment.isNotEmpty) {
      throw const ApiException(
        'TRACKED_API_BASE_URL must be a valid HTTP or HTTPS API URL.',
      );
    }
    if (baseUri.scheme != 'https' &&
        !(baseUri.scheme == 'http' &&
            {'localhost', '127.0.0.1'}.contains(baseUri.host))) {
      throw const ApiException(
        'Use HTTPS for the TrackEd API. HTTP is allowed only for localhost development.',
      );
    }

    final normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    final basePath = baseUri.path.endsWith('/')
        ? baseUri.path
        : '${baseUri.path}/';
    final uri = baseUri.replace(path: '$basePath$normalizedPath');
    final headers = <String, String>{
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    if (_token != null) {
      headers['Authorization'] = 'Bearer $_token';
    }

    late final http.Response response;
    try {
      final request = http.Request(method, uri)..headers.addAll(headers);
      if (body != null) {
        request.body = jsonEncode(body);
      }

      final streamed = await _client.send(request).timeout(_timeout);
      response = await http.Response.fromStream(streamed).timeout(_timeout);
    } on Exception catch (error) {
      debugPrint('TrackEd API request failed for $method $uri: $error');
      throw const ApiException(
        'Could not reach the TrackEd API. Check the connection and API URL.',
      );
    }

    dynamic data;
    if (response.body.isNotEmpty) {
      try {
        data = jsonDecode(response.body);
      } on FormatException {
        throw ApiException(
          'TrackEd API returned an invalid response (HTTP ${response.statusCode}).',
          statusCode: response.statusCode,
        );
      }
    }

    if (response.statusCode < 200 || response.statusCode >= 300) {
      final message = data is Map<String, dynamic>
          ? data['error'] as String?
          : null;
      throw ApiException(
        message ?? 'TrackEd API request failed (HTTP ${response.statusCode}).',
        statusCode: response.statusCode,
      );
    }

    return data;
  }
}
