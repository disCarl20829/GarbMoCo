<?php
$host = "sql205.infinityfree.com";
$user = "if0_40390992";
$pass = "GPwaXb2u8Ruez";
$db   = "if0_40390992_garbmoco";

/*
$host = "localhost";
$user = "root";
$pass = "";
$db = "garbmoco";
*/

/*
$host = "192.168.0.102";
$user = "remoteuser";
$pass = "123456";
$db = "garbmoco";
*/

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

?>