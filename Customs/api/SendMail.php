
<?php
session_start();
header('Content-Type: application/json');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

$mail = new PHPMailer(true);

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
    $mail->Subject = 'Incoming Report Submission: ' . $_POST['reportType'];
    $mail->Body = '
        <h2>NEW REPORT SUBMITTED</h2>
        <p><b>Reporter Name:</b> ' . $_SESSION['user_name'] . '</p>
        <p><b>Repoter Number:</b> ' . $_SESSION['user_contact'] . '</p>
        <p><b>Garbage Type:</b> ' . $_POST['garbage_type'] . '</p>
        <p><b>Garbage Status:</b> ' . $_POST['garbage_status'] . '</p>
        <p><b>Location:</b> ' . $_POST['location'] . '</p>
        <p><b>Latitude:</b> ' . $_POST['latitude'] . '</p>
        <p><b>Longitude:</b> ' . $_POST['longitude'] . '</p>
        <p><b>Description:</b> ' . $_POST['description'] . '</p>

        <p> Agreed Terms and Conditions: Yes </p>

        <p><b>Attachments:</b></p>
        <p>Please see the attached images and proof for more details.</p>
    ';

    if (!empty($_FILES['images']['tmp_name'][0])) {
        foreach ($_FILES['images']['tmp_name'] as $key => $tmp_name) {
            $mail->addAttachment($tmp_name, $_FILES['images']['name'][$key]);
        }
    }

    if (isset($_SESSION['user_id'])) {
        $proofPath = $_SESSION['user_id'];
        $proofFullPath = "../dbase/uploads/" . basename($proofPath) . "_id";

        if (file_exists($proofFullPath)) {
            $mail->addAttachment($proofFullPath);
        } else {
            error_log("Proof file not found: " . $proofFullPath);
        }
    }

    $mail->send();
    echo json_encode(["status" => "success", "message" => "Email sent successfully"]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Email could not be sent. Mailer Error: {$mail->ErrorInfo}"]);
}
?>