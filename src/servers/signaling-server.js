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

// Static Class Imports
import Game from '../classes/game.class.js';
import Multiplayer from '../classes/multiplayer.class.js';

/**
 * This is the Pawbs Engine Multiplayer Signaling Server. It handles the connection handshake process for WebRTC peer-to-peer multiplayer games. It also runs its own entire copy of the game *just* enough to get the game's settings.
 */

//#region [Initialization]
	
	// Initialization
	
	// Show title header
	showTitleLebsian();
	log("Initializing Pawbs Engine Multiplayer Signaling Server...");
	
	/**
	* The list of P2P games available to join.
	*/
	const games = { };
	
	
	// Initialize Web Socket Server
	log("Initializing Web Socket Server...");
	
	/**
	* The port number on which to host the web socket server.
	*/
	const port = process.env.PORT || 5000;
	
	/**
	* The web socket server.
	*/
	const server = new WebSocketServer({ port: port });
	
	
	// Initialize Pawbs Engine
	log("Initializing Pawbs Engine...");
	
	// Initialize game
	Game.initialize(null, null, Multiplayer.ConnectionTypes.SignalingServer, FileSystem, () => {
		
		// Pause game
		Game.paused = true;
		
		// Initialization complete
		log("Pawbs Engine Multiplayer Signaling Server" + server_flags() + " running on '" + Game.settings.multiplayer_signaling_server + "'.");
		
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
					
					// PING
					case Multiplayer.MessageTypes.PING:
					{
						
						// Send a ping in return for latency measurement
						connection.send(JSON.stringify({
							type:	Multiplayer.MessageTypes.PING,
							games:	games,
						}));
						
						break;
					}
					
				//#endregion
				
				
				//#region [P2P / Signaling Server]
					
					
					//#region [Joining]
						
						// P2P_JOIN_GAME
						case Multiplayer.MessageTypes.P2P_JOIN_GAME:
						{
							
							// Get message data
							const game_id = data.game_id;
							const player_id = data.player_id;
							const player_name = data.player_name;
							
							// Check if the client's specified game exists...
							if (games[game_id])
							{
								
								// Client successfully joined the game
								log("Player '" + player_name + "' (" + player_id + ") joined game '" + games[game_id].name + "' (" + game_id + ").");
								
								// Add a new player to the game and update player count
								games[game_id].connections[player_id] = connection;
								games[game_id].player_count = Object.keys(games[game_id].connections).length;
								
								// Get the game host's ID
								const host_id = Object.keys(games[game_id].connections).find(key => games[game_id].connections[key] === games[game_id].host_connection)
								
								// Send successful join message back to client
								connection.send(JSON.stringify({
									type: 	 		Multiplayer.MessageTypes.P2P_JOINED_GAME,
									is_host: 		false,
									host_id:		host_id,
								}));
								
								// Check if the host's connection is still open...
								if (games[game_id].host_connection)
								{
									
									// Notify the host to make a WebRTC P2P connection offer
									games[game_id].host_connection.send(JSON.stringify({
										type: 			Multiplayer.MessageTypes.P2P_MAKE_OFFER,
										player_id:		player_id,
										player_name:	player_name,
									}));
									
								}
								
							}
							
							break;
						}
						
					//#endregion
					
					
					//#region [Hosting]
						
						// P2P_HOST_GAME
						case Multiplayer.MessageTypes.P2P_HOST_GAME:
						{
							
							// Get message data
							const game_id = data.game_id
							const game_name = data.game_name
							const player_id = data.player_id;
							const player_name = data.player_name;
							
							// Make sure game ID isn't already in use...
							if (!games[game_id])
							{
								
								// Game successfully hosted
								log("Game '" + game_name + "' (" + game_id + ") hosted by player '" + player_name + "' (" + player_id +").");
								
								// Initialize a new game
								games[game_id] = {
									name:	  	  		game_name,
									connections: 	  	[],
									host_connection:	connection,
									player_count: 		0,
								};
								
								// Add the host player to the game and update player count
								games[game_id].connections[player_id] = connection;
								games[game_id].player_count = Object.keys(games[game_id].connections).length;
								
								// Notify the host player that the game has been created
								connection.send(JSON.stringify({
									type:		Multiplayer.MessageTypes.P2P_GAME_HOSTED,
									is_host: 	true,
								}));
								
							}
							
							break;
						}
						
					//#endregion
					
					
					//#region [WebRTC Signals]
						
						// P2P_OFFER
						case Multiplayer.MessageTypes.P2P_OFFER:
						{
							
							// Get message data
							const game_id = data.game_id;
							const host_id = data.host_id;
							const player_id = data.player_id;
							const signal = data.signal;
							
							// Get client by player ID
							const player_connection = games[game_id].connections[player_id];
							
							// WebRTC signal sent
							//log("Host ID " + host_id + " sent a WebRTC signal of type '" + signal.type + "' to player ID " + player_id + ".");
							
							// Send WebRTC offer signal to client
							player_connection.send(JSON.stringify({
								type: Multiplayer.MessageTypes.P2P_OFFER,
								host_id: host_id,
								signal,
							}));
							
							break;
						}
						
						// P2P_ANSWER
						case Multiplayer.MessageTypes.P2P_ANSWER:
						{
							
							// Get message data
							const game_id = data.game_id;
							const player_id = data.player_id;
							const signal = data.signal;
							
							// Get specified game
							const game = games[game_id];
							
							// Check if the client's specified game exists...
							if (!game) return;
							
							// Check if the host's connection is still open...
							if (game.host_connection)
							{
								
								// WebRTC signal sent
								//log("Player ID " + player_id + " sent a WebRTC signal of type '" + signal.type + "' back to host.");
								
								// Send WebRTC answer signal back to host
								game.host_connection.send(JSON.stringify({
									type: Multiplayer.MessageTypes.P2P_ANSWER,
									player_id: player_id,
									signal,
								}));
								
							}
							
							break;
						}
						
						// P2P_CANDIDATE
						case Multiplayer.MessageTypes.P2P_CANDIDATE:
						{
							
							// Get message data
							const game_id = data.game_id;
							const player_id = data.player_id;
							const target_player_id = data.target_id;
							const signal = data.signal;
							
							// Get player by ID
							const player_connection = games[game_id].connections[target_player_id];
							
							// Send WebRTC candidate signal to player
							player_connection.send(JSON.stringify({
								type: Multiplayer.MessageTypes.P2P_CANDIDATE,
								player_id: player_id,
								signal,
							}));
							
							break;
						}
						
					//#endregion
					
					
				//#endregion
				
			}
			
		});
		
		// Handle connection closing
		connection.on('close', () => {
			
			// Iterate through each available P2P game...
			Object.keys(games).forEach((game_id) => {
				
				// Get current game
				const game = games[game_id];
				
				// Iterate through each player in the current game...
				Object.keys(game.connections).forEach((player_id) => {
					
					// Get current player and player count
					const player_connection = game.connections[player_id];
					const player_count = Object.keys(game.connections).length;
					
					// If the current player's connection is the one being closed...
					if (player_connection === connection)
					{
						
						// If the current player is the host...
						if (player_connection === game.host_connection)
						{
							
							// Check if anybody was connected to the host...
							if (player_count > 1)
							{
								
								// Boot everybody from the game!
								broadcast({
									type: 		Multiplayer.MessageTypes.P2P_HOST_LEFT,
									host_id: 	player_id,
								}, game_id);
								
							}
							
							// Host has left game
							log("Host (" + player_id + ") has closed the game '" + game.name + "' (" + game_id + ")." + (player_count > 1 ? " Kicked everyone to main menu." : ""));
							
							// Remove game
							delete games[game_id];
							
							
						} // Otherwise, if the current player is just a client...
						else
						{
							
							// Update player count
							game.player_count = player_count - 1;
							
							// Tell the host to tell everyone a player just left
							game.host_connection.send(JSON.stringify({
								type: 			Multiplayer.MessageTypes.PLAYER_LEFT,
								player_id:		player_id,
							}));
							
							// Player has left game
							log("Player (" + player_id + ") has left game '" + game.name + "' (" + game_id + ").");
							
							// Remove player
							delete game.connections[player_id];
							
						}
						
						return;
						
					}
					
				});
				
			});
			
		});
		
	});
	
//#endregion


//#region [Methods]
	
	/**
	 * Broadcasts the specified P2P reconnection data to all of the signaling server's client connections.
	 *
	 * @param {Object} data The message to be broadcast to all of the signaling server's connected P2P clients in the new host's game.
	 * @param {string} game_id The ID of the game whose players will be broadcast to.
	 * @param {string} id_skip The player ID to skip over sending a broadcast to.
	 */
	function broadcast(data, game_id, id_skip = null)
	{
		
		// Get current game
		const game = games[game_id];
		
		// Iterate through each player in the current game...
		Object.keys(game.connections).forEach((player_id) => {
			
			// If the current player ID isn't flagged to be skipped and has an active server connection...
			if (player_id != id_skip && game.connections[player_id])
			{
				
				// Get current player
				const player_connection = game.connections[player_id];
				
				// If the player's connection is ready for broadcast...
				if (player_connection.readyState === 1)
				{
					
					// Send specified message to player
					player_connection.send(JSON.stringify(data));
					
				}
				
			}
			
		});
		
	}
	
//#endregion