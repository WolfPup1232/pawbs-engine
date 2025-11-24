// three.js Imports
import * as THREE from '../libraries/threejs/three.js';
import initializeObject3DExtension from '../libraries/threejs/modules/ExtendedObject3D.js';
import initializeRaycasterExtension from '../libraries/threejs/modules/ExtendedRaycaster.js';

// Class Imports
import Settings from './settings.class.js';
import World from './world.class.js';
import Player from './player.class.js';
import Controls from './controls.class.js';
import UI from './ui.class.js';

// Static Class Imports
import Assets from './assets.class.js';
import Editor from './editor.class.js';
import Debug from './debug.class.js';
import Multiplayer from './multiplayer.class.js';

// fflate & MessagePack Imports
let fflate, msgpack;
if (typeof window !== 'undefined')
{
	fflate = window.fflate;
	msgpack = window.msgpack;
}
else
{
	fflate = await import('fflate');
	msgpack = await import('msgpack-lite');
}

/**
 * The game.
 */
class Game
{
	
	//#region [Class Declarations]
		
		/**
		 * The game's unique ID.
		 */
		static id = THREE.MathUtils.generateUUID();
		
		/**
		 * The game's name.
		 */
		static name = "My First Game";
		
		
		//#region [Libraries]
			
			/**
			 * fflate library.
			 */
			static fflate = fflate;
			
			/**
			 * MessagePack library.
			 */
			static msgpack = msgpack;
			
		//#endregion
		
		
		//#region [Flags]
			
			/**
			 * Flag indicating whether or not the game is paused.
			 */
			static paused = false;
			
			/**
			 * Flag indicating whether or not the game is to be paused at the start of the next game loop update.
			 */
			static paused_async = false;
			
		//#endregion
		
		
		//#region [Game Objects]
			
			/**
			 * The list of players in the game.
			 */
			static players = [];
			
			/**
			 * The current user-controlled player in the selected game world.
			 */
			static player = null;
			
			/**
			 * The selected game world.
			 */
			static world = null;
			
			/**
			 * The game's user interface.
			 */
			static ui = new UI();
			
			/**
			 * The game's settings.
			 */
			static settings = new Settings();
			
		//#endregion
		
		
		//#region [HTML Elements]
			
			/**
			 * A reference to the web browser window, which contains the DOM document.
			 */
			static window_interface = null;
			
			/**
			 * A reference to the DOM document within the web browser window.
			 */
			static dom_document = null;
			
			/**
			 * An optional reference to a Node.js server's FileSystem package.
			 */
			static file_system = null;
			
		//#endregion
		
		
		//#region [Renderer]
			
			/**
			 * The three.js WebGL renderer which renders the selected game world.
			 */
			static renderer = null;
			
			/**
			 * Flag indicating whether or not a single frame has been rendered before updating the game state can begin.
			 */
			static render_single_frame = false;

			/**
			 * Timestamp of the last frame, used for delta time calculations.
			 */
			static last_frame_time = null;
			
		//#endregion
		
		
	//#endregion
	
	
	//#region [Constructor]
		
		/**
		 * Static class constructor.
		 */
		static { }
		
	//#endregion
	
	
	//#region [Properties]
		
		/**
		 * A simplified version of the game for multiplayer communication.
		 */
		static get simplified()
		{
			return {
				id: 		this.id,
				name: 		this.name,
				players:	Multiplayer.listPlayers(),
			};
		}
		static set simplified(player)
		{
			this.id = player.id;
			this.name = player.name;
		}
		
		/**
		 * Flag indicating whether or not the current game instance is singleplayer.
		 */
		static get is_singleplayer()
		{
			return (!Multiplayer.enabled);
		}
		
	//#endregion
	
	
	//#region [Methods]
		
