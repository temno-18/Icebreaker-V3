ICEBREAKER SETUP

1) Edit keys:
   js/config.js
   - userKeys
   - adminKeys

2) Edit the bottom banner:
   js/config.js
   - banner

3) Add games:
   js/games.js

   Paste your normal JSON objects directly into the array:
   {
     "url": "https://example.com/game",
     "image": "https://example.com/thumb.png",
     "name": "Game Name"
   }

4) Upload to GitHub Pages:
   - extract the zip
   - upload all files to repo root
   - enable Pages from main/root

Notes:
- This package does not include proxy integration or an about:blank launcher.
- It is designed as a clean static site with JSON-driven games and a separate key page.
