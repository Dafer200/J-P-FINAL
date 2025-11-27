<?php
header('Content-Type: application/json');

// OPCIÓN SEGURA - Usuario nuevo sin password
$host = "localhost";
$dbname = "tienda";
$username = "tienda";    // ← NUEVO USUARIO
$password = "";          // ← SIN PASSWORD

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión: ' . $e->getMessage()]);
    exit();
}
?>