// =============================================
// VARIABLES GLOBALES
// =============================================
let tamanoFuente = 16;
const appConfig = window.APP_CONFIG || {};
const googleAppsScriptUrl = (appConfig.googleAppsScriptUrl || '').trim();

const nombreSecciones = {
  inicio: 'Inicio',
  problema: 'El Problema',
  ods9: 'ODS 9',
  beneficios: 'Beneficios',
  solucion: 'Solución',
  donar: 'Donar',
  impacto: 'Impacto Global',
  contacto: 'Contacto',
  documento: 'Documento'
};

// =============================================
// LOGICA SPA
// =============================================
function navegarA(idSeccion, actualizarHash = true) {
  document.querySelectorAll('.seccion').forEach(sec => {
    sec.classList.remove('activa');
  });

  const destino = document.getElementById(idSeccion);
  if (!destino) return;

  destino.classList.add('activa');

  document.querySelectorAll('.nav-principal a').forEach(enlace => {
    enlace.classList.remove('activo');
    if (enlace.getAttribute('onclick') &&
        enlace.getAttribute('onclick').includes(idSeccion)) {
      enlace.classList.add('activo');
    }
  });

  actualizarMigas(idSeccion);

  if (actualizarHash) {
    const nuevaUrl = idSeccion === 'inicio' ? window.location.pathname : `#${idSeccion}`;
    window.history.replaceState(null, '', nuevaUrl);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  const nav = document.querySelector('.nav-principal');
  const btn = document.querySelector('.menu-toggle');
  if (nav) nav.classList.remove('abierto');
  if (btn) {
    btn.textContent = '☰';
    btn.setAttribute('aria-expanded', 'false');
  }
}

function obtenerSeccionInicial() {
  const hash = window.location.hash.replace('#', '');
  return document.getElementById(hash) ? hash : 'inicio';
}

// =============================================
// MIGAS DE PAN
// =============================================
function actualizarMigas(idSeccion) {
  const lista = document.querySelector('.migas-pan ol');
  if (!lista) return;

  if (idSeccion === 'inicio') {
    lista.innerHTML = `
      <li><a href="#" onclick="navegarA('inicio'); return false;">Inicio</a></li>
      <li id="miga-actual" aria-current="page">Inicio</li>`;
  } else {
    lista.innerHTML = `
      <li><a href="#" onclick="navegarA('inicio'); return false;">Inicio</a></li>
      <li id="miga-actual" aria-current="page">${nombreSecciones[idSeccion]}</li>`;
  }
}

// =============================================
// MENU HAMBURGUESA
// =============================================
function toggleMenu() {
  const nav = document.querySelector('.nav-principal');
  const btn = document.querySelector('.menu-toggle');
  if (!nav || !btn) return;

  const abierto = nav.classList.contains('abierto');
  nav.classList.toggle('abierto');
  btn.setAttribute('aria-expanded', String(!abierto));
  btn.textContent = abierto ? '☰' : '✕';
}

// =============================================
// ACCESIBILIDAD - TAMANO DE FUENTE
// =============================================
function cambiarFuente(accion) {
  if (accion === 1 && tamanoFuente < 24) tamanoFuente += 2;
  if (accion === -1 && tamanoFuente > 12) tamanoFuente -= 2;
  if (accion === 0) tamanoFuente = 16;
  document.documentElement.style.fontSize = `${tamanoFuente}px`;
}

// =============================================
// EXPRESIONES REGULARES
// =============================================
const regex = {
  nombre: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]{3,100}$/,
  email: /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
  telefono: /^[+]?[\d\s\-()]{7,20}$/,
  asunto: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,:;!?()"'%-]{3,120}$/,
  texto: /^[\s\S]{10,500}$/,
  ciudad: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,60}$/,
  cantidad: /^[0-9a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{1,50}$/
};

