<?php
session_start();
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$number = $input['number'] ?? '';
$message = $input['message'] ?? '';

if (!$number) {echo json_encode(["error" => "Missing number"]); exit; }

$apiToken = "e723659b5693540f69dd8a5981f19cb6eb0a11e7";

$otp = random_int(100000, 999999);
$_SESSION['otp'] = $otp;

$deliver = $message;

$isOtp = $input['isOtp'] ?? false;
if ($isOtp) {
    $deliver .= $otp;
}

$url = "https://sms.iprogtech.com/api/v1/sms_messages";
$postFields = [
    "api_token"    => $apiToken,
    "phone_number" => $number,
    "message"      => $deliver
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postFields));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/x-www-form-urlencoded"
]);
$response = curl_exec($ch);

if ($response === false) {
    $error = curl_error($ch);
    curl_close($ch);
    echo json_encode(["status" => "failed", "response" => "Curl failed: " . $error]);
    exit;
}

curl_close($ch);
$apiResponse = json_decode($response, true);

echo json_encode(["status" => "success", "response" => $apiResponse]);
?>
