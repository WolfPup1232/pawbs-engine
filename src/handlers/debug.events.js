// Static Class Imports
import Game from '../classes/game.class.js';

/**
 * Initializes the in-game debugger UI event handlers.
 */
export default function initializeDebugUIEventHandlers()
{
	
	/**
	 * Debugger UI functions.
	 */
	Game.ui.debugger = { };
	
	
	//#region [Functions]
		
		
		//#region [Debug UI]
			
			/**
			 * Shows the debugger UI.
			 */
			Game.ui.debugger.show = function show()
			{
				
				// Show debugger
				$("#debug").fadeIn(256);
				
			}
			
			/**
			 * Hides the debugger UI.
			 */
			Game.ui.debugger.hide = function hide()
			{
				
				// Hide debugger
				$("#debug").fadeOut(256);
				
			}
			
			/**
			 * Outputs text to the debugger UI.
			 */
			Game.ui.debugger.output = function output(text)
			{
				
				// Output debug text
				$("#debug-text").html(text);
				
			}
			
		//#endregion
		
		
	//#endregion
	
}