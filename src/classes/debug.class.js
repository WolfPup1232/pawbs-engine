/**
* The in-game debugger.
*/
class Debug
{
		
	/**
	* Initializes the in-game debugger.
	*/
	constructor()
	{
		
		// Class Declarations/Initialization
		
		
		// Enable/disable debugger
		this.enabled = false;
		
	}
	
	
	// Debugger Methods
	
	/**
	* Toggle debugger on/off.
	*/
	toggle()
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
	update(world, player)
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
	output(world, player)
	{
		
		// Output debug info to UI
		$("#debug-text").html("player.controls.is_mouse_left_down    = " + player.controls.is_mouse_left_down + "<br />" + 
							  "player.controls.is_mouse_dragging     = " + player.controls.is_mouse_dragging + "<br />" +
							  "player.controls.transform_controls.dragging    = " + player.controls.transform_controls.dragging + "<br />");
		
	}
	
}
export default Debug;