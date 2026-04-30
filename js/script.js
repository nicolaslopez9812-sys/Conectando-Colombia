let tamanoFuenteActual = 16;

// TAMAÑO DE FUENTE
function cambiarFuente(direccion) {
    const root = document.documentElement;
    if (direccion === -1 && tamanoFuenteActual > 12) tamanoFuenteActual -= 2;
    else if (direccion === 1 && tamanoFuenteActual < 22) tamanoFuenteActual += 2;
    else if (direccion === 0) tamanoFuenteActual = 16;
    root.style.setProperty('--tam-fuente', tamanoFuenteActual + 'px');
    localStorage.setItem('font-size', tamanoFuenteActual);
}

// ALTO CONTRASTE
function toggleAltoContraste() {
    document.body.classList.toggle('alto-contraste');
    localStorage.setItem('alto-contraste', document.body.classList.contains('alto-contraste'));
}

// MENÚ RESPONSIVE
function toggleMenu() {
    const nav = document.querySelector('.nav-principal');
    const btn = document.querySelector('.menu-toggle');
    if (nav) {
        nav.classList.toggle('abierto');
        if (btn) btn.setAttribute('aria-expanded', nav.classList.contains('abierto'));
    }
}

// NAVEGACIÓN
function navegarA(sectionId) {
    document.querySelectorAll('.seccion').forEach(s => s.classList.remove('activa'));
    const activa = document.getElementById(sectionId);
    if (activa) activa.classList.add('activa');
    const miga = document.getElementById('miga-actual');
    if (miga) {
        const titulos = {
            inicio: 'Inicio', problema: 'El Problema', ods9: 'ODS 9',
            beneficios: 'Beneficios', solucion: 'Solución', donar: 'Donar',
            impacto: 'Impacto Global', contacto: 'Contacto', documento: 'Documento'
        };
        miga.textContent = titulos[sectionId] || sectionId;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const nav = document.querySelector('.nav-principal');
    if (nav && nav.classList.contains('abierto')) {
        nav.classList.remove('abierto');
        const btn = document.querySelector('.menu-toggle');
        if (btn) btn.setAttribute('aria-expanded', 'false');
    }
}

// ============================================================
// API BANCO MUNDIAL — Indicadores de brecha digital educativa
// ============================================================

const PAISES_CODIGOS = {
    'colombia': 'CO', 'brasil': 'BR', 'mexico': 'MX', 'argentina': 'AR',
    'chile': 'CL', 'peru': 'PE', 'venezuela': 'VE', 'ecuador': 'EC',
    'bolivia': 'BO', 'paraguay': 'PY', 'uruguay': 'UY', 'panama': 'PA',
    'costa rica': 'CR', 'guatemala': 'GT', 'honduras': 'HN', 'el salvador': 'SV',
    'nicaragua': 'NI', 'cuba': 'CU', 'republica dominicana': 'DO', 'haiti': 'HT',
    'españa': 'ES', 'espana': 'ES', 'estados unidos': 'US', 'canada': 'CA',
    'francia': 'FR', 'alemania': 'DE', 'italia': 'IT', 'portugal': 'PT',
    'reino unido': 'GB', 'china': 'CN', 'india': 'IN', 'japon': 'JP',
    'corea del sur': 'KR', 'nigeria': 'NG', 'sudafrica': 'ZA',
    'kenia': 'KE', 'etiopia': 'ET', 'egipto': 'EG', 'marruecos': 'MA',
    'pakistan': 'PK', 'bangladesh': 'BD', 'indonesia': 'ID', 'filipinas': 'PH',
    'vietnam': 'VN', 'tailandia': 'TH', 'australia': 'AU', 'rusia': 'RU'
};

function obtenerCodigoPais(texto) {
    const limpio = texto.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
    if (PAISES_CODIGOS[limpio]) return PAISES_CODIGOS[limpio];
    for (const [nombre, codigo] of Object.entries(PAISES_CODIGOS)) {
        if (nombre.includes(limpio) || limpio.includes(nombre)) return codigo;
    }
    if (texto.trim().length === 2) return texto.trim().toUpperCase();
    return null;
}

async function buscarIndicadoresPais() {
    const input = document.getElementById('buscar-pais');
    const texto = input.value.trim();
    const resultado = document.getElementById('resultado-api');

    if (!texto) {
        resultado.innerHTML = '<p class="api-placeholder">⚠️ Ingresa el nombre de un país. Ej: Colombia, Brasil, México...</p>';
        return;
    }

    const codigo = obtenerCodigoPais(texto);
    if (!codigo) {
        resultado.innerHTML = `<p class="api-placeholder">❌ No se reconoció "<strong>${texto}</strong>". Intenta con: Colombia, Brasil, México, Argentina, Chile, Perú...</p>`;
        return;
    }

    resultado.innerHTML = '<p class="api-placeholder">🔍 Consultando Banco Mundial...</p>';

    // Indicadores alineados con ODS 9 y brecha digital educativa
    const indicadores = [
        { codigo: 'IT.NET.USER.ZS',     nombre: '🌐 Usuarios de internet',             unidad: '% de la población',  descripcion: 'Acceso digital de la ciudadanía' },
        { codigo: 'SE.SEC.ENRR',         nombre: '🏫 Matrícula escolar secundaria',      unidad: '% bruto',            descripcion: 'Cobertura en educación secundaria' },
        { codigo: 'SE.PRM.ENRR',         nombre: '📚 Matrícula escolar primaria',        unidad: '% bruto',            descripcion: 'Cobertura en educación primaria' },
        { codigo: 'SE.XPD.TOTL.GD.ZS',  nombre: '💰 Gasto público en educación',        unidad: '% del PIB',          descripcion: 'Inversión del estado en educación' },
        { codigo: 'SE.ADT.LITR.ZS',      nombre: '📖 Tasa de alfabetización adultos',    unidad: '% adultos',          descripcion: 'Población adulta que sabe leer y escribir' },
        { codigo: 'SL.UEM.1524.ZS',      nombre: '👷 Desempleo juvenil',                 unidad: '% jóvenes 15-24',    descripcion: 'Jóvenes sin empleo — impacto de la brecha digital' },
        { codigo: 'GB.XPD.RSDV.GD.ZS',  nombre: '🔬 Inversión en I+D',                  unidad: '% del PIB',          descripcion: 'Gasto en investigación y desarrollo — ODS 9' }
    ];

    try {
        // Obtener nombre oficial del país
        const respPais = await fetch(`https://api.worldbank.org/v2/country/${codigo}?format=json`);
        if (!respPais.ok) throw new Error('País no encontrado');
        const dataPais = await respPais.json();
        if (!dataPais[1] || dataPais[1].length === 0) throw new Error('País no encontrado');
        const infoPais = dataPais[1][0];
        const nombrePais = infoPais.name;
        const region = infoPais.region?.value || '';
        const ingreso = (infoPais.incomeLevel?.value && infoPais.incomeLevel.value !== 'Not classified')
        ? infoPais.incomeLevel.value
        : '';

        // Consultar todos los indicadores en paralelo
        const promesas = indicadores.map(ind =>
            fetch(`https://api.worldbank.org/v2/country/${codigo}/indicator/${ind.codigo}?format=json&mrv=5`)
                .then(r => r.json())
                .then(d => {
                    // Buscar el dato más reciente que no sea null
                    const registros = d[1] || [];
                    const reciente = registros.find(r => r.value !== null);
                    return {
                        ...ind,
                        valor: reciente?.value ?? null,
                        anio: reciente?.date ?? 'N/D'
                    };
                })
                .catch(() => ({ ...ind, valor: null, anio: 'N/D' }))
        );

        const resultados = await Promise.all(promesas);

        const tarjetas = resultados.map(ind => {
            const tieneValor = ind.valor !== null;
            const valorTexto = tieneValor ? `${ind.valor.toFixed(1)}` : '—';
            const unidadTexto = tieneValor ? ind.unidad : 'Sin datos';
            const claseValor = tieneValor ? 'indicador-valor' : 'indicador-valor sin-datos';
            return `
                <div class="indicador-card">
                    <span class="indicador-nombre">${ind.nombre}</span>
                    <span class="${claseValor}">${valorTexto}</span>
                    <span class="indicador-unidad">${unidadTexto}</span>
                    <span class="indicador-desc">${ind.descripcion}</span>
                    <span class="indicador-anio">Último dato: ${ind.anio}</span>
                </div>`;
        }).join('');

        resultado.innerHTML = `
            <div class="pais-card">
                <div class="pais-header">
                    <div>
                        <h3>📊 ${nombrePais}</h3>
                        <p class="pais-meta">${region} ${ingreso ? '· ' + ingreso : ''}</p>
                    </div>
                </div>
                <p class="pais-ods-nota">Indicadores alineados con el <strong>ODS 9 — Industria, Innovación e Infraestructura</strong></p>
                <div class="indicadores-grid">${tarjetas}</div>
                <p class="api-fuente">Fuente oficial: <a href="https://data.worldbank.org/country/${codigo}" target="_blank" rel="noopener noreferrer">Banco Mundial Open Data</a></p>
            </div>`;

    } catch {
        resultado.innerHTML = `<p class="api-placeholder">❌ No se pudieron obtener los datos de "<strong>${texto}</strong>". Verifica el nombre e intenta de nuevo.</p>`;
    }
}

// VALIDACIÓN FORMULARIO DONACIÓN
function validarFormularioDonacion() {
    let valido = true;
    const campos = ['nombre', 'email', 'telefono', 'tipo', 'colegio', 'dispositivos', 'ciudad', 'cantidad'];
    campos.forEach(campo => {
        if (!validarCampoDonacion(`${campo}-donante`)) valido = false;
    });
    return valido;
}
function validarCampoDonacion(campoId) {
    const campo = document.getElementById(campoId);
    const errorSpan = document.getElementById(`error-${campoId.replace('-donante', '')}`);
    if (!campo || !errorSpan) return true;
    const valor = campo.value.trim();
    let esValido = true;
    let mensaje = '';
    switch (campoId) {
        case 'nombre-donante':
            if (!valor) { mensaje = 'El nombre es obligatorio'; esValido = false; }
            else if (valor.length < 3) { mensaje = 'Mínimo 3 caracteres'; esValido = false; }
            break;
        case 'email-donante':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!valor) { mensaje = 'El correo es obligatorio'; esValido = false; }
            else if (!emailRegex.test(valor)) { mensaje = 'Correo inválido'; esValido = false; }
            break;
        case 'telefono-donante':
            const telRegex = /^[\+]?[\d\s\-]{7,15}$/;
            if (!valor) { mensaje = 'El teléfono es obligatorio'; esValido = false; }
            else if (!telRegex.test(valor)) { mensaje = 'Teléfono inválido'; esValido = false; }
            break;
        case 'tipo-donante':
            if (!valor) { mensaje = 'Selecciona el tipo'; esValido = false; }
            break;
        case 'colegio-destino':
            if (!valor) { mensaje = 'Selecciona un colegio'; esValido = false; }
            break;
        case 'dispositivos':
            if (!valor) { mensaje = 'Describe los dispositivos'; esValido = false; }
            else if (valor.length < 5) { mensaje = 'Descripción muy corta'; esValido = false; }
            break;
        case 'ciudad-donante':
            if (!valor) { mensaje = 'Indica la ciudad'; esValido = false; }
            break;
        case 'cantidad-dispositivos':
            if (!valor) { mensaje = 'Indica la cantidad'; esValido = false; }
            break;
    }
    errorSpan.textContent = mensaje;
    if (esValido) {
        campo.classList.remove('invalido');
        campo.classList.add('valido');
    } else {
        campo.classList.remove('valido');
        campo.classList.add('invalido');
    }
    return esValido;
}
function guardarDonacion() {
    const donacion = {
        id: Date.now(),
        fecha: new Date().toLocaleString('es-CO'),
        nombre: document.getElementById('nombre-donante').value.trim(),
        email: document.getElementById('email-donante').value.trim(),
        telefono: document.getElementById('telefono-donante').value.trim(),
        tipo: document.getElementById('tipo-donante').value,
        colegio: document.getElementById('colegio-destino').value,
        dispositivos: document.getElementById('dispositivos').value.trim(),
        ciudad: document.getElementById('ciudad-donante').value.trim(),
        cantidad: document.getElementById('cantidad-dispositivos').value.trim()
    };
    let donaciones = JSON.parse(localStorage.getItem('donaciones') || '[]');
    donaciones.push(donacion);
    localStorage.setItem('donaciones', JSON.stringify(donaciones));
    alert('✅ ¡Gracias por tu donación! Nos pondremos en contacto en las próximas 48 horas.');
    document.getElementById('form-donacion').reset();
    document.querySelectorAll('#form-donacion .valido').forEach(c => c.classList.remove('valido'));
}

