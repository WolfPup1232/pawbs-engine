// Static Class Imports
import Game from '../classes/game.class.js';

/**
 * Initializes the Main Menu UI event handlers.
 */
export default function initializeMainMenuUIEventHandlers()
{
	
	//#region [Functions]
		
		
		//#region [Main Menu]
			
			/**
			 * Shows the main menu UI.
			 */
			Game.ui.menus.showMainMenu = function showMainMenu()
			{
				
				// If game is already paused, quit game instead...
				if (Game.paused)
				{
					
					// Clear chat log
					$('#chat-log').html("");
					
					// Show main menu UI
					$('#menu-main').delay(256).fadeIn(256);
					
					// Clear the game renderer
					$('#renderer').fadeOut(256, () => { $('#renderer').html('').show(); });
					
					
				} // Otherwise, if game has been unpaused...
				else
				{
					
					// Show main menu UI
					$('#menu-main').fadeIn(256);
					
				}
				
			}
			
			/**
			 * Hides the main menu UI.
			 */
			Game.ui.menus.hideMainMenu = function hideMainMenu()
			{
				
				// Hide main menu
				$('#menu-main').fadeOut(256);
				
			}
			
		//#endregion
		
		
	//#endregion
	
	
	//#region [Event Handlers]
		
		
		//#region [Main Menu]
			
			/**
			 * Singleplayer button click event.
			 */
			$('#singleplayer-game').on('click', function()
			{
				
				// Start singleplayer game
				Game.start();
				
			});
			
			/**
			 * Multiplayer button click event.
			 */
			$('#multiplayer-game').on('click', function()
			{
				
				// Hide main menu UI
				$('#menu-main').fadeOut(256);
				
				// Show multiplayer menu UI
				$('#menu-multiplayer').delay(256).fadeIn(256);
				
			});
			
			/**
			 * Options button click event.
			 */
			$('#options-menu').on('click', function()
			{
				
				// Hide main menu UI
				$('#menu-main').fadeOut(256);
				
				// Show options menu UI
				$('#menu-options').delay(256).fadeIn(256);
				
				// Update options menu
				Game.ui.menus.updateOptionsMenu();
				
			});
			
			/**
			 * Exit button click event.
			 */
			$('#exit-game').on('click', function()
			{
				
				// Exit game
				Game.exit();
				
			});
			
		//#endregion
		
		
	//#endregion
	
}