// Static Class Imports
import Game from '../classes/game.class.js';

/**
 * Initializes the Pause Menu UI event handlers.
 */
export default function initializePauseMenuUIEventHandlers()
{
	
	//#region [Functions]
		
		
		//#region [Pause Menu]
			
			/**
			 * Shows the pause menu UI.
			 */
			Game.ui.menus.showPauseMenu = function showPauseMenu()
			{
				
				// Check if chat is focused...
				if ($('#chat-message').is(':focus'))
				{
					
					// Hide chat
					$('#chat-message').blur();
					$('#chat-input').fadeOut(256);
					
				}
				
				// Show pause menu
				$('#menu-pause').fadeIn(256);
				
			}
			
			/**
			 * Hides the pause menu UI.
			 */
			Game.ui.menus.hidePauseMenu = function hidePauseMenu()
			{
				
				// Hide pause menu
				$('#menu-pause').fadeOut(256);
				
			}
			
		//#endregion
		
		
	//#endregion
	
	
	//#region [Event Handlers]
		
		
		//#region [Pause Menu]
			
			/**
			 * Resume button click event.
			 */
			$('#pause-menu-resume').on('click', function()
			{
				
				// Unpause the game
				Game.unpause();
				
			});
			
			/**
			 * Main Menu button click event.
			 */
			$('#pause-menu-quit').on('click', function()
			{
				
				// Quit the game
				Game.quit();
				
			});
			
			/**
			 * Exit Game button click event.
			 */
			$('#pause-menu-exit').on('click', function()
			{
				
				// Exit game
				Game.exit();
				
			});
			
		//#endregion
		
		
	//#endregion
	
}