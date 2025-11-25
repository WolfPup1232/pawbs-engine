// three.js Imports
import * as THREE from '../libraries/threejs/three.js';

// Class Imports
import Player from './player.class.js';
import Controls from './controls.class.js';

// Static Class Imports
import Game from './game.class.js';
import Editor from './editor.class.js';

/**
 * The (multiplayer) game. Handles joining/hosting multiplayer games and multiplayer server communications.
 */
class Multiplayer
{
	
	//#region [Class Declarations]
		
		
		//#region [Flags]
			
			/**
			 * Flag indicating whether multiplayer is enabled or disabled.
			 */
			static enabled = false;
			
			/**
			 * Flag indicating whether containerized mode is enabled or disabled.
			 */
			static container = false;
			
		//#endregion
		
		
		//#region [Connections]
			
			/**
			 * Multiplayer connection types.
			 */
			static ConnectionTypes = {
				None: 			 1,
				HTTPServer:		 2,
				DedicatedServer: 3,
				DedicatedClient: 4,
				SignalingServer: 5,
				SignalingClient: 6,
				P2PClient:		 7,
			};
			
			/**
			 * The current connection type.
			 */
			static connection_type = this.ConnectionTypes.None;
			
			
			//#region [P2P]
				
				/**
				 * Flag indicating whether or not the current user-controlled player is a P2P connection host.
				 */
				static p2p_is_host = false;
				
				/**
				 * The player ID of the current P2P connection's host.
				 */
				static p2p_host_id = null;
				
				/**
				 * The list of all current P2P connections indexed by player ID.
				 */
				static p2p_connections = { };
				
			//#endregion
			
			
			//#region [Dedicated Server]
				
				/**
				 * The dedicated server web socket used for communicating with the Pawbs Engine Dedicated Server.
				 */
				static server_dedicated = null;
				
			//#endregion
			
			
			//#region [Signaling Server]
				
				/**
				 * The signaling server web socket used for communicating with the Pawbs Engine Signaling Server.
				 */
				static server_signaling = null;
				
			//#endregion
			
			
		//#endregion
		
		
		//#region [Message Types]
			
			/**
			 * Message types.
			 */
			static MessageTypes = {
				
				// Server
						  PING: 101,
				
				// Errors
						 ERROR: 102,
				
				
			// Dedicated Server
				
				// Joining
		   DEDICATED_JOIN_GAME:	201,
		 DEDICATED_JOINED_GAME: 202,
				
				
			// P2P / Signaling Server
				
				// Joining
				 P2P_JOIN_GAME: 301,
			   P2P_JOINED_GAME: 302,
				
				// Hosting
				 P2P_HOST_GAME: 303,
			   P2P_GAME_HOSTED: 304,
				
				// WebRTC Signals
				P2P_MAKE_OFFER: 305,
					 P2P_OFFER: 306,
					P2P_ANSWER: 307,
				 P2P_CANDIDATE: 308,
				
				
			// In-Game
				
				// Broadcasts
						  CHAT: 401,
				 PLAYER_JOINED: 402,
				PLAYER_UPDATED: 403,
				   PLAYER_LEFT: 404,
				  OBJECT_ADDED: 405,
				OBJECT_UPDATED: 406,
				OBJECT_REMOVED: 407,
				   
				
				// Actions
				   JOINED_GAME: 501,
				 UPDATE_PLAYER: 502,
					ADD_OBJECT: 503,
				 UPDATE_OBJECT: 504,
				 REMOVE_OBJECT: 505,
				
			};
			
		//#endregion
		
		
		//#region [Message Limits]
			
			/**
			 * A timestamp indicating the last time the player attempted to send a player update.
			 */
			static player_update_last = 0;
			
			/**
			 * The number of milliseconds a player must wait before they can send another player update. (16ms = 62.5fps)
			 */
			static player_update_rate = 16;
			
			
			/**
			 * A timestamp indicating the last time the player attempted to send an object update.
			 */
			static object_update_last = 0;
			
			/**
			 * The number of milliseconds a player must wait before they can send another object update. (42ms = 23.8fps)
			 */
			static object_update_rate = 42;
			
		//#endregion
		
		
		//#region [Ping]
			
			/**
			 * The interval timer for sending ping messages to measure latency.
			 */
			static ping_interval = null;
			
			/**
			 * The timestamp of the last sent ping message, used to calculate RTT (Round-Trip Time).
			 */
			static ping_timestamp = 0;
			
			/**
			 * The number of milliseconds between ping messages.
			 */
			static ping_rate = 5000;
			
		//#endregion
		
		
	//#endregion
	
	
	//#region [Constructor]
		
		/**
		 * Static class constructor.
		 */
		static { }
		
	//#endregion
	
	
	//#region [Properties]
		
		/**
		 * Flag indicating whether or not the current game instance is being run by a dedicated server.
		 */
		static get is_dedicated_server()
		{
			return (this.enabled && this.connection_type == this.ConnectionTypes.DedicatedServer);
		}
		
		/**
		 * Flag indicating whether or not the current game instance is being run by a P2P signaling server.
		 */
		static get is_signaling_server()
		{
			return (this.enabled && this.connection_type == this.ConnectionTypes.SignalingServer);
		}
		
		/**
		 * Flag indicating whether or not the current game instance is being run by an HTTP server.
		 */
		static get is_http_server()
		{
			return (this.enabled && this.connection_type == this.ConnectionTypes.HTTPServer);
		}
		
		/**
		 * Flag indicating whether or not the current user-controlled player is a P2P connection client.
		 */
		static get is_p2p_client()
		{
			return (this.enabled && this.connection_type == this.ConnectionTypes.P2PClient && !this.p2p_is_host);
		}
		
	//#endregion
	
	
	//#region [Message Handlers]
		
