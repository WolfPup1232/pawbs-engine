// three.js Import
import * as THREE from '../libraries/threejs/three.js';

// Class Imports
import Controls from './controls.class.js';

/**
 * A player in the game world.
 */
class Player
{
	
	/**
	 * Initializes a new player for use in the game world.
	 *
	 * @param {window} window_interface A reference to the web browser window, which contains the DOM document. This is required to size the camera.
	 * @param {document} dom_document A reference to the DOM document within the web browser window. This is required for mouse/keyboard controls.
	 * @param {renderer} three.webglrenderer A reference to the three.js renderer element. This is also required for mouse controls.
	 * @param {world} world The game world in which the player exists.
	 */
	constructor(window_interface, dom_document, renderer, world)
	{
		
		// Class Declarations/Initialization
		
		
		// Player Attributes
		
		// The player's height.
		this.height = 2;
		
		
		// Player Movement
		
		// The player's movement velocity
		this.velocity = new THREE.Vector3();
		
		// The player's movement direction
		this.direction = new THREE.Vector3();
		
		// The player's movement speed
		this.speed = 0.1;
		
		
		// Player Steps/Stairs/Ramp Movement
		
		// The distance from the player to check for steps/stairs/ramps
		this.stair_check_distance = 0.1;
		
		
		// Player Jumping
		
		// Whether or not the player is currently jumping
		this.is_jumping = false;
		
		// The player's maximum jump height
		this.jump_height = 0.25;
		
		// The player's jump velocity
		this.jump_velocity = 0;
		
		// The amount of gravity pulling down on the player
		//
		// 	NOTE: This should probably be changed to be different per-world, or even per-area in a world.
		//		  Like different gravity in different rooms maybe? ¯\_(ツ)_/¯
		this.jump_gravity = 0.0125;
		
		
		// three.js Camera
		
		// The player is actually just this camera
		this.camera = new THREE.PerspectiveCamera(75, window_interface.innerWidth / window_interface.innerHeight, 0.1, 1000);
		this.camera.name = "player";
		
		// Set the player's height
		this.camera.position.y = this.height;
		
		
		// three.js Raycaster
		
		// Initialize new raycaster to be re-used for all raycasting
		this.raycaster = new THREE.Raycaster();
		
		
		// Player Controls
		
		// Initialize player's keyboard/mouse controls
		this.controls = new Controls(dom_document, renderer, world, this);
		
	}
	
	
	// Properties
	
	/**
	 * The player's position in the game world.
	 */
	get position()
	{
		return this.camera.position;
	}
	set position(new_position)
	{
		this.camera.position = new_position;
	}
	
	/**
	 * The player's quaternion. What the hell is a quaternion? ¯\_(ツ)_/¯
	 */
	get quaternion()
	{
		return this.camera.quaternion;
	}
	set quaternion(new_quaternion)
	{
		this.camera.quaternion = new_quaternion;
	}
	
	
	// Methods
	
	/**
	 * Handles player left mouse down.
	 */
	handlePlayerLeftMouseDown()
	{
		// Do nothing.
	}
	
	/**
	 * Handles player left mouse up.
	 */
	handlePlayerLeftMouseUp()
	{
		// Do nothing.
	}
	
	/**
	 * Handles player right mouse down.
	 */
	handlePlayerRightMouseDown()
	{
		// Do nothing.
	}
	
	/**
	 * Handles player right mouse up.
	 */
	handlePlayerRightMouseUp()
	{
		// Do nothing.
	}
	
