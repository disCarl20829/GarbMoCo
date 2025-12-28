<?php
session_start();
header('Content-Type: application/json');

$input = json_decode(file_get_contents("php://input"), true);
$userOtp = $input['otp'] ?? '';

if (!isset($_SESSION['otp'])) {
    echo json_encode(["status" => "error", "message" => "No OTP found"]);
    exit;
}

if ($userOtp == $_SESSION['otp']) {
    unset($_SESSION['otp'], $_SESSION['otp_expires']);
    echo json_encode(["status" => "success", "message" => "OTP verified"]);
} else {
    echo json_encode(["status" => "error", "message" => "Invalid OTP"]);
}
?>
