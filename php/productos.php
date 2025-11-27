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
        $stmt = $conn->prepare("DELETE FROM productos WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['success' => true, 'message' => 'Producto eliminado exitosamente']);
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