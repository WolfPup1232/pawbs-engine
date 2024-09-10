// three.js Import
import * as THREE from '../Three.js/three.js';
import { PointerLockControls } from '../Three.js/Modules/PointerLockControls.js';

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
	 * @param {player} player The player being controlled by the mouse/keyboard controls.
	 */
	constructor(dom_document, renderer, player)
	{
		
		// Class Declarations/Initialization
		
		
		// Debug Mode
		
		// Enable/disable debug mode
		this.mode_debug = false;
		
		
		// Editor Mode
		
		// Enable/disable debug mode
		this.mode_editor = false;
		
		
		// three.js Pointer Lock Controls (Mouse Controls)
		
		// Initialize mouse controls
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
		
		
		// Player Mouse/Keyboard Control Listeners
		
		// Mouse click-to-lock listener
		$(renderer.domElement).on('click', () => player.controls.pointer_lock_controls.lock());
		
		// Keyboard event listeners
		$(dom_document).on('keydown', (event) => player.controls.onKeyDown(event, dom_document, player.controls));
		$(dom_document).on('keyup', (event) => player.controls.onKeyUp(event, dom_document, player.controls));
		
		
		// Keyboard Control Events
		
		/**
		 * Keyboard key press event.
		 */
		this.onKeyDown = function (event, dom_document, controls)
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
					controls.is_player_moving_forward = true;
					break;
				case 'KeyA':
					controls.is_player_moving_left = true;
					break;
				case 'KeyS':
					controls.is_player_moving_backward = true;
					break;
				case 'KeyD':
					controls.is_player_moving_right = true;
					break;
				case 'Space':
					controls.is_player_jumping = true;
					break;
				case 'ShiftLeft':
					controls.modifier_shift_left_pressed = true;
					break;
				case 'ControlLeft':
					controls.is_control_left_pressed = true;
					break;
			}
			
		};
		
		/**
		 * Keyboard key release event.
		 */
		this.onKeyUp = function (event, dom_document, controls)
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
					controls.is_player_moving_forward = false;
					break;
				case 'KeyA':
					controls.is_player_moving_left = false;
					break;
				case 'KeyS':
					controls.is_player_moving_backward = false;
					break;
				case 'KeyD':
					if (controls.modifier_shift_left_pressed)
					{
						// ShiftLeft + KeyD
						
						// Toggle debug mode on/off
						if (!controls.mode_debug)
						{
							controls.mode_debug = true;
							$("#debug").show();
						}
						else
						{
							controls.mode_debug = false;
							$("#debug").hide();
						}
					}
					else
					{
						// KeyD
						
						controls.is_player_moving_right = false;
					}
					break;
				case 'KeyE':
					if (controls.modifier_shift_left_pressed)
					{
						// ShiftLeft + KeyE
						
						// Toggle editor mode on/off
						if (!controls.mode_editor)
						{
							controls.mode_editor = true;
							$("#editor").show();
						}
						else
						{
							controls.mode_editor = false;
							$("#editor").hide();
						}
					}
					else
					{
						// KeyE
						
						// Do nothing.
					}
					break;
				case 'Space':
					controls.is_player_jumping = false;
					break;
				case 'ShiftLeft':
					controls.modifier_shift_left_pressed = false;
					break;
				case 'ControlLeft':
					controls.is_control_left_pressed = false;
					break;
			}
			
		};
		
	}
	
}
export default Controls;
