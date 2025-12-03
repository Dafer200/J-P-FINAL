/* Sistema de Tienda - Diseño Moderno */
document.addEventListener('DOMContentLoaded', () => {
    console.log("Sistema de Tienda inicializado - Diseño Moderno");
    cargarProductos();
    mostrarSeccion('admin');
});

// Mostrar/ocultar secciones con animación
function mostrarSeccion(seccion) {
    // Ocultar todas las secciones
    document.querySelectorAll('.seccion').forEach(sec => {
        sec.style.display = 'none';
    });

    // Mostrar la sección seleccionada
    const seccionActiva = document.getElementById(seccion);
    seccionActiva.style.display = 'block';

    // Cargar datos según la sección
    if (seccion === 'admin') {
        cargarProductos();
    } else if (seccion === 'cliente') {
        cargarCatalogoCliente();
    } else if (seccion === 'reportes') {
        document.getElementById('resultadoReportes').innerHTML = '';
    }
}

// Estados de carga
function mostrarLoading(elementoId) {
    const elemento = document.getElementById(elementoId);
    if (elemento) {
        elemento.classList.add('loading');
    }
}

function ocultarLoading(elementoId) {
    const elemento = document.getElementById(elementoId);
    if (elemento) {
        elemento.classList.remove('loading');
    }
}

