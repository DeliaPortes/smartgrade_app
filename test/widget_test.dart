import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:smartgrade_app/main.dart';

void main() {
  testWidgets('SmartGrade app loads correctly', (WidgetTester tester) async {
    await tester.pumpWidget(const SmartGradeApp());
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