		/**
		 * Handle incoming messages.
		 */
		static handleMessage(data)
		{
			
			// Handle messages by type...
			switch (data.type)
			{
				
				//#region [Errors]
					
					// ERROR
					case this.MessageTypes.ERROR:
					{
						
						// Get message data
						const message = data.message;
						
						// Output error message
						console.error(`ERROR: ${message}`);
						
						break;
					}
					
				//#endregion
				
				
				//#region [Dedicated Server]
					
					
					//#region [Joining]
						
						// DEDICATED_JOINED_GAME
						case this.MessageTypes.DEDICATED_JOINED_GAME:
						{
							
							// Forward message data as JOINED_GAME event for compatibility
							data.type = Multiplayer.MessageTypes.JOINED_GAME
							this.handleMessage(data);
							
							break;
						}
						
					//#endregion
					
					
				//#endregion
				
				
				//#region [P2P / Signaling Server]
					
					
					//#region [Joining]
						
						// P2P_JOINED_GAME
						case this.MessageTypes.P2P_JOINED_GAME:
						{
							
							// Get message data
							const is_host = data.is_host;
							const host_id = data.host_id;
							
							// Set P2P host flag and player ID
							this.p2p_is_host = is_host;
							this.p2p_host_id = host_id;
							
							// Add a new empty P2P connection for the host to the connections list
							this.p2p_connections[this.p2p_host_id] = {
								p2p_connection: 	null,
								p2p_data_channel: 	null,
							};
							
							// Initialize P2P connection with host
							this.initializeP2PConnection(this.p2p_host_id);
							
							break;
						}
						
					//#endregion
					
					
					//#region [Hosting]
						
						// P2P_GAME_HOSTED
						case this.MessageTypes.P2P_GAME_HOSTED:
						{
							
							// Get message data
							const is_host = data.is_host;
							
							// Set P2P host flag and ID
							this.p2p_is_host = is_host;
							this.p2p_host_id = Game.player.id;
							
							// Add a new empty P2P connection for the peer to the connections list
							this.p2p_connections["peer"] = {
								p2p_connection: 	null,
								p2p_data_channel: 	null,
							};
							
							// Initialize empty P2P connection, event handlers, and data channel
							this.initializeP2PConnection("peer");
							
							break;
						}
						
						// P2P_HOST_LEFT
						case this.MessageTypes.P2P_HOST_LEFT:
						{
							
							// Get message data
							const host_id = data.host_id;
							
							// If host left game...
							if (host_id == this.p2p_host_id)
							{
								
								// Quit game
								Game.quit();
								
							}
							
							break;
						}
						
					//#endregion
					
					
					//#region [WebRTC Signals]
						
						// P2P_MAKE_OFFER
						case this.MessageTypes.P2P_MAKE_OFFER:
						{
							
							// Get message data
							const player_id = data.player_id;
							
							// If the current user-controlled player is the P2P host...
							if (this.p2p_is_host)
							{
								
								// Initialize a new WebRTC connection offer and send it to the P2P client
								this.initializeOffer(player_id);
								
							}
							
							break;
						}
						
						// P2P_OFFER
						case this.MessageTypes.P2P_OFFER:
						{
							
							// Get message data
							const host_id = data.host_id;
							const signal = data.signal;
							
							// A WebRTC connection offer has been received by the P2P client
							this.handleOffer(host_id, signal);
							
							break;
						}
						
						// P2P_ANSWER
						case this.MessageTypes.P2P_ANSWER:
						{
							
							// Get message data
							const player_id = data.player_id;
							const signal = data.signal;
							
							// A WebRTC connection answer has been received by the P2P host
							this.handleAnswer(player_id, signal);
							
							break;
						}
						
						// P2P_CANDIDATE
						case this.MessageTypes.P2P_CANDIDATE:
						{
							
							// Get message data
							const player_id = data.player_id;
							const signal = data.signal;
							
							// A WebRTC ICE candidate has been received by either the P2P host or client
							this.handleCandidate(player_id, signal);
							
							break;
						}
						
					//#endregion
					
					
				//#endregion
				
				
				//#region [In-Game]
					
					
					//#region [Broadcasts]
						
						// CHAT
						case this.MessageTypes.CHAT:
						{
							
							// Get message data
							const player_id = data.player_id;
							const message = data.message;
							
							// Add chat message to chat log
							Game.ui.chat.addChatMessage(data);
							
							// If the multiplayer connection is via P2P and the current player is the host...
							if (this.connection_type == this.ConnectionTypes.P2PClient && this.p2p_is_host)
							{
								
								// Broadcast the chat message to all P2P clients
								this.broadcastP2P({
									type: 		Multiplayer.MessageTypes.CHAT,
									player_id:	player_id,
									message:	message,
								}, player_id);
								
							}
							
							break;
						}
						
						// PLAYER_JOINED
						case this.MessageTypes.PLAYER_JOINED:
						{
							
							// Get message data
							const player = data.player;
							const player_id = data.player_id;
							
							// If a new player has joined the game...
							if (player.id != Game.player.id)
							{
								
								// Add new player to game (trust the player ID from the server)
								this.addPlayer(player, null, true);
								
								// Add player joined message to chat log
								Game.ui.chat.addChatMessage(data);
								
								// Refresh player list
								Game.ui.player_list.refresh();
								
							}
							
							// If the multiplayer connection is via P2P and the current player is the host...
							if (this.connection_type == this.ConnectionTypes.P2PClient && this.p2p_is_host)
							{
								
								// Validate that the claimed player ID matches the authenticated sender
								if (player.id !== player_id)
								{
									console.error("Player ID mismatch: claimed " + player.id + " but authenticated as " + player_id);
									return;
								}
								
								// Send a JOINED_GAME event back to the player who joined the game
								this.send(this.p2p_connections[player.id].p2p_data_channel, {
									type: 		Multiplayer.MessageTypes.JOINED_GAME,
									game: 		Game.simplified,
									player: 	player,
									editor:		Editor.simplified,
								});
								
								// Broadcast a PLAYER_JOINED event to all players except for the player which was just sent that JOINED_GAME event right above this block
								this.broadcastP2P({
									type: 		 Multiplayer.MessageTypes.PLAYER_JOINED,
									player: 	 player,
								}, player.id);
								
							}
							
							break;
						}
						
						// PLAYER_LEFT
						case this.MessageTypes.PLAYER_LEFT:
						{
							
							// Get message data
							const player_id = data.player_id;
							
							// If the multiplayer connection is via P2P and the current player is the host...
							if (this.connection_type == this.ConnectionTypes.P2PClient && this.p2p_is_host)
							{
								
								// Broadcast a PLAYER_LEFT event to all players
								this.broadcastP2P({
									type: 		 Multiplayer.MessageTypes.PLAYER_LEFT,
									player_id: 	 player_id,
								});
								
							}
							
							// Add player left message to chat log
							Game.ui.chat.addChatMessage(data);
							
							// Remove the player from the game world
							Game.world.removeObject(Game.players[player_id].camera);
							
							// Remove the player from the game
							delete Game.players[player_id];
							
							// Refresh player list
							Game.ui.player_list.refresh();
							
							break;
						}
						
						// PLAYER_UPDATED
						case this.MessageTypes.PLAYER_UPDATED:
						{
							
							// Get message data
							const player_id = data.player_id;
							const position = data.position;
							const rotation = data.rotation;
							
							// Only update players who aren't the current player
							if (Game.player.id != player_id)
							{
								
								// Get player to be updated
								let player = Game.players[player_id];
								
								// Update player position and rotation
								player.position.set(parseFloat(position.x), parseFloat(position.y), parseFloat(position.z));
								player.rotation.set(parseFloat(rotation.x), parseFloat(rotation.y), parseFloat(rotation.z));
								
							}
							
							// If the multiplayer connection is via P2P and the current player is the host...
							if (this.connection_type == this.ConnectionTypes.P2PClient && this.p2p_is_host)
							{
								
								// Broadcast player update to all other clients
								this.broadcastP2P({
									type: 		Multiplayer.MessageTypes.PLAYER_UPDATED,
									player_id: 	player_id,
									position: 	position,
									rotation:	rotation,
								}, player_id);
								
							}
							
							break;
						}
						
						// OBJECT_ADDED
						case this.MessageTypes.OBJECT_ADDED:
						{
							
							// Get message data
							const player_id = data.player_id;
							const object = data.object;
							
							// Only update players who aren't the current player...
							if (Game.player.id != player_id)
							{
								
								// Get object type from message data
								const ObjectType = THREE[object.type] || THREE.Object3D;
								
								// Initialize new object from message data
								const new_object = new ObjectType();
								new_object.setSimplified(object);
								
								// Add new object to game
								Game.world.addObject(new_object, false);
								
							}
							
							// If the multiplayer connection is via P2P and the current player is the host...
							if (this.connection_type == this.ConnectionTypes.P2PClient && this.p2p_is_host)
							{
								
								// Broadcast a OBJECT_UPDATED event to all players except for the current player
								this.broadcastP2P(data, Game.player.id);
								
							}
							
							break;
						}
						
						// OBJECT_UPDATED
						case this.MessageTypes.OBJECT_UPDATED:
						{
							
							// Get message data
							const player_id = data.player_id;
							const object = data.object;
							
							// Only update players who aren't the current player...
							if (Game.player.id != player_id)
							{
								
								// Get object by ID
								const update_object = Game.world.scene.getObjectByProperty('uuid', object.uuid);
								
								// If object exists...
								if (update_object)
								{
								
									// Update object
									update_object.setSimplified(object);
								
								}
								
							}
							
							// If the multiplayer connection is via P2P and the current player is the host...
							if (this.connection_type == this.ConnectionTypes.P2PClient && this.p2p_is_host)
							{
								
								// Broadcast a OBJECT_UPDATED event to all players except for the current player
								this.broadcastP2P(data, Game.player.id);
								
							}
							
							break;
						}
						
						// OBJECT_REMOVED
						case this.MessageTypes.OBJECT_REMOVED:
						{
							
							// Get message data
							const player_id = data.player_id;
							const object_id = data.object_id;
							
							// Only update players who aren't the current player...
							if (Game.player.id != player_id)
							{
								
								// Get object by ID
								const object = Game.world.scene.getObjectByProperty('uuid', object_id);
								
								// If object exists...
								if (object)
								{
								
									// Remove object
									Game.world.removeObject(object, false);
								
								}
								
							}
							
							// If the multiplayer connection is via P2P and the current player is the host...
							if (this.connection_type == this.ConnectionTypes.P2PClient && this.p2p_is_host)
							{
								
								// Broadcast a OBJECT_REMOVED event to all players except for the current player
								this.broadcastP2P(data, Game.player.id);
								
							}
							
							break;
						}
						
					//#endregion
					
					
					//#region [Actions]
						
						// PING
						case this.MessageTypes.PING:
						{
							
							// Get message data
							const player_id = data.player_id;
							const ping = data.ping;
							const client_ping = data.client_ping;
							const timestamp = data.timestamp;
							
							// If this is a ping response (timestamp has been echoed back)...
							if (timestamp)
							{
								
								// Calculate RTT (Rount-Trip Time)
								const rtt = performance.now() - timestamp;
								
								// Update the current player's ping history for calculating rolling average
								Game.player.ping_history.push(rtt);
								if (Game.player.ping_history.length > 5)
								{
									Game.player.ping_history.shift();
								}
								
								// Calculate the current player's average ping
								let total = 0;
								for (let i = 0; i < Game.player.ping_history.length; i++)
								{
									total += Game.player.ping_history[i];
								}
								Game.player.ping = Math.round(total / Game.player.ping_history.length);
								
							}
							
							// If ping data for another player was included...
							if (ping !== undefined && player_id && player_id !== Game.player.id)
							{
								
								// Update other players' ping...
								const player = Game.players[player_id];
								if (player)
								{
									player.ping = ping;
								}
								
							}
							
							// If the multiplayer connection is via P2P and the current player is the host...
							if (this.connection_type == this.ConnectionTypes.P2PClient && this.p2p_is_host)
							{
								
								// Validate sender's player ID...
								if (player_id && Game.players[player_id])
								{
									
									// Update sender's ping
									Game.players[player_id].ping = client_ping || 0;
									
									// Echo the timestamp back to the sender for their RTT calculation...
									const sender_connection = this.p2p_connections[player_id];
									if (sender_connection && sender_connection.p2p_data_channel && sender_connection.p2p_data_channel.readyState === 'open')
									{
										this.send(sender_connection.p2p_data_channel, {
											type: 		Multiplayer.MessageTypes.PING,
											timestamp: 	timestamp,
										});
									}
									
									// Broadcast the sender's ping to all other clients...
									this.broadcastP2P({
										type: 		Multiplayer.MessageTypes.PING,
										player_id: 	player_id,
										ping:		Game.players[player_id].ping,
									}, player_id);
								}
								
							}
							
							break;
						}
						
						// JOINED_GAME
						case this.MessageTypes.JOINED_GAME:
						{
							
							// Get message data
							const game = data.game;
							const player = data.player;
							const editor = data.editor;
							
							// Set game ID and update player list title
							Game.id = game.id;
							Game.ui.player_list.setTitle(game.name);
							
							// Replace player ID with the player ID generated server-side...
							if (Game.player.id != player.id)
							{
								Game.players[player.id] = Game.players[Game.player.id];
								delete Game.players[Game.player.id];
								Game.player.id = player.id;
							}
							
							// Add each player from the server's provided list of players to the game...
							game.players.forEach((player) => {
								
								// Make sure the player being added doesn't share the same ID as the current user-controlled player...
								if (player.id != Game.player.id)
								{
									
									// Add player to game (trust the player ID from the server)
									this.addPlayer(player, null, true);
									
								}
								
							});
							
							// Set editor state
							Editor.simplified = editor;
							
							// Add player joined message to chat log
							Game.ui.chat.addChatMessage(data);
							
							// Refresh player list and (re)start ping update interval
							Game.ui.player_list.refresh();
							Game.ui.player_list.startPingTimer();
							
							// (Re)Start ping measurement interval (for all non-hosts)...
							if (!this.p2p_is_host)
							{
								this.startPingTimer();
							}
							
							break;
						}
						
					//#endregion
					
					
				//#endregion
				
			}
			
		}
		
