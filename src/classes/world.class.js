// three.js Imports
import * as THREE from '../libraries/threejs/three.js';
import { CustomObjectLoader } from '../libraries/threejs/modules/CustomObjectLoader.js';

// Class Imports
import Billboard from './billboard.class.js';

// Static Class Imports
import Game from './game.class.js';
import Multiplayer from './multiplayer.class.js';

/**
 * A game world containing a scene which can be rendered, in which objects can be placed and the player can navigate.
 */
class World
{
	
	//#region [Class Declarations / Constructor]
		
		/**
		 * Initializes a new game world.
		 */
		constructor()
		{
			
			// Class Declarations/Initialization
			
			
			// three.js Scene
			
			/**
			 * The game's scene, which is really just the world itself, and contains objects and stuff.
			 */
			this.scene = new THREE.Scene();
			
			
			// World Attributes
			
			/**
			 * The name of the game world.
			 */
			this.name = "";
			
			/**
			 * The player's position within the game world.
			 */
			this.player_position = new THREE.Vector3(0, 0, 0);
			
			/**
			 * The player's rotation within the game world.
			 */
			this.player_rotation = new THREE.Euler(0, 0, 0, 'XYZ');
			
			
			// World Objects
			
			/**
			 * The list of all objects in the game world.
			 */
			this.objects = [];
			
			/**
			 * The list of all terrain objects in the game world.
			 */
			this.terrain = [];
			
			
			// Steps/Stairs/Ramps
			
			/**
			 * The maximum height an object which can be considered a traversible stair.
			 */
			this.stair_height = 0.75;
			
			
			// World Skybox
			
			// Set the world's skybox to a solid colour
			this.scene.background = new THREE.Color(0x87CEEB);
			
			// Set the world's skybox to a texture (not using for now)
			//const loader = new THREE.CubeTextureLoader();
			//const skybox = loader.load([
			//	'path/to/px.jpg', 'path/to/nx.jpg',
			//	'path/to/py.jpg', 'path/to/ny.jpg',
			//	'path/to/pz.jpg', 'path/to/nz.jpg'
			//]);
			//this.scene.background = skybox;
			
		}
		
	//#endregion
	
	
	//#region [Properties]
		
		/**
		 * Get array of world objects.
		 */
		get all_objects()
		{
			
			// Initialize array to hold all world objects
			let all_objects = [];
			
			// Get all world objects
			all_objects = all_objects.concat(this.terrain);
			all_objects = all_objects.concat(this.objects);
			
			// Return all world objects
			return all_objects;
			
		}
		
	//#endregion
	
	
	//#region [Serialization]
		
		/**
		 * Custom JSON serialization method to add additional class variables and prevent unwanted class variables from being saved when exporting the class to JSON using JSON.stringify().
		 *
		 * @return {World} A simplified version of the world with some attributes added and some removed.
		 */
		toJSON()
		{
			return {
				name: this.name,
				player_position: this.player_position,
				player_rotation: this.player_rotation,
				terrain: this.terrain.map(mesh => {
					const mesh_json = mesh.toJSON();
					
					mesh_json.position = mesh.position.toArray();
					mesh_json.rotation = {
						x: mesh.rotation.x,
						y: mesh.rotation.y,
						z: mesh.rotation.z,
						order: mesh.rotation.order,
					};
					mesh_json.scale = mesh.scale.toArray();
					
					if (mesh_json.userData)
					{
						mesh_json.userData.ignore_raycast = mesh.userData.ignore_raycast;
					}
					
					return mesh_json;
				}),
				objects: this.objects.map(mesh => {
					const mesh_json = mesh.toJSON();
					
					mesh_json.position = mesh.position.toArray();
					mesh_json.rotation = {
						x: mesh.rotation.x,
						y: mesh.rotation.y,
						z: mesh.rotation.z,
						order: mesh.rotation.order,
					};
					mesh_json.scale = mesh.scale.toArray();
					
					if (mesh_json.userData)
					{
						mesh_json.userData.ignore_raycast = mesh.userData.ignore_raycast;
					}
					
					return mesh_json;
				}),
			};
		}
		
	//#endregion
	
	
	//#region [Methods]
		
