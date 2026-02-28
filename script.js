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

// --- Sticker System ---
let selectedSticker = null;
let stickerBarVisible = false;

const STICKER_DEFS = [
    { id: 'balloon', name: 'Water Balloon', emoji: '🎈', draw: drawBalloon },
    { id: 'pichkari', name: 'Pichkari', emoji: '🔫', draw: drawPichkari },
    { id: 'gujiya', name: 'Gujiya', emoji: '🟡', draw: drawGujiya },
    { id: 'dholak', name: 'Dholak', emoji: '🥁', draw: drawDholak },
    { id: 'packet', name: 'Color Packet', emoji: '💧', draw: drawPacket },
    { id: 'flower', name: 'Marigold', emoji: '🌸', draw: drawFlower },
    { id: 'handprint', name: 'Handprint', emoji: '✋', draw: drawHandprint },
    { id: 'face', name: 'Happy Face', emoji: '🎭', draw: drawHappyFace },
];

function randomHoliColor() { return COLORS[Math.random() * COLORS.length | 0]; }

function drawBalloon(c, x, y, size, color) {
    color = color || randomHoliColor();
    const {r,g,b} = hexToRgb(color);
    const s = size * 0.5;
    c.save(); c.translate(x, y);
    // Teardrop body
    c.beginPath();
    c.moveTo(0, -s);
    c.bezierCurveTo(s * 0.8, -s, s, -s * 0.3, s * 0.5, s * 0.3);
    c.bezierCurveTo(s * 0.2, s * 0.65, 0, s * 0.7, 0, s * 0.7);
    c.bezierCurveTo(0, s * 0.7, -s * 0.2, s * 0.65, -s * 0.5, s * 0.3);
    c.bezierCurveTo(-s, -s * 0.3, -s * 0.8, -s, 0, -s);
    c.closePath();
    const grad = c.createRadialGradient(-s * 0.2, -s * 0.3, 0, 0, 0, s);
    grad.addColorStop(0, `rgba(${Math.min(r+60,255)},${Math.min(g+60,255)},${Math.min(b+60,255)},1)`);
    grad.addColorStop(1, color);
    c.fillStyle = grad; c.fill();
    // Highlight
    c.beginPath(); c.arc(-s * 0.2, -s * 0.4, s * 0.15, 0, Math.PI * 2);
    c.fillStyle = 'rgba(255,255,255,0.5)'; c.fill();
    // Knot
    c.beginPath(); c.moveTo(-s * 0.08, s * 0.7); c.lineTo(0, s * 0.85); c.lineTo(s * 0.08, s * 0.7);
    c.fillStyle = color; c.fill();
    c.beginPath(); c.arc(0, s * 0.88, s * 0.06, 0, Math.PI * 2);
    c.fillStyle = color; c.fill();
    c.restore();
}

function drawPichkari(c, x, y, size) {
    const s = size * 0.4;
    c.save(); c.translate(x, y);
    // Body
    c.fillStyle = '#FFD600';
    c.beginPath(); c.roundRect(-s * 0.8, -s * 0.25, s * 1.6, s * 0.5, 4); c.fill();
    // Red stripes
    c.fillStyle = '#F44336';
    c.fillRect(-s * 0.3, -s * 0.25, s * 0.15, s * 0.5);
    c.fillRect(s * 0.1, -s * 0.25, s * 0.15, s * 0.5);
    // Nozzle
    c.fillStyle = '#2196F3';
    c.fillRect(s * 0.8, -s * 0.12, s * 0.5, s * 0.24);
    c.beginPath(); c.moveTo(s * 1.3, -s * 0.18); c.lineTo(s * 1.5, -s * 0.08);
    c.lineTo(s * 1.5, s * 0.08); c.lineTo(s * 1.3, s * 0.18); c.fillStyle = '#1565C0'; c.fill();
    // Handle
    c.fillStyle = '#E91E63';
    c.beginPath(); c.roundRect(-s * 0.9, s * 0.1, s * 0.3, s * 0.6, 3); c.fill();
    // Water drops
    c.fillStyle = 'rgba(33,150,243,0.6)';
    for (let i = 0; i < 3; i++) {
        c.beginPath(); c.arc(s * 1.6 + i * s * 0.2, (Math.random() - 0.5) * s * 0.3, s * 0.06, 0, Math.PI * 2); c.fill();
    }
    c.restore();
}

