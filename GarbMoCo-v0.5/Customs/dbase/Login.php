<?php
session_start();

$conn = new mysqli("localhost", "root", "", "garbmoco");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$username = $_POST['username'];
$password = $_POST['password'];

$sql = "SELECT * FROM users WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    if ($password === $row['password']) { // later use password_verify()???
        $_SESSION['user_id'] = $row['id'];
        $_SESSION['role'] = $row['role'];
        echo $row['role']; // send "admin" or "user" back to JS
    } else {
        echo "invalid";
    }
} else {
    echo "notfound";
}
