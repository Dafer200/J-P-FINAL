/* Sistema de Tienda - Diseño Moderno */
const BASE_URL = '/J-P-FINAL - copia/backend/api/'; // ¡RUTA EXACTA!

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

    // RUTA CORREGIDA
    fetch(BASE_URL + 'productos.php?action=crear', {
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
    const tabla = document.getElementById('tablaProductos');

    // Mostrar estado de carga
    tabla.innerHTML = `
        <tr>
            <td colspan="6" style="text-align: center; padding: 2rem; color: #64748b;">
                🔄 Cargando productos...
            </td>
        </tr>
    `;

    // RUTA CORREGIDA
    fetch(BASE_URL + 'productos.php?action=listar')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error HTTP: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            tabla.innerHTML = '';

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
            tabla.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: #ef4444;">
                    ❌ Error: ${error.message}
                    <br>
                    <small>Verifica que el servidor esté funcionando</small>
                </td>
            </tr>
        `;
        });
}

// HU2 - Editar Producto
function editarProducto(id) {
    // RUTA CORREGIDA
    fetch(BASE_URL + `productos.php?action=buscar&id=${id}`)
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

            // RUTA CORREGIDA
            fetch(BASE_URL + 'productos.php?action=actualizar', {
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
        });
}

// HU4 - Eliminar Producto
function eliminarProducto(id) {
    if (!confirm('⚠️ ¿Está seguro de que desea eliminar este producto?\n\nSi el producto tiene ventas registradas, la información se preservará en el historial.')) {
        return;
    }

    const formData = new FormData();
    formData.append('id', id);

    // RUTA CORREGIDA
    fetch(BASE_URL + 'productos.php?action=eliminar', {
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
    const catalogo = document.getElementById('catalogoCliente');

    catalogo.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #64748b;">
            🔄 Cargando catálogo...
        </div>
    `;

    // RUTA CORREGIDA
    fetch(BASE_URL + 'productos.php?action=listar')
        .then(response => response.json())
        .then(data => {
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

            // Crear contenedor grid para productos
            catalogo.innerHTML += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; margin-top: 1.5rem;">';

            data.forEach(producto => {
                const precio = parseFloat(producto.precio) || 0;
                const cantidad = parseInt(producto.cantidad) || 0;
                const disponible = cantidad > 0;

                catalogo.innerHTML += `
                <div style="background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <h4 style="margin-bottom: 0.5rem; color: #1e293b;">${producto.nombre}</h4>
                    <div style="font-size: 1.5rem; font-weight: bold; color: #059669; margin: 0.5rem 0;">$${precio.toFixed(2)}</div>
                    <p><strong>Stock:</strong> 
                        <span style="
                            display: inline-block;
                            padding: 2px 8px;
                            border-radius: 12px;
                            font-size: 0.875rem;
                            background: ${cantidad > 10 ? '#10b981' : cantidad > 0 ? '#f59e0b' : '#ef4444'};
                            color: white;
                        ">
                            ${cantidad} unidades
                        </span>
                    </p>
                    <p><strong>Proveedor:</strong> ${producto.proveedor || 'No especificado'}</p>
                    <div style="margin-top: 1.5rem;">
                        ${disponible ?
                        `<button onclick="comprarProducto(${producto.id}, '${producto.nombre.replace(/'/g, "\\'")}', ${precio}, ${cantidad})" style="
                            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 600;
                            width: 100%;
                        ">
                            🛒 Comprar
                        </button>` :
                        `<button style="
                            background: #94a3b8;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 8px;
                            width: 100%;
                            cursor: not-allowed;
                        " disabled>
                            ❌ Agotado
                        </button>`}
                    </div>
                </div>
            `;
            });

            catalogo.innerHTML += '</div>';
        })
        .catch(error => {
            console.error('Error:', error);
            catalogo.innerHTML = `
            <div style="background: #fee2e2; color: #991b1b; padding: 1.5rem; border-radius: 8px;">
                ❌ Error al cargar el catálogo: ${error.message}
            </div>
        `;
        });
}

