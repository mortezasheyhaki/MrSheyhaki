HOW TO ADD THE SUPERMARKET GAME TO YOUR SITE
============================================

Upload this "speaking" folder so it becomes:

  https://mrsheyhaki.ir/learningarcade/speaking/

On your server, the path should look like:

  learningarcade/
    speaking/
      index.html              ← replaces the current "No Speaking games yet" page
      style.css               ← (keep your existing file; do not overwrite if you already have one)
      script.js               ← (keep your existing file)
      supermarket/
        index.html            ← the game
        supermarket_images/   ← all 16 pictures

STEPS
-----
1. Backup your current:
     learningarcade/speaking/index.html

2. Upload the new speaking/index.html
   (This adds the "Supermarket Order" card with a PLAY button.)

3. Upload the whole supermarket/ folder
   (game + images) inside learningarcade/speaking/

4. Open:
     https://mrsheyhaki.ir/learningarcade/speaking/
   You should see the Supermarket Order card.

5. Click PLAY → the game opens at:
     https://mrsheyhaki.ir/learningarcade/speaking/supermarket/

NOTES
-----
- Microphone only works on HTTPS (your site already has this).
- Best in Chrome or Edge.
- Do NOT overwrite style.css / script.js / theme files unless you want to.
  The game uses your existing site CSS for the header and back button.
