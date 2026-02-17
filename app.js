document.addEventListener('DOMContentLoaded', () => {

    gsap.registerPlugin(ScrollTrigger);

    // =========================================
    // CONFIGURACIÓN EMAILJS & FORMULARIO UNIFICADO
    // =========================================
    
    // 1. INICIALIZAR
    try {
        emailjs.init("86cofjmquuDaxlKS0"); 
    } catch (e) {
        console.warn("EmailJS error init:", e);
    }

    // 2. LÓGICA DE ENVÍO + VALIDACIÓN (FUSIONADA)
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.querySelector('.submit-btn');
    const btnText = document.getElementById('btn-text');

    if (contactForm) {
        // A) Funciones de Validación Visual
        const showMessage = (element, message, type) => {
            const formGroup = element.closest('.form-group');
            const existingMessage = formGroup.querySelector('.form-message');
            if (existingMessage) existingMessage.remove();
            
            // Solo mostrar mensaje si es error o éxito explícito
            if(message) {
                const messageEl = document.createElement('span');
                messageEl.className = `form-message ${type}`; 
                messageEl.textContent = message;
                formGroup.appendChild(messageEl);
            }
            
            formGroup.classList.remove('success', 'error'); 
            formGroup.classList.add(type);
        };

        const validateField = (element) => {
            const value = element.value.trim();
            let isValid = true; 
            let message = '';

            switch(element.name) {
                case 'name': 
                    if (!value) { message = 'Nombre requerido'; isValid = false; } 
                    break;
                case 'email': 
                    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { message = 'Email inválido'; isValid = false; } 
                    break;
                case 'message': 
                    if (!value) { 
                        message = 'Mensaje requerido'; 
                        isValid = false; 
                    } else if (value.length < 20) { // Ajustado a 20 para pruebas rápidas (puedes volver a poner 200)
                        message = `Mínimo 20 caracteres (llevas ${value.length})`;
                        isValid = false;
                    }
                    break;
            }
            
            if (isValid) {
                showMessage(element, '✓', 'success'); 
            } else {
                showMessage(element, message, 'error');
            }
            return isValid;
        };

        // B) Listeners de Validación en tiempo real
        const inputs = contactForm.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => { 
                if (input.closest('.form-group').classList.contains('error') || input.name === 'message') {
                    validateField(input);
                }
            });
        });

        // C) MANEJO DEL ENVÍO (SUBMIT)
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Evita recarga

            // 1. Validar todo antes de enviar
            let isFormValid = true;
            inputs.forEach(input => { 
                if (!validateField(input)) isFormValid = false; 
            });

            if (!isFormValid) {
                alert("Por favor corrige los errores en el formulario.");
                return; // Detiene el envío
            }

            // 2. Feedback Visual "Enviando"
            const originalText = btnText ? btnText.innerText : "ENVIAR";
            if(btnText) btnText.innerText = "ENVIANDO...";
            if(submitBtn) {
                submitBtn.disabled = true;
                submitBtn.style.opacity = "0.7";
            }

            // 3. Preparar Datos (Usando los nuevos IDs)
            const templateParams = {
                nombre: document.getElementById('field-name') ? document.getElementById('field-name').value : "",
                email: document.getElementById('field-email') ? document.getElementById('field-email').value : "",
                empresa: document.getElementById('field-company') ? document.getElementById('field-company').value : "",
                servicio: document.getElementById('field-service') ? document.getElementById('field-service').value : "",
                mensaje: document.getElementById('field-message') ? document.getElementById('field-message').value : ""
            };

            // 4. Enviar a EmailJS
            emailjs.send("service_85yozd3", "template_1hmuu2k", templateParams)
                .then(function() {
                    alert('¡Mensaje enviado con éxito! 🚀');
                    contactForm.reset();
                    
                    // Limpiar mensajes de validación visual
                    document.querySelectorAll('.form-message').forEach(el => el.remove());
                    document.querySelectorAll('.form-group').forEach(el => el.classList.remove('success', 'error'));

                    if(btnText) btnText.innerText = "MENSAJE ENVIADO";
                    setTimeout(() => {
                        if(btnText) btnText.innerText = originalText;
                        if(submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.style.opacity = "1";
                        }
                    }, 3000);
                }, function(error) {
                    alert('Hubo un error al enviar. Revisa tu conexión.');
                    console.error('EMAILJS FAILED...', error);
                    if(btnText) btnText.innerText = originalText;
                    if(submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.style.opacity = "1";
                    }
                });
        });
    }

    // =========================================
    // 1. PRELOADER & HERO SEQUENCE
    // =========================================
    const preloader = document.getElementById('preloader');
    const textElement = document.querySelector('.decoder-text');
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";
    
    // Función efecto máquina de escribir
    const typeWriter = (text, elementId, speed, callback) => {
        const element = document.getElementById(elementId);
        if(!element) return;
        let i = 0;
        element.innerHTML = "";
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else if (callback) {
                callback();
            }
        }
        type();
    };

    if (textElement) {
        let iteration = 0;
        const finalText = textElement.getAttribute('data-value') || "SYSTEM";
        
        const interval = setInterval(() => {
            textElement.innerText = finalText.split("").map((letter, index) => {
                if(index < iteration) return finalText[index];
                return letters[Math.floor(Math.random() * letters.length)];
            }).join("");
            
            if(iteration >= finalText.length){ 
                clearInterval(interval);
                setTimeout(() => {
                    if(preloader) preloader.classList.add('loaded');
                    gsap.fromTo(".hero-anim", 
                        { y: 50, opacity: 0 },
                        { y: 0, opacity: 1, duration: 1.2, ease: "power3.out", delay: 0.5, onComplete: () => {
                            typeWriter("El codigo es la realidad...", "typing-sub", 50, () => {
                                gsap.to(".hero-scroll-indicator", { opacity: 1, duration: 1 });
                            });
                        }}
                    );
                }, 800);
            }
            iteration += 1 / 3; 
        }, 30);
    } else {
        setTimeout(() => { if(preloader) preloader.classList.add('loaded'); }, 1000);
    }

    // =========================================
    // 2. MODALES Y DATOS DE SERVICIOS
    // =========================================
    const modal = document.getElementById('service-modal');
    const modalContainer = document.querySelector('.modal-content');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.close-modal');

    // DATOS ACTUALIZADOS SEGÚN TUS IMÁGENES
    const infoServicios = {
        web: {
            tema: "theme-web", title: "Desarrollo Web",
            slides: [
                { title: "Paginas Web informativas", desc: "Muestran información clara y esencial." },
                { title: "Evolucion Web", desc: "Rediseño y actualización para una web moderna y fácil de usar." },
                { title: "Paginas web corporativas", desc: "Presentan la identidad y servicios de una empresa." },
                { title: "Landing pages", desc: "Páginas web diseñadas para negocios y proyectos que buscan atraer y convertir clientes." }
            ]
        },
        ia: {
            tema: "theme-ia", title: "Agentes de IA",
            slides: [
                { title: "Chatbots inteligentes", desc: "Responden consultas automáticamente, 24/7, de forma rápida y precisa." },
                { title: "Automatizacion con IA", desc: "Optimiza procesos repetitivos usando inteligencia artificial para ahorrar tiempo y recursos." }
            ]
        },
        apps: {
            tema: "theme-apps", title: "Desarrollo de Aplicaciones",
            slides: [
                { title: "Aplicaciones móviles", desc: "Apps para Android y iOS enfocadas en usabilidad y rendimiento." },
                { title: "Evolucion de Aplicacion", desc: "Optimización de diseño y rendimiento para una mejor experiencia." },
                { title: "Prototipos funcionales", desc: "Versiones iniciales para validar ideas y funcionalidades." }
            ]
        },
        software: {
            tema: "theme-software", title: "Desarrollo de Software",
            slides: [
                { title: "Software a la medida", desc: "Soluciones diseñadas específicamente para las necesidades del negocio." },
                { title: "Evolucion de Software", desc: "Mejora de interfaz y estructura para mayor eficiencia." },
                { title: "Sistemas de gestion", desc: "Control y administración eficiente de procesos y recursos." }
            ]
        }
    };

    function openServiceModal(serviceKey) {
        const data = infoServicios[serviceKey];
        if(!data) return;
        
        modalContainer.style.background = ''; // Limpiar estilos
        modalContainer.className = `modal-content ${data.tema}`;
        
        let currentIndex = 0;
        const totalSlides = data.slides.length;
        let isAnimating = false; // "Semáforo" para el scroll

        const renderSlide = (index) => {
            const slide = data.slides[index];
            const indicatorsHTML = data.slides.map((_, i) => `<div class="indicator-dot ${i === index ? 'active' : ''}"></div>`).join('');
            
            // 1. Inyectamos el HTML
            modalBody.innerHTML = `
                <div class="single-slide-container">
                    <div class="slide-main-title">${data.title}</div>
                    <div class="slide-number">0${index + 1}</div>
                    <h2 class="slide-title">${slide.title}</h2>
                    <p class="slide-desc">${slide.desc}</p>
                </div>
                <div class="slide-indicators">${indicatorsHTML}</div>
                <div class="scroll-hint"><div class="mouse-icon"></div><span style="font-size:10px; text-transform:uppercase; letter-spacing:1px; color:rgba(255,255,255,0.7)">Scroll</span></div>
            `;
            
            // 2. Animaciones de Entrada (GSAP)
            const tl = gsap.timeline();
            
            // El número de fondo entra suave
            tl.fromTo(".slide-number", 
                { opacity: 0, scale: 0.8 }, 
                { opacity: 0.05, scale: 1, duration: 0.5, ease: "power2.out" }
            , 0);

            // El título pequeño de arriba
            tl.fromTo(".slide-main-title", 
                { opacity: 0, y: -20 }, 
                { opacity: 0.6, y: 0, duration: 0.4, ease: "power2.out" }
            , 0.1);

            // Título principal y descripción (Stagger para efecto cascada)
            tl.fromTo([".slide-title", ".slide-desc"], 
                { opacity: 0, y: 30 }, 
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "back.out(1.2)" }
            , 0.1);

            const dots = modalBody.querySelectorAll('.indicator-dot');
            dots.forEach((dot, i) => {
                dot.onclick = () => { if (i !== currentIndex) { currentIndex = i; changeSlide(); } };
            });
        };

        renderSlide(0);
        modal.classList.add('active');

        // Lógica de Scroll (Ajustada para Touchpad)
        modalContainer.onwheel = (e) => {
            // Permitimos scroll normal si es móvil (overflow auto)
            if(window.innerWidth < 768) return;

            e.preventDefault();
            
            // Si está animando, bloqueamos.
            if (isAnimating) return; 

            // UMBRAL DE SENSIBILIDAD
            if (Math.abs(e.deltaY) < 20) return;

            if (e.deltaY > 0) { 
                currentIndex = (currentIndex + 1) % totalSlides; 
                changeSlide(); 
            } else { 
                currentIndex = (currentIndex - 1 + totalSlides) % totalSlides; 
                changeSlide(); 
            }
        };

        function changeSlide() { 
            isAnimating = true; 
            renderSlide(currentIndex); 
            setTimeout(() => { isAnimating = false; }, 250); 
        }
    }

    function openProjectModal(title, category, colorClass) {
        modalContainer.className = `modal-content`; 
        modalContainer.style.background = "#111"; // Fondo oscuro fijo
        modalContainer.onwheel = null; 
        
        const stackIcons = [
            { icon: 'fa-html5', name: 'HTML5' }, { icon: 'fa-css3-alt', name: 'CSS3' },
            { icon: 'fa-js', name: 'JavaScript' }, { icon: 'fa-react', name: 'React' }
        ];

        const stackHTML = stackIcons.map(tech => `
            <div class="tech-badge" title="${tech.name}">
                <i class="fa-brands ${tech.icon}"></i>
            </div>
        `).join('');

        modalBody.innerHTML = `
            <div class="project-modal-layout">
                <div class="project-modal-img ${colorClass}"></div>
                <div class="project-modal-info">
                    <span style="color: #2E86FB; font-weight: bold; text-transform: uppercase; margin-bottom:10px">${category}</span>
                    <h2>${title}</h2>
                    <p>Este proyecto representa una solución integral desarrollada por ReCode+. Implementamos tecnologías modernas, optimización SEO y una experiencia de usuario (UX) diseñada para convertir visitantes en clientes fieles.</p>
                    
                    <span class="tech-stack-label">Stack Tecnológico:</span>
                    <div class="tech-stack-row">${stackHTML}</div>

                    <a href="#" class="btn-primary">Ver Sitio en Vivo ↗</a>
                </div>
            </div>
        `;
        modal.classList.add('active');
    }

    document.querySelectorAll('.btn-explorar').forEach(btn => {
        btn.addEventListener('click', () => { const key = btn.getAttribute('data-service'); openServiceModal(key); });
    });
    document.querySelectorAll('.project-open').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.project-card');
            const title = card.querySelector('.project-title').innerText;
            const category = card.querySelector('.project-meta').innerText;
            const thumbDiv = card.querySelector('.project-thumb');
            const colorClass = Array.from(thumbDiv.classList).find(c => c.startsWith('thumb-'));
            openProjectModal(title, category, colorClass);
        });
    });

    if(closeBtn) closeBtn.onclick = () => modal.classList.remove('active');
    window.onclick = (e) => { if (e.target == modal) modal.classList.remove('active'); };

    // UTILS
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    // Solo activar cursor custom en PC (width > 768)
    if (cursorDot && cursorOutline && window.matchMedia("(min-width: 768px)").matches) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX; const posY = e.clientY;
            cursorDot.style.left = `${posX}px`; cursorDot.style.top = `${posY}px`;
            cursorOutline.animate({ left: `${posX}px`, top: `${posY}px` }, { duration: 500, fill: "forwards" });
        });
    }

    // ANIMACION DE TITULOS BI-DIRECCIONAL (Scroll Arriba/Abajo)
    const titles = document.querySelectorAll('.bi-anim-title');
    titles.forEach(title => {
        // Inicialmente oculto
        gsap.set(title, { opacity: 0 });

        ScrollTrigger.create({
            trigger: title,
            start: "top 85%", // Cuando el top del elemento llega al 85% de la pantalla
            end: "bottom 15%",
            onEnter: () => {
                // Bajando: Entra subiendo
                gsap.fromTo(title, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", overwrite: true });
            },
            onLeaveBack: () => {
                // Saliendo hacia abajo (reseteo)
                gsap.to(title, { y: 50, opacity: 0, duration: 0.5, overwrite: true });
            },
            onEnterBack: () => {
                // Subiendo: Entra bajando
                gsap.fromTo(title, { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", overwrite: true });
            },
            onLeave: () => {
                // Saliendo hacia arriba (reseteo)
                gsap.to(title, { y: -50, opacity: 0, duration: 0.5, overwrite: true });
            }
        });
    });

    // =========================================
    // ANIMACIÓN PÁRRAFOS "ACERCA" (ALTERNADA)
    // =========================================
    const acercaParagraphs = document.querySelectorAll('.acerca-text p');
    acercaParagraphs.forEach((p, index) => {
        const direction = index % 2 === 0 ? -100 : 100;
        
        gsap.fromTo(p, 
            { opacity: 0, x: direction },
            { 
                opacity: 1, 
                x: 0, 
                duration: 1, 
                ease: "power3.out",
                scrollTrigger: {
                    trigger: p,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // ANIMACIONES SERVICIOS
    const serviceCards = document.querySelectorAll('.servicio-feature');
    if (serviceCards.length > 0) {
        serviceCards.forEach((card, index) => {
            const isLeft = index % 2 === 0;
            card.dataset.side = isLeft ? "left" : "right";
            gsap.set(card, { x: isLeft ? -100 : 100, y: 50, opacity: 0, scale: 0.95 });
        });
        
        ScrollTrigger.batch(".servicio-feature", {
            trigger: ".servicios-grid", start: "top 80%", end: "bottom 20%",
            onEnter: batch => {
                // 1. Animación entrada Cards
                gsap.to(batch, { x: 0, y: 0, opacity: 1, scale: 1, stagger: 0.15, duration: 1.2, ease: "power3.out", overwrite: true });
                
                // 2. Animación Emojis/Stickers (Rotación después de llegada)
                const icons = batch.map(c => c.querySelector('.icon'));
                gsap.fromTo(icons, 
                    { rotation: 0 }, 
                    { 
                        rotation: 360, 
                        duration: 1, 
                        ease: "back.out(2)", 
                        delay: 1, // Espera a que la card casi termine
                        stagger: 0.15 // Sincronizado con las cards
                    }
                );
            },
            onLeaveBack: batch => {
                batch.forEach(card => {
                    const xDir = card.dataset.side === "left" ? -100 : 100;
                    gsap.to(card, { opacity: 0, x: xDir, y: 50, duration: 0.8, ease: "power2.in" });
                });
            },
            onLeave: batch => gsap.to(batch, { opacity: 0, y: -50, duration: 0.8, overwrite: true }),
            onEnterBack: batch => {
                // Re-entrada al subir
                gsap.to(batch, { opacity: 1, x: 0, y: 0, scale: 1, stagger: 0.15, duration: 1, ease: "power3.out", overwrite: true });
                
                // Re-animación Emojis al subir
                const icons = batch.map(c => c.querySelector('.icon'));
                gsap.fromTo(icons, 
                    { rotation: 0 }, 
                    { rotation: 360, duration: 1, ease: "back.out(2)", delay: 0.8, stagger: 0.15 }
                );
            }
        });
    }

    gsap.set(".project-card", { y: 100, opacity: 0, scale: 0.95, filter: "grayscale(100%)" });
    ScrollTrigger.batch(".project-card", {
        trigger: ".projects-grid", start: "top 85%", end: "bottom 15%",
        onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, scale: 1, filter: "grayscale(0%)", stagger: 0.15, duration: 0.8, ease: "power3.out", overwrite: true }),
        onLeave: batch => gsap.to(batch, { opacity: 0, y: -100, stagger: 0.1, duration: 0.6, ease: "power2.in", overwrite: true }),
        onEnterBack: batch => gsap.to(batch, { opacity: 1, y: 0, scale: 1, filter: "grayscale(0%)", stagger: 0.15, duration: 0.8, ease: "power3.out", overwrite: true }),
        onLeaveBack: batch => gsap.to(batch, { opacity: 0, y: 100, filter: "grayscale(100%)", stagger: 0.1, duration: 0.6, ease: "power2.in", overwrite: true })
    });

    gsap.set(".tech-card", { opacity: 0, rotateY: 90, scale: 0.8 });
    ScrollTrigger.batch(".tech-card", {
        trigger: ".tech-grid-premium", start: "top 85%",
        onEnter: batch => gsap.to(batch, { opacity: 1, rotateY: 0, scale: 1, y: 0, stagger: 0.05, duration: 0.6, ease: "back.out(1.7)", overwrite: true }),
        onLeave: batch => gsap.to(batch, { opacity: 0, y: -50, duration: 0.5, overwrite: true }),
        onEnterBack: batch => gsap.to(batch, { opacity: 1, rotateY: 0, scale: 1, y: 0, stagger: 0.05, duration: 0.6, overwrite: true }),
        onLeaveBack: batch => gsap.to(batch, { opacity: 0, rotateY: 90, duration: 0.5, overwrite: true })
    });

    // =========================================
    // 3. ANIMACIONES REDES SOCIALES (CONECTA) - SECUENCIA OLA
    // =========================================
    gsap.set(".card-x", { x: -150, opacity: 0 });          
    gsap.set(".card-tiktok", { y: 150, opacity: 0 });      
    gsap.set(".card-instagram", { y: 150, opacity: 0 });   
    gsap.set(".card-facebook", { x: 150, opacity: 0 });    

    ScrollTrigger.create({
        trigger: ".redes-grid-3d",
        start: "top 85%", 
        onEnter: () => {
            const tl = gsap.timeline();

            // 1. Entrada de las cartas
            tl.to(".card-x", { x: 0, opacity: 1, duration: 1, ease: "power3.out" })
              .to(".card-tiktok", { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, "-=0.8") 
              .to(".card-instagram", { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, "-=0.8")
              .to(".card-facebook", { x: 0, opacity: 1, duration: 1, ease: "power3.out" }, "-=0.8");

            // 2. Ola de "Hover"
            const cards = [".card-x", ".card-tiktok", ".card-instagram", ".card-facebook"];
            cards.forEach((selector, i) => {
                tl.add(() => { document.querySelector(selector).classList.add('hover-trigger'); }, `-=0.5`); 
                tl.add(() => { document.querySelector(selector).classList.remove('hover-trigger'); }, "+=0.4"); 
            });
        },
        onLeaveBack: () => {
            gsap.to(".card-x", { x: -150, opacity: 0, duration: 0.5 });
            gsap.to(".card-tiktok", { y: 150, opacity: 0, duration: 0.5 });
            gsap.to(".card-instagram", { y: 150, opacity: 0, duration: 0.5 });
            gsap.to(".card-facebook", { x: 150, opacity: 0, duration: 0.5 });
            document.querySelectorAll('.social-3d-card').forEach(el => el.classList.remove('hover-trigger'));
        }
    });

    const statNumbers = document.querySelectorAll('.stat-num');
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.hasAttribute('data-animated')) {
                const element = entry.target;
                const suffix = element.getAttribute('data-suffix') || '';
                const target = parseInt(element.getAttribute('data-target'));
                if (!isNaN(target)) {
                    element.setAttribute('data-animated', 'true');
                    element.closest('.stat-module').classList.add('visible');
                    animateNumber(element, 0, target, 2500, suffix);
                }
            }
        });
    }, { threshold: 0.5 });
    statNumbers.forEach(stat => statsObserver.observe(stat));

    function animateNumber(element, start, end, duration, suffix = '') {
        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3); 
            const current = Math.floor(start + (end - start) * easeOut);
            element.textContent = current + suffix;
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    document.querySelectorAll('.tilt-card:not(.contacto-section .tilt-card)').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; const y = e.clientY - rect.top;
            const xCenter = rect.width / 2; const yCenter = rect.height / 2;
            const rotateX = ((y - yCenter) / yCenter) * -5; const rotateY = ((x - xCenter) / xCenter) * 5;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });
        card.addEventListener('mouseleave', () => card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)');
    });

    // =========================================
    // BARRA DE PROGRESO DE SCROLL DINÁMICA (OPTIMIZADA)
    // =========================================
    const scrollProgress = document.createElement('div'); 
    scrollProgress.className = 'scroll-progress'; 
    document.body.appendChild(scrollProgress);

    // Optimización con requestAnimationFrame para evitar lag al scrollear
    let lastScrollY = window.scrollY;
    let ticking = false;

    window.addEventListener('scroll', () => {
        lastScrollY = window.scrollY;
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollPercent = (lastScrollY / docHeight) * 100; 
                scrollProgress.style.transform = `scaleX(${scrollPercent / 100})`;
                ticking = false;
            });
            ticking = true;
        }
    });

    // Indicador de Scroll Hero (Original)
    window.addEventListener('scroll', () => {
        const scrollInd = document.querySelector('.hero-scroll-indicator');
        if (window.scrollY < 50) {
            if (scrollInd) scrollInd.style.opacity = '1';
        } else {
            if (scrollInd) scrollInd.style.opacity = '0';
        }
    });

    // =========================================
    // NAVBAR Y LOGO FINAL (MODIFICADO Y SENSIBLE)
    // =========================================
    const navbar = document.querySelector('.smart-navbar');
    // NUEVA LÓGICA DEL LOGO: DETECCIÓN DE SECCIÓN (NO SCROLL ABSOLUTO)
    const finalSection = document.querySelector('.final-hero');
    const finalLogo = document.getElementById('final-logo-container');
    
    let lastNavScrollY = window.scrollY;
    let isAutoScrolling = false;

    document.querySelectorAll('.menu a, .contacto, .mouse-icon').forEach(link => {
        link.addEventListener('click', () => {
            isAutoScrolling = true;
            setTimeout(() => { isAutoScrolling = false; }, 1200);
        });
    });

    // 1. Navbar (Sigue usando scroll normal para esconderse/mostrarse)
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        if (isAutoScrolling) return;

        // Detectar si estamos cerca del fondo para forzar mostrar navbar
        const distToBottom = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
        
        if (distToBottom < 200) {
             navbar.classList.remove('nav-hidden'); // Mostrar siempre al final
        } else if (currentScrollY > lastNavScrollY && currentScrollY > 100) {
            navbar.classList.add('nav-hidden'); // Ocultar al bajar
        } else {
            navbar.classList.remove('nav-hidden'); // Mostrar al subir
        }
        lastNavScrollY = currentScrollY;
    });

    const createStars = () => {
        const starsWrapper = document.createElement('div'); starsWrapper.className = 'stars-wrapper';
        Object.assign(starsWrapper.style, { position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '0', overflow: 'hidden' });
        document.body.prepend(starsWrapper);
        const starsContainer = document.createElement('div'); starsContainer.className = 'stars-container';
        Object.assign(starsContainer.style, { position: 'absolute', top: '0', left: '0', width: '100%', height: `${document.documentElement.scrollHeight}px` });
        starsWrapper.appendChild(starsContainer);
        window.addEventListener('scroll', () => starsContainer.style.transform = `translateY(-${window.pageYOffset * 0.2}px)`);
        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div'); star.className = 'star';
            star.style.left = `${Math.random() * 100}%`; star.style.top = `${Math.random() * 100}%`;
            starsContainer.appendChild(star);
        }
    };
    setTimeout(() => { createStars(); }, 100);

    window.addEventListener('click', (e) => {
        const ripple = document.createElement('div'); ripple.className = 'click-ripple';
        ripple.style.left = `${e.clientX}px`; ripple.style.top = `${e.clientY}px`;
        document.body.appendChild(ripple); setTimeout(() => ripple.remove(), 600);
    });

    const updateTime = () => {
        const timeDisplay = document.getElementById('time-display');
        if (timeDisplay) {
            timeDisplay.textContent = new Date().toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
            });
        }
    };
    setInterval(updateTime, 1000); 
    updateTime(); 

    // --- LÓGICA DE CAMBIO DE TEMA CORREGIDA (CENTER LINE) ---
    const sections = [
        { id: 'home', theme: 'dark' },
        { id: 'servicios', theme: 'light' },
        { id: 'portafolio', theme: 'dark' },
        { id: 'acerca', theme: 'light' },
        { id: 'tecnologias', theme: 'dark' },
        { id: 'conecta', theme: 'light' },
        { id: 'contacto', theme: 'dark' }
    ];

    const themeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionConfig = sections.find(s => s.id === entry.target.id);
                if (sectionConfig) {
                    document.body.setAttribute('data-current-theme', sectionConfig.theme);
                }
            }
        });
    }, { 
        rootMargin: "-50% 0px -50% 0px",
        threshold: 0 
    });

    sections.forEach(s => {
        const el = document.getElementById(s.id);
        if (el) themeObserver.observe(el);
    });
});