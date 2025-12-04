<?php
// Configurar cabeceras para JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Incluir la conexión a la base de datos
include __DIR__ . '/../config/conexion.php'; // AJUSTA ESTA RUTA

// Obtener la acción desde el parámetro GET
$action = $_GET['action'] ?? '';

// Manejar solicitudes OPTIONS para CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

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
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Acción no válida']);
        exit();
}

function crearProducto() {
    global $conn;
    
    // Obtener datos del POST
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    
    $nombre = $input['nombre'] ?? '';
    $precio = $input['precio'] ?? '';
    $cantidad = $input['cantidad'] ?? '';
    $proveedor = $input['proveedor'] ?? '';
    
    // Validar campos obligatorios
    if(empty(trim($nombre)) || empty($precio) || empty($cantidad)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
        return;
    }
    
    // Validar tipos de datos
    if (!is_numeric($precio) || floatval($precio) <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'El precio debe ser un número mayor a 0']);
        return;
    }
    
    if (!is_numeric($cantidad) || intval($cantidad) < 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'La cantidad debe ser un número válido']);
        return;
    }
    
    try {
        // Preparar y ejecutar la consulta
        $stmt = $conn->prepare("INSERT INTO productos (nombre, precio, cantidad, proveedor) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            trim($nombre),
            floatval($precio),
            intval($cantidad),
            trim($proveedor)
        ]);
        
        // Obtener el ID del nuevo producto
        $nuevoId = $conn->lastInsertId();
        
        echo json_encode([
            'success' => true, 
            'message' => 'Producto creado exitosamente',
            'id' => $nuevoId
        ]);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'Error al crear el producto: ' . $e->getMessage()
        ]);
    }
}

function listarProductos() {
    global $conn;
    
    try {
        // Consultar todos los productos
        $stmt = $conn->query("SELECT * FROM productos ORDER BY id DESC");
        $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Si no hay productos, devolver array vacío
        if (empty($productos)) {
            echo json_encode([]);
            return;
        }
        
        echo json_encode($productos);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'Error al listar productos: ' . $e->getMessage()
        ]);
    }
}

function actualizarProducto() {
    global $conn;
    
    // Obtener datos del POST
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    
    $id = $input['id'] ?? '';
    $nombre = $input['nombre'] ?? '';
    $precio = $input['precio'] ?? '';
    $cantidad = $input['cantidad'] ?? '';
    $proveedor = $input['proveedor'] ?? '';
    
    // Validar ID
    if(empty($id) || !is_numeric($id)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID de producto inválido']);
        return;
    }
    
    // Validar campos obligatorios
    if(empty(trim($nombre)) || empty($precio) || empty($cantidad)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
        return;
    }
    
    // Validar tipos de datos
    if (!is_numeric($precio) || floatval($precio) <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'El precio debe ser un número mayor a 0']);
        return;
    }
    
    if (!is_numeric($cantidad) || intval($cantidad) < 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'La cantidad debe ser un número válido']);
        return;
    }
    
    try {
        // Primero verificar si el producto existe
        $stmt = $conn->prepare("SELECT COUNT(*) as existe FROM productos WHERE id = ?");
        $stmt->execute([intval($id)]);
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($resultado['existe'] == 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Producto no encontrado']);
            return;
        }
        
        // Actualizar el producto
        $stmt = $conn->prepare("UPDATE productos SET nombre = ?, precio = ?, cantidad = ?, proveedor = ? WHERE id = ?");
        $stmt->execute([
            trim($nombre),
            floatval($precio),
            intval($cantidad),
            trim($proveedor),
            intval($id)
        ]);
        
        echo json_encode([
            'success' => true, 
            'message' => 'Producto actualizado exitosamente'
        ]);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'Error al actualizar el producto: ' . $e->getMessage()
        ]);
    }
}

function eliminarProducto() {
    global $conn;
    
    // Obtener ID del POST
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $id = $input['id'] ?? '';
    
    // Validar ID
    if(empty($id) || !is_numeric($id)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID de producto inválido']);
        return;
    }
    
    $id = intval($id);
    
    try {
        // Primero verificar si el producto existe
        $stmt = $conn->prepare("SELECT COUNT(*) as existe FROM productos WHERE id = ?");
        $stmt->execute([$id]);
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($resultado['existe'] == 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Producto no encontrado']);
            return;
        }
        
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
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'Error al eliminar el producto: ' . $e->getMessage()
        ]);
    }
}

function buscarProducto() {
    global $conn;
    
    // Obtener ID del GET
    $id = $_GET['id'] ?? '';
    
    // Validar ID
    if(empty($id) || !is_numeric($id)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID de producto inválido']);
        return;
    }
    
    $id = intval($id);
    
    try {
        // Buscar el producto por ID
        $stmt = $conn->prepare("SELECT * FROM productos WHERE id = ?");
        $stmt->execute([$id]);
        $producto = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$producto) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Producto no encontrado']);
            return;
        }
        
        echo json_encode($producto);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'Error al buscar el producto: ' . $e->getMessage()
        ]);
    }
}
?>