	//#endregion
	
	
	//#region [Methods]
		
		
		//#region [Server]
			
			
			//#region [Connectivity]
				
				/**
				 * Pings the specified server and attempts to update its game server listing.
				 * @param {string} server_address The address of the server to ping.
				 * @param {number} server_index Optional index of the server in its list.
				 * @param {boolean} skip_compression Flag indicating whether or not to skip encoding and compressing message data.
				 */
				static ping(server_address, server_index = null, skip_compression = false)
				{
					
					// Connect to the server
					let server = new WebSocket(server_address);
					
					// If not flagged to skip compression...
					if (!skip_compression)
					{
						
						// Set connection binary type for compressing and encoding messages
						server.binaryType = "arraybuffer";
						
					}
					
					// Record ping start time
					let start = Date.now();
					
					// Server connection open event...
					server.onopen = () => {
						
						// PING the server
						this.send(server, { type: 	Multiplayer.MessageTypes.PING, }, skip_compression);
						
					};
					
					// Server message event...
					server.onmessage = (event) => {
						
						// Get message data and parse it according to its source...
						let data;
						if (!skip_compression)
						{
							try { data = msgpack.decode(fflate.decompressSync(new Uint8Array(event.data))); } catch { return; }
						}
						else
						{
							try { data = JSON.parse(event.data); } catch { return; }
						}
						
						// Handle message by type...
						switch (data.type)
						{
							
							// PING
							case Multiplayer.MessageTypes.PING:
							{
								
								 // Calculate latency
								const latency = Date.now() - start;
								
								// Update the current dedicated server listing...
								if (Game.settings.multiplayer_default_connection_type == Multiplayer.ConnectionTypes.DedicatedClient)
								{
									
									// Get message data
									const game_id = data.game_id;
									const player_count = data.player_count;
									
									// Update current dedicated server listing
									Game.ui.menus.updateGamesListServerPlayerCount(server_index, player_count)
									Game.ui.menus.updateGamesListServerPing(server_index, latency);
									Game.ui.menus.updateGamesListServerGameID(server_index, game_id);
									
									
								} // Otherwise, update *all* P2P game listings from the current P2P signaling server...
								else if (Game.settings.multiplayer_default_connection_type == Multiplayer.ConnectionTypes.P2PClient)
								{
									
									// Get message data
									const games = data.games;
									
									// Update all P2P server listings from signaling server
									Game.ui.menus.updateP2PGamesList(games, latency);
									
								}
								
								break;
							}
							
						}
						
						// Close server connection
						server.close();
						
					};
					
					// Server connection error event...
					server.onerror = () => {
						
						// Server is offline, update server listing
						Game.ui.menus.updateGamesListServerPing(server_index, 0);
						
					};
					
					// Server connection close event
					server.onclose = () => {
						
						// Server connection closed
						
					};
					
				}
				
