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
	 */
	update(world)
	{
		if (this.enabled)
		{
			
			// Handle debugger UI output
			this.output(world);
			
		}
	}
	
	/**
	 * Handles debugger UI output.
	 */
	output(world)
	{
		
		// Output debug info to UI
		// $("#debug-text").html("billboard.rotation.x		 = " + world.objects[0].rotation.x + "<br />" + 
							  // "billboard.rotation.y   = " + world.objects[0].rotation.y + "<br />" + 
							  // "billboard.rotation.z  = " + world.objects[0].rotation.z + "<br />" + 
							  // "player.jump_height    = " + this.jump_height + "<br />" + 
							  // "player.position.y     = " + this.position.y + "<br />");
		
	}
    
}