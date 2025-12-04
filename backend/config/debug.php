<?php
// debug.php - PRUEBA SIN COMPLICACIONES
error_reporting(E_ALL);
ini_set('display_errors', 1);

$host = "localhost";
$port = "5432";
$dbname = "tienda";
$username = "postgres";
$password = "12345";

echo "<h2>DEBUG POSTGRESQL</h2>";

// 1. Probar conexión
try {
    $conn = new PDO("pgsql:host=$host;port=$port;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "<p style='color:green'>✅ Conexión PostgreSQL OK</p>";
} catch(Exception $e) {
    die("<p style='color:red'>❌ Error conexión: " . $e->getMessage() . "</p>");
}

// 2. Probar consulta MÁS SIMPLE POSIBLE
echo "<h3>Probando consultas:</h3>";

$tests = [
    "SELECT 1 as test" => "Consulta básica",
    "SELECT version()" => "Versión PostgreSQL",
    "SELECT current_database()" => "Base de datos actual",
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'" => "Tablas existentes",
    "SELECT * FROM productos LIMIT 1" => "Un producto"
];

foreach($tests as $sql => $desc) {
    echo "<p><strong>$desc:</strong> <code>$sql</code></p>";
    
    try {
        $stmt = $conn->query($sql);
        $result = $stmt->fetchAll();
        
        echo "<div style='background:#e8f5e8; padding:10px; margin:5px; border-left:4px solid green;'>";
        echo "✅ ÉXITO: " . count($result) . " fila(s)<br>";
        
        if(count($result) > 0) {
            echo "<pre>" . print_r($result[0], true) . "</pre>";
        }
        echo "</div>";
        
    } catch(Exception $e) {
        echo "<div style='background:#ffebee; padding:10px; margin:5px; border-left:4px solid red;'>";
        echo "❌ ERROR: " . $e->getMessage();
        echo "</div>";
    }
}

// 3. Ver estructura EXACTA de la tabla
echo "<h3>Estructura de tabla 'productos':</h3>";
try {
    $sql = "SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'productos' 
            ORDER BY ordinal_position";
    
    $stmt = $conn->query($sql);
    $cols = $stmt->fetchAll();
    
    echo "<table border='1' cellpadding='8'>";
    echo "<tr><th>Columna</th><th>Tipo</th><th>¿Nulo?</th></tr>";
    foreach($cols as $c) {
        echo "<tr>";
        echo "<td>" . $c['column_name'] . "</td>";
        echo "<td>" . $c['data_type'] . "</td>";
        echo "<td>" . $c['is_nullable'] . "</td>";
        echo "</tr>";
    }
    echo "</table>";
} catch(Exception $e) {
    echo "❌ Error estructura: " . $e->getMessage();
}

// 4. Mostrar datos REALES
echo "<h3>Datos en tabla 'productos':</h3>";
try {
    $sql = "SELECT * FROM productos";
    $stmt = $conn->query($sql);
    $data = $stmt->fetchAll();
    
    if(count($data) > 0) {
        echo "<table border='1' cellpadding='8'>";
        // Cabeceras
        echo "<tr>";
        foreach(array_keys($data[0]) as $col) {
            echo "<th>$col</th>";
        }
        echo "</tr>";
        
        // Datos
        foreach($data as $row) {
            echo "<tr>";
            foreach($row as $val) {
                echo "<td>" . htmlspecialchars($val) . "</td>";
            }
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "⚠️ Tabla vacía";
    }
    
} catch(Exception $e) {
    echo "❌ Error datos: " . $e->getMessage();
}
?>