// VALIDACIÓN CONTACTO
function validarFormularioContacto() {
    let valido = true;
    const campos = ['nombre', 'email', 'asunto', 'mensaje'];
    campos.forEach(campo => {
        if (!validarCampoContacto(`${campo}-contacto`)) valido = false;
    });
    return valido;
}
function validarCampoContacto(campoId) {
    const campo = document.getElementById(campoId);
    const errorSpan = document.getElementById(`error-${campoId}`);
    if (!campo || !errorSpan) return true;
    const valor = campo.value.trim();
    let esValido = true;
    let mensaje = '';
    switch (campoId) {
        case 'nombre-contacto':
            if (!valor) { mensaje = 'El nombre es obligatorio'; esValido = false; }
            else if (valor.length < 3) { mensaje = 'Mínimo 3 caracteres'; esValido = false; }
            break;
        case 'email-contacto':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!valor) { mensaje = 'El correo es obligatorio'; esValido = false; }
            else if (!emailRegex.test(valor)) { mensaje = 'Correo inválido'; esValido = false; }
            break;
        case 'asunto-contacto':
            if (!valor) { mensaje = 'El asunto es obligatorio'; esValido = false; }
            break;
        case 'mensaje-contacto':
            if (!valor) { mensaje = 'El mensaje es obligatorio'; esValido = false; }
            else if (valor.length < 10) { mensaje = 'Mínimo 10 caracteres'; esValido = false; }
            break;
    }
    errorSpan.textContent = mensaje;
    if (esValido) {
        campo.classList.remove('invalido');
        campo.classList.add('valido');
    } else {
        campo.classList.remove('valido');
        campo.classList.add('invalido');
    }
    return esValido;
}

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    // Restaurar preferencias
    const fontSize = parseInt(localStorage.getItem('font-size'));
    if (fontSize && fontSize >= 12 && fontSize <= 22) {
        tamanoFuenteActual = fontSize;
        document.documentElement.style.setProperty('--tam-fuente', tamanoFuenteActual + 'px');
    }
    if (localStorage.getItem('alto-contraste') === 'true') document.body.classList.add('alto-contraste');

    // Botones del menú de accesibilidad
    const btnContraste = document.getElementById('boton-contraste');
    const btnReducir = document.getElementById('boton-reducir');
    const btnAumentar = document.getElementById('boton-aumentar');
    if (btnContraste) btnContraste.addEventListener('click', (e) => { e.preventDefault(); toggleAltoContraste(); });
    if (btnReducir) btnReducir.addEventListener('click', (e) => { e.preventDefault(); cambiarFuente(-1); });
    if (btnAumentar) btnAumentar.addEventListener('click', (e) => { e.preventDefault(); cambiarFuente(1); });

    // Formulario donación
    const formDonacion = document.getElementById('form-donacion');
    if (formDonacion) {
        formDonacion.addEventListener('submit', (e) => { e.preventDefault(); if (validarFormularioDonacion()) guardarDonacion(); });
        ['nombre-donante','email-donante','telefono-donante','tipo-donante','colegio-destino','dispositivos','ciudad-donante','cantidad-dispositivos'].forEach(id => {
            const campo = document.getElementById(id);
            if (campo) campo.addEventListener('blur', () => validarCampoDonacion(id));
        });
    }
    // Formulario contacto
    const formContacto = document.getElementById('form-contacto');
    if (formContacto) {
        formContacto.addEventListener('submit', (e) => { if (!validarFormularioContacto()) e.preventDefault(); });
        ['nombre-contacto','email-contacto','asunto-contacto','mensaje-contacto'].forEach(id => {
            const campo = document.getElementById(id);
            if (campo) campo.addEventListener('blur', () => validarCampoContacto(id));
        });
    }
    // Navegación por hash
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) navegarA(hash);
});