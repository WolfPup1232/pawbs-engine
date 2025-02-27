// three.js Imports
import * as THREE from '../libraries/threejs/three.js';

// Static Class Imports
import Game from './game.class.js';
import Multiplayer from './multiplayer.class.js';

/**
 * A player in the game world.
 */
class Player
{
	
	//#region [Class Declarations / Constructor]
		
		/**
		 * Initializes a new player for use in the current game world.
		 */
		constructor()
		{
			
			// Class Declarations/Initialization
			
			/**
			 * Flag indicating whether or not the player's post-initialization has completed in the update function.
			 */
			this.post_initialization = false;
			
			
			// Player Attributes
			
			/**
			 * The player's unique ID.
			 */
			this.id = THREE.MathUtils.generateUUID();
			
			/**
			 * The player's name.
			 */
			this.name = "Noob";
			
			/**
			 * The player's colour.
			 */
			this.colour = ["#ff71ce", "#01cdfe", "#05ffa1", "#b967ff", "#fffb96", "#ffa105"][THREE.MathUtils.randInt(0, 5)];
			
			/**
			 * The player's height.
			 */
			this.height = 2;
			
			
			// Multiplayer Attributes
			
			/**
			 * The player's multiplayer server connection.
			 */
			this.connection = null;
			
			
			// Player Movement
			
			/**
			 * The player's movement velocity.
			 */
			this.velocity = new THREE.Vector3();
			
			/**
			 * The player's movement direction.
			 */
			this.direction = new THREE.Vector3();
			
			/**
			 * The player's movement speed.
			 */
			this.speed = 0.1;
			
			
			// Player Steps/Stairs/Ramp Movement
			
			/**
			 * The distance from the player to check for steps/stairs/ramps.
			 */
			this.stair_check_distance = 0.1;
			
			
			// Player Jumping
			
			/**
			 * Flag indicating whether or not the player is currently jumping.
			 */
			this.jumping = false;
			
			/**
			 * The player's maximum jump height.
			 */
			this.jump_height = 0.25;
			
			/**
			 * The player's jump velocity.
			 */
			this.jump_velocity = 0;
			
			/**
			 * The amount of gravity pulling down on the player.
			 */
			this.jump_gravity = 0.0125;
			
			
			/**
			 * Flag indicating whether or not the player has unrestricted free-flying camera movement.
			 */
			this.noclip = false;
			
			/**
			 * The player's noclip movement speed.
			 */
			this.noclip_speed = 0.175;
			
			
			// three.js Camera
			
			/**
			 * The player's camera, which is the actual in-game player. The camera may have additional geometry attached to it, but the camera is the player.
			 */
			this.camera = new THREE.PerspectiveCamera(75, Game.window_interface.innerWidth / Game.window_interface.innerHeight, 0.1, 1000);
			this.camera.name = this.name;
			this.camera.position.y = this.height;
			
			
			// three.js Raycaster
			
			/**
			 * The player's raycaster, to be re-used for all raycasting.
			 */
			this.raycaster = new THREE.Raycaster();
			
		}
		
	//#endregion
	
	
	//#region [Properties]
		
		/**
		 * A simplified version of the player for storage and communication.
		 */
		get simplified()
		{
			return {
				id: 		this.id,
				name: 		this.name,
				colour:		this.colour,
				position: 	{ x: parseFloat(this.position.x).toFixed(4), y: parseFloat(this.position.y).toFixed(4), z: parseFloat(this.position.z).toFixed(4) },
				rotation: 	{ x: parseFloat(this.rotation._x).toFixed(4), y: parseFloat(this.rotation._y).toFixed(4), z: parseFloat(this.rotation._z).toFixed(4) },
			};
		}
		set simplified(player)
		{
			this.id = player.id;
			this.name = player.name;
			this.colour = player.colour;
			this.position.set(player.position.x, player.position.y, player.position.z);
			this.rotation.set(player.position.x, player.rotation.y, player.rotation.z);
		}
		
		/**
		 * The player's position in the game world.
		 */
		get position()
		{
			return this.camera.position;
		}
		set position(new_position)
		{
			this.camera.position.set(new_position.x, new_position.y, new_position.z);
		}
		
		/**
		 * The player's rotation in the game world.
		 */
		get rotation()
		{
			return this.camera.rotation;
		}
		set rotation(new_rotation)
		{
			this.camera.rotation.set(new_rotation.x, new_rotation.y, new_rotation.z, new_rotation.order);
		}
		
		/**
		 * The player's quaternion in the game world.
		 */
		get quaternion()
		{
			return this.camera.quaternion;
		}
		set quaternion(new_quaternion)
		{
			this.camera.quaternion = new_quaternion;
		}
		
	//#endregion
	
	
	//#region [Event Handlers]
		
