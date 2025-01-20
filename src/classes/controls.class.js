// three.js Imports
import { PointerLockControls } from '../libraries/threejs/modules/PointerLockControls.js';
import { CustomTransformControls } from '../libraries/threejs/modules/CustomTransformControls.js';

// Static Class Imports
import Game from './game.class.js';
import Editor from './editor.class.js';

/**
 * A controls object which provides mouse/keyboard controls to a player.
 */
class Controls
{
	
	//#region [Class Declarations / Constructor]
		
		/**
		 * Initializes a new controls object to provide mouse/keyboard controls to a player.
		 */
		constructor()
		{
			
			// Class Declarations/Initialization
			
			// Flag indicating whether or not a control triggered a game pause event (canvas pointer unlock workaround)
			this.trigger_pause_game = true;
			
			
			// Player Mouse Controls
			
			// Initialize mouse controls
			this.mouse_left_down = false;
			this.mouse_right_down = false;
			this.mouse_dragging = false;
			
			// three.js pointer lock controls
			this.pointer_lock_controls = new PointerLockControls(Game.player.camera, Game.dom_document.body);
			this.mouse_locked = true;
			this.lockPointerLockControls();
			
			// three.js transform controls
			this.transform_controls = new CustomTransformControls(Game.player.camera, Game.renderer.domElement);
			this.transform_controls.setMode('translate');
			this.transform_controls.translationSnap = 0.1;
			this.transform_controls.scaleSnap = 0.25;
			this.transform_controls.rotationSnap = 0.5;
			Game.world.scene.add(this.transform_controls);
			
			
			// Player Keyboard Controls
			
			// Player movement (Default: W/S/A/D)
			this.player_moving_forward = false;
			this.player_moving_backward = false;
			this.player_moving_left = false;
			this.player_moving_right = false;
			
			// Player jumping (Default: Space)
			this.player_jumping = false;
			
			
			// Player Keyboard Modifier Keys
			
			// Left Shift modifier key
			this.modifier_shift_left_pressed = false;
			
			// Left Control modifier key
			this.modifier_control_left_pressed = false;
			
		}
		
	//#endregion
	
	
	//#region [Mouse Event Handlers]
		
		/**
		 * Mouse button click event.
		 *
		 * @param {Event} event The event object passed by the event handler.
		 */
		onMouseDown(event)
		{
			
			// Handle mouse button click event
			switch (event.button)
			{
				case 0:
					// Left-click
					
					// Left mouse button is down
					this.mouse_left_down = true;
					
					// Handle player left mouse down
					Game.player.handleLeftMouseDown(event);
					
					// Check if editor is enabled...
					if (Editor.enabled)
					{
						
						// Handle editor left mouse down
						Editor.handleLeftMouseDown(event);
						
					}
					
					break;
				case 2:
					// Right-click
					
					// Right mouse button is down
					this.mouse_right_down = true;
					
					// Handle player right mouse down
					Game.player.handleRightMouseDown(event);
					
					// Check if editor is enabled...
					if (Editor.enabled)
					{
						
						// Handle editor right mouse down
						Editor.handleRightMouseDown(event);
						
					}
					
					
					break;
			}
		}
		
		/**
		 * Mouse button release event.
		 *
		 * @param {Event} event The event object passed by the event handler.
		 */
		onMouseUp(event)
		{
			
			// Handle mouse button release event
			switch (event.button)
			{
				case 0:
					// Left-click
					
					// Left mouse button is no longer down
					this.mouse_left_down = false;
					
					// Handle player left mouse up
					Game.player.handleLeftMouseUp(event);
					
					// Check if editor is enabled...
					if (Editor.enabled)
					{
						
						// Handle editor left mouse up
						Editor.handleLeftMouseUp(event);
						
					}
					
					break;
				case 2:
					// Right-click
					
					// Right mouse button is no longer down
					this.mouse_right_down = false;
					
					// Handle player right mouse up
					Game.player.handleRightMouseUp(event);
					
					// Check if editor is enabled...
					if (Editor.enabled)
					{
						
						// Handle editor right mouse up
						Editor.handleRightMouseUp(event);
						
					}
					
					break;
			}
			
		}
		
