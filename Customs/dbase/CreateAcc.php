<?php
session_start();
header('Content-Type: application/json');

include __DIR__ . '/db_connect.php';

if (isset($_SESSION['isLogged']) && $_SESSION['isLogged'] === true && $_SESSION['role'] !== 'admin') {
    die("Invalid access.");
}

$user_name = $_POST['user_name'];
$user_password = $_POST['user_password'];
$user_role = (int) $_POST['user_role'];
$user_contact = $_POST['user_contact'];

$stmtUsers = $conn->prepare("SELECT * FROM users WHERE user_name = ?");
$stmtUsers->bind_param("s", $user_name);
$stmtUsers->execute();
$resultUsers = $stmtUsers->get_result();

if ($resultUsers->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "Username already exists. Please choose a different username."]);
    exit;
}

$hashed_password = password_hash($user_password, PASSWORD_DEFAULT);

$create = $conn->prepare("INSERT INTO users (user_name, user_password, user_role)
    VALUES (?, ?, ?)");
$create->bind_param("sss", $user_name, $hashed_password, $user_role);

if (!$create->execute()) {
    echo json_encode(["status" => "error", "message" => "Error creating account: " . $conn->error]);
    exit;
}

$user_id = $conn->insert_id;

$idTarget = "id/";

if (!empty($_FILES['proofId']['name'])) {
    $idName = $user_id . "_" . "platformID";
    $idTarget = $idTarget . $idName;

    if (move_uploaded_file($_FILES['proofId']['tmp_name'], $idTarget)) {
        $uploadId = $idTarget;
    } else {
        $uploadId = null;
    }
} else {
    $uploadId = null;
}

$idPath = $uploadId;

$createdValidity = $conn->prepare("INSERT INTO user_validity (user_id, directory)
    VALUES (?, ?)");
$createdValidity->bind_param("is", $user_id, $idPath);

if (!$createdValidity->execute()) {
    echo json_encode(["status" => "error", "message" => "Error creating user validity: " . $conn->error]);
    exit;
}

if ($user_role === 1) {
    if (substr($user_contact, 0, 2) !== "09" || strlen($user_contact) !== 13) {
        $user_contact = "+639" . substr($user_contact, 2);
    }

    $createContact = $conn->prepare("INSERT INTO reporter (user_id, user_phone)
        VALUES (?, ?)");
    $createContact->bind_param("is", $user_id, $user_contact);

    if (!$createContact->execute()) {
        echo json_encode(["status" => "error", "message" => "Error creating user contact: " . $conn->error]);
        exit;
    }
} else if ($user_role === 2) {
    $createContact = $conn->prepare("INSERT INTO staff (user_id, user_email)
        VALUES (?, ?)");
    $createContact->bind_param("is", $user_id, $user_contact);

    if (!$createContact->execute()) {
        echo json_encode(["status" => "error", "message" => "Error creating admin contact: " . $conn->error]);
        exit;
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid user role specified."]);
    exit;
}

echo json_encode(["status" => "success", "message" => "Account created successfully."]);
?>