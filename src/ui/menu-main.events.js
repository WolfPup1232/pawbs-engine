// Static Class Imports
import Game from '../classes/game.class.js';

/**
 * Initializes the Main Menu UI event handlers.
 */
export default function initializeMainMenuUIEventHandlers()
{
	
	/**
	 * Game menu UI functions.
	 */
	Game.ui.menus = { };
	
	
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
					$('#menu-main').delay(256).fadeIn(256);
					
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
				
				// Hide main menu
				Game.ui.menus.hideMainMenu();
				
				// Start singleplayer game
				Game.start();
				
			});
			
			/**
			 * Multiplayer button click event.
			 */
			$('#multiplayer-game').on('click', function()
			{
				
				// Hide main menu UI
				Game.ui.menus.hideMainMenu();
				
				// Show multiplayer menu UI
				Game.ui.menus.showMultiplayerMenu();
				
			});
			
			/**
			 * Options button click event.
			 */
			$('#options-menu').on('click', function()
			{
				
				// Hide main menu UI
				Game.ui.menus.hideMainMenu();
				
				// Show options menu UI
				Game.ui.menus.showOptionsMenu();
				
			});
			
			/**
			 * Exit button click event.
			 */
			$('#exit-game').on('click', function()
			{
				
				// Hide main menu
				Game.ui.menus.hideMainMenu();
				
				// Exit game
				Game.exit();
				
			});
			
		//#endregion
		
		
	//#endregion
	
}