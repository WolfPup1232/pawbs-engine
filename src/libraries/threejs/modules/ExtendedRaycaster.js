// three.js Imports
import * as THREE from '../three.js';

// Static Class Imports
import Game from '../../../classes/game.class.js';

/**
 * Extends the three.js Raycaster class with new functions.
 */
export default function initializeRaycasterExtension()
{
	
	//#region [Functions]
		
		// Add a function to the Raycaster type which raycasts only objects which are not flagged to be skipped by the raycaster
		THREE.Raycaster.prototype.intersectRaycastableObjects = function(objects, recursive = false, intersects = [])
		{
			
			// Iterate through the specified list of objects...
			for (let i = 0; i < objects.length; i++)
			{
				let object = objects[i];
				
				// Make sure the object is on the same layers as the raycaster...
				if (object.layers.test(Game.player.raycaster.layers))
				{
					
					// Skip raycasting flagged objects
					let skip_raycast = false;
					if (object.userData && object.userData.ignore_raycast)
					{
						skip_raycast = true;
					}
					
					// Raycast unflagged objects
					if (!skip_raycast)
					{
						object.raycast(Game.player.raycaster, intersects);
					}
					
				}
				
				// If flagged as recursive, call this function for object's children
				if (recursive)
				{
					Game.player.raycaster.intersectRaycastableObjects(object.children, true, intersects);
				}
			}
			
			// Sort list of intersected objects by distance
			intersects.sort(function(a, b) { return a.distance - b.distance; });
			
			// Return list of intersected objects
			return intersects;
			
		};
		
	//#endregion
	
}