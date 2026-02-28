# Holi Splash — Tasks

## Task 1: Sound Effects & Haptics
- Add splash sound on each tap (use Web Audio API, generate programmatically — no external files)
- Add haptic feedback on mobile (navigator.vibrate)
- Background festive music toggle (optional Bollywood beat loop)

## Task 2: Improved Splash Physics & Animations
- Add splash animation (splashes grow/fade in slightly)
- Add dripping effect on large splashes
- Color mixing when splashes overlap (blend modes)
- Trail effect on swipe (continuous color stream, not discrete blobs)

## Task 3: Selfie Mode — "Holi-fy Your Photo"
- Add camera/upload button on play screen
- User uploads/takes a photo → renders as canvas background (instead of white)
- Throw colors ON the photo → creates personalized Holi photo
- This is the #1 viral feature

## Task 4: Instagram Story Format Support
- Add "Create Story" button alongside greeting card
- Generates 1080x1920 (9:16) format optimized for Instagram Stories
- "Swipe Up" CTA at bottom
- Instagram-native share (if Web Share API available)

## Task 5: Animated Greeting Card
- Instead of static image, generate a short animated greeting
- Confetti/color burst animation when card is shown
- "Happy Holi" text animates in with color
- Option to screen-record or export as GIF/video

## Task 6: Leaderboard & Social
- Track splash count per session
- "I threw X colors!" shareable badge
- Fun achievements: "Color Master" (50+ splashes), "Rainbow Warrior" (used all 8 colors)

## Task 7: SEO, OG Image & Meta
- Proper OG image (colorful preview, not generic)
- Twitter card meta tags
- Add structured data
- PWA manifest for "Add to Home Screen"

## Task 8: Performance & Polish
- Preload fonts
- Add loading state
- Smooth transitions between screens
- Fix any mobile viewport issues (safe areas, notch)
- Test on iOS Safari + Android Chrome

## Task 9: Custom Domain & Analytics
- Set up holi.technocravers.com subdomain on Cloudflare
- Add simple analytics (Cloudflare Web Analytics — free, no cookie banner needed)

## Task 10: Sharing Enhancement
- Web Share API (native share sheet on mobile)
- Share the actual image on WhatsApp (not just link)
- "Share as Status" button for WhatsApp Status
- Copy greeting card to clipboard