		/**
		 * Initializes the game.
		 *
		 * @param {Window} window_interface A reference to the web browser window, which contains the DOM document.
		 * @param {Document} dom_document A reference to the DOM document within the web browser window.
		 * @param {Multiplayer.ConnectionTypes} ConnectionTypes An optional multiplayer connection type to initialize the game with. Enables multiplayer mode.
		 * @param {FileSystem} file_system An optional reference to a Node.js server's FileSystem package.
		 * @param {Function} serverCallback A callback function passed from a Node.js server which is invoked when the game's settings have been loaded.
		 */
		static initialize(window_interface, dom_document, connection_type = null, file_system = null, serverCallback = null)
		{
			
			// Initialize three.js class extensions
			initializeObject3DExtension();
			initializeRaycasterExtension();
			
			// A multiplayer game is being initialized if a connection type has been specified...
			if (connection_type)
			{
				
				// Enable multiplayer
				Multiplayer.enabled = true;
				
				// Set multiplayer connection type
				Multiplayer.connection_type = connection_type;
				
				// Attempt to get server FileSystem package (just in case its a Node.js server initializing the game)...
				if (file_system)
				{
					this.file_system = file_system;
				}
				
			}
			
			// If the game is either singleplayer or a multiplayer dedicated server...
			if (this.is_singleplayer || Multiplayer.is_dedicated_server)
			{
				
				// Initialize web browser window and DOM document (dedicated servers will execute this block too because they have simulated DOMs)
				this.window_interface = window_interface;
				this.dom_document = dom_document;
				
			}
			
			// Load game settings from JSON, then continue initialization...
			this.settings.load((settings) => {
				
				// Get loaded game settings
				Object.assign(this.settings, settings);
				
				// If the game is hosted on an HTTP server or a signaling server...
				if (Multiplayer.is_http_server || Multiplayer.is_signaling_server)
				{
					
					// Don't initialize the game any more, invoke server callback
					serverCallback();
					
					
				} // Otherwise, if the game is hosted on a dedicated server...
				else if (Multiplayer.is_dedicated_server)
				{
					
					// Invoke server callback
					serverCallback();
					
					// Skip UI initializing, just start a new game
					this.start();
					
					
				} // Otherwise, if the game is running in-browser...
				else
				{
					
					// Initialize main menu UI
					this.ui.initializeMainMenuUI()
					
					// Show main menu
					this.ui.menus.showMainMenu()
					
				}
				
			});
			
		}
		
		/**
		 * Starts a new game.
		 *
		 * @param {Function} multiplayerCallback A callback function which is invoked to perform specific multiplayer tasks after the game has loaded but before the game starts.
		 */
		static start(multiplayerCallback = null)
		{
			
			// Initialize in-game UI and renderer
			this.ui.initializeGameUI()
			
			// Load game assets, then initialize and start game...
			Assets.load(() => {
				
				// Initialize game flags
				this.paused = false;
				this.render_single_frame = false;
				
				// Initialize world
				this.world = new World();
				this.world.load(Assets.worlds.TestWorld);
				
				// Initialize players
				this.players = [];
				
				// Initialize player
				this.player = new Player();
				this.players[this.player.id] = this.player;
				
				// Initialize player's keyboard/mouse controls
				this.player.controls = new Controls();
				this.player.controls.initializeMouseAndKeyboardControls();
				
				// If game is multiplayer...
				if (!this.is_singleplayer)
				{
					
					// Set the game's multiplayer attributes
					this.name = this.settings.multiplayer_default_server_name;
					
					// Set the player's multiplayer attributes
					this.player.name = this.settings.multiplayer_nickname;
					this.player.colour = new THREE.Color(this.settings.multiplayer_colour);
					
					// Invoke multiplayer callback if necessary...
					if (multiplayerCallback)
					{
						multiplayerCallback();
					}
					
				}
				
				// Start the game loop
				this.gameLoop();
				
			});
			
		}
		
