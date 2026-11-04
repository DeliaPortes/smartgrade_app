import 'package:flutter/material.dart';

import '../data/tracked_api_client.dart';

class ModuleFeature {
  const ModuleFeature({
    required this.title,
    required this.path,
    required this.icon,
    required this.roles,
  });

  final String title;
  final String path;
  final IconData icon;
  final Set<String> roles;

  bool availableFor(String? role) => roles.contains(role);
}

class ModuleScreen extends StatefulWidget {
  const ModuleScreen({required this.api, required this.feature, super.key});

  final TrackedApiClient api;
  final ModuleFeature feature;

  @override
  State<ModuleScreen> createState() => _ModuleScreenState();
}

class _ModuleScreenState extends State<ModuleScreen> {
  late Future<dynamic> _records;

  @override
  void initState() {
    super.initState();
    _records = widget.api.get(widget.feature.path);
  }

  void _refresh() {
    setState(() => _records = widget.api.get(widget.feature.path));
  }

  List<dynamic> _asRecords(dynamic response) {
    if (response is List) return response;
    if (response is Map<String, dynamic>) {
      for (final key in ['data', 'records', 'items']) {
        if (response[key] is List) return response[key] as List;
      }
      return response.entries
          .map((entry) => {'key': entry.key, 'value': entry.value})
          .toList();
    }
    return const [];
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.feature.title;
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: RefreshIndicator(
        onRefresh: () async {
          _refresh();
          await _records;
        },
        child: FutureBuilder<dynamic>(
          future: _records,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snapshot.hasError) {
              return ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  _ModuleError(
                    message: snapshot.error.toString(),
                    onRetry: _refresh,
                  ),
                ],
              );
            }

            final records = _asRecords(snapshot.data);
            if (records.isEmpty) {
              return ListView(
                children: [
                  const SizedBox(height: 100),
                  Center(child: Text('No ${title.toLowerCase()} to show.')),
                ],
              );
            }

            return ListView.separated(
              padding: const EdgeInsets.all(12),
              itemCount: records.length,
              separatorBuilder: (_, _) => const SizedBox(height: 4),
              itemBuilder: (context, index) {
                final record = records[index];
                if (record is! Map) {
                  return Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Text(record.toString()),
                    ),
                  );
                }
                return _RecordCard(record: Map<String, dynamic>.from(record));
              },
            );
          },
        ),
      ),
    );
  }
}

class _RecordCard extends StatelessWidget {
  const _RecordCard({required this.record});

  final Map<String, dynamic> record;

  @override
  Widget build(BuildContext context) {
    final ignored = {'id', 'created_at', 'updated_at', 'password'};
    final entries = record.entries
        .where((entry) => !ignored.contains(entry.key) && entry.value != null)
        .toList();
    final titleEntry = entries.firstWhere(
      (entry) => const {'name', 'title', 'subject'}.contains(entry.key),
      orElse: () =>
          entries.isEmpty ? const MapEntry('Record', '') : entries.first,
    );
    final details = entries
        .where((entry) => entry.key != titleEntry.key)
        .take(4);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              titleEntry.value.toString(),
              style: Theme.of(context).textTheme.titleMedium,
            ),
            for (final entry in details)
              Padding(
                padding: const EdgeInsets.only(top: 6),
                child: Text(
                  '${_humanize(entry.key)}: ${_formatValue(entry.value)}',
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _ModuleError extends StatelessWidget {
  const _ModuleError({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) => Card(
    child: Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          const Icon(Icons.cloud_off_outlined, size: 36),
          const SizedBox(height: 8),
          Text(message, textAlign: TextAlign.center),
          TextButton(onPressed: onRetry, child: const Text('Try again')),
        ],
      ),
    ),
  );
}

String _humanize(String value) => value
    .replaceAllMapped(
      RegExp(r'([a-z])([A-Z])'),
      (match) => '${match[1]} ${match[2]}',
    )
    .replaceAll('_', ' ');

String _formatValue(Object? value) {
  if (value is List) {
    return value.map((item) => item?.toString() ?? '').join(', ');
  }
  if (value is Map) {
    return value.entries
        .map((entry) => '${_humanize(entry.key.toString())}: ${entry.value}')
        .join(' · ');
  }
  return value?.toString() ?? '—';
}