// HU7 - Comprar Producto
// HU7 - Comprar Producto (VERSIÓN CORREGIDA)
function comprarProducto(id, nombre, precio, stockDisponible) {
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

    // Crear FormData CORRECTAMENTE
    const formData = new FormData();
    formData.append('producto_id', id.toString()); // Asegurar que sea string
    formData.append('cantidad_vendida', cantidadNum.toString());

    console.log('Enviando venta:', {
        producto_id: id,
        cantidad_vendida: cantidadNum,
        nombre: nombre,
        precio: precioNum
    });

    // RUTA CORREGIDA
    fetch(BASE_URL + 'ventas.php?action=crear', {
        method: 'POST',
        body: formData,
        headers: {
            // Añadir este header para FormData
            'Accept': 'application/json'
        }
    })
        .then(response => {
            console.log('Respuesta HTTP:', response.status);
            return response.text().then(text => {
                console.log('Respuesta cruda:', text);
                try {
                    return JSON.parse(text);
                } catch (e) {
                    console.error('Error parseando JSON:', e);
                    throw new Error('Respuesta no es JSON válido: ' + text.substring(0, 100));
                }
            });
        })
        .then(data => {
            console.log('Datos procesados:', data);
            if (data.success) {
                const totalCompra = parseFloat(data.total) || total;
                mostrarAlerta(
                    `✅ Compra realizada exitosamente\n\n` +
                    `Producto: ${nombre}\n` +
                    `Cantidad: ${cantidadNum} unidades\n` +
                    `Total: $${totalCompra.toFixed(2)}`,
                    'success'
                );
                // Recargar tanto catálogo como productos
                cargarCatalogoCliente();
                cargarProductos(); // Para actualizar el inventario
            } else {
                mostrarAlerta('❌ Error: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error completo:', error);
            mostrarAlerta('❌ Error al procesar la compra: ' + error.message, 'error');
        });
}

// HU5 - Reportes
function generarReporteDiario() {
    const resultado = document.getElementById('resultadoReportes');
    resultado.innerHTML = '<div style="text-align: center; padding: 2rem; color: #64748b;">🔄 Generando reporte diario...</div>';

    // RUTA CORREGIDA - solo llamar a reporte_diario
    fetch(BASE_URL + 'ventas.php?action=reporte_diario')
        .then(response => {
            console.log('Respuesta reporte diario:', response);
            if (!response.ok) {
                throw new Error('Error HTTP: ' + response.status);
            }
            // Primero intentar como texto para debug
            return response.text();
        })
        .then(text => {
            console.log('Respuesta cruda (primeros 500 chars):', text.substring(0, 500));

            try {
                const data = JSON.parse(text);
                console.log('JSON parseado:', data);

                const fecha = data.fecha || new Date().toISOString().split('T')[0];
                const totalVentas = parseInt(data.total_ventas) || 0;
                const ingresos = parseFloat(data.ingresos_totales) || 0;

                let html = `
                <div style="background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                    <h3 style="color: #1e293b; margin-bottom: 1.5rem;">📊 Reporte Diario - ${fecha}</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                        <div style="text-align: center; padding: 1.5rem; background: #f0f9ff; border-radius: 8px;">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🛍️</div>
                            <div style="font-size: 1.5rem; font-weight: bold; color: #0369a1;">${totalVentas}</div>
                            <div style="color: #64748b;">Total Ventas</div>
                        </div>
                        <div style="text-align: center; padding: 1.5rem; background: #f0fdf4; border-radius: 8px;">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">💰</div>
                            <div style="font-size: 1.5rem; font-weight: bold; color: #059669;">$${ingresos.toFixed(2)}</div>
                            <div style="color: #64748b;">Ingresos Totales</div>
                        </div>
                    </div>
                `;

                // Si hay ventas, mostrar mensaje de éxito
                if (totalVentas > 0) {
                    html += `
                        <div style="text-align: center; padding: 1rem; background: #dcfce7; border-radius: 8px; color: #166534;">
                            ✅ ${totalVentas} ventas registradas hoy por un total de $${ingresos.toFixed(2)}
                        </div>
                    `;
                } else {
                    html += `
                        <div style="text-align: center; padding: 2rem; color: #64748b;">
                            📭 No hay ventas registradas hoy
                        </div>
                    `;
                }

                html += `</div>`;
                resultado.innerHTML = html;

            } catch (e) {
                console.error('Error parseando JSON:', e);
                resultado.innerHTML = `
                <div style="background: #fee2e2; color: #991b1b; padding: 1.5rem; border-radius: 8px;">
                    ❌ Error: El servidor no devolvió JSON válido
                    <br><small>Respuesta del servidor: ${text.substring(0, 200)}...</small>
                </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error completo:', error);
            resultado.innerHTML = `
            <div style="background: #fee2e2; color: #991b1b; padding: 1.5rem; border-radius: 8px;">
                ❌ Error al generar el reporte: ${error.message}
            </div>
        `;
        });
}

function generarReporteSemanal() {
    const resultado = document.getElementById('resultadoReportes');
    resultado.innerHTML = '<div style="text-align: center; padding: 2rem; color: #64748b;">🔄 Generando reporte semanal...</div>';

    // RUTA CORREGIDA - solo reporte_semanal
    fetch(BASE_URL + 'ventas.php?action=reporte_semanal')
        .then(response => {
            console.log('Respuesta reporte semanal:', response);
            if (!response.ok) {
                throw new Error('Error HTTP: ' + response.status);
            }
            return response.text();
        })
        .then(text => {
            console.log('Respuesta cruda semanal:', text.substring(0, 500));

            try {
                const data = JSON.parse(text);
                console.log('JSON parseado semanal:', data);

                if (!Array.isArray(data) || data.length === 0) {
                    resultado.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: #64748b;">
                        <h3>📭 No hay ventas en la última semana</h3>
                        <p>Los reportes aparecerán aquí cuando haya ventas registradas</p>
                    </div>
                    `;
                    return;
                }

                let html = '<div style="background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">';
                html += '<h3 style="color: #1e293b; margin-bottom: 1.5rem;">📈 Reporte Semanal (Últimos 7 días)</h3>';

                let totalGeneral = 0;
                let ventasGenerales = 0;

                data.forEach(dia => {
                    const ingresosDia = parseFloat(dia.ingresos_totales) || 0;
                    const ventasDia = parseInt(dia.total_ventas) || 0;

                    totalGeneral += ingresosDia;
                    ventasGenerales += ventasDia;

                    html += `
                    <div style="margin-bottom: 1rem; padding: 1rem; background: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong style="color: #1e293b;">${dia.fecha}</strong>
                                <div style="margin-top: 0.5rem;">
                                    <span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.875rem;">
                                        ${ventasDia} ventas
                                    </span>
                                </div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: bold; color: #059669;">
                                $${ingresosDia.toFixed(2)}
                            </div>
                        </div>
                    </div>
                    `;
                });

                // Resumen general
                html += `
                    <div style="margin-top: 2rem; padding: 1.5rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px;">
                        <h4 style="margin-bottom: 1rem; color: white;">📋 Resumen Semanal</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div style="text-align: center;">
                                <div style="font-size: 2rem; font-weight: bold;">${ventasGenerales}</div>
                                <div>Total Ventas</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 2rem; font-weight: bold;">$${totalGeneral.toFixed(2)}</div>
                                <div>Ingresos Totales</div>
                            </div>
                        </div>
                    </div>
                </div>`;

                resultado.innerHTML = html;

            } catch (e) {
                console.error('Error parseando JSON semanal:', e);
                resultado.innerHTML = `
                <div style="background: #fee2e2; color: #991b1b; padding: 1.5rem; border-radius: 8px;">
                    ❌ Error: El servidor no devolvió JSON válido para el reporte semanal
                    <br><small>Respuesta: ${text.substring(0, 200)}...</small>
                </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error completo semanal:', error);
            resultado.innerHTML = `
            <div style="background: #fee2e2; color: #991b1b; padding: 1.5rem; border-radius: 8px;">
                ❌ Error al generar el reporte semanal: ${error.message}
            </div>
        `;
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
        background: ${tipo === 'success' ? '#10b981' : tipo === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        font-weight: 600;
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