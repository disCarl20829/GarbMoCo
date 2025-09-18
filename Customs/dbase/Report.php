<?php
session_start();

include __DIR__ . '/db_connect.php';

$userId = $_SESSION['user_id']; // <- is user logged
$reportType = $_POST['reportType'];
$location = $_POST['location'];
$lat = $_POST['lat'];
$lng = $_POST['lng'];
$description = $_POST['description'];
$agreement = $_POST['agreement'];

$uploadedPaths = [];
$targetDir = "uploads/";

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

$imagePaths = json_encode($uploadedPaths);

$stmt = $conn->prepare("INSERT INTO reports 
    (user_id, type, location, latitude, longitude, image_path, description, created_at, isAgree) 
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)");

$stmt->bind_param("issddssi", $userId, $reportType, $location, $lat, $lng, $imagePaths, $description, $agreement);

if ($stmt->execute()) {
    echo "Report saved successfully!";
} else {
    echo "Database error: " . $conn->error;
}
?>