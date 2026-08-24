import 'package:flutter_test/flutter_test.dart';
import 'package:tracked_app/main.dart';

void main() {
  testWidgets('TrackEd app loads', (WidgetTester tester) async {
    await tester.pumpWidget(const TrackEdApp());

    expect(find.byType(TrackEdApp), findsOneWidget);
  });
}
