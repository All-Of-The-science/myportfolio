// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// --- Navbar Scroll and Active Link Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    const navLinksContainer = document.querySelector('.menu-items');
    const links = document.querySelectorAll('.menu-items a');
    const sections = document.querySelectorAll('section');
    const checkbox = document.querySelector('.navbar-container input[type="checkbox"]');

    function changeLinkState() {
        let index = sections.length;

        // Find the currently active section
        while(--index && window.scrollY + 100 < sections[index].offsetTop) {}
        
        links.forEach((link) => link.classList.remove('active'));

        // Add 'active' class to the corresponding link
        const allNavTargets = [document.getElementById('hero'), ...Array.from(sections)];
         let currentSectionId = '';

        allNavTargets.forEach((section, i) => {
            if (!section) return; // Guard against null sections
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 100) {
                 currentSectionId = section.getAttribute('id');
            }
        });

        links.forEach(link => {
            link.classList.remove('active');
            if(link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }


    // Close mobile menu when a link is clicked
    if (navLinksContainer) {
        navLinksContainer.addEventListener('click', () => {
            if (checkbox.checked) {
                checkbox.checked = false;
            }
        });
    }

    window.addEventListener('scroll', () => {
        // Add scrolled class to navbar for background effect
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Update active link on scroll
        changeLinkState();
    });

    // Run on page load to set the initial state
    changeLinkState();
});


// --- Custom Cursor Logic ---
// --- Custom Cursor Logic ---
const customCursor = document.querySelector('.custom-cursor');
const interactiveElements = 'a, button, .btn, input, textarea, .project-card, .social-links a, .navbar-container input[type="checkbox"], .scroll-indicator';

document.addEventListener('mousemove', e => {
    // I've lowered the duration from 0.1 to 0.08 for a snappier response
    gsap.to(customCursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.08, 
        ease: 'power2.out'
    });
});

document.addEventListener('mousedown', () => {
    customCursor.classList.add('clicked');
});

document.addEventListener('mouseup', () => {
    customCursor.classList.remove('clicked');
});

function updateInteractiveElements() {
    document.querySelectorAll(interactiveElements).forEach(element => {
        element.addEventListener('mouseenter', () => customCursor.classList.add('hovered'));
        element.addEventListener('mouseleave', () => customCursor.classList.remove('hovered'));
    });
}
updateInteractiveElements(); // Initial call


// --- Three.js Background Animation ---
let scene, camera, renderer, particles, particleGeometry, particleMaterial;
let mouseX = 0, mouseY = 0;
let particleVels; // This will store the velocity of each particle

function initThreeJS() {
    const canvas = document.getElementById('three-js-background');
    if (!canvas) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Particles
    particleGeometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const numParticles = 2000;
    particleVels = []; // Initialize velocities array

    const xSpread = 50;
    const ySpread = 50;

    for (let i = 0; i < numParticles; i++) {
        positions.push(
            (Math.random() * 2 - 1) * xSpread, // x
            (Math.random() * 2 - 1) * ySpread, // y
            - (Math.random() * 80 + 10)       // z
        );

        colors.push(
            Math.random() * 0.2 + 0.1,
            Math.random() * 0.4 + 0.3,
            Math.random() * 0.6 + 0.5
        );

        // Create a unique, random velocity for each particle
        particleVels.push({
            x: -0.02 - (Math.random() * 0.05), // Move left, with random speed
            y: (Math.random() - 0.5) * 0.02,   // Random vertical drift
            z: (Math.random() - 0.5) * 0.01    // Random depth drift
        });
    }

    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    particleMaterial = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    camera.position.z = 5;

    document.addEventListener('mousemove', onDocumentMouseMove);
    window.addEventListener('resize', onWindowResize);
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onWindowResize() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

function animateThreeJS() {
    requestAnimationFrame(animateThreeJS);

    if (particles && particleVels) {
        const positions = particles.geometry.attributes.position.array;
        const xSpread = 50;
        const ySpread = 50;

        for (let i = 0; i < positions.length; i += 3) {
            const velIndex = i / 3;

            // Update position with the particle's unique velocity
            positions[i]   += particleVels[velIndex].x;
            positions[i+1] += particleVels[velIndex].y;
            positions[i+2] += particleVels[velIndex].z;

            // If particle moves off the left edge, wrap it to the right side
            // with a new random Y and Z position to prevent visible streaming.
            if (positions[i] < -xSpread) {
                positions[i] = xSpread;
                positions[i+1] = (Math.random() * 2 - 1) * ySpread;
                positions[i+2] = -(Math.random() * 80 + 10);
            }
        }

        // We must tell three.js that the particle positions have been updated
        particles.geometry.attributes.position.needsUpdate = true;

        // Keep the original mouse parallax effect on the entire particle system
        particles.position.x += (mouseX * 0.1 - particles.position.x) * 0.05;
        particles.position.y += (mouseY * 0.1 - particles.position.y) * 0.05;
    }

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}


// --- GSAP Animations for sections ---
function animateHeroSection() {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(".hero-main-title",
        { opacity: 0, y: 50, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 1.2, delay: 0.5 }
    )
    .fromTo(".hero-subtitle",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1 }, "<0.2"
    )
    .fromTo(".hero-action-buttons",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8 }, "<0.2"
    )
    .fromTo(".scroll-indicator",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7 }, "<0.3"
    );
}

