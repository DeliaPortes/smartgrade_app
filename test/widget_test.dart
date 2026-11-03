import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:tracked_app/main.dart';

void main() {
  testWidgets('TrackEd app loads', (WidgetTester tester) async {
    await tester.pumpWidget(const TrackEdApp());

    expect(find.byType(TrackEdApp), findsOneWidget);
  });

  test('teacher approvals use the API handler in the mobile app', () async {
    final bootstrap = await rootBundle.loadString(
      'assets/tracked/app-bootstrap.js',
    );
    final script = await rootBundle.loadString('assets/tracked/script.js');

    expect(bootstrap, contains('window._trackedApiApprovalEnabled = true;'));
    expect(bootstrap, contains('await api.approveTeacher(id)'));
    expect(script, contains('if (!window._trackedApiApprovalEnabled)'));
  });
}
