// Static Class Imports
import Game from './game.class.js';

/**
* The in-game debugger.
*/
class Debug
{
	
	//#region [Class Declarations]
		
		/**
		 * Enable/disable debugger.
		 */
		static enabled = false;
		
	//#endregion
	
	
	//#region [Constructor]
		
		/**
		 * Initializes the in-game debugger.
		 */
		static { }
		
	//#endregion
	
	
	//#region [Methods]
		
		/**
		 * Toggle debugger on/off.
		 */
		static toggle()
		{
			
			// Toggle debugger
			if (this.enabled)
			{
				
				// Hide debugger UI
				Game.ui.debugger.hide();
				
				// Disable debugger
				this.enabled = false;
				
			}
			else
			{
				
				// Enable debugger
				this.enabled = true;
				
				// Show debugger UI
				Game.ui.debugger.show();
				
			}
			
		}
		
		/**
		 * Handles debugger processes that update every frame.
		 */
		static update()
		{
			
			// Handle debugger UI output
			this.output();
			
		}
		
		/**
		 * Handles debugger UI output.
		 */
		static output()
		{
			
			// Output debug info to UI
			Game.ui.debugger.output("player.position.x    = " + Game.player.position.x + "<br />" + 
									"player.position.y    = " + Game.player.position.y + "<br />" + 
									"player.position.z    = " + Game.player.position.z + "<br />" + 
									"player.controls.mouse_left_down    = " + Game.player.controls.mouse_left_down + "<br />" + 
									"player.controls.mouse_dragging     = " + Game.player.controls.mouse_dragging + "<br />" +
									"player.controls.transform_controls.dragging    = " + Game.player.controls.transform_controls.dragging + "<br />");
			
		}
		
		/**
		 * Outputs a neatly formatted THREE.Vector3 variable to the console.
		 *
		 * @param {THREE.Vector3} vector The variable to output.
		 */
		static outputVector3(vector)
		{
			
			// Output vector
			console.log("| " + vector.x.toFixed(3) + " " + vector.y.toFixed(3) + " " + vector.z.toFixed(3) + " |");
			
		}
		
		/**
		 * Outputs a neatly formatted THREE.Matrix4 variable to the console.
		 *
		 * @param {THREE.Matrix4} matrix The variable to output.
		 */
		static outputMatrix4(matrix)
		{
			
			// Get matrix elements
			const elements = matrix.elements;
			
			// Output matrix elements into standard 4x4 matrix format
			console.log("| " + elements[0].toFixed(3) + " " + elements[4].toFixed(3) + " " + elements[8].toFixed(3)  + " " + elements[12].toFixed(3) + " |\n" +
						"| " + elements[1].toFixed(3) + " " + elements[5].toFixed(3) + " " + elements[9].toFixed(3)  + " " + elements[13].toFixed(3) + " |\n" +
						"| " + elements[2].toFixed(3) + " " + elements[6].toFixed(3) + " " + elements[10].toFixed(3) + " " + elements[14].toFixed(3) + " |\n" +
						"| " + elements[3].toFixed(3) + " " + elements[7].toFixed(3) + " " + elements[11].toFixed(3) + " " + elements[15].toFixed(3) + " |");
			
		}
		
	//#endregion
	
}
export default Debug;