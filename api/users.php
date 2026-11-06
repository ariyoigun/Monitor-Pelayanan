<?php
/**
 * SIKEREN DINPUTARU DEMAK - API User Management
 * Endpoint: /api/users.php (atau /api/users)
 */

require_once __DIR__ . '/config.php';

$db = getDb();
$method = $_SERVER['REQUEST_METHOD'];

// 1. GET: List Users
if ($method === 'GET') {
    $stmt = $db->query("SELECT * FROM `users` ORDER BY `id` ASC");
    $rows = $stmt->fetchAll();

    $users = array_map(function($u) {
        return [
            'id'          => $u['id'],
            'username'    => $u['username'],
            'password'    => $u['password'],
            'nama'        => $u['nama'],
            'nip'         => $u['nip'],
            'role'        => $u['role'],
            'roleLabel'   => $u['role_label'],
            'bidang'      => $u['bidang'],
            'bidangLabel' => $u['bidang_label'],
            'jabatan'     => $u['jabatan'],
            'avatar'      => $u['avatar'],
            'email'       => $u['email'],
            'noHp'        => $u['no_hp'],
            'status'      => $u['status']
        ];
    }, $rows);

    sendJson(['success' => true, 'count' => count($users), 'data' => $users]);
}

// 2. POST: Create or Update User
if ($method === 'POST') {
    $u = getJsonInput();
    if (empty($u['username']) || empty($u['nama'])) {
        sendJson(['success' => false, 'message' => 'Username dan nama wajib diisi'], 400);
    }

    $id = !empty($u['id']) ? $u['id'] : 'USR-' . time();

    $sql = "INSERT INTO `users` (
        `id`, `username`, `password`, `nama`, `nip`, `role`, `role_label`,
        `bidang`, `bidang_label`, `jabatan`, `avatar`, `email`, `no_hp`, `status`, `created_at`
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()
    ) ON DUPLICATE KEY UPDATE
        `password` = VALUES(`password`),
        `nama` = VALUES(`nama`),
        `nip` = VALUES(`nip`),
        `role` = VALUES(`role`),
        `role_label` = VALUES(`role_label`),
        `bidang` = VALUES(`bidang`),
        `bidang_label` = VALUES(`bidang_label`),
        `jabatan` = VALUES(`jabatan`),
        `avatar` = VALUES(`avatar`),
        `email` = VALUES(`email`),
        `no_hp` = VALUES(`no_hp`),
        `status` = VALUES(`status`)";

    $stmt = $db->prepare($sql);
    $stmt->execute([
        $id,
        $u['username'],
        $u['password'] ?? 'Dinputaru2026',
        $u['nama'],
        $u['nip'] ?? '-',
        $u['role'] ?? 'koordinator_bidang',
        $u['roleLabel'] ?? ($u['role'] ?? 'Koordinator Bidang'),
        $u['bidang'] ?? 'Semua Bidang',
        $u['bidangLabel'] ?? ($u['bidang'] ?? 'Semua Bidang'),
        $u['jabatan'] ?? ($u['roleLabel'] ?? 'Pegawai'),
        $u['avatar'] ?? 'assets/logo.svg',
        $u['email'] ?? ($u['username'] . '@demakkab.go.id'),
        $u['noHp'] ?? '-',
        $u['status'] ?? 'Aktif'
    ]);

    sendJson(['success' => true, 'message' => 'Pengguna berhasil disimpan ke database MySQL']);
}

// 3. DELETE: Remove User
if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (empty($id)) {
        $input = getJsonInput();
        $id = $input['id'] ?? null;
    }
    if (empty($id)) {
        sendJson(['success' => false, 'message' => 'ID pengguna harus disertakan'], 400);
    }

    $stmt = $db->prepare("DELETE FROM `users` WHERE `id` = ?");
    $stmt->execute([$id]);

    sendJson(['success' => true, 'message' => 'Pengguna berhasil dihapus']);
}

sendJson(['success' => false, 'message' => 'Metode HTTP tidak didukung'], 405);
