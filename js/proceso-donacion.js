function toggleFaq(boton) {
    const respuesta = boton.nextElementSibling;
    const icono = boton.querySelector('.faq-icono');
    const abierta = respuesta.classList.contains('abierta');
    document.querySelectorAll('.pd-faq-respuesta').forEach(r => r.classList.remove('abierta'));
    document.querySelectorAll('.pd-faq-pregunta').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        const ic = b.querySelector('.faq-icono');
        if (ic) ic.textContent = '+';
    });
    if (!abierta) {
        respuesta.classList.add('abierta');
        boton.setAttribute('aria-expanded', 'true');
        if (icono) icono.textContent = '−';
    }
}