// HU1 - Registrar Producto
function registrarProducto() {
    const nombre = document.getElementById('nombre').value.trim();
    const precio = document.getElementById('precio').value;
    const cantidad = document.getElementById('cantidad').value;
    const proveedor = document.getElementById('proveedor').value.trim();

    // Validaciones
    if (!nombre || !precio || !cantidad) {
        mostrarAlerta('❌ Por favor complete todos los campos obligatorios', 'error');
        return;
    }

    if (precio <= 0 || cantidad <= 0) {
        mostrarAlerta('❌ El precio y la cantidad deben ser mayores a 0', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('precio', parseFloat(precio).toFixed(2));
    formData.append('cantidad', parseInt(cantidad));
    formData.append('proveedor', proveedor);

    mostrarLoading('formProducto');

    fetch('php/productos.php?action=crear', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarAlerta('✅ Producto registrado exitosamente', 'success');
                document.getElementById('formProducto').reset();
                cargarProductos();
            } else {
                mostrarAlerta('❌ Error: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarAlerta('❌ Error al registrar el producto', 'error');
        })
        .finally(() => {
            ocultarLoading('formProducto');
        });
}

// HU3 - Cargar Listado de Productos
function cargarProductos() {
    mostrarLoading('tablaProductos');

    fetch('php/productos.php?action=listar')
        .then(response => response.json())
        .then(data => {
            const tabla = document.getElementById('tablaProductos');
            tabla.innerHTML = '';

            if (data.success === false) {
                tabla.innerHTML = `
                <tr>
                    <td colspan="6" class="alert alert-error">
                        ❌ Error: ${data.message}
                    </td>
                </tr>
            `;
                return;
            }

            if (data.length === 0) {
                tabla.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: #64748b;">
                        📭 No hay productos registrados
                    </td>
                </tr>
            `;
                return;
            }

            data.forEach(producto => {
                const precio = parseFloat(producto.precio) || 0;
                const cantidad = parseInt(producto.cantidad) || 0;

                const fila = `
                <tr>
                    <td><strong>#${producto.id}</strong></td>
                    <td>${producto.nombre}</td>
                    <td><span class="precio">$${precio.toFixed(2)}</span></td>
                    <td>
                        <span class="badge ${cantidad > 10 ? 'badge-success' : cantidad > 0 ? 'badge-warning' : 'badge-danger'}">
                            ${cantidad} unidades
                        </span>
                    </td>
                    <td>${producto.proveedor || '<em style="color: #94a3b8;">No especificado</em>'}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-secondary" onclick="editarProducto(${producto.id})">
                                ✏️ Editar
                            </button>
                            <button class="btn btn-danger" onclick="eliminarProducto(${producto.id})">
                                🗑️ Eliminar
                            </button>
                        </div>
                    </td>
                </tr>
            `;
                tabla.innerHTML += fila;
            });
        })
        .catch(error => {
            console.error('Error:', error);
            const tabla = document.getElementById('tablaProductos');
            tabla.innerHTML = `
            <tr>
                <td colspan="6" class="alert alert-error">
                    ❌ Error al cargar productos: ${error.message}
                </td>
            </tr>
        `;
        })
        .finally(() => {
            ocultarLoading('tablaProductos');
        });
}

// HU2 - Editar Producto
function editarProducto(id) {
    mostrarLoading('tablaProductos');

    fetch(`php/productos.php?action=buscar&id=${id}`)
        .then(response => response.json())
        .then(producto => {
            if (producto.success === false) {
                mostrarAlerta('❌ ' + producto.message, 'error');
                return;
            }

            const nuevoNombre = prompt('Nuevo nombre del producto:', producto.nombre);
            if (nuevoNombre === null) return;

            const nuevoPrecio = prompt('Nuevo precio:', producto.precio);
            if (nuevoPrecio === null) return;

            const nuevaCantidad = prompt('Nueva cantidad en stock:', producto.cantidad);
            if (nuevaCantidad === null) return;

            const nuevoProveedor = prompt('Nuevo proveedor:', producto.proveedor || '');

            // Validaciones
            if (!nuevoNombre || !nuevoPrecio || !nuevaCantidad) {
                mostrarAlerta('❌ Todos los campos son obligatorios', 'error');
                return;
            }

            const precioNum = parseFloat(nuevoPrecio);
            const cantidadNum = parseInt(nuevaCantidad);

            if (precioNum <= 0 || cantidadNum < 0) {
                mostrarAlerta('❌ El precio debe ser mayor a 0 y la cantidad no puede ser negativa', 'error');
                return;
            }

            const formData = new FormData();
            formData.append('id', id);
            formData.append('nombre', nuevoNombre);
            formData.append('precio', precioNum.toFixed(2));
            formData.append('cantidad', cantidadNum);
            formData.append('proveedor', nuevoProveedor);

            fetch('php/productos.php?action=actualizar', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        mostrarAlerta('✅ Producto actualizado exitosamente', 'success');
                        cargarProductos();
                    } else {
                        mostrarAlerta('❌ Error: ' + data.message, 'error');
                    }
                });

        })
        .catch(error => {
            console.error('Error:', error);
            mostrarAlerta('❌ Error al cargar información del producto', 'error');
        })
        .finally(() => {
            ocultarLoading('tablaProductos');
        });
}

// HU4 - Eliminar Producto
function eliminarProducto(id) {
    if (!confirm('⚠️ ¿Está seguro de que desea eliminar este producto?\n\nSi el producto tiene ventas registradas, la información se preservará en el historial.')) {
        return;
    }

    const formData = new FormData();
    formData.append('id', id);

    fetch('php/productos.php?action=eliminar', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (data.tipo === 'eliminado_con_ventas') {
                    mostrarAlerta('✅ Producto eliminado. El historial de ventas se ha preservado.', 'success');
                } else {
                    mostrarAlerta('✅ Producto eliminado exitosamente', 'success');
                }
                cargarProductos();
            } else {
                mostrarAlerta('❌ Error: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarAlerta('❌ Error al eliminar el producto', 'error');
        });
}

// HU6 - Cargar Catálogo para Clientes
function cargarCatalogoCliente() {
    mostrarLoading('catalogoCliente');

    fetch('php/productos.php?action=listar')
        .then(response => response.json())
        .then(data => {
            const catalogo = document.getElementById('catalogoCliente');

            if (data.success === false) {
                catalogo.innerHTML = `
                <div class="alert alert-error">
                    ❌ Error: ${data.message}
                </div>
            `;
                return;
            }

            if (data.length === 0) {
                catalogo.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #64748b;">
                    <h3>📭 No hay productos disponibles</h3>
                    <p>Vuelve más tarde o contacta al administrador</p>
                </div>
            `;
                return;
            }

            catalogo.innerHTML = '<h3 style="margin-bottom: 1.5rem;">🛍️ Productos Disponibles</h3>';

            data.forEach(producto => {
                const precio = parseFloat(producto.precio) || 0;
                const cantidad = parseInt(producto.cantidad) || 0;
                const disponible = cantidad > 0;
                const stockBajo = cantidad > 0 && cantidad <= 5;

                const productoHTML = `
                <div class="producto-cliente">
                    <h4>${producto.nombre}</h4>
                    <div class="precio">$${precio.toFixed(2)}</div>
                    <p><strong>Stock:</strong> 
                        <span class="badge ${cantidad > 10 ? 'badge-success' : cantidad > 0 ? 'badge-warning' : 'badge-danger'}">
                            ${cantidad} unidades
                        </span>
                    </p>
                    <p><strong>Proveedor:</strong> ${producto.proveedor || 'No especificado'}</p>
                    <div style="margin-top: 1.5rem;">
                        ${disponible ?
                        `<button class="btn" onclick="comprarProducto(${producto.id}, '${producto.nombre.replace(/'/g, "\\'")}', ${precio}, ${cantidad})">
                                🛒 Comprar
                            </button>` :
                        `<button class="btn btn-secondary" disabled>
                                ❌ Agotado
                            </button>`
                    }
                        ${stockBajo && disponible ?
                        `<div style="margin-top: 0.5rem; font-size: 0.875rem; color: #f59e0b;">
                                ⚠️ Stock bajo
                            </div>` : ''
                    }
                    </div>
                </div>
            `;
                catalogo.innerHTML += productoHTML;
            });
        })
        .catch(error => {
            console.error('Error:', error);
            const catalogo = document.getElementById('catalogoCliente');
            catalogo.innerHTML = `
            <div class="alert alert-error">
                ❌ Error al cargar el catálogo: ${error.message}
            </div>
        `;
        })
        .finally(() => {
            ocultarLoading('catalogoCliente');
        });
}

// HU7 - Comprar Producto
function comprarProducto(id, nombre, precio, stockDisponible) {
    // Asegurar que los parámetros sean números
    const precioNum = parseFloat(precio);
    const stockNum = parseInt(stockDisponible);
    const maxCantidad = Math.min(stockNum, 50);

    const cantidad = prompt(
        `🛒 Comprar: ${nombre}\n\n` +
        `Precio: $${precioNum.toFixed(2)}\n` +
        `Stock disponible: ${stockNum} unidades\n\n` +
        `¿Cuántas unidades desea comprar? (máximo ${maxCantidad})`,
        "1"
    );

    if (!cantidad) return;

    const cantidadNum = parseInt(cantidad);

    // Validaciones
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
        mostrarAlerta('❌ Por favor ingrese una cantidad válida', 'error');
        return;
    }

    if (cantidadNum > stockNum) {
        mostrarAlerta(`❌ No hay suficiente stock. Solo quedan ${stockNum} unidades`, 'error');
        return;
    }

    if (cantidadNum > maxCantidad) {
        mostrarAlerta(`❌ La cantidad máxima permitida es ${maxCantidad} unidades`, 'error');
        return;
    }

    const total = precioNum * cantidadNum;

    if (!confirm(`¿Confirmar compra?\n\n` +
        `Producto: ${nombre}\n` +
        `Cantidad: ${cantidadNum} unidades\n` +
        `Total: $${total.toFixed(2)}`)) {
        return;
    }

    const formData = new FormData();
    formData.append('producto_id', id);
    formData.append('cantidad_vendida', cantidadNum);

    fetch('php/ventas.php?action=crear', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const totalCompra = parseFloat(data.total) || total;
                mostrarAlerta(
                    `✅ Compra realizada exitosamente\n\n` +
                    `Producto: ${nombre}\n` +
                    `Cantidad: ${cantidadNum} unidades\n` +
                    `Total: $${totalCompra.toFixed(2)}`,
                    'success'
                );
                cargarCatalogoCliente();
            } else {
                mostrarAlerta('❌ Error: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarAlerta('❌ Error al procesar la compra', 'error');
        });
}

