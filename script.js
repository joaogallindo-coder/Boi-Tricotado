document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. NAVBAR SCROLL (OTIMIZADO COM TICKING)
    // ==========================================
    const initNavbarScroll = () => {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;
        
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (window.scrollY > 50) {
                        navbar.classList.add('scrolled');
                    } else {
                        navbar.classList.remove('scrolled');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    };

    // ==========================================
    // 2. MENU MOBILE (OTIMIZADO)
    // ==========================================
    const initMobileMenu = () => {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (!mobileMenuToggle || !navMenu) return;

        const menuIcon = mobileMenuToggle.querySelector('i');

        const toggleMenu = () => {
            // Usa requestAnimationFrame para garantir suavidade na animação CSS
            window.requestAnimationFrame(() => {
                const isActive = navMenu.classList.toggle('active');
                if (menuIcon) {
                    if (isActive) {
                        menuIcon.classList.remove('fa-bars');
                        menuIcon.classList.add('fa-times');
                    } else {
                        menuIcon.classList.remove('fa-times');
                        menuIcon.classList.add('fa-bars');
                    }
                }
                mobileMenuToggle.setAttribute('aria-expanded', isActive);
            });
        };

        mobileMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        }, { passive: true }); // Passive melhora performance de toque

        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') &&
                !navMenu.contains(e.target) &&
                !mobileMenuToggle.contains(e.target)) {
                toggleMenu();
            }
        });

        // Delegação de eventos para links internos
        navMenu.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
                const targetId = e.target.getAttribute('href');
                if (targetId === '#') return;
                
                const target = document.querySelector(targetId);
                if (target && navMenu.classList.contains('active')) {
                    toggleMenu();
                }
            }
        });
    };

    // ==========================================
    // 3. TESTIMONIAL SLIDER (PERFORMANCE: OBSERVER)
    // ==========================================
    const initTestimonials = () => {
        const track = document.getElementById('testimonialTrack');
        const buttons = document.querySelectorAll('.slider-btn');
        const container = document.querySelector('.testimonials-container');
        
        if (!track || !container) return;

        let currentIndex = 0;
        let interval;
        let isVisible = false;

        const updateSlider = (index) => {
            currentIndex = index;
            window.requestAnimationFrame(() => {
                track.style.transform = `translateX(-${index * 100}%)`;
                buttons.forEach((btn, i) => {
                    if (i === index) btn.classList.add('active');
                    else btn.classList.remove('active');
                });
            });
        };

        const stopAutoPlay = () => clearInterval(interval);

        const startAutoPlay = () => {
            stopAutoPlay();
            // Só inicia se estiver visível para não gastar CPU à toa
            if (!isVisible) return; 
            
            interval = setInterval(() => {
                const nextIndex = (currentIndex + 1) % buttons.length;
                updateSlider(nextIndex);
            }, 6000);
        };

        // Observer: Pausa o slider quando sai da tela (Otimização crítica)
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    isVisible = entry.isIntersecting;
                    if (isVisible) startAutoPlay();
                    else stopAutoPlay();
                });
            }, { threshold: 0.1 });
            observer.observe(container);
        } else {
            isVisible = true;
            startAutoPlay();
        }

        // Pausa se o usuário mudar de aba
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopAutoPlay();
            else if (isVisible) startAutoPlay();
        });

        buttons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                updateSlider(index);
                startAutoPlay(); // Reinicia o timer ao interagir
            });
        });

        track.addEventListener('mouseenter', stopAutoPlay, { passive: true });
        track.addEventListener('mouseleave', () => {
            if (isVisible) startAutoPlay();
        }, { passive: true });
    };

    // ==========================================
    // 4. GALERIA & LIGHTBOX (ZERO LAGGING)
    // ==========================================
    const initGallery = () => {
        const galleryData = [
            { thumb: 'https://res.cloudinary.com/depfruu0c/image/upload/v1769639014/4_vo4miq.jpg', full: 'https://res.cloudinary.com/depfruu0c/image/upload/v1769639014/4_vo4miq.jpg', alt: 'Galeria 9' },
            { thumb: 'https://res.cloudinary.com/depfruu0c/image/upload/v1769639015/5_qnak9q.jpg', full: 'https://res.cloudinary.com/depfruu0c/image/upload/v1769639015/5_qnak9q.jpg', alt: 'Galeria 5' },
            { thumb: 'https://res.cloudinary.com/depfruu0c/image/upload/v1769639017/8_r6jqf9.jpg', full: 'https://res.cloudinary.com/depfruu0c/image/upload/v1769639017/8_r6jqf9.jpg', alt: 'Galeria 8' },
            { thumb: 'https://res.cloudinary.com/depfruu0c/image/upload/v1769639016/6_xiamzn.jpg', full: 'https://res.cloudinary.com/depfruu0c/image/upload/v1769639016/6_xiamzn.jpg', alt: 'Galeria 4' },
            { thumb: 'https://res.cloudinary.com/depfruu0c/image/upload/v1769639022/9_ajpiez.jpg', full: 'https://res.cloudinary.com/depfruu0c/image/upload/v1769639022/9_ajpiez.jpg', alt: 'Galeria 5' },
            { thumb: 'https://res.cloudinary.com/depfruu0c/image/upload/v1769639014/3_cjou3m.jpg', full: 'https://res.cloudinary.com/depfruu0c/image/upload/v1769639014/3_cjou3m.jpg', alt: 'Galeria 6' },
            { thumb: 'https://res.cloudinary.com/depfruu0c/image/upload/v1769639016/7_fi8npu.jpg', full: 'https://res.cloudinary.com/depfruu0c/image/upload/v1769639016/7_fi8npu.jpg', alt: 'Extra 1' },
            { thumb: 'https://res.cloudinary.com/depfruu0c/image/upload/v1769639013/1_qnkqsb.jpg', full: 'https://res.cloudinary.com/depfruu0c/image/upload/v1769639013/1_qnkqsb.jpg', alt: 'Extra 2' },
            { thumb: 'https://res.cloudinary.com/depfruu0c/image/upload/v1769639013/2_r30lbb.jpg', full: 'https://res.cloudinary.com/depfruu0c/image/upload/v1769639013/2_r30lbb.jpg', alt: 'Extra 3' },
        ];

        const elements = {
            grid: document.getElementById('galleryGrid'),
            loadBtn: document.getElementById('loadMoreBtn'),
            modal: document.getElementById('lightboxModal'),
            modalImg: document.getElementById('lightboxImage'),
            counter: document.getElementById('lightboxCounter'),
            dots: document.getElementById('lightboxDots'),
            closeBtn: document.getElementById('closeLightbox'),
            prevBtn: document.getElementById('lightboxPrev'),
            nextBtn: document.getElementById('lightboxNext')
        };

        if (!elements.grid) return;

        let renderedCount = 0;
        let lightboxIndex = 0;
        const INITIAL_LOAD = 6;
        const LOAD_STEP = 3;
        const preloadedImages = new Set();

        const preloadImage = (url) => {
            if (!url || preloadedImages.has(url)) return;
            // Criação de imagem assíncrona que não bloqueia a thread principal
            const img = new Image();
            img.src = url;
            preloadedImages.add(url);
        };

        const renderImages = (count) => {
            const total = galleryData.length;
            const limit = Math.min(renderedCount + count, total);
            
            // DocumentFragment para evitar Reflow/Repaint múltiplo (Muito mais rápido)
            const fragment = document.createDocumentFragment();

            for (let i = renderedCount; i < limit; i++) {
                const item = galleryData[i];
                const card = document.createElement('div');
                card.className = 'gallery-item';
                card.dataset.index = i; 
                
                card.innerHTML = `
                    <img src="${item.thumb}" 
                         alt="${item.alt}" 
                         loading="lazy" 
                         decoding="async"
                         width="400" height="300">
                    <div class="gallery-overlay">
                        <i class="fas fa-search-plus"></i>
                    </div>
                `;
                fragment.appendChild(card);
            }

            // Apenas uma escrita no DOM real
            window.requestAnimationFrame(() => {
                elements.grid.appendChild(fragment);
                renderedCount = limit;
                if (renderedCount >= total && elements.loadBtn) {
                    elements.loadBtn.style.display = 'none';
                }
            });
        };

        // Event Delegation
        elements.grid.addEventListener('click', (e) => {
            const card = e.target.closest('.gallery-item');
            if (card) {
                openLightbox(parseInt(card.dataset.index, 10));
            }
        });

        const updateLightbox = () => {
            const item = galleryData[lightboxIndex];
            
            // RAF garante que a UI atualize sem travar visualmente
            window.requestAnimationFrame(() => {
                elements.modalImg.src = item.full;
                elements.modalImg.alt = item.alt;
                
                if(elements.counter) elements.counter.textContent = `${lightboxIndex + 1} / ${galleryData.length}`;
                
                if(elements.dots) {
                    Array.from(elements.dots.children).forEach((dot, i) => {
                        if (i === lightboxIndex) dot.classList.add('active');
                        else dot.classList.remove('active');
                    });
                }
            });

            // Preload vizinhos em background (sem bloquear UI)
            setTimeout(() => {
                const total = galleryData.length;
                preloadImage(galleryData[(lightboxIndex + 1) % total].full);
                preloadImage(galleryData[(lightboxIndex - 1 + total) % total].full);
            }, 100);
        };

        const openLightbox = (index) => {
            lightboxIndex = index;
            renderDots(); // Renderiza dots apenas uma vez ao abrir
            updateLightbox();
            elements.modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        const closeLightbox = () => {
            elements.modal.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => {
                if(!elements.modal.classList.contains('active')) {
                    elements.modalImg.src = ''; // Limpa memória
                }
            }, 300);
        };

        const renderDots = () => {
            if(!elements.dots) return;
            // Verifica se já existem dots para não recriar desnecessariamente
            if(elements.dots.childElementCount === galleryData.length) return;

            const fragment = document.createDocumentFragment();
            galleryData.forEach((_, i) => {
                const dot = document.createElement('div');
                dot.className = 'l-dot';
                dot.onclick = (e) => {
                    e.stopPropagation();
                    lightboxIndex = i;
                    updateLightbox();
                };
                fragment.appendChild(dot);
            });
            elements.dots.innerHTML = '';
            elements.dots.appendChild(fragment);
        };

        // Listeners otimizados
        if(elements.loadBtn) elements.loadBtn.onclick = () => renderImages(LOAD_STEP);
        elements.closeBtn.onclick = closeLightbox;
        elements.prevBtn.onclick = (e) => { e.stopPropagation(); navigate(-1); };
        elements.nextBtn.onclick = (e) => { e.stopPropagation(); navigate(1); };
        
        elements.modal.onclick = (e) => {
            if (e.target === elements.modal) closeLightbox();
        };

        const navigate = (dir) => {
            lightboxIndex = (lightboxIndex + dir + galleryData.length) % galleryData.length;
            updateLightbox();
        };

        document.addEventListener('keydown', (e) => {
            if (!elements.modal.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') navigate(-1);
            if (e.key === 'ArrowRight') navigate(1);
        });

        // Carregamento inicial diferido para não bloquear o paint principal
        setTimeout(() => renderImages(INITIAL_LOAD), 0);
    };

    // EXECUÇÃO ORQUESTRADA (Evita travamento no load da página)
    initNavbarScroll();
    initMobileMenu();
    
    // Deferir scripts não críticos
    if (window.requestIdleCallback) {
        window.requestIdleCallback(() => {
            initGallery();
            initTestimonials();
        });
    } else {
        setTimeout(() => {
            initGallery();
            initTestimonials();
        }, 50);
    }
});
