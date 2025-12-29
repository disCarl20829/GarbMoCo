<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

include __DIR__ . '/db_connect.php';

$reports = [];

$stmt = "SELECT t1.*, t2.user_phone, t3.media_type, t3.file_path AS image_path, t4.file_path AS video_path 
         FROM reports AS t1
         LEFT JOIN reporter AS t2 ON t1.user_id = t2.user_id
         LEFT JOIN report_media AS t3 ON t1.report_id = t3.report_id AND t3.media_type = 'image'
         LEFT JOIN report_media AS t4 ON t1.report_id = t4.report_id AND t4.media_type = 'video'
         ORDER BY t1.report_id DESC";
$result = $conn->query($stmt);

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

        $images = array_map(function ($img) use ($imageUploads) {
            if (strpos($img, 'http') !== 0) {
                $img = rtrim($imageUploads, '/') . '/' . ltrim($img, '/\\');
                $img = ltrim($img, '/');
            }
            return $img;
        }, $images);

        $videos = array_map(function ($vid) use ($videoUploads) {
            if (strpos($vid, 'http') !== 0) {
                $vid = rtrim($videoUploads, '/') . '/' . ltrim($vid, '/\\');
            }
            return $vid;
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