		/**
		 * Loads a world from a JSON file path.
		 *
		 * @param {string} path The file path of the JSON file to load.
		 */
		load(path)
		{
			
			// Get a reference to this world to pass into the file load callback
			let self = this;
			
			// If the game is either singleplayer, or if it's multiplayer but *not* a dedicated server...
			if (!Multiplayer.enabled || (Multiplayer.enabled && Multiplayer.connection_type != Multiplayer.ConnectionTypes.DedicatedServer))
			{
				
				// Fetch the JSON file from the specified file path
				fetch(Game.settings.path_root + path).then(response => {
				
					// Error fetching world
					if (!response.ok)
					{
						throw new Error('Error fetching world.');
					}
					
					// World loaded successfully
					return response.json();
					
				})
				.then(json => {
					
					try
					{
						
						// Load world from JSON object
						self.loadFromJSON(json);
						
					}
					catch (error)
					{
						
						// Error loading world
						console.error("Error loading world: ", error);
						
					}
					
				})
				.catch(error => {
					
					// Error fetching world
					console.error("Error fetching world: ", error);
					
				});
				
				
			} // Otherwise, if the game is multiplayer and a dedicated server...
			else
			{
				
				// Fetch the JSON file from the specified file path				
				Game.file_system.promises.readFile(Game.settings.path_root + path, Game.settings.default_file_encoding).then((response) => JSON.parse(response)).then((world) => {
					
					// World loaded successfully
					return world;
					
				})
				.then(json => {
					
					try
					{
						
						// Load world from JSON object
						self.loadFromJSON(json);
						
					}
					catch (error)
					{
						
						// Error loading world
						console.error("Error loading world: ", error);
						
					}
					
				})
				.catch(error => {
					
					// Error fetching world
					console.error("Error fetching world:", error);
					
				});
				
			}
			
		}
		
		/**
		 * Loads a world from a JSON object.
		 *
		 * @param {THREE.Object3D} json The JSON object to load.
		 */
		loadFromJSON(json)
		{
			
			// Initialize a three.js object loader to convert JSON objects to valid three.js objects
			let loader = new CustomObjectLoader();
			
			// Initialize a new world
			let world = new World();
			
			// Get world properties
			if (json.name)
			{
				world.name = json.name;
			}
			if (json.player_position)
			{
				world.player_position = new THREE.Vector3(json.player_position.x, json.player_position.y, json.player_position.z);
			}
			if (json.player_rotation)
			{
				world.player_rotation = new THREE.Euler(json.player_rotation._x, json.player_rotation._y, json.player_rotation._z, json.player_rotation._order);
			}
			
			// Get world terrain and apply transformations
			if (json.terrain)
			{
				world.terrain = json.terrain.map(mesh_json => {
					let mesh = loader.parse(mesh_json);
					
					// Get terrain transformations
					if (mesh_json.position)
					{
						mesh.position.fromArray(mesh_json.position);
					}
					if (mesh_json.rotation)
					{
						mesh.rotation.set(mesh_json.rotation.x, mesh_json.rotation.y, mesh_json.rotation.z, mesh_json.rotation.order);
					}
					if (mesh_json.scale)
					{
						mesh.scale.fromArray(mesh_json.scale);
					}
					
					// Get terrain flags
					if (mesh_json.userData && mesh_json.userData.ignore_raycast)
					{
						mesh.userData.ignore_raycast = mesh_json.userData.ignore_raycast;
					}
					else
					{
						mesh.userData.ignore_raycast = false;
					}
			
					mesh.updateMatrix();
					return mesh;
				});
			}
			
			// Get world objects and apply transformations
			if (json.objects)
			{
				world.objects = json.objects.map(mesh_json => {
					let mesh = loader.parse(mesh_json);
					
					// Get object transformations
					if (mesh_json.position)
					{
						mesh.position.fromArray(mesh_json.position);
					}
					if (mesh_json.rotation)
					{
						mesh.rotation.set(mesh_json.rotation.x, mesh_json.rotation.y, mesh_json.rotation.z, mesh_json.rotation.order);
					}
					if (mesh_json.scale)
					{
						mesh.scale.fromArray(mesh_json.scale);
					}
					
					// Get object flags
					if (mesh_json.userData && mesh_json.userData.ignore_raycast)
					{
						mesh.userData.ignore_raycast = mesh_json.userData.ignore_raycast;
					}
					else
					{
						mesh.userData.ignore_raycast = false;
					}
					
					mesh.updateMatrix();
					return mesh;
				});
			}
			
			// Add all world terrain to the scene
			for (let i = 0; i < world.terrain.length; i++)
			{
				world.terrain[i].updateMatrix();
				world.scene.add(world.terrain[i]);
			}
			
			// Add all world objects to the scene
			for (let i = 0; i < world.objects.length; i++)
			{
				world.objects[i].updateMatrix();
				world.scene.add(world.objects[i]);
			}
			
			// Replace current world with new world
			Object.assign(this, world);
			
		}
		
