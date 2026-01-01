<?php
require 'session.php';

echo json_encode([
    'isLogged' => ($_SESSION['isLogged'] ?? false) === true
]);
