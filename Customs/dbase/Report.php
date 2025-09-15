<?php
$targetDir = "uploads/";
$targetFile = $targetDir . basename($_FILES["image"]["name"]);

if (move_uploaded_file($_FILES["image"]["tmp_name"], $targetFile)) {
    $conn = new mysqli("localhost", "root", "password", "my_database");

    $stmt = $conn->prepare("INSERT INTO reports (user_id, location, latitude, longitude, image_path, description) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("isddss", $userId, $_POST['location'], $_POST['lat'], $_POST['lng'], $targetFile, $_POST['description']);
    $stmt->execute();
    echo "Report saved successfully!";
} else {
    echo "Error uploading image.";
}
?>
