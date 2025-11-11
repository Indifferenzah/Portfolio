document.addEventListener('DOMContentLoaded', function() {
    const intro = document.getElementById('intro');
    const main = document.querySelector('main');
    const animatedText = document.getElementById('animated-text');
    const text = 'Indifferenzah';
    let index = 0;
    let direction = 1;

    function animateText() {
        if (direction === 1) {
            animatedText.innerHTML = text.slice(0, index) + '<span class="cursor">|</span>';
            index += direction;
            if (index > text.length) {
                direction = -1;
                setTimeout(() => {
                    animateText();
                }, 1000);
            } else {
                setTimeout(animateText, 150);
            }
        } else {
            animatedText.innerHTML = text.slice(0, index) + '<span class="cursor">|</span>';
            index += direction;
            if (index < 0) {
                direction = 1;
                setTimeout(() => {
                    animateText();
                }, 500);
            } else {
                setTimeout(animateText, 150);
            }
        }
    }

    animateText();

    let hasScrolled = false;
    function checkScroll() {
        if (window.scrollY > 50 && !hasScrolled) {
            hasScrolled = true;
            intro.style.transform = 'translateY(-100%)';
            setTimeout(() => {
                intro.style.display = 'none';
                main.classList.add('visible');
            }, 500);
        }
    }

    window.addEventListener('scroll', checkScroll);
});

document.getElementById("year").textContent = new Date().getFullYear();

const sections = Array.from(
    document.querySelectorAll("main section[id]")
);
const navLinks = Array.from(document.querySelectorAll("#nav-links a"));
const titleMap = {
    home: "Home | Indifferenzah",
    about: "About | Indifferenzah",
    experience: "Experience | Indifferenzah",
    skills: "Skills | Indifferenzah",
    projects: "Projects | Indifferenzah",
    education: "Education | Indifferenzah",
    contact: "Contact | Indifferenzah"
};
const setActive = (id) =>
    navLinks.forEach((a) =>
        a.classList.toggle("active", a.getAttribute("href") === "#" + id)
    );
const obs = new IntersectionObserver(
    (entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) {
                setActive(e.target.id);
                document.title = titleMap[e.target.id] || "Indifferenzah";
            }
        });
    },
    { threshold: 0.55 }
);
sections.forEach((s) => obs.observe(s));



const canvas = document.getElementById("fx");
const ctx = canvas.getContext("2d");
let W,
    H,
    particles = [],
    clickParticles = [];
function resize() {
    W = canvas.width = innerWidth;
    H = canvas.height = innerHeight;
}
window.addEventListener("resize", () => {
    resize();
    spawn(true);
});
function rand(a, b) {
    return Math.random() * (b - a) + a;
}
function colorMix(t) {
    return `rgba(${34 + t * (139 - 34)}, ${211 - t * (211 - 92)}, ${238 - t * (238 - 246)
        }, ${0.16 + 0.12 * Math.sin(performance.now() / 800)})`;
}
function spawn(reset = false) {
    const count = Math.max(120, Math.floor((W * H) / 10000));
    if (reset) particles = [];
    while (particles.length < count) {
        particles.push({
            x: rand(0, W),
            y: rand(0, H),
            vx: rand(-0.2, 0.2),
            vy: rand(0.15, 0.45),
            r: rand(0.6, 2.2),
        });
    }
}
let mx = 0,
    my = 0;
window.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    for (let i = 0; i < 2; i++) {
        clickParticles.push({
            x: e.clientX + rand(-10, 10),
            y: e.clientY + rand(-10, 10),
            vx: rand(-2, 2),
            vy: rand(-2, 2),
            r: rand(1, 3),
            life: 60,
        });
    }
});
window.addEventListener("click", (e) => {
    for (let i = 0; i < 10; i++) {
        clickParticles.push({
            x: e.clientX + rand(-20, 20),
            y: e.clientY + rand(-20, 20),
            vx: rand(-4, 4),
            vy: rand(-4, 4),
            r: rand(2, 5),
            life: 120,
        });
    }
});
function step() {
    ctx.clearRect(0, 0, W, H);
    const t = (Math.sin(performance.now() / 1200) + 1) / 2;
    particles.forEach((p) => {
        p.vx += (Math.random() - 0.5) * 0.02;
        p.vy += 0.01 + (Math.random() - 0.5) * 0.01;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;
        ctx.beginPath();
        ctx.fillStyle = colorMix(t);
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
    });
    clickParticles = clickParticles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life--;
        if (p.life > 0) {
            ctx.beginPath();
            ctx.fillStyle = `rgba(34, 211, 238, ${p.life / 120})`;
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
            return true;
        }
        return false;
    });
    requestAnimationFrame(step);
}
const progressBars = document.querySelectorAll('.progress');
progressBars.forEach(bar => {
    const percent = bar.dataset.percent;
    bar.style.width = percent + '%';
});

resize();
spawn(true);
step();
