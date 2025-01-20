/**
 * Initializes the Multiplayer Menu UI event handlers.
 */
export default function initializeMultiplayerMenuUIEventHandlers()
{
	
	//#region [Event Handlers]
		
		
		//#region [Multiplayer Menu]
			
			/**
			 * Host game button click event.
			 */
			$('#multiplayer-host-game').on('click', function()
			{
				
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
				
				// Do something.
				
			});
			
			/**
			 * Multiplayer host game menu back button click event.
			 */
			$('#multiplayer-host-game-back').on('click', function()
			{
				
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
				
				// Do something.
				
			});
			
			/**
			 * Multiplayer join game menu back button click event.
			 */
			$('#multiplayer-join-game').on('click', function()
			{
				
				// Do something.
				
			});
			
			/**
			 * Multiplayer join game menu back button click event.
			 */
			$('#multiplayer-join-game-back').on('click', function()
			{
				
				// Hide multiplayer join game menu UI
				$('#menu-multiplayer-join-game').fadeOut(256);
				
				// Show multiplayer menu UI
				$('#menu-multiplayer').delay(256).fadeIn(256);
				
			});
			
		//#endregion
		
		
	//#endregion
	
}