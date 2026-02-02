/* ===== HACASH PREMIUM JAVASCRIPT ===== */

// ===== DARK MODE SYSTEM =====
class DarkModeManager {
    constructor() {
        this.htmlElement = document.documentElement;
        this.darkModeBtn = document.getElementById('darkModeBtn');
        this.storageKey = 'hacash-theme';
        this.init();
    }

    init() {
        this.loadTheme();
        this.darkModeBtn.addEventListener('click', () => this.toggle());
        this.observeSystemPreference();
    }

    loadTheme() {
        const saved = localStorage.getItem(this.storageKey);
        const isDark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (isDark) {
            this.enable();
        }
    }

    toggle() {
        if (this.htmlElement.classList.contains('dark-mode')) {
            this.disable();
        } else {
            this.enable();
        }
    }

    enable() {
        this.htmlElement.classList.add('dark-mode');
        localStorage.setItem(this.storageKey, 'dark');
        this.updateIcon('☀️');
    }

    disable() {
        this.htmlElement.classList.remove('dark-mode');
        localStorage.setItem(this.storageKey, 'light');
        this.updateIcon('🌙');
    }

    updateIcon(icon) {
        if (this.darkModeBtn) {
            const sunIcon = this.darkModeBtn.querySelector('.sun-icon');
            const moonIcon = this.darkModeBtn.querySelector('.moon-icon');
            sunIcon.textContent = icon;
            moonIcon.textContent = icon;
        }
    }

    observeSystemPreference() {
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                if (e.matches && !localStorage.getItem(this.storageKey)) {
                    this.enable();
                }
            });
        }
    }
}

// ===== NAVIGATION SYSTEM =====
class NavigationManager {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navLinks = document.getElementById('navLinks');
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.navLink = document.querySelectorAll('.nav-link');
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupNavigation();
        this.setupScrollBehavior();
    }

    setupMobileMenu() {
        this.mobileMenuBtn.addEventListener('click', () => {
            this.navLinks.classList.toggle('active');
            this.mobileMenuBtn.classList.toggle('active');
        });

        this.navLink.forEach(link => {
            link.addEventListener('click', () => {
                this.navLinks.classList.remove('active');
                this.mobileMenuBtn.classList.remove('active');
            });
        });
    }

    setupNavigation() {
        const updateNavOnScroll = throttle(() => {
            if (window.scrollY > 50) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
            this.updateActiveLink();
        }, 200);
        
        window.addEventListener('scroll', updateNavOnScroll, { passive: true });
    }

    updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 200;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                this.navLink.forEach(link => link.classList.remove('active'));
                const activeLink = document.querySelector(`a[href="#${section.id}"]`);
                if (activeLink) activeLink.classList.add('active');
            }
        });
    }

    setupScrollBehavior() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href !== '#' && document.querySelector(href)) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }
}

// ===== PRICE TICKER SYSTEM =====
class PriceTickerManager {
    constructor() {
        this.priceValue = document.getElementById('hacPrice');
        this.priceChange = document.getElementById('priceChange');
        this.priceBanner = document.getElementById('priceBanner');
        this.previousPrice = null;
        this.init();
    }

    init() {
        this.fetchPrice();
        setInterval(() => this.fetchPrice(), 30000); // Every 30 seconds
    }

    async fetchPrice() {
        try {
            const timestamp = Date.now(); // Cache buster
            const response = await fetch(
                `https://api.coingecko.com/api/v3/simple/price?ids=hacash&vs_currencies=usd&include_24hr_change=true&t=${timestamp}`
            );
            const data = await response.json();
            
            // Get actual HAC price from CoinGecko
            const hacPrice = data.hacash.usd;
            const change24h = data.hacash.usd_24h_change;
            
            console.log('HAC Price Data:', { hacPrice, change24h });

            this.updatePrice(hacPrice, change24h);
        } catch (error) {
            console.error('Price fetch error:', error);
            this.priceValue.textContent = 'API Error';
        }
    }

    updatePrice(price, change) {
        // Ensure price is a number
        const priceNum = parseFloat(price);
        const changeNum = parseFloat(change);
        
        // Display price with proper formatting
        this.priceValue.textContent = `$${priceNum.toFixed(4)}`;
        
        if (this.priceChange) {
            const changeText = changeNum >= 0 ? `+${changeNum.toFixed(2)}%` : `${changeNum.toFixed(2)}%`;
            this.priceChange.textContent = changeText;
            this.priceChange.className = 'price-change ' + (changeNum >= 0 ? 'positive' : 'negative');

            // Update status indicator
            const priceStatus = document.getElementById('priceStatus');
            if (priceStatus) {
                priceStatus.style.color = changeNum >= 0 ? '#4ade80' : '#ff4757';
            }

            // Animate price change
            this.priceBanner.style.animation = 'none';
            setTimeout(() => {
                this.priceBanner.style.animation = 'price-pulse 0.5s ease-out';
            }, 10);
        }
    }
}

// ===== SECTION REVEAL ANIMATION =====
class SectionRevealManager {
    constructor() {
        this.init();
    }

