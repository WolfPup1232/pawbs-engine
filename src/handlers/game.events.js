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
	 * Game menu UI functions.
	 */
	Game.ui.menus = { };
	
	/**
	 * Chat window UI functions.
	 */
	Game.ui.chat = { };
	
	
	//#region [Functions]
		
		
		//#region [Mouse/Keyboard Controls]
			
			/**
			 * Initializes the player's mouse/keyboard control event listeners.
			 */
			Game.ui.controls.initializeControls = function initializeControls()
			{
				
				// Mouse event listeners
				$(Game.dom_document).on('mousedown', (event) =>	Game.player.controls.onMouseDown(event));
				$(Game.dom_document).on('mouseup', (event) => Game.player.controls.onMouseUp(event));
				$(Game.dom_document).on('mousemove', (event) =>	Game.player.controls.onMouseMove(event));
				$(Game.dom_document).on('wheel', (event) => Game.player.controls.onMouseWheel(event));
				
				// Keyboard event listeners
				$(Game.dom_document).on('keydown', (event) => Game.player.controls.onKeyDown(event));
				$(Game.dom_document).on('keyup', (event) => Game.player.controls.onKeyUp(event));
				
				// Pointer lock controls event listeners
				$(Game.renderer.domElement).on('click', () => Game.player.controls.lockPointerLockControls());
				
				$('#editor').on('click', (event) => Game.ui.utilities.lockPointerOnWhitespaceClick(event, $('#editor'), ".editor-window"));
				$('#debug').on('click', (event) => Game.ui.utilities.lockPointerOnWhitespaceClick(event, $('#debug'), ".debug-window"));
				
				Game.player.controls.pointer_lock_controls.addEventListener('lock', (event) => Game.player.controls.onPointerLockControlsLock(event));
				Game.player.controls.pointer_lock_controls.addEventListener('unlock',(event) => Game.player.controls.onPointerLockControlsUnlock(event));
				
				// Transform controls event listeners
				Game.player.controls.transform_controls.addEventListener('draggingChanged', (event) => Game.player.controls.onTransformControlsDraggingChanged(event));
				Game.player.controls.transform_controls.addEventListener('objectChange', (event) => Game.player.controls.onTransformControlsObjectChanged(event));
				
			}
			
			/**
			 * De-initializes the player's mouse/keyboard control event listeners.
			 */
			Game.ui.controls.deinitializeControls = function deinitializeControls()
			{
				
				// Remove mouse event listeners
				$(Game.dom_document).off('mousedown');
				$(Game.dom_document).off('mouseup');
				$(Game.dom_document).off('mousemove');
				$(Game.dom_document).off('wheel');
				
				// Remove keyboard event listeners
				$(Game.dom_document).off('keydown');
				$(Game.dom_document).off('keyup');
				
				// Remove pointer lock controls event listeners
				$(Game.renderer.domElement).off('click');
				$('#editor').off('click');
				$('#debug').off('click');
				
				// Remove pointer lock controls event listeners
				Game.player.controls.pointer_lock_controls.removeEventListener('lock');
				Game.player.controls.pointer_lock_controls.removeEventListener('unlock');
				Game.player.controls.pointer_lock_controls.disconnect();
				
				// Remove transform controls event listeners
				Game.player.controls.transform_controls.removeEventListener('draggingChanged');
				Game.player.controls.transform_controls.removeEventListener('objectChange');
				
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
				
				// Get player by ID
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
				
				// Get message
				let message = data.message;
				
				// Initialize nameplate text
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
				
				// Reinitialize tooltips
				Game.ui.utilities.initializeTooltips();
				
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
				
				// If multiplayer is enabled...
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