function drawGujiya(c, x, y, size) {
    const s = size * 0.45;
    c.save(); c.translate(x, y);
    // Half moon
    c.beginPath();
    c.moveTo(-s, 0);
    c.quadraticCurveTo(-s, -s * 0.9, 0, -s * 0.9);
    c.quadraticCurveTo(s, -s * 0.9, s, 0);
    c.lineTo(-s, 0);
    c.closePath();
    const grad = c.createLinearGradient(0, -s, 0, 0);
    grad.addColorStop(0, '#D4A017'); grad.addColorStop(1, '#B8860B');
    c.fillStyle = grad; c.fill();
    c.strokeStyle = '#8B6914'; c.lineWidth = 1; c.stroke();
    // Crimped edge
    const steps = 12;
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const cx2 = -s + t * 2 * s;
        const cy2 = -s * 0.9 * Math.sin(t * Math.PI);
        c.beginPath(); c.arc(cx2, -cy2 * 0.95 - s * 0.05, s * 0.07, 0, Math.PI, true); 
        c.strokeStyle = '#8B6914'; c.lineWidth = 1.2; c.stroke();
    }
    // Base line
    c.beginPath(); c.moveTo(-s, 0); c.lineTo(s, 0);
    c.strokeStyle = '#8B6914'; c.lineWidth = 1.5; c.stroke();
    c.restore();
}

