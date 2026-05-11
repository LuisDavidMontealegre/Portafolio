// ===============================================
// script.js - Funcionalidades comunes del sitio
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    // ---------- MENÚ HAMBURGUESA ----------
    const btnAbrir = document.querySelector('.abrir-menu');
    const btnCerrar = document.querySelector('.cerrar-menu');
    const nav = document.querySelector('.nav');
    const body = document.body;

    function abrirMenu() {
        if (nav) {
            nav.classList.add('visible');
            body.classList.add('menu-abierto');
        }
    }

    function cerrarMenu() {
        if (nav) {
            nav.classList.remove('visible');
            body.classList.remove('menu-abierto');
        }
    }

    if (btnAbrir && nav) {
        btnAbrir.addEventListener('click', abrirMenu);
    }

    if (btnCerrar && nav) {
        btnCerrar.addEventListener('click', cerrarMenu);
    }

    const enlacesMenu = document.querySelectorAll('.nav-menu a');
    enlacesMenu.forEach(enlace => {
        enlace.addEventListener('click', cerrarMenu);
    });

    if (nav) {
        nav.addEventListener('click', (e) => {
            if (e.target === nav) {
                cerrarMenu();
            }
        });
    }

    // ---------- SMOOTH SCROLL PARA ANCLAS INTERNAS ----------
    const enlacesInternos = document.querySelectorAll('a[href^="#"]');
    enlacesInternos.forEach(enlace => {
        enlace.addEventListener('click', function (e) {
            const destinoId = this.getAttribute('href');
            if (destinoId === '#') return;
            const destino = document.querySelector(destinoId);
            if (destino) {
                e.preventDefault();
                destino.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                history.pushState(null, null, destinoId);
            }
        });
    });

    // ---------- FORMULARIO DE CONTACTO (Google Apps Script) ----------
    const contactoForm = document.getElementById('contactForm');
    const msgDiv = document.getElementById('form-message');
    const scriptUrl = "https://script.google.com/macros/s/AKfycbyKhThGEIQbMogTAfwK4vZ45yJmD_42ESvC2rHZHl06q-okBNJU4Hs83by5fTIyYEgZ/exec";

    if (contactoForm && msgDiv) {
        contactoForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = contactoForm.querySelector('button[type="submit"]');
            const nombre = document.getElementById('nombre').value.trim();
            const email = document.getElementById('email').value.trim();
            const asunto = document.getElementById('asunto').value.trim() || "Sin asunto";
            const mensaje = document.getElementById('mensaje').value.trim();

            if (!nombre || !email || !mensaje) {
                msgDiv.className = 'alert error';
                msgDiv.textContent = '⚠️ Por favor, completa los campos obligatorios (nombre, correo y mensaje).';
                msgDiv.style.display = 'block';
                setTimeout(() => msgDiv.style.display = 'none', 5000);
                return;
            }

            const formData = { nombre, email, asunto, mensaje };
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';
            msgDiv.style.display = 'none';

            try {
                let response;
                // Detecta si está en localhost (para evitar CORS)
                const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

                if (isLocal) {
                    // En local: usar no-cors, no podemos leer respuesta, asumimos éxito
                    await fetch(scriptUrl, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams(formData)
                    });
                    msgDiv.className = 'alert success';
                    msgDiv.textContent = '✅ ¡Mensaje enviado! (Prueba local)';
                    contactoForm.reset();
                } else {
                    // En producción: usar cors y leer respuesta JSON
                    response = await fetch(scriptUrl, {
                        method: 'POST',
                        mode: 'cors',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData)
                    });
                    const result = await response.json();
                    if (result.status === 'success') {
                        msgDiv.className = 'alert success';
                        msgDiv.textContent = '✅ ¡Mensaje enviado con éxito! Te responderé pronto.';
                        contactoForm.reset();
                    } else {
                        throw new Error(result.message || 'Error en el servidor');
                    }
                }
                msgDiv.style.display = 'block';
            } catch (error) {
                console.error('Error en el envío:', error);
                msgDiv.className = 'alert error';
                msgDiv.textContent = '❌ Error al enviar. Inténtalo más tarde.';
                msgDiv.style.display = 'block';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar mensaje';
                setTimeout(() => { msgDiv.style.display = 'none'; }, 6000);
            }
        });
    }
});