(() => {
'use strict';

const COLORS = ['#FF6B35','#E91E63','#4CAF50','#FFD600','#2196F3','#FF69B4','#9C27B0','#F44336'];
const SITE_URL = 'https://holi-splash.pages.dev';

// Elements
const landing = document.getElementById('landing');
const bgCanvas = document.getElementById('bgCanvas');
const playScreen = document.getElementById('playScreen');
const mainCanvas = document.getElementById('mainCanvas');
const cardScreen = document.getElementById('cardScreen');
const cardCanvas = document.getElementById('cardCanvas');
const nameOverlay = document.getElementById('nameOverlay');
const nameInput = document.getElementById('nameInput');
const tapCounter = document.getElementById('tapCounter');
const createCardBtn = document.getElementById('createCardBtn');
const challengeText = document.getElementById('challengeText');
const confettiOverlay = document.getElementById('confettiOverlay');
const soundToggle = document.getElementById('soundToggle');

let ctx, tapCount = 0, selectedColor = 'random';
let lastX = null, lastY = null;
let soundEnabled = false;
let audioCtx = null;
let challengeShown = false;

// --- Web Audio API Sound ---
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playPoofSound() {
    if (!soundEnabled || !audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const bufferSize = audioCtx.sampleRate * 0.05; // 50ms
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize); // white noise with decay
    }
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    // Vary pitch
    source.playbackRate.value = 0.8 + Math.random() * 0.8;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
    source.connect(gain).connect(audioCtx.destination);
    source.start();
    source.stop(audioCtx.currentTime + 0.06);
}

soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
    if (soundEnabled) initAudio();
});

// --- Haptic Feedback ---
function vibrate(pattern) {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
}

// --- Background Particles ---
function initBgParticles() {
    const c = bgCanvas, cx = c.getContext('2d');
    const resize = () => { c.width = c.offsetWidth * devicePixelRatio; c.height = c.offsetHeight * devicePixelRatio; cx.scale(devicePixelRatio, devicePixelRatio); };
    resize(); window.addEventListener('resize', resize);
    const dots = Array.from({length: 50}, () => ({
        x: Math.random() * c.offsetWidth, y: Math.random() * c.offsetHeight,
        r: Math.random() * 4 + 1, dx: (Math.random() - .5) * .5, dy: Math.random() * .5 + .2,
        color: COLORS[Math.random() * COLORS.length | 0], alpha: Math.random() * .6 + .2
    }));
    (function draw() {
        if (!landing.classList.contains('active')) return;
        cx.clearRect(0, 0, c.offsetWidth, c.offsetHeight);
        dots.forEach(d => {
            d.x += d.dx; d.y += d.dy;
            if (d.y > c.offsetHeight + 10) { d.y = -10; d.x = Math.random() * c.offsetWidth; }
            if (d.x < -10 || d.x > c.offsetWidth + 10) d.dx *= -1;
            cx.globalAlpha = d.alpha;
            cx.fillStyle = d.color;
            cx.beginPath(); cx.arc(d.x, d.y, d.r, 0, Math.PI * 2); cx.fill();
        });
        cx.globalAlpha = 1;
        requestAnimationFrame(draw);
    })();
}

// --- Splash Drawing ---
function getColor() {
    if (selectedColor === 'random') return COLORS[Math.random() * COLORS.length | 0];
    return selectedColor;
}

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return {r,g,b};
}

