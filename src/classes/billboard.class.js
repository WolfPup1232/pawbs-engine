// three.js Imports
import * as THREE from '../libraries/threejs/three.js';

/**
 * A billboard object in the game world, which is always oriented facing the player.
 */
class Billboard extends THREE.Mesh
{
	
	//#region [Class Declarations / Constructor]
		
		/**
		 * Initializes a new billboard for use in the game world.
		 *
		 * @param {float} width The billboard object's width.
		 * @param {float} height The billboard object's height.
		 * @param {THREE.Texture} texture The billboard's texture. This is also explicitly the billboard's front-facing texture if side and rear textures are provided.
		 * @param {THREE.Texture} texture_back The billboard's back-facing texture.
		 * @param {THREE.Texture} texture_left The billboard's left-facing texture.
		 * @param {THREE.Texture} texture_right The billboard's right-facing texture.
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
			
			// Call the billboard's parent class (THREE.Mesh) constructor to finish initializing it
			super(billboard_geometry, billboard_material);
			
			
			// Billboard Properties
			
			// Specify the mesh type for three.js
			this.type = 'Billboard';
			
			
			// Billboard Textures
			
			// Initialize the billboard's textures
			this.texture = texture;
			this.texture_back = texture_back;
			this.texture_left = texture_left;
			this.texture_right = texture_right;
			
		}
		
	//#endregion
	
	
	//#region [Serialization]
		
		/**
		 * Custom JSON serialization method.
		 */
		toJSON(meta)
		{
			// Call parent class serialization method
			const data = super.toJSON(meta);
			
			// Set object type
			data.object.type = 'Billboard';
			
			// Include custom properties
			// data.object.customProperty = this.customProperty;
			// data.object.texture = this.texture;
			// data.object.texture_back = this.texture_back;
			// data.object.texture_left = this.texture_left;
			// data.object.texture_right = this.texture_right;
			
			// Return JSON
			return data;
			
		}
		
	//#endregion
	
}
export default Billboard;