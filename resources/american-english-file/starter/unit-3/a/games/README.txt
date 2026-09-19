Unit 3A – match audio fix + sound effects
==========================================

1) Match games – last match no longer cuts off word audio
   pictures-words-match, plural-match, sing-plur-match
   Advance waits for currentAudio.onended (or ~1.6s) before next set / finish.

2) Sound effects (Web Audio) on all 15 games:
   sfxCorrect – rising chime
   sfxWrong   – low buzz
   sfxComplete – short fanfare on finish
   sfxClick   – available for UI taps

Copy each script.js into:
  resources/american-english-file/starter/unit-3/a/games/<game>/
