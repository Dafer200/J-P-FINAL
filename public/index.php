<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset='utf-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <title>Tienda de rosa</title>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <!-- CSS -->
    <link rel="stylesheet" href="../frontend/assets/css/main.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>🏪 Gestión de Inventario y ventas</h1>
            <nav>
                <button onclick="mostrarSeccion('admin')">🧑‍💼 Administración</button>
                <button onclick="mostrarSeccion('cliente')">🛒 Vista Cliente</button>
                <button onclick="mostrarSeccion('reportes')">📊 Reportes</button>
            </nav>
        </header>

         <!-- Sección Administrador -->
        <section id="admin" class="seccion">
            <h2>Panel de Administración</h2>

            <!-- HU1: Registrar Productos -->
            <div class="form-container">
                <h3>➕ Registrar Nuevo Producto</h3>
                <br>
                <form id="formProducto">
                    <div class="form-group">
                        <label>Nombre del Producto:</label>
                        <input type="text" id="nombre" name="nombre" required>
                    </div>
                    <div class="form-group">
                        <label>Precio:</label>
                        <input type="number" id="precio" name="precio" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label>Cantidad:</label>
                        <input type="number" id="cantidad" name="cantidad" required>
                    </div>
                    <div class="form-group">
                        <label>Proveedor:</label>
                        <input type="text" id="proveedor" name="proveedor">
                    </div>
                    <button type="button" class="btn" onclick="registrarProducto()">✅ Registrar Producto</button>
                </form>
            </div>

            <!-- HU3: Listar Productos -->
            <div class="list-container">
                <h3>📦 Inventario de Productos</h3>
                <table class="tabla-productos">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Precio</th>
                            <th>Cantidad</th>
                            <th>Proveedor</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="tablaProductos">
                        <!-- Los productos se cargan dinámicamente aquí -->
                        <tr>
                            <td colspan="6" style="text-align: center; padding: 20px; color: #666;">
                                Cargando productos...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <!-- Sección Cliente -->
        <section id="cliente" class="seccion">
            <h2>🛒 Productos</h2>
            <div id="catalogoCliente" style="padding: 20px; text-align: center; color: #666;">
                Cargando catálogo...
            </div>
        </section>

        <!-- Sección Reportes -->
        <section id="reportes" class="seccion">
            <h2>📊 Reportes de Ventas</h2>
            <div id="contenedorReportes" style="background: #f8fafc; padding: 20px; border-radius: 8px;">
                <button class="btn" onclick="generarReporteDiario()">📅 Reporte Diario</button>
                <button class="btn" onclick="generarReporteSemanal()">📆 Reporte Semanal</button>
                <div id="resultadoReportes" style="margin-top: 20px; padding: 15px; background: white; border-radius: 6px;">
                    Los reportes aparecerán aquí
                </div>
            </div>
        </section>
    </div>
        
    </div>

    <!-- JavaScript CORREGIDO -->
    <script src="../frontend/assets/js/main.js"></script>
</body>
</html>



