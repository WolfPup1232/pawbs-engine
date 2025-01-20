// Static Class Imports
import Game from '../classes/game.class.js';

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
			 * Returns boolean value indicatiing whether or not chat window input is focused.
			 *
			 * @return {array} Boolean value indicatiing whether chat window input is focused.
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
				$('#chat-input').fadeIn(256);
				$('#chat-message').focus();
				
			}
			
			/**
			 * Hides the chat window.
			 */
			Game.ui.chat.hideChat = function hideChat()
			{
				
				// Hide chat
				$('#chat-message').blur();
				$('#chat-input').fadeOut(256);
				
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
			
		//#endregion
		
		
	//#endregion
	
	
	//#region [Event Handlers]
		
		
		//#region [Chat]
			
			/**
			 * Something.
			 */
			
		//#endregion
		
		
	//#endregion
	
}