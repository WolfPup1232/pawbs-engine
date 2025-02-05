// Static Class Imports
import Game from '../classes/game.class.js';

/**
 * Initializes the Options Menu UI event handlers.
 */
export default function initializeOptionsMenuUIEventHandlers()
{
	
	//#region [Functions]
		
		
		//#region [Options Menu]
			
			/**
			 * Shows the options menu UI.
			 */
			Game.ui.menus.showOptionsMenu = function showOptionsMenu()
			{
				
				// Show options menu
				$('#menu-options').fadeIn(256);
				
			}
			
			/**
			 * Hides the options menu UI.
			 */
			Game.ui.menus.hideOptionsMenu = function hideOptionsMenu()
			{
				
				// Hide options menu
				$('#menu-options').fadeOut(256);
				
			}
			
			/**
			 * Updates the options menu UI.
			 */
			Game.ui.menus.updateOptionsMenu = function updateOptionsMenu()
			{
				
				// Update multiplayer options
				$('#options-player-name').val(Game.settings.multiplayer_nickname);
				
				// If the game is running in containerized mode...
				if (Game.settings.is_containerized)
				{
					
					// Show production mode settings
					('#options-signaling-server').val(Game.settings.multiplayer_production_signaling_server);
					
					
				} // Otherwise, if the game is not running in containerized mode...
				else
				{
					
					// Show development mode settings
					$('#options-signaling-server').val(Game.settings.multiplayer_development_signaling_server);
					
				}
				
			}
			
		//#endregion
		
		
	//#endregion
	
	
	//#region [Event Handlers]
		
		
		//#region [Options Menu]
			
			/**
			 * Back button click event.
			 */
			$('#options-menu-back').on('click', function()
			{
				
				// Hide options menu UI
				$('#menu-options').fadeOut(256);
				
				// Show main menu UI
				$('#menu-main').delay(256).fadeIn(256);
				
			});
			
		//#endregion
		
		
		//#region [Multiplayer Options]
			
			/**
			 * Options player name text change event.
			 */
			$('#options-player-name').on('change', function()
			{
				
				// Set player name
				Game.settings.multiplayer_nickname = $('#options-player-name').val();
				
			});
			
			/**
			 * Options signaling server address text change event.
			 */
			$('#options-signaling-server').on('change', function()
			{
				
				// If the game is running in containerized mode...
				if (Game.settings.is_containerized)
				{
					
					// Set production mode settings
					Game.settings.multiplayer_production_signaling_server = $('#options-signaling-server').val();
					
					
				} // Otherwise, if the game is not running in containerized mode...
				else
				{
					
					// Set development mode settings
					Game.settings.multiplayer_development_signaling_server = $('#options-signaling-server').val();
					
				}
				
			});
			
		//#endregion
		
		
	//#endregion
	
}