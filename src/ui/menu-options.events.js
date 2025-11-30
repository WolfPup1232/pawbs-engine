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
			 * Initializes and shows the options menu UI.
			 */
			Game.ui.menus.showOptionsMenu = function showOptionsMenu()
			{
				
				// Initialize asynchronously determined field values...
				const asyncInitialization = async function() {
					
					// If the game is running in a Tauri window...
					if (Game.tauri)
					{
						
						// Get Tauri window
						const current_window = Game.tauri.window.getCurrentWindow();
						
						// Show fullscreen settings
						const is_fullscreen = await current_window.isFullscreen();
						$('#options-video-fullscreen').text(is_fullscreen ? 'On' : 'Off');
						$('#options-video-fullscreen').toggleClass('active', is_fullscreen);
						
						
					} // Otherwise, if the game is not running in a Tauri window...
					else
					{
						
						// Disable fullscreen settings
						$('#options-video-fullscreen').prop('disabled', true);
						$('#options-video-fullscreen-group').attr("data-bs-title", "(Disabled)<br />Toggle fullscreen window.");
						
					}
					
				}
				asyncInitialization();
				
				// Initialize colour grid...
				Game.ui.utilities.initializeColourGrid("#options-player-colour-grid", "options-player-colour-cell", "#options-player-selected-colour", Game.ui.utilities.getMSPaintColours, function() {
					
					// Get background colour of selected colour cell
					const selected_colour = $(this).css('background-color');
					
					// Set player colour
					Game.settings.multiplayer_colour = selected_colour;
					
					// Set colour element's new colour
					$("#options-player-selected-colour").val('#' + selected_colour.match(/\d+/g).map(function(value) { return ('0' + parseInt(value).toString(16)).slice(-2); }).join(''));
					
				});
				
				// Get player settings
				$('#options-player-name').val(Game.settings.multiplayer_nickname);
				$("#options-player-selected-colour").val('#' + Game.settings.multiplayer_colour.match(/\d+/g).map(function(value) { return ('0' + parseInt(value).toString(16)).slice(-2); }).join(''));
				
				// Get server settings
				$('#options-custom-dedicated-server-list').val(Game.settings.path_remote_servers);
				$('#options-custom-dedicated-server-list').attr('placeholder', Game.settings.path_local_servers);
				
				// If the game is running remotely...
				if (Game.settings.is_remote)
				{
					
					// Show remote settings
					$('#options-signaling-server').val(Game.settings.multiplayer_remote_signaling_server);
					
					
				} // Otherwise, if the game is running locally...
				else
				{
					
					// Show local settings
					$('#options-signaling-server').val(Game.settings.multiplayer_local_signaling_server);
					
				}
				
				// Refresh all UI tooltips
				Game.ui.refreshTooltips();
				
				// Show options menu
				$('#menu-options').delay(256).fadeIn(256);
				
			}
			
			/**
			 * Hides the options menu UI.
			 */
			Game.ui.menus.hideOptionsMenu = function hideOptionsMenu()
			{
				
				// Hide options menu
				$('#menu-options').fadeOut(256);
				
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
		
		
		//#region [General Options]
			
			/**
			 * Fullscreen toggle button click event.
			 */
			$('#options-video-fullscreen').on('click', async function()
			{
				
				// Toggle Tauri window fullscreen on/off...
				if (Game.tauri)
				{
					const current_window = Game.tauri.window.getCurrentWindow();
					const is_fullscreen = await current_window.isFullscreen();
					
					await Game.tauri.window.getCurrentWindow().setFullscreen(!is_fullscreen);
					$('#options-video-fullscreen').text(is_fullscreen ? 'Off' : 'On');
					$('#options-video-fullscreen').toggleClass('active', !is_fullscreen);
				}
				
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
			 * Options player colour picker input event.
			 */
			$('#options-player-selected-colour').on('input', function()
			{
				
				// Set player colour
				Game.settings.multiplayer_colour = $('#options-player-selected-colour').val();
				
			});
			
			/**
			 * Options custom dedicated server list text change event.
			 */
			$('#options-custom-dedicated-server-list').on('change', function()
			{
				
				// Set custom dedicated server list
				Game.settings.path_remote_servers = $('#options-custom-dedicated-server-list').val();
				
			});
			
			/**
			 * Options signaling server address text change event.
			 */
			$('#options-signaling-server').on('change', function()
			{
				
				// If the game is running remotely...
				if (Game.settings.is_remote)
				{
					
					// Set remote settings
					Game.settings.multiplayer_remote_signaling_server = $('#options-signaling-server').val();
					
					
				} // Otherwise, if the game is running locally...
				else
				{
					
					// Set local settings
					Game.settings.multiplayer_local_signaling_server = $('#options-signaling-server').val();
					
				}
				
			});
			
		//#endregion
		
		
	//#endregion
	
}