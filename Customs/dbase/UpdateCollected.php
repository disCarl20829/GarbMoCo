<?php
session_start();
header('Content-Type: application/json');

include __DIR__ . '/db_connect.php';

if ($_SESSION['role'] !== 'admin') {
    die("Invalid access.");
}

$data = json_decode(file_get_contents("php://input"), true);
$reportId = intval($data['id'] ?? 0);

if ($reportId <= 0) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid report ID"]);
    exit;
}

$stmt = $conn->prepare("UPDATE reports SET isCollected = 1 WHERE id = ?");
$stmt->bind_param("i", $reportId);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Log marked as collected."]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to update report."]);
}

$stmt->close();
$conn->close();
?>
