/**
* The in-game debugger.
*/
class Debug
{
	
	// Class Declarations
	
	// Enable/disable debugger
	static enabled = false;
	
	
	// Constructor
	
	/**
	* Initializes the in-game debugger.
	*/
	static
	{
		
		// Do nothing.
		
	}
	
	
	// Methods
	
	/**
	* Toggle debugger on/off.
	*/
	static toggle()
	{
		
		// Toggle debugger
		if (this.enabled)
		{
			
			// Hide debugger UI
			$("#debug").hide();
			
			// Disable debugger
			this.enabled = false;
			
		}
		else
		{
			
			// Enable debugger
			this.enabled = true;
			
			// Show debugger UI
			$("#debug").show();
			
		}
		
	}
	
	/**
	* Handles debugger processes that update every frame.
	*
	* @param {world} world The game world to debug.
	* @param {player} player The player to debug.
	*/
	static update(world, player)
	{
		if (this.enabled)
		{
			
			// Handle debugger UI output
			this.output(world, player);
			
		}
	}
	
	/**
	* Handles debugger UI output.
	*
	* @param {world} world The game world to debug.
	* @param {player} player The player to debug.
	*/
	static output(world, player)
	{
		
		// Output debug info to UI
		$("#debug-text").html("player.position.x    = " + player.position.x + "<br />" + 
							  "player.position.y    = " + player.position.y + "<br />" + 
							  "player.position.z    = " + player.position.z + "<br />" + 
							  "player.controls.is_mouse_left_down    = " + player.controls.is_mouse_left_down + "<br />" + 
							  "player.controls.is_mouse_dragging     = " + player.controls.is_mouse_dragging + "<br />" +
							  "player.controls.transform_controls.dragging    = " + player.controls.transform_controls.dragging + "<br />");
		
	}
	
}
export default Debug;