# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
# Install dependencies
npm install

# Development - Tauri desktop app (main development workflow)
npm run tauri dev

# Run all 3 servers concurrently
npm start

# Run individual servers (from src/servers/ directory)
node .\dedicated-server.js    # Authoritative multiplayer server (WebSocket)
node .\signaling-server.js    # WebRTC P2P signaling server
node .\http-server.js         # File serving server (Express)

# Container mode (all 3 servers)
npm run container
```

### Prerequisites
- Microsoft Visual Studio C++ Build Tools
- Rust
- Node.js and npm

## Architecture Overview

Pawbs Engine is a first-person shooter game engine built on three.js with multiplayer support, an in-game world editor, and Tauri desktop compilation.

### Core Class Structure (src/classes/)

Most core classes use **static methods/properties for singleton behavior**:

- **Game** - Main singleton managing game state, initialization, and game loop via requestAnimationFrame
- **Player** - Player entity with movement, attributes, collision detection, multiplayer sync
- **World** - THREE.Scene wrapper containing all game objects and terrain
- **Controls** - Mouse/keyboard input (PointerLock + Transform controls)
- **Multiplayer** - Network abstraction singleton for all connection types
- **Editor** - In-game world editor singleton (toggle: Ctrl+E)
- **UI** - Menu systems and in-game UI pseudo-singleton (Bootstrap-based)
- **Assets** - Loading system singleton for textures, object prefabs, world files
- **Settings** - Game configuration with serializable defaults
- **Shaders** - Custom THREE.js shader materials singleton (cel shading)

### Networking Architecture

**Three Server Types**:
1. **Dedicated Server** (`dedicated-server.js`): WebSocket authoritative server running full game simulation via JSDOM
2. **HTTP Server** (`http-server.js`): Express server for game file serving
3. **Signaling Server** (`signaling-server.js`): WebSocket server for WebRTC P2P handshakes

**Connection Types** (in Multiplayer class):
- None, HTTPServer, DedicatedServer, DedicatedClient, SignalingServer, SignalingClient, P2PClient

**Serialization**: MessagePack (msgpack-lite) for binary protocol, fflate for compression

### UI System (src/ui/)

- **src/ui/*.events.js**: Event handlers for game controls, menus, editor tools

Event handlers cover: WASD movement, mouse look, Ctrl+E editor toggle, all menu screens (main, multiplayer, options, pause), editor tools (selection, transform, spawn), debug overlay.

Key UI functions are attached to `Game.ui` object.

### Game Initialization Flow

1. index.html loads libraries (Bootstrap, jQuery, fflate, msgpack)
2. Game.initialize() called
3. THREE.js extensions initialized
4. Settings loaded from JSON
5. Assets loaded (textures, objects, worlds)
6. Renderer, World, Player, Controls created
7. UI initialized with event handlers
8. Game loop starts

### Key Technologies

- **Rendering**: three.js (WebGL)
- **UI Framework**: Bootstrap 5, jQuery
- **Compression**: fflate
- **Serialization**: msgpack-lite
- **Desktop**: Tauri (Rust-based)
- **Server Runtime**: Node.js with JSDOM for headless game simulation

## Important Patterns

### File Organization
```
src/
├── index.html           # Main entry point
├── classes/             # Core game classes
├── libraries/           # three.js, Bootstrap, jQuery, fflate, msgpack
├── servers/             # Node.js servers + helpers/
├── ui/                  # Event handler functions
└── objects/             # Game asset prefabs (JSON)

src-tauri/               # Tauri desktop wrapper (Rust)
```

### Asset System
- Textures and object prefabs loaded via JSON asset lists
- Settings path logic handles local, shortcut, and containerized paths differently
- World files contain serialized scene data

### Editor Features
- Object/face/vertex selection modes
- Transform tools with snap-to-grid
- Material editor, spawn tools (primitives, objects, terrain, NPCs, walls)
- Scene graph visualization
- Prefab save/load, cut/copy/paste
- Multiplayer-aware

### Multiplayer Sync
- P2P uses star topology with host management via p2p_connections map
- Syncs: position, rotation, player attributes
- Position updates sent at 62.5fps (16ms rate limit)
- Ping uses separate 5-second interval messages (RTT calculated via timestamp echo with rolling 5-sample average)
- Multiplayer helper properties: `is_dedicated_server`, `is_signaling_server`, `is_http_server`, `is_p2p_client`

### Code Style
- **Variables**: snake_case (e.g., `player_id`, `ping_interval`)
- **Methods/Functions**: camelCase (e.g., `sendPlayerUpdate`, `handleMessage`)
- **Regions**: Use `#region [Name]` / `#endregion` for code organization
- **Comments**: JSDoc style for functions, inline comments for logic
- **Indentation**: Tabs