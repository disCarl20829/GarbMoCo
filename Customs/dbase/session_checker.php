<?php
require 'session.php'; 

echo json_encode([
    'isLogged' => isset($_SESSION['isLogged']),   // true if logged in
]);