function validarCampo(input, patronRegex, mensajeError, idError) {
  const valor = input.value.trim();
  const span = document.getElementById(idError);

  if (!valor) {
    input.classList.remove('valido');
    input.classList.add('invalido');
    if (span) span.textContent = 'Este campo es obligatorio';
    return false;
  }

  if (!patronRegex.test(valor)) {
    input.classList.remove('valido');
    input.classList.add('invalido');
    if (span) span.textContent = mensajeError;
    return false;
  }

  input.classList.remove('invalido');
  input.classList.add('valido');
  if (span) span.textContent = '';
  return true;
}

function validarSelect(selectId, errorId, mensaje) {
  const sel = document.getElementById(selectId);
  const span = document.getElementById(errorId);
  if (!sel.value) {
    sel.classList.add('invalido');
    if (span) span.textContent = mensaje;
    return false;
  }

  sel.classList.remove('invalido');
  sel.classList.add('valido');
  if (span) span.textContent = '';
  return true;
}

function obtenerTextoSeleccionado(select) {
  return select && select.selectedIndex >= 0 ? select.options[select.selectedIndex].text : '';
}

function obtenerDatosDonacion() {
  const tipo = document.getElementById('tipo-donante');
  const colegio = document.getElementById('colegio-destino');

  return {
    nombre: document.getElementById('nombre-donante').value.trim(),
    email: document.getElementById('email-donante').value.trim(),
    telefono: document.getElementById('telefono-donante').value.trim(),
    tipo: tipo ? tipo.value : '',
    tipoTexto: obtenerTextoSeleccionado(tipo),
    colegio: colegio ? colegio.value : '',
    colegioTexto: obtenerTextoSeleccionado(colegio),
    dispositivos: document.getElementById('dispositivos').value.trim(),
    ciudad: document.getElementById('ciudad-donante').value.trim(),
    cantidad: document.getElementById('cantidad-dispositivos').value.trim()
  };
}

function actualizarEstadoDonacion(mensaje, esError = false) {
  const estado = document.getElementById('estado-donacion');
  if (!estado) return;
  estado.textContent = mensaje;
  estado.style.color = esError ? 'var(--rojo-critico)' : 'var(--verde-colombia)';
}

function mostrarExitoDonacion(nombreColegio) {
  const contenedor = document.getElementById('form-donacion');
  if (!contenedor) return;

  contenedor.innerHTML = `
    <div style="text-align:center; padding:50px 20px;">
      <div style="font-size:4rem; margin-bottom:16px;">✅</div>
      <h3 style="color:var(--verde-colombia); font-size:1.4rem; margin-bottom:12px;">¡Donación registrada exitosamente!</h3>
      <p style="color:var(--texto-suave); font-size:1rem; line-height:1.7;">
        Tus dispositivos fueron registrados para: <strong>${nombreColegio}</strong>.
      </p>
      <p style="color:var(--texto-suave); margin-top:8px; font-size:0.9rem;">
        Gracias por ser parte del cambio en Soacha. Nuestro equipo te contactará pronto.
      </p>
    </div>`;
}