function animateAboutSection() {
    gsap.timeline({
        scrollTrigger: {
            trigger: "#about",
            start: "top 75%",
            toggleActions: "play none none none"
        }
    })
    .fromTo("#about .section-title",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    )
    .fromTo("#about .about-description",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power2.out" }, "<0.2"
    )
    .fromTo("#about .about-text-column .btn",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "<0.3"
    )
    .fromTo("#about .about-image-placeholder",
        { opacity: 0, scale: 0.8, rotationY: 45 },
        { opacity: 1, scale: 1, rotationY: 0, duration: 1.2, ease: "back.out(1.7)" }, "<0.5"
    );
}

function animateToolkitSection() {
    gsap.timeline({
        scrollTrigger: {
            trigger: "#toolkit",
            start: "top 75%",
            toggleActions: "play none none none"
        }
    })
    .fromTo("#toolkit .section-title",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    )
    .fromTo(".toolkit-item",
        { opacity: 0, y: 20, scale: 0.8 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.15, ease: "back.out(1.7)" }, "<0.2"
    );
}

function animateProjectsSection() {
    gsap.timeline({
        scrollTrigger: {
            trigger: "#projects",
            start: "top 75%",
            toggleActions: "play none none none"
        }
    })
    .fromTo("#projects .section-title",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    )
    .fromTo(".project-card",
        { opacity: 0, y: 50, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.15, ease: "back.out(1.7)" }, "<0.2"
    );

    // Subtle Parallax Effect for Project Cards
    gsap.utils.toArray('.project-card-media img').forEach(img => {
        gsap.to(img, {
            y: '-10%',
            ease: 'none',
            scrollTrigger: {
                trigger: img.closest('.project-card'),
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.5
            }
        });
    });
}

// UPDATED: This function only sets up the hover animation for desktop.
function animateProjectCardOverlays() {
    // This logic is no longer needed as the new approach is purely CSS-driven for responsiveness.
    // The hover effects are handled by the :hover pseudo-class in the CSS,
    // and the mobile layout is handled by a media query.
    // This function can be removed or left empty. For clarity, we'll leave it empty.
}


function animateContactSection() {
    gsap.timeline({
        scrollTrigger: {
            trigger: "#contact",
            start: "top 75%",
            toggleActions: "play none none none"
        }
    })
    .fromTo("#contact .section-title",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    )
    .fromTo(".contact-info",
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 1, ease: "power3.out" }, "<0.2"
    )
    .fromTo(".contact-form",
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 1, ease: "power3.out" }, "<"
    )
    .fromTo(".social-links a",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "back.out(1.7)" }, "-=0.5"
    );
}




// --- Preloader and Initial Page Setup ---
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');

    gsap.to(preloader, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => {
            preloader.style.display = 'none';

            // Initialize animations
            animateHeroSection();
            initThreeJS();
            animateThreeJS();
            animateAboutSection();
            animateToolkitSection();
            animateProjectsSection(); 
            animateProjectCardOverlays(); // Call the new function for responsive overlays
            animateContactSection(); 
        }
    });
});


// --- Contact Form Logic ---
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Simulate form submission
        formStatus.textContent = 'Sending...';
        formStatus.style.color = 'var(--text-light)';

        // This is a placeholder for actual form submission logic (e.g., using Fetch API with Formspree)
        // You would replace this setTimeout with a real fetch call.
        setTimeout(() => {
            // On success
            formStatus.textContent = 'Message sent successfully!';
            formStatus.style.color = 'var(--accent-neon-blue)';
            contactForm.reset();

            // Clear status message after a few seconds
            setTimeout(() => {
                formStatus.textContent = '';
            }, 5000);

        }, 2000);
    });
}



// --- Smooth Scroll for Hero Section Button ---
document.addEventListener('DOMContentLoaded', () => {
    const scrollDownButton = document.getElementById('scroll-down-button');
    const aboutSection = document.getElementById('about');

    if (scrollDownButton && aboutSection) {
        scrollDownButton.addEventListener('click', () => {
            // This scrolls the page smoothly to the start of the 'about' section
            aboutSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    }

    // To Top Button
    const toTopBtn = document.getElementById('to-top-btn');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            toTopBtn.classList.add('show');
        } else {
            toTopBtn.classList.remove('show');
        }
    });

    toTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Progress Bar
    const progressBar = document.querySelector('.progress-bar');

    window.addEventListener('scroll', () => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.scrollY / scrollableHeight) * 100;
        progressBar.style.width = `${scrolled}%`;
    });
});