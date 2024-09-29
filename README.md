# 🏳️‍⚧️ Pawbs Engine 🐾
[![Good Puppy!<3](https://img.shields.io/badge/Wruff!-Wruff!%E2%99%A5-purple.svg?logo=data:image/svg%2bxml;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAFVSURBVDhPjdNPK0RRGMfxY/wfU0QpC0shrERkoxRehyZLK1tegY3dZCHeAFs7yYImxUZNdlazMizEpNH1/Z37nOveWzK/+vTce+5zTufOndMRRZHLpYgWvvzdb0poQs+SFKyGrOAR91jWgKWMJ1xiVANJtIOUM4TU0I05tDRg2UEyJ7+DPqvKJGawhk4NWPqt+oQFBq2eWw3R76D3DvnGRXxpc9hGBS/Ys20d4hVHdj+Ca9RRtrF9NFDRzSdC1qGxAaslFO261+omQj70Cjd+K3GWrI7hFDXo1z/BOJRFq8qtVpxGFc+YxQbekI/G9Ew96tWcKS0gXWYBTfwVPVNP6M/8D/TNH/Bf1KNePy+9wDbajXozCxSgd2o36tWc5I80hIn4MhMdnMzhsahXc1z6NB5gC3VUcYU7KPNYhT6hPvExdpFZQBnGO/JHOaQHOtYNf+ec+wHhxe4h70smUwAAAABJRU5ErkJggg==)](https://github.com/WolfPup1232/pawbs-engine) [![MIT License](https://img.shields.io/badge/License-MIT-green)](https://github.com/WolfPup1232/pawbs-engine?tab=MIT-1-ov-file#readme) [![Firefox Version](https://img.shields.io/badge/Firefox-130.0-blue.svg?logo=firefoxbrowser)](https://www.mozilla.org/en-US/firefox/new/) [![Good Puppy!](https://img.shields.io/badge/Good-Puppy!%F0%9F%A6%B4-%23880015.svg?logo=data:image/svg%2bxml;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAQCAYAAAAbBi9cAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEySURBVDhPjdM7TsMwAIdxF1QelQCJx4JEFyRm7sDKyA3gIrByES7AwgAsTEUsbCBGxENF4rEgQJTvS+PKJGmbv/Sr7dhxajsJvV6vrgNcoo1lNDHoTweOcwbzhnvY3sQiWhOhXlpo96thHqd4xBVucNFgtikq5isvq7KOa8xmrRA+83ImL4P/6ATHaHhhSFYRJzFOMJiEnLv2B5gdLGClwI3VHtwb84FndOFebTjRPswP7Cxy8B12sYZDbMOH+oDsMPyZhJ110sEWsptTsTIHn14nL1jCv4ni8U/nZZ38ovTaxAujTqwY1lFO1Qv5jiPcopuXtr0+PPkaPea4R09wz/yW4jdl2+vGcY6v3KM0LtM9+4b/yNL2yOWnEzWTsniT7bS/lDjRKzr9albaTjOmP4Q/crnL1xm1tGoAAAAASUVORK5CYII=)](https://github.com/WolfPup1232/pawbs-engine)

This is a basic first-person shooter game engine built on **three.js**, an easy-to-use JavaScript library that provides a simple interface through which to make use of the WebGL API.

This engine also utilizes **Tauri** to quickly perform cross-platform compilation of application binaries from the game files.

## Features

- Easy-to-follow, fully-documented JavaScript classes.
- Mouse and keyboard controls.
- Basic collision detection.
- In-game world editor.
- Game assets loaded via JSON asset lists.
- Squimshy puppy toe beans! 🐾

## Prerequisites

- **Microsoft Visual Studio C++ Build Tools**: [https://visualstudio.microsoft.com/visual-cpp-build-tools/](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- **Rust**: [https://www.rust-lang.org/tools/install](https://www.rust-lang.org/tools/install)
- **Node.js and npm**: [https://nodejs.org/en/download/prebuilt-installer](https://nodejs.org/en/download/prebuilt-installer)

(Tauri installation guide can be found at [https://tauri.app/v1/guides/getting-started/prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites) for help installing Microsoft Visual Studio C++ Build Tools.)

## Installation

Clone the repo and install the required npm packages:

```bash
git clone https://github.com/WolfPup1232/pawbs-engine.git
cd pawbs-engine
npm install
```


## Run

Build the game engine with Tauri to run it:

```bash
npm run tauri dev
```

## (Optional) Run In Firefox

*The following tidbit will let you to run the game engine locally in Firefox to achieve the fastest possible method of rapid testing, however it requires a potentially unsafe Firefox config change...*

Tauri already automatically rebuilds the application each time a modification to a source file is saved, and the changes are quickly reflected in the Tauri application window when running it with the command noted above.

But for even faster building and testing, an alternative method is to open *./src/index.html* in directly Firefox instead. However, the potentially unsafe part is that, because Firefox blocks Cross-Origin Requests, which is an important security feature of the browser, it prevents local JavaScript and game asset files from being loaded.

If you insist on rapid testing the game engine in Firefox like I do (I know, bad dog!), open your Firefox config by typing `about:config` into the address bar. Search for the `security.fileuri.strict_origin_policy` preference, and set it to `false`.

Remember to undo this change before you resume browsing the web normally!

---

🦴 *Bark bark bark bark bark! Awooooo!* 🦴


# 🐾 Code Barkdown 🐺

>**index.html**&nbsp;&nbsp;&nbsp;[ *./src/index.html* ]

- **This is the main starting point for the game engine's initialization and game loop.**
- Contains all of the HTML elements, CSS file imports, and third-party JS imports that make up the game's UI.
- Initializes the game **renderer**, the **world**, and the **player**, as well as game assets such as textures, and UI event handlers.
- Begins the game loop immediately after initialization.

>**style.css**&nbsp;&nbsp;&nbsp;[ *./src/style.css* ]

- The stylesheet for the game's UI elements and third-party CSS overrides.

## Game Classes

>**world.class.js**&nbsp;&nbsp;&nbsp;[ *./src/classes/world.class.js* ]

- **A world in which the game takes place.**
- Contains the player, as well as objects, terrain, and other things with which the player can interact.
- Handles world loading, surface and bounding box detection to supplement the player's movement and collision detection, and other processes which happen each cycle of the game loop.

>**player.class.js**&nbsp;&nbsp;&nbsp;[ *./src/classes/player.class.js* ]

- **The player to be controlled within the selected game world.**
- Contains all of the player's attributes, as well as both the camera and keyboard/mouse controls which are attached to the player.
- Handles the player's movement and collision detection for each cycle of the game loop.

>**controls.class.js**&nbsp;&nbsp;&nbsp;[ *./src/classes/controls.class.js* ]

- **The keyboard/mouse controls attached to the player.**
- Initializes flags and event handlers for each of the player's actions and keyboard/mouse inputs.

>**editor.class.js**&nbsp;&nbsp;&nbsp;[ *./src/classes/editor.class.js* ]

- The in-game world editor and its associated tools.
- Essentially just a mode which can be toggled on/off in-game by the player.
- Editor UI initialization and tool functionality is contained within.

>**assets.class.js**&nbsp;&nbsp;&nbsp;[ *./src/classes/assets.class.js* ]

- Contains static collections of game assets like textures, sounds, etc. which can be accessed from anywhere in the codebase.
- Also provides loader methods for those game asset collections.

#### Supplementary Game Classes

>**billboard.class.js**&nbsp;&nbsp;&nbsp;[ *./src/classes/billboard.class.js* ]

- Billboards are just Doom-like 2D planes that always face the player and change texture according to view angle.

>**debug.class.js**&nbsp;&nbsp;&nbsp;[ *./src/classes/debug.class.js* ]

- This thing will eventually provide a better debugging interface. It sucks now but who cares.

## Textures

>**textures.json**&nbsp;&nbsp;&nbsp;[ *./src/textures/textures.json* ]

- A list of all the file paths of textures to be loaded into the game engine along with their associated texture names which can be directly referenced anywhere in the codebase via the static textures collection within the assets class.

## Worlds

>**worlds.json**&nbsp;&nbsp;&nbsp;[ *./src/worlds/worlds.json* ]

- A list of all the file paths of world files to be loaded into the game engine along with their associated world names.

## UI Event Handlers

>**editor.events.js**&nbsp;&nbsp;&nbsp;[ *./src/handlers/editor.events.js* ]

- jQuery event handlers for nearly all of the editor's UI elements.

>**utility.events.js**&nbsp;&nbsp;&nbsp;[ *./src/handlers/utility.events.js* ]

- jQuery event handlers for UI elements which provide specialized functionality and can be re-used anywhere.

## Third-Party Libraries

>**three.js**&nbsp;&nbsp;&nbsp;[ *./src/libraries/three.js/...* ]

- Un-minimized local copy of the three.js r128 library.
- Aditional three.js modules, some with custom pawbs-engine edits, which extend the three.js library's functionality.

>**bootstrap**&nbsp;&nbsp;&nbsp;[ *./src/libraries/bootstrap/...* ]

- Minimized local copy of Bootstrap  v5.3.3 for fancy UI element CSS.
- Minimized local copy of Bootstrap Icons v1.11.3 for UI icons.

>**jquery**&nbsp;&nbsp;&nbsp;[ *./src/libraries/jquery/...* ]

- Minimized local copy of jQuery v3.7.1 for all the handy stuff jQuery provides.

---

### 🐾