<?php
session_start();
include __DIR__ . '/db_connect.php';

header('Content-Type: application/json; charset=utf-8');

$sql = "SELECT id, user_id, type, location, latitude, longitude, image_path, description, isCollected, isAgree, created_at
        FROM reports ORDER BY id DESC";
$result = $conn->query($sql);

$baseUrl = '/GarbMoCo/Customs/dbase/';

while ($row = $result->fetch_assoc()) {
    $images = json_decode($row['image_path'], true);
    if (!is_array($images)) {
        $images = [];
    }
    $images = array_map(function($img) use ($baseUrl) {
        $img = str_replace('\\', '/', trim($img));
        if (strpos($img, 'http') !== 0 && strpos($img, '/') !== 0) {
            $img = $baseUrl . $img;
        }
        return $img;
    }, $images);
    $row['images'] = $images;
    $reports[] = $row;
}


echo json_encode($reports);
$conn->close();