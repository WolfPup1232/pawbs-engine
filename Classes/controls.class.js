// three.js Import
import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';
import { PointerLockControls } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/PointerLockControls.js';

/**
 * A controls object which provides mouse/keyboard controls to a player object.
 */
class Controls
{	
	
	/**
	 * Initializes a new controls object to provide mouse/keyboard controls to a player object.
	 *
	 * @param {document} dom_document A reference to the browser window's DOM document. The document listens for mouse/keyboard input.
	 * @param {player} player The player object being controlled by the mouse/keyboard controls.
	 */
	constructor(dom_document, player)
	{
		
		// Class Declarations/Initialization
		
		// three.js Pointer Lock Controls (Mouse Controls)
		this.pointer_lock_controls = new PointerLockControls(player.camera, dom_document.body);
		
		// Player Movement Keys (Keyboard Controls)
		this.is_player_moving_forward = false;
		this.is_player_moving_backward = false;
		this.is_player_moving_left = false;
		this.is_player_moving_right = false;
		
		this.is_player_jumping = false;
		
		// Player Mouse/Keyboard Control Listeners
		dom_document.addEventListener('click', () => player.controls.pointer_lock_controls.lock(), false);
		dom_document.addEventListener('keydown', (event) => player.controls.onKeyDown(event, player.controls));
		dom_document.addEventListener('keyup', (event) => player.controls.onKeyUp(event, player.controls));
		
		
		// Keyboard Control Events
		
		/**
		 * Keyboard key press event.
		 */
		this.onKeyDown = function (event, controls)
		{
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
			}
		};
		
		/**
		 * Keyboard key release event.
		 */
		this.onKeyUp = function (event, controls)
		{
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
					controls.is_player_moving_right = false;
					break;
				case 'Space':
					controls.is_player_jumping = false;
					break;
			}
		};
		
	}
	
}
export default Controls;