		/**
		 * Adds an object to the world.
		 *
		 * @param {THREE.Object3D} object The object to be added to the world.
		 */
		addObject(object)
		{
			
			// Add object to objects array
			this.objects.push(object);
			
			// Add object to scene
			this.scene.add(object);
			
		}
		
		/**
		 * Adds a terrain object to world.
		 *
		 * @param {THREE.Object3D} object The terrain object to be added to the world.
		 */
		addTerrain(object)
		{
			
			// Add terrain object to terrain array
			this.terrain.push(object);
			
			// Add terrain object to scene
			this.scene.add(object);
			
		}
		
		/**
		 * Removes an object from the world.
		 *
		 * @param {THREE.Object3D} object The object to be removed from the world.
		 */
		removeObject(object)
		{
			
			// Get object's index from object array
			let index = this.objects.indexOf(object);
			
			// Remove object from object array
			if (index > -1)
			{
				this.objects.splice(index, 1);
			}
			
			// Remove object from scene
			this.scene.remove(object);
			
		}
		
		/**
		 * Removes a terrain object from the world.
		 *
		 * @param {THREE.Object3D} object The terrain object to be removed from the world.
		 */
		removeTerrain(object)
		{
			
			// Get object's index from terrain array
			let index = this.terrain.indexOf(object);
			
			// Remove object from terrain array
			if (index > -1)
			{
				this.terrain.splice(index, 1);
			}
			
			// Remove terrain object from scene
			this.scene.remove(object);
			
		}
		
		/**
		 * Removed all objects and terrain from the world.
		 */
		removeAllObjects()
		{
			
			// Remove all objects from the world
			for (let i = this.scene.children.length - 1; i >= 0; i--)
			{ 
				this.scene.remove(this.scene.children[i]); 
			}
			
			// Reset object arrays
			this.objects = [];
			this.terrain = [];
			
		}
		
		/**
		 * Updates rotating billboard objects so that they're always facing the player.
		 */
		updateBillboards()
		{
			
			// Iterate through each world object to update only billboard objects
			let all_objects = this.all_objects;
			for (let i = 0; i < all_objects.length; i++)
			{
				if (all_objects[i] instanceof Billboard)
				{
					
					// Get the current billboard
					let billboard = all_objects[i];
					
					// Get the billboard's position
					const billboard_position = new THREE.Vector3();
					billboard.getWorldPosition(billboard_position);
					
					// Get the billboard's direction
					const billboard_direction = billboard_position.sub(Game.player.camera.position).normalize();
					
					// Get the player's direction
					const player_direction = new THREE.Vector3();
					Game.player.camera.getWorldDirection(player_direction);
					
					// Rotate the billboard to look at the player
					billboard.lookAt(Game.player.camera.position);
					
					// Get the angle between the player's direction and the billboard's direction
					const angle = player_direction.angleTo(billboard_direction);
					
					// Get the cross product of the player and billboard direction (the vector that is at right angles to both) to determine if the player is on the left or right side
					const cross_product = new THREE.Vector3();
					cross_product.crossVectors(player_direction, billboard_direction);
					
					// Adjust the texture based on the angle and the cross product (whether the player is on the left or right side)
					if (angle < Math.PI / 4)
					{
						
						// Front view (uses default texture)
						billboard.material.map = billboard.texture;
						
					}
					else if (billboard.texture_back != null && angle > 3 * Math.PI / 4)
					{
						
						// Back view
						billboard.material.map = billboard.texture_back;
						
					}
					else
					{
						
						if (billboard.texture_left != null && cross_product.y > 0)
						{
							
							// Left side
							billboard.material.map = billboard.texture_left;
							
						}
						else if (billboard.texture_right != null)
						{
							
							// Right side
							billboard.material.map = billboard.texture_right;
							
						}
						
					}
					
					// Update the billboard's material
					billboard.material.needsUpdate = true;
					
				}
			}
			
		}
		
	//#endregion
	
	
	//#region [Functions]
		
