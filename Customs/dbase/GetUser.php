<?php
session_start();
header('Content-Type: application/json');

include __DIR__ . '/db_connect.php';

if (empty($_SESSION['user_id']) || empty($_SESSION['isLogged'])) {
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

$stmt2 = $conn->prepare("SELECT user_phone FROM reporter WHERE user_id = ?");
$stmt2->bind_param("i", $_SESSION["user_id"]);

if (!$stmt2->execute()) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database query failed"]);
    exit;
}

$result2 = $stmt2->get_result();
if ($row2 = $result2->fetch_assoc()) {
    if (!empty($row2["user_phone"])) {
        $user["user_phone"] = $row2["user_phone"];
    } else {
        $user["user_phone"] = "+639773269246"; // default phone number
    }
}

if ($_SESSION['user_role'] === "Admin") {
    $stmt3 = $conn->prepare("SELECT user_email FROM staff WHERE user_id = ?");
    $stmt3->bind_param("i", $_SESSION["user_id"]);
    $stmt3->execute();
    $result3 = $stmt3->get_result();

    if ($row3 = $result3->fetch_assoc()) {
        $user["user_email"] = $row3["user_email"];
    }
}

$user["user_role"] = $_SESSION['user_role'];

echo json_encode(["status" => "success", "message" => "Validated user.", "info" => $user]);
?>