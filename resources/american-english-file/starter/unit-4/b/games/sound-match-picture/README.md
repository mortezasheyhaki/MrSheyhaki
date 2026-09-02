# Sound Match Picture

**Sound Match Picture** is a standalone, phone-friendly listening game for sixteen common English adjectives. Learners hear one adjective at a time and choose its matching image from a **4×4 picture board**.

| Included item | Purpose |
| --- | --- |
| `index.html` | Main page to open with VS Code Live Server. |
| `style.css` | Learning Arcade-inspired layout with raised, soft-square picture buttons. |
| `script.js` | Matching, shuffled sound order, feedback, scoring, and replay logic. |
| `images/` | Sixteen local adjective visual prompts from the supplied picture sheet. |
| `audio/clips/` | Sixteen short replayable clips prepared from the supplied audio. |
| `audio/adjectives-4.17.mp3` | The original supplied listening recording. |

## How to run it

Open the folder in **Visual Studio Code**, install the **Live Server** extension if necessary, then right-click `index.html` and choose **Open with Live Server**. A local server is important because browsers commonly restrict media files when an HTML page is opened directly from the file system.

The game uses only local HTML, CSS, JavaScript, images, and audio. It does not need a build step, package installation, account, or internet connection once the folder has been downloaded.

## Game flow

Press the purple play button and listen to the first adjective. Select one picture from the 4×4 board. A correct choice receives a green check and stays matched; an incorrect choice gives a short try-again prompt. Each sound can be replayed as often as needed. After all sixteen matches, learners reach the icon-only finish controls.

## Vocabulary

| Adjective pairs |
| --- |
| big / small |
| old / new |
| fast / slow |
| beautiful / ugly |
| cheap / expensive |
| long / short |
| clean / dirty |
| easy / difficult |

## Credit

The image prompts and source audio are included from the materials supplied for this activity. The sixteen replay clips are short excerpts from the supplied `AEF3e_Starter_SB_4.17.mp3` recording.
