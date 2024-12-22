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
	
	/**
	 * Initializes a new controls object to provide mouse/keyboard controls to a player.
	 */
	constructor()
	{
		
		// Class Declarations/Initialization
		
		
		// Player Mouse Controls
		
		// Initialize mouse controls
		this.is_mouse_left_down = false;
		this.is_mouse_right_down = false;
		
		this.is_mouse_dragging = false;
		
		// three.js pointer lock controls
		this.pointer_lock_controls = new PointerLockControls(Game.player.camera, Game.dom_document.body);
		
		this.is_mouse_locked = false;
		
		// three.js transform controls
		this.transform_controls = new CustomTransformControls(Game.player.camera, Game.renderer.domElement);
		this.transform_controls.setMode('translate');
		this.transform_controls.translationSnap = 0.1;
		this.transform_controls.scaleSnap = 0.25;
		this.transform_controls.rotationSnap = 0.5;
		Game.world.scene.add(this.transform_controls);
		
		
		// Player Keyboard Controls
		
		// Player movement (W/S/A/D)
		this.is_player_moving_forward = false;
		this.is_player_moving_backward = false;
		this.is_player_moving_left = false;
		this.is_player_moving_right = false;
		
		// Player jumping (Space)
		this.is_player_jumping = false;
		
		
		// Player Keyboard Modifier Keys
		
		// Left Shift modifier key
		this.modifier_shift_left_pressed = false;
		
		// Left Control modifier key
		this.modifier_control_left_pressed = false;
		
	}
	
	
	// Methods
	
	/**
	 * Initializes the player's mouse/keyboard control event listeners.
	 */
	initializeControlEventListeners()
	{
		
		// Player Mouse/Keyboard Control Event Listeners
		
		// Mouse event listeners
		$(Game.dom_document).on('mousedown', function(event) { Game.player.controls.onMouseDown(event); });
		$(Game.dom_document).on('mouseup', function(event) { Game.player.controls.onMouseUp(event); });
		
		// Keyboard event listeners
		$(Game.dom_document).on('keydown', function(event) { Game.player.controls.onKeyDown(event); });
		$(Game.dom_document).on('keyup', function(event) { Game.player.controls.onKeyUp(event); });
		
		// Pointer lock controls event listeners
		Game.player.controls.pointer_lock_controls.addEventListener('lock', function() { Game.player.controls.onPointerLockControlsLock(); });
		Game.player.controls.pointer_lock_controls.addEventListener('unlock', function() { Game.player.controls.onPointerLockControlsUnlock(); });
		$(Game.renderer.domElement).on('click', function() { Game.player.controls.pointer_lock_controls.lock(); });
		
		// Editor UI pointer lock event listener
		$('#editor').on('click', function(event) { Game.player.controls.pointerLockOnUIWhitespaceClick(event, $(this), ".editor-window"); });
		
		// Debug UI pointer lock event listener
		$('#debug').on('click', function(event) { Game.player.controls.pointerLockOnUIWhitespaceClick(event, $(this), ".debug-window"); });
		
		// Transform controls event listeners
		Game.player.controls.transform_controls.addEventListener('draggingChanged', function(event) { Game.player.controls.onTransformControlsDraggingChanged(event); });
		Game.player.controls.transform_controls.addEventListener('objectChange', function(event) { Game.player.controls.onTransformControlsObjectChanged(event); });
		
	}
	
	/**
	 * Mouse button click event.
	 */
	onMouseDown(event)
	{
		
		// Handle mouse button click event
		switch (event.button)
		{
			case 0:
				// Left-click
				
				// Handle player left mouse down
				Game.player.handleLeftMouseDown();
				
				// Check if editor is enabled...
				if (Editor.enabled)
				{
					
					// Handle editor left mouse down
					Editor.handleLeftMouseDown(event);
					
				}
				
				break;
			case 2:
				// Right-click
				
				// Do nothing.
				
				break;
		}
	}
	
	/**
	 * Mouse button release event.
	 */
	onMouseUp(event)
	{
		
		// Handle mouse button release event
		switch (event.button)
		{
			case 0:
				// Left-click
				
				// Handle player left mouse up
				Game.player.handleLeftMouseUp();
				
				// Check if editor is enabled...
				if (Editor.enabled)
				{
					
					// Handle editor left mouse up
					Editor.handleLeftMouseUp();
					
				}
				
				break;
			case 2:
				// Right-click
				
				// Handle player right mouse up
				Game.player.handleRightMouseUp();
				
				// Check if editor is enabled...
				if (Editor.enabled)
				{
					
					// Handle editor right mouse up
					Editor.handleRightMouseUp();
					
				}
				
				break;
		}
		
	}
	
	/**
	 * PointerLockControls mouse lock event, used by PointerLockControls to lock the mouse to the renderer.
	 */
	onPointerLockControlsLock()
	{
		
		// Mouse is now locked to the renderer
		Game.player.controls.is_mouse_locked = true;
		
	}
	
	/**
	 * PointerLockControls mouse unlock event, used by PointerLockControls to unlock the mouse from the renderer.
	 */
	onPointerLockControlsUnlock()
	{
		
		// Mouse is now unlocked from the renderer
		Game.player.controls.is_mouse_locked = false;
		
		// Make sure the transform controls knows the mouse is now unlocked from the renderer
		Game.player.controls.transform_controls.dragging = false;
		
	}
	
	/**
	 * CustomTransformControls mouse dragging changed event, used by three.js CustomTransformControls when the mouse is beginning or ending dragging the gizmo.
	 */
	onTransformControlsDraggingChanged(event)
	{
		
		// Determine whether or not the mouse is dragging the gizmo
		Game.player.controls.is_mouse_dragging = event.value;
		
		// If the mouse is starting to drag the gizmo...
		if (Game.player.controls.is_mouse_dragging)
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
	
	
	// Keyboard Control Events
	
	/**
	 * Keyboard key press event.
	 */
	onKeyDown(event)
	{
		
		// Ignore key presses if a text box or text area is being edited
		if ($(Game.dom_document.activeElement).is('input, textarea') || $(Game.dom_document.activeElement).prop('isContentEditable'))
		{
			return;
		}
		
		// Prevent Ctrl-key browser events when the mouse is locked		
		if (Game.player.controls.is_mouse_locked)
		{
			event.preventDefault();
		}
		
		// Handle key press event
		switch (event.code)
		{
			case 'KeyW':
				Game.player.controls.is_player_moving_forward = true;
				break;
			case 'KeyA':
				Game.player.controls.is_player_moving_left = true;
				break;
			case 'KeyS':
				Game.player.controls.is_player_moving_backward = true;
				break;
			case 'KeyD':
				Game.player.controls.is_player_moving_right = true;
				break;
			case 'Space':
				Game.player.controls.is_player_jumping = true;
				break;
			case 'ShiftLeft':
				Game.player.controls.modifier_shift_left_pressed = true;
				break;
			case 'ControlLeft':
				Game.player.controls.modifier_control_left_pressed = true;
				break;
		}
		
	}
	
	/**
	 * Keyboard key release event.
	 */
	onKeyUp(event)
	{
		
		// Ignore key releases if a text box or text area is being edited
		if ($(Game.dom_document.activeElement).is('input, textarea') || $(Game.dom_document.activeElement).prop('isContentEditable'))
		{
			return;
		}
		
		// Handle key release event
		switch (event.code)
		{
			case 'KeyW':
				Game.player.controls.is_player_moving_forward = false;
				break;
			case 'KeyA':
				Game.player.controls.is_player_moving_left = false;
				break;
			case 'KeyS':
				Game.player.controls.is_player_moving_backward = false;
				break;
			case 'KeyD':
				Game.player.controls.is_player_moving_right = false;
				break;
			case 'KeyE':
				if (Game.player.controls.modifier_shift_left_pressed)
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
				if (Game.player.controls.modifier_control_left_pressed)
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
				if (Game.player.controls.modifier_control_left_pressed)
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
				if (Game.player.controls.modifier_control_left_pressed)
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
				if (Game.player.controls.modifier_control_left_pressed)
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
			case 'Space':
				Game.player.controls.is_player_jumping = false;
				break;
			case 'Tab':
				// Check if editor is enabled...
				if (Editor.enabled)
				{
					
					// Toggle noclip
					Game.player.noclip = !Game.player.noclip;
					$("#editor-camera-walk").prop("checked", !Game.player.noclip);
					
				}
				break;
			case 'Delete':
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
				Game.player.controls.modifier_shift_left_pressed = false;
				break;
			case 'ControlLeft':
				Game.player.controls.modifier_control_left_pressed = false;
				break;
		}
		
	}
	
	/**
	 * Locks the mouse pointer to the renderer when any UI element's whitespace is clicked. Whitespace is defined as whatever HTML elements are within the element calling this function that do not have the "window_class" CSS class applied to them or their children.
	 *
	 * @param {Event} event The event object passed by the event handler.
	 * @param {Element} element_clicked The element which was clicked and is subsequently calling the event handler.
	 * @param {string} window_class The name of the CSS class applied to HTML elements which, along with their children, will not constitute whitespace.
	 */
	pointerLockOnUIWhitespaceClick(event, element_clicked, window_class)
	{
		
		let is_whitespace_clicked = true;
		
		// Calculate the offset within the HTML element which was clicked
		const offset = $(element_clicked).offset();
		const relative_x = event.pageX - offset.left;
		const relative_y = event.pageY - offset.top;
		
		// Check if any of the HTML element's children with the specified CSS class applied were clicked
		$(element_clicked).find(window_class).each(function()
		{
			
			// Calculate the child HTML element's offset
			const child_offset = $(this).offset();
			const child_width = $(this).outerWidth();
			const child_height = $(this).outerHeight();
			
			// Check if any <select> elements are open
			if ($('select').is(':focus'))
			{
				
				// A <select> element dropdown was clicked or closed
				is_whitespace_clicked = false;
				
				// Exit the function
				return false;
				
			}
			else
			{
			
				// Determine if the child HTML element was clicked
				if (relative_x >= (child_offset.left - offset.left) && relative_x <= (child_offset.left - offset.left + child_width) && relative_y >= (child_offset.top - offset.top) && relative_y <= (child_offset.top - offset.top + child_height))
				{
					
					// The child HTML was clicked instead of whitespace
					is_whitespace_clicked = false;
					
					// Exit the function
					return false;
					
				}
			
			}
			
		});
		
		// Lock the mouse pointer if whitespace was clicked
		if (is_whitespace_clicked)
		{
			Game.player.controls.pointer_lock_controls.lock();
		}
		
	}
	
}
export default Controls;