function drawDholak(c, x, y, size) {
    const s = size * 0.4;
    c.save(); c.translate(x, y);
    // Barrel shape
    c.beginPath();
    c.moveTo(-s, -s * 0.4);
    c.quadraticCurveTo(0, -s * 0.7, s, -s * 0.4);
    c.lineTo(s, s * 0.4);
    c.quadraticCurveTo(0, s * 0.7, -s, s * 0.4);
    c.closePath();
    const grad = c.createLinearGradient(-s, 0, s, 0);
    grad.addColorStop(0, '#8B4513'); grad.addColorStop(0.5, '#A0522D'); grad.addColorStop(1, '#8B4513');
    c.fillStyle = grad; c.fill();
    c.strokeStyle = '#5C2E00'; c.lineWidth = 1.5; c.stroke();
    // Zig-zag rope
    c.beginPath(); c.strokeStyle = '#F5DEB3'; c.lineWidth = 1.5;
    const zigN = 8;
    for (let i = 0; i <= zigN; i++) {
        const px = -s * 0.8 + (i / zigN) * s * 1.6;
        const py = (i % 2 === 0 ? -1 : 1) * s * 0.2;
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
    }
    c.stroke();
    // End circles
    c.fillStyle = '#DEB887';
    c.beginPath(); c.ellipse(-s, 0, s * 0.12, s * 0.4, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(s, 0, s * 0.12, s * 0.4, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    c.restore();
}

function drawPacket(c, x, y, size, color) {
    color = color || randomHoliColor();
    const s = size * 0.4;
    c.save(); c.translate(x, y);
    // Pouch
    c.beginPath(); c.roundRect(-s * 0.7, -s * 0.5, s * 1.4, s * 1.1, 6);
    c.fillStyle = color; c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.2)'; c.lineWidth = 1.5; c.stroke();
    // Gathered top
    c.beginPath();
    c.moveTo(-s * 0.5, -s * 0.5);
    c.quadraticCurveTo(-s * 0.2, -s * 0.8, 0, -s * 0.7);
    c.quadraticCurveTo(s * 0.2, -s * 0.8, s * 0.5, -s * 0.5);
    c.fillStyle = color; c.fill();
    // Burst lines
    c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
        const a = -Math.PI * 0.8 + (i / 4) * Math.PI * 0.6;
        c.beginPath(); c.moveTo(Math.cos(a) * s * 0.3, -s * 0.65 + Math.sin(a) * s * 0.1);
        c.lineTo(Math.cos(a) * s * 0.55, -s * 0.75 + Math.sin(a) * s * 0.25); c.stroke();
    }
    // HOLI text
    c.fillStyle = '#fff'; c.font = `bold ${s * 0.35}px sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('HOLI', 0, s * 0.1);
    c.restore();
}

function drawFlower(c, x, y, size) {
    const s = size * 0.45;
    c.save(); c.translate(x, y);
    // Outer petals
    const petals = 14;
    for (let layer = 0; layer < 2; layer++) {
        const r = s * (layer === 0 ? 1 : 0.65);
        const offset = layer * Math.PI / petals;
        for (let i = 0; i < petals; i++) {
            const a = offset + (i / petals) * Math.PI * 2;
            c.save(); c.rotate(a);
            c.beginPath(); c.ellipse(0, -r * 0.55, s * 0.2, r * 0.45, 0, 0, Math.PI * 2);
            c.fillStyle = layer === 0 ? '#FF8C00' : '#FFA500'; c.fill();
            c.restore();
        }
    }
    // Center
    c.beginPath(); c.arc(0, 0, s * 0.2, 0, Math.PI * 2);
    c.fillStyle = '#8B4513'; c.fill();
    c.restore();
}

function drawHandprint(c, x, y, size, color) {
    color = color || randomHoliColor();
    const s = size * 0.022;
    c.save(); c.translate(x, y); c.scale(s, s);
    c.beginPath();
    // Palm
    c.ellipse(0, 5, 12, 14, 0, 0, Math.PI * 2);
    // Fingers (simplified)
    const fingers = [
        {x: -10, y: -12, w: 4, h: 12, a: 0.2},
        {x: -4, y: -18, w: 3.5, h: 13, a: 0.05},
        {x: 2, y: -19, w: 3.5, h: 13, a: -0.05},
        {x: 8, y: -16, w: 3.5, h: 12, a: -0.15},
        {x: 14, y: -4, w: 3.5, h: 10, a: -0.7},
    ];
    fingers.forEach(f => {
        c.save(); c.translate(f.x, f.y); c.rotate(f.a);
        c.ellipse(0, 0, f.w, f.h, 0, 0, Math.PI * 2);
        c.restore();
    });
    c.fillStyle = color; c.fill();
    // Grain texture
    const {r,g,b} = hexToRgb(color);
    for (let i = 0; i < 20; i++) {
        c.beginPath(); c.arc((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 30, 0.8, 0, Math.PI * 2);
        c.fillStyle = `rgba(${Math.max(r-40,0)},${Math.max(g-40,0)},${Math.max(b-40,0)},0.3)`; c.fill();
    }
    c.restore();
}

function drawHappyFace(c, x, y, size) {
    const s = size * 0.45;
    c.save(); c.translate(x, y);
    // Face circle
    c.beginPath(); c.arc(0, 0, s, 0, Math.PI * 2);
    c.fillStyle = '#FFD600'; c.fill(); c.strokeStyle = '#E6B800'; c.lineWidth = 2; c.stroke();
    // Eyes
    c.fillStyle = '#333';
    c.beginPath(); c.arc(-s * 0.3, -s * 0.2, s * 0.1, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(s * 0.3, -s * 0.2, s * 0.1, 0, Math.PI * 2); c.fill();
    // Smile
    c.beginPath(); c.arc(0, s * 0.05, s * 0.5, 0.1 * Math.PI, 0.9 * Math.PI);
    c.strokeStyle = '#333'; c.lineWidth = 2; c.stroke();
    // Tilak
    c.fillStyle = '#F44336';
    c.beginPath(); c.ellipse(0, -s * 0.55, s * 0.1, s * 0.15, 0, 0, Math.PI * 2); c.fill();
    // Color splashes on face
    for (let i = 0; i < 4; i++) {
        const clr = randomHoliColor();
        const sx = (Math.random() - 0.5) * s * 1.2;
        const sy = (Math.random() - 0.5) * s * 1.2;
        c.beginPath(); c.arc(sx, sy, s * 0.15 + Math.random() * s * 0.1, 0, Math.PI * 2);
        c.fillStyle = clr; c.globalAlpha = 0.35; c.fill(); c.globalAlpha = 1;
    }
    c.restore();
}

function drawStickerOnCanvas(sticker, cx2, sx, sy) {
    const baseSize = 60 + Math.random() * 30;
    const rot = (Math.random() - 0.5) * Math.PI / 6;
    cx2.save(); cx2.translate(sx, sy); cx2.rotate(rot);
    sticker.draw(cx2, 0, 0, baseSize, randomHoliColor());
    cx2.restore();
}

function initStickerUI() {
    const list = document.getElementById('stickerList');
    const bar = document.getElementById('stickerBar');
    const toggleBtn = document.getElementById('stickerToggleBtn');
    const hint = document.getElementById('stickerHint');

    STICKER_DEFS.forEach(def => {
        const item = document.createElement('div');
        item.className = 'sticker-item';
        item.dataset.stickerId = def.id;
        // Draw preview
        const preview = document.createElement('canvas');
        preview.width = 40; preview.height = 40;
        const pc = preview.getContext('2d');
        def.draw(pc, 20, 20, 36, randomHoliColor());
        item.appendChild(preview);
        item.addEventListener('click', () => {
            if (selectedSticker === def.id) {
                selectedSticker = null;
                item.classList.remove('active');
                hint.classList.add('hidden');
            } else {
                document.querySelectorAll('.sticker-item').forEach(el => el.classList.remove('active'));
                selectedSticker = def.id;
                item.classList.add('active');
                hint.textContent = `Tap to place ${def.name}!`;
                hint.classList.remove('hidden');
                setTimeout(() => hint.classList.add('hidden'), 2000);
            }
        });
        list.appendChild(item);
    });

    toggleBtn.addEventListener('click', () => {
        stickerBarVisible = !stickerBarVisible;
        bar.classList.toggle('hidden', !stickerBarVisible);
        toggleBtn.classList.toggle('active', stickerBarVisible);
        if (!stickerBarVisible) {
            selectedSticker = null;
            document.querySelectorAll('.sticker-item').forEach(el => el.classList.remove('active'));
            hint.classList.add('hidden');
        }
    });
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
    if (selectedSticker) {
        const def = STICKER_DEFS.find(d => d.id === selectedSticker);
        if (def) pts.forEach(p => { drawStickerOnCanvas(def, ctx, p.x, p.y); playPoofSound(); vibrate(30); });
        isDrawing = false;
        return;
    }
    pts.forEach(p => { drawSplash(p.x, p.y); lastX = p.x; lastY = p.y; });
}
function onMove(e) {
    e.preventDefault();
    if (!isDrawing || selectedSticker) return;
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
initStickerUI();
})();
