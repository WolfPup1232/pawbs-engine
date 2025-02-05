// Static Class Imports
import Game from '../../classes/game.class.js';
import Multiplayer from '../../classes/multiplayer.class.js';

/**
 * This file provides utility variables and functions to the Pawbs Engine server console applications.
 */

//#region [Text Colours]
	
	// Reset all colours, effects, and backgrounds
	global.c_reset		= "\x1b[0m";
	
	// Colours
	global.c_black		= "\x1b[30m";
	global.c_white		= "\x1b[37m";
	global.c_gray		= "\x1b[90m";
	global.c_magenta	= "\x1b[35m";
	global.c_red		= "\x1b[31m";
	global.c_yellow		= "\x1b[33m";
	global.c_green		= "\x1b[32m";
	global.c_blue		= "\x1b[34m";
	global.c_cyan		= "\x1b[36m";
	
//#endregion


//#region [Text Effects]
	
	// Effects
	global.e_bright		= "\x1b[1m";
	global.e_dim		= "\x1b[2m";
	global.e_underscore	= "\x1b[4m";
	global.e_blink		= "\x1b[5m";
	global.e_reverse	= "\x1b[7m";
	global.e_hidden		= "\x1b[8m";
	
//#endregion


//#region [Background Colours]
	
	// Backgrounds
	global.b_black 		= "\x1b[40m";
	global.b_white 		= "\x1b[47m";
	global.b_magenta 	= "\x1b[45m";
	global.b_red 		= "\x1b[41m";
	global.b_yellow 	= "\x1b[43m";
	global.b_green 		= "\x1b[42m";
	global.b_blue 		= "\x1b[44m";
	global.b_cyan 		= "\x1b[46m";
	
//#endregion


//#region [Borders]
	
	// Borders
	global.divider_solid		= "██████████████████████████████████████████████████████████████████████████████████████████████████████████";
	global.divider_medium		= "▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒";
	global.divider_light		= "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░";
	global.divider_empty		= "                                                                                                          ";
	global.divider_dashed		= "----------------------------------------------------------------------------------------------------------";
	
	// Individual border piece
	global.border				= c_reset + c_gray + "░▒▓█▓▒░" + c_reset;
	
	// Solid border for line 1
	global.divider_solid_top	= "░▒▓██████████████████████████████████████████████████████████████████████████████████████████████████████████████████▓▒░";
	
//#endregion