	/**
	 * Handles player movement, collision detection, and other object movement in direct relation to the player's movement.
	 *
	 * @param {world} world The game world in which the player exists.
	 */
	handlePlayerMovement(world)
	{
		
		// Player Movement
		
		// Get the direction the player is looking
		const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.quaternion);
		const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.quaternion);
		const backward = forward.clone().negate(); // Opposite of forward
		const left = right.clone().negate(); // Opposite of right
		
		// Update player direction based on movement keys
		this.direction.set(0, 0, 0);
		if (this.controls.is_player_moving_forward) this.direction.add(forward);
		if (this.controls.is_player_moving_backward) this.direction.add(backward);
		if (this.controls.is_player_moving_right) this.direction.add(right);
		if (this.controls.is_player_moving_left) this.direction.add(left);
		this.direction.normalize();
		
		// Update player velocity based on direction
		this.velocity.x = this.direction.x * this.speed;
		this.velocity.z = this.direction.z * this.speed;
		
		
		// Player Steps/Stairs/Ramp Movement
		
		// Handle player movement over steps/stairs/ramps in all movement directions
		if (this.controls.is_player_moving_forward) this.handleStairsAndRampsInDirection(world, forward);
		if (this.controls.is_player_moving_backward) this.handleStairsAndRampsInDirection(world, backward);
		if (this.controls.is_player_moving_right) this.handleStairsAndRampsInDirection(world, right);
		if (this.controls.is_player_moving_left) this.handleStairsAndRampsInDirection(world, left);
		
		
		// Player Jumping
		
		// If the player is already in the air over any world object...
		if (this.position.y > (world.detectObjectSurfaceBelowPlayer(this) + this.height))
		{
			
			// Make the player fall downward
			this.jump_velocity -= this.jump_gravity;
			
			
		} // Otherwise, if the player is not yet in the air...
		else
		{
			
			// Reset player jump
			this.jump_velocity = 0;
			this.is_jumping = false;
			
			// Detect player jumping
			if (this.controls.is_player_jumping)
			{
				this.is_jumping = true;
				this.jump_velocity = this.jump_height;
			}
			
		}
		
		// Update the player's y-axis position accordingly, whether or not they're jumping
		this.position.y += this.jump_velocity;
		
		
		// Player Collision Detection
		
		// Get the player's intended position based on their current position, movement speed, and direction
		const intended_position = this.position.clone().add(this.velocity.clone());
		
		// Detect collision between the player's intended position and any collidable objects in the world
		if (!world.detectPlayerCollision(this, intended_position))
		{
			
			// No collision was detected, move the player to the intended position
			this.position.copy(intended_position);
			
		}
		
		
		// World Object Movement (in direct relation to the player's movement)
		
		// Handle billboard object rotations
		world.handleBillboards(this);
		
		
		// Player Movement Cont'd
		
		// Track the player's last known position in the world
		world.player_position = this.position;
		
		// Reduce player's velocity (smooths player's movement)
		this.velocity.multiplyScalar(0.95);
		
	}
	
	/**
	 * Handles player movement over steps or stairs and ramps.
	 *
	 * @param {world} world The game world in which the player exists.
	 * @param {direction} three.vector3 The direction in relation to the player, in which to check for steps/stairs/ramps to traverse.
	 */
	handleStairsAndRampsInDirection(world, direction)
	{
		
		// Get the position the player's feet, plus half a stair's height, to cast a ray from
		const player_feet_ray_position = new THREE.Vector3(this.position.x, (this.position.y - this.height) + (world.stair_height / 2), this.position.z);
		
		// Cast a ray in the specified direction from the ray's calculated position
		this.raycaster.set(player_feet_ray_position, direction.clone().setY(0).normalize());
		this.raycaster.near = 0;
		this.raycaster.far = this.stair_check_distance;
		
		// Check intersections with all world objects
		const intersects = this.raycaster.intersectObjects(world.all_objects);
		if (intersects.length > 0)
		{
			
			// Get the first within the check distance
			const closest_intersection = intersects[0];
			const closest_object = closest_intersection.object;
			
			// Handle PlaneGeometry objects specifically, otherwise use a different method for all other objects
			if (closest_object.geometry instanceof THREE.PlaneGeometry)
			{
				
				// Calculate the difference in height between where the player's feet are and the closest object's height
				const height_difference = world.detectPlaneSurfaceAtPoint(new THREE.Vector3(this.position.x, 0, this.position.z), closest_object) - (this.position.y - this.height);
				
				// If the height difference implies the object is a step or ramp, step the player up onto the object
				if (height_difference > 0 && height_difference <= world.stair_height)
				{
					this.position.y += height_difference;
				}
				
			}
			else
			{
				
				// Calculate the difference in height between where the player's feet are and the closest object's height
				const height_difference = (closest_object.position.y + (closest_object.geometry.parameters.height / 2)) - (this.position.y - this.height);
				
				// If the height difference implies the object is a step, step the player up onto the object
				if (height_difference > 0 && height_difference <= world.stair_height)
				{
					this.position.y += height_difference;
				}
				
			}
			
		}
		
	}
	
	
	// Editor Mode Methods
	
	/**
	 * Toggle editor mode on/off.
	 */
	toggleEditorMode(world)
	{
		
		// Toggle editor mode
		if (!this.controls.mode_editor)
		{
			
			// Enable editor mode
			this.controls.mode_editor = true;
			
			// Initialize UI elements
			$("#editor-world-name").val(world.name);
			
			// Show editor mode UI
			$("#editor").show();
			
		}
		else
		{
			
			// Hide editor mode UI
			$("#editor").hide();
			
			// Reset any highlighted or selected objects
			world.editorResetHighlightedObject();
			world.editorResetSelectedObject(this);
			
			// Disable editor mode
			this.controls.mode_editor = false;
			
		}
		
	}
	
	/**
	 * Handles editor mode processes that update every frame.
	 *
	 * @param {world} world The game world in which the player exists.
	 */
	handleEditorMode(world)
	{
		
		// Check if editor mode is enabled
		if (this.controls.mode_editor)
		{
			
			// If the player is dragging with the left mouse button...
			if (this.controls.is_mouse_left_down && this.controls.is_mouse_dragging)
			{
				
				// Handle transform controls mouse move event
				this.controls.transform_controls.mouseMove(this);
				
			}
			else
			{
				
				// Handle transform controls mouse hover event
				this.controls.transform_controls.mouseHover(this);
				
			}
			
		}
		
		// Do the following regardless of whether editor mode is enabled...
		//
		//	NOTE: These method calls may or may not have their own editor mode checks.
		
		// Handle editor mode object highlighting
		world.editorHandleHighlightedObject(this);
		
	}
	
	/**
	 * Handles player left mouse down editor mode.
	 */
	handleEditorLeftMouseDown()
	{
		
		// Check if editor mode is enabled
		if (this.controls.mode_editor)
		{
			
			// Handle transform controls mouse down event
			this.controls.transform_controls.mouseDown(this);
			
		}
		
	}
	
	/**
	 * Handles player left mouse up in editor mode.
	 */
	handleEditorLeftMouseUp(world)
	{
		
		// Check if editor mode is enabled
		if (this.controls.mode_editor)
		{
			
			// If the mouse is locked to the renderer...
			if (this.controls.is_mouse_locked)
			{
				
				// If the mouse is currently dragging...
				if (this.controls.is_mouse_dragging)
				{
					
					// The mouse is no longer dragging
					this.controls.is_mouse_dragging = false;
					
					// Handle transform controls mouse up event
					this.controls.transform_controls.mouseUp(this);
					
					
				} // Otherwise, if the mouse is not currently dragging...
				else
				{
					
					// Select the object the player is facing
					world.editorSelectObject(this);
					
				}
				
			}
			
		}
		
	}
	
	/**
	 * Handles player right mouse down in editor mode.
	 */
	handleEditorRightMouseDown()
	{
		// Do nothing.
	}
	
	/**
	 * Handles player right mouse up in editor mode.
	 */
	handleEditorRightMouseUp(world)
	{
		
		// Check if editor mode is enabled
		if (this.controls.mode_editor)
		{
			
			// If the mouse is locked to the renderer...
			if (this.controls.is_mouse_locked)
			{
				
				// Attempt to reset the selected object
				world.editorResetSelectedObject(this);
				
			}
			
		}
		
	}
	
	
	// Debug Mode Methods
	
	/**
	 * Toggle debug mode on/off.
	 */
	toggleDebugMode()
	{
		
		// Toggle debug mode
		if (!this.controls.mode_debug)
		{
			
			// Enable debug mode
			this.controls.mode_debug = true;
			
			// Show debug mode UI
			$("#debug").show();
			
		}
		else
		{
			
			// Hide debug mode UI
			$("#debug").hide();
			
			// Disable debug mode
			this.controls.mode_debug = false;
			
		}
		
	}
	
	/**
	 * Handles debug mode processes that update every frame.
	 */
	handleDebugMode(world)
	{
		
		// Check if debug mode is enabled
		if (this.controls.mode_debug)
		{
			
			// Handle debug mode output
			this.handleDebugModeOutput(world);
			
		}
		
		// Do the following regardless of whether debug mode is enabled
		//
		//	NOTE: These method calls may or may not have their own debug mode checks.
		
		// Do nothing.
		
	}
	
	/**
	 * Handles debug mode UI output.
	 */
	handleDebugModeOutput(world)
	{
		
		// Output debug info to UI
		// $("#debug-text").html("billboard.rotation.x		 = " + world.objects[0].rotation.x + "<br />" + 
							  // "billboard.rotation.y   = " + world.objects[0].rotation.y + "<br />" + 
							  // "billboard.rotation.z  = " + world.objects[0].rotation.z + "<br />" + 
							  // "player.jump_height    = " + this.jump_height + "<br />" + 
							  // "player.position.y     = " + this.position.y + "<br />");
		
	}
	
}
export default Player;
