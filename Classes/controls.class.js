// three.js Import
import * as THREE from '../three.js/three.js';
import { PointerLockControls } from '../three.js/modules/PointerLockControls.js';

/**
 * A controls object which provides mouse/keyboard controls to a player.
 */
class Controls
{	
	
	/**
	 * Initializes a new controls object to provide mouse/keyboard controls to a player.
	 *
	 * @param {document} dom_document A reference to the browser window's DOM document. The document listens for mouse/keyboard input.
	 * @param {renderer} three.webglrenderer A reference to the three.js renderer element. This is required for mouse controls.
	 * @param {world} world The game world which can be affected by the mouse/keyboard controls.
	 * @param {player} player The player being controlled by the mouse/keyboard controls.
	 */
	constructor(dom_document, renderer, world, player)
	{
		
		// Class Declarations/Initialization
		
		
		// Debug Mode
		
		// Enable/disable debug mode
		this.mode_debug = false;
		
		
		// Editor Mode
		
		// Enable/disable editor mode
		this.mode_editor = false;
		
		
		// three.js Pointer Lock Controls (Mouse Controls)
		
		// Initialize mouse controls
		this.is_mouse_locked = false;
		this.pointer_lock_controls = new PointerLockControls(player.camera, dom_document.body);
		
		
		// Player Movement Keys (Keyboard Controls)
		
		// Player movement (W/S/A/D)
		this.is_player_moving_forward = false;
		this.is_player_moving_backward = false;
		this.is_player_moving_left = false;
		this.is_player_moving_right = false;
		
		// Player jumping (Space)
		this.is_player_jumping = false;
		
		
		// Modifier Keys
		
		// Left Shift modifier key
		this.modifier_shift_left_pressed = false;
		
		// Left Control modifier key
		this.modifier_control_left_pressed = false;
		
		
		// Player Mouse/Keyboard Control Event Listeners
		
		// Mouse event listeners
		$(dom_document).on('mousedown', (event) => player.controls.onMouseDown(event, world, player));
		$(dom_document).on('mouseup', (event) => player.controls.onMouseUp(event, world, player));
		
		$(renderer.domElement).on('click', () => player.controls.pointer_lock_controls.lock());
		
		this.pointer_lock_controls.addEventListener('lock', () => player.controls.onMouseLock());
		this.pointer_lock_controls.addEventListener('unlock', () => player.controls.onMouseUnlock());
		
		// Keyboard event listeners
		$(dom_document).on('keydown', (event) => player.controls.onKeyDown(event, dom_document, world, player));
		$(dom_document).on('keyup', (event) => player.controls.onKeyUp(event, dom_document, world, player));
		
		
		// Mouse Control Events
		
		/**
		 * Mouse button click event.
		 */
		this.onMouseDown = function(event, world, player)
		{
			
			// Handle mouse button click event
			switch (event.button)
			{
				case 0:
					// Left-click
					
					// Do nothing.
					
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
		this.onMouseUp = function(event, world, player)
		{
			
			// Handle mouse button release event
			switch (event.button)
			{
				case 0:
					// Left-click
					
					// Handle player left-click
					player.handlePlayerLeftClick();
					
					// Handle editor mode left-click
					player.handleEditorModeLeftClick(world);
					
					break;
				case 2:
					// Right-click
					
					// Handle player right-click
					player.handlePlayerRightClick();
					
					// Handle editor mode right-click
					player.handleEditorModeRightClick(world);
					
					break;
			}
			
		};
		
		/**
		 * Mouse lock event, used by three.js PointerLockControls to lock the mouse to the renderer.
		 */
		this.onMouseLock = function()
		{
			
			// Mouse is now locked to the renderer
			this.is_mouse_locked = true;
			
		};
		
		/**
		 * Mouse unlock event, used by three.js PointerLockControls to unlock the mouse from the renderer.
		 */
		this.onMouseUnlock = function()
		{
			
			// Mouse is now unlocked from the renderer
			this.is_mouse_locked = false;
			
		};
		
		
		// Keyboard Control Events
		
		/**
		 * Keyboard key press event.
		 */
		this.onKeyDown = function(event, dom_document, world, player)
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
		this.onKeyUp = function(event, dom_document, world, player)
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
						
						// Toggle debug mode on/off
						player.toggleDebugMode();
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
						
						// Toggle editor mode on/off
						player.toggleEditorMode(world);
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
				case 'ShiftLeft':
					player.controls.modifier_shift_left_pressed = false;
					break;
				case 'ControlLeft':
					player.controls.is_control_left_pressed = false;
					break;
			}
			
		};
		
	}
	
}
export default Controls;
