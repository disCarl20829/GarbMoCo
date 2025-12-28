<?php
$username = $_POST['username'];

include __DIR__ . '/db_connect.php';

$stmt = $conn->prepare("SELECT * FROM USERS WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

echo ($result->num_rows > 0) ? "exists" : "available";
?>