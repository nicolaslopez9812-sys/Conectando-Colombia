let registros = [];

function cargarRegistros() {
    registros = JSON.parse(localStorage.getItem('donaciones') || '[]');
    renderizarTabla(registros);
    actualizarEstadisticas(registros);
}
function renderizarTabla(lista) {
    const tbody = document.getElementById('cuerpo-tabla');
    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11"><div class="sin-registros"><span>📭</span><p>No hay donaciones registradas.</p></div></td></tr>';
        return;
    }
    tbody.innerHTML = lista.map((r, i) => `
        <tr>
            <td>${i+1}</td>
            <td>${r.fecha || '—'}</td>
            <td><strong>${escapeHtml(r.nombre)}</strong></td>
            <td><a href="mailto:${r.email}">${escapeHtml(r.email)}</a></td>
            <td>${escapeHtml(r.telefono)}</td>
            <td><span class="etiqueta-tipo etiqueta-${r.tipo}">${obtenerEtiqueta(r.tipo)}</span></td>
            <td><strong>${escapeHtml(r.colegio)}</strong></td>
            <td>${escapeHtml(r.dispositivos)}</td>
            <td><strong>${escapeHtml(r.cantidad)}</strong></td>
            <td>${escapeHtml(r.ciudad)}</td>
            <td><button class="boton-eliminar" onclick="eliminarRegistro(${r.id})">🗑️ Eliminar</button></td>
        </tr>
    `).join('');
}
function escapeHtml(texto) { if (!texto) return ''; const div = document.createElement('div'); div.textContent = texto; return div.innerHTML; }
function obtenerEtiqueta(tipo) {
    const mapa = { empresa: '🏢 Empresa', gobierno: '🏛️ Gobierno', ong: '🤝 ONG', persona: '👤 Persona' };
    return mapa[tipo] || tipo;
}
function actualizarEstadisticas(lista) {
    document.getElementById('total-donaciones').textContent = lista.length;
    const colegios = new Set(lista.map(r => r.colegio)).size;
    document.getElementById('total-colegios').textContent = colegios;
    const empresas = lista.filter(r => r.tipo === 'empresa' || r.tipo === 'gobierno').length;
    document.getElementById('total-empresas').textContent = empresas;
    document.getElementById('total-dispositivos').textContent = lista.length;
}
function filtrarRegistros() {
    const busqueda = document.getElementById('buscar-registro').value.toLowerCase();
    const filtrados = registros.filter(r => (r.nombre||'').toLowerCase().includes(busqueda) || (r.colegio||'').toLowerCase().includes(busqueda) || (r.ciudad||'').toLowerCase().includes(busqueda) || (r.email||'').toLowerCase().includes(busqueda));
    renderizarTabla(filtrados);
}
function eliminarRegistro(id) {
    if (!confirm('¿Eliminar esta donación?')) return;
    registros = registros.filter(r => r.id !== id);
    localStorage.setItem('donaciones', JSON.stringify(registros));
    renderizarTabla(registros);
    actualizarEstadisticas(registros);
}
function confirmarLimpiar() {
    if (!confirm('¿Eliminar TODOS los registros? No se puede deshacer.')) return;
    localStorage.removeItem('donaciones');
    registros = [];
    renderizarTabla([]);
    actualizarEstadisticas([]);
}
function exportarCSV() {
    if (registros.length === 0) { alert('No hay datos para exportar.'); return; }
    const encabezados = ['#','Fecha','Nombre','Email','Teléfono','Tipo','Colegio','Dispositivos','Cantidad','Ciudad'];
    const filas = registros.map((r,i) => [i+1, r.fecha||'', r.nombre||'', r.email||'', r.telefono||'', r.tipo||'', r.colegio||'', (r.dispositivos||'').replace(/,/g,';'), r.cantidad||'', r.ciudad||'']);
    const csv = [encabezados, ...filas].map(f => f.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], {type: 'text/csv;charset=utf-8;'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `donaciones_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
}
cargarRegistros();