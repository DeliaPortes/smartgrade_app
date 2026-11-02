<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teachers', function (Blueprint $table) {
            $table->string('id', 10)->primary();
            $table->string('name', 150);
            $table->string('email', 150)->unique();
            $table->string('phone', 20)->nullable();
            $table->string('grade', 20)->nullable();
            $table->string('section', 50)->nullable();
            $table->string('subjects', 100)->default('All Subjects');
            $table->string('status', 20)->default('active');
            $table->date('joined')->nullable();
        });

        Schema::create('parents', function (Blueprint $table) {
            $table->string('id', 10)->primary();
            $table->string('name', 150);
            $table->string('email', 150)->unique();
            $table->string('phone', 20)->nullable();
        });

        Schema::create('students', function (Blueprint $table) {
            $table->string('id', 10)->primary();
            $table->string('lrn', 20)->nullable();
            $table->string('name', 150);
            $table->string('grade', 20)->nullable();
            $table->string('section', 50)->nullable();
            $table->string('gender', 1)->nullable();
            $table->string('parent_name', 150)->nullable();
            $table->string('parent_email', 150)->nullable();
            $table->string('parent_id', 10)->nullable();
            $table->string('teacher_id', 10)->nullable();
            $table->string('contact', 20)->nullable();
            $table->string('status', 20)->default('active');
            $table->date('enrolled')->nullable();
            $table->foreign('parent_id')->references('id')->on('parents')->nullOnDelete();
            $table->foreign('teacher_id')->references('id')->on('teachers')->nullOnDelete();
        });

        Schema::create('classes', function (Blueprint $table) {
            $table->string('id', 10)->primary();
            $table->string('grade', 20)->nullable();
            $table->string('section', 50)->nullable();
            $table->string('teacher_id', 10)->nullable();
            $table->string('year', 20)->nullable();
            $table->foreign('teacher_id')->references('id')->on('teachers')->nullOnDelete();
        });

        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->string('teacher_id', 10);
            $table->string('grade', 20);
            $table->string('section', 50);
            $table->string('title', 160);
            $table->string('subject', 100);
            $table->text('description');
            $table->date('assignment_date');
            $table->date('due_date')->nullable();
            $table->timestamps();
            $table->index(['grade', 'section', 'assignment_date'], 'assignments_class_date_index');
            $table->foreign('teacher_id')->references('id')->on('teachers')->cascadeOnDelete();
        });

        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->string('student_id', 10);
            $table->string('subject', 100);
            $table->unsignedSmallInteger('q1')->default(0);
            $table->unsignedSmallInteger('q2')->default(0);
            $table->unsignedSmallInteger('q3')->default(0);
            $table->unsignedSmallInteger('q4')->default(0);
            $table->unique(['student_id', 'subject'], 'grades_student_subject_unique');
            $table->foreign('student_id')->references('id')->on('students')->cascadeOnDelete();
        });

        Schema::create('attendance', function (Blueprint $table) {
            $table->string('student_id', 10)->primary();
            $table->unsignedInteger('present')->default(0);
            $table->unsignedInteger('absent')->default(0);
            $table->unsignedInteger('half_day')->default(0);
            $table->unsignedInteger('tardy')->default(0);
            $table->unsignedInteger('late')->default(0);
            $table->unsignedInteger('total')->default(0);
            $table->foreign('student_id')->references('id')->on('students')->cascadeOnDelete();
        });

        Schema::create('attendance_records', function (Blueprint $table) {
            $table->string('student_id', 10);
            $table->date('attendance_date');
            $table->string('status', 20);
            $table->primary(['student_id', 'attendance_date']);
            $table->foreign('student_id')->references('id')->on('students')->cascadeOnDelete();
        });

        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->string('from_role', 20);
            $table->string('from_id', 20);
            $table->string('from_name', 150);
            $table->string('to_role', 20);
            $table->string('to_id', 20);
            $table->string('subject')->nullable();
            $table->text('body')->nullable();
            $table->date('date')->nullable();
            $table->string('time', 20)->nullable();
            $table->boolean('is_read')->default(false);
            $table->string('student_id', 10)->nullable();
            $table->unsignedBigInteger('thread_id')->nullable();
            $table->foreign('student_id')->references('id')->on('students')->nullOnDelete();
        });

        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('body')->nullable();
            $table->date('date')->nullable();
            $table->string('audience', 20)->default('all');
            $table->string('author', 150)->nullable();
            $table->string('author_role', 20)->nullable();
            $table->string('priority', 20)->default('normal');
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            $table->text('body')->nullable();
            $table->string('time', 50)->nullable();
            $table->string('type', 20)->default('normal');
            $table->boolean('is_read')->default(false);
            $table->string('role', 20)->default('all');
        });

        Schema::create('pending_teachers', function (Blueprint $table) {
            $table->string('id', 10)->primary();
            $table->string('name', 150);
            $table->string('email', 150)->unique();
            $table->string('phone', 20)->nullable();
            $table->string('grade', 20)->nullable();
            $table->string('section', 50)->nullable();
            $table->string('password');
            $table->date('applied_date')->nullable();
            $table->string('status', 20)->default('pending');
        });

        Schema::create('device_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('token');
            $table->char('token_hash', 64)->unique();
            $table->string('platform', 20);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_tokens');
        Schema::dropIfExists('pending_teachers');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('announcements');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('attendance_records');
        Schema::dropIfExists('attendance');
        Schema::dropIfExists('grades');
        Schema::dropIfExists('assignments');
        Schema::dropIfExists('classes');
        Schema::dropIfExists('students');
        Schema::dropIfExists('parents');
        Schema::dropIfExists('teachers');
    }
};
