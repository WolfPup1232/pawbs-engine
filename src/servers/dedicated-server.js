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

// WebSocket Imports
import { WebSocketServer } from 'ws';

// FileSystem Imports
import * as FileSystem from 'fs';

// JSDOM Imports
import { JSDOM } from 'jsdom';

// Class Imports
import Player from '../classes/player.class.js';
import Controls from '../classes/controls.class.js';

// Static Class Imports
import Game from '../classes/game.class.js';
import Multiplayer from '../classes/multiplayer.class.js';

/**
 * This is the Pawbs Engine Dedicated Multiplayer Server. It runs its own entire copy of the game without the rendering or UI so it can confirm the validity of player actions.
 */

//#region [Initialization]
	
	// Initialization
	
	// Show title header
	showTitleTrans();
	log("Initializing Pawbs Engine Dedicated Multiplayer Server...");
	
	
	// Initialize JSDOM
	log("Initializing JSDOM...");
	
	/**
	 * The JSDOM simulated DOM object.
	 */
	const dom = new JSDOM("<!DOCTYPE html><html><head></head><body></body></html>");
	
	// Set the standard web browser window, document, and navigator objects to the JSDOM simulated objects
	global.window = dom.window;
	global.document = dom.window.document;
	global.navigator = { userAgent: 'node.js' };
	
	
	// Initialize Web Socket Server
	log("Initializing Web Socket Server...");
	
	/**
	 * The port number on which to host the web socket server.
	 */
	const port = process.env.PORT || 3000;
	
	/**
	 * The web socket server.
	 */
	const server = new WebSocketServer({ port: port });
	
	
	// Initialize Pawbs Engine
	log("Initializing Pawbs Engine...");
	
	// Initialize game
	Game.initialize(window, document, Multiplayer.ConnectionTypes.DedicatedServer, FileSystem, () => {
		
		// Pause game
		Game.paused = true;
		
		// Initialization complete
		log("Pawbs Engine Dedicated Multiplayer Server" + server_flags() + " running on '" + Game.settings.multiplayer_dedicated_server + "'.");
		
	});
		
//#endregion


//#region [Message Handlers]
	
	/**
	 * Handle incoming messages.
	 */
	server.on('connection', (connection) => {
		
		// Handle messages
		connection.on('message', (raw) => {
			
			// Get incoming JSON message data and parse it into an object
			let data;
			try { data = JSON.parse(raw); } catch { return; }
			
			// Handle messages by type...
			switch (data.type)
			{
				
				//#region [Server]
					
					// LIST_GAMES
					case Multiplayer.MessageTypes.LIST_GAMES:
					{
						
						// Send list of games on the current server back to client
						connection.send(JSON.stringify({
							type: 	Multiplayer.MessageTypes.GAMES_LIST,
							games: 	Multiplayer.listGames(),
						}));
						
						break;
					}
					
				//#endregion
				
				
				//#region [Dedicated Server]
					
					
					//#region [Joining]
						
						// DEDICATED_JOIN_GAME
						case Multiplayer.MessageTypes.DEDICATED_JOIN_GAME:
						{
						
							// Get message data
							const game_id = data.game_id;
							const player_id = data.player_id;
							const player_name = data.player_name;
							
							// Check if the client's specified game ID exists...
							if (Game.id != game_id)
							{
								
								// Game ID doesn't exist, log error
								log("attempted to join a game which doesn't exist using game_id " + game_id, player_id);
								
								// Send ERROR message back to client
								connection.send(JSON.stringify({
									type: 		Multiplayer.MessageTypes.ERROR,
									message: 	'Game not found.',
								}));
								
								return;
							}
							
							// Client successfully joined the game
							log("joined the game.", player_id);
							
							// Add a new player to the game
							player_id = addPlayer(connection, player_name);
							
							// Send game details back to client in successful join message
							connection.send(JSON.stringify({
								type: 		Multiplayer.MessageTypes.DEDICATED_JOINED_GAME,
								game_id: 	game_id,
								player_id: 	player_id,
								players:	Multiplayer.listPlayers(),
							}));
							
							// Broadcast successful join message to all other clients
							Multiplayer.broadcast({
								type: 		 Multiplayer.MessageTypes.PLAYER_JOINED,
								player_id: 	 player_id,
								player_name: player_name,
							});
							
							break;
						}
						
					//#endregion
					
					
				//#endregion
				
				
				//#region [In-Game]
					
					
					//#region [Broadcasts]
						
						// CHAT
						case Multiplayer.MessageTypes.CHAT:
						{
							
							// Get message data
							const player_id = data.player_id;
							const message = data.message;
							
							// Log chat message
							log(message, player_id, Multiplayer.MessageTypes.CHAT);
							
							// Broadcast chat message to all clients
							Multiplayer.broadcast({
								type: 		Multiplayer.MessageTypes.CHAT,
								player_id: 	player_id,
								message: 	message,
							});
							
							break;
						}
						
						// UPDATE_PLAYER
						case Multiplayer.MessageTypes.UPDATE_PLAYER:
						{
							
							// Get message data
							const player_id = data.player_id;
							const position = data.position;
							const rotation = data.rotation;
							
							// Get player by ID
							const player = Game.players[player_id];
							
							// If player exists...
							if (player)
							{
								
								// Update player's rotation server-side
								player.position.set(parseFloat(position.x), parseFloat(position.y), parseFloat(position.z));
								player.rotation.set(parseFloat(rotation.x), parseFloat(rotation.y), parseFloat(rotation.z));
								
								// Broadcast player update to all clients
								Multiplayer.broadcast({
									type: 		Multiplayer.MessageTypes.PLAYER_UPDATED,
									player_id: 	player_id,
									position: 	position,
									rotation:	rotation,
								});
								
							}
							
							break;
						}
						
					//#endregion
					
					
				//#endregion
				
			}
			
		});
		
		// Handle connection closing
		connection.on('close', () => {
			
			// Iterate through each player...
			Object.values(Game.players).forEach((player) => {
				
				// If the current player's connection is the one being closed...
				if (player.connection == connection)
				{
					
					// Current player has left the game
					log("left the game.", current_player_id);
					
					// Remove the current player from the game
					removePlayer(current_player_id);
					
					// Broadcast that current player has left the game to all clients
					Multiplayer.broadcast({
						type: 		Multiplayer.MessageTypes.PLAYER_LEFT,
						player_id: 	current_player_id,
					});
					
				}
				
			});
			
		});
		
	});
	
//#endregion


//#region [Functions]
	
	/**
	 * Adds a new player to the dedicated server's hosted game.
	 *
	 * @param {WebSocket} connection The WebSocketServer connection to the player to be added.
	 * @param {string} player_name The multiplayer nickname of the player to be added.
	 * @returns Returns the ID of the player after they've been added to the game.
	 */
	function addPlayer(connection, player_name)
	{
		
		// Initialize joining player
		let player = new Player();
		player.name = player_name;
		player.connection = connection;
		
		// Initialize joining player's keyboard/mouse controls
		player.controls = new Controls();
		
		// Add joining player to game
		Game.players[player.id] = player;
		
		// Return player's ID
		return player.id;
		
	}
	
	/**
	 * Removes the specified player from the dedicated server's hosted game.
	 *
	 * @param {string} player_id The unique ID of the player to be removed from the server.
	 */
	function removePlayer(player_id)
	{
		
		// Remove the player from the server
		delete Game.players[player_id];
		
		// Log if game is empty...
		if (Object.keys(Game.players).length === 0)
		{
			log("No players left, closing game ID " + Game.id);
		}
		
	}
	
//#endregion