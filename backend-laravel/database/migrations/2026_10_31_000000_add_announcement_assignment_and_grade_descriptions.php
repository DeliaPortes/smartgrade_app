<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('announcements', function (Blueprint $table): void {
            $table->string('category', 20)->default('general');
            $table->boolean('pinned')->default(false);
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
        });

        Schema::table('assignments', function (Blueprint $table): void {
            $table->string('work_type', 20)->default('assignment');
        });

        Schema::create('grade_descriptions', function (Blueprint $table): void {
            $table->string('student_id', 10);
            $table->string('quarter', 2);
            $table->text('description');
            $table->timestamps();
            $table->primary(['student_id', 'quarter']);
            $table->foreign('student_id')->references('id')->on('students')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grade_descriptions');

        Schema::table('assignments', function (Blueprint $table): void {
            $table->dropColumn('work_type');
        });

        Schema::table('announcements', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('created_by_user_id');
            $table->dropColumn(['category', 'pinned']);
        });
    }
};
