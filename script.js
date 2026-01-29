document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. NAVBAR SCROLL
    // ==========================================
    const initNavbarScroll = () => {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;
        
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    navbar.classList.toggle('scrolled', window.scrollY > 50);
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    };

    // ==========================================
    // 2. MENU MOBILE
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
                    menuIcon.classList.toggle('fa-bars', !isActive);
                    menuIcon.classList.toggle('fa-times', isActive);
                }
                mobileMenuToggle.setAttribute('aria-expanded', isActive);
            });
        };

        mobileMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        }, { passive: true });

        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                toggleMenu();
            }
        });

        navMenu.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
                if (navMenu.classList.contains('active')) toggleMenu();
            }
        });
    };

    // ==========================================
    // 3. TESTIMONIAL SLIDER
    // ==========================================
    const initTestimonials = () => {
        const track = document.getElementById('testimonialTrack');
        const buttons = document.querySelectorAll('.slider-btn');
        const container = document.querySelector('.testimonials-container');
        
        if (!track || !container) return;

        let currentIndex = 0;
        let interval;
        let isVisible = true; // Assume visível inicialmente

        const updateSlider = (index) => {
            currentIndex = index;
            window.requestAnimationFrame(() => {
                track.style.transform = `translateX(-${index * 100}%)`;
                buttons.forEach((btn, i) => btn.classList.toggle('active', i === index));
            });
        };

        const startAutoPlay = () => {
            clearInterval(interval);
            if (!isVisible) return;
            interval = setInterval(() => {
                updateSlider((currentIndex + 1) % buttons.length);
            }, 6000);
        };

        // Observer para pausar quando sair da tela
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                isVisible = entries[0].isIntersecting;
                isVisible ? startAutoPlay() : clearInterval(interval);
            }, { threshold: 0.1 });
            observer.observe(container);
        } else {
            startAutoPlay();
        }

        buttons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                updateSlider(index);
                startAutoPlay();
            });
        });

        track.addEventListener('mouseenter', () => clearInterval(interval), { passive: true });
        track.addEventListener('mouseleave', () => { if(isVisible) startAutoPlay() }, { passive: true });
    };

    // ==========================================
    // 4. GALERIA HÍBRIDA (CLOUDINARY + GITHUB)
    // ==========================================
    const initGallery = async () => {
        
        // --- SEUS DADOS DO GITHUB ---
        // Mesmo sem imagens lá agora, mantenha configurado para o futuro.
        const REPO_CONFIG = {
            owner: 'SEU_USUARIO_GITHUB', 
            repo: 'NOME_DO_REPOSITORIO',
            path: 'assets/img/gallery',   
            branch: 'main'
        };

        // --- SUAS IMAGENS ORIGINAIS (CLOUDINARY) ---
        const staticImages = [
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

        // Inicia com as estáticas
        let galleryData = [...staticImages];
        let renderedCount = 0;
        let lightboxIndex = 0;
        const INITIAL_LOAD = 6;
        const LOAD_STEP = 3;
        const preloadedImages = new Set();

        // Verifica GitHub (Silencioso se falhar)
        const fetchGitHubImages = async () => {
            try {
                const url = `https://api.github.com/repos/${REPO_CONFIG.owner}/${REPO_CONFIG.repo}/contents/${REPO_CONFIG.path}?ref=${REPO_CONFIG.branch}`;
                const response = await fetch(url);
                
                // Se der 404 (pasta vazia/não existe), apenas retorna sem erro
                if (response.status === 404) return;
                if (!response.ok) return;

                const data = await response.json();
                
                const githubImages = data
                    .filter(file => file.type === 'file' && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name))
                    .map(file => ({
                        thumb: file.download_url,
                        full: file.download_url,
                        alt: file.name.replace(/\.[^/.]+$/, "").replace(/-/g, " ")
                    }));

                // Se achou imagens novas, adiciona e atualiza UI
                if (githubImages.length > 0) {
                    galleryData = [...staticImages, ...githubImages];
                    
                    // Se o usuário já viu tudo das estáticas, mostra botão "Carregar Mais" para as novas
                    if (renderedCount >= staticImages.length && elements.loadBtn) {
                        elements.loadBtn.style.display = 'inline-block';
                        elements.loadBtn.textContent = 'Carregar Mais';
                    }
                }
            } catch (error) {
                // Silêncio é ouro: não polui o console se não configurar o GitHub agora
            }
        };

        const renderImages = (count) => {
            const total = galleryData.length;
            if (renderedCount >= total && renderedCount > 0) {
                 if (elements.loadBtn) elements.loadBtn.style.display = 'none';
                 return;
            }

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

        // --- Lightbox ---
        elements.grid.addEventListener('click', (e) => {
            const card = e.target.closest('.gallery-item');
            if (card) openLightbox(parseInt(card.dataset.index, 10));
        });

        const updateLightbox = () => {
            const item = galleryData[lightboxIndex];
            if (!item) return;

            window.requestAnimationFrame(() => {
                elements.modalImg.src = item.full;
                elements.modalImg.alt = item.alt;
                if(elements.counter) elements.counter.textContent = `${lightboxIndex + 1} / ${galleryData.length}`;
                
                if(elements.dots) {
                    if (elements.dots.childElementCount !== galleryData.length) renderDots();
                    Array.from(elements.dots.children).forEach((dot, i) => {
                        dot.classList.toggle('active', i === lightboxIndex);
                    });
                }
            });
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
                if(!elements.modal.classList.contains('active')) elements.modalImg.src = '';
            }, 300);
        };

        const renderDots = () => {
            if(!elements.dots) return;
            elements.dots.innerHTML = '';
            const fragment = document.createDocumentFragment();
            galleryData.forEach((_, i) => {
                const dot = document.createElement('div');
                dot.className = i === lightboxIndex ? 'l-dot active' : 'l-dot';
                dot.onclick = (e) => { e.stopPropagation(); lightboxIndex = i; updateLightbox(); };
                fragment.appendChild(dot);
            });
            elements.dots.appendChild(fragment);
        };

        if(elements.loadBtn) elements.loadBtn.onclick = () => renderImages(LOAD_STEP);
        elements.closeBtn.onclick = closeLightbox;
        elements.prevBtn.onclick = (e) => { e.stopPropagation(); navigate(-1); };
        elements.nextBtn.onclick = (e) => { e.stopPropagation(); navigate(1); };
        elements.modal.onclick = (e) => { if (e.target === elements.modal) closeLightbox(); };

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

        // 1. Carrega estáticas (Cloudinary) IMEDIATAMENTE
        renderImages(INITIAL_LOAD);
        
        // 2. Verifica GitHub em background (não bloqueia nada se estiver vazio)
        fetchGitHubImages();
    };

    // ==========================================
    // EXECUÇÃO GERAL
    // ==========================================
    initNavbarScroll();
    initMobileMenu();
    
    // Carregamento inteligente (espera o navegador "respirar")
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
