/* Sistema de Tienda - Conectado a MySQL */
document.addEventListener('DOMContentLoaded', () => {
    console.log("Sistema de Tienda inicializado - Conectado a MySQL");
    cargarProductos();
    mostrarSeccion('admin');
});

// Mostrar/ocultar secciones
function mostrarSeccion(seccion) {
    document.querySelectorAll('.seccion').forEach(sec => {
        sec.style.display = 'none';
    });
    document.getElementById(seccion).style.display = 'block';

    if (seccion === 'admin') {
        cargarProductos();
    } else if (seccion === 'cliente') {
        cargarCatalogoCliente();
    }
}

// HU1 - Registrar Producto
function registrarProducto() {
    const nombre = document.getElementById('nombre').value;
    const precio = document.getElementById('precio').value;
    const cantidad = document.getElementById('cantidad').value;
    const proveedor = document.getElementById('proveedor').value;

    if (!nombre || !precio || !cantidad) {
        alert('❌ Por favor complete todos los campos obligatorios');
        return;
    }

    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('precio', precio);
    formData.append('cantidad', cantidad);
    formData.append('proveedor', proveedor);

    fetch('php/productos.php?action=crear', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('✅ Producto registrado exitosamente');
                document.getElementById('formProducto').reset();
                cargarProductos();
            } else {
                alert('❌ Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('❌ Error al registrar el producto');
        });
}

// HU3 - Cargar Listado de Productos
function cargarProductos() {
    fetch('php/productos.php?action=listar')
        .then(response => response.json())
        .then(data => {
            const tabla = document.getElementById('tablaProductos');
            tabla.innerHTML = '';

            if (data.success === false) {
                tabla.innerHTML = '<tr><td colspan="6">❌ Error: ' + data.message + '</td></tr>';
                return;
            }

            if (data.length === 0) {
                tabla.innerHTML = '<tr><td colspan="6">📭 No hay productos registrados</td></tr>';
                return;
            }

            data.forEach(producto => {
                const fila = `<tr>
                <td>${producto.id}</td>
                <td>${producto.nombre}</td>
                <td>$${parseFloat(producto.precio).toFixed(2)}</td>
                <td>${producto.cantidad}</td>
                <td>${producto.proveedor || 'N/A'}</td>
                <td>
                    <button class="btn" onclick="editarProducto(${producto.id})">✏️ Editar</button>
                    <button class="btn-comprar" onclick="eliminarProducto(${producto.id})">🗑️ Eliminar</button>
                </td>
            </tr>`;
                tabla.innerHTML += fila;
            });
        })
        .catch(error => {
            console.error('Error:', error);
            const tabla = document.getElementById('tablaProductos');
            tabla.innerHTML = '<tr><td colspan="6">❌ Error al cargar productos: ' + error.message + '</td></tr>';
        });
}

// HU2 - Editar Producto
function editarProducto(id) {
    fetch(`php/productos.php?action=buscar&id=${id}`)
        .then(response => response.json())
        .then(producto => {
            if (producto.success === false) {
                alert('❌ ' + producto.message);
                return;
            }

            const nuevoNombre = prompt('Nuevo nombre:', producto.nombre);
            const nuevoPrecio = prompt('Nuevo precio:', producto.precio);
            const nuevaCantidad = prompt('Nueva cantidad:', producto.cantidad);
            const nuevoProveedor = prompt('Nuevo proveedor:', producto.proveedor || '');

            if (nuevoNombre && nuevoPrecio && nuevaCantidad !== null) {
                const formData = new FormData();
                formData.append('id', id);
                formData.append('nombre', nuevoNombre);
                formData.append('precio', nuevoPrecio);
                formData.append('cantidad', nuevaCantidad);
                formData.append('proveedor', nuevoProveedor);

                fetch('php/productos.php?action=actualizar', {
                    method: 'POST',
                    body: formData
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert('✅ Producto actualizado exitosamente');
                            cargarProductos();
                        } else {
                            alert('❌ Error: ' + data.message);
                        }
                    });
            }
        });
}

// HU4 - Eliminar Producto
function eliminarProducto(id) {
    if (confirm('⚠️ ¿Está seguro de que desea eliminar este producto?')) {
        const formData = new FormData();
        formData.append('id', id);

        fetch('php/productos.php?action=eliminar', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('✅ Producto eliminado exitosamente');
                    cargarProductos();
                } else {
                    alert('❌ Error: ' + data.message);
                }
            });
    }
}

// HU6 - Cargar Catálogo para Clientes
function cargarCatalogoCliente() {
    fetch('php/productos.php?action=listar')
        .then(response => response.json())
        .then(data => {
            const catalogo = document.getElementById('catalogoCliente');
            catalogo.innerHTML = '<h3>🛍️ Productos Disponibles</h3>';

            if (data.success === false) {
                catalogo.innerHTML += '<p>❌ Error: ' + data.message + '</p>';
                return;
            }

            if (data.length === 0) {
                catalogo.innerHTML += '<p>📭 No hay productos disponibles</p>';
                return;
            }

            data.forEach(producto => {
                const productoHTML = `
                <div class="producto-cliente">
                    <h4>${producto.nombre}</h4>
                    <p>💰 Precio: $${parseFloat(producto.precio).toFixed(2)}</p>
                    <p>📦 Disponible: ${producto.cantidad} unidades</p>
                    <p>🏢 Proveedor: ${producto.proveedor || 'N/A'}</p>
                    <button class="btn-comprar" onclick="comprarProducto(${producto.id}, '${producto.nombre}')">🛒 Comprar</button>
                </div>
            `;
                catalogo.innerHTML += productoHTML;
            });
        });
}

// HU7 - Comprar Producto
function comprarProducto(id, nombre) {
    const cantidad = parseInt(prompt(`¿Cuántas unidades de "${nombre}" desea comprar?`));

    if (cantidad && cantidad > 0) {
        const formData = new FormData();
        formData.append('producto_id', id);
        formData.append('cantidad_vendida', cantidad);

        fetch('php/ventas.php?action=crear', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(`✅ Compra realizada: ${cantidad} unidades de ${nombre}\nTotal: $${data.total}`);
                    cargarCatalogoCliente(); // Recargar para ver stock actualizado
                } else {
                    alert('❌ Error: ' + data.message);
                }
            });
    }
}

// HU5 - Reportes
function generarReporteDiario() {
    fetch('php/ventas.php?action=reporte_diario')
        .then(response => response.json())
        .then(data => {
            const resultado = document.getElementById('resultadoReportes');
            resultado.innerHTML = `
            <h3>📊 Reporte Diario - ${data.fecha || 'Hoy'}</h3>
            <p>🛍️ Total Ventas: ${data.total_ventas || 0}</p>
            <p>💰 Ingresos Totales: $${(data.ingresos_totales || 0).toFixed(2)}</p>
        `;
        });
}

function generarReporteSemanal() {
    fetch('php/ventas.php?action=reporte_semanal')
        .then(response => response.json())
        .then(data => {
            const resultado = document.getElementById('resultadoReportes');
            let html = '<h3>📈 Reporte Semanal</h3>';

            if (data.length === 0) {
                html += '<p>📭 No hay ventas en la última semana</p>';
            } else {
                data.forEach(dia => {
                    html += `
                    <div class="reporte-dia">
                        <p><strong>${dia.fecha}</strong>: ${dia.total_ventas} ventas - $${dia.ingresos_totales}</p>
                    </div>
                `;
                });
            }

            resultado.innerHTML = html;
        });
}