				/**
				 * Connects to a multiplayer server according to the specified connection type.
				 *
				 * @param {string} server_address The address of the server to connect to.
				 * @param {Multiplayer.ConnectionTypes} type Optional specific type of multiplayer connection to initialize (uses default otherwise).
				 * @param {Function} callback Optional callback to invoke when a connection has successfully opened.
				 */
				static connect(server_address, type = null, callback = null)
				{
					
					// Enable multiplayer
					this.enabled = true;
					
					// Set the new default multiplayer connection type...
					if (type != null)
					{
						Game.settings.multiplayer_default_connection_type = type;
					}
					
					// Use the default multiplayer connection type to derive the actual connection type
					this.connection_type = Game.settings.multiplayer_default_connection_type;
					
					// Handle P2P connections...
					if (this.connection_type == this.ConnectionTypes.P2PClient)
					{
						
						// Connect to the P2P signaling server
						this.server_signaling = new WebSocket(server_address);
						
						// Signaling server connection open event...
						this.server_signaling.onopen = () => {
							
							// Server is online
							Game.ui.menus.updateHostGameButton(false);
							Game.ui.menus.updateHostGameServerStatus("");
							
							// Signaling server connection opened...
							if (callback)
							{
								callback();
							}
							
						}
						
						// Signaling server message event...
						this.server_signaling.onmessage = (event) => {
							
							// Get message data
							const data = JSON.parse(event.data);
							
							// Handle message by type
							this.handleMessage(data);
							
						};
						
						// Signaling server connection error event...
						this.server_signaling.onerror = () => {
							
							// Server is offline
							Game.ui.menus.updateHostGameButton(true);
							Game.ui.menus.updateHostGameServerStatus("Could not reach signaling server '" + server_address + "'.");
							
						};
						
						// Signaling server connection close event...
						this.server_signaling.onclose = () => {
							
							// Signaling server connection closed
							
						};
						
						
					} // Handle Dedicated Server connections...
					else if (this.connection_type == this.ConnectionTypes.DedicatedClient)
					{
						
						// Connect to the dedicated server
						this.server_dedicated = new WebSocket(server_address);
						this.server_dedicated.binaryType = "arraybuffer";
						
						// Dedicated server connection open event...
						this.server_dedicated.onopen = () => {
							
							// Dedicated server connection opened...
							if (callback)
							{
								callback();
							}
							
						};
						
						// Dedicated server message event...
						this.server_dedicated.onmessage = (event) => {
							
							// Get message data
							const data = Game.msgpack.decode(Game.fflate.decompressSync(new Uint8Array(event.data)));
							
							// Handle message by type
							this.handleMessage(data);
							
						};
						
						// Dedicated server connection close event...
						this.server_dedicated.onclose = () => {
							
							// Dedicated server connection closed
							
						};
						
					}
					
				}
				