		/**
		 * Detect collision between the player and any collidable objects in the world.
		 *
		 * @param {THREE.Vector3} intended_position The player's intended position.
		 * @return {boolean} Boolean value indicating whether player collision was detected.
		 */
		detectPlayerCollision(intended_position)
		{
			
			// Initialize collision detected flag
			let collision_detected = false;
			
			// Create the player's bounding box
			let player_box = new THREE.Box3();
			player_box.setFromCenterAndSize(new THREE.Vector3(intended_position.x, intended_position.y - (Game.player.height / 2), intended_position.z), new THREE.Vector3(1, Game.player.height, 1));
			
			// Iterate through all objects in the world looking for collision
			let all_objects = this.objects;
			for (let i = 0; i < all_objects.length; i++)
			{
				all_objects[i].traverse((child) => {
					if (child.isMesh)
					{
						
						// Check for object flag determining whether or not to skip collision detection...
						let skip = false;
						if (child.userData && child.userData.ignore_collision)
						{
							skip = true;
						}
						
						// If collision detection is not being skipped...
						if (!skip)
						{
							
							// Create world object's bounding box
							let object_box = new THREE.Box3().setFromObject(child);
							
							// Detect billboard collision
							if (all_objects[i] instanceof Billboard)
							{
								
								// Add some extra height to billboard bounding boxes
								//
								//	NOTE: I gave up trying to keep billboards perfectly upright
								//		  on their own, so screw it, this is my workaround.
								object_box.max.y += 5;
								
							}
							
							// Check for intersection between player and object
							if (player_box.intersectsBox(object_box))
							{
								
								// If object is below the player's vertical space...
								if (object_box.max.y <= player_box.min.y)
								{
									// Player is walking above the object
									skip = true;
								}
								
								// If object is above the player's vertical space...
								if (!skip && object_box.min.y > player_box.max.y)
								{
									// Player is walking under the object
									skip = true;
								}
								
								// If object is too tall to be a step/stair...
								if (!skip && object_box.max.y > (player_box.min.y + this.stair_height))
								{
									// Player collides with object
									collision_detected = true;
								}
								
							}
							
						}
						
					}
				});
			}
			
			// Return collision detected flag
			return collision_detected;
			
		}
		
		/**
		 * Detect the y-axis position of the surface of whichever object is directly below the player.
		 *
		 * @return {float} The y-axis value representing the surface height of the object directly below the player.
		 */
		detectObjectSurfaceBelowPlayer()
		{
			
			// Initialize the downward direction in which to look
			const direction = new THREE.Vector3(0, -1, 0);
			
			// Cast a ray downward from the player's position
			Game.player.raycaster.set(Game.player.position, direction);
			Game.player.raycaster.near = 0;
			Game.player.raycaster.far = Infinity;
			
			// Initialize the detected object's surface height to default to the player's position
			let object_surface_height = Game.player.position.y - Game.player.height;
			
			// Check intersections with all world objects
			const intersects = Game.player.raycaster.intersectRaycastableObjects(this.all_objects, true);
			if (intersects.length > 0)
			{
				
				// Get the first object directly below the player
				const closest_intersection = intersects[0];
				const closest_object = closest_intersection.object;
				
				// Detect PlaneGeometry objects specifically, otherwise just use the object's intersection point
				if (closest_object.geometry instanceof THREE.PlaneGeometry)
				{
					
					// Get the y-axis value of the plane's surface
					object_surface_height = this.detectPlaneSurfaceAtPoint(new THREE.Vector3(Game.player.position.x, 0, Game.player.position.z), closest_object);
					
				}
				else
				{
					
					// Get the y-axis value the object's surface using the raycast's intersection point
					object_surface_height = closest_intersection.point.y;
				
				}
			}
			
			return object_surface_height;
			
		}
		
		/**
		 * Detect the y-axis position of a point on the surface of a plane, accounting for rotation, using crazy ass math that I still don't understand.
		 *
		 * @param {THREE.Vector3} point The point on the surface of the PlaneGeometry at which to detect the surface's height.
		 * @param {THREE.Object3D} plane The plane on which to detect the provided point's surface height.
		 * @return {float} The y-axis value representing the surface height at the specified point on the provided plane.
		 */
		detectPlaneSurfaceAtPoint(point, plane)
		{
			
			// I don't know what the hell a normal is
			const normal = new THREE.Vector3(0, 0, 1);
			normal.applyQuaternion(plane.quaternion);
			
			// Okay this is for sure the plane's position
			const plane_position = new THREE.Vector3();
			plane.getWorldPosition(plane_position);
			
			// I have no idea what the hell these are but I saw them in an equation online
			const D = -normal.dot(plane_position);
			const A = normal.x;
			const B = normal.y;
			const C = normal.z;
			
			// Alright so these are definitely the x-axis and z-axis values of the point we're checking
			const x = point.x;
			const z = point.z;
			
			// Hell if I know what's happening here ¯\_(ツ)_/¯
			const y = -(A * x + C * z + D) / B;
			
			// This function works really well though
			return y;
			
		}
		
	//#endregion
	
}
export default World;