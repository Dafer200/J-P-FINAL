<?php
include 'conexion.php';

$action = $_GET['action'] ?? '';

switch($action) {
    case 'crear':
        crearProducto();
        break;
    case 'listar':
        listarProductos();
        break;
    case 'actualizar':
        actualizarProducto();
        break;
    case 'eliminar':
        eliminarProducto();
        break;
    case 'buscar':
        buscarProducto();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Acción no válida']);
}

function crearProducto() {
    global $conn;
    
    $nombre = $_POST['nombre'] ?? '';
    $precio = $_POST['precio'] ?? '';
    $cantidad = $_POST['cantidad'] ?? '';
    $proveedor = $_POST['proveedor'] ?? '';
    
    if(empty($nombre) || empty($precio) || empty($cantidad)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
        return;
    }
    
    try {
        $stmt = $conn->prepare("INSERT INTO productos (nombre, precio, cantidad, proveedor) VALUES (?, ?, ?, ?)");
        $stmt->execute([$nombre, $precio, $cantidad, $proveedor]);
        
        echo json_encode(['success' => true, 'message' => 'Producto creado exitosamente']);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

function listarProductos() {
    global $conn;
    
    try {
        $stmt = $conn->query("SELECT * FROM productos ORDER BY id DESC");
        $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($productos);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

function actualizarProducto() {
    global $conn;
    
    $id = $_POST['id'] ?? '';
    $nombre = $_POST['nombre'] ?? '';
    $precio = $_POST['precio'] ?? '';
    $cantidad = $_POST['cantidad'] ?? '';
    $proveedor = $_POST['proveedor'] ?? '';
    
    try {
        $stmt = $conn->prepare("UPDATE productos SET nombre = ?, precio = ?, cantidad = ?, proveedor = ? WHERE id = ?");
        $stmt->execute([$nombre, $precio, $cantidad, $proveedor, $id]);
        
        echo json_encode(['success' => true, 'message' => 'Producto actualizado exitosamente']);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

function eliminarProducto() {
    global $conn;
    
    $id = $_POST['id'] ?? '';
    
    try {
        // VERIFICAR SI EL PRODUCTO TIENE VENTAS REGISTRADAS
        $stmt = $conn->prepare("SELECT COUNT(*) as total_ventas FROM ventas WHERE producto_id = ?");
        $stmt->execute([$id]);
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($resultado['total_ventas'] > 0) {
            // Si tiene ventas, PRESERVAR LA INFORMACIÓN antes de eliminar
            
            // 1. Guardar información del producto en las ventas
            $stmt = $conn->prepare("
                UPDATE ventas v 
                JOIN productos p ON v.producto_id = p.id 
                SET v.producto_nombre = p.nombre, v.precio_unitario = p.precio 
                WHERE v.producto_id = ? AND v.producto_nombre IS NULL
            ");
            $stmt->execute([$id]);
            
            // 2. Ahora eliminar el producto (las ventas se mantienen con SET NULL)
            $stmt = $conn->prepare("DELETE FROM productos WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode([
                'success' => true, 
                'message' => 'Producto eliminado. Las ventas se han preservado con la información del producto.',
                'tipo' => 'eliminado_con_ventas'
            ]);
        } else {
            // Si no tiene ventas, eliminar normalmente
            $stmt = $conn->prepare("DELETE FROM productos WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode([
                'success' => true, 
                'message' => 'Producto eliminado exitosamente',
                'tipo' => 'eliminado'
            ]);
        }
        
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

function buscarProducto() {
    global $conn;
    
    $id = $_GET['id'] ?? '';
    
    try {
        $stmt = $conn->prepare("SELECT * FROM productos WHERE id = ?");
        $stmt->execute([$id]);
        $producto = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode($producto ?: ['success' => false, 'message' => 'Producto no encontrado']);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}
?>