# 🏳️‍⚧️ Pawbs Engine 🐾
[![Good Puppy!<3](https://img.shields.io/badge/Wruff!-Wruff!%E2%99%A5-purple.svg?logo=data:image/svg%2bxml;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAFVSURBVDhPjdNPK0RRGMfxY/wfU0QpC0shrERkoxRehyZLK1tegY3dZCHeAFs7yYImxUZNdlazMizEpNH1/Z37nOveWzK/+vTce+5zTufOndMRRZHLpYgWvvzdb0poQs+SFKyGrOAR91jWgKWMJ1xiVANJtIOUM4TU0I05tDRg2UEyJ7+DPqvKJGawhk4NWPqt+oQFBq2eWw3R76D3DvnGRXxpc9hGBS/Ys20d4hVHdj+Ca9RRtrF9NFDRzSdC1qGxAaslFO261+omQj70Cjd+K3GWrI7hFDXo1z/BOJRFq8qtVpxGFc+YxQbekI/G9Ew96tWcKS0gXWYBTfwVPVNP6M/8D/TNH/Bf1KNePy+9wDbajXozCxSgd2o36tWc5I80hIn4MhMdnMzhsahXc1z6NB5gC3VUcYU7KPNYhT6hPvExdpFZQBnGO/JHOaQHOtYNf+ec+wHhxe4h70smUwAAAABJRU5ErkJggg==)](https://github.com/WolfPup1232/pawbs-engine) [![MIT License](https://img.shields.io/badge/License-MIT-green)](https://github.com/WolfPup1232/pawbs-engine?tab=MIT-1-ov-file#readme) [![Neocities Website](https://img.shields.io/badge/Neocities-Website-%23B8681C.svg)](https://pawbs-engine.neocities.org/) [![Firefox Version](https://img.shields.io/badge/Firefox-135.0-blue.svg?logo=firefoxbrowser)](https://www.mozilla.org/en-US/firefox/new/) [![Good Puppy!](https://img.shields.io/badge/Good-Puppy!%F0%9F%A6%B4-%23880015.svg?logo=data:image/svg%2bxml;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAQCAYAAAAbBi9cAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEySURBVDhPjdM7TsMwAIdxF1QelQCJx4JEFyRm7sDKyA3gIrByES7AwgAsTEUsbCBGxENF4rEgQJTvS+PKJGmbv/Sr7dhxajsJvV6vrgNcoo1lNDHoTweOcwbzhnvY3sQiWhOhXlpo96thHqd4xBVucNFgtikq5isvq7KOa8xmrRA+83ImL4P/6ATHaHhhSFYRJzFOMJiEnLv2B5gdLGClwI3VHtwb84FndOFebTjRPswP7Cxy8B12sYZDbMOH+oDsMPyZhJ110sEWsptTsTIHn14nL1jCv4ni8U/nZZ38ovTaxAujTqwY1lFO1Qv5jiPcopuXtr0+PPkaPea4R09wz/yW4jdl2+vGcY6v3KM0LtM9+4b/yNL2yOWnEzWTsniT7bS/lDjRKzr9albaTjOmP4Q/crnL1xm1tGoAAAAASUVORK5CYII=)](https://github.com/WolfPup1232/pawbs-engine)

**Pawbs Engine** is a *very* under-construction first-person shooter game engine built on **three.js**, an easy-to-use JavaScript library that provides a simple interface for making use of the WebGL API.

**Multiplayer Game Support -** Pawbs Engine comes with two **Node.js** servers for hosting online multiplayer games. A **WebSocket Dedicated Server** for hosting a multiplayer game in a server environment, and a **WebRTC Peer-To-Peer Signaling Server** for managing peer-to-peer multiplayer games.

**In-Game World Editor -** Ctrl+E toggles the initial stages of an in-game world editor with online multiplayer support.

**Cross-Platform Application Binaries -** This engine also utilizes **Tauri** to quickly perform cross-platform compilation of application binaries from game files.

**Docker & Fly.io Support -** A Dockerfile and .dockerignore, and a fly.toml config are included as a working example of containerization support.


## Features

- Easy-to-follow, fully-documented JavaScript classes.
- Online multiplayer game support (dedicated & peer-to-peer).
- Mouse and keyboard controls.
- Basic collision detection.
- In-game world editor.
- Game assets loaded via JSON asset lists.
- Squimshy puppy toe beans! 🐾

## Prerequisites

- **Microsoft Visual Studio C++ Build Tools**: [https://visualstudio.microsoft.com/visual-cpp-build-tools/](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- **Rust**: [https://www.rust-lang.org/tools/install](https://www.rust-lang.org/tools/install)
- **Node.js and npm**: [https://nodejs.org/en/download/prebuilt-installer](https://nodejs.org/en/download/prebuilt-installer)

(For help installing Microsoft Visual Studio C++ Build Tools, the Tauri installation guide can be found at [https://tauri.app/v1/guides/getting-started/prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites).)

## Installation

Clone the repo and install the required npm packages:

```bash
git clone https://github.com/WolfPup1232/pawbs-engine.git
cd pawbs-engine
npm install
```

## Run Pawbs Engine

In the directory root (`./`), build the game engine with Tauri to run it:

```bash
npm run tauri dev
```

## Run A Server

Navigate to the servers directory (`./src/servers/`) and run the appropriate terminal command from below:

#### Dedicated Server:

```bash
node .\dedicated-server.js
```

#### Signaling Server:

```bash
node .\signaling-server.js
```

#### HTTP Server:

```bash
node .\http-server.js
```

## Run All Servers Concurrently

To run all 3 servers concurrently, which can be helpful in a server environment, navigate to the directory root (`./`), and run:

```bash
npm start
```

## (Optional) Run In Firefox

*The following tidbit will let you to run Pawbs Engine locally in Firefox for quick debugging, but it requires a potentially unsafe Firefox config change...*

Firefox's default security settings block Cross-Origin Requests, which is great for security, but stops Pawbs Engine from loading local JavaScript files and game assets. To change this setting, open your Firefox config by typing `about:config` into the address bar. Search for the `security.fileuri.strict_origin_policy` preference, and set it to `false`.

Be sure to switch it back before browsing normally!

---

### 🐾