async function enviarDonacionGoogleSheets(datos) {
  const response = await fetch(googleAppsScriptUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify({
      action: 'create',
      data: datos
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.ok === false) {
    throw new Error(payload.message || 'No fue posible registrar la donación.');
  }

  return payload;
}

// =============================================
// FORMULARIO DONACION
// =============================================
const formDonacion = document.getElementById('form-donacion');
if (formDonacion) {
  formDonacion.addEventListener('submit', async function(e) {
    e.preventDefault();

    const v1 = validarCampo(document.getElementById('nombre-donante'), regex.nombre, 'Solo letras y espacios, mínimo 3 caracteres', 'error-nombre');
    const v2 = validarCampo(document.getElementById('email-donante'), regex.email, 'Formato válido: correo@dominio.com', 'error-email');
    const v3 = validarCampo(document.getElementById('telefono-donante'), regex.telefono, 'Mínimo 7 dígitos, puede incluir +57', 'error-telefono');
    const v4 = validarSelect('tipo-donante', 'error-tipo', 'Selecciona un tipo de donante');
    const v5 = validarSelect('colegio-destino', 'error-colegio', 'Selecciona el colegio de Soacha');
    const v6 = validarCampo(document.getElementById('dispositivos'), regex.texto, 'Describe los dispositivos, mínimo 10 caracteres', 'error-dispositivos');
    const v7 = validarCampo(document.getElementById('ciudad-donante'), regex.ciudad, 'Solo letras y espacios', 'error-ciudad');
    const v8 = validarCampo(document.getElementById('cantidad-dispositivos'), regex.cantidad, 'Indica la cantidad de dispositivos', 'error-cantidad');

    if (!(v1 && v2 && v3 && v4 && v5 && v6 && v7 && v8)) {
      return;
    }

    const tipo = document.getElementById('tipo-donante');
    const colegio = document.getElementById('colegio-destino');
    const tipoTexto = document.getElementById('tipo-donante-texto');
    const colegioTexto = document.getElementById('colegio-destino-texto');
    const botonSubmit = formDonacion.querySelector('button[type="submit"]');

    if (tipo && tipoTexto) {
      tipoTexto.value = tipo.options[tipo.selectedIndex].text;
    }

    if (colegio && colegioTexto) {
      colegioTexto.value = colegio.options[colegio.selectedIndex].text;
    }

    if (!googleAppsScriptUrl) {
      actualizarEstadoDonacion('Falta configurar la URL de Google Apps Script en js/config.js.', true);
      return;
    }

    if (botonSubmit) {
      botonSubmit.disabled = true;
      botonSubmit.textContent = 'Enviando donación...';
    }

    actualizarEstadoDonacion('Guardando donación en Google Sheets...');

    try {
      const datos = obtenerDatosDonacion();
      await enviarDonacionGoogleSheets(datos);
      mostrarExitoDonacion(datos.colegioTexto);
    } catch (error) {
      actualizarEstadoDonacion(error.message || 'Ocurrió un error al registrar la donación.', true);
      if (botonSubmit) {
        botonSubmit.disabled = false;
        botonSubmit.textContent = '💚 Registrar mi Donación';
      }
    }
  });
}

// =============================================
// FORMULARIO CONTACTO
// =============================================
const formContacto = document.getElementById('form-contacto');
if (formContacto) {
  formContacto.addEventListener('submit', function(e) {
    const v1 = validarCampo(
      document.getElementById('nombre-contacto'),
      regex.nombre,
      'Solo letras y espacios, mínimo 3 caracteres',
      'error-nombre-contacto'
    );

    const v2 = validarCampo(
      document.getElementById('email-contacto'),
      regex.email,
      'Formato válido: correo@dominio.com',
      'error-email-contacto'
    );

    const v3 = validarCampo(
      document.getElementById('asunto-contacto'),
      regex.asunto,
      'El asunto debe tener mínimo 3 caracteres y puede incluir puntuación básica',
      'error-asunto-contacto'
    );

    const v4 = validarCampo(
      document.getElementById('mensaje-contacto'),
      regex.texto,
      'El mensaje debe tener mínimo 10 caracteres',
      'error-mensaje-contacto'
    );

    if (!(v1 && v2 && v3 && v4)) {
      e.preventDefault();
    }
  });
}

// =============================================
// API REST COUNTRIES
// =============================================
async function buscarPais() {
  const input = document.getElementById('buscar-pais').value.trim();
  const resultado = document.getElementById('resultado-api');

  if (!input) {
    resultado.innerHTML = '<p class="api-placeholder">⚠️ Ingresa el nombre de un país</p>';
    return;
  }

  resultado.innerHTML = '<p class="api-placeholder">🔄 Buscando información...</p>';

  try {
    const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(input)}`);
    if (!res.ok) {
      resultado.innerHTML = '<p class="api-placeholder">❌ País no encontrado. Intenta con otro nombre.</p>';
      return;
    }

    const datos = await res.json();
    const pais = datos[0];

    const nombre = pais.name.common;
    const oficial = pais.name.official;
    const capital = pais.capital ? pais.capital[0] : 'No disponible';
    const poblacion = pais.population.toLocaleString('es-CO');
    const region = pais.region;
    const subregion = pais.subregion || 'No disponible';
    const bandera = pais.flag;
    const idiomas = pais.languages ? Object.values(pais.languages).join(', ') : 'No disponible';
    const area = pais.area ? `${pais.area.toLocaleString('es-CO')} km²` : 'No disponible';

    resultado.innerHTML = `
      <div class="pais-card">
        <div class="pais-bandera" aria-hidden="true">${bandera}</div>
        <div class="pais-info">
          <h3>${nombre}</h3>
          <p><strong>Nombre oficial:</strong> ${oficial}</p>
          <p><strong>Capital:</strong> ${capital}</p>
          <p><strong>Población:</strong> ${poblacion} habitantes</p>
          <p><strong>Región:</strong> ${region} - ${subregion}</p>
          <p><strong>Idiomas:</strong> ${idiomas}</p>
          <p><strong>Área:</strong> ${area}</p>
          <div class="pais-contexto">
            🌐 <strong>Contexto ODS 9:</strong> Con una población de <strong>${poblacion}</strong> personas,
            ${nombre} forma parte del reto global de conectividad. Garantizar acceso tecnológico
            a toda su población puede transformar millones de vidas e impulsar su desarrollo
            alineado al ODS 9.
          </div>
        </div>
      </div>`;
  } catch (err) {
    resultado.innerHTML = '<p class="api-placeholder">❌ Error de conexión. Verifica tu internet.</p>';
    console.error('Error API:', err);
  }
}

const inputBuscarPais = document.getElementById('buscar-pais');
if (inputBuscarPais) {
  inputBuscarPais.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') buscarPais();
  });
}

window.addEventListener('hashchange', function() {
  navegarA(obtenerSeccionInicial(), false);
});

// =============================================
// INICIALIZACION
// =============================================
document.addEventListener('DOMContentLoaded', function() {
  navegarA(obtenerSeccionInicial(), false);

  const campos = [
    { id: 'nombre-donante', reg: regex.nombre, msg: 'Solo letras y espacios', err: 'error-nombre' },
    { id: 'email-donante', reg: regex.email, msg: 'Formato: correo@dominio.com', err: 'error-email' },
    { id: 'telefono-donante', reg: regex.telefono, msg: 'Mínimo 7 dígitos', err: 'error-telefono' },
    { id: 'dispositivos', reg: regex.texto, msg: 'Mínimo 10 caracteres', err: 'error-dispositivos' },
    { id: 'ciudad-donante', reg: regex.ciudad, msg: 'Solo letras y espacios', err: 'error-ciudad' },
    { id: 'nombre-contacto', reg: regex.nombre, msg: 'Solo letras y espacios', err: 'error-nombre-contacto' },
    { id: 'email-contacto', reg: regex.email, msg: 'Formato: correo@dominio.com', err: 'error-email-contacto' },
    { id: 'asunto-contacto', reg: regex.asunto, msg: 'Mínimo 3 caracteres y puntuación básica permitida', err: 'error-asunto-contacto' },
    { id: 'mensaje-contacto', reg: regex.texto, msg: 'Mínimo 10 caracteres', err: 'error-mensaje-contacto' }
  ];

  campos.forEach(campo => {
    const input = document.getElementById(campo.id);
    if (input) {
      input.addEventListener('blur', function() {
        validarCampo(this, campo.reg, campo.msg, campo.err);
      });
    }
  });

  console.log('Conectando a Colombia con Tecnología cargado correctamente');
});