		/**
		 * Updates the game state and handles other game processes before each frame renders, then renders the frame to the canvas.
		 *
		 * @param {number} timestamp A 'high-res' timestamp automatically passed by the browser DOM during the callback of requestAnimationFrame().
		 */
		static gameLoop(timestamp = null)
		{
			
			// If pause-on-next-update has been flagged...
			if (this.paused_async)
			{
				
				// Pause game and reset flag
				this.paused = true;
				this.paused_async = false;
				
			}
			
			// If the game is either singleplayer, or if it's multiplayer but *not* a dedicated server...
			if (this.is_singleplayer || !Multiplayer.is_dedicated_server)
			{
				
				// Request a frame to be rendered using this method as a callback
				const request_id = this.window_interface.requestAnimationFrame((dom_high_res_timestamp) => this.gameLoop(dom_high_res_timestamp));
				
				// Make sure a single frame has been rendered before updating the game...
				if (!this.render_single_frame)
				{
					
					// This is primarily workaround for initializing collision bounding boxes before handling *any* collision detection
					this.render_single_frame = true;
					
					// Initialize last frame timestamp on first render for later use calculating delta time
					this.last_frame_time = (timestamp !== null) ? timestamp : (this.window_interface.performance ? this.window_interface.performance.now() : Date.now());
					
					
				} // Otherwise, if a single frame has already been rendered...
				else
				{
					
					// Update the game state
					if (!this.paused)
					{
						
						// Get current time
						const now = (timestamp !== null) ? timestamp : (this.window_interface.performance ? this.window_interface.performance.now() : Date.now());
						
						// Calculate delta time between now and last frame for framerate-independent timing of stuff like movement and animations
						const delta = Math.min(0.1, Math.max(0, (now - (this.last_frame_time ?? now)) / 1000));
						
						// Reset the last frame time to the current time, since we've now calculated our delta time between this frame and the last
						this.last_frame_time = now;
						
						// Update game state using delta time
						this.update(delta);
						
					}
					
				}
				
				// If the game is not paused...
				if (!this.paused)
				{
					
					// Render a single frame
					this.renderer.render(Game.world.scene, Game.player.camera);
					
					
				} // Otherwise, if the game is paused...
				else
				{
					
					// Stop the game loop
					this.window_interface.cancelAnimationFrame(request_id);
					
				}
				
				
			} // Otherwise, if the game is a multiplayer dedicated server...
			else if (Multiplayer.is_dedicated_server)
			{
			
				// Make sure a single frame has been rendered before updating the game...
				if (!this.render_single_frame)
				{
					
					// This isn't needed in multiplayer for the collision bounding boxes thing, as the server handles that, but it's useful for other stuff!
					this.render_single_frame = true;
					
					// Initialize last frame timestamp on first tick for later use calculating delta time
					this.last_frame_time = (timestamp !== null) ? timestamp : (this.window_interface.performance ? this.window_interface.performance.now() : Date.now());
					
					
				} // Otherwise, if a single frame has already been rendered...
				else
				{
				
					// Get current time
					const now = (timestamp !== null) ? timestamp : (this.window_interface.performance ? this.window_interface.performance.now() : Date.now());
					
					// Calculate delta time between now and last frame for framerate-independent timing of stuff like movement and animations
					const delta = Math.min(0.1, Math.max(0, (now - (this.last_frame_time ?? now)) / 1000));
					
					// Reset the last frame time to the current time, since we've now calculated our delta time between this tick and the last
					this.last_frame_time = now;
					
					// Update game state using delta time
					this.update(delta);
				
				}
				
				// Keep on truckin' at ~50 Hz
				const tick_ms = 1000 / this.settings.multiplayer_default_tick_hz;
				setTimeout(() => Game.gameLoop(), tick_ms);
				
			}
			
		}
		
		/**
		 * Updates the game state.
		 *
		 * @param {number} delta Game time delta between current and previous frame.
		 */
		static update(delta)
		{
			
			// For each player in the game's player list...
			const player_ids = Object.keys(this.players);
			for (let i = 0; i < player_ids.length; i++)
			{
				
				// Get player
				const player = this.players[player_ids[i]];
				
				// Update player (movement, collision detection, etc)...
				if (player)
				{
					player.update(delta);
				}
				
			}
			
			// Update in-game editor...
			if (Editor.enabled)
			{
				Editor.update();
			}
			
			// Update in-game debugger...
			if (Debug.enabled)
			{
				Debug.update();
			}
			
		}
		
		/**
		 * Pauses the game.
		 */
		static pause()
		{
			
			// If game is singleplayer...
			if (this.is_singleplayer)
			{
				
				// Pause game
				this.paused = true;
				
			}
			
			// Show pause menu
			this.ui.menus.showPauseMenu();
			
		}
		
		/**
		 * Unpauses the game.
		 */
		static unpause()
		{
			
			// If game is paused...
			if (this.paused)
			{
				
				// Unpause game
				this.paused = false;
				
				// Reset last frame timestamp to avoid large first delta time
				this.last_frame_time = null;
				
				// Restart game loop
				this.gameLoop();
				
			}
			
			// Lock pointer controls
			this.player.controls.lockPointerLockControls();
			
			// Hide pause menu
			this.ui.menus.hidePauseMenu();
			
		}
		
		/**
		 * Quits the game.
		 */
		static quit()
		{
			
			// Pause game
			this.paused = true;
			
			// Disable the editor...
			if (Editor.enabled)
			{
				Editor.toggle();
			}
			
			// De-initialize player's keyboard/mouse controls
			this.player.controls.deinitializeMouseAndKeyboardControls();
			
			// If the game is either singleplayer, or if it's multiplayer but *not* a dedicated server...
			if (this.is_singleplayer || !Multiplayer.is_dedicated_server)
			{
				
				// Hide pause menu
				this.ui.menus.hidePauseMenu();
				
				// Show main menu
				this.ui.menus.showMainMenu();
				
			}
			
			// If game is multiplayer...
			if (!this.is_singleplayer)
			{
				
				// Disconnect from multiplayer
				Multiplayer.disconnect();
				
			}
			
		}
		
		/**
		 * Exits the game.
		 */
		static exit()
		{
			
			// Close browser window
			this.window_interface.close();
			
		}
		
	//#endregion
	
}
export default Game;