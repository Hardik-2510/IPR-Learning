/**
 * ============================================
 * IPR EDUCATIONAL WEBSITE - JAVASCRIPT
 * Multi-Unit Navigation & Interaction System
 * ============================================
 */

// ===== DOM CONTENT LOADED =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎓 IPR Educational Website Initialized');

    // Initialize all components
    UnitNavigation.init();
    SmoothScroll.init();
    KeyboardNavigation.init();
    URLHashHandler.init();
    AnimationController.init();
});

/**
 * ===== UNIT NAVIGATION MODULE =====
 * Handles switching between different course units
 */
const UnitNavigation = {
    currentUnit: 'unit1',
    buttons: null,
    sections: null,

    init: function() {
        // Cache DOM elements
        this.buttons = document.querySelectorAll('.unit-btn');
        this.sections = document.querySelectorAll('.unit-section');

        // Bind click events to all unit buttons
        this.buttons.forEach(button => {
            button.addEventListener('click', (e) => this.handleButtonClick(e));
        });

        // Set initial active state
        this.setActiveUnit('unit1');

        console.log(`✅ Unit Navigation initialized with ${this.buttons.length} units`);
    },

    handleButtonClick: function(event) {
        const button = event.currentTarget;
        const targetUnit = button.getAttribute('data-unit');

        if (!targetUnit) {
            console.warn('⚠️ No data-unit attribute found on button');
            return;
        }

        // Prevent action if already on this unit
        if (targetUnit === this.currentUnit) {
            console.log(`ℹ️ Already on ${targetUnit}`);
            return;
        }

        // Switch to target unit
        this.switchToUnit(targetUnit);
    },

    switchToUnit: function(unitId) {
        if (!this.validateUnit(unitId)) return;

        // Update current unit tracking
        const previousUnit = this.currentUnit;
        this.currentUnit = unitId;

        // Update UI states
        this.updateButtonStates(unitId);
        this.updateSectionVisibility(unitId);

        // Scroll to top of content smoothly
        this.scrollToContent();

        // Update URL hash
        this.updateURLHash(unitId);

        // Log transition
        console.log(`📚 Switched from ${previousUnit} → ${unitId}`);

        // Dispatch custom event for other components
        this.dispatchChangeEvent(unitId, previousUnit);
    },

    validateUnit: function(unitId) {
        const validUnits = ['unit1', 'unit2', 'unit3', 'unit4', 'unit5', 'unit6'];

        if (!validUnits.includes(unitId)) {
            console.error(`❌ Invalid unit ID: ${unitId}. Valid IDs: ${validUnits.join(', ')}`);
            return false;
        }

        return true;
    },

    updateButtonStates: function(activeUnitId) {
        this.buttons.forEach(button => {
            const buttonUnit = button.getAttribute('data-unit');

            if (buttonUnit === activeUnitId) {
                // Activate this button
                button.classList.add('active');
                button.setAttribute('aria-pressed', 'true');

                // Add subtle animation
                button.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    button.style.transform = '';
                }, 200);
            } else {
                // Deactivate other buttons
                button.classList.remove('active');
                button.setAttribute('aria-pressed', 'false');
            }
        });
    },

    updateSectionVisibility: function(activeUnitId) {
        this.sections.forEach(section => {
            const sectionId = section.getAttribute('id');

            if (sectionId === activeUnitId) {
                // Show this section with animation
                section.classList.remove('hidden');
                section.classList.add('active');

                // Trigger reflow for animation
                void section.offsetWidth;

                // Animate in question blocks within section
                this.animateQuestionBlocks(section);
            } else {
                // Hide other sections
                section.classList.remove('active');
                section.classList.add('hidden');
            }
        });
    },

    animateQuestionBlocks: function(section) {
        const blocks = section.querySelectorAll('.question-block');

        blocks.forEach((block, index) => {
            // Reset animation
            block.style.opacity = '0';
            block.style.transform = 'translateY(20px)';

            // Staggered animation delay
            setTimeout(() => {
                block.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                block.style.opacity = '1';
                block.style.transform = 'translateY(0)';
            }, index * 100);
        });
    },

    scrollToContent: function() {
        const mainContent = document.querySelector('.main-content');

        if (mainContent) {
            // Calculate header height for offset
            const header = document.querySelector('.main-header');
            const headerHeight = header ? header.offsetHeight : 0;

            window.scrollTo({
                top: mainContent.offsetTop - headerHeight - 20,
                behavior: 'smooth'
            });
        }
    },

    updateURLHash: function(unitId) {
        const url = new URL(window.location);
        url.hash = unitId;
        window.history.pushState({
            unit: unitId
        }, '', url);
    },

    dispatchChangeEvent: function(newUnit, oldUnit) {
        const event = new CustomEvent('unitChanged', {
            detail: {
                newUnit: newUnit,
                oldUnit: oldUnit,
                timestamp: Date.now()
            }
        });

        document.dispatchEvent(event);
    },

    // Public method for external access
    goToUnit: function(unitId) {
        this.switchToUnit(unitId);
    }
};

/**
 * ===== SMOOTH SCROLL MODULE =====
 * Enhances anchor link scrolling behavior
 */
