(() => {
'use strict';

const COLORS = ['#FF6B35','#E91E63','#4CAF50','#FFD600','#2196F3','#FF69B4','#9C27B0','#F44336'];
const SITE_URL = 'https://holi.technocravers.com';

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

let ctx, tapCount = 0, selectedColor = 'random', particles = [];
let hasPhoto = false, photoImage = null;

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

function drawSplash(x, y, size) {
    const color = getColor();
    const {r,g,b} = hexToRgb(color);
    const radius = size || (Math.random() * 40 + 40);

    // Main blob using bezier curves
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

    // Smaller droplets
    const numDroplets = 5 + (Math.random() * 8 | 0);
    for (let i = 0; i < numDroplets; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = radius + Math.random() * radius * 1.2;
        const dx = x + Math.cos(angle) * dist;
        const dy = y + Math.sin(angle) * dist;
        const dr = Math.random() * 10 + 3;
        ctx.beginPath();
        // Tiny irregular blobs
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

    tapCount++;
    tapCounter.textContent = `🎨 ${tapCount} splashes`;
    if (tapCount >= 8 && createCardBtn.classList.contains('hidden')) {
        createCardBtn.classList.remove('hidden');
    }
}

// --- Canvas Setup ---
function initMainCanvas() {
    const dpr = devicePixelRatio || 1;
    mainCanvas.width = mainCanvas.offsetWidth * dpr;
    mainCanvas.height = mainCanvas.offsetHeight * dpr;
    ctx = mainCanvas.getContext('2d');
    ctx.scale(dpr, dpr);
    // White background
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

// --- Touch/Mouse Events ---
let isDrawing = false;
function onStart(e) {
    e.preventDefault(); isDrawing = true;
    getCanvasXY(e).forEach(p => drawSplash(p.x, p.y));
}
function onMove(e) {
    e.preventDefault();
    if (!isDrawing) return;
    getCanvasXY(e).forEach(p => drawSplash(p.x, p.y, Math.random() * 25 + 20));
}
function onEnd(e) { e.preventDefault(); isDrawing = false; }

// --- Color Picker ---
document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
        document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        selectedColor = dot.dataset.color;
    });
});

// --- Greeting Card Generation ---
function generateCard(name) {
    const w = mainCanvas.width, h = mainCanvas.height;
    const dpr = devicePixelRatio || 1;
    cardCanvas.width = w; cardCanvas.height = h;
    const cc = cardCanvas.getContext('2d');

    // Draw the colorful canvas as background
    cc.drawImage(mainCanvas, 0, 0);

    // Semi-transparent overlay for text readability
    cc.fillStyle = hasPhoto ? 'rgba(0,0,0,.35)' : 'rgba(0,0,0,.25)';
    cc.fillRect(0, h * .3, w, h * .45);

    // "Happy Holi!" text
    const titleSize = Math.min(w / 6, 120);
    cc.textAlign = 'center';
    cc.textBaseline = 'middle';
    cc.font = `800 ${titleSize}px 'Baloo 2', cursive`;
    cc.fillStyle = '#fff';
    cc.shadowColor = 'rgba(0,0,0,.5)';
    cc.shadowBlur = 20;
    cc.shadowOffsetY = 4;
    cc.fillText('Happy Holi!', w / 2, h * .45);

    // "From [Name]" text
    const nameSize = Math.min(w / 14, 48);
    cc.font = `600 ${nameSize}px 'Poppins', sans-serif`;
    cc.fillText(`From ${name}`, w / 2, h * .56);

    // Year
    const yearSize = Math.min(w / 20, 32);
    cc.font = `400 ${yearSize}px 'Poppins', sans-serif`;
    cc.fillStyle = 'rgba(255,255,255,.8)';
    cc.fillText('2026', w / 2, h * .64);

    // Watermark
    cc.shadowBlur = 0; cc.shadowOffsetY = 0;
    cc.font = `400 ${Math.min(w/30, 16)}px 'Poppins', sans-serif`;
    cc.fillStyle = 'rgba(255,255,255,.4)';
    cc.textAlign = 'right';
    cc.fillText('technocravers.com', w - 20 * dpr, h - 16 * dpr);
}

