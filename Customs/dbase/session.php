<?php

if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === 'off') {
    header('Location: https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
    exit;
}

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',        // cookie accessible on all pages
    'domain' => '',       // current domain
    'secure' => true,     // HTTPS only
    'httponly' => true,   // JS cannot access cookie
    'samesite' => 'Lax'   // prevent CSRF issues
]);

session_start();
