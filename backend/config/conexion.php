<?php
// backend/config/conexion.php

$host = "localhost";
$port = "5432";
$dbname = "tienda";
$username = "postgres";
$password = "12345";  // Tu contraseña aquí

try {
    // Conexión CORREGIDA para PostgreSQL
    $conn = new PDO("pgsql:host=$host;port=$port;dbname=$dbname;user=$username;password=$password");
    
    // ESTO ES IMPORTANTE: Configurar para que PostgreSQL funcione bien
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $conn->exec("SET client_encoding = 'UTF8'");
    $conn->exec("SET TIME ZONE 'America/Mexico_City'");
    
    // echo json_encode(['success' => true, 'message' => 'Conectado a PostgreSQL']);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Error de conexión PostgreSQL: ' . $e->getMessage()
    ]);
    exit();
}
?>