    init() {
        const sections = document.querySelectorAll('section');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('revealed')) {
                    entry.target.classList.add('revealed');
                    this.animateSection(entry.target);
                }
            });
        }, { threshold: 0.1 });

        sections.forEach(section => observer.observe(section));
    }

    animateSection(section) {
        const elements = section.querySelectorAll('h2, h3, p:not(.price-change)');
        elements.forEach((el, index) => {
            el.style.animation = `slide-in-up 0.8s ease-out ${index * 0.1}s forwards`;
            el.style.opacity = '0';
        });
    }
}

// ===== TOOLTIP SYSTEM =====
class TooltipManager {
    constructor() {
        this.init();
    }

    init() {
        const elements = document.querySelectorAll('[data-tooltip]');
        elements.forEach(el => {
            el.addEventListener('mouseenter', (e) => this.showTooltip(e));
            el.addEventListener('mouseleave', (e) => this.hideTooltip(e));
        });
    }

    showTooltip(event) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip-popup';
        tooltip.textContent = event.target.dataset.tooltip;
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            white-space: nowrap;
            z-index: 10001;
            pointer-events: none;
            animation: tooltip-fade 0.3s ease;
        `;
        document.body.appendChild(tooltip);
        this.positionTooltip(event.target, tooltip);
    }

    hideTooltip(event) {
        const tooltip = document.querySelector('.tooltip-popup');
        if (tooltip) tooltip.remove();
    }

    positionTooltip(element, tooltip) {
        const rect = element.getBoundingClientRect();
        tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';
    }
}

// ===== SCROLL PROGRESS INDICATOR =====
class ScrollProgressManager {
    constructor() {
        this.progressBar = null;
        this.init();
    }

    init() {
        this.createProgressBar();
        window.addEventListener('scroll', () => this.updateProgress());
    }

    createProgressBar() {
        this.progressBar = document.createElement('div');
        this.progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(90deg, #0066cc, #00d084, #0066cc);
            width: 0;
            z-index: 10000;
            transition: width 0.3s ease;
        `;
        document.body.appendChild(this.progressBar);
    }

    updateProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        if (this.progressBar) {
            this.progressBar.style.width = scrollPercent + '%';
        }
    }
}
class MouseTrackingManager {
    constructor() {
        this.handleMouseMove = throttle((e) => this.trackMouse(e), 30);
        this.init();
    }

    init() {
        const cards = document.querySelectorAll('.problem-card, .solution-card, .feature-card');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', this.handleMouseMove, { passive: true });

            card.addEventListener('mouseleave', () => {
                card.style.setProperty('--mouse-x', '50%');
                card.style.setProperty('--mouse-y', '50%');
            });
        });
    }

    trackMouse(e) {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        card.style.setProperty('--mouse-x', x + '%');
        card.style.setProperty('--mouse-y', y + '%');
    }
}

// ===== PARALLAX SCROLL EFFECT =====
class ParticleSystem {
    constructor() {
        this.container = document.getElementById('particleContainer');
        this.particleCount = 50;
        this.init();
    }

    init() {
        this.createParticles();
        window.addEventListener('resize', () => this.handleResize());
    }

    createParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDuration = (2 + Math.random() * 8) + 's';
            particle.style.animationDelay = Math.random() * 5 + 's';
            this.container.appendChild(particle);
        }
    }

    handleResize() {
        if (window.innerWidth < 768) {
            this.container.style.opacity = '0.3';
        } else {
            this.container.style.opacity = '1';
        }
    }
}

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
class ScrollAnimationManager {
    constructor() {
        this.init();
    }

    init() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, (index % 3) * 100);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe cards and items
        const elements = document.querySelectorAll(
            '.problem-card, .solution-card, .feature-card, .stat-item, .faq-item'
        );
        elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            observer.observe(el);
        });
    }
}

// ===== SMOOTH SCROLLING & PERFORMANCE =====
class PerformanceManager {
    constructor() {
        this.init();
    }

    init() {
        // Lazy load images
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        observer.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }

        // Performance monitoring
        window.addEventListener('load', () => {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log('Page load time: ' + pageLoadTime + 'ms');
        });
    }
}

// ===== HERO ANIMATION =====
class HeroManager {
    constructor() {
        this.hero = document.getElementById('hero');
        this.heroGraphic = document.getElementById('heroGraphic');
        this.init();
    }

    init() {
        this.setupParallax();
        this.setupNodeAnimation();
    }

    setupParallax() {
        const handleMouseMove = throttle((e) => {
            if (window.innerWidth < 768) return;

            const heroRect = this.hero.getBoundingClientRect();
            if (heroRect.top > window.innerHeight) return;

            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;

            const moveX = (x - 0.5) * 20;
            const moveY = (y - 0.5) * 20;

            this.heroGraphic.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }, 50);
        
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    setupNodeAnimation() {
        const nodes = document.querySelectorAll('.node');
        nodes.forEach((node, index) => {
            node.addEventListener('mouseenter', () => {
                node.style.filter = 'drop-shadow(0 0 24px rgba(0, 102, 204, 0.8))';
            });
            node.addEventListener('mouseleave', () => {
                node.style.filter = 'drop-shadow(0 0 12px rgba(0, 102, 204, 0.5))';
            });
        });
    }
}

// ===== FAQ SYSTEM =====
class FAQManager {
    constructor() {
        this.faqItems = document.querySelectorAll('.faq-item');
        this.init();
    }

