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
        }, { passive: true });

        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') &&
                !navMenu.contains(e.target) &&
                !mobileMenuToggle.contains(e.target)) {
                toggleMenu();
            }
        });

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
            if (!isVisible) return; 
            
            interval = setInterval(() => {
                const nextIndex = (currentIndex + 1) % buttons.length;
                updateSlider(nextIndex);
            }, 6000);
        };

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

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopAutoPlay();
            else if (isVisible) startAutoPlay();
        });

        buttons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                updateSlider(index);
                startAutoPlay();
            });
        });

        track.addEventListener('mouseenter', stopAutoPlay, { passive: true });
        track.addEventListener('mouseleave', () => {
            if (isVisible) startAutoPlay();
        }, { passive: true });
    };

    // ==========================================
    // 4. GALERIA & LIGHTBOX (INTEGRAÇÃO GITHUB API)
    // ==========================================
    const initGallery = async () => {
        
        // --- ⚠️ CONFIGURE AQUI SEUS DADOS ---
        const REPO_CONFIG = {
            owner: 'SEU_USUARIO_GITHUB',      // Ex: 'joao-dev'
            repo: 'NOME_DO_REPOSITORIO',      // Ex: 'portfolio'
            path: 'caminho/para/imagens',     // Ex: 'assets/img/gallery' (sem barra inicial)
            branch: 'main'                    // ou 'master'
        };
        // -------------------------------------

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

        // Estado
        let galleryData = [];
        let renderedCount = 0;
        let lightboxIndex = 0;
        const INITIAL_LOAD = 6;
        const LOAD_STEP = 3;
        const preloadedImages = new Set();

        // 1. Fetch do GitHub
        const fetchGitHubImages = async () => {
            try {
                // Se o botão existir, mostra status de carregando (opcional)
                if(elements.loadBtn) elements.loadBtn.textContent = 'Carregando...';

                const url = `https://api.github.com/repos/${REPO_CONFIG.owner}/${REPO_CONFIG.repo}/contents/${REPO_CONFIG.path}?ref=${REPO_CONFIG.branch}`;
                
                const response = await fetch(url);
                if (!response.ok) {
                    if (response.status === 404) throw new Error('Pasta não encontrada no repositório.');
                    throw new Error('Erro ao conectar com GitHub.');
                }
                
                const data = await response.json();

                // Filtra e Mapeia
                galleryData = data
                    .filter(file => file.type === 'file' && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name))
                    .map(file => ({
                        thumb: file.download_url, // URL Raw do GitHub
                        full: file.download_url,
                        alt: file.name.replace(/\.[^/.]+$/, "").replace(/-/g, " ")
                    }));

                if (galleryData.length === 0) {
                    elements.grid.innerHTML = '<p style="text-align:center; color:#888;">Nenhuma imagem encontrada na pasta.</p>';
                    if(elements.loadBtn) elements.loadBtn.style.display = 'none';
                    return;
                }

                if(elements.loadBtn) elements.loadBtn.textContent = 'Carregar Mais';
                
                // Renderiza lote inicial
                renderImages(INITIAL_LOAD);

            } catch (error) {
                console.error('GitHub Gallery Error:', error);
                elements.grid.innerHTML = `<p style="text-align:center; color:#ff6b6b;">Erro ao carregar galeria.<br><small>${error.message}</small></p>`;
                if(elements.loadBtn) elements.loadBtn.style.display = 'none';
            }
        };

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

            window.requestAnimationFrame(() => {
                elements.grid.appendChild(fragment);
                renderedCount = limit;
                if (elements.loadBtn) {
                    elements.loadBtn.style.display = (renderedCount >= total) ? 'none' : 'inline-block';
                }
            });
        };

        // Event Delegation (Click no Grid)
        elements.grid.addEventListener('click', (e) => {
            const card = e.target.closest('.gallery-item');
            if (card) {
                openLightbox(parseInt(card.dataset.index, 10));
            }
        });

        const updateLightbox = () => {
            const item = galleryData[lightboxIndex];
            if (!item) return;

            window.requestAnimationFrame(() => {
                elements.modalImg.src = item.full;
                elements.modalImg.alt = item.alt;
                
                if(elements.counter) elements.counter.textContent = `${lightboxIndex + 1} / ${galleryData.length}`;
                
                if(elements.dots) {
                    // Atualização visual dos dots
                    const dotsArray = Array.from(elements.dots.children);
                    // Segurança caso os dots não batam com os dados
                    if (dotsArray.length === galleryData.length) {
                        dotsArray.forEach((dot, i) => {
                            if (i === lightboxIndex) dot.classList.add('active');
                            else dot.classList.remove('active');
                        });
                    }
                }
            });

            // Preload vizinhos
            setTimeout(() => {
                const total = galleryData.length;
                preloadImage(galleryData[(lightboxIndex + 1) % total]?.full);
                preloadImage(galleryData[(lightboxIndex - 1 + total) % total]?.full);
            }, 100);
        };

        const openLightbox = (index) => {
            lightboxIndex = index;
            renderDots();
            updateLightbox();
            elements.modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        const closeLightbox = () => {
            elements.modal.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => {
                if(!elements.modal.classList.contains('active')) {
                    elements.modalImg.src = '';
                }
            }, 300);
        };

        const renderDots = () => {
            if(!elements.dots) return;
            elements.dots.innerHTML = '';
            
            const fragment = document.createDocumentFragment();
            galleryData.forEach((_, i) => {
                const dot = document.createElement('div');
                dot.className = (i === lightboxIndex) ? 'l-dot active' : 'l-dot';
                dot.onclick = (e) => {
                    e.stopPropagation();
                    lightboxIndex = i;
                    updateLightbox();
                };
                fragment.appendChild(dot);
            });
            elements.dots.appendChild(fragment);
        };

        // Listeners
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

        // Inicia o processo
        fetchGitHubImages();
    };

    // ==========================================
    // EXECUÇÃO ORQUESTRADA
    // ==========================================
    initNavbarScroll();
    initMobileMenu();
    
    // Deferir scripts não críticos (Galeria e Testimonial)
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