// --- Secondary particle animation ---
function animateParticles(x, y, color) {
    const {r,g,b} = hexToRgb(color);
    const count = 3 + (Math.random() * 3 | 0);
    const parts = [];
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 3;
        parts.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, r: 2 + Math.random() * 3, alpha: 1 });
    }
    let frame = 0;
    function tick() {
        frame++;
        if (frame > 20) return;
        parts.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            p.alpha -= 0.05;
            if (p.alpha <= 0) return;
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

// --- Fade-in splash animation ---
function animateSplashFadeIn(x, y, color, radius, drawFn) {
    let frame = 0;
    const totalFrames = 3;
    function tick() {
        const alpha = (frame + 1) / totalFrames;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.globalCompositeOperation = 'multiply';
        drawFn(x, y, color, radius);
        ctx.restore();
        frame++;
        if (frame < totalFrames) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

function drawSplashShape(x, y, color, radius) {
    const {r,g,b} = hexToRgb(color);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI * 2);
    const points = 8 + (Math.random() * 4 | 0);
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const variance = radius * (.6 + Math.random() * .8);
        const px = Math.cos(angle) * variance;
        const py = Math.sin(angle) * variance;
        if (i === 0) ctx.moveTo(px, py);
        else {
            const cpAngle = ((i - .5) / points) * Math.PI * 2;
            const cpR = radius * (.5 + Math.random() * 1);
            ctx.quadraticCurveTo(Math.cos(cpAngle) * cpR, Math.sin(cpAngle) * cpR, px, py);
        }
    }
    ctx.closePath();
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    grad.addColorStop(0, `rgba(${r},${g},${b},.85)`);
    grad.addColorStop(.5, `rgba(${r},${g},${b},.6)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},.1)`);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
}

function drawSplash(x, y, size) {
    const color = getColor();
    const {r,g,b} = hexToRgb(color);
    const radius = size || (Math.random() * 40 + 40);

    // Main blob with color mixing composite
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    drawSplashShape(x, y, color, radius);
    ctx.restore();

    // Also draw in normal mode for vibrancy on white
    ctx.save();
    ctx.globalAlpha = 0.5;
    drawSplashShape(x, y, color, radius);
    ctx.restore();

    // Smaller droplets
    const numDroplets = 5 + (Math.random() * 8 | 0);
    for (let i = 0; i < numDroplets; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = radius + Math.random() * radius * 1.2;
        const dx = x + Math.cos(angle) * dist;
        const dy = y + Math.sin(angle) * dist;
        const dr = Math.random() * 10 + 3;
        ctx.beginPath();
        const pts = 5;
        for (let j = 0; j <= pts; j++) {
            const a = (j / pts) * Math.PI * 2;
            const v = dr * (.5 + Math.random() * .8);
            const px2 = dx + Math.cos(a) * v;
            const py2 = dy + Math.sin(a) * v;
            if (j === 0) ctx.moveTo(px2, py2);
            else ctx.lineTo(px2, py2);
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(${r},${g},${b},${Math.random()*.5+.3})`;
        ctx.fill();
    }

    // Secondary flying particles
    animateParticles(x, y, color);

    // Sound & haptics
    playPoofSound();
    vibrate(30);

    tapCount++;
    tapCounter.textContent = `🎨 ${tapCount} splashes`;
    if (tapCount >= 8 && createCardBtn.classList.contains('hidden')) {
        createCardBtn.classList.remove('hidden');
    }
    // Challenge text after 5 splashes
    if (tapCount === 5 && !challengeShown) {
        challengeShown = true;
        challengeText.classList.remove('hidden');
        setTimeout(() => challengeText.classList.add('hidden'), 4000);
    }
}

// --- Canvas Setup ---
function initMainCanvas() {
    const dpr = devicePixelRatio || 1;
    mainCanvas.width = mainCanvas.offsetWidth * dpr;
    mainCanvas.height = mainCanvas.offsetHeight * dpr;
    ctx = mainCanvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, mainCanvas.offsetWidth, mainCanvas.offsetHeight);
}

function getCanvasXY(e) {
    const rect = mainCanvas.getBoundingClientRect();
    if (e.touches) {
        return Array.from(e.touches).map(t => ({x: t.clientX - rect.left, y: t.clientY - rect.top}));
    }
    return [{x: e.clientX - rect.left, y: e.clientY - rect.top}];
}

// --- Interpolation for smooth swipe ---
function interpolatePoints(x0, y0, x1, y1, minDist) {
    const dx = x1 - x0, dy = y1 - y0;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDist) return [{x: x1, y: y1}];
    const steps = Math.ceil(dist / minDist);
    const pts = [];
    for (let i = 1; i <= steps; i++) {
        pts.push({ x: x0 + dx * (i / steps), y: y0 + dy * (i / steps) });
    }
    return pts;
}

// --- Touch/Mouse Events ---
let isDrawing = false;
function onStart(e) {
    e.preventDefault(); isDrawing = true;
    const pts = getCanvasXY(e);
    pts.forEach(p => { drawSplash(p.x, p.y); lastX = p.x; lastY = p.y; });
}
function onMove(e) {
    e.preventDefault();
    if (!isDrawing) return;
    const pts = getCanvasXY(e);
    pts.forEach(p => {
        if (lastX !== null && lastY !== null) {
            const interp = interpolatePoints(lastX, lastY, p.x, p.y, 15);
            interp.forEach(ip => drawSplash(ip.x, ip.y, Math.random() * 15 + 12));
        } else {
            drawSplash(p.x, p.y, Math.random() * 15 + 12);
        }
        lastX = p.x; lastY = p.y;
    });
}
function onEnd(e) { e.preventDefault(); isDrawing = false; lastX = null; lastY = null; }

// --- Color Picker ---
document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
        document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        selectedColor = dot.dataset.color;
    });
});

// --- Confetti on Greeting Card ---
function launchConfetti() {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:10;';
    confettiOverlay.appendChild(canvas);
    const cctx = canvas.getContext('2d');
    const dpr = devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    cctx.scale(dpr, dpr);
    const W = window.innerWidth, H = window.innerHeight;

    const pieces = Array.from({length: 120}, () => ({
        x: Math.random() * W,
        y: Math.random() * -H,
        w: 4 + Math.random() * 6,
        h: 6 + Math.random() * 8,
        color: COLORS[Math.random() * COLORS.length | 0],
        vy: 2 + Math.random() * 3,
        vx: (Math.random() - 0.5) * 2,
        rot: Math.random() * Math.PI * 2,
        rv: (Math.random() - 0.5) * 0.2,
        isCircle: Math.random() > 0.5
    }));

    const start = performance.now();
    function draw(now) {
        if (now - start > 3000) { canvas.remove(); return; }
        cctx.clearRect(0, 0, W, H);
        pieces.forEach(p => {
            p.x += p.vx; p.y += p.vy; p.rot += p.rv;
            if (p.y > H + 20) return;
            cctx.save();
            cctx.translate(p.x, p.y);
            cctx.rotate(p.rot);
            cctx.fillStyle = p.color;
            if (p.isCircle) {
                cctx.beginPath(); cctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); cctx.fill();
            } else {
                cctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            }
            cctx.restore();
        });
        requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
}

// --- Greeting Card Generation ---
function generateCard(name) {
    const w = mainCanvas.width, h = mainCanvas.height;
    const dpr = devicePixelRatio || 1;
    cardCanvas.width = w; cardCanvas.height = h;
    const cc = cardCanvas.getContext('2d');

    cc.drawImage(mainCanvas, 0, 0);

    cc.fillStyle = 'rgba(0,0,0,.25)';
    cc.fillRect(0, h * .3, w, h * .45);

    const titleSize = Math.min(w / 6, 120);
    cc.textAlign = 'center';
    cc.textBaseline = 'middle';
    cc.font = `800 ${titleSize}px 'Baloo 2', cursive`;
    cc.fillStyle = '#fff';
    cc.shadowColor = 'rgba(0,0,0,.5)';
    cc.shadowBlur = 20;
    cc.shadowOffsetY = 4;
    cc.fillText('Happy Holi!', w / 2, h * .45);

    const nameSize = Math.min(w / 14, 48);
    cc.font = `600 ${nameSize}px 'Poppins', sans-serif`;
    cc.fillText(`From ${name}`, w / 2, h * .56);

    const yearSize = Math.min(w / 20, 32);
    cc.font = `400 ${yearSize}px 'Poppins', sans-serif`;
    cc.fillStyle = 'rgba(255,255,255,.8)';
    cc.fillText('2026', w / 2, h * .64);

    cc.shadowBlur = 0; cc.shadowOffsetY = 0;
    cc.font = `400 ${Math.min(w/30, 16)}px 'Poppins', sans-serif`;
    cc.fillStyle = 'rgba(255,255,255,.4)';
    cc.textAlign = 'right';
    cc.fillText('holi-splash.pages.dev', w - 20 * dpr, h - 16 * dpr);

    // Haptic celebration
    vibrate([50, 30, 50]);
}

// --- Screen Navigation ---
function showScreen(screen) {
    const current = document.querySelector('.screen.active');
    if (current && current !== screen) {
        current.classList.add('fade-out');
        setTimeout(() => {
            current.classList.remove('active', 'fade-out');
            screen.classList.add('active');
        }, 200);
    } else {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    }
}

// Start
document.getElementById('startBtn').addEventListener('click', () => {
    showScreen(playScreen);
    setTimeout(() => initMainCanvas(), 250);
    mainCanvas.addEventListener('mousedown', onStart);
    mainCanvas.addEventListener('mousemove', onMove);
    mainCanvas.addEventListener('mouseup', onEnd);
    mainCanvas.addEventListener('mouseleave', onEnd);
    mainCanvas.addEventListener('touchstart', onStart, {passive: false});
    mainCanvas.addEventListener('touchmove', onMove, {passive: false});
    mainCanvas.addEventListener('touchend', onEnd, {passive: false});
});

// Clear
document.getElementById('clearBtn').addEventListener('click', () => {
    tapCount = 0; tapCounter.textContent = '';
    createCardBtn.classList.add('hidden');
    challengeShown = false;
    challengeText.classList.add('hidden');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, mainCanvas.offsetWidth, mainCanvas.offsetHeight);
});

// Create Card
createCardBtn.addEventListener('click', () => { nameOverlay.classList.remove('hidden'); nameInput.focus(); });

// Generate
document.getElementById('generateBtn').addEventListener('click', () => {
    const name = nameInput.value.trim() || 'Friend';
    nameOverlay.classList.add('hidden');
    generateCard(name);
    showScreen(cardScreen);
    setTimeout(launchConfetti, 400);
});
nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('generateBtn').click(); });

// Download
document.getElementById('downloadBtn').addEventListener('click', () => {
    cardCanvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'holi-greeting-2026.png';
        a.click(); URL.revokeObjectURL(url);
    }, 'image/png');
});

// Share WhatsApp
document.getElementById('shareBtn').addEventListener('click', () => {
    const text = encodeURIComponent(`🎨 Happy Holi 2026! I made this colorful greeting for you! Check it out: ${SITE_URL}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
});

// Copy Link
document.getElementById('copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(SITE_URL).then(() => {
        const btn = document.getElementById('copyBtn');
        btn.textContent = '✅ Copied!';
        setTimeout(() => btn.textContent = '🔗 Copy Link', 2000);
    });
});

// Back
document.getElementById('backBtn').addEventListener('click', () => { showScreen(playScreen); });

// Handle resize
window.addEventListener('resize', () => {
    if (playScreen.classList.contains('active')) {
        // Don't reset canvas on resize to preserve art
    }
});

// Init
initBgParticles();
})();