//#region [Titles]
	
	/**
	 * Show the Pawbs Engine title (Transgender Pride Edition!)
	 */
	global.showTitleTrans = function showTitle()
	{
		
		// Output title
		console.clear();
		console.log(c_gray + divider_solid_top);
		console.log(border + e_bright + c_cyan + 	"█████████████████████████████       ████      ███  ████  ██       ████      ██████████████████████████████" + border);
		console.log(border + e_bright + c_magenta +	"█████████████████████████████  ████  ██  ████  ██  █  █  ██  ████  ██  ███████████████████████████████████" + border);
		console.log(border + e_bright + c_white + 	"█████████████████████████████       ███  ████  ██        ██       ████      ██████████████████████████████" + border);
		console.log(border + e_bright + c_magenta +	"█████████████████████████████  ████████        ██   ██   ██  ████  ████████  █████████████████████████████" + border);
		console.log(border + e_bright + c_cyan + 	"█████████████████████████████  ████████  ████  ██  ████  ██       ████      ██████████████████████████████" + border);
		console.log(c_gray + divider_solid_top);
		console.log(border + c_red + 				"█████████████████████████        ██   ███  ███      ███        ██   ███  ██        ███████████████████████" + border);
		console.log(border + c_yellow + 			"█████████████████████████  ████████    ██  ██  ███████████  █████    ██  ██  █████████████████████████████" + border);
		console.log(border + e_bright + c_green + 	"█████████████████████████      ████  █  █  ██  ███   █████  █████  █  █  ██      █████████████████████████" + border);
		console.log(border + c_blue + 				"█████████████████████████  ████████  ██    ██  ████  █████  █████  ██    ██  █████████████████████████████" + border);
		console.log(border + e_bright + c_magenta +	"█████████████████████████        ██  ███   ███      ███        ██  ███   ██        ███████████████████████" + border);
		console.log(c_gray + divider_solid_top);
		console.log(border + e_dim + c_gray + divider_medium + border);
		
	}
	
	/**
	 * Show the Pawbs Engine title (Lesbian Pride Edition!)
	 */
	global.showTitleLebsian = function showTitle()
	{
		
		// Output title
		console.clear();
		console.log(c_gray + divider_solid_top);
		console.log(border + c_red + 				"█████████████████████████████       ████      ███  ████  ██       ████      ██████████████████████████████" + border);
		console.log(border + c_yellow +				"█████████████████████████████  ████  ██  ████  ██  █  █  ██  ████  ██  ███████████████████████████████████" + border);
		console.log(border + e_bright + c_white + 	"█████████████████████████████       ███  ████  ██        ██       ████      ██████████████████████████████" + border);
		console.log(border + e_bright + c_magenta +	"█████████████████████████████  ████████        ██   ██   ██  ████  ████████  █████████████████████████████" + border);
		console.log(border + e_dim + c_magenta + 	"█████████████████████████████  ████████  ████  ██  ████  ██       ████      ██████████████████████████████" + border);
		console.log(c_gray + divider_solid_top);
		console.log(border + c_red + 				"█████████████████████████        ██   ███  ███      ███        ██   ███  ██        ███████████████████████" + border);
		console.log(border + c_yellow + 			"█████████████████████████  ████████    ██  ██  ███████████  █████    ██  ██  █████████████████████████████" + border);
		console.log(border + e_bright + c_green + 	"█████████████████████████      ████  █  █  ██  ███   █████  █████  █  █  ██      █████████████████████████" + border);
		console.log(border + c_blue + 				"█████████████████████████  ████████  ██    ██  ████  █████  █████  ██    ██  █████████████████████████████" + border);
		console.log(border + e_bright + c_magenta +	"█████████████████████████        ██  ███   ███      ███        ██  ███   ██        ███████████████████████" + border);
		console.log(c_gray + divider_solid_top);
		console.log(border + e_dim + c_gray + divider_medium + border);
		
	}
	
	/**
	 * Show the Pawbs Engine title (Puppy Pride Edition!)
	 */
	global.showTitlePuppey = function showTitle()
	{
		
		// Output title
		console.clear();
		console.log(c_gray + divider_solid_top);
		console.log(border + b_red + c_black + 				"█████████████████████████████       ████      ███  ████  ██       ████      ██████████████████████████████" + b_black + border);
		console.log(border + b_red + c_blue +				"█████████████████████████████  ████  ██  ████  ██  █  █  ██  ████  ██  ███████████████████████████████████" + b_black + border);
		console.log(border + b_red + e_bright + c_white + 	"█████████████████████████████       ███  ████  ██        ██       ████      ██████████████████████████████" + b_black + border);
		console.log(border + b_red + c_blue +				"█████████████████████████████  ████████        ██   ██   ██  ████  ████████  █████████████████████████████" + b_black + border);
		console.log(border + b_red + c_black +				"█████████████████████████████  ████████  ████  ██  ████  ██       ████      ██████████████████████████████" + b_black + border);
		console.log(c_gray + divider_solid_top);
		console.log(border + c_red + 						"█████████████████████████        ██   ███  ███      ███        ██   ███  ██        ███████████████████████" + border);
		console.log(border + c_yellow + 					"█████████████████████████  ████████    ██  ██  ███████████  █████    ██  ██  █████████████████████████████" + border);
		console.log(border + e_bright + c_green + 			"█████████████████████████      ████  █  █  ██  ███   █████  █████  █  █  ██      █████████████████████████" + border);
		console.log(border + c_blue + 						"█████████████████████████  ████████  ██    ██  ████  █████  █████  ██    ██  █████████████████████████████" + border);
		console.log(border + e_bright + c_magenta +			"█████████████████████████        ██  ███   ███      ███        ██  ███   ██        ███████████████████████" + border);
		console.log(c_gray + divider_solid_top);
		console.log(border + e_dim + c_gray + divider_medium + border);
		
	}
	
//#endregion


