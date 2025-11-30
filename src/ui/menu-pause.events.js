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
				
				// Temporarily disable the Resume button (browsers seem to enforce a ~1s cooldown on pointer re-lock after unlock)
				$('#pause-menu-resume').prop('disabled', true);
				setTimeout(function() { $('#pause-menu-resume').prop('disabled', false); }, 1000);
				
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
				
				// Request pointer lock directly during the click event (apparently this is required by some browsers)
				Game.renderer.domElement.requestPointerLock();
				
				// Unpause the game
				Game.unpause();
				
			});
			
			/**
			 * Main Menu button click event.
			 */
			$('#pause-menu-quit').on('click', function()
			{
				
				// Show confirmation dialog...
				Game.ui.dialog.showDialog({
					message: 'Return to the main menu?',
					ok_button_text: 'Yes',
					ok_button_callback: function() {
						
						// Quit the game
						Game.quit();
						
					},
					show_cancel_button: true,
					cancel_button_text: 'No'
				});
				
			});
			
			/**
			 * Exit Game button click event.
			 */
			$('#pause-menu-exit').on('click', function()
			{
				
				// Show confirmation dialog...
				Game.ui.dialog.showDialog({
					message: 'Are you sure you want to exit the game?',
					ok_button_text: 'Yes',
					ok_button_callback: function() {
						
						// Exit the game
						Game.exit();
						
					},
					show_cancel_button: true,
					cancel_button_text: 'No'
				});
				
			});
			
		//#endregion
		
		
	//#endregion
	
}