		/**
		 * Mouse scroll wheel event.
		 *
		 * @param {Event} event The event object passed by the event handler.
		 */
		onMouseWheel(event)
		{
			
			// Check if chat window is focused...
			if (Game.ui.chat.isChatFocused())
			{
				
				// Attempt to scroll chat
				Game.ui.chat.scrollChat(event);
				
			}
			
		}
		
		
		//#region [Pointer Lock Controls Event Handlers]
			
			/**
			 * Locks the mouse pointer to the renderer.
			 */
			lockPointerLockControls()
			{
				
				// Mouse is now locked to the renderer
				this.mouse_locked = true;
				
				// Lock the pointer lock controls
				this.pointer_lock_controls.lock();
				
			}
			
			/**
			 * Unlocks the mouse pointer from the renderer.
			 */
			unlockPointerLockControls()
			{
				
				// Mouse is no longer locked to the renderer
				this.mouse_locked = false;
				
				// Disable pause game flag
				this.trigger_pause_game = false;
				
				// Unlock the pointer lock controls
				this.pointer_lock_controls.unlock();
				
			}
			
			/**
			 * PointerLockControls mouse lock event.
			 */
			onPointerLockControlsLock()
			{
				
				// Mouse is now locked to the renderer
				this.mouse_locked = true;
				
			}
			
			/**
			 * PointerLockControls mouse unlock event.
			 */
			onPointerLockControlsUnlock()
			{
				
				// Mouse is no longer locked to the renderer
				this.mouse_locked = false;
				
				// Check if pause game flag is enabled...
				if (this.trigger_pause_game)
				{
					
					// Pause game
					Game.pause();
					
					
				} // Otherwise, if pause game flag is disabled...
				else
				{
					
					// Enable pause game flag
					this.trigger_pause_game = true;
					
				}
				
			}
			
		//#endregion
		
		
		//#region [Pointer Lock Controls Event Handlers]
			
			/**
			 * CustomTransformControls mouse dragging changed event, used by three.js CustomTransformControls when the mouse is beginning or ending dragging the gizmo.
			 *
			 * @param {Event} event The event object passed by the event handler.
			 */
			onTransformControlsDraggingChanged(event)
			{
				
				// Determine whether or not the mouse is dragging the gizmo
				this.mouse_dragging = event.value;
				
				// If the mouse is starting to drag the gizmo...
				if (this.mouse_dragging)
				{
					
					// Check if editor is enabled...
					if (Editor.enabled)
					{
						
						// Update editor selected vertex initial positions
						Editor.updateSelectedVertexInitialPositions();
						
					}
					
				}
				
			}
			
			/**
			 * CustomTransformControls object changed event, used by three.js CustomTransformControls when the gizmo has modified the object its attached to.
			 *
			 * @param {Event} event The event object passed by the event handler.
			 */
			onTransformControlsObjectChanged(event)
			{
				
				// Check if editor is enabled...
				if (Editor.enabled)
				{
					
					// Updates editor selected vertex positions
					Editor.updateSelectedVertexPositions();
					
				}
				
			}
		
		//#endregion
		
		
	//#endregion
	
	
	//#region [Keyboard Event Handlers]
		
		/**
		 * Keyboard key press event.
		 *
		 * @param {Event} event The event object passed by the event handler.
		 */
		onKeyDown(event)
		{
			
			// Ignore key presses if a text box or text area is being edited
			if (Game.ui.utilities.isInputFocused())
			{
				return;
			}
			
			// Prevent Ctrl-key browser events when the mouse is locked...
			if (this.mouse_locked)
			{
				event.preventDefault();
			}
			
			// Handle key press event
			switch (event.code)
			{
				case 'KeyW':
					if (this.mouse_locked)
					{
						this.player_moving_forward = true;
					}
					break;
				case 'KeyA':
				if (this.mouse_locked)
					{
						this.player_moving_left = true;
					}
					break;
				case 'KeyS':
					if (this.mouse_locked)
					{
						this.player_moving_backward = true;
					}
					break;
				case 'KeyD':
					if (this.mouse_locked)
					{
						this.player_moving_right = true;
					}
					break;
				case 'Space':
					if (this.mouse_locked)
					{
						this.player_jumping = true;
					}
					break;
				case 'ShiftLeft':
					this.modifier_shift_left_pressed = true;
					break;
				case 'ControlLeft':
					this.modifier_control_left_pressed = true;
					break;
			}
			
		}
		
