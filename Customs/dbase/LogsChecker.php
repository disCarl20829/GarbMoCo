<?php
session_start();
$role = $_SESSION['role'] ?? 'user';
?>
<?php echo $role; 
?>