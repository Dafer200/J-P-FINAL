<?php
include 'conexion.php';

$action = $_GET['action'] ?? '';

switch($action) {
    case 'crear':
        crearVenta();
        break;
    case 'listar':
        listarVentas();
        break;
    case 'reporte_diario':
        reporteDiario();
        break;
    case 'reporte_semanal':
        reporteSemanal();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Acción no válida']);
}

function crearVenta() {
    global $conn;
    
    $producto_id = $_POST['producto_id'] ?? '';
    $cantidad_vendida = $_POST['cantidad_vendida'] ?? '';
    
    try {
        // Obtener información del producto
        $stmt = $conn->prepare("SELECT precio, cantidad FROM productos WHERE id = ?");
        $stmt->execute([$producto_id]);
        $producto = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if(!$producto) {
            echo json_encode(['success' => false, 'message' => 'Producto no encontrado']);
            return;
        }
        
        if($producto['cantidad'] < $cantidad_vendida) {
            echo json_encode(['success' => false, 'message' => 'Stock insuficiente']);
            return;
        }
        
        $total_venta = $producto['precio'] * $cantidad_vendida;
        
        // Registrar la venta
        $stmt = $conn->prepare("INSERT INTO ventas (producto_id, cantidad_vendida, total_venta) VALUES (?, ?, ?)");
        $stmt->execute([$producto_id, $cantidad_vendida, $total_venta]);
        
        // Actualizar el stock
        $nueva_cantidad = $producto['cantidad'] - $cantidad_vendida;
        $stmt = $conn->prepare("UPDATE productos SET cantidad = ? WHERE id = ?");
        $stmt->execute([$nueva_cantidad, $producto_id]);
        
        echo json_encode(['success' => true, 'message' => 'Venta registrada exitosamente', 'total' => $total_venta]);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

function listarVentas() {
    global $conn;
    
    try {
        $stmt = $conn->query("
            SELECT v.*, p.nombre as producto_nombre 
            FROM ventas v 
            JOIN productos p ON v.producto_id = p.id 
            ORDER BY v.fecha_venta DESC
        ");
        $ventas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($ventas);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

function reporteDiario() {
    global $conn;
    
    try {
        $stmt = $conn->query("
            SELECT 
                DATE(fecha_venta) as fecha,
                COUNT(*) as total_ventas,
                SUM(total_venta) as ingresos_totales
            FROM ventas 
            WHERE DATE(fecha_venta) = CURDATE()
            GROUP BY DATE(fecha_venta)
        ");
        $reporte = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode($reporte ?: ['fecha' => date('Y-m-d'), 'total_ventas' => 0, 'ingresos_totales' => 0]);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

function reporteSemanal() {
    global $conn;
    
    try {
        $stmt = $conn->query("
            SELECT 
                DATE(fecha_venta) as fecha,
                COUNT(*) as total_ventas,
                SUM(total_venta) as ingresos_totales
            FROM ventas 
            WHERE fecha_venta >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DATE(fecha_venta)
            ORDER BY fecha DESC
        ");
        $reporte = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($reporte);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}
?>