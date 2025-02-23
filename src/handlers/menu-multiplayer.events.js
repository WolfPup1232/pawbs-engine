// Static Class Imports
import Game from '../classes/game.class.js';
import Multiplayer from '../classes/multiplayer.class.js';

/**
 * Initializes the Multiplayer Menu UI event handlers.
 */
export default function initializeMultiplayerMenuUIEventHandlers()
{
	
	//#region [Functions]
		
		
		//#region [Multiplayer Menu]
			
			/**
			 * Shows the multiplayer menu UI.
			 */
			Game.ui.menus.showMultiplayerMenu = function showMultiplayerMenu()
			{
				
				// Show multiplayer menu UI
				$('#menu-multiplayer').delay(256).fadeIn(256);
				
			}
			
			/**
			 * Hides the multiplayer menu UI.
			 */
			Game.ui.menus.hideMultiplayerMenu = function hideMultiplayerMenu()
			{
				
				// Hide multiplayer menu UI
				$('#menu-multiplayer').fadeOut(256);
				
			}
			
		//#endregion
		
		
		//#region [Host Game Menu]
			
			/**
			 * Shows the multiplayer menu host game UI.
			 */
			Game.ui.menus.showMultiplayerHostGameMenu = function showMultiplayerHostGameMenu()
			{
				
				// Get multiplayer game options
				$('#multiplayer-options-game-name').val(Game.settings.multiplayer_default_server_name);
				
				// Connect to P2P signaling server
				Multiplayer.connect(Game.settings.multiplayer_signaling_server, Multiplayer.ConnectionTypes.P2PClient);
				
				// Show multiplayer menu host game UI
				$('#menu-multiplayer-host-game').delay(256).fadeIn(256);
				
			}
			
			/**
			 * Hides the multiplayer menu host game UI.
			 */
			Game.ui.menus.hideMultiplayerHostGameMenu = function hideMultiplayerHostGameMenu()
			{
				
				// Hide multiplayer menu host game UI
				$('#menu-multiplayer-host-game').fadeOut(256);
				
			}
			
			/**
			 * Updates the signaling server connection status text.
			 *
			 * @param {string} text The signaling server's new connection status text.
			 */
			Game.ui.menus.updateHostGameServerStatus = function updateHostGameServerStatus(text)
			{
				
				// Update signaling server connection status text
				$('#multiplayer-signaling-server-status').text(text);
				
			}
			
			/**
			 * Updates the host game button.
			 *
			 * @param {boolean} disabled Flag indicating whether or not to disable the button.
			 */
			Game.ui.menus.updateHostGameButton = function updateHostGameButton(disabled)
			{
				
				// Update host game button
				$('#multiplayer-host-game').prop('disabled', disabled);
				
			}
			
		//#endregion
		
		
		//#region [Join Game Menu]
		
			/**
			 * Initializes and shows the multiplayer menu join game UI.
			 */
			Game.ui.menus.showMultiplayerJoinGameMenu = function showMultiplayerJoinGameMenu()
			{
				
				// Initialize colour grid...
				Game.ui.utilities.initializeColourGrid("#multiplayer-options-player-colour-grid", "multiplayer-options-player-colour-cell", "#multiplayer-options-player-selected-colour", Game.ui.utilities.getMSPaintColours, function() {
					
					// Get background colour of selected colour cell
					const selected_colour = $(this).css('background-color');
					
					// Set player colour
					Game.settings.multiplayer_colour = selected_colour;
					
					// Set colour element's new colour
					$('#multiplayer-options-player-selected-colour').val('#' + selected_colour.match(/\d+/g).map(function(value) { return ('0' + parseInt(value).toString(16)).slice(-2); }).join(''));
					
				});
				
				// Get player settings
				$('#multiplayer-options-player-name').val(Game.settings.multiplayer_nickname);
				$('#multiplayer-options-player-selected-colour').val('#' + Game.settings.multiplayer_colour.match(/\d+/g).map(function(value) { return ('0' + parseInt(value).toString(16)).slice(-2); }).join(''));
				
				// If the multiplayer connection type is either a dedicated server client, *or* it's neither a dedicated client nor a P2P client...
				if (Game.settings.multiplayer_default_connection_type == Multiplayer.ConnectionTypes.DedicatedClient || (Game.settings.multiplayer_default_connection_type != Multiplayer.ConnectionTypes.DedicatedClient && Game.settings.multiplayer_default_connection_type != Multiplayer.ConnectionTypes.P2PClient))
				{
					
					// Set multiplayer connection type to dedicated server client by default
					Game.settings.multiplayer_default_connection_type = Multiplayer.ConnectionTypes.DedicatedClient;
					$('#multiplayer-server-type').prop("checked", true);
					$('#menu-multiplayer-join-game-subtitle').text("Dedicated Server");
					
					
				} // Otherwise, the multiplayer connection type is P2P client...
				else
				{
					
					// Set multiplayer connection type to P2P client
					Game.settings.multiplayer_default_connection_type = Multiplayer.ConnectionTypes.P2PClient;
					$('#multiplayer-server-type').prop("checked", false);
					$('#menu-multiplayer-join-game-subtitle').text("Peer-to-Peer");
					
				}
				
				// Show multiplayer menu join game UI
				$('#menu-multiplayer-join-game').delay(256).fadeIn(256);
				
				// Update servers list
				Game.ui.menus.updateGamesList();
				
			}
			
			/**
			 * Hides the multiplayer menu join game UI.
			 */
			Game.ui.menus.hideMultiplayerJoinGameMenu = function hideMultiplayerJoinGameMenu()
			{
				
				// Hide multiplayer menu join game UI
				$('#menu-multiplayer-join-game').fadeOut(256);
				
			}
			
			/**
			 * Updates the list of available games to join.
			 */
			Game.ui.menus.updateGamesList = function updateGamesList()
			{
				
				// Empty the list of available games to join
				$('#multiplayer-games-list').empty();
				$('#multiplayer-server-status').html("");
				
				// If the dedicated server list is being updated...
				if (Game.settings.multiplayer_default_connection_type == Multiplayer.ConnectionTypes.DedicatedClient)
				{
					
					// Attempt to load remote servers list...
					fetch(Game.settings.path_servers).then((response) => response.json()).then((servers) => Game.ui.menus.updateGamesListCallback(servers)).catch(error => {
						
						// Error loading servers
						console.error("Error loading '" + Game.settings.path_servers + "': ", error);
						
						// Attempt to load local servers list...
						fetch(Game.settings.path_servers_local).then((response) => response.json()).then((servers) => Game.ui.menus.updateGamesListCallback(servers)).catch(error => {
							
							// Error loading servers
							console.error("Error loading '" + Game.settings.path_servers_local + "': ", error);
							
							// Update dedicated server status text
							$('#multiplayer-server-status').html("Could not fetch server list from '" + Game.settings.path_servers + ".<br />or local copy from '" + Game.settings.path_servers_local + "'.");
							
						});
						
					});
					
					
				} // Otherwise, if the P2P server list is being updated...
				else if (Game.settings.multiplayer_default_connection_type == Multiplayer.ConnectionTypes.P2PClient)
				{
					
					// Ping P2P signaling server
					Multiplayer.ping(Game.settings.multiplayer_signaling_server, null, true);
					
				}
				
			}
			
			/**
			 * Finishes updating the list of available games to join.
			 *
			 * @param {Object} servers A list of all dedicated servers or P2P games available to join.
			 * @param {number} latency Optional latency value for the P2P signaling server.
			 */
			Game.ui.menus.updateGamesListCallback = function updateGamesListCallback(servers, latency = null)
			{
				
				// If the dedicated server list is being updated...
				if (Game.settings.multiplayer_default_connection_type == Multiplayer.ConnectionTypes.DedicatedClient)
				{
					
					// Initialize current server index in list
					let server_index = 0;
					
					// List each server...
					Object.keys(servers).forEach(server => {
						
						// Get server name and address
						const server_name = server;
						const server_address = servers[server];
						
						// Initialize a single server listing element
						let server_element = `
						<div class="d-flex align-items-center border rounded hover-light-gradient text-center fw-bold p-2 mb-2 shadow">
							<div id="multiplayer-server-name-${server_index}-container" class="col-7 border-end"
							data-bs-title="Pinging server..." data-bs-toggle="tooltip" data-bs-placement="bottom">
								<span id="multiplayer-server-name-${server_index}" class="tiny">${server_name}</span>
							</div>
							<div id="multiplayer-server-player-count-${server_index}-container" class="col-1 col-xl-2 border-end"
							data-bs-title="Pinging server..." data-bs-toggle="tooltip" data-bs-placement="bottom">
								<span id="multiplayer-server-player-count-${server_index}" class="tiny badge bg-white-75">0</span>
							</div>
							<div id="multiplayer-server-ping-${server_index}-container" class="col-2 col-xl-1 border-end"
							data-bs-title="Pinging server..." data-bs-toggle="tooltip" data-bs-placement="bottom">
								<span id="multiplayer-server-ping-${server_index}" class="tiny badge bg-white-75 px-1"><i class="bi bi-wifi"></i> 0</span>
							</div>
							<div id="multiplayer-server-join-${server_index}-container" class="w-100 my-0 ms-2 me-0"
							data-bs-title="Pinging server..." data-bs-toggle="tooltip" data-bs-placement="bottom">
								<button id="multiplayer-server-join-${server_index}" server_index="${server_index}" type="button" class="btn btn-sm btn-secondary tiny text-nowrap m-0 w-100" disabled><span class="d-block d-xl-none">Join</span><span class="d-none d-xl-block">Join Game</span></button>
							</div>
						</div>`;
						
						// Add server element to list element
						$('#multiplayer-games-list').append(server_element);
						
						// Initialize server join button click event...
						$('#multiplayer-server-join-' + server_index).off();
						$('#multiplayer-server-join-' + server_index).on('click', function()
						{
							
							// Hide multiplayer join game menu UI
							Game.ui.menus.hideMultiplayerJoinGameMenu();
							
							// Get the game ID
							const game_id = $(this).attr("game_id");
							
							// Join the selected game
							Multiplayer.connect(server_address, Multiplayer.ConnectionTypes.DedicatedClient, function() { Multiplayer.joinGame(game_id); });
							
						});
						
						// Ping server to update its listing details
						Multiplayer.ping(server_address, server_index);
						
						// Continue to the next server in the list...
						server_index++;
						
					});
					
					// Reset dedicated server status text
					$('#multiplayer-server-status').html("");
					
					
				} // Otherwise, if the P2P server list is being updated...
				else if (Game.settings.multiplayer_default_connection_type == Multiplayer.ConnectionTypes.P2PClient)
				{
					
					// Initialize current game index in list
					let game_index = 0;
					
					// List each P2P game...
					Object.keys(servers).forEach(game_id => {
						
						// Get game
						const game = servers[game_id];
						const game_name = game.name;
						
						// Initialize a single game listing element
						let game_element = `
						<div class="d-flex align-items-center border rounded hover-light-gradient text-center p-2 mb-2">
							<div id="multiplayer-server-name-${game_index}-container" class="col-7 border-end"
							data-bs-title="Pinging server..." data-bs-toggle="tooltip" data-bs-placement="bottom">
								<span id="multiplayer-server-name-${game_index}" class="tiny">${game_name}</span>
							</div>
							<div id="multiplayer-server-player-count-${game_index}-container" class="col-1 col-xl-2 border-end"
							data-bs-title="Pinging server..." data-bs-toggle="tooltip" data-bs-placement="bottom">
								<span id="multiplayer-server-player-count-${game_index}" class="tiny">0</span>
							</div>
							<div id="multiplayer-server-ping-${game_index}-container" class="col-2 col-xl-1 border-end"
							data-bs-title="Pinging server..." data-bs-toggle="tooltip" data-bs-placement="bottom">
								<span id="multiplayer-server-ping-${game_index}" class="tiny"><i class="bi bi-wifi"></i> 0</span>
							</div>
							<div id="multiplayer-server-join-${game_index}-container" class="w-100 my-0 ms-2 me-0"
							data-bs-title="Pinging server..." data-bs-toggle="tooltip" data-bs-placement="bottom">
								<button id="multiplayer-server-join-${game_index}" type="button" class="btn btn-sm btn-light border-secondary-subtle tiny text-nowrap m-0 w-100" disabled><span class="d-block d-xl-none">Join</span><span class="d-none d-xl-block">Join Game</span></button>
							</div>
						</div>`;
						
						// Add game element to list element
						$('#multiplayer-games-list').append(game_element);
						
						// Update game listing details
						Game.ui.menus.updateGamesListServerPlayerCount(game_index, game.player_count)
						Game.ui.menus.updateGamesListServerPing(game_index, latency);
						Game.ui.menus.updateGamesListServerGameID(game_index, game_id);
						
						// Initialize server join button click event...
						$('#multiplayer-server-join-' + game_index).off();
						$('#multiplayer-server-join-' + game_index).on('click', function()
						{
							
							// Hide multiplayer join game menu UI
							Game.ui.menus.hideMultiplayerJoinGameMenu();
							
							// Get the game ID
							const game_id = $(this).attr("game_id");
							
							// Join the selected game
							Multiplayer.connect(Game.settings.multiplayer_signaling_server, Multiplayer.ConnectionTypes.P2PClient, function() { Multiplayer.joinGame(game_id); });
							
						});
						
						// Continue to the next game in the list...
						game_index++;
						
					});
					
					// Reset signaling server status text
					$('#multiplayer-server-status').html("");
					
				}
				
			}
			
			/**
			 * Updates the name of the specified server in the games list.
			 *
			 * @param {number} server_index The index of the server in the list.
			 * @param {string} name The server's new name.
			 */
			Game.ui.menus.updateGamesListServerName = function updateGamesListServerName(server_index, name)
			{
				
				// Set specified server name
				$('#multiplayer-server-name-' + server_index).text(name);
				
			}
			
			/**
			 * Updates the player count of the specified server in the games list.
			 *
			 * @param {number} server_index The index of the server in the list.
			 * @param {number} count The server's player count.
			 */
			Game.ui.menus.updateGamesListServerPlayerCount = function updateGamesListServerPlayerCount(server_index, count)
			{
				
				// Set specified player count
				$('#multiplayer-server-player-count-' + server_index).text(count);
				
			}
			
			/**
			 * Updates the ping of the specified server in the games list.
			 *
			 * @param {number} server_index The index of the server in the list.
			 * @param {number} latency The server's latency.
			 */
			Game.ui.menus.updateGamesListServerPing = function updateGamesListServerPing(server_index, latency)
			{
				
				// Update latency label
				$('#multiplayer-server-ping-' + server_index).html('<i class="bi bi-wifi"></i> ' + latency);
				
				// Remove all text colour formatting
				$('#multiplayer-server-ping-' + server_index).removeClass("text-success");
				$('#multiplayer-server-ping-' + server_index).removeClass("text-warning");
				$('#multiplayer-server-ping-' + server_index).removeClass("text-danger");
				$('#multiplayer-server-name-' + server_index).removeClass("text-danger");
				$('#multiplayer-server-player-count-' + server_index).removeClass("text-danger");
				
				// Hide and disable join button until game is determined to be joinable
				$('#multiplayer-server-join-' + server_index).hide();
				$('#multiplayer-server-join-' + server_index).prop("disabled", true);
				
				// Update label tooltips
				$('#multiplayer-server-name-' + server_index + '-container').attr("data-bs-title", $('#multiplayer-server-name-' + server_index).text());
				$('#multiplayer-server-ping-' + server_index + '-container').attr("data-bs-title", "Latency " + latency + "ms.");
				$('#multiplayer-server-player-count-' + server_index + '-container').attr("data-bs-title", $('#multiplayer-server-player-count-' + server_index).text() + " " + (parseInt($('#multiplayer-server-player-count-' + server_index).text()) == 1 ? "player" : "players") + " in-game.");
				$('#multiplayer-server-join-' + server_index + '-container').attr("data-bs-title", "Join this game.");
				
				// If latency is 0, server is offline...
				if (latency == 0 && !$('#multiplayer-server-ping-' + server_index).hasClass("text-danger"))
				{
					
					// Format label text
					$('#multiplayer-server-ping-' + server_index).addClass("text-danger");
					$('#multiplayer-server-name-' + server_index).addClass("text-danger");
					$('#multiplayer-server-player-count-' + server_index).addClass("text-danger");
					
					// Update label tooltips
					$('#multiplayer-server-name-' + server_index + '-container').attr("data-bs-title", "Server is offline.");
					$('#multiplayer-server-ping-' + server_index + '-container').attr("data-bs-title", "Server is offline.");
					$('#multiplayer-server-player-count-' + server_index + '-container').attr("data-bs-title", "Server is offline.");
					$('#multiplayer-server-join-' + server_index + '-container').attr("data-bs-title", "Server is offline.");
					
					
				} // Otherwise, if latency is less than 100, the connection is good...
				else if (latency <= 100 && !$('#multiplayer-server-ping-' + server_index).hasClass("text-success"))
				{
					
					// Format label text
					$('#multiplayer-server-ping-' + server_index).addClass("text-success");
					
					// Player can now join game
					$('#multiplayer-server-join-' + server_index).show();
					$('#multiplayer-server-join-' + server_index).prop("disabled", false);
					
					
				} // Otherwise, if latency is between 100 and 150, the connection isn't great...
				else if (latency <= 150 && !$('#multiplayer-server-ping-' + server_index).hasClass("text-warning"))
				{
					
					// Format label text
					$('#multiplayer-server-ping-' + server_index).addClass("text-warning");
					
					// Player can now join game
					$('#multiplayer-server-join-' + server_index).show();
					$('#multiplayer-server-join-' + server_index).prop("disabled", false);
					
					
				} // Otherwise, if latency is more than 150, the connection is bad...
				else if (latency > 150 && !$('#multiplayer-server-ping-' + server_index).hasClass("text-danger"))
				{
					
					// Format label text
					$('#multiplayer-server-ping-' + server_index).addClass("text-danger");
					
					// Player can now join game
					$('#multiplayer-server-join-' + server_index).show();
					$('#multiplayer-server-join-' + server_index).prop("disabled", false);
					
				}
				
				// Re-initialize tooltips
				Game.ui.utilities.initializeTooltips();
			}
			
			/**
			 * Updates the game ID of the specified server in the games list.
			 *
			 * @param {number} server_index The index of the server in the list.
			 * @param {string} game_id The server's game ID.
			 */
			Game.ui.menus.updateGamesListServerGameID = function updateGamesListServerGameID(server_index, game_id)
			{
				
				// Set specified game ID
				$('#multiplayer-server-join-' + server_index).attr("game_id", game_id);
				
			}
			
		//#endregion
		
		
	//#endregion
	
	
	//#region [Event Handlers]
		
		
		//#region [Multiplayer Menu]
			
			/**
			 * Host game button click event.
			 */
			$('#multiplayer-host-game-menu').on('click', function()
			{
				
				// Hide multiplayer menu UI
				Game.ui.menus.hideMultiplayerMenu();
				
				// Show multiplayer host game menu UI
				Game.ui.menus.showMultiplayerHostGameMenu();
				
			});
			
			/**
			 * Join game button click event.
			 */
			$('#multiplayer-join-game-menu').on('click', function()
			{
				
				// Hide multiplayer menu UI
				Game.ui.menus.hideMultiplayerMenu();
				
				// Show multiplayer join game menu UI
				Game.ui.menus.showMultiplayerJoinGameMenu();
				
			});
			
			/**
			 * Multiplayer back button click event.
			 */
			$('#multiplayer-menu-back').on('click', function()
			{
				
				// Hide multiplayer menu UI
				Game.ui.menus.hideMultiplayerMenu();
				
				// Show main menu UI
				Game.ui.menus.showMainMenu();
				
			});
			
		//#endregion
		
		
		//#region [Host Game Menu]
			
			/**
			 * Multiplayer host game menu back button click event.
			 */
			$('#multiplayer-host-game').on('click', function()
			{
				
				// Hide multiplayer host game menu UI
				Game.ui.menus.hideMultiplayerHostGameMenu();
				
				// Host the multiplayer game
				Multiplayer.hostGame();
				
			});
			
			/**
			 * Multiplayer host game menu back button click event.
			 */
			$('#multiplayer-host-game-back').on('click', function()
			{
				
				// Disconnect from P2P signaling server
				Multiplayer.disconnect();
				
				// Hide multiplayer host game menu UI
				Game.ui.menus.hideMultiplayerHostGameMenu();
				
				// Show multiplayer menu UI
				Game.ui.menus.showMultiplayerMenu();
				
			});
			
			/**
			 * Game name text change event.
			 */
			$('#multiplayer-options-game-name').on('change', function()
			{
				
				// Set game name
				Game.settings.multiplayer_default_server_name = $('#multiplayer-options-game-name').val();
				
			});
			
		//#endregion
		
		
		//#region [Join Game Menu]
			
			/**
			 * Refresh games button click event.
			 */
			$('#multiplayer-refresh-games').on('click', function()
			{
				
				// Update list of available games to join
				Game.ui.menus.updateGamesList();
				
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
					
					// Set connection type to dedicated server
					Game.settings.multiplayer_default_connection_type = Multiplayer.ConnectionTypes.DedicatedClient;
					
					// Update menu subtitle
					$('#menu-multiplayer-join-game-subtitle').text("Dedicated Server");
					
					
				} // Otherwise, if P2P is selected...
				else
				{
					
					// Set connection type to P2P
					Game.settings.multiplayer_default_connection_type = Multiplayer.ConnectionTypes.P2PClient;
					
					// Update menu subtitle
					$('#menu-multiplayer-join-game-subtitle').text("Peer-to-Peer");
					
				}
				
				// Update list of available games to join
				Game.ui.menus.updateGamesList();
				
				// Prevent this event from triggering parent element click events
				event.stopPropagation();
				
			});
			
			/**
			 * Player name text change event.
			 */
			$('#multiplayer-options-player-name').on('change', function()
			{
				
				// Set player name
				Game.settings.multiplayer_nickname = $('#multiplayer-options-player-name').val();
				
			});
			
			/**
			 * Player colour picker input event.
			 */
			$('#multiplayer-options-player-selected-colour').on('input', function()
			{
				
				// Set player colour
				Game.settings.multiplayer_colour = $('#multiplayer-options-player-selected-colour').val();
				
			});
			
			/**
			 * Multiplayer join game menu back button click event.
			 */
			$('#multiplayer-join-game-back').on('click', function()
			{
				
				// Hide multiplayer join game menu UI
				Game.ui.menus.hideMultiplayerJoinGameMenu();
				
				// Show multiplayer menu UI
				Game.ui.menus.showMultiplayerMenu();
				
			});
			
		//#endregion
		
		
	//#endregion
	
}