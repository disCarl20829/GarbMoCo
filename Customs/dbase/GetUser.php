<?php
session_start();

header('Content-Type: application/json');

include __DIR__ . '/db_connect.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "User  not logged in"]);
    exit;
}

$user_id = $_SESSION['user_id'];

$sql = "SELECT id, username FROM users WHERE id = ?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: failed to prepare statement"]);
    exit;
}

$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if ($user) {
    echo json_encode($user);  // returns {"id": ..., "username": "..."}
} else {
    echo json_encode(["error" => "User  not found"]);
}

$stmt->close();
$conn->close();
?>
