<?php
/**
 * GET    /api/students            (scoped: teacher sees own section, admin sees all, parent sees own child)
 * POST   /api/students            { name, grade, section, gender, status, parent, parentEmail, contact, lrn? }
 * PUT    /api/students/{id}       (same fields, partial)
 * DELETE /api/students/{id}
 */

function handle_students($method, $id) {
    $user = require_auth();
    $pdo = get_db();

    if ($method === 'GET' && !$id) {
        if ($user['role'] === 'teacher') {
            $stmt = $pdo->prepare('SELECT * FROM students WHERE teacher_id = ? ORDER BY name');
            $stmt->execute([$user['linked_id']]);
        } elseif ($user['role'] === 'parent') {
            $stmt = $pdo->prepare('SELECT * FROM students WHERE parent_id = ? ORDER BY name');
            $stmt->execute([$user['linked_id']]);
        } else {
            $stmt = $pdo->query('SELECT * FROM students ORDER BY name');
        }
        json_response($stmt->fetchAll());
    }

    if ($method === 'GET' && $id) {
        if (!can_access_student($user, $id)) json_error('Not allowed.', 403);
        $stmt = $pdo->prepare('SELECT * FROM students WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) json_error('Student not found.', 404);
        json_response($row);
    }

    if ($method === 'POST') {
        if ($user['role'] !== 'teacher') json_error('Only teachers can add students.', 403);
        $b = get_json_body();
        foreach (['name', 'grade', 'section', 'gender', 'contact'] as $req) {
            if (empty($b[$req])) json_error("Field '$req' is required.");
        }

        $stmt = $pdo->query("SELECT id FROM students ORDER BY id DESC LIMIT 1");
        $last = $stmt->fetch();
        $nextNum = $last ? ((int) substr($last['id'], 1)) + 1 : 1;
        $newId = 'S' . str_pad($nextNum, 3, '0', STR_PAD_LEFT);

        $teacherId = $user['role'] === 'teacher' ? $user['linked_id'] : ($b['teacherId'] ?? null);

        $stmt = $pdo->prepare('INSERT INTO students (id,lrn,name,grade,section,gender,parent_name,parent_email,parent_id,teacher_id,contact,status,enrolled)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,CURDATE())');
        $stmt->execute([
            $newId, $b['lrn'] ?? null, $b['name'], $b['grade'], $b['section'], $b['gender'],
            $b['parent'] ?? null, $b['parentEmail'] ?? null, $b['parentId'] ?? null, $teacherId,
            $b['contact'], $b['status'] ?? 'active',
        ]);

        $pdo->prepare('INSERT INTO attendance (student_id,present,absent,late,total) VALUES (?,0,0,0,0)')->execute([$newId]);
        $subjectSets = [
            'Grade 1' => ['makabansa', 'math', 'gmrc', 'reading_literacy', 'language'],
            'Grade 2' => ['science', 'math', 'english', 'filipino', 'gmrc', 'ap', 'writing'],
            'Grade 3' => ['science', 'math', 'english', 'filipino', 'gmrc', 'ap', 'mapeh'],
        ];
        foreach ($subjectSets[$b['grade']] ?? $subjectSets['Grade 1'] as $subj) {
            $pdo->prepare('INSERT INTO grades (student_id,subject,q1,q2,q3,q4) VALUES (?,?,0,0,0,0)')->execute([$newId, $subj]);
        }

        $stmt = $pdo->prepare('SELECT * FROM students WHERE id = ?');
        $stmt->execute([$newId]);
        json_response($stmt->fetch(), 201);
    }

    if ($method === 'PUT') {
        if ($user['role'] !== 'teacher') json_error('Only teachers can edit students.', 403);
        if (!$id) json_error('Student id is required.');
        if (!can_access_student($user, $id)) json_error('Not allowed.', 403);
        $b = get_json_body();
        $fields = []; $params = [];
        $map = ['name'=>'name','grade'=>'grade','section'=>'section','gender'=>'gender',
                'parent'=>'parent_name','parentEmail'=>'parent_email','contact'=>'contact',
                'status'=>'status','lrn'=>'lrn'];
        foreach ($map as $inKey => $col) {
            if (array_key_exists($inKey, $b)) { $fields[] = "$col = ?"; $params[] = $b[$inKey]; }
        }
        if (empty($fields)) json_error('Nothing to update.');
        $params[] = $id;
        $pdo->prepare('UPDATE students SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);

        $stmt = $pdo->prepare('SELECT * FROM students WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) json_error('Student not found.', 404);
        json_response($row);
    }

    if ($method === 'DELETE') {
        if ($user['role'] !== 'teacher') json_error('Only teachers can delete students.', 403);
        if (!$id) json_error('Student id is required.');
        if (!can_access_student($user, $id)) json_error('Not allowed.', 403);
        $pdo->prepare('DELETE FROM students WHERE id = ?')->execute([$id]);
        json_response(['message' => 'Student deleted.']);
    }

    json_error('Method not allowed.', 405);
}
