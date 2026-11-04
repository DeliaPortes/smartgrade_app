import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:tracked_app/screens/module_screen.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('the original TrackEd UI is bundled for the WebView', () async {
    final html = await rootBundle.loadString('assets/tracked/index.html');
    expect(html, contains('id="login-page"'));
    expect(html, contains('app-bootstrap.js'));
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

  test(
    'messages, password reset, and account persistence use the requested flows',
    () async {
      final api = await rootBundle.loadString('assets/tracked/api.js');
      final bootstrap = await rootBundle.loadString(
        'assets/tracked/app-bootstrap.js',
      );
      final script = await rootBundle.loadString('assets/tracked/script.js');

      expect(api, contains('"Accept": "application/json"'));
      expect(api, contains('Some API resources are unavailable'));
      expect(api, isNot(contains('Some school records could not be loaded')));
      expect(bootstrap, isNot(contains('Signing in…')));
      expect(bootstrap, isNot(contains('Signing out…')));
      expect(bootstrap, contains('verifyPasswordResetCode'));
      expect(bootstrap, contains('completePasswordReset'));
      expect(api, contains('verify-reset-code'));
      expect(api, contains('remember }'));
      expect(script, contains('Default Admin'));
      expect(script, contains('forgot-email'));
      expect(script, contains('canSaveFinalGradeOne'));
      expect(script, contains("m.status === 'sending' ? 'Sending…'"));
      expect(script, contains("isMine ? 'Sent' : ''"));
    },
  );

  test('feature availability is role-scoped', () {
    const adminFeature = ModuleFeature(
      title: 'Pending teachers',
      path: '/pending-teachers',
      icon: Icons.people,
      roles: {'admin'},
    );

    expect(adminFeature.availableFor('admin'), isTrue);
    expect(adminFeature.availableFor('teacher'), isFalse);
    expect(adminFeature.availableFor('parent'), isFalse);
  });
}
