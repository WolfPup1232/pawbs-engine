// three.js Imports
import * as THREE from '../libraries/threejs/three.js';

// Static Class Imports
import Game from './game.class.js';
import Multiplayer from './multiplayer.class.js';

// UI Event Handler Imports
import initializeUtilityUIEventHandlers from '../ui/utility.events.js';

import initializeGameUIEventHandlers from '../ui/game.events.js';
import initializeEditorUIEventHandlers from '../ui/editor.events.js';
import initializeDebugUIEventHandlers from '../ui/debug.events.js';

import initializeMainMenuUIEventHandlers from '../ui/menu-main.events.js';
import initializeMultiplayerMenuUIEventHandlers from '../ui/menu-multiplayer.events.js';
import initializeOptionsMenuUIEventHandlers from '../ui/menu-options.events.js';
import initializePauseMenuUIEventHandlers from '../ui/menu-pause.events.js';

/**
 * A UI object containing all game UI functions.
 */
class UI
{
	
	//#region [Class Declarations / Constructor]
		
		/**
		 * Initializes a new UI object to provide access to all in-game UI functions.
		 */
		constructor()
		{
			
			// Class Declarations/Initialization
			
			/**
			 * A list of all tooltips initialized in the UI.
			 */
			this.tooltips = new Map();
			
		}
		
	//#endregion
	
	
	//#region [Methods]
		
		/**
		 * Initializes the menu UIs.
		 */
		initializeMainMenuUI()
		{
			
			// Initialize utility/helper UI event handlers
			initializeUtilityUIEventHandlers();
			
			// Initialize menu UI event handlers
			initializeMainMenuUIEventHandlers();
			initializeMultiplayerMenuUIEventHandlers();
			initializeOptionsMenuUIEventHandlers();
			initializePauseMenuUIEventHandlers();
			
			// Refresh all UI tooltips
			this.refreshTooltips();
			
		}
		
		/**
		 * Initializes the in-game UI.
		 */
		initializeGameUI()
		{
			
			// If the game is either singleplayer, or if it's multiplayer but *not* a dedicated server...
			if (this.is_singleplayer || !Multiplayer.is_dedicated_server)
			{
				
				// Initialize game renderer
				this.initializeGameRenderer()
				
				// Initialize game UI event handlers
				initializeGameUIEventHandlers();
				initializeEditorUIEventHandlers();
				initializeDebugUIEventHandlers();
				
				// Refresh all UI tooltips
				this.refreshTooltips();
				
			}
			
		}
		
		/**
		 * Initializes the renderer canvas.
		 */
		initializeGameRenderer()
		{
			
			// Initialize renderer
			Game.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
			Game.renderer.setSize(window.innerWidth, window.innerHeight);
			
			// Add the canvas to the renderer element
			$('#renderer').html(Game.renderer.domElement);
			
		}
		
		/**
		 * Re-initializes all UI bootstrap tooltips.
		 */
		refreshTooltips()
		{
			
			// Remove all tooltips...
			this.tooltips.forEach((tooltip, element) => {
				tooltip.dispose();
				this.tooltips.delete(element);
			});
			
			// Clear tooltips
			this.tooltips.clear();
			
			// Re-initialize tooltips...
			$('[data-bs-toggle="tooltip"]').each((index, element) =>
			{
				
				// Initialize new tooltip
				let tooltip = new bootstrap.Tooltip($(element), { html: true, sanitize: false });
				
				// Add tooltip to the Map, using the DOM element as the key
				this.tooltips.set(element, tooltip);
				
			});
			
		}
		
		/**
		 * Hides all tooltips.
		 */
		hideTooltips()
		{
			
			// Hide all tooltips
			this.tooltips.forEach((tooltip, element) => { tooltip.hide(); });
			
		}
		
	//#endregion
	
}
export default UI;