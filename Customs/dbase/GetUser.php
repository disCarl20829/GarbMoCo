<?php
session_start();
header('Content-Type: application/json');

include __DIR__ . '/db_connect.php';

if (!isset($_SESSION['user_id']) || $_SESSION["isLogged"] = false) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "User not logged in"]);
    exit;
}

$stmt = $conn->prepare("SELECT user_id, user_name FROM users WHERE user_id = ?");
$stmt->bind_param("i", $_SESSION["user_id"]);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database query failed"]);
    exit;
}

$result = $stmt->get_result();
$user = $result->fetch_assoc();
$user["isLogged"] = true;

$stmt2 = $conn->prepare("SELECT user_phone FROM reporter WHERE user_id = ?");
$stmt2->bind_param("i", $_SESSION["user_id"]);

if (!$stmt2->execute()) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database query failed"]);
    exit;
}

$result2 = $stmt2->get_result();
if ($row2 = $result2->fetch_assoc()) {
    $user["user_phone"] = $row2["user_phone"];
} else {
    $user["user_phone"] = "+639773269246"; // default phone number
}

echo json_encode(["status" => "success", "message" => "Validated user.", "info" => $user]);
?>
