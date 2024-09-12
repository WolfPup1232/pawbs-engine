// three.js Import
import * as THREE from '../libraries/threejs/three.js';

/**
 * A billboard object in the game world, which is always oriented facing the player.
 */
class Billboard extends THREE.Mesh
{
	
	/**
	 * Initializes a new billboard for use in the game world.
	 *
	 * @param {width} float The billboard object's width.
	 * @param {height} float The billboard object's height.
	 * @param {texture} three.texture The billboard's texture. This is also explicitly the billboard's front-facing texture if side and rear textures are provided.
	 */
	constructor(width, height, texture, texture_back = null, texture_left = null, texture_right = null)
	{
		
		// Class Declarations/Initialization
		
		
		// Billboard Geometry
		
		// Initialize billboard geometry
		const billboard_geometry = new THREE.PlaneGeometry(width, height);
		
		
		// Billboard Material
		
		// Initialize billboard material
		const billboard_material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });
		
		
		// Parent Constructor
		
		// Call the billboard's parent class constructor (THREE.Mesh()) to initialize it
		super(billboard_geometry, billboard_material);
		
		
		// Billboard Textures
		
		// Initialize the billboard's textures
		this.texture = texture;
		this.texture_back = texture_back;
		this.texture_left = texture_left;
		this.texture_right = texture_right;
		
	}
	
}
export default Billboard;
