// three.js Import
import * as THREE from 'https://cdn.jsdelivr.net/gh/WolfPup1232/paws-engine/src/libraries/threejs/three.js';

// Class Imports
import Billboard from 'https://cdn.jsdelivr.net/gh/WolfPup1232/paws-engine/src/billboard.class.js';

/**
 * A game world containing a scene which can be rendered, in which objects can be placed and the player can navigate.
 */
class World
{
	
	/**
	 * Initializes a new game world.
	 */
	constructor()
	{
		
		// Class Declarations/Initialization
		
		
		// three.js Scene
		
		// Initialize the scene, which is really just the world itself, which contains objects and stuff
		this.scene = new THREE.Scene();
		
		
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
		
		
		// World attributes
		this.name = "";
		this.player_position = new THREE.Vector3(0, 0, 0)
		
		
		// World Terrain
		
		// Initialize an array to hold terrain objects
		this.terrain = [];
		
		
		// World Objects
		
		// Initialize an array to hold all other objects
		this.objects = [];
		
		
		// Steps/Stairs/Ramps
		
		// The maximum height an object which can be considered a traversible stair
		this.stair_height = 0.75;
		
	}
	
	
	// Serialization
	
	/**
	 * Custom JSON serialization method to prevent unwanted class variables from being saved when exporting the class to JSON using JSON.stringify().
	 *
	 * @return {world} A simplified version of the world with some attributes removed.
	 */
	toJSON()
	{
		return {
			name: this.name,
			player_position: this.player_position,
			terrain: this.terrain.map(mesh => mesh.toJSON()),
			objects: this.objects.map(mesh => mesh.toJSON())
		};
	}
	
	
	// Properties
	
	/**
	 * All game world objects including terrain.
	 */
	get all_objects()
	{
		let all_objects = [];
		
		all_objects = all_objects.concat(this.objects);
		all_objects = all_objects.concat(this.terrain);
		
		return all_objects;
	}
	
	
	// Methods
	