				/**
				 * Disconnects any active multiplayer server connections.
				 */
				static disconnect()
				{
					
					// Stop ping intervals...
					Multiplayer.stopPingTimer();
					if (Game.ui.player_list)
					{
						Game.ui.player_list.stopPingTimer();
					}
					
					// Disable multiplayer
					this.enabled = false;
					
					// Attempt to close any signaling server connections...
					if (this.server_signaling)
					{
						this.server_signaling.close();
					}
					
					// Attempt to close any dedicated server connections...
					if (this.server_dedicated)
					{
						this.server_dedicated.close();
					}
					
				}
				
				/**
				 * Hosts a new multiplayer game according to the current multiplayer connection type. Handles game's post-start logic in a callback function.
				 */
				static hostGame()
				{
					
					// Start the game with the post-start callback
					Game.start(this.hostGameCallback);
					
				}
				
				/**
				 * Hosted game post-start logic callback function.
				 */
				static hostGameCallback()
				{
					
					// If the player is connected to a P2P signaling server...
					if (Multiplayer.connection_type == Multiplayer.ConnectionTypes.P2PClient)
					{
						
						// Send a P2P_HOST_GAME message to the P2P signaling server
						Multiplayer.send(Multiplayer.server_signaling, {
							type: 			Multiplayer.MessageTypes.P2P_HOST_GAME,
							game_id: 		Game.id,
							game_name:		Game.name,
							player_id:		Game.player.id,
							player_name: 	Game.player.name,
						}, true);
						
					}
					
					// Update player list title and refresh player list
					Game.ui.player_list.setTitle(Game.name);
					Game.ui.player_list.refresh();
					Game.ui.player_list.startPingTimer();
					
				}
				
				/**
				 * Joins an existing multiplayer game by the specified game ID and current connection type. Handles game's post-start logic in a callback.
				 *
				 * @param {string} game_id The game ID of the multiplayer game to join.
				 */
				static joinGame(game_id)
				{
					
					// Set the game's ID to the ID of the game being joined
					Game.id = game_id;
					
					// Start the game with the post-start callback
					Game.start(this.joinGameCallback);
					
				}
				
				/**
				 * Joined game post-start logic callback function.
				 */
				static joinGameCallback()
				{
					
					// If the player is connected to a dedicated server...
					if (Multiplayer.connection_type == Multiplayer.ConnectionTypes.DedicatedClient)
					{
						
						// Send a DEDICATED_JOIN_GAME message to the dedicated server
						Multiplayer.send(Multiplayer.server_dedicated, {
							type:		Multiplayer.MessageTypes.DEDICATED_JOIN_GAME,
							game_id:	Game.id,
							player:		Game.player.simplified
						});
						
						
					} // Otherwise, if the player is connected to a P2P signaling server...
					else if (Multiplayer.connection_type == Multiplayer.ConnectionTypes.P2PClient)
					{
						
						// Send a P2P_JOIN_GAME message to the signaling server
						Multiplayer.send(Multiplayer.server_signaling, {
							type: 			Multiplayer.MessageTypes.P2P_JOIN_GAME,
							game_id: 		Game.id,
							player_id:		Game.player.id,
							player_name: 	Game.player.name,
						}, true);
						
					}
					
				}
				
			//#endregion
			
			
		//#endregion
		
		
		//#region [P2P]
			
			
			//#region [WebRTC]
				
				
				//#region [WebRTC P2P Initialization]
					
					/**
					 * Initializes a new P2P WebRTC connection and data channel with the specified player.
					 *
					 * @param {string} player_id The unique ID of the player to connect to.
					 */
					static initializeP2PConnection(player_id)
					{
						
						// Set connection type
						this.connection_type = this.ConnectionTypes.P2PClient;
						
						// Initialize P2P connection
						this.p2p_connections[player_id].p2p_connection = new RTCPeerConnection({
							iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
						});
						
						// If the current user-controlled player is the P2P host...
						if (this.p2p_is_host)
						{
							
							// Create a new a new data channel to communicate P2P messages through
							this.p2p_connections[player_id].p2p_data_channel = this.p2p_connections[player_id].p2p_connection.createDataChannel('pawbs-engine');
							
							// Initialize data channel
							this.initializeDataChannel(player_id);
							
							
						} // Otherwise, if the current user-controller player is the P2P client...
						else
						{
							// Offer received from P2P connection with host/Data channel opened event...
							this.p2p_connections[player_id].p2p_connection.ondatachannel = (event) => {
								
								// Receive the data channel from the P2P connection host's offer
								this.p2p_connections[player_id].p2p_data_channel = event.channel;
								
								// Initialize data channel with host
								this.initializeDataChannel(player_id);
								
							};
						}
						
						// New ICE candidate available event...
						this.p2p_connections[player_id].p2p_connection.onicecandidate = (event) => {
							
							// Check for candidate info...
							if (event.candidate)
							{
								
								// Send candidate info to opposite P2P connection peer (client->host & host->client, it's actually a 2-way exchange)
								this.send(this.server_signaling, {
									type: 		this.MessageTypes.P2P_CANDIDATE,
									game_id: 	Game.id,
									player_id:	Game.player.id,
									target_id:	player_id,
									signal: 	{
													type: 		'candidate',
													candidate:  event.candidate,
												}
								}, true);
								
							}
							
						};
						
					}
					
					/**
					 * Initializes a new P2P WebRTC data channel with the specified player.
					 *
					 * @param {string} player_id The unique ID of the player to connect to.
					 */
					static initializeDataChannel(player_id)
					{
						
						/**
						 * Helper to resolve the player ID for a given data channel.
						 * This handles the "peer" → real player_id re-mapping on the host.
						 */
						const getPlayerIdForChannel = (channel) => {
							const player_ids = Object.keys(this.p2p_connections);
							for (let i = 0; i < player_ids.length; i++)
							{
								const id = player_ids[i];
								const conn = this.p2p_connections[id];
								
								if (conn && conn.p2p_data_channel === channel)
								{
									return id;
								}
							}
							
							return null;
						};
						
						// Initialize P2P data channel
						const data_channel = this.p2p_connections[player_id].p2p_data_channel;
						data_channel.binaryType = "arraybuffer";
						
						// Data channel connection open event...
						data_channel.onopen = () => {
							
							// If the current user-controlled player is the P2P host...
							if (this.p2p_is_host)
							{
								
								// Data channel is now open, add a new empty P2P connection for the next peer to the connections list
								this.p2p_connections["peer"] = {
									p2p_connection: 	null,
									p2p_data_channel: 	null,
								};
								
								// Initialize the new empty P2P connection, event handlers, and data channel, so it's ready for the next peer to connect
								this.initializeP2PConnection("peer");
								
								
							} // Otherwise, if the current user-controlled player is the P2P client...
							else
							{
								
								// Notify P2P host that player successfully connected
								this.send(data_channel, {
									type: 		 Multiplayer.MessageTypes.PLAYER_JOINED,
									player: 	 Game.player.simplified
								});
								
							}
							
						};
						
						// Data channel message event...
						data_channel.onmessage = (event) => {
							
							// Get message data
							const data = Game.msgpack.decode(Game.fflate.decompressSync(new Uint8Array(event.data)));
							
							// If the current user-controlled player is the P2P host...
							if (this.p2p_is_host)
							{
								
								// Authoritatively override player ID...
								const sender_id = getPlayerIdForChannel(data_channel);
								if (sender_id)
								{
									data.player_id = sender_id;
								}
								
							}
							
							// Handle message by type
							this.handleMessage(data);
							
						};
						
						// Data channel connection close event...
						data_channel.onclose = () => {
							
							// Data channel successfully closed, do nothing
							
						};
						
					}
					
