// Static Class Imports
import Game from '../classes/game.class.js';
import Multiplayer from '../classes/multiplayer.class.js';

/**
 * Initializes the Multiplayer Menu UI event handlers.
 */
export default function initializeMultiplayerMenuUIEventHandlers()
{
	
	//#region [Functions]
		
		/**
		 * Updates the list of available games to join.
		 *
		 * @param {Array} games Array of games available to join.
		 */
		Game.ui.menus.updateGamesList = function updateGamesList(games)
		{
			
			// Empty the list of available games to join
			$('#multiplayer-games-list').empty();
			
			// For each game in the provided array of games...
			games.forEach(game => {
				
				// Initialize game element
				const option = $('<option>', {
					value: game.game_id,
					text: "ID: " + game.game_id + " | Players: " + game.player_count,
				});
				
				// Add game element to list
				$('#multiplayer-games-list').append(option);
				
			});
			
		}
		
	//#endregion
	
	
	//#region [Event Handlers]
		
		
		//#region [Multiplayer Menu]
			
			/**
			 * Host game button click event.
			 */
			$('#multiplayer-host-game-menu').on('click', function()
			{
				
				// Host a P2P game by default
				Multiplayer.connect(Multiplayer.ConnectionTypes.P2PClient);
				
				// Hide multiplayer menu UI
				$('#menu-multiplayer').fadeOut(256);
				
				// Show multiplayer host game menu UI
				$('#menu-multiplayer-host-game').delay(256).fadeIn(256);
				
			});
			
			/**
			 * Join game button click event.
			 */
			$('#multiplayer-join-game-menu').on('click', function()
			{
				
				// Connect to a dedicated server by default
				Multiplayer.connect(Multiplayer.ConnectionTypes.DedicatedClient);
				
				// Hide multiplayer menu UI
				$('#menu-multiplayer').fadeOut(256);
				
				// Show multiplayer join game menu UI
				$('#menu-multiplayer-join-game').delay(256).fadeIn(256);
				
			});
			
			/**
			 * Multiplayer back button click event.
			 */
			$('#multiplayer-menu-back').on('click', function()
			{
				
				// Hide multiplayer menu UI
				$('#menu-multiplayer').fadeOut(256);
				
				// Show main menu UI
				$('#menu-main').delay(256).fadeIn(256);
				
			});
			
		//#endregion
		
		
		//#region [Host Game Menu]
			
			/**
			 * Multiplayer host game menu back button click event.
			 */
			$('#multiplayer-host-game').on('click', function()
			{
				
				// Host the multiplayer game
				Multiplayer.hostGame();
				
				// Hide multiplayer menu UI
				$('#menu-multiplayer-host-game').fadeOut(256);
				
			});
			
			/**
			 * Multiplayer host game menu back button click event.
			 */
			$('#multiplayer-host-game-back').on('click', function()
			{
				
				// Disconnect from current multiplayer server
				Multiplayer.disconnect();
				
				// Hide multiplayer host game menu UI
				$('#menu-multiplayer-host-game').fadeOut(256);
				
				// Show multiplayer menu UI
				$('#menu-multiplayer').delay(256).fadeIn(256);
				
			});
			
		//#endregion
		
		
		//#region [Join Game Menu]
			
			/**
			 * Refresh games button click event.
			 */
			$('#multiplayer-refresh-games').on('click', function()
			{
				
				// Update list of available games to join
				Multiplayer.updateGamesList();
				
			});
			
			/**
			 * Server type switch click event.
			 */
			$('#multiplayer-server-type').on('click', function(event)
			{
				
				// Empty the list of available games to join
				$('#multiplayer-games-list').empty();
				
				// Disconnect from current multiplayer server
				Multiplayer.disconnect();
				
				// If dedicated server is selected...
				if ($(this).is(':checked'))
				{
					
					// Connect to a dedicated server
					Multiplayer.connect(Multiplayer.ConnectionTypes.DedicatedClient);
					
					
				} // Otherwise, if P2P is selected...
				else
				{
					
					// Connect to a P2P server
					Multiplayer.connect(Multiplayer.ConnectionTypes.P2PClient);
					
				}
				
				// Prevent this event from triggering parent element click events
				event.stopPropagation();
				
			});
			
			/**
			 * Multiplayer join game menu back button click event.
			 */
			$('#multiplayer-join-game').on('click', function()
			{
				
				// Join the selected game
				Multiplayer.joinGame($('#multiplayer-games-list').val());
				
				// Hide multiplayer join game menu UI
				$('#menu-multiplayer-join-game').fadeOut(256);
				
			});
			
			/**
			 * Multiplayer join game menu back button click event.
			 */
			$('#multiplayer-join-game-back').on('click', function()
			{
				
				// Disconnect from current multiplayer server
				Multiplayer.disconnect();
				
				// Hide multiplayer join game menu UI
				$('#menu-multiplayer-join-game').fadeOut(256);
				
				// Show multiplayer menu UI
				$('#menu-multiplayer').delay(256).fadeIn(256);
				
			});
			
		//#endregion
		
		
	//#endregion
	
}