	/**
	 * Loads a world from a JSON file path.
	 *
	 * @param {string} path The file path of the JSON file to load.
	 */
	load(path)
	{
		
		// Get a reference to this world to pass into the file load callback
		let self = this;
		
		// Fetch the JSON file from the specified file path
		fetch(path).then(response => {
		
			// Error fetching world
			if (!response.ok)
			{
				throw new Error('Error fetching world.');
			}
			
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
		
	}
	
	/**
	 * Loads a world from a JSON object.
	 *
	 * @param {object} path The JSON object to load.
	 */
	loadFromJSON(json)
	{
		
		// Initialize a three.js object loader to convert JSON objects to valid three.js objects
		let loader = new THREE.ObjectLoader();
		
		// Initialize a new world
		let world = new World();
		
		// Get world properties
		world.name = json.name;
		world.player_position = new THREE.Vector3(json.player_position.x, json.player_position.y, json.player_position.z);
		
		// Get world objects and terrain
		world.terrain = json.terrain.map(meshJSON => {
			return loader.parse(meshJSON);
		});
		world.objects = json.objects.map(meshJSON => {
			return loader.parse(meshJSON);
		});
		
		// Add all world objects to the scene
		for (let i = 0; i < world.all_objects.length; i++)
		{
			world.scene.add(world.all_objects[i]);
		}
		
		// Replace current world with new world
		Object.assign(this, world);
		
	}
	
	/**
	 * Adds a terrain object to world.
	 *
	 * @param {object} object The terrain object to be added to the world.
	 */
	addTerrain(object)
	{
		
		// Add terrain object to terrain array
		this.terrain.push(object);
		
		// Add terrain object to scene
		this.scene.add(object);
		
	}
	
	/**
	 * Adds an object to the world.
	 *
	 * @param {object} object The object to be added to the world.
	 */
	addObject(object)
	{
		
		// Add object to object array
		this.objects.push(object);
		
		// Add object to scene
		this.scene.add(object);
		
	}
	
	/**
	 * Removed all objects from the world.
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
	 *
	 * @param {player} player The player which the billboard objects will be facing.
	 */
	updateBillboards(player)
	{
		
		// Iterate through each world object to update only billboard objects
		for (let i = 0; i < this.objects.length; i++)
		{
			if (this.objects[i] instanceof Billboard)
			{
				
				// Get the current billboard
				let billboard = this.objects[i];
				
				// Get the billboard's position
				const billboard_position = new THREE.Vector3();
				billboard.getWorldPosition(billboard_position);
				
				// Get the billboard's direction
				const billboard_direction = billboard_position.sub(player.camera.position).normalize();
				
				// Get the player's direction
				const player_direction = new THREE.Vector3();
				player.camera.getWorldDirection(player_direction);
				
				// Rotate the billboard to look at the player
				billboard.lookAt(player.camera.position);
				
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
	
	
	// Functions
	
	/**
	 * Detect collision between the player and any collidable objects in the world.
	 *
	 * @param {player} player The player to be tested for collision with world objects.
	 * @param {three.vector3} intended_position The player's intended position.
	 * @return {boolean} Boolean value indicating whether player collision was detected.
	 */
	detectPlayerCollision(player, intended_position)
	{
		
		let collision_detected = false;
		
		// Create the player's bounding box
		let player_box = new THREE.Box3();
		player_box.setFromCenterAndSize(new THREE.Vector3(intended_position.x, intended_position.y - (player.height / 2), intended_position.z), new THREE.Vector3(1, player.height, 1));
		
		// Iterate through all objects in the world looking for collision
		//
		// 	NOTE: Iterating through each object in the entire is probably inefficient as hell. We cant use raycasting because it only checks
		//		  one single point at a time, and we kinda need to check if the player's whole 3D volume collides with anything, not just like,
		//		  their feet or something. The only way to make this more efficient would be to somehow narrow down the size of this.objects to
		//		  whatever's in some kinda range of the player? But just the act of doing that would take more processing time? Idk.
		for (let i = 0; i < this.objects.length; i++)
		{
			
			// Create world object's bounding box
			let object_box = new THREE.Box3().setFromObject(this.objects[i]);
			
			// Detect billboard collision
			if (this.objects[i] instanceof Billboard)
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
					continue;
				}
				
				// If object is above the player's vertical space...
				if (object_box.min.y > player_box.max.y)
				{
					// Player is walking under the object
					continue;
				}
				
				// If object is too tall to be a step/stair...
				if (object_box.max.y > (player_box.min.y + this.stair_height))
				{
					// Player collides with object
					collision_detected = true;
				}
				
			}
			
		}
		
		return collision_detected;
		
	}
	
	/**
	 * Detect the y-axis position of the surface of whichever object is directly below the player.
	 *
	 * @param {player} player The player to look for other objects beneath.
	 * @return {float} The y-axis value representing the surface height of the object directly below the player.
	 */
	detectObjectSurfaceBelowPlayer(player)
	{
		
		// Initialize the downward direction in which to look
		const direction = new THREE.Vector3(0, -1, 0);
		
		// Cast a ray downward from the player's position
		player.raycaster.set(player.position, direction);
		player.raycaster.near = 0;
		player.raycaster.far = Infinity;
		
		// Initialize the detected object's surface height to default to the player's position
		let object_surface_height = player.position.y - player.height;
		
		// Check intersections with all world objects
		const intersects = player.raycaster.intersectObjects(this.all_objects);
		if (intersects.length > 0)
		{
			
			// Get the first object directly below the player
			const closest_intersection = intersects[0];
			const closest_object = closest_intersection.object;
			
			// Detect PlaneGeometry objects specifically, otherwise just use the object's intersection point
			if (closest_object.geometry instanceof THREE.PlaneGeometry)
			{
				
				// Get the y-axis value of the plane's surface
				object_surface_height = this.detectPlaneSurfaceAtPoint(new THREE.Vector3(player.position.x, 0, player.position.z), closest_object);
				
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
	 * Detect the y-axis position of a point on the surface of a PlaneGeometry object, accounting for rotation, using crazy ass math that I still don't understand.
	 *
	 * @param {point} three.vector3 The point on the surface of the PlaneGeometry at which to detect the surface's height.
	 * @param {plane} three.planegeometry The PlaneGeometry object on which to detect the provided point's surface height.
	 * @return {float} The y-axis value representing the surface height at the specified point on the provided PlaneGeometry object.
	 */
	detectPlaneSurfaceAtPoint(point, plane)
	{
		
		// I don't know what the hell this is or why the plane's rotation is being applied to it
		const normal = new THREE.Vector3(0, 0, 1);
		normal.applyQuaternion(plane.quaternion);
		
		// Okay this is for sure the plane's position
		const plane_position = plane.position.clone();
		
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
	
}
export default World;