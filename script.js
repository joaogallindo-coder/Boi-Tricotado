document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. NAVBAR SCROLL (OTIMIZADO COM TICKING)
    // ==========================================
    const initNavbarScroll = () => {
        const navbar = document.getElementById('navbar');
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
    // 2. MENU MOBILE (MANTIDO - LEVE E FUNCIONAL)
    // ==========================================
    const initMobileMenu = () => {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const navMenu = document.getElementById('navMenu');
        const menuIcon = mobileMenuToggle.querySelector('i');

        if (!mobileMenuToggle || !navMenu) return;

        const toggleMenu = () => {
            const isActive = navMenu.classList.toggle('active');
            if (isActive) {
                menuIcon.classList.remove('fa-bars');
                menuIcon.classList.add('fa-times');
            } else {
                menuIcon.classList.remove('fa-times');
                menuIcon.classList.add('fa-bars');
            }
            mobileMenuToggle.setAttribute('aria-expanded', isActive);
        };

        mobileMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') &&
                !navMenu.contains(e.target) &&
                !mobileMenuToggle.contains(e.target)) {
                toggleMenu();
            }
        });

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                const target = document.querySelector(targetId);
                if (target) {
                    if (navMenu.classList.contains('active')) toggleMenu();
                }
            });
        });
    };

    // ==========================================
    // 3. TESTIMONIAL SLIDER (MANTIDO)
    // ==========================================
    const initTestimonials = () => {
        const track = document.getElementById('testimonialTrack');
        const buttons = document.querySelectorAll('.slider-btn');
        
        if (!track) return;

        let currentIndex = 0;
        let interval;

        const updateSlider = (index) => {
            currentIndex = index;
            track.style.transform = `translateX(-${index * 100}%)`;
            
            buttons.forEach((btn, i) => {
                btn.classList.toggle('active', i === index);
            });
        };

        const startAutoPlay = () => {
            clearInterval(interval);
            interval = setInterval(() => {
                currentIndex = (currentIndex + 1) % buttons.length;
                updateSlider(currentIndex);
            }, 6000);
        };

        buttons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                updateSlider(index);
                startAutoPlay();
            });
        });

        track.addEventListener('mouseenter', () => clearInterval(interval));
        track.addEventListener('mouseleave', startAutoPlay);

        startAutoPlay();
    };

    // ==========================================
    // 4. GALERIA & LIGHTBOX (PERFORMANCE MODE)
    // ==========================================
    const initGallery = () => {
        // OTIMIZAÇÃO: Estrutura preparada para Thumbnails vs Full
        // Se não tiver thumbnail real, usa a mesma imagem, mas a lógica está pronta.
        const galleryData = [
            { thumb: 'img/4.jpg', full: 'img/4.jpg', alt: 'Galeria 9' },
            { thumb: 'img/5.jpg', full: 'img/5.jpg', alt: 'Galeria 5' },
            { thumb: 'img/8.jpg', full: 'img/8.jpg', alt: 'Galeria 8' },
            { thumb: 'img/6.jpg', full: 'img/6.jpg', alt: 'Galeria 4' },
            { thumb: 'img/9.jpg', full: 'img/9.jpg', alt: 'Galeria 5' },
            { thumb: 'img/3.jpg', full: 'img/3.jpg', alt: 'Galeria 6' },
            { thumb: 'img/7.jpg', full: 'img/7.jpg', alt: 'Extra 1' },
            { thumb: 'img/1.jpg', full: 'img/1.jpg', alt: 'Extra 2' },
            { thumb: 'img/2.jpg', full: 'img/2.jpg', alt: 'Extra 3' },
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
        
        // Cache de imagens pré-carregadas para evitar requisições duplas
        const preloadedImages = new Set();

        // Função auxiliar de Preload (Não bloqueante)
        const preloadImage = (url) => {
            if (!url || preloadedImages.has(url)) return;
            const img = new Image();
            img.src = url;
            preloadedImages.add(url);
        };

        const renderImages = (count) => {
            const total = galleryData.length;
            const limit = Math.min(renderedCount + count, total);
            const fragment = document.createDocumentFragment();

            for (let i = renderedCount; i < limit; i++) {
                const item = galleryData[i];
                const card = document.createElement('div');
                card.className = 'gallery-item';
                // Dataset armazena o índice para Event Delegation
                card.dataset.index = i; 
                
                // OTIMIZAÇÃO: decoding="async" ajuda a não travar a renderização da página
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

            elements.grid.appendChild(fragment);
            renderedCount = limit;

            if (renderedCount >= total && elements.loadBtn) {
                elements.loadBtn.style.display = 'none';
            }
        };

        // OTIMIZAÇÃO: Event Delegation (1 listener para todo o grid)
        elements.grid.addEventListener('click', (e) => {
            const card = e.target.closest('.gallery-item');
            if (card) {
                const index = parseInt(card.dataset.index, 10);
                openLightbox(index);
            }
        });

        const updateLightbox = () => {
            const item = galleryData[lightboxIndex];
            
            // Troca de imagem
            elements.modalImg.src = item.full;
            elements.modalImg.alt = item.alt;
            
            if(elements.counter) elements.counter.textContent = `${lightboxIndex + 1} / ${galleryData.length}`;
            updateDotsState();

            // OTIMIZAÇÃO CRÍTICA: Preload dos vizinhos
            // Carrega a próxima e a anterior enquanto o usuário vê a atual
            const total = galleryData.length;
            const nextIndex = (lightboxIndex + 1) % total;
            const prevIndex = (lightboxIndex - 1 + total) % total;

            // setTimeout para garantir que o navegador priorize a imagem atual primeiro
            setTimeout(() => {
                preloadImage(galleryData[nextIndex].full);
                preloadImage(galleryData[prevIndex].full);
            }, 200);
        };

        const openLightbox = (index) => {
            lightboxIndex = index;
            updateLightbox();
            renderDots();
            elements.modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        const closeLightbox = () => {
            elements.modal.classList.remove('active');
            document.body.style.overflow = '';
            // Limpar src libera memória da imagem pesada se o usuário ficar muito tempo fora do lightbox
            setTimeout(() => {
                if(!elements.modal.classList.contains('active')) {
                    elements.modalImg.src = ''; 
                }
            }, 300); 
        };

        const navigate = (direction) => {
            const total = galleryData.length;
            lightboxIndex = (lightboxIndex + direction + total) % total;
            updateLightbox();
        };

        const renderDots = () => {
            if(!elements.dots) return;
            elements.dots.innerHTML = '';
            const fragment = document.createDocumentFragment();
            
            galleryData.forEach((_, i) => {
                const dot = document.createElement('div');
                dot.className = `l-dot ${i === lightboxIndex ? 'active' : ''}`;
                // Event Delegation poderia ser usado aqui também, mas dots são poucos
                dot.onclick = (e) => {
                    e.stopPropagation();
                    lightboxIndex = i;
                    updateLightbox();
                };
                fragment.appendChild(dot);
            });
            elements.dots.appendChild(fragment);
        };

        const updateDotsState = () => {
            if(!elements.dots) return;
            Array.from(elements.dots.children).forEach((dot, i) => {
                dot.classList.toggle('active', i === lightboxIndex);
            });
        };

        // Listeners
        if(elements.loadBtn) elements.loadBtn.onclick = () => renderImages(LOAD_STEP);
        elements.closeBtn.onclick = closeLightbox;
        elements.prevBtn.onclick = (e) => { e.stopPropagation(); navigate(-1); };
        elements.nextBtn.onclick = (e) => { e.stopPropagation(); navigate(1); };
        
        elements.modal.onclick = (e) => {
            if (e.target === elements.modal) closeLightbox();
        };

        document.addEventListener('keydown', (e) => {
            if (!elements.modal.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') navigate(-1);
            if (e.key === 'ArrowRight') navigate(1);
        });

        // Inicializa
        renderImages(INITIAL_LOAD);
    };

    // Execução
    initNavbarScroll();
    initMobileMenu();
    initTestimonials();
    initGallery();
});