// HU5 - Reportes (VERSIÓN CORREGIDA)
function generarReporteDiario() {
    mostrarLoading('resultadoReportes');

    // Obtener tanto el resumen como el detalle
    Promise.all([
        fetch('php/ventas.php?action=reporte_diario').then(r => r.json()),
        fetch('php/ventas.php?action=detalle_diario').then(r => r.json())
    ])
        .then(([resumen, detalle]) => {
            const resultado = document.getElementById('resultadoReportes');

            const fecha = resumen.fecha || new Date().toISOString().split('T')[0];
            const totalVentas = parseInt(resumen.total_ventas) || 0;
            const ingresos = parseFloat(resumen.ingresos_totales) || 0;

            let html = `
            <div class="reporte-dia">
                <h3>📊 Reporte Diario - ${fecha}</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
                    <div style="text-align: center; padding: 1rem; background: #f0f9ff; border-radius: 8px;">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🛍️</div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: #0369a1;">${totalVentas}</div>
                        <div style="color: #64748b;">Total Ventas</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: #f0fdf4; border-radius: 8px;">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">💰</div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: #059669;">$${ingresos.toFixed(2)}</div>
                        <div style="color: #64748b;">Ingresos Totales</div>
                    </div>
                </div>
        `;

            // Mostrar detalle de ventas
            if (Array.isArray(detalle) && detalle.length > 0) {
                html += `
                <div style="margin-top: 2rem;">
                    <h4 style="color: #1e293b; margin-bottom: 1rem;">📋 Detalle de Ventas del Día</h4>
                    <div style="background: white; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden;">
            `;

                detalle.forEach(venta => {
                    const totalVenta = parseFloat(venta.total_venta) || 0;
                    const cantidad = parseInt(venta.cantidad_vendida) || 0;
                    const precioUnitario = parseFloat(venta.precio_unitario) || 0;
                    const fechaHora = new Date(venta.fecha_venta).toLocaleString();

                    html += `
                    <div style="padding: 1rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: between; align-items: center;">
                        <div style="flex: 1;">
                            <div style="font-weight: bold; color: #1e293b;">${venta.producto_nombre}</div>
                            <div style="color: #64748b; font-size: 0.875rem;">
                                ${cantidad} unidades × $${precioUnitario.toFixed(2)} c/u
                            </div>
                            <div style="color: #64748b; font-size: 0.75rem;">${fechaHora}</div>
                        </div>
                        <div style="font-weight: bold; color: #059669; font-size: 1.125rem;">
                            $${totalVenta.toFixed(2)}
                        </div>
                    </div>
                `;
                });

                html += `</div></div>`;
            } else {
                html += `
                <div style="text-align: center; padding: 2rem; color: #64748b;">
                    <p>No hay ventas registradas hoy</p>
                </div>
            `;
            }

            html += `</div>`;
            resultado.innerHTML = html;
        })
        .catch(error => {
            console.error('Error:', error);
            const resultado = document.getElementById('resultadoReportes');
            resultado.innerHTML = `
            <div class="alert alert-error">
                ❌ Error al generar el reporte: ${error.message}
            </div>
        `;
        })
        .finally(() => {
            ocultarLoading('resultadoReportes');
        });
}

