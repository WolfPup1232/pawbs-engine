# 🏳️‍⚧️ Pawbs Engine 🐾
[![Static Badge](https://img.shields.io/badge/License-MIT-green)](https://github.com/WolfPup1232/pawbs-engine?tab=MIT-1-ov-file#readme) [![Firefox version](https://img.shields.io/badge/Firefox-130.0-blue.svg?logo=firefoxbrowser)](https://www.mozilla.org/en-US/firefox/new/)

This is a basic first-person shooter game engine built using **three.js**, a convenient JavaScript library which provides a simple interface through which to make use of the WebGL API.

This engine also utilizes **Tauri** to provide an easy method for cross-platform compilation of application binaries from the game files.

## Features

- Easy-to-follow, well-commented JavaScript classes.
- Mouse and keyboard controls.
- Basic collision detection.
- In-game world editor.
- Game assets loaded via JSON asset lists.

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

Running the game engine in Firefox is really only helpful for rapid testing in a familliar environment.

Tauri automatically rebuilds the application each time a modification to a source file is saved, and the changes are quickly reflected in the Tauri application window when running it with the command above.

For even faster building and testing, a moderately unsafe alternative is to open index.html in Firefox to run the game engine there. However, Firefox blocks Cross-Origin Requests, which prevents local JavaScript and asset files from being loaded.

If you insist on rapid testing the game engine in Firefox like I do, open your Firefox config by typing `about:config` into the address bar. Search for the `security.fileuri.strict_origin_policy` preference, and set it to `false`.

Remember to undo this change before you resume browsing the web normally.