// --- Screen Navigation ---
function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

// Start
document.getElementById('startBtn').addEventListener('click', () => {
    showScreen(playScreen);
    initMainCanvas();
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
    if (hasPhoto && photoImage) {
        drawPhotoBackground();
    } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, mainCanvas.offsetWidth, mainCanvas.offsetHeight);
    }
});

// Photo Upload
const photoBtn = document.getElementById('photoBtn');
const photoInput = document.getElementById('photoInput');
const photoHint = document.getElementById('photoHint');

photoBtn.addEventListener('click', () => {
    if (hasPhoto) {
        // Remove photo
        if (!confirm('Remove photo and clear canvas?')) return;
        hasPhoto = false; photoImage = null;
        photoBtn.textContent = '📸';
        photoBtn.classList.remove('has-photo');
        photoHint.classList.add('hidden');
        tapCount = 0; tapCounter.textContent = '';
        createCardBtn.classList.add('hidden');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, mainCanvas.offsetWidth, mainCanvas.offsetHeight);
    } else {
        photoInput.click();
    }
});

photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
            photoImage = img;
            hasPhoto = true;
            photoBtn.textContent = '✕';
            photoBtn.classList.add('has-photo');
            photoHint.classList.remove('hidden');
            setTimeout(() => photoHint.classList.add('hidden'), 3000);
            tapCount = 0; tapCounter.textContent = '';
            createCardBtn.classList.add('hidden');
            drawPhotoBackground();
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    photoInput.value = '';
});

function drawPhotoBackground() {
    const cw = mainCanvas.offsetWidth, ch = mainCanvas.offsetHeight;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, cw, ch);
    // Cover mode
    const imgRatio = photoImage.width / photoImage.height;
    const canvasRatio = cw / ch;
    let sw, sh, sx, sy;
    if (imgRatio > canvasRatio) {
        sh = photoImage.height; sw = sh * canvasRatio;
        sx = (photoImage.width - sw) / 2; sy = 0;
    } else {
        sw = photoImage.width; sh = sw / canvasRatio;
        sx = 0; sy = (photoImage.height - sh) / 2;
    }
    ctx.drawImage(photoImage, sx, sy, sw, sh, 0, 0, cw, ch);
}

// Create Card
createCardBtn.addEventListener('click', () => { nameOverlay.classList.remove('hidden'); nameInput.focus(); });

// Generate
document.getElementById('generateBtn').addEventListener('click', () => {
    const name = nameInput.value.trim() || 'Friend';
    nameOverlay.classList.add('hidden');
    generateCard(name);
    showScreen(cardScreen);
});
nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('generateBtn').click(); });

// --- Share helpers ---
let shareCount = 0;
const shareToast = document.getElementById('shareToast');

function showToast(msg) {
    shareToast.textContent = msg;
    shareToast.classList.remove('hidden');
    clearTimeout(shareToast._t);
    shareToast._t = setTimeout(() => shareToast.classList.add('hidden'), 3000);
}

function trackShare() {
    shareCount++;
    if (shareCount >= 3) showToast("You're a Holi Ambassador! 🏆");
    else showToast("🎉 You're spreading Holi joy!");
}

function getCardBlob() {
    return new Promise(resolve => cardCanvas.toBlob(resolve, 'image/png'));
}

async function nativeShare(blob, text) {
    const file = new File([blob], 'holi-greeting-2026.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
            title: 'Happy Holi 2026! 🎨',
            text: text || 'I made this colorful Holi greeting for you!',
            url: SITE_URL,
            files: [file]
        });
        return true;
    }
    return false;
}

