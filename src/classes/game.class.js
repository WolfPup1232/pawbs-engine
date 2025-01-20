// three.js Imports
import * as THREE from '../libraries/threejs/three.js';
import { CustomOutlineEffect } from '../libraries/threejs/modules/CustomOutlineEffect.js';

// Class Imports
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
import initializePauseMenuUIEventHandlers from '../handlers/menu-pause.events.js';

// Static Class Imports
import Assets from './assets.class.js';
import Editor from './editor.class.js';
import Debug from './debug.class.js';

/**
 * The game.
 */
class Game
{
	
	//#region [Class Declarations]
		
		
		//#region [Flags]
			
			/**
			 * Flag indicating whether or not the game is paused.
			 */
			static paused = false;
			
		//#endregion
		
		
		//#region [Game Modes]
			
			/**
			 * Gameplay modes.
			 */
			static GameModes = {
				None:			1,
				Singleplayer:	2,
				Multiplayer:	3,
			};
			
			/**
			 * The current game mode.
			 */
			static mode = this.GameModes.None;
			
		//#endregion
		
		
		//#region [Game Objects]
			
			/**
			 * The user-controlled player in the selected game world.
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
			
		//#endregion
		
		
		//#region [Renderer]
			
			/**
			 * The three.js WebGL renderer which renders the selected game world.
			 */
			static  renderer = null;
			
			/**
			 * Flag indicating whether or not a single frame has been rendered before updating the game state can begin.
			 */
			static single_frame = false;
			
		//#endregion
		
		
	//#endregion
	
	
	//#region [Constructor]
		
		/**
		 * Static class constructor.
		 */
		static { }
		
	//#endregion
	
	
	//#region [Methods]
		
		
		//#region [Game Methods]
			
			/**
			 * Initializes the game.
			 *
			 * @param {Window} window_interface A reference to the web browser window, which contains the DOM document.
			 * @param {Document} dom_document A reference to the DOM document within the web browser window.
			 */
			static initialize(window_interface, dom_document)
			{
				
				// Initialize web browser window and DOM document
				this.window_interface = window_interface;
				this.dom_document = dom_document;
				
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
				initializePauseMenuUIEventHandlers();
				
				// Show main menu
				this.ui.menus.showMainMenu()
				
			}
			
			/**
			 * Initializes and starts a new game according to the specified game mode.
			 *
			 * @param {Game.GameModes} game_mode The game mode to start playing.
			 */
			static start(game_mode)
			{
				
				// Start a new game according to selected game mode...
				if (game_mode == this.GameModes.Singleplayer)
				{
					
					// Start new singleplayer game
					this.startSingleplayerGame();
					
				}
				
			}
			
			/**
			 * Game Loop - Updates game processes that update every frame, then renders the frame.
			 */
			static gameLoop()
			{
				
				// Request a frame to be rendered using this method as a callback
				const request_id = this.window_interface.requestAnimationFrame(() => this.gameLoop());
				
				// Make sure a single frame has been rendered before updating the game...
				if (!this.single_frame)
				{
					
					// This is workaround for initializing collision bounding boxes before handling *any* collision detection
					this.single_frame = true;
					
					
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
					
					// Stop rendering
					this.window_interface.cancelAnimationFrame(request_id);
					
				}
				
			}
			
			/**
			 * Updates the game.
			 */
			static update()
			{
				
				// Update the player (movement, collision detection, etc)...
				if (this.player)
				{
					this.player.update();
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
				
				// Pause the game
				this.paused = true;
				
				// Show pause menu
				this.ui.menus.showPauseMenu();
				
			}
			
			/**
			 * Unpauses the game.
			 */
			static unpause()
			{
				
				// Unpause the game
				this.paused = false;
				
				// Lock pointer controls
				this.player.controls.lockPointerLockControls();
				
				// Restart the game loop
				this.gameLoop();
				
				// Hide pause menu
				this.ui.menus.hidePauseMenu();
				
			}
			
			/**
			 * Quits the game.
			 */
			static quit()
			{
				
				// Disable the editor
				if (Editor.enabled)
				{
					Editor.toggle();
				}
				
				// Quit the current game according to selected game mode...
				if (this.mode == this.GameModes.Singleplayer)
				{
					this.quitSingleplayerGame();
				}
				
				// Set game mode to none
				this.mode = this.GameModes.None;
				
				// Show main menu
				this.ui.menus.showMainMenu();
				
			}
			
			/**
			 * Exits the game.
			 */
			static exit()
			{
				
				// Close browser window
				this.window_interface.close();
				
			}
			
			/**
			 * Resizes the game.
			 */
			static resize()
			{
				
				// If player exists...
				if (this.player)
				{
					
					// Update game renderer
					this.renderer.setSize(window.innerWidth, window.innerHeight);
					
					// Update player camera...
					this.player.camera.aspect = window.innerWidth / window.innerHeight;
					this.player.camera.updateProjectionMatrix();
					
				}
				
				// Resize editor UI elements...
				if (Editor.enabled)
				{
					this.ui.editor.resize();
				}
				
			}
			
		//#endregion
		
		
		//#region [Game Modes]
			
			
			//#region [Singleplayer]
				
				/**
				 * Initializes and starts a new singleplayer game.
				 */
				static startSingleplayerGame()
				{
					
					// Set game mode
					this.mode = this.GameModes.Singleplayer;
					
					// Hide main menu
					this.ui.menus.hideMainMenu();
					
					// Initialize renderer
					this.renderer = new THREE.WebGLRenderer();
					this.renderer = new CustomOutlineEffect(this.renderer, { defaultThickness: 0.0032 });
					this.renderer.setSize(window.innerWidth, window.innerHeight);
					this.ui.utilities.initializeRenderer();
					
					// Load game assets, then initialize and start game...
					Assets.load(() => {
						
						// Initialize game flags
						this.paused = false;
						this.single_frame = false;
						
						// Initialize world
						this.world = new World();
						this.world.load(Assets.worlds.TestWorld);
						
						// Initialize player
						this.player = new Player();
						
						// Initialize player's keyboard/mouse controls
						this.player.controls = new Controls();
						this.ui.controls.initializeControls();
						
						// Start the game loop
						this.gameLoop();
						
					});
					
				}
				
				/**
				 * Quits the current singleplayer game.
				 */
				static quitSingleplayerGame()
				{
					
					// De-initialize player's keyboard/mouse controls
					Game.ui.controls.deinitializeControls();
					
					// Hide pause menu
					this.ui.menus.hidePauseMenu();
					
				}
				
			//#endregion
			
			
		//#endregion
		
		
	//#endregion
	
}
export default Game;