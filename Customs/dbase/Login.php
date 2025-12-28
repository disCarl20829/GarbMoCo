<?php
session_start();
header('Content-Type: application/json');

include __DIR__ . '/db_connect.php';

$user_name = $_POST['user_name'];
$user_password = $_POST['user_password'];

$sql = "SELECT * FROM users WHERE user_name = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $user_name);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    if (password_verify($user_password, $row['user_password'])) {
        $_SESSION['user_id'] = $row['user_id'];
        $_SESSION['user_name'] = $row['user_name'];
        $_SESSION['user_role'] = $row['user_role'] === 2 ? "Admin" : "User";
        $_SESSION["isLogged"] = true;
        echo json_encode(["status" => "success", "message" => "Successfully logged in. Welcome!", "user_role" => $_SESSION['user_role']]);
        exit;
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid username or password"]);
        exit;
    }
} else {
    echo json_encode(["status" => "error", "message" => "Unable to find user."]);
    exit;
}