//#region [Functions]
	
	/**
	 * Outputs the specified message to the console. Optional player ID and message type arguments for formatting.
	 *
	 * @param {string} message The message to output to the console.
	 * @param {string} player_id Optional player ID to help format the output.
	 * @param {Multiplayer.MessageTypes} type Optional message type to help format the output.
	 */
	global.log = function log(message, player_id = null, type = null)
	{
		
		// Initialize maximum console line width and its total content space width
		const console_line_width = 146;
		const console_line_padding = console_line_width - (2 * border.length);
		
		// Helper function to create a single formatted console line
		function formatLine(content, is_first_line = false, is_stack_trace = false)
		{
			
			// Initialize padding space between the left border and the start of the message
			const padding_left = (is_stack_trace ? 4 : 1);
			
			// Initialize the padding for the first line of every series of message lines output to the console
			const padding_first_line = console_line_padding + 17 + (player != null ? player_nameplate_padding : 0);
			
			// Modify the console line padding to account for the first line
			const modified_line_padding = (is_first_line ? padding_first_line : console_line_padding);
			
			// Get remaining space to fill with padding
			const padding_right = modified_line_padding - content.length - padding_left;
			
			// Initialize message text colour
			const colour = (is_stack_trace ? c_gray : c_white);
			
			// Return the formatted line
			return border + colour + " ".repeat(padding_left) + content + " ".repeat(padding_right) + c_reset + border;
			
		}
		
		// Initialize a timestamp and a formatted version of the timestamp
		const timestamp = new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
		const timestamp_formatted = c_reset + e_bright + c_yellow + "[" + timestamp + "]" + c_reset;
		
		// Initialize player and nameplate in case they are needed
		let player = null;
		let player_nameplate = null;
		let player_nameplate_padding = 0;
		
		// If a player ID was provided, generate a nameplate...
		if (player_id != null)
		{
			player = Game.players[player_id];
			player_nameplate = c_yellow + " [" + player.name + "]";
			player_nameplate_padding = 5;
		}
		
		// If a message type was provided, handle message by type...
		if (type != null)
		{
			switch (type)
			{
				// CHAT
				case Multiplayer.MessageTypes.CHAT:
					
					// Format nameplate for a regular chat message
					player_nameplate = c_yellow + " [" + player.name + "]:" + c_reset;
					player_nameplate_padding = 9;
					
					break;
			}
		}
		
		// Check if the message is an error or contains a stack trace...
		let is_error_message = false;
		if (message instanceof Error)
		{
			is_error_message = true;
			message = message.stack;
		}
		else if (typeof message === "string" && message.includes("Error:"))
		{
			is_error_message = true;
		}
		
		// Initialize an empty array to contain the provided message's formatted lines which will be output to the console
		const lines = [];
		
		// Split the message into separate paragraphs
		const paragraphs = message.split("\n");
		
		// Iterate through each paragraph in the message...
		paragraphs.forEach((paragraph, paragraphIndex) => {
			
			// Split the current paragraph into words by spaces and slashes
			const words = paragraph.split(/(\/| )/);
			
			// Initialize flag indicating whether or not the current paragraps appears to be a stack trace line
			let is_stack_trace = paragraph.startsWith("    at ");
			
			// Initialize flag indicating whether or not the current paragraph is the first one
			let is_first_line = (paragraphIndex === 0);
			
			// Initialize the first line of the message
			const first_line = timestamp_formatted + (player != null ? player_nameplate : "") + " ";
			
			// Initialize the current line of the message, starting at the first line
			let current_line = (is_first_line ? first_line : "");
			
			// Iterate through each word in the paragraph...
			for (const word of words)
			{
				
				// If the length of the current line with the next word added to it is shorter than the space available (plus some extra for the formatting characters' lengths)...
				if (current_line.length + word.length <= console_line_padding + 15)
				{
					
					// Add the word to the current line
					current_line += word;
					
					
				} // Otherwise, if the current line doesn't have enough space available for the next word...
				else
				{
					
					// Format the current line and add it to the array of formatted message lines for output
					lines.push(formatLine(current_line.trimStart(), is_first_line, is_stack_trace));
					
					// Reset the current line
					current_line = word;
					
					// Reset line formatting flags
					is_stack_trace = false;
					is_first_line = false;
					
				}
				
			}
			
			// Add the last line of the paragraph...
			if (current_line)
			{
				lines.push(formatLine(current_line.trimStart(), is_first_line, is_stack_trace));
			}
			
		});
		
		// Output the formatted lines to the console
		lines.forEach(line => console.log(line));
		
	}
	
//#endregion