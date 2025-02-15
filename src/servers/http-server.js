// Console Utility Imports
import './helpers/server-utility.js';

//#region [Console Overrides]
	
	// Modify the console error function to format errors in the console's style before outputting them
	console.error = function (...args)
	{
		
		// Combine all arguments into single string
		const error_message = args.map(arg => (arg instanceof Error ? arg.stack : arg)).join(' ');
		
		// Output formatted string within borders
		console.log(border + c_red + divider(divider_dashed) + border);
		log(error_message);
		console.log(border + c_red + divider(divider_dashed) + border);
		
	};
	
	// Modify the process uncaught exception event handler to format errors in the console's style before outputting them
	process.on('uncaughtException', (error) => {
		
		// Output error to console
		console.error(`[Uncaught Exception]
		Message: ${error.message}
		Stack: ${error.stack}`);
		
	});
	
	// Modify the process unhandled rejection event handler to format errors in the console's style before outputting them
	process.on('unhandledRejection', (reason, promise) => {
		
		// Output error to console
		console.error(`[Unhandled Rejection]
		Reason: ${reason}
		Promise: ${promise}`);
		
	});
	
//#endregion

// Express Imports
import express from 'express';

// CORS Imports
import cors from 'cors';

// FileSystem Imports
import * as FileSystem from 'fs';

// Node.js Imports
import path from 'path';
import { fileURLToPath } from 'url';

// Static Class Imports
import Game from '../classes/game.class.js';
import Multiplayer from '../classes/multiplayer.class.js';

/**
 * This is the Pawbs Engine HTTP Server. It's a little Node.js Express server for serving a playable copy of the game files on a web server, such as https://fly.io/. It runs its own entire copy of the game *just* enough to get the game's settings.
 */

//#region [Initialization]
	
	// Initialization
	
	// Show title header
	showTitlePuppey();
	log("Initializing Pawbs Engine HTTP Server...");
	
	
	// Initialize Express
	log("Initializing Express...");
	
	/**
	 * The port number on which to host the HTTP server.
	 */
	const port = process.env.PORT || 4000;
	
	/**
	 * The Express HTTP server.
	 */
	const server = express();
	
	/**
	 * The Express HTTP server's root directory.
	 */
	const path_root = path.dirname(fileURLToPath(import.meta.url));
	
	// Enable CORS for all routes
	server.use(cors());
	
	// Initialize custom HTTP server routes
	server.get('/servers/servers.json', (req, res) => {
		res.sendFile(path.join(path_root, '../servers/servers.json'), (error) => {
			if (error)
			{
				console.error("Error sending file:", error);
				return res.status(500).send("Internal Server Error");
			}
		});
	});
	
	// Use static game files for all other routes
	server.use(express.static(path.join(path_root, '../')));
	
	// Initialize all other HTTP server routes
	server.get('*', (req, res) => {
		res.sendFile(path.join(path_root, '../index.html'));
	});
	
	// Start HTTP server
	server.listen(port, '0.0.0.0', () => {
		
		// Initialize Pawbs Engine
		log("Initializing Pawbs Engine...");
		
		// Initialize game
		Game.initialize(null, null, Multiplayer.ConnectionTypes.HTTPServer, FileSystem, () => {
			
			// Pause game
			Game.paused = true;
			
			// Initialization complete
			log("Pawbs Engine HTTP Server" + server_flags() + " running on '" + Game.settings.multiplayer_http_server + "'.");
			
		});
		
	});
	
//#endregion