				//#endregion
				
				
				//#region [WebRTC P2P Handshake Process (Offer/Answer/Candidates)]
					
					/**
					 * Initializes the P2P host's new WebRTC P2P data channel connection offer to send to the P2P client.
					 *
					 * @param {string} player_id The unique ID of the P2P client to send a WebRTC offer signal to.
					 */
					static initializeOffer(player_id)
					{
						
						// Assign P2P client to the previously-initialized empty P2P connection
						this.p2p_connections[player_id] = this.p2p_connections["peer"];
						delete this.p2p_connections["peer"];
						
						// Re-initialize new ICE candidate available event...
						this.p2p_connections[player_id].p2p_connection.onicecandidate = (event) => {
							
							// Check for candidate info...
							if (event.candidate)
							{
								
								// Send candidate info signal to opposing P2P connection peer
								this.send(this.server_signaling, {
									type: 		this.MessageTypes.P2P_CANDIDATE,
									game_id: 	Game.id,
									player_id:	Game.player.id,
									target_id:	player_id,
									signal: 	{
													type: 		'candidate',
													candidate:  event.candidate,
												}
								}, true);
								
							}
							
						};
						
						// Initialize WebRTC data channel connection offer for P2P host to send to P2P client...
						this.p2p_connections[player_id].p2p_connection.createOffer()
							.then(offer => this.p2p_connections[player_id].p2p_connection.setLocalDescription(offer))
							.then(() => {
								
								// Send WebRTC data channel offer signal to P2P client
								this.send(this.server_signaling, {
									type: 		this.MessageTypes.P2P_OFFER,
									host_id:	Game.player.id,
									game_id: 	Game.id,
									player_id:	player_id,
									signal: 	this.p2p_connections[player_id].p2p_connection.localDescription
								}, true);
								
							})
							.catch(error => console.error(error));
						
					}
					
					/**
					 * Handles the P2P client's receipt of a WebRTC connection offer signal from the P2P host.
					 *
					 * @param {string} host_id The unique ID of the P2P host offering a connection.
					 * @param {RTCSessionDescription} signal The WebRTC session description used to initiate a P2P connection.
					 */
					static handleOffer(host_id, signal)
					{
						
						// Make sure signal is an offer...
						if (signal.type === 'offer')
						{
						
							// Get the P2P host's player ID
							this.p2p_host_id = host_id;
							
							// Make sure the P2P host's connection object has been initialized...
							if (this.p2p_connections[host_id].p2p_connection)
							{
								
								// Use the P2P host's provided local session description to set their connection's remote session description, then create an answer signal and send it back to the P2P host...
								this.p2p_connections[host_id].p2p_connection.setRemoteDescription(new RTCSessionDescription(signal))
								.then(() => this.p2p_connections[host_id].p2p_connection.createAnswer())
								.then(answer => this.p2p_connections[host_id].p2p_connection.setLocalDescription(answer))
								.then(() => {
									
									// Send WebRTC data channel answer signal to P2P host
									this.send(this.server_signaling, {
										type: 		this.MessageTypes.P2P_ANSWER,
										game_id: 	Game.id,
										player_id: 	Game.player.id,
										signal: 	this.p2p_connections[host_id].p2p_connection.localDescription
									}, true);
									
								}).catch(error => console.error(error));
								
							}
							
						}
					}
					
					/**
					 * Handles the P2P host's receipt of a WebRTC answer signal from the P2P client.
					 *
					 * @param {string} player_id The unique ID of the P2P client providing the answer signal.
					 * @param {RTCSessionDescription} signal The WebRTC session description used to complete a P2P connection.
					 */
					static handleAnswer(player_id, signal)
					{
						
						// Make sure signal is an answer...
						if (signal.type === 'answer')
						{
							
							// Make sure the P2P client's connection object has been initialized...
							if (this.p2p_connections[player_id].p2p_connection)
							{
								
								// Use the P2P client's provided local session description to set their connection's remote session description
								this.p2p_connections[player_id].p2p_connection.setRemoteDescription(new RTCSessionDescription(signal)).catch(error => console.error(error));
								
							}
							
						}
						
					}
					
					/**
					 * Handles both the P2P host's and P2P client's receipt of a WebRTC candidate signal from the opposing player.
					 *
					 * @param {string} player_id The unique ID of the P2P host or client who sent the signal to the current player.
					 */
					static handleCandidate(player_id, signal)
					{
						
						// Make sure the specified player's connection object has been initialized...
						if (this.p2p_connections[player_id].p2p_connection)
						{
							
							// Make sure signal is a candidate...
							if (signal.type === 'candidate')
							{
								
								// Add the ICE candidate to the specified player's P2P connection's collection of ICE candidates
								this.p2p_connections[player_id].p2p_connection.addIceCandidate(new RTCIceCandidate(signal.candidate)).catch(error => console.error(error));
								
							}
							
						}
						
					}
					
				//#endregion
				
				
			//#endregion
			
			
			//#region [Broadcasts]
				
