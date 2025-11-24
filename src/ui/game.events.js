// Static Class Imports
import Game from '../classes/game.class.js';
import Multiplayer from '../classes/multiplayer.class.js';

/**
 * Initializes the in-game UI functions and event handlers.
 */
export default function initializeGameUIEventHandlers()
{
	
	/**
	 * Game mouse/keyboard UI functions.
	 */
	Game.ui.controls = { };
	
	/**
	 * Player list window UI functions.
	 */
	Game.ui.player_list = { };
	
	/**
	 * Chat window UI functions.
	 */
	Game.ui.chat = { };
	
	
	//#region [Functions]
		
		
		//#region [Player List]
			
			/**
			 * The interval timer for updating player ping values in the player list.
			 */
			Game.ui.player_list.ping_update_interval = null;
			
			/**
			 * Returns boolean value indicating whether or not the player list is visible.
			 *
			 * @return {boolean} Boolean value indicating whether player list is visible.
			 */
			Game.ui.player_list.isPlayerListVisible = function isPlayerListVisible()
			{
				return ($('#player-list-container').is(':visible'));
			}
			
			/**
			 * Shows the player list window.
			 */
			Game.ui.player_list.showPlayerList = function showPlayerList()
			{
				
				// Show player list
				$('#player-list-container').fadeIn(256);
				
			}
			
			/**
			 * Hides the player list window.
			 */
			Game.ui.player_list.hidePlayerList = function hidePlayerList()
			{
				
				// Hide player list
				$('#player-list-container').fadeOut(256);
				
			}
			
			/**
			 * Refreshes the player list by rebuilding all rows from current player data.
			 */
			Game.ui.player_list.refresh = function refresh()
			{
				
				// Get player list table
				const table_body = $('#player-list-body');
				
				// Clear player list
				table_body.empty();
				
				// Initialize empty player list (local player + remote players)
				const all_players = [];
				
				// Add local player to player list first...
				if (Game.player)
				{
					all_players.push({
						player: Game.player,
						is_local: true
					});
				}
				
				// Add all remote players to player list...
				const player_ids = Object.keys(Game.players);
				for (let i = 0; i < player_ids.length; i++)
				{
					const player_id = player_ids[i];
					const player = Game.players[player_id];
					
					// Skip if this is the local player (they've already been added)...
					if (Game.player && player_id === Game.player.id)
					{
						continue;
					}
					
					all_players.push({
						player: player,
						is_local: false
					});
				}
				
				// Iterate through each player in the player list to build table rows...
				for (let i = 0; i < all_players.length; i++)
				{
					
					// Get current player's details
					const player_data = all_players[i];
					const player = player_data.player;
					const is_local = player_data.is_local;
					
					// Get current player's colour as hex string...
					let colour_hex = '#ffffff';
					if (player.colour)
					{
						if (typeof player.colour === 'string')
						{
							colour_hex = player.colour;
						}
						else if (player.colour.getHexString)
						{
							colour_hex = '#' + player.colour.getHexString();
						}
					}
					
					// Truncate current player's ID for display
					const truncated_id = player.id.substring(0, 8) + '...';
					
					// Get current player's ping display value...
					let ping_display = '—';
					if (is_local && Multiplayer.is_p2p_client)
					{
						ping_display = '—';
					}
					else if (Multiplayer.is_p2p_client && player.id == Multiplayer.p2p_host_id)
					{
						ping_display = Game.player.ping > 0 ? Game.player.ping + 'ms' : '—';
					}
					else
					{
						ping_display = player.ping > 0 ? player.ping + 'ms' : '—';
					}
					
					// Build current player's row HTML...
					const row_class = is_local ? 'player-list-local' : '';
					const row_html = `
						<tr class="${row_class}" data-player-id="${player.id}">
							<th scope="row">${i + 1}</th>
							<td>
								<span class="player-colour-indicator" style="background-color: ${colour_hex};"></span>
								${player.name}
							</td>
							<td>${truncated_id}</td>
							<td class="player-ping">${ping_display}</td>
						</tr>
					`;
					
					// Append current player's row to table body
					table_body.append(row_html);
					
				}
				
			}
			
			/**
			 * Refreshes only the ping values in the player list without rebuilding the entire table.
			 */
			Game.ui.player_list.updatePings = function updatePings()
			{
				
				// Get the current player's row from the player list
				const player_row = $(`#player-list-body tr[data-player-id="${Game.player.id}"]`);
				
				// Update player row...
				if (player_row.length)
				{
					
					// For P2P clients, don't show their own ping in their own row... (ping is shown under P2P host's row instead)
					if (Multiplayer.is_p2p_client)
					{
						player_row.find('.player-ping').text('—');
					}
					else
					{
						const ping_display = Game.player.ping > 0 ? Game.player.ping + 'ms' : '—';
						player_row.find('.player-ping').text(ping_display);
					}
					
				}
				
				// Update remote player pings...
				const player_ids = Object.keys(Game.players);
				for (let i = 0; i < player_ids.length; i++)
				{
					
					// Get remote player details
					const player_id = player_ids[i];
					const player = Game.players[player_id];
					
					// Get remote player row from the player list
					const row = $(`#player-list-body tr[data-player-id="${player_id}"]`);
					
					// Update remote player row...
					if (row.length)
					{
						
						// For P2P hosts, show the current user-controlled player's ping in the host's row instead...
						if (Multiplayer.is_p2p_client && player_id == Multiplayer.p2p_host_id)
						{
							const ping_display = Game.player.ping > 0 ? Game.player.ping + 'ms' : '—';
							row.find('.player-ping').text(ping_display);
						}
						else
						{
							const ping_display = player.ping > 0 ? player.ping + 'ms' : '—';
							row.find('.player-ping').text(ping_display);
						}
						
					}
					
				}
				
			}
			
			/**
			 * Starts the player list ping update timer.
			 */
			Game.ui.player_list.startPingTimer = function startPingTimer()
			{
				
				// Clear any existing interval timers...
				if (Game.ui.player_list.ping_update_interval)
				{
					clearInterval(Game.ui.player_list.ping_update_interval);
				}
				
				// Start new interval timer
				Game.ui.player_list.ping_update_interval = setInterval(() => { Game.ui.player_list.updatePings(); }, 2000);
				
			}
			
			/**
			 * Stops the player list ping update timer.
			 */
			Game.ui.player_list.stopPingTimer = function stopPingTimer()
			{
				
				// Clear any existing interval timers...
				if (Game.ui.player_list.ping_update_interval)
				{
					clearInterval(Game.ui.player_list.ping_update_interval);
					Game.ui.player_list.ping_update_interval = null;
				}
				
			}
			
			/**
			 * Sets the player list title to the specified text.
			 *
			 * @param {string} title The title text to display.
			 */
			Game.ui.player_list.setTitle = function setTitle(title)
			{
				
				// Set player list title text
				$('#player-list-title h5').text(title);
				
			}
			
		//#endregion
		
		
		//#region [Chat]
			
			/**
			 * Timer which hides the chat window after a certain period of time has elapsed.
			 */
			Game.ui.chat.chat_hide_timer = null;
			
			/**
			 * The amount of time which has elapsed since the chat window was last activated.
			 */
			Game.ui.chat.chat_hide_timer_elapsed = 0;
			
			/**
			 * Returns boolean value indicating whether or not chat window is visible.
			 *
			 * @return {array} Boolean value indicating whether chat window is visible.
			 */
			Game.ui.chat.isChatVisible = function isChatVisible()
			{
				return ($('#chat-container').is(':visible'));
			}
			
			/**
			 * Returns boolean value indicating whether or not chat window input is focused.
			 *
			 * @return {array} Boolean value indicating whether chat window input is focused.
			 */
			Game.ui.chat.isChatFocused = function isChatFocused()
			{
				return ($('#chat-message').is(':focus') || $('#chat-send').is(':focus'));
			}
			
			/**
			 * Shows the chat window.
			 */
			Game.ui.chat.showChat = function showChat()
			{
				
				// Show chat
				$('#chat-container').fadeIn(256);
				$('#chat-input').fadeIn(256);
				$('#chat-message').focus();
				
				// Attempt to stop chat hide timer
				Game.ui.chat.stopHideTimer();
				
			}
			
			/**
			 * Hides the chat window.
			 */
			Game.ui.chat.hideChat = function hideChat()
			{
				
				// Hide chat
				$('#chat-message').val("");
				$('#chat-message').blur();
				$('#chat-input').fadeOut(256);
				
				// Start chat hide timer
				Game.ui.chat.startHideTimer();
				
			}
			
			/**
			 * Starts the chat window hide timer.
			 */
			Game.ui.chat.startHideTimer = function startHideTimer()
			{
				
				// Clear previous chat hide timer
				if (Game.ui.chat.chat_hide_timer)
				{
					return;
				}
				
				// Initialize chat hide timer tick event
				const tick = () => {
					
					// Increment the amount of time which has elapsed since the chat window was last activated
					Game.ui.chat.chat_hide_timer_elapsed += 1000;
					
					// If the amount of time required hide the chat window has passed...
					if (Game.ui.chat.chat_hide_timer_elapsed >= Game.settings.multiplayer_chat_hide_duration)
					{
						
						// Clear the timer
						clearTimeout(Game.ui.chat.chat_hide_timer);
						
						// Reset the timer and time elapsed
						Game.ui.chat.chat_hide_timer = null;
						Game.ui.chat.chat_hide_timer_elapsed = 0;
						
						// Hide the chat window
						$('#chat-container').fadeOut(1000);
						
						return;
						
					} // Otherwise, if the required amount of time hasn't passed...
					else
					{
						
						// Chat hide timer is still running, call tick event again
						Game.ui.chat.chat_hide_timer = setTimeout(tick, 1000);
						
					}
					
				};
				
				// Start chat hide timer
				Game.ui.chat.chat_hide_timer = setTimeout(tick, 1000);
				
			}
			
			/**
			 * Stops the chat window hide timer.
			 */
			Game.ui.chat.stopHideTimer = function stopHideTimer()
			{
				
				// If the chat window hide timer is active...
				if (Game.ui.chat.chat_hide_timer)
				{
					
					// Clear the timer
					clearTimeout(Game.ui.chat.chat_hide_timer);
					
					// Reset the timer and time elapsed
					Game.ui.chat.chat_hide_timer = null;
					Game.ui.chat.chat_hide_timer_elapsed = 0;
					
				}
				
			}
			
			/**
			 * Scrolls the chat log based on the mouse wheel scroll event's scroll amount.
			 *
			 * @param {Event} event The event object passed by the event handler.
			 */
			Game.ui.chat.scrollChat = function scrollChat(event)
			{
				
				// Scroll the chat log vertically based on the mouse wheel scroll amount...
				if (Math.abs(event.originalEvent.deltaY) > 0)
				{
					$('#chat-log').scrollTop($('#chat-log').scrollTop() + event.originalEvent.deltaY);
				}
				
			}
			
			/**
			 * Adds the chat message specified in the data object to the chat log.
			 *
			 * @param {Object} data The chat message to be added to the chat log.
			 */
			Game.ui.chat.addChatMessage = function addChatMessage(data)
			{
				
				// Get message data
				const type = data.type;
				let message = data.message;
				
				// Get player by ID...
				let player = null;
				let player_id = null;
				if (data.player_id)
				{
					player_id = data.player_id;
				}
				else if (data.player)
				{
					player_id = data.player.id;
				}
				player = Game.players[player_id];
				
				// Initialize player's nameplate text...
				let nameplate = "";
				if (player)
				{
					nameplate = '[<span style="color:#' + player.colour.getHexString() + ';" data-bs-title="<span style=\'color:#' + player.colour.getHexString() + ';\'>' + player.name + '</span>" data-bs-toggle="tooltip" data-bs-placement="top">' + player.name + '</span>]';
				}
				
				// Initialize chat message HTML DOM element
				const message_element = document.createElement('div');
				
				// Attempt to stop the chat hide timer
				Game.ui.chat.stopHideTimer();
				
				// Handle chat message content by chat message type...
				switch (type)
				{
					// JOINED_GAME
					case Multiplayer.MessageTypes.JOINED_GAME:
						
						message = "joined the game.";
						
						break;
					// PLAYER_JOINED
					case Multiplayer.MessageTypes.PLAYER_JOINED:
						
						message = "joined the game.";
						
						break;
					// PLAYER_LEFT
					case Multiplayer.MessageTypes.PLAYER_LEFT:
						
						message = "left the game.";
						
						break;
					// CHAT
					case Multiplayer.MessageTypes.CHAT:
						
						nameplate = nameplate + ":";
						message = data.message;
						
						break;
				}
				
				// Assemble entire chat message content
				$(message_element).append('<p class="mb-0">' + nameplate + ' ' + message + '</p>');
				
				// Add chat message to chat log
				$('#chat-container').fadeIn(256);
				$('#chat-log').append(message_element);
				$('#chat-log').scrollTop($('#chat-log')[0].scrollHeight - $('#chat-log')[0].clientHeight);
				
				// Keep chat log messages within maximum message limit...
				if ($('#chat-log').children().length > Game.settings.multiplayer_chat_messages_max)
				{
					$('#chat-log').children().first().remove();
				}
				
				// Refresh all UI tooltips
				Game.ui.refreshTooltips();
				
				// Start chat hide timer
				Game.ui.chat.startHideTimer();
				
			}
			
			/**
			 * Sends the chat message.
			 */
			Game.ui.chat.sendChatMessage = function sendChatMessage()
			{
				
				// Get chat message
				let message = $('#chat-message').val();
				
				// If game is multiplayer...
				if (Multiplayer.enabled)
				{
					
					// Send chat message
					Multiplayer.sendChatMessage(message);
					
				}
				
				// Clear chat message
				$('#chat-message').val("");
				
			}
			
			/**
			 * Clears the chat message.
			 */
			Game.ui.chat.clearChatMessage = function clearChatMessage()
			{
				
				// Clear chat message
				$('#chat-message').val("");
				
			}
			
		//#endregion
		
		
	//#endregion
	
}