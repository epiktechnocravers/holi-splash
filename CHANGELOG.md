# Holi Color Splash 2026 — Development Changelog

**Live URL:** https://holi-splash.pages.dev  
**Repo:** https://github.com/epiktechnocravers/holi-splash  
**Stack:** Pure HTML + CSS + JS + Canvas API (no framework) — ~100KB total  
**Hosting:** Cloudflare Pages (free)  
**Built:** Feb 28, 2026  
**Event:** Holi — March 4, 2026  

---

## Architecture

- **Single-page app** with 3 screens: Landing → Play (canvas) → Greeting Card
- **Canvas-based rendering** — all splashes, stickers, photos drawn on HTML5 Canvas
- **Web Audio API** for poof sound effects (no audio files)
- **Web Share API** for native image sharing on mobile
- **No dependencies** — zero npm packages in production; pure vanilla JS
- **Cloudflare Pages** deployment via `wrangler pages deploy`

## Files

| File | Purpose |
|------|---------|
| `index.html` | Single HTML page — 3 screens, all UI elements |
| `style.css` | All styles — responsive, mobile-first |
| `script.js` | All logic — canvas, touch, sharing, stickers |
| `og-image.png` | OpenGraph preview image for link sharing |
| `TASKS.md` | Original task tracking during development |

---

## Commit History & Changes

### 1. `f205a29` — Initial app
- Landing screen with animated background particles
- Play screen with full-screen canvas
- 8 Holi color palette (orange, pink, green, yellow, blue, hot pink, purple, red)
- Random color mode (🎲)
- Tap to splash — irregular blob shapes with bezier curves, radial gradients
- Swipe to paint trail of splashes
- Tap counter badge
- "Create Greeting Card" button appears after 5 splashes
- Name input overlay → greeting card generation
- Card: "Happy Holi! From [Name] 2026" with dark overlay on canvas art
- Download button (PNG)
- Clear canvas button (🗑️)
- Responsive design, mobile-first

### 2. `54537ff` — Selfie/photo mode
- 📸 button to upload photo (camera or gallery)
- Photo drawn as full canvas background (cover crop)
- Throw colors on top of your photo
- Remove photo option (📸 toggles to ✕)
- Photo hint tooltip

### 3. `d079bf6` — Native sharing
- Web Share API integration for sharing actual image files
- Instagram Story format (1080×1920) generation
- Copy image to clipboard
- WhatsApp share with link fallback
- Share toast notifications

### 4. `abb9368` — Physics, sound & polish
- Web Audio API poof sound (synthesized, no files)
- Sound toggle button (🔇/🔊)
- Haptic feedback via `navigator.vibrate()`
- Confetti animation on greeting card screen
- Challenge text "How many colors can you throw?"
- Improved splash physics — scattered droplets around main blob

### 5. `eb0e878` — Holi stickers
- 8 Canvas-drawn stickers (no image files):
  1. 🎈 Water Balloon
  2. 💦 Pichkari (water gun)
  3. 🥟 Gujiya (traditional sweet)
  4. 🥁 Dholak (drum)
  5. 🎨 Color Powder Packet
  6. 🌼 Marigold Flower
  7. ✋ Colorful Handprint
  8. 😊 Happy Face
- Sticker bar with toggle button
- Tap canvas to place sticker at that position
- Sticker hint tooltip

### 6. `c4663dd` — Merge fix
- Selfie mode was overwritten by sticker sub-agent — manually merged back
- Fixed button positioning conflicts

### 7. `d4c0637` — Layout improvements
- Card button moved below counter
- Sticker preview thumbnails made brighter/more visible

### 8. `b1f4be9` — Cleaner splashes
- Reduced clutter — splashes every 40px instead of 15px on swipe
- Removed `globalCompositeOperation: multiply` (was making colors muddy)
- Fewer scattered particles per splash
- Fixed button layout

### 9. `c44220b` — Button positioning
- Sound icon moved to right of camera button

### 10. `2ffc92b` — UI polish
- Empty counter hidden (no "0 splashes")
- Button alignment fixes
- Watermark hint "👆 Tap & swipe to throw colors!" on empty canvas

### 11. `497a34f` — Sticker/color interaction
- Sticker bar closes when selecting a color from palette
- Prevents confusion between sticker and color modes

### 12. `ddd17b3` — Default selection fix
- Random 🎲 correctly shows as default selected (not orange)

### 13. `c4dc80f` — Sticker toggle position
- Toggle button moves up when sticker bar is open
- No more overlap between toggle and sticker bar

### 14. `10b5107` — Drag-and-drop photo placement
- **Photo placement mode** — upload photo → drag to position → pinch to resize → stamp
- Dashed border + corner handles during placement
- "✅ Place Photo" and "Cancel" buttons
- Pinch-to-zoom with 2 fingers (0.1x to 3x scale)
- **Pastel canvas background** — soft warm-tinted wash instead of plain white
- Random pastel color blobs on fresh canvas — areas behind UI no longer stark white
- Clear button resets to pastel wash

### 15. `1cae0b5` — Mirror/flip for selfies
- ↔️ Flip button in photo placement bar
- Fixes front camera mirror issue (selfies appear correct)
- Removed `capture="environment"` — user chooses front/back camera or gallery

### 16. `0954401` — Greeting message picker
- **8 Holi greeting templates:**
  1. 🎨 Happy Holi! — May your life be as colorful as Holi!
  2. 🌈 Rang Barse! — Wishing you a rainbow of happiness
  3. 💕 Holi Hai! — Spreading love & colors your way
  4. ✨ Happy Holi! — Let the colors of Holi brighten your life
  5. 🎉 Holi Mubarak! — May this festival bring joy & prosperity
  6. 🌸 Happy Holi! — Bura na mano, Holi hai! 😄
  7. 🔥 Holika Dahan! — May good triumph over evil
  8. 💐 Happy Holi! — Dipped in hues of love & trust
- Scrollable picker in name overlay — tap to select (pink highlight)
- Selected greeting + subtitle rendered on card

### 17. `73e19c6` — Card layout & sharing fixes
- **Tighter card spacing** — less gap between greeting, subtitle, name, year
- **Bigger name** — bold Baloo 2 font, larger size
- **Darker overlay** on photos for better readability
- **Share Image** — Web Share API shares actual PNG (not just text link)
- **Story (9:16)** — generates 1080×1920 image, shares via native share
- **WhatsApp Status** — shares image via native share sheet
- **Copy Image** — copies actual image to clipboard (not just URL)
- Fallbacks: auto-download + toast instructions when native share unavailable

---

## Deployment

```bash
# Deploy to Cloudflare Pages
CLOUDFLARE_API_TOKEN=<token> \
CLOUDFLARE_ACCOUNT_ID=<id> \
npx wrangler pages deploy . --project-name=holi-splash --branch=main
```

**Cloudflare project:** `holi-splash`  
**Account ID:** `f2ae1d4e2a232330e97fb8c16c699a2d`  
**Cache busting:** Append `?v=N` to URL

## TODO (Pre-launch)
- [ ] Custom domain `holi.technocravers.com` (Cloudflare DNS CNAME)
- [ ] Cloudflare Web Analytics
- [ ] Test on iOS Safari (sharing, sound, pinch-to-zoom)
- [ ] Social media posts for launch (March 1-3)
- [ ] OG image update with final screenshot
