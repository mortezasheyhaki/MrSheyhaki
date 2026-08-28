# Sara's Daily Routine

This is a standalone HTML, CSS, and JavaScript game designed for VS Code **Live Server**. Open the `saras-daily-routine-game` folder, right-click `index.html`, and choose **Open with Live Server**.

The game has three fixed stages: morning, afternoon, and evening. Each stage shows only the supplied photos and their base-form action labels. The learner writes one full paragraph about Sara’s routine, and valid submission advances to the next stage. The finish screen contains only the required icon controls: **back** and **try again**.

The `images/` folder is generated locally from the supplied fifteen-photo sheet by `extract_sara_photos.py`. It is included in the final archive, so the game does not rely on an internet connection after extraction.

The completed browser test covers the full **morning → afternoon → evening** flow at a 390px phone viewport. It confirms that each stage loads its local photos and base-form labels, a valid paragraph advances to the next stage, and the final screen contains only labelled icon controls for **back** and **try again**.
