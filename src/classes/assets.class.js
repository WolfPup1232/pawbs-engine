// three.js Imports
import * as THREE from '../libraries/threejs/three.js';

/**
 * A collection of in-game assets.
 */
class Assets
{
    
	// Class Declarations
	
	// The list of textures loaded by the game
	static textures = {};
    
    
    // Constructor
	
	/**
	 * Initializes the collection of in-game assets.
	 */
	static
	{
		
		// Do nothing.
		
	}
    
    
    // Methods
    
    /**
    * Initializes game textures list according to the list of textures in the textures.json file.
    */
    static loadTextures(texture_paths, callback)
    {
        
        let count = 0;
        
        // Initialize texture loader
        let texture_loader = new THREE.TextureLoader();
        
        // Get all keys (texture names) from the list of texture paths
        const texture_keys = Object.keys(texture_paths);
        
        // Load each texture
        texture_keys.forEach((key) => {
            texture_loader.load(texture_paths[key], (texture) => {
                
                // Add texture path to loaded texture
                texture.path = texture_paths[key];
                
                // Store loaded texture by name
                this.textures[key] = texture;
                
                // Increment the texture count to check if all textures are loaded
                count++;
                if (count === texture_keys.length)
                {
                    
                    // All textures are loaded, now perform the next step using the callback function
                    callback();
                    
                }
            },
            undefined, // No onProgress callback
            (error) => {
                
                // Error loading texture
                console.error("Error loading texture: ", error);
                
            });
            
        });
        
    }
    
}
export default Assets;