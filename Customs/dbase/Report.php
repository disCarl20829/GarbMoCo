<?php
session_start();
header('Content-Type: application/json');

include __DIR__ . '/db_connect.php';

if (empty($_SESSION['user_id']) || empty($_SESSION['isLogged'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "User not logged in"]);
    exit;
}

$user_id = (int) $_SESSION['user_id'];
$garbage_type = (int) ($_POST['garbage_type'] ?? 0);
$garbage_status = (int) ($_POST['garbage_status'] ?? 0);
$location = $_POST['location'] ?? '';
$latitude = (float) ($_POST['latitude'] ?? 0);
$longitude = (float) ($_POST['longitude'] ?? 0);
$description = $_POST['description'] ?? '';

$uploadedPaths = [];
$targetDir = "uploads/images/";
$targetDirVid = "uploads/videos/";

// Handle multiple images
if (!empty($_FILES['images']['name'][0])) {
    for ($i = 0; $i < count($_FILES['images']['name']); $i++) {
        $fileName = time() . "_" . basename($_FILES['images']['name'][$i]);
        $targetFile = $targetDir . $fileName;

        if (move_uploaded_file($_FILES['images']['tmp_name'][$i], $targetFile)) {
            $uploadedPaths[] = $targetFile;
        }
    }
}

// Handle video
if (!empty($_FILES['video']['name'])) {
    $videoName = time() . "_" . basename($_FILES['video']['name']);
    $videoTarget = $targetDirVid . $videoName;

    if (move_uploaded_file($_FILES['video']['tmp_name'], $videoTarget)) {
        $uploadedVideo = $videoTarget;
    } else {
        $uploadedVideo = null;
    }
} else {
    $uploadedVideo = null;
}

$imagePaths = json_encode($uploadedPaths);
$videoPath = $uploadedVideo;

$reportStmt = $conn->prepare("INSERT INTO reports (user_id, garbage_type, garbage_status, location, latitude, longitude, description, is_collected) VALUES (?, ?, ?, ?, ?, ?, ?, 0)");
$reportStmt->bind_param("iiisdds", $user_id, $garbage_type, $garbage_status, $location, $latitude, $longitude, $description);

if (!$reportStmt->execute()) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to submit report."]);
    exit;
}

$report_id = $reportStmt->insert_id;

$imgStmt = $conn->prepare("INSERT INTO report_media (report_id, media_type, file_path) VALUES (?, 'image', ?)");
$imgStmt->bind_param("is", $report_id, $imagePaths);

if (!$imgStmt->execute()) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to save report images."]);
    exit;
}

if ($videoPath) {
    $vidStmt = $conn->prepare("INSERT INTO report_media (report_id, media_type, file_path) VALUES (?, 'video', ?)");
    $vidStmt->bind_param("is", $report_id, $videoPath);

    if (!$vidStmt->execute()) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to save report video."]);
        exit;
    }
}

$verificationStmt = $conn->prepare("INSERT INTO report_agreements (report_id, user_id) VALUES (?, ?)");
$verificationStmt->bind_param("ii", $report_id, $user_id);

if (!$verificationStmt->execute()) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to save report verification."]);
    exit;
}

echo json_encode(["status" => "success", "message" => "Report submitted successfully.", "report_id" => $report_id]);
?>