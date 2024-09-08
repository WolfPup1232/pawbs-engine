// three.js Import
import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';

// Class Imports
import Controls from './controls.class.js';

/**
 * A player object in the game world.
 */
class Player
{
	
	/**
	 * Initializes a new player object for use in the game world.
	 *
	 * @param {window} window_interface A reference to the web browser window, which contains the DOM document. This is required to size the camera.
	 * @param {document} dom_document A reference to the DOM document within the web browser window. This is required for mouse/keyboard controls.
	 */
	constructor(window_interface, dom_document)
	{
		
		// Class Declarations/Initialization
		
		// Player Attributes
		this.height = 2;
		
		// Player Movement
		this.velocity = new THREE.Vector3();
		this.direction = new THREE.Vector3();
		this.speed = 0.1;
		
		// Player Jumping
		this.is_jumping = false;
		this.jump_velocity = 0;
		this.jump_height = 0.25;
		this.jump_gravity = 0.0125;
		
		// three.js Camera
		this.camera = new THREE.PerspectiveCamera(75, window_interface.innerWidth / window_interface.innerHeight, 0.1, 1000);
		this.camera.position.y = this.height;
		
		// Player Controls
		this.controls = new Controls(dom_document, this);
		
	}
	
	
	// Properties
	
	/**
	 * The player's position in the game world.
	 */
	get position()
	{
		return this.camera.position;
	}
	set position(x)
	{
		this.camera.position = new_position;
	}

	
	// Methods
	
	/**
	 * Handles player movement and collision detection.
	 *
	 * @param {world} world The game world in which the player object exists.
	 */
	HandlePlayerMovement(world)
	{
		
		// Player Movement
		
		// Get the direction the player is looking
		const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
		const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);

		// Update direction based on movement keys
		this.direction.set(0, 0, 0);
		if (this.controls.is_player_moving_forward) this.direction.add(forward);
		if (this.controls.is_player_moving_backward) this.direction.sub(forward);
		if (this.controls.is_player_moving_right) this.direction.add(right);
		if (this.controls.is_player_moving_left) this.direction.sub(right);
		this.direction.normalize();

		// Update velocity based on direction
		this.velocity.x = this.direction.x * this.speed;
		this.velocity.z = this.direction.z * this.speed;
		
		
		// Player Jumping
		
		// Handle player's jumping
		if (this.position.y <= this.height) // TODO: Rather than using this.height as the baseline, match it to the current terrain under the player instead (could be -10?)
		{
			this.jump_velocity = 0;
			this.is_jumping = false;
			
			if (this.controls.is_player_jumping)
			{
				this.is_jumping = true;
				this.jump_velocity = this.jump_height;
			}
		}
		else
		{
			this.jump_velocity -= this.jump_gravity;
		}
		this.position.y += this.jump_velocity;
		//this.position.y = Math.max(this.position.y, this.height);
		
		
		// Player Collision
		
		// Handle player collision detection by using the player's intended position to check for a collision
 		const intended_position = this.position.clone().add(this.velocity.clone());
 		if (!world.detectPlayerCollision(this, intended_position))
 		{
			
			// No collision detected, move the player to the intended position
			this.position.copy(intended_position);
			
 		}
		
		
		// Player Movement Cont'd
		
		// Reduce player's velocity (smooths player's movement)
		this.velocity.multiplyScalar(0.95);
		
	}
	
}
export default Player;