				/**
				 * Broadcasts the specified data to all of the host's P2P connections.
				 *
				 * @param {Object} data The message to be broadcast to all of the host's connected P2P clients.
				 * @param {string} id_skip The player ID to skip over sending a broadcast to.
				 */
				static broadcastP2P(data, id_skip = null)
				{
					
					// Iterate through each player ID...
					const player_ids = Object.keys(this.p2p_connections);
					for (let i = 0; i < player_ids.length; i++)
					{
						
						// If the current player ID isn't flagged to be skipped...
						const player_id = player_ids[i];
						if (player_id != id_skip)
						{
							
							// Get the current player's P2P connection and check if its data channel is initialized...
							const p2p_connection = this.p2p_connections[player_id];
							if (p2p_connection.p2p_data_channel)
							{
								
								// If the P2P connection's data channel is ready for broadcast...
								if (p2p_connection.p2p_data_channel.readyState === 'open')
								{
									
									// Send specified message over data channel
									this.send(p2p_connection.p2p_data_channel, data);
									
								}
								
							}
							
						}
						
					}
					
				}
				
			//#endregion
			
			
		//#endregion
		
		
		//#region [In-Game]
			
			
			//#region [Broadcasts]
				
				/**
				 * Broadcasts a chat message out to all players in the game.
				 *
				 * @param {string} message The chat message to send to all players.
				 */
				static sendChatMessage(message)
				{
					
					// If the message isn't empty...
					if (message != "")
					{
						
						// Initialize message data
						const data = {
							type: 		Multiplayer.MessageTypes.CHAT,
							player_id: 	Game.player.id,
							message: 	message,
						};
						
						// Send message data
						this.sendByConnectionType(data, Multiplayer.MessageTypes.CHAT, Multiplayer.MessageTypes.CHAT, false,
						function() {
							
							// Dedicated Server Callback
							
							// Clear the chat input box
							Game.ui.chat.clearChatMessage();
							
						},
						function() {
							
							// P2P Client Callback
							
							// Clear the chat input box
							Game.ui.chat.clearChatMessage();
							
							// Add chat message to chat log
							Game.ui.chat.addChatMessage(data);
							
						},
						function() {
							
							// P2P Host Callback
							
							// Clear the chat input box
							Game.ui.chat.clearChatMessage();
							
						});
						
					}
					
				}
				
				/**
				 * Broadcasts an update with the current player's attributes to all players in the game.
				 */
				static sendPlayerUpdate()
				{
					
					// Get timestamp
					const now = performance.now();
					
					// If the player's update rate allows them to send a message...
					if (now - this.player_update_last >= this.player_update_rate)
					{
						
						// Set new player update timestamp
						this.player_update_last = now;
						
						// Initialize message data
						const data = {
							type: 		Multiplayer.MessageTypes.PLAYER_UPDATED,
							player_id: 	Game.player.id,
							position: 	{ x: Game.player.position.x.toFixed(4), y: Game.player.position.y.toFixed(4), z: Game.player.position.z.toFixed(4) },
							rotation: 	{ x: Game.player.rotation._x.toFixed(4), y: Game.player.rotation._y.toFixed(4), z: Game.player.rotation._z.toFixed(4) },
						};
						
						// Send message data
						this.sendByConnectionType(data, Multiplayer.MessageTypes.UPDATE_PLAYER, Multiplayer.MessageTypes.PLAYER_UPDATED);
						
					}
					
				}
				
			//#endregion
			
			
			//#region [Ping]
				
				/**
				 * Sends a PING message to measure latency.
				 */
				static sendPing()
				{
					
					// Get timestamp for RTT (Rount-Trip Time) calculation
					this.ping_timestamp = performance.now();
					
					// Initialize message data
					const data = {
						type: 			Multiplayer.MessageTypes.PING,
						timestamp: 		this.ping_timestamp,
						client_ping: 	Game.player.ping,
					};
					
					// If the player is connected to a dedicated server...
					if (this.connection_type == this.ConnectionTypes.DedicatedClient)
					{
						
						// Send ping to dedicated server...
						if (this.server_dedicated && this.server_dedicated.readyState === WebSocket.OPEN)
						{
							this.send(this.server_dedicated, data);
						}
						
						
					} // Otherwise, if the player is a P2P client connected to a P2P host...
					else if (this.connection_type == this.ConnectionTypes.P2PClient && !this.p2p_is_host)
					{
						
						// Send ping to P2P host...
						const p2p_data_channel = this.p2p_connections[this.p2p_host_id].p2p_data_channel;
						if (p2p_data_channel && p2p_data_channel.readyState === 'open')
						{
							this.send(p2p_data_channel, data);
						}
						
					}
					
				}
				
				/**
				 * Starts the in-game ping update timer for periodic latency measurement.
				 */
				static startPingTimer()
				{
					
					// Clear any existing interval timers...
					if (this.ping_interval)
					{
						clearInterval(this.ping_interval);
					}
					
					// Start new interval timer
					this.ping_interval = setInterval(() => { this.sendPing(); }, this.ping_rate);
					
					// Send initial ping immediately
					this.sendPing();
					
				}
				
				/**
				 * Stops the in-game ping update timer.
				 */
				static stopPingTimer()
				{
					
					// Clear any existing interval timers...
					if (this.ping_interval)
					{
						clearInterval(this.ping_interval);
						this.ping_interval = null;
					}
					
				}
				
			//#endregion
			
			
			//#region [Objects]
				
				/**
				 * Broadcasts an update to add the specified object to the world.
				 *
				 * @param {THREE.Object3D} object The object to add to the world.
				 */
				static sendObjectAdd(object)
				{
					
					// If the object isn't empty...
					if (object)
					{
						
						// Initialize message data
						const data = {
							type: 		Multiplayer.MessageTypes.OBJECT_ADDED,
							player_id: 	Game.player.id,
							object: 	object.simplified(),
						};
						
						// Send message data
						this.sendByConnectionType(data, Multiplayer.MessageTypes.ADD_OBJECT, Multiplayer.MessageTypes.OBJECT_ADDED);
						
					}
					
				}
				
				/**
				 * Broadcasts an update with the specified object's attributes to all players in the game.
				 *
				 * @param {THREE.Object3D} object The object to be updated.
				 */
				static sendObjectUpdate(object)
				{
					
					// If the object exists...
					if (object)
					{
						
						// Initialize message data
						const data = {
							type: 		Multiplayer.MessageTypes.OBJECT_UPDATED,
							player_id: 	Game.player.id,
							object: 	object,
						};
						
						// Send message data
						this.sendByConnectionType(data, Multiplayer.MessageTypes.UPDATE_OBJECT, Multiplayer.MessageTypes.OBJECT_UPDATED);
						
					}
					
				}
				