function whatsAppFallback() {
    const text = encodeURIComponent(`🎨 Happy Holi 2026! I made this colorful greeting for you! Check it out: ${SITE_URL}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
}

// Download
document.getElementById('downloadBtn').addEventListener('click', () => {
    cardCanvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'holi-greeting-2026.png';
        a.click(); URL.revokeObjectURL(url);
    }, 'image/png');
});

// Share (Web Share API → WhatsApp fallback)
document.getElementById('shareBtn').addEventListener('click', async () => {
    try {
        const blob = await getCardBlob();
        const shared = await nativeShare(blob);
        if (shared) { trackShare(); return; }
    } catch(e) { /* user cancelled or error */ }
    whatsAppFallback();
    trackShare();
});

// Set as Status
document.getElementById('statusBtn').addEventListener('click', async () => {
    try {
        const blob = await getCardBlob();
        const shared = await nativeShare(blob, 'Set this as your WhatsApp Status! 🎨');
        if (shared) { trackShare(); return; }
    } catch(e) { /* cancelled */ }
    whatsAppFallback();
    trackShare();
});

// Copy Image to Clipboard
document.getElementById('copyBtn').addEventListener('click', async () => {
    const btn = document.getElementById('copyBtn');
    try {
        const blob = await getCardBlob();
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        btn.textContent = '✅ Image Copied!';
        setTimeout(() => btn.textContent = '📋 Copy Image', 2000);
    } catch(e) {
        // Fallback: copy URL
        try {
            await navigator.clipboard.writeText(SITE_URL);
            btn.textContent = '✅ Link Copied!';
        } catch(e2) {
            btn.textContent = '❌ Failed';
        }
        setTimeout(() => btn.textContent = '📋 Copy Image', 2000);
    }
});

// Instagram Story
document.getElementById('storyBtn').addEventListener('click', async () => {
    const name = nameInput.value.trim() || 'Friend';
    const sw = 1080, sh = 1920;
    const sc = document.createElement('canvas');
    sc.width = sw; sc.height = sh;
    const sx = sc.getContext('2d');

    // Fill with gradient background
    const bg = sx.createLinearGradient(0, 0, sw, sh);
    bg.addColorStop(0, '#1a0a2e'); bg.addColorStop(1, '#2d1b69');
    sx.fillStyle = bg; sx.fillRect(0, 0, sw, sh);

    // Draw splash canvas cropped to fill 1080x1920
    const srcW = mainCanvas.width, srcH = mainCanvas.height;
    const scale = Math.max(sw / srcW, sh / srcH);
    const dw = srcW * scale, dh = srcH * scale;
    sx.drawImage(mainCanvas, (sw - dw) / 2, (sh - dh) / 2, dw, dh);

    // Overlay for text
    sx.fillStyle = 'rgba(0,0,0,.3)';
    sx.fillRect(0, sh * .3, sw, sh * .4);

    sx.textAlign = 'center'; sx.textBaseline = 'middle';
    sx.shadowColor = 'rgba(0,0,0,.6)'; sx.shadowBlur = 20; sx.shadowOffsetY = 4;

    // Happy Holi!
    sx.font = "800 120px 'Baloo 2', cursive";
    sx.fillStyle = '#fff';
    sx.fillText('Happy Holi!', sw / 2, sh * .42);

    // From Name
    sx.font = "600 56px 'Poppins', sans-serif";
    sx.fillText(`From ${name}`, sw / 2, sh * .52);

    // Year
    sx.font = "400 40px 'Poppins', sans-serif";
    sx.fillStyle = 'rgba(255,255,255,.8)';
    sx.fillText('2026', sw / 2, sh * .59);

    // Swipe up
    sx.shadowBlur = 0; sx.shadowOffsetY = 0;
    sx.font = "400 28px 'Poppins', sans-serif";
    sx.fillStyle = 'rgba(255,255,255,.6)';
    sx.fillText('Swipe Up → holi-splash.pages.dev', sw / 2, sh * .92);

    // Watermark
    sx.font = "400 20px 'Poppins', sans-serif";
    sx.fillStyle = 'rgba(255,255,255,.3)';
    sx.textAlign = 'right';
    sx.fillText('technocravers.com', sw - 30, sh - 30);

    // Download + try share
    sc.toBlob(async (blob) => {
        // Try native share first
        try {
            const file = new File([blob], 'holi-story-2026.png', { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ title: 'Happy Holi 2026!', files: [file] });
                trackShare();
                return;
            }
        } catch(e) { /* cancelled */ }
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'holi-story-2026.png';
        a.click(); URL.revokeObjectURL(url);
        showToast('📱 Story image downloaded! Share it on Instagram');
    }, 'image/png');
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