		/**
		 * Handles player left mouse down.
		 *
		 * @param {Event} event The event object passed by the event handler.
		 */
		handleLeftMouseDown(event)
		{
			
			// If the mouse is locked to the renderer...
			if (this.controls.mouse_locked)
			{
				
				// Prevent mouse from highlighting text
				event.preventDefault();
				
			}
			
		}
		
		/**
		 * Handles player left mouse up.
		 *
		 * @param {Event} event The event object passed by the event handler.
		 */
		handleLeftMouseUp(event)
		{
			
			// Do something.
			
		}
		
		/**
		 * Handles player right mouse down.
		 *
		 * @param {Event} event The event object passed by the event handler.
		 */
		handleRightMouseDown(event)
		{
			
			// Do something.
			
		}
		
		/**
		 * Handles player right mouse up.
		 *
		 * @param {Event} event The event object passed by the event handler.
		 */
		handleRightMouseUp(event)
		{
			
			// Do something.
			
		}
		
	//#endregion
	
	
	//#region [Methods]
		
		/**
		 * Updates the player in the game world (movement, collision detection, etc).
		 */
		update()
		{
			
			// If the player's post-initialization routine hasn't executed yet, and the game is either singleplayer, or multiplayer but not a dedicated server...
			if (!this.post_initialization && (!Multiplayer.enabled || (Multiplayer.enabled && Multiplayer.connection_type != Multiplayer.ConnectionTypes.DedicatedServer)))
			{
				
				// Flag the post-initialization routine as complete
				this.post_initialization = true;
				
				// Wait a moment and the initialize a player cylinder...
				setTimeout(() => {
					
					// Initialize player cylinder
					let cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2, 10, 1), new THREE.MeshBasicMaterial({ color: this.colour }));
					cylinder.name = this.name;
					cylinder.userData.ignore_collision = true;
					cylinder.userData.ignore_raycast = true;
					
					// Make player's own cylinder invisible for themselves
					if (this.id == Game.player.id)
					{
						cylinder.visible = false;
					}
					
					// Add player cylinder to camera
					this.camera.add(cylinder);
					
					// Add camera to game world
					Game.world.addObject(this.camera, false);
					
				}, 1000);
				
			}
			
			// Block any game players that aren't the current player from continuing the update routine...
			if (this.id != Game.player.id)
			{
				return;
			}
			
			// Player Movement
			
			// Get the direction the player is looking
			const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.quaternion);
			const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.quaternion);
			const backward = forward.clone().negate(); // Opposite of forward
			const left = right.clone().negate(); // Opposite of right
			
			// Update player direction based on movement keys
			this.direction.set(0, 0, 0);
			if (this.controls.player_moving_forward) this.direction.add(forward);
			if (this.controls.player_moving_backward) this.direction.add(backward);
			if (this.controls.player_moving_right) this.direction.add(right);
			if (this.controls.player_moving_left) this.direction.add(left);
			this.direction.normalize();
			
			// Update player velocity based on direction and speed (or noclip speed if it's enabled)
			this.velocity.x = this.direction.x * (this.noclip ? this.noclip_speed : this.speed);
			this.velocity.z = this.direction.z * (this.noclip ? this.noclip_speed : this.speed);
			
			
			// Player Steps/Stairs/Ramp Movement
			
			// Update player movement over steps/stairs/ramps in all movement directions
			if (!this.noclip)
			{
				if (this.controls.player_moving_forward) this.stepInDirection(forward);
				if (this.controls.player_moving_backward) this.stepInDirection(backward);
				if (this.controls.player_moving_right) this.stepInDirection(right);
				if (this.controls.player_moving_left) this.stepInDirection(left);
			}
			
			
			// Player Jumping
			
			// If noclip is enabled...
			if (this.noclip)
			{
				
				// Reset player jump velocity
				this.jump_velocity = 0;
				
				// If player is jumping...
				if (this.controls.player_jumping)
				{
					
					// Make the player fly upward
					this.jump_velocity = this.noclip_speed;
					
					
				} // Otherwise, if shift key is being pressed...
				else if (this.controls.modifier_shift_left_pressed)
				{
					
					// Make the player fly downward
					this.jump_velocity = -this.noclip_speed;
					
				}
				
				
			} // Otherwise, apply regular gravity...
			else
			{
				
				// If the player is already in the air over any world object, and noclip is disabled...
				if (this.position.y > (Game.world.detectObjectSurfaceBelowPlayer() + this.height))
				{
					
					// Make the player fall downward
					this.jump_velocity -= this.jump_gravity;
					
					
				} // Otherwise, if the player is not yet in the air...
				else
				{
					
					// Correct the player's y-axis position if it cuts into the ground...
					if (this.position.y < (Game.world.detectObjectSurfaceBelowPlayer() + this.height))
					{
						this.position.y = Game.world.detectObjectSurfaceBelowPlayer() + this.height;
					}
					
					// Reset player jump
					this.jump_velocity = 0;
					this.jumping = false;
					
					// If player is jumping...
					if (this.controls.player_jumping)
					{
						
						// Set player jumping flag and jump velocity
						this.jumping = true;
						this.jump_velocity = this.jump_height;
						
					}
					
				}
				
			}
			
			// Update the player's y-axis position accordingly, whether or not they're jumping
			this.position.y += this.jump_velocity;
			
			
			// Player Collision Detection
			
			// Get the player's intended position based on their current position, movement speed, and direction
			const intended_position = this.position.clone().add(this.velocity.clone());
			
			// Detect collision between the player's intended position and any collidable objects in the world
			if (!Game.world.detectPlayerCollision(intended_position) || this.noclip)
			{
				
				// If the game is multiplayer and the player has moved or is jumping...
				if (Multiplayer.enabled && (!this.position.equals(intended_position) || this.jumping))
				{
					
					// Send player update to server
					Multiplayer.sendPlayerUpdate();
					
				}
				
				// No collision was detected, move the player to the intended position
				this.position.copy(intended_position);
				
			}
			
			
			// World Object Movement (in direct relation to the player's movement)
			
			// Update billboard object rotations
			Game.world.updateBillboards(this);
			
			
			// Player Movement Cont'd
			
			// Track the player's last known position and rotation in the world
			Game.world.player_position = this.position;
			Game.world.player_rotation = this.rotation;
			
			// Reduce player's velocity (smooths player's movement)
			this.velocity.multiplyScalar(0.95);
			
		}
		
		/**
		 * Updates player movement over steps or stairs and ramps.
		 *
		 * @param {THREE.Vector3} direction The direction in which to check for steps/stairs/ramps to traverse.
		 */
		stepInDirection(direction)
		{
			
			// Get the position the player's feet, plus half a stair's height, to cast a ray from
			const player_feet_ray_position = new THREE.Vector3(this.position.x, (this.position.y - this.height) + (Game.world.stair_height / 2), this.position.z);
			
			// Cast a ray in the specified direction from the ray's calculated position
			this.raycaster.set(player_feet_ray_position, direction.clone().setY(0).normalize());
			this.raycaster.near = 0;
			this.raycaster.far = this.stair_check_distance;
			
			// Check intersections with all world objects
			const intersects = this.raycaster.intersectRaycastableObjects(Game.world.all_objects, true);
			if (intersects.length > 0)
			{
				
				// Get the first within the check distance
				const closest_intersection = intersects[0];
				const closest_object = closest_intersection.object;
				
				// Handle PlaneGeometry objects specifically, otherwise use a different method for all other objects
				if (closest_object.geometry instanceof THREE.PlaneGeometry)
				{
					
					// Calculate the difference in height between where the player's feet are and the closest object's height
					const height_difference = Game.world.detectPlaneSurfaceAtPoint(new THREE.Vector3(this.position.x, 0, this.position.z), closest_object) - (this.position.y - this.height);
					
					// If the height difference implies the object is a step or ramp, step the player up onto the object
					if (height_difference > 0 && height_difference <= Game.world.stair_height)
					{
						this.position.y += height_difference;
					}
					
				}
				else
				{
					
					// Get the closest object's position relative to the world
					const closest_object_position = new THREE.Vector3();
					closest_object.getWorldPosition(closest_object_position);
					
					// Get the closest object's height
					let closest_object_height = 0;
					if (closest_object.geometry.parameters && closest_object.geometry.parameters.height)
					{
						closest_object_height = closest_object.geometry.parameters.height;
					}
					else
					{
						closest_object.geometry.computeBoundingBox();
						
						const boundingBox = closest_object.geometry.boundingBox.clone();
						boundingBox.applyMatrix4(closest_object.matrixWorld);
						
						closest_object_height = boundingBox.max.y - boundingBox.min.y;
					}
					
					// Calculate the difference in height between where the player's feet are and the closest object's height
					const height_difference = (closest_object_position.y + (closest_object_height / 2)) - (this.position.y - this.height);
					
					// If the height difference implies the object is a step, step the player up onto the object...
					if (height_difference > 0 && height_difference <= Game.world.stair_height)
					{
						this.position.y += height_difference;
						
					} // Otherwise, if the height difference implies an obstruction, stop the player from moving...
					else if (height_difference > 0 && height_difference > Game.world.stair_height)
					{
						this.velocity.x = 0;
						this.velocity.z = 0;
					}
					
				}
				
			}
			
		}
		
	//#endregion
	
}
export default Player;