		/**
		 * Keyboard key release event.
		 *
		 * @param {Event} event The event object passed by the event handler.
		 */
		onKeyUp(event)
		{
			
			// Ignore key releases if a text box or text area is being edited
			if (Game.ui.utilities.isInputFocused())
			{
				return;
			}
			
			// Handle key release event
			switch (event.code)
			{
				case 'KeyW':
					this.player_moving_forward = false;
					break;
				case 'KeyA':
					this.player_moving_left = false;
					break;
				case 'KeyS':
					this.player_moving_backward = false;
					break;
				case 'KeyD':
					this.player_moving_right = false;
					break;
				case 'KeyE':
					if (this.modifier_shift_left_pressed)
					{
						// ShiftLeft + KeyE
						
						// Toggle editor on/off
						Editor.toggle();
					}
					else
					{
						// KeyE
						
						// Do nothing.
					}
					break;
				case 'KeyC':
					if (this.modifier_control_left_pressed)
					{
						// CtrlLeft + KeyC
						
						// Check if editor is enabled...
						if (Editor.enabled)
						{
							
							// Copy editor selected objects to clipboard
							Editor.copySelectedObjects()
							
						}
					}
					else
					{
						// KeyC
						
						// Do nothing.
					}
					break;
				case 'KeyX':
					if (this.modifier_control_left_pressed)
					{
						// CtrlLeft + KeyX
						
						// Check if editor is enabled...
						if (Editor.enabled)
						{
							
							// Cut editor selected objects to clipboard
							Editor.cutSelectedObjects()
							
						}
					}
					else
					{
						// KeyX
						
						// Do nothing.
					}
					break;
				case 'KeyV':
					if (this.modifier_control_left_pressed)
					{
						// CtrlLeft + KeyV
						
						// Check if editor is enabled...
						if (Editor.enabled)
						{
							
							// Paste editor clipboard objects
							Editor.pasteClipboardObjects()
							
						}
					}
					else
					{
						// KeyV
						
						// Do nothing.
					}
					break;
				case 'KeyZ':
					if (this.modifier_control_left_pressed)
					{
						// CtrlLeft + KeyZ
						
						// Check if editor is enabled...
						if (Editor.enabled)
						{
							
							// Toggle editor undo
							//Editor.undo();
							
						}
					}
					else
					{
						// KeyZ
						
						// Do nothing.
					}
					break;
				case 'Escape':
					// Escape
					
					// Check if game is paused...
					if (Game.paused)
					{
						
						// Unpause game
						Game.unpause();
						
					}
					break;
				case 'Enter':
					// Enter
					
					// Check if chat window is not yet focused...
					if (!Game.ui.chat.isChatFocused())
					{
						
						// Show chat window
						Game.ui.chat.showChat();
						
					}
					break;
				case 'Space':
					// Space
					
					// Player is no longer jumping
					this.player_jumping = false;
					break;
				case 'Tab':
					// Tab
					
					// Check if chat window is focused...
					if (Game.ui.chat.isChatFocused())
					{
						
						// Hide chat window
						Game.ui.chat.hideChat();
						
						
					} // Otherwise, if chat window is not focused...
					else
					{
						// Check if editor is enabled...
						if (Editor.enabled)
						{
							
							// Toggle noclip
							Game.player.noclip = !Game.player.noclip;
							Game.ui.editor.updateEditorMenu();
							
						}
					}
					break;
				case 'Delete':
					// Delete
					
					// Check if editor is enabled...
					if (Editor.enabled)
					{
						
						// Delete editor selected object
						Editor.deleteSelectedObjects();
						
						// Delete editor selected face
						Editor.deleteSelectedFaces();
						
					}
					break;
				case 'ShiftLeft':
					// Left Shift
					
					// Enable left shift modifier key
					this.modifier_shift_left_pressed = false;
					break;
				case 'ControlLeft':
					// Left Control
					
					// Enable left control modifier key
					this.modifier_control_left_pressed = false;
					break;
			}
			
		}
		
	//#endregion
	
}
export default Controls;