				/**
				 * Broadcasts an update to remove the specified object from the world.
				 *
				 * @param {THREE.Object3D} object The object to be removed from the world.
				 */
				static sendObjectRemove(object)
				{
					
					// If the object exists...
					if (object)
					{
						
						// Initialize message data
						const data = {
							type: 		Multiplayer.MessageTypes.REMOVE_OBJECT,
							player_id: 	Game.player.id,
							object_id: 	object.uuid,
						};
						
						// Send message data
						this.sendByConnectionType(data, Multiplayer.MessageTypes.REMOVE_OBJECT, Multiplayer.MessageTypes.OBJECT_REMOVED);
						
					}
					
				}
				
			//#endregion
			
			
			//#region [Functions]
				
				/**
				 * Sends the provided message data through the player's active multiplayer connection, optionally modifying message type and invoking callback methods according to multiplayer connection type.
				 *
				 * @param {Object} data The message data to be sent.
				 * @param {Multiplayer.MessageTypes} type_dedicated Optional message type to be sent to a dedicated server.
				 * @param {Multiplayer.MessageTypes} type_p2p Optional message type to be sent to a P2P host.
				 * @param {boolean} skip_compression Optional flag indicating whether or not to skip encoding and compressing message data.
				 * @param {Function} dedicatedCallback Optional callback function which is invoked after message data is sent to a dedicated server.
				 * @param {Function} p2pClientCallback Optional callback function which is invoked after message data is sent to a P2P host.
				 * @param {Function} p2pHostCallback Optional callback function which is invoked after message data is broadcast to all P2P clients.
				 */
				static sendByConnectionType(data, type_dedicated = null, type_p2p = null, skip_compression = false, dedicatedCallback = null, p2pClientCallback = null, p2pHostCallback = null)
				{
					
					// If the player is connected to a dedicated server...
					if (this.connection_type == this.ConnectionTypes.DedicatedClient)
					{
						
						// If the dedicated server is ready for broadcast...
						if (this.server_dedicated && this.server_dedicated.readyState === WebSocket.OPEN)
						{
							
							// Set type to be received by a dedicated server...
							if (type_dedicated)
							{
								data.type = type_dedicated;
							}
							
							// Send the message to the dedicated server for broadcast
							this.send(this.server_dedicated, data, skip_compression);
							
							// Invoke dedicated server message sent callback...
							if (dedicatedCallback)
							{
								dedicatedCallback();
							}
							
						}
						
						
					} // Otherwise, if the player is connected to a P2P signaling server...
					else if (this.connection_type == this.ConnectionTypes.P2PClient)
					{
						
						// Set type to be received by a P2P host...
						if (type_p2p)
						{
							data.type = type_p2p;
						}
						
						// If the player is the P2P host...
						if (this.p2p_is_host)
						{
							
							// Forward message data to self as a received event for broadcast to all peers
							this.handleMessage(data);
							
							// Invoke P2P host message broadcast callback...
							if (p2pHostCallback)
							{
								p2pHostCallback();
							}
							
							
						} // Otherwise, if the player is not the P2P host...
						else
						{
							
							// Get the P2P host's data channel
							const p2p_data_channel = this.p2p_connections[this.p2p_host_id].p2p_data_channel;
							
							// If the P2P host's data channel is ready for broadcast...
							if (p2p_data_channel && p2p_data_channel.readyState === 'open')
							{
								
								// Send the message to the P2P host for broadcast
								this.send(p2p_data_channel, data, skip_compression);
								
								// Invoke P2P client message sent callback...
								if (p2pClientCallback)
								{
									p2pClientCallback();
								}
								
							}
							
						}
						
					}
					
				}
				
				/**
				 * Sends the provided message data through the specified communication channel (either a WebSocket or an RTCDataChannel).
				 *
				 * @param {Object} channel The communication channel through which to send data. Object must have a send() function.
				 * @param {Object} data The message data to be sent.
				 * @param {boolean} skip_compression Flag indicating whether or not to skip encoding and compressing message data.
				 */
				static send(channel, data, skip_compression = false)
				{
					
					// If communication channel object has a send() function...
					if (typeof channel["send"] === 'function')
					{
						
						// If flagged to skip compression...
						if (skip_compression)
						{
							
							// Send message data as regular JSON string
							channel.send(JSON.stringify(data));
							
							
						} // Otherwise, if not flagged to skip compression...
						else
						{
							
							// Send message data after encoding it with MessagePack and compressing it with fflate 
							channel.send(Game.fflate.compressSync(Game.msgpack.encode(data)));
							
						}
						
					}
					
				}
				
				/**
				 * Lists all players in the current game with only the attributes which are required to initialize them in another player's game.
				 *
				 * @returns Returns a simplified list of players in the current game.
				 */
				static listPlayers()
				{
					
					// Initialize the empty list of players
					const players = [];
					
					// Iterate through each player ID...
					const player_ids = Object.keys(Game.players);
					for (let i = 0; i < player_ids.length; i++)
					{
						
						// Get player by ID
						const player = Game.players[player_ids[i]];
						
						// Add the simplified player object to the list
						players.push(player.simplified);
						
					}
					
					// Return the list
					return players;
					
				}
				
				/**
				 * Adds a new player to the game.
				 *
				 * @param {Player} player The player to be added to the game.
				 * @param {WebSocket|RTCDataChannel} connection An optional WebSocketServer connection to the player.
				 * @param {boolean} trust_player_id Flag indicating whether or not to trust the player ID as it's been received from over the network.
				 * @returns Returns the player's simplified object after they've been added to the game.
				 */
				static addPlayer(player, connection, use_existing_id)
				{
					
					// Initialize new player
					let new_player = new Player();
					new_player.name = player.name;
					new_player.colour = new THREE.Color(player.colour.r, player.colour.g, player.colour.b)
					new_player.position.set(player.position.x, player.position.y, player.position.z);
					new_player.rotation.set(player.rotation.x, player.rotation.y, player.rotation.z);
					
					// If the player's ID is to be trusted (meaning a non-authorative client is adding the player to their game)...
					if (use_existing_id)
					{
						new_player.id = player.id;
					}
					
					// Initialize optional WebSocketServer connection...
					if (connection)
					{
						new_player.connection = connection;
						new_player.controls = new Controls();
					}
					
					// Add player to game
					Game.players[new_player.id] = new_player;
					
					// Return simplified new player
					return new_player.simplified;
					
				}
				
				/**
				 * Removes the specified player from the game.
				 *
				 * @param {string} player_id The unique ID of the player to be removed from the server.
				 */
				static removePlayer(player_id)
				{
					
					// Remove player from game
					delete Game.players[player_id];
					
				}
				
			//#endregion
			
			
		//#endregion
		
		
	//#endregion
	
}
export default Multiplayer;