function generarReporteSemanal() {
    mostrarLoading('resultadoReportes');

    // Obtener tanto el resumen como el detalle semanal
    Promise.all([
        fetch('php/ventas.php?action=reporte_semanal').then(r => r.json()),
        fetch('php/ventas.php?action=detalle_semanal').then(r => r.json())
    ])
        .then(([resumenSemanal, detalleSemanal]) => {
            const resultado = document.getElementById('resultadoReportes');

            if (!Array.isArray(resumenSemanal) || !Array.isArray(detalleSemanal)) {
                resultado.innerHTML = `
                <div class="alert alert-error">
                    ❌ Error: Los datos del reporte no son válidos
                </div>
            `;
                return;
            }

            if (resumenSemanal.length === 0) {
                resultado.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #64748b;">
                    <h3>📭 No hay ventas en la última semana</h3>
                    <p>Los reportes semanales aparecerán aquí cuando haya ventas registradas</p>
                </div>
            `;
                return;
            }

            let html = '<h3>📈 Reporte Semanal</h3>';
            let totalGeneral = 0;
            let ventasGenerales = 0;

            // Combinar resumen con detalles
            resumenSemanal.forEach(diaResumen => {
                const diaDetalle = detalleSemanal.find(d => d.fecha === diaResumen.fecha);
                const ingresosDia = parseFloat(diaResumen.ingresos_totales) || 0;
                const ventasDia = parseInt(diaResumen.total_ventas) || 0;

                totalGeneral += ingresosDia;
                ventasGenerales += ventasDia;

                html += `
                <div class="reporte-dia">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                        <div>
                            <strong style="color: #1e293b; font-size: 1.125rem;">${diaResumen.fecha}</strong>
                            <div style="margin-top: 0.5rem;">
                                <span class="badge badge-success" style="margin-right: 0.5rem;">${ventasDia} ventas</span>
                                <strong style="color: #059669; font-size: 1.25rem;">$${ingresosDia.toFixed(2)}</strong>
                            </div>
                        </div>
                    </div>
            `;

                // Mostrar detalles del día si existen
                if (diaDetalle && diaDetalle.detalle_ventas) {
                    const ventasArray = diaDetalle.detalle_ventas.split(' | ');
                    html += `<div style="background: #f8fafc; padding: 1rem; border-radius: 6px; margin-top: 0.5rem;">`;
                    html += `<div style="font-size: 0.875rem; color: #475569; margin-bottom: 0.5rem;"><strong>Productos vendidos:</strong></div>`;

                    ventasArray.forEach(venta => {
                        html += `<div style="font-size: 0.875rem; color: #64748b; padding: 0.25rem 0;">• ${venta}</div>`;
                    });

                    html += `</div>`;
                }

                html += `</div>`;
            });

            // Resumen general
            html += `
            <div style="margin-top: 2rem; padding: 1.5rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px;">
                <h4 style="margin-bottom: 1rem; color: white;">📋 Resumen Semanal</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <div style="font-size: 2rem; font-weight: bold;">${ventasGenerales}</div>
                        <div>Total Ventas</div>
                    </div>
                    <div>
                        <div style="font-size: 2rem; font-weight: bold;">$${totalGeneral.toFixed(2)}</div>
                        <div>Ingresos Totales</div>
                    </div>
                </div>
            </div>
        `;

            resultado.innerHTML = html;
        })
        .catch(error => {
            console.error('Error:', error);
            const resultado = document.getElementById('resultadoReportes');
            resultado.innerHTML = `
            <div class="alert alert-error">
                ❌ Error al generar el reporte semanal: ${error.message}
            </div>
        `;
        })
        .finally(() => {
            ocultarLoading('resultadoReportes');
        });
}

// Utilidad para mostrar alertas
function mostrarAlerta(mensaje, tipo = 'info') {
    // Remover alerta anterior si existe
    const alertaAnterior = document.querySelector('.alert-flotante');
    if (alertaAnterior) {
        alertaAnterior.remove();
    }

    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-flotante`;
    alerta.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
        max-width: 500px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        border-radius: 12px;
        padding: 1rem 1.5rem;
        animation: slideIn 0.3s ease-out;
    `;

    alerta.innerHTML = mensaje.split('\n').join('<br>');

    document.body.appendChild(alerta);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (alerta.parentNode) {
            alerta.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => alerta.remove(), 300);
        }
    }, 5000);
}

// Agregar estilos CSS para las animaciones de alerta
const estiloAlertas = document.createElement('style');
estiloAlertas.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(estiloAlertas);

// Mejora: Validación en tiempo real para formularios
document.addEventListener('DOMContentLoaded', function () {
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', function () {
            if (this.value < 0) {
                this.value = 0;
            }
        });
    });
});