const SmoothScroll = {
    init: function() {
        // Handle all internal anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => this.handleAnchorClick(e));
        });
    },

    handleAnchorClick: function(event) {
        const href = event.currentTarget.getAttribute('href');

        if (href === '#' || href === '#!') return;

        const targetElement = document.querySelector(href);

        if (targetElement) {
            event.preventDefault();

            const headerOffset = 80; // Account for sticky header
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Update focus for accessibility
            targetElement.setAttribute('tabindex', '-1');
            targetElement.focus();
        }
    }
};

/**
 * ===== KEYBOARD NAVIGATION MODULE =====
 * Enables keyboard shortcuts for power users
 */
const KeyboardNavigation = {
    init: function() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        console.log('⌨️ Keyboard Navigation enabled');
        console.log('   Press 1-6 to jump to Units 1-6');
        console.log('   Press ← or → to navigate between units');
    },

    handleKeyPress: function(event) {
        // Don't intercept if user is typing in an input/textarea
        if (event.target.tagName === 'INPUT' ||
            event.target.tagName === 'TEXTAREA' ||
            event.target.isContentEditable) {
            return;
        }

        const key = event.key;

        // Number keys 1-6 for direct unit access
        if (/^[1-6]$/.test(key)) {
            event.preventDefault();
            const unitNumber = parseInt(key);
            UnitNavigation.goToUnit(`unit${unitNumber}`);
            return;
        }

        // Arrow keys for sequential navigation
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            event.preventDefault();
            this.navigateToNextUnit();
            return;
        }

        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            event.preventDefault();
            this.navigateToPrevUnit();
            return;
        }

        // Home key to go to first unit
        if (event.key === 'Home') {
            event.preventDefault();
            UnitNavigation.goToUnit('unit1');
            return;
        }

        // End key to go to last unit
        if (event.key === 'End') {
            event.preventDefault();
            UnitNavigation.goToUnit('unit6');
            return;
        }
    },

    navigateToNextUnit: function() {
        const currentNum = parseInt(UnitNavigation.currentUnit.replace('unit', ''));
        const nextNum = Math.min(currentNum + 1, 6);
        UnitNavigation.goToUnit(`unit${nextNum}`);
    },

    navigateToPrevUnit: function() {
        const currentNum = parseInt(UnitNavigation.currentUnit.replace('unit', ''));
        const prevNum = Math.max(currentNum - 1, 1);
        UnitNavigation.goToUnit(`unit${prevNum}`);
    }
};

/**
 * ===== URL HASH HANDLER MODULE =====
 * Manages browser back/forward and direct URL access
 */
const URLHashHandler = {
    init: function() {
        // Handle initial page load with hash
        this.handleInitialHash();

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => this.handlePopState(e));

        console.log('🔗 URL Hash Handler initialized');
    },

    handleInitialHash: function() {
        const hash = window.location.hash.replace('#', '');

        if (hash && hash.startsWith('unit')) {
            UnitNavigation.switchToUnit(hash);
        }
    },

    handlePopState: function(event) {
        if (event.state && event.state.unit) {
            UnitNavigation.switchToUnit(event.state.unit);
        } else {
            // Fallback to reading hash
            const hash = window.location.hash.replace('#', '');
            if (hash) {
                UnitNavigation.switchToUnit(hash);
            }
        }
    }
};

/**
 * ===== ANIMATION CONTROLLER MODULE =====
 * Manages scroll-based and interaction animations
 */
const AnimationController = {
    init: function() {
        // Intersection Observer for scroll animations
        this.setupIntersectionObserver();

        // Add hover effects enhancement
        this.enhanceHoverEffects();

        console.log('✨ Animation Controller initialized');
    },

    setupIntersectionObserver: function() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements that should animate on scroll
        document.querySelectorAll('.question-block').forEach(el => {
            observer.observe(el);
        });
    },

    enhanceHoverEffects: function() {
        // Add ripple effect to buttons
        document.querySelectorAll('.unit-btn').forEach(button => {
            button.addEventListener('mouseenter', (e) => this.createRipple(e));
        });
    },

    createRipple: function(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');

        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 50%;
            transform: scale(0);
            animation: rippleEffect 0.6s ease-out;
            pointer-events: none;
        `;

        button.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    }
};

/**
 * ===== UTILITY FUNCTIONS =====
 */

// Debounce function for performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * ===== CSS ANIMATION KEYFRAMES (Injected via JS) =====
 */
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes rippleEffect {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .animate-in {
        animation: fadeInUp 0.5s ease forwards;
    }
`;
document.head.appendChild(styleSheet);

/**
 * ===== GLOBAL ERROR HANDLING =====
window.onerror = function(message, source, lineno, colno, error) {
    console.error('❌ JavaScript Error:', {
        message: message,
        source: source,
        line: lineno,
        column: colno,
        error: error
    });
    
    // Return true to prevent default error handling
    return false;
};
*/

/**
 * ===== SERVICE WORKER REGISTRATION (Optional PWA Support) =====
/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered:', registration.scope);
            })
            .catch(error => {
                console.log('SW registration failed:', error);
            });
    });
}
*/

console.log('🎯 All modules loaded successfully!');
console.log('');
console.log('╔══════════════════════════════════════════════════╗');
console.log('║     INTELLECTUAL PROPERTY RIGHTS COURSE GUIDE      ║');
console.log('║              Ready for Learning 📚               ║');
console.log('╚══════════════════════════════════════════════════╝');