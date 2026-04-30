const USUARIO_VALIDO = "admin";
const CONTRASENA_VALIDA = "admin123";

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formulario-login');
    const errorDiv = document.getElementById('error-login');

    if (sessionStorage.getItem('admin_logged') === 'true') {
        window.location.href = 'admin.html';
        return;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const usuario = document.getElementById('usuario').value.trim();
        const contrasena = document.getElementById('contrasena').value;

        if (usuario === USUARIO_VALIDO && contrasena === CONTRASENA_VALIDA) {
            sessionStorage.setItem('admin_logged', 'true');
            window.location.href = 'admin.html';
        } else {
            errorDiv.style.display = 'block';
            document.getElementById('contrasena').value = '';
        }
    });
});