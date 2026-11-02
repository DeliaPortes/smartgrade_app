<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClassController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            DB::table('classes')->orderBy('grade')->orderBy('section')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'grade' => ['required', 'string', 'max:20'],
            'section' => ['required', 'string', 'max:50'],
            'teacherId' => ['sometimes', 'nullable', 'string', 'exists:teachers,id'],
            'year' => ['sometimes', 'nullable', 'string', 'max:20'],
        ]);
        $id = $this->nextClassId();

        DB::table('classes')->insert([
            'id' => $id,
            'grade' => $data['grade'],
            'section' => $data['section'],
            'teacher_id' => $data['teacherId'] ?? null,
            'year' => $data['year'] ?? '2024-2025',
        ]);

        return response()->json(DB::table('classes')->where('id', $id)->first(), 201);
    }

    public function update(Request $request, string $class): JsonResponse
    {
        $record = DB::table('classes')->where('id', $class)->first();
        abort_if(! $record, 404, 'Class not found.');

        $data = $request->validate([
            'teacherId' => ['sometimes', 'nullable', 'string', 'exists:teachers,id'],
            'year' => ['sometimes', 'nullable', 'string', 'max:20'],
        ]);
        abort_if($data === [], 422, 'Nothing to update.');

        $changes = [];
        if (array_key_exists('teacherId', $data)) {
            $changes['teacher_id'] = $data['teacherId'];
        }
        if (array_key_exists('year', $data)) {
            $changes['year'] = $data['year'];
        }
        DB::table('classes')->where('id', $class)->update($changes);

        return response()->json(DB::table('classes')->where('id', $class)->first());
    }

    public function destroy(string $class): JsonResponse
    {
        DB::table('classes')->where('id', $class)->delete();

        return response()->json(['message' => 'Class deleted.']);
    }

    private function nextClassId(): string
    {
        do {
            $id = 'C'.str_pad((string) random_int(1, 999), 3, '0', STR_PAD_LEFT);
        } while (DB::table('classes')->where('id', $id)->exists());

        return $id;
    }
}
