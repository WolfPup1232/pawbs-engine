// three.js Import
import * as THREE from '../libraries/threejs/three.js';

/**
 * A utilities class that holds methods and functions that didn't really organize nicely anywhere else.
 */
class Utilities
{
    
    
    // Methods
	
    /**
    * Load Textures - Initializes game textures according to the list of textures in the textures.json file.
    */
    loadTextures(texture_paths, textures, callback)
    {
        
        let count = 0;
        
        // Initialize texture loader
        let texture_loader = new THREE.TextureLoader();
        
        // Get all keys (texture names) from the list of texture paths
        const texture_keys = Object.keys(texture_paths);
        
        // Load each texture
        texture_keys.forEach((key) => {
            texture_loader.load(texture_paths[key], (texture) => {
                
                // Store each loaded texture by name
                textures[key] = texture;
                
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
export default Utilities;