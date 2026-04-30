document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('admin_logged') !== 'true') {
        window.location.href = 'login.html';
        return;
    }
    const btnCerrar = document.getElementById('boton-cerrar-sesion');
    if (btnCerrar) {
        btnCerrar.addEventListener('click', () => {
            sessionStorage.removeItem('admin_logged');
            window.location.href = 'login.html';
        });
    }
});