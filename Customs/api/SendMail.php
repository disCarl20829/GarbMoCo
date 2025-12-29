
<?php
session_start();
header('Content-Type: application/json');

include '../dbase/db_connect.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

$mail = new PHPMailer(true);

$stmt = $conn->prepare("SELECT directory FROM user_validity WHERE user_id = ?");
$stmt->bind_param("i", $_SESSION['user_id']);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database query failed"]);
    exit;
}

$directory = $stmt->get_result()->fetch_assoc()['directory'];
$report_id = $_POST['report_id'] ?? null;

if (!$report_id) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing report_id"]);
    exit;
}

$link = "https://localhost/GarbMoCo/Logs.html?report_id=" . urlencode($report_id);


try {
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'carl.012908pepito@gmail.com';
    $mail->Password = 'yhku xhbo bsxu fvhr';
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;

    $mail->setFrom('apokonlinepub@gmail.com', 'GarbMoCo System');
    $mail->addAddress('apokonlinepub@gmail.com');

    $mail->isHTML(true);
    $mail->Subject = 'Incoming Report Submission: #' . ($_POST['report_id'] ?? 'N/A');
    $mail->Body = '
        <a href="' . $link . '" style="color:#1a73e8;text-decoration:underline;">
            View Case
        </a>

        <h2>NEW REPORT SUBMITTED</h2>
        <p><b>Reporter Name:</b> ' . ($_SESSION['user_name'] ?? '') . '</p>
        <p><b>Repoter Number:</b> ' . ($_POST['user_contact'] ?? '') . '</p>
        <p><b>Garbage Type:</b> ' . ($_POST['garbage_type'] ?? '') . '</p>
        <p><b>Garbage Status:</b> ' . ($_POST['garbage_status'] ?? '') . '</p>
        <p><b>Location:</b> ' . ($_POST['location'] ?? '') . '</p>
        <p><b>Latitude:</b> ' . floatval($_POST['latitude'] ?? '') . '</p>
        <p><b>Longitude:</b> ' . floatval($_POST['longitude'] ?? '') . '</p>
        <p><b>Description:</b> ' . ($_POST['description'] ?? '') . '</p>

        <p><b>Agreed Terms and Conditions: Yes</b></p>

        <p><b>Attachments:</b></p>
        <p>Please see the attached images and proof for more details.</p>
    ';

    if (!empty($_FILES['images']['tmp_name'][0])) {
        foreach ($_FILES['images']['tmp_name'] as $key => $tmp_name) {
            $mail->addAttachment($tmp_name, $_FILES['images']['name'][$key]);
        }
    }

    if (isset($_SESSION['user_id'])) {
        $proofFullPath = "../dbase/" . $directory;

        if (file_exists($proofFullPath)) {
            $mail->addAttachment($proofFullPath);
        } else {
            error_log("Proof file not found: " . $proofFullPath);
        }
    }

    $mail->send();
    echo json_encode(["status" => "success", "message" => "Email sent successfully"]);
    exit;
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Email could not be sent. Mailer Error: {$mail->ErrorInfo}"]);
    exit;
}
?>