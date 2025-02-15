// three.js Imports
import * as THREE from '../libraries/threejs/three.js';
import { CustomOutlineEffect } from '../libraries/threejs/modules/CustomOutlineEffect.js';

// Class Imports
import Settings from './settings.class.js';
import World from './world.class.js';
import Player from './player.class.js';
import Controls from './controls.class.js';
import UI from './ui.class.js';

// UI Event Handler Imports
import initializeUtilityUIEventHandlers from '../handlers/utility.events.js';

import initializeGameUIEventHandlers from '../handlers/game.events.js';
import initializeEditorUIEventHandlers from '../handlers/editor.events.js';
import initializeDebugUIEventHandlers from '../handlers/debug.events.js';

import initializeMainMenuUIEventHandlers from '../handlers/menu-main.events.js';
import initializeMultiplayerMenuUIEventHandlers from '../handlers/menu-multiplayer.events.js';
import initializeOptionsMenuUIEventHandlers from '../handlers/menu-options.events.js';
import initializePauseMenuUIEventHandlers from '../handlers/menu-pause.events.js';

// Static Class Imports
import Assets from './assets.class.js';
import Editor from './editor.class.js';
import Debug from './debug.class.js';
import Multiplayer from './multiplayer.class.js';

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
		
		/**
		 * The game's birthday.
		 */
		static start_time = Date.now();
		
		
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
			static ui = null;
			
			/**
			 * The game's settings.
			 */
			static settings = null;
			
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
			static file_system;
			
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
			
			// If the game is either singleplayer, or if it's multiplayer but *not* a signaling server...
			if (!Multiplayer.enabled || (Multiplayer.enabled && Multiplayer.connection_type != Multiplayer.ConnectionTypes.SignalingServer))
			{
				
				// Initialize web browser window and DOM document (dedicated servers will execute this block too because they have simulated DOMs)
				this.window_interface = window_interface;
				this.dom_document = dom_document;
				
			}
			
			// Initialize game settings
			this.settings = new Settings();
			
			// Load game settings from JSON, then continue initialization...
			this.settings.load((settings) => {
				
				// Get loaded game settings
				Object.assign(this.settings, settings);
				
				// If the game is hosted on an HTTP server or a signaling server...
				if (Multiplayer.connection_type == Multiplayer.ConnectionTypes.HTTPServer || Multiplayer.connection_type == Multiplayer.ConnectionTypes.SignalingServer)
				{
					
					// Don't initialize the game any more, invoke server callback
					serverCallback();
					
					
				} // Otherwise, if the game is hosted on a dedicated server...
				else if (Multiplayer.connection_type == Multiplayer.ConnectionTypes.DedicatedServer)
				{
					
					// Invoke server callback
					serverCallback();
					
					// Skip UI initializing, just start a new game
					this.start();
					
					
				} // Otherwise, if the game is running in-browser...
				else
				{
					
					// Initialize game UI
					this.ui = new UI();
					
					// Initialize utility/helper UI event handlers
					initializeUtilityUIEventHandlers();
					
					// Initialize game UI event handlers
					initializeGameUIEventHandlers();
					initializeEditorUIEventHandlers();
					initializeDebugUIEventHandlers();
					
					// Initialize menu UI event handlers
					initializeMainMenuUIEventHandlers();
					initializeMultiplayerMenuUIEventHandlers();
					initializeOptionsMenuUIEventHandlers();
					initializePauseMenuUIEventHandlers();
					
					// Initialize tooltips
					this.ui.utilities.initializeTooltips();
					
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
			
			// If the game is either singleplayer, or if it's multiplayer but *not* a dedicated server...
			if (!Multiplayer.enabled || (Multiplayer.enabled && Multiplayer.connection_type != Multiplayer.ConnectionTypes.DedicatedServer))
			{
				
				// Initialize renderer
				this.renderer = new THREE.WebGLRenderer();
				this.renderer = new CustomOutlineEffect(this.renderer, { defaultThickness: 0.0032 });
				this.renderer.setSize(window.innerWidth, window.innerHeight);
				this.ui.utilities.initializeRenderer();
				
			}
			
			// Load game assets, then initialize and start game...
			Assets.load(() => {
				
				// Happy birthday!
				this.start_time = Date.now();
				
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
				
				// If the game is either singleplayer, or if it's multiplayer but *not* a dedicated server...
				if (!Multiplayer.enabled || (Multiplayer.enabled && Multiplayer.connection_type != Multiplayer.ConnectionTypes.DedicatedServer))
				{
					
					// Initialize keyboard/mouse UI event handlers...
					this.ui.controls.initializeControls();
					
				}
				
				// If game is multiplayer...
				if (Multiplayer.enabled)
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
		 */
		static gameLoop()
		{
			
			// If pause-on-next-update has been flagged...
			if (this.paused_async)
			{
				
				// Pause game and reset flag
				this.paused = true;
				this.paused_async = false;
				
			}
			
			// If the game is either singleplayer, or if it's multiplayer but *not* a dedicated server...
			if (!Multiplayer.enabled || (Multiplayer.enabled && Multiplayer.connection_type != Multiplayer.ConnectionTypes.DedicatedServer))
			{
				
				// Request a frame to be rendered using this method as a callback
				const request_id = this.window_interface.requestAnimationFrame(() => this.gameLoop());
				
				// Make sure a single frame has been rendered before updating the game...
				if (!this.render_single_frame)
				{
					
					// This is workaround for initializing collision bounding boxes before handling *any* collision detection
					this.render_single_frame = true;
					
					
				} // Otherwise, if a single frame has already been rendered...
				else
				{
					
					// Update the game state
					if (!this.paused)
					{
						this.update();
					}
					
				}
				
				// If the game is not paused...
				if (!this.paused)
				{
					
					// Render a single frame
					this.renderer.render();
					
					
				} // Otherwise, if the game is paused...
				else
				{
					
					// Stop the game loop
					this.window_interface.cancelAnimationFrame(request_id);
					
				}
				
				
			} // Otherwise, if the game is a multiplayer dedicated server...
			else if (Multiplayer.enabled && Multiplayer.connection_type == Multiplayer.ConnectionTypes.DedicatedServer)
			{
				
				// Only update the game state...
				if (!this.paused)
				{
					this.update();
				}
				
				// Keep on truckin'
				setTimeout(() => Game.gameLoop, Math.max(1, (1000 / 60) - Date.now() - this.start_time));
				
			}
			
		}
		
		/**
		 * Updates the game state.
		 */
		static update()
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
					player.update();
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
			if (!Multiplayer.enabled)
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
			
			// De-initialize player's keyboard/mouse UI event handlers
			Game.ui.controls.deinitializeControls();
			
			// If the game is either singleplayer, or if it's multiplayer but *not* a dedicated server...
			if (!Multiplayer.enabled || (Multiplayer.enabled && Multiplayer.connection_type != Multiplayer.ConnectionTypes.DedicatedServer))
			{
				
				// Hide pause menu
				this.ui.menus.hidePauseMenu();
				
				// Show main menu
				this.ui.menus.showMainMenu();
				
			}
			
			// If game is multiplayer...
			if (Multiplayer.enabled)
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