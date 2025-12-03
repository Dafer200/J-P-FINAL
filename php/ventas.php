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
    case 'detalle_diario':
        detalleVentasDiarias();
        break;
    case 'detalle_semanal':
        detalleVentasSemanales();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Acción no válida']);
}

// FUNCIÓN PRINCIPAL PARA CREAR VENTAS - ESTA ES LA QUE FALTABA
function crearVenta() {
    global $conn;
    
    $producto_id = $_POST['producto_id'] ?? '';
    $cantidad_vendida = $_POST['cantidad_vendida'] ?? '';
    
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
        
        // Registrar la venta PRESERVANDO la información del producto
        $stmt = $conn->prepare("
            INSERT INTO ventas (producto_id, cantidad_vendida, total_venta, producto_nombre, precio_unitario) 
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $producto_id, 
            $cantidad_vendida, 
            $total_venta,
            $producto['nombre'],  // Preservar nombre
            $producto['precio']   // Preservar precio
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

// NUEVA FUNCIÓN: Detalle de ventas diarias
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


// NUEVA FUNCIÓN: Detalle de ventas semanales por día
function detalleVentasSemanales() {
    global $conn;
    
    try {
        $stmt = $conn->query("
            SELECT 
                DATE(v.fecha_venta) as fecha,
                COUNT(*) as total_ventas_dia,
                SUM(v.total_venta) as ingresos_dia,
                GROUP_CONCAT(
                    CONCAT(
                        COALESCE(p.nombre, v.producto_nombre, 'Producto Eliminado'), 
                        ' (', v.cantidad_vendida, ' unidades - $', 
                        FORMAT(v.total_venta, 2), ')'
                    ) SEPARATOR ' | '
                ) as detalle_ventas
            FROM ventas v 
            LEFT JOIN productos p ON v.producto_id = p.id 
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