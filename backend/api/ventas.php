<?php
// ERROR REPORTING PARA DEBUG
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configurar cabeceras para JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Manejar solicitudes OPTIONS para CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Incluir la conexión a la base de datos
include __DIR__ . '/../config/conexion.php';

// Debug: Ver qué datos llegan
file_put_contents('debug.log', date('Y-m-d H:i:s') . " - Action: " . ($_GET['action'] ?? 'none') . "\n", FILE_APPEND);
file_put_contents('debug.log', "POST: " . print_r($_POST, true) . "\n", FILE_APPEND);

// Obtener la acción desde el parámetro GET
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
    case 'detalle_diario':
        detalleVentasDiarias();
        break;
    case 'detalle_semanal':
        detalleVentasSemanales();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Acción no válida']);
        exit();
}

function crearVenta() {
    global $conn;
    
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $producto_id = $input['producto_id'] ?? '';
    $cantidad_vendida = $input['cantidad_vendida'] ?? '';
    
    try {
        $conn->beginTransaction();
        
        // Obtener información del producto
        $stmt = $conn->prepare("SELECT nombre, precio, cantidad FROM productos WHERE id = ?");
        $stmt->execute([$producto_id]);
        $producto = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if(!$producto) {
            $conn->rollBack();
            echo json_encode(['success' => false, 'message' => 'Producto no encontrado']);
            return;
        }
        
        if($producto['cantidad'] < $cantidad_vendida) {
            $conn->rollBack();
            echo json_encode(['success' => false, 'message' => 'Stock insuficiente']);
            return;
        }
        
        $total_venta = $producto['precio'] * $cantidad_vendida;
        
        // Registrar la venta
        $stmt = $conn->prepare("
            INSERT INTO ventas (producto_id, cantidad_vendida, total_venta, producto_nombre, precio_unitario) 
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $producto_id, 
            $cantidad_vendida, 
            $total_venta,
            $producto['nombre'],
            $producto['precio']
        ]);
        
        // Actualizar el stock
        $nueva_cantidad = $producto['cantidad'] - $cantidad_vendida;
        $stmt = $conn->prepare("UPDATE productos SET cantidad = ? WHERE id = ?");
        $stmt->execute([$nueva_cantidad, $producto_id]);
        
        $conn->commit();
        
        echo json_encode([
            'success' => true, 
            'message' => 'Venta registrada exitosamente', 
            'total' => $total_venta
        ]);
        
    } catch(PDOException $e) {
        $conn->rollBack();
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

function listarVentas() {
    global $conn;
    
    try {
        $stmt = $conn->query("
            SELECT 
                v.*, 
                COALESCE(p.nombre, v.producto_nombre, 'Producto Eliminado') as producto_nombre 
            FROM ventas v 
            LEFT JOIN productos p ON v.producto_id = p.id 
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
        // PARA POSTGRESQL
        $stmt = $conn->query("
            SELECT 
                DATE(fecha_venta) as fecha,
                COUNT(*) as total_ventas,
                SUM(total_venta) as ingresos_totales
            FROM ventas 
            WHERE fecha_venta::date = CURRENT_DATE
            GROUP BY DATE(fecha_venta)
        ");
        $reporte = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($reporte) {
            echo json_encode($reporte);
        } else {
            echo json_encode([
                'fecha' => date('Y-m-d'), 
                'total_ventas' => 0, 
                'ingresos_totales' => 0
            ]);
        }
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

function reporteSemanal() {
    global $conn;
    
    try {
        // PARA POSTGRESQL
        $stmt = $conn->query("
            SELECT 
                DATE(fecha_venta) as fecha,
                COUNT(*) as total_ventas,
                SUM(total_venta) as ingresos_totales
            FROM ventas 
            WHERE fecha_venta >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY DATE(fecha_venta)
            ORDER BY fecha DESC
        ");
        $reporte = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($reporte);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

function detalleVentasDiarias() {
    global $conn;
    
    try {
        $stmt = $conn->query("
            SELECT 
                v.*,
                COALESCE(p.nombre, v.producto_nombre) as producto_nombre,
                COALESCE(p.precio, v.precio_unitario) as precio_unitario
            FROM ventas v 
            LEFT JOIN productos p ON v.producto_id = p.id 
            WHERE DATE(v.fecha_venta) = CURDATE()
            ORDER BY v.fecha_venta DESC
        ");
        $ventas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($ventas);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

function detalleVentasSemanales() {
    global $conn;
    
    try {
        $stmt = $conn->query("
            SELECT 
                DATE(v.fecha_venta) as fecha,
                COUNT(*) as total_ventas_dia,
                SUM(v.total_venta) as ingresos_dia
            FROM ventas v 
            WHERE v.fecha_venta >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DATE(v.fecha_venta)
            ORDER BY fecha DESC
        ");
        $reporte = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($reporte);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}
?>