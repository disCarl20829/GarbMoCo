<?php
session_start();
include __DIR__ . '/db_connect.php';

header('Content-Type: application/json; charset=utf-8');

$reports = [];

$sql = "SELECT id, user_id, type, location, latitude, longitude, image_path, video_path, description, isCollected, isAgree1, isAgree2, created_at
        FROM reports ORDER BY id DESC";

$result = $conn->query($sql);

$imageUploads = '/Customs/dbase/';
$videoUploads = '/Customs/dbase/';

function normalizePaths($paths)
{
    $decoded = json_decode($paths, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($decoded)) {
        $decoded = $paths ? [$paths] : [];
    }
    return array_map(function ($p) {
        return trim($p, "\"' ");
    }, $decoded);
}

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {

        $images = normalizePaths($row['image_path']);
        $videos = normalizePaths($row['video_path']);

        $images = array_map(fn($img) => str_replace('\\', '/', trim($img)), $images);
        $videos = array_map(fn($vid) => str_replace('\\', '/', trim($vid)), $videos);

        $images = array_map(fn($img) => (strpos($img, 'http') !== 0 && strpos($img, '/') !== 0) ? $imageUploads . ltrim($img, '/') : $img, $images);
        $videos = array_map(function ($vid) use ($videoUploads) {
            if (strpos($vid, 'http') !== 0 && strpos($vid, '/') !== 0) {
                $vid = rtrim($videoUploads, '/') . '/' . ltrim($vid, '/');
            }
            return $vid;
        }, $videos);

        $videos = array_map(function($vid) {
            return str_replace('//', '/', $vid);
        }, $videos);


        $row['images'] = $images;
        $row['videos'] = $videos;

        unset($row['image_path']);
        unset($row['video_path']);

        $reports[] = $row;
    }
}

echo json_encode($reports, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

$conn->close();
?>