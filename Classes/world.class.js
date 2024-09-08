// three.js Import
import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';

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
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0x87CEEB);
		
		// World Skybox
		//const loader = new THREE.CubeTextureLoader();
		//const skybox = loader.load([
		//	'path/to/px.jpg', 'path/to/nx.jpg',
		//	'path/to/py.jpg', 'path/to/ny.jpg',
		//	'path/to/pz.jpg', 'path/to/nz.jpg'
		//]);
		//this.scene.background = skybox;
		
		// World Terrain
		this.terrain = [];
		
		// World Objects
		this.objects = [];
		
	}
	
	// Methods
	
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
	
	// Functions
	
	/**
	 * Detect collision between the player object and any collidable objects in the world.
	 *
	 * @param {player} player The player object to be tested for collision with world objects.
	 * @param {three.vector3} intended_position The player object's intended position.
	 * @return {boolean} Boolean value indicating whether player collision was detected.
	 */
	detectPlayerCollision(player, intended_position)
	{
		
		// Create player bounds box
		let player_box = new THREE.Box3();
		player_box.setFromCenterAndSize(intended_position, new THREE.Vector3(1, player.height, 1));
		
		// Iterate through each world object and check for collision
		// TODO: So far this checks every single object in a world which is uhh...inefficient.
		let collision_detected = false;
		for (let i = 0; i < this.objects.length; i++)
		{
			
			// Create world object bounds box
			let object_box = new THREE.Box3().setFromObject(this.objects[i]);
			
			// Check for player/object intersection
			if (player_box.intersectsBox(object_box))
			{
				collision_detected = true;
			}
			
		}

		// Return whether player collision was detected
		return collision_detected;
		
	}
	
}
export default World;