    init() {
        this.faqItems.forEach(item => {
            const summary = item.querySelector('.faq-question');
            summary.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleItem(item);
            });
        });

        // Close other items when one opens
        this.faqItems.forEach(item => {
            item.addEventListener('toggle', () => {
                if (item.open) {
                    this.faqItems.forEach(otherItem => {
                        if (otherItem !== item && otherItem.open) {
                            otherItem.open = false;
                        }
                    });
                }
            });
        });
    }

    toggleItem(item) {
        item.open = !item.open;
    }
}

// ===== BUTTON RIPPLE EFFECT =====
class RippleEffectManager {
    constructor() {
        this.init();
    }

    init() {
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.createRipple(e, button);
            });
        });
    }

    createRipple(event, button) {
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = diameter + 'px';
        circle.style.left = (event.clientX - button.offsetLeft - radius) + 'px';
        circle.style.top = (event.clientY - button.offsetTop - radius) + 'px';
        circle.classList.add('ripple');

        const ripple = button.querySelector('.ripple');
        if (ripple) {
            ripple.remove();
        }
        button.appendChild(circle);
    }
}

// ===== STATS COUNTER ANIMATION =====
class StatsCounterManager {
    constructor() {
        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    entry.target.dataset.animated = 'true';
                    // Stats animation handled by CSS
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.stat-item').forEach(item => {
            observer.observe(item);
        });
    }
}

// ===== CHANNEL FLOW ANIMATION =====
class ChannelFlowManager {
    constructor() {
        this.flowSteps = document.querySelectorAll('.flow-step');
        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.parentElement.dataset.animated) {
                    entry.target.parentElement.dataset.animated = 'true';
                    this.animateFlow();
                }
            });
        }, { threshold: 0.5 });

        this.flowSteps.forEach(step => observer.observe(step));
    }

    animateFlow() {
        let current = 0;
        const animate = () => {
            this.flowSteps.forEach((step, index) => {
                if (index <= current) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });

            current = (current + 1) % this.flowSteps.length;
            setTimeout(animate, 2000);
        };
        animate();
    }
}

// ===== ANALYTICS TRACKING =====
class AnalyticsManager {
    constructor() {
        this.init();
    }

    init() {
        this.trackSectionViews();
        this.trackButtonClicks();
    }

    trackSectionViews() {
        const sections = document.querySelectorAll('section[id]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.trackEvent('section_view', {
                        section: entry.target.id
                    });
                }
            });
        }, { threshold: 0.5 });

        sections.forEach(section => observer.observe(section));
    }

    trackButtonClicks() {
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', () => {
                this.trackEvent('button_click', {
                    text: button.textContent,
                    href: button.href
                });
            });
        });
    }

    trackEvent(eventName, eventData) {
        if (typeof gtag === 'function') {
            gtag('event', eventName, eventData);
        } else {
            console.log(`Event tracked: ${eventName}`, eventData);
        }
    }
}

// ===== PERFORMANCE OPTIMIZATION =====
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// ===== INITIALIZE ALL SYSTEMS ===== 
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Hacash Premium Site Initializing...');

    // Initialize all managers
    new DarkModeManager();
    new NavigationManager();
    new PriceTickerManager();
    new ParticleSystem();
    new ScrollAnimationManager();
    new PerformanceManager();
    new HeroManager();
    new FAQManager();
    new RippleEffectManager();
    new StatsCounterManager();
    new ChannelFlowManager();
    new AnalyticsManager();
    new MouseTrackingManager();
    new ScrollProgressManager();
    new TooltipManager();
    new SectionRevealManager();

    console.log('✅ All systems initialized successfully!');
}, { once: true });

// ===== SMOOTH SCROLL ENHANCEMENT =====
if (CSS.supports('scroll-behavior', 'smooth')) {
    document.documentElement.style.scrollBehavior = 'smooth';
}

// ===== ACCESSIBILITY ENHANCEMENTS =====
const handleEscapeKey = (e) => {
    if (e.key === 'Escape') {
        const navLinks = document.getElementById('navLinks');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        if (navLinks?.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileMenuBtn?.classList.remove('active');
        }
    }
};

document.addEventListener('keydown', handleEscapeKey);

// ===== RESPONSIVE OBSERVER =====
const mediaQuery = window.matchMedia('(max-width: 768px)');
const handleMediaChange = () => {
    const navLinks = document.getElementById('navLinks');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mediaQuery.matches) {
        navLinks?.classList.remove('active');
        mobileMenuBtn?.classList.remove('active');
    }
};

mediaQuery.addEventListener('change', handleMediaChange);
