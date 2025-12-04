<?php
// crear_todo.php - CREA TODO DESDE CERO
header('Content-Type: text/html; charset=utf-8');

$host = "localhost";
$port = "5432";
$username = "postgres";
$password = "12345";

echo "<h2>🚀 Creando sistema completo...</h2>";

try {
    // 1. Conectar sin base de datos primero
    $conn = new PDO("pgsql:host=$host;port=$port", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<p>✅ Conectado al servidor PostgreSQL</p>";
    
    // 2. Verificar si existe la base de datos 'tienda'
    $stmt = $conn->query("SELECT 1 FROM pg_database WHERE datname = 'tienda'");
    $existe = $stmt->fetch();
    
    if (!$existe) {
        // Crear base de datos
        $conn->exec("CREATE DATABASE tienda 
            WITH ENCODING = 'UTF8' 
            LC_COLLATE = 'Spanish_Latin America.1252' 
            LC_CTYPE = 'Spanish_Latin America.1252' 
            TEMPLATE = template0");
        echo "<p>✅ Base de datos 'tienda' creada</p>";
    } else {
        echo "<p>✅ Base de datos 'tienda' ya existe</p>";
    }
    
    // 3. Conectar a la base de datos 'tienda'
    $conn = new PDO("pgsql:host=$host;port=$port;dbname=tienda", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // 4. Crear tabla productos
    $sql = "CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        precio DECIMAL(10,2) NOT NULL,
        cantidad INTEGER NOT NULL,
        proveedor VARCHAR(100),
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $conn->exec($sql);
    echo "<p>✅ Tabla 'productos' creada</p>";
    
    // 5. Crear tabla ventas
    $sql = "CREATE TABLE IF NOT EXISTS ventas (
        id SERIAL PRIMARY KEY,
        producto_id INTEGER,
        producto_nombre VARCHAR(100),
        precio_unitario DECIMAL(10,2),
        cantidad_vendida INTEGER NOT NULL,
        total_venta DECIMAL(10,2) NOT NULL,
        fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $conn->exec($sql);
    echo "<p>✅ Tabla 'ventas' creada</p>";
    
    // 6. Insertar datos de prueba
    $sql = "INSERT INTO productos (nombre, precio, cantidad, proveedor) VALUES
        ('Camiseta Básica Blanca', 19.99, 100, 'Textiles S.A.'),
        ('Pantalón Vaquero', 49.99, 50, 'Denim Factory'),
        ('Zapatillas Running', 79.99, 30, 'Sport Gear'),
        ('Chaqueta Impermeable', 89.99, 25, 'Outdoor Wear'),
        ('Gorra de Béisbol', 15.99, 150, 'Accesorios Plus')
        ON CONFLICT DO NOTHING";
    $conn->exec($sql);
    echo "<p>✅ Datos de prueba insertados</p>";
    
    // 7. Verificar
    $stmt = $conn->query("SELECT COUNT(*) as total FROM productos");
    $result = $stmt->fetch();
    echo "<p>📊 Total productos en la tabla: <strong>" . $result['total'] . "</strong></p>";
    
    $stmt = $conn->query("SELECT * FROM productos ORDER BY id");
    $productos = $stmt->fetchAll();
    
    echo "<table border='1' cellpadding='10' style='border-collapse: collapse; margin-top: 20px;'>";
    echo "<tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Cantidad</th><th>Proveedor</th></tr>";
    foreach($productos as $p) {
        echo "<tr>";
        echo "<td>" . $p['id'] . "</td>";
        echo "<td>" . $p['nombre'] . "</td>";
        echo "<td>$" . $p['precio'] . "</td>";
        echo "<td>" . $p['cantidad'] . "</td>";
        echo "<td>" . $p['proveedor'] . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    echo "<h3 style='color: green; margin-top: 30px;'>🎉 ¡SISTEMA CREADO EXITOSAMENTE!</h3>";
    echo "<p><a href='public/index.php' style='background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-size: 18px;'>🚀 IR AL SISTEMA</a></p>";
    
} catch(PDOException $e) {
    echo "<p style='color: red;'><strong>❌ ERROR:</strong> " . $e->getMessage() . "</p>";
    
    // Intentar solución alternativa
    echo "<h3>🔧 Solución alternativa:</h3>";
    echo "<p>Intenta crear manualmente:</p>";
    echo "<pre>CREATE DATABASE tienda;</pre>";
    echo "<pre>CREATE TABLE productos (...);</pre>";
}
?>