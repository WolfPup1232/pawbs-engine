// three.js Import
import { PointerLockControls } from '../libraries/threejs/modules/PointerLockControls.js';
import { TransformControls } from '../libraries/threejs/modules/TransformControls.js';

/**
 * A controls object which provides mouse/keyboard controls to a player.
 */
class Controls
{	
	
	/**
	 * Initializes a new controls object to provide mouse/keyboard controls to a player.
	 *
	 * @param {document} dom_document A reference to the browser window's DOM document.
	 * @param {renderer} three.webglrenderer A reference to the three.js renderer element.
	 * @param {textures} textures The list of game textures.
	 * @param {world} world The current game world.
	 * @param {editor} editor The in-game world editor.
	 * @param {player} player The player being controlled by the mouse/keyboard.
	 * @param {editor} debug The in-game debugger.
	 */
	constructor(dom_document, renderer, textures, world, editor, player, debug)
	{
		
		// Class Declarations/Initialization
		
		
		// Debug Mode
		
		// Enable/disable debug mode
		this.mode_debug = false;
		
		
		// Player Mouse Controls
		
		// Initialize mouse controls
		this.is_mouse_left_down = false;
		this.is_mouse_right_down = false;
		
		this.is_mouse_dragging = false;
		
		// three.js pointer lock controls
		this.pointer_lock_controls = new PointerLockControls(player.camera, dom_document.body);
		
		this.is_mouse_locked = false;
		
		// three.js transform controls
		this.transform_controls = new TransformControls(player.camera, renderer.domElement);
		this.transform_controls.setMode('translate');
		this.transform_controls.translationSnap = 0.1;
		this.transform_controls.scaleSnap = 0.25;
		this.transform_controls.rotationSnap = 0.5;
		world.scene.add(this.transform_controls);
		
		
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
		
		
		// Player Mouse/Keyboard Control Event Listeners
		
		// Mouse event listeners
		$(dom_document).on('mousedown', (event) => player.controls.onMouseDown(event, debug, dom_document, textures, world, editor, player));
		$(dom_document).on('mouseup', (event) => player.controls.onMouseUp(event, debug, dom_document, textures, world, editor, player));
		
		// Keyboard event listeners
		$(dom_document).on('keydown', (event) => player.controls.onKeyDown(event, debug, dom_document, textures, world, editor, player));
		$(dom_document).on('keyup', (event) => player.controls.onKeyUp(event, debug, dom_document, textures, world, editor, player));
		
		// Pointer lock controls event listeners
		this.pointer_lock_controls.addEventListener('lock', () => player.controls.onPointerLockControlsLock());
		this.pointer_lock_controls.addEventListener('unlock', () => player.controls.onPointerLockControlsUnlock());
		$(renderer.domElement).on('click', () => player.controls.pointer_lock_controls.lock());
		
		// Editor UI pointer lock event listener
    	$('#editor').on('click', function(event) { player.controls.pointerLockOnUIWhitespaceClick(event, $(this), ".editor-window", player); });
		
		// Debug UI pointer lock event listener
    	$('#debug').on('click', function(event) { player.controls.pointerLockOnUIWhitespaceClick(event, $(this), ".debug-window", player); });
		
		// Transform controls event listeners
		this.transform_controls.addEventListener('draggingChanged', (event) => player.controls.onTransformControlsDraggingChanged(player));
		
		
		// Mouse Control Events
		
		/**
		 * Mouse button click event.
		 */
		this.onMouseDown = function(event, debug, dom_document, textures, world, editor, player)
		{
			
			// Handle mouse button click event
			switch (event.button)
			{
				case 0:
					// Left-click
					
					// Handle player left mouse down
					player.handleLeftMouseDown();
					
					// Handle editor left mouse down
					editor.handleLeftMouseDown(player);
					
					break;
				case 2:
					// Right-click
					
					// Do nothing.
					
					break;
			}
		};
		
		/**
		 * Mouse button release event.
		 */
		this.onMouseUp = function(event, debug, dom_document, textures, world, editor, player)
		{
			
			// Handle mouse button release event
			switch (event.button)
			{
				case 0:
					// Left-click
					
					// Handle player left mouse up
					player.handleLeftMouseUp();
					
					// Handle editor left mouse up
					editor.handleLeftMouseUp(world, player);
					
					break;
				case 2:
					// Right-click
					
					// Handle player right mouse up
					player.handleRightMouseUp();
					
					// Handle editor right mouse up
					editor.handleRightMouseUp(dom_document, world, player);
					
					break;
			}
			
		};
		
		/**
		 * PointerLockControls mouse lock event, used by PointerLockControls to lock the mouse to the renderer.
		 */
		this.onPointerLockControlsLock = function()
		{
			
			// Mouse is now locked to the renderer
			player.controls.is_mouse_locked = true;
			
		};
		
		/**
		 * PointerLockControls mouse unlock event, used by PointerLockControls to unlock the mouse from the renderer.
		 */
		this.onPointerLockControlsUnlock = function()
		{
			
			// Mouse is now unlocked from the renderer
			player.controls.is_mouse_locked = false;
			
		};
		
		/**
		 * TransformControls mouse dragging event, used by three.js TransformControls when the mouse is dragging the gizmo.
		 */
		this.onTransformControlsDraggingChanged = function(player)
		{
			
			// Mouse is now dragging the gizmo
			player.controls.is_mouse_dragging = true;
			
		};
		
		
		// Keyboard Control Events
		
		/**
		 * Keyboard key press event.
		 */
		this.onKeyDown = function(event, debug, dom_document, textures, world, editor, player)
		{
			
			// Ignore key presses if a text box or text area is being edited
			if ($(dom_document.activeElement).is('input, textarea') || $(dom_document.activeElement).prop('isContentEditable'))
			{
				return;
			}
			
			// Handle key press event
			switch (event.code)
			{
				case 'KeyW':
					player.controls.is_player_moving_forward = true;
					break;
				case 'KeyA':
					player.controls.is_player_moving_left = true;
					break;
				case 'KeyS':
					player.controls.is_player_moving_backward = true;
					break;
				case 'KeyD':
					if (player.controls.modifier_shift_left_pressed)
					{
						// ShiftLeft + KeyD
						
						// Do nothing.
					}
					else
					{
						// KeyD
						
						player.controls.is_player_moving_right = true;
					}
					break;
				case 'Space':
					player.controls.is_player_jumping = true;
					break;
				case 'ShiftLeft':
					player.controls.modifier_shift_left_pressed = true;
					break;
				case 'ControlLeft':
					player.controls.is_control_left_pressed = true;
					break;
			}
			
		};
		
		/**
		 * Keyboard key release event.
		 */
		this.onKeyUp = function(event, debug, dom_document, textures, world, editor, player)
		{
			
			// Ignore key releases if a text box or text area is being edited
			if ($(dom_document.activeElement).is('input, textarea') || $(dom_document.activeElement).prop('isContentEditable'))
			{
				return;
			}
			
			// Handle key release event
			switch (event.code)
			{
				case 'KeyW':
					player.controls.is_player_moving_forward = false;
					break;
				case 'KeyA':
					player.controls.is_player_moving_left = false;
					break;
				case 'KeyS':
					player.controls.is_player_moving_backward = false;
					break;
				case 'KeyD':
					if (player.controls.modifier_shift_left_pressed)
					{
						// ShiftLeft + KeyD
						
						// Toggle debug on/off
						debug.toggle();
					}
					else
					{
						// KeyD
						
						player.controls.is_player_moving_right = false;
					}
					break;
				case 'KeyE':
					if (player.controls.modifier_shift_left_pressed)
					{
						// ShiftLeft + KeyE
						
						// Toggle editor on/off
						editor.toggle(textures, world, player);
					}
					else
					{
						// KeyE
						
						// Do nothing.
					}
					break;
				case 'Space':
					player.controls.is_player_jumping = false;
					break;
				case 'Delete':
					
					// Delete editor selected object
					editor.deleteSelectedObject(world, player);
					
					break;
				case 'ShiftLeft':
					player.controls.modifier_shift_left_pressed = false;
					break;
				case 'ControlLeft':
					player.controls.is_control_left_pressed = false;
					break;
			}
			
		};
		
	}
	
	
	// Functions
	
	/**
	 * Locks the mouse pointer to the renderer when any UI element's whitespace is clicked. Whitespace is defined as whatever HTML elements are within the element calling this function that do not have the "window_class" CSS class applied to them or their children.
	 *
	 * @param {event} event The event object passed by the event handler.
	 * @param {jquery} element_clicked The element which was clicked and is subsequently calling the event handler.
	 * @param {string} window_class The name of the CSS class applied to HTML elements which, along with their children, will not constitute whitespace.
	 * @param {player} player The player whose mouse pointer will be locked to the renderer.
	 */
	pointerLockOnUIWhitespaceClick(event, element_clicked, window_class, player)
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
			player.controls.pointer_lock_controls.lock();
		}
		
	}
	
}
export default Controls;