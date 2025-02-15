// three.js Imports
import * as THREE from '../libraries/threejs/three.js';

// Class Imports
import Player from './player.class.js';
import Controls from './controls.class.js';

// Static Class Imports
import Game from './game.class.js';

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
				
				// Actions
				   JOINED_GAME: 501,
				 UPDATE_PLAYER: 502,
				
			};
			
		//#endregion
		
		
	//#endregion
	
	
	//#region [Constructor]
		
		/**
		 * Static class constructor.
		 */
		static { }
		
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
							
							// Get message data
							const game = data.game;
							const player = data.player;
							
							// Forward message data as JOINED_GAME event
							this.handleMessage({
								type: 		Multiplayer.MessageTypes.JOINED_GAME,
								game: 		game,
								player: 	player,
							});
							
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
							
							// If a new player has joined the game...
							if (player.id != Game.player.id)
							{
								
								// Add new player to game
								this.addPlayer(player);
								
								// Add player joined message to chat log
								Game.ui.chat.addChatMessage(data);
								
							}
							
							// If the multiplayer connection is via P2P and the current player is the host...
							if (this.connection_type == this.ConnectionTypes.P2PClient && this.p2p_is_host)
							{
								
								// Send a JOINED_GAME event back to the player who joined the game
								this.p2p_connections[player.id].p2p_data_channel.send(JSON.stringify({
									type: 		Multiplayer.MessageTypes.JOINED_GAME,
									game: 		Game.simplified,
									player: 	player,
								}));
								
								// Broadcast a PLAYER_JOINED event to all players except for the player which was just sent that JOINED_GAME event right above this
								this.broadcastP2P({
									type: 		 Multiplayer.MessageTypes.PLAYER_JOINED,
									player: 	 player,
								}, player.id);
								
							}
							
							break;
						}
						
						// PLAYER_UPDATED
						case this.MessageTypes.PLAYER_UPDATED:
						{
							
							// Get message data
							const player_id = data.player_id;
							const position = data.position;
							const rotation = data.rotation;
							
							// Only update players who aren't the current player...
							if (Game.player.id != player_id)
							{
								
								// Get player to be updated
								let player = Game.players[player_id];
								
								// Update player
								player.position.set(parseFloat(position.x), parseFloat(position.y), parseFloat(position.z));
								player.rotation.set(parseFloat(rotation.x), parseFloat(rotation.y), parseFloat(rotation.z));
								
							}
							
							// If the multiplayer connection is via P2P and the current player is the host...
							if (this.connection_type == this.ConnectionTypes.P2PClient && this.p2p_is_host)
							{
								
								// Broadcast a PLAYER_UPDATED event to all players except for the current player
								this.broadcastP2P(data, Game.player.id);
								
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
							
							break;
						}
						
					//#endregion
					
					
					//#region [Actions]
						
						// JOINED_GAME
						case this.MessageTypes.JOINED_GAME:
						{
							
							// Get message data
							const game = data.game;
							const player = data.player;
							
							// Set game ID
							Game.id = game.id;
							
							// Replace player ID with the player ID generated server-side
							if (Game.player.id != player.id)
							{
								Game.players[player.id] = Game.players[Game.player.id];
								delete Game.players[Game.player.id];
								Game.player.id = player.id;
							}
							
							// Add each player from the server's provided list of players to the game...
							game.players.forEach((player) => {
								if (player.id != Game.player.id)
								{
									
									// Add player to game
									this.addPlayer(player);
									
								}
							});
							
							// Add player joined message to chat log
							Game.ui.chat.addChatMessage(data);
							
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
				 * Pings the specified server and attempts to update its server listing.
				 * @param {string} server_address The address of the server to ping.
				 * @param {number} server_index Optional index of the server in its list.
				 */
				static ping(server_address, server_index = null)
				{
					
					// Connect to the server
					let server = new WebSocket(server_address);
					
					// Record ping start time
					let start = Date.now();
					
					// Server connection open event
					server.onopen = () => {
						
						// PING the server
						server.send(JSON.stringify({
							type: 	Multiplayer.MessageTypes.PING,
						}));
						
					};
					
					// Server message event
					server.onmessage = (event) => {
						
						// Get message data and parse it
						let data;
						try { data = JSON.parse(event.data); } catch { return; }
						
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
									
									// Update server listing
									Game.ui.menus.updateGamesListServerPlayerCount(server_index, player_count)
									Game.ui.menus.updateGamesListServerPing(server_index, latency);
									Game.ui.menus.updateGamesListServerGameID(server_index, game_id);
									
									
								} // Otherwise, update *all* P2P game listings from the current P2P signaling server...
								else if (Game.settings.multiplayer_default_connection_type == Multiplayer.ConnectionTypes.P2PClient)
								{
									
									// Get message data
									const games = data.games;
									
									// Update server listing
									Game.ui.menus.updateGamesListCallback(games, latency);
									
								}
								
								break;
							}
							
						}
						
						// Close server connection
						server.close();
						
					};
					
					// Server connection error event
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
						
						// Signaling server connection open event
						this.server_signaling.onopen = () => {
							
							// Signaling server connection opened
							if (callback)
							{
								callback();
							}
							
						}
						
						// Signaling server message event
						this.server_signaling.onmessage = (event) => {
							
							// Get message data
							const data = JSON.parse(event.data);
							
							// Handle message by type
							this.handleMessage(data);
						};
						
						// Signaling server connection error event
						this.server_signaling.onerror = () => {
							
							// Server is offline
							Game.ui.menus.updateHostGameServerStatus("Could not reach signaling server '" + server_address + "'.");
							
						};
						
						// Signaling server connection close event
						this.server_signaling.onclose = () => {
							
							// Signaling server connection closed
							
						};
						
						
					} // Handle Dedicated Server connections...
					else if (this.connection_type == this.ConnectionTypes.DedicatedClient)
					{
						
						// Connect to the dedicated server
						this.server_dedicated = new WebSocket(server_address);
						
						// Dedicated server connection open event
						this.server_dedicated.onopen = () => {
							
							// Dedicated server connection opened
							if (callback)
							{
								callback();
							}
							
						};
						
						// Dedicated server message event
						this.server_dedicated.onmessage = (event) => {
							
							// Get message data
							const data = JSON.parse(event.data);
							
							// Handle message by type
							this.handleMessage(data);
							
						};
						
						// Dedicated server connection close event
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
						Multiplayer.server_signaling.send(JSON.stringify({
							type: 			Multiplayer.MessageTypes.P2P_HOST_GAME,
							game_id: 		Game.id,
							game_name:		Game.name,
							player_id:		Game.player.id,
							player_name: 	Game.player.name,
						}));
						
					}
					
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
						Multiplayer.server_dedicated.send(JSON.stringify({
							type:		Multiplayer.MessageTypes.DEDICATED_JOIN_GAME,
							game_id:	Game.id,
							player:		Game.player.simplified
						}));
						
						
					} // Otherwise, if the player is connected to a P2P signaling server...
					else if (Multiplayer.connection_type == Multiplayer.ConnectionTypes.P2PClient)
					{
						
						// Send a P2P_JOIN_GAME message to the signaling server
						Multiplayer.server_signaling.send(JSON.stringify({
							type: 			Multiplayer.MessageTypes.P2P_JOIN_GAME,
							game_id: 		Game.id,
							player_id:		Game.player.id,
							player_name: 	Game.player.name,
						}));
						
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
							// Offer received from P2P connection with host/Data channel opened event
							this.p2p_connections[player_id].p2p_connection.ondatachannel = (event) => {
								
								// Receive the data channel from the P2P connection host's offer
								this.p2p_connections[player_id].p2p_data_channel = event.channel;
								
								// Initialize data channel with host
								this.initializeDataChannel(player_id);
								
							};
						}
						
						// New ICE candidate available event
						this.p2p_connections[player_id].p2p_connection.onicecandidate = (event) => {
							
							// Check for candidate info...
							if (event.candidate)
							{
								
								// Send candidate info to opposite P2P connection peer (client->host & host->client, it's actually a 2-way exchange)
								this.server_signaling.send(JSON.stringify({
									type: 		this.MessageTypes.P2P_CANDIDATE,
									game_id: 	Game.id,
									player_id:	Game.player.id,
									target_id:	player_id,
									signal: 	{
													type: 		'candidate',
													candidate:  event.candidate,
												}
								}));
								
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
						
						// Initialize P2P data channel
						const data_channel = this.p2p_connections[player_id].p2p_data_channel;
						
						// Data channel connection open event
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
								data_channel.send(JSON.stringify({
									type: 		 Multiplayer.MessageTypes.PLAYER_JOINED,
									player: 	 Game.player.simplified
								}));
								
							}
							
						};
						
						// Data channel message event
						data_channel.onmessage = (event) => {
							
							// Get message data
							const data = JSON.parse(event.data);
							
							// Handle message by type
							this.handleMessage(data);
							
						};
						
						// Data channel connection close event
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
						
						// Re-initialize new ICE candidate available event
						this.p2p_connections[player_id].p2p_connection.onicecandidate = (event) => {
							
							// Check for candidate info...
							if (event.candidate)
							{
								
								// Send candidate info signal to opposing P2P connection peer
								this.server_signaling.send(JSON.stringify({
									type: 		this.MessageTypes.P2P_CANDIDATE,
									game_id: 	Game.id,
									player_id:	Game.player.id,
									target_id:	player_id,
									signal: 	{
													type: 		'candidate',
													candidate:  event.candidate,
												}
								}));
								
							}
							
						};
						
						// Initialize WebRTC data channel connection offer for P2P host to send to P2P client...
						this.p2p_connections[player_id].p2p_connection.createOffer()
							.then(offer => this.p2p_connections[player_id].p2p_connection.setLocalDescription(offer))
							.then(() => {
								
								// Send WebRTC data channel offer signal to P2P client
								this.server_signaling.send(JSON.stringify({
									type: 		this.MessageTypes.P2P_OFFER,
									host_id:	Game.player.id,
									game_id: 	Game.id,
									player_id:	player_id,
									signal: 	this.p2p_connections[player_id].p2p_connection.localDescription
								}));
								
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
									this.server_signaling.send(JSON.stringify({
										type: 		this.MessageTypes.P2P_ANSWER,
										game_id: 	Game.id,
										player_id: 	Game.player.id,
										signal: 	this.p2p_connections[host_id].p2p_connection.localDescription
									}));
									
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
				 * @param {object} data The message to be broadcast to all of the host's connected P2P clients.
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
									p2p_connection.p2p_data_channel.send(JSON.stringify(data));
									
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
						
						// If the player is connected to a dedicated server...
						if (this.connection_type == this.ConnectionTypes.DedicatedClient)
						{
							
							// If the dedicated server is ready for broadcast...
							if (this.server_dedicated && this.server_dedicated.readyState === WebSocket.OPEN)
							{
								
								// Send the chat message to the dedicated server for broadcast
								this.server_dedicated.send(JSON.stringify({
									type: 		Multiplayer.MessageTypes.CHAT,
									player_id: 	Game.player.id,
									message: 	message,
								}));
								
								// Clear the chat input box
								Game.ui.chat.clearChatMessage();
								
							}
							
							
						} // Otherwise, if the player is connected to a P2P signaling server...
						else if (this.connection_type == this.ConnectionTypes.P2PClient)
						{
							
							// If the player is the P2P host...
							if (this.p2p_is_host)
							{
								
								// Forward message data as CHAT event
								this.handleMessage({
									type: 		Multiplayer.MessageTypes.CHAT,
									player_id:	Game.player.id,
									message:	message,
								});
								
								// Clear the chat input box
								Game.ui.chat.clearChatMessage();
								
								
							} // Otherwise, if the player is not the P2P host...
							else
							{
								
								// Get the P2P host's data channel
								const p2p_data_channel = this.p2p_connections[this.p2p_host_id].p2p_data_channel;
								
								// If the P2P host's data channel is ready for broadcast...
								if (p2p_data_channel && p2p_data_channel.readyState === 'open')
								{
									
									// Send the chat message to the P2P host for broadcast
									const data = {
										type: 	 	Multiplayer.MessageTypes.CHAT,
										player_id: 	Game.player.id,
										message: 	message,
									};
									p2p_data_channel.send(JSON.stringify(data));
									
									// Clear the chat input box
									Game.ui.chat.clearChatMessage();
									
									// Add chat message to chat log
									Game.ui.chat.addChatMessage(data);
									
								}
								
							}
							
						}
						
					}
					
				}
				
				/**
				 * Broadcasts an update with each of the current player's modified attributes to all players in the game.
				 */
				static sendPlayerUpdate()
				{
					
					// If the player is connected to a P2P signaling server...
					if (this.connection_type == this.ConnectionTypes.P2PClient)
					{
						
						// If the player is the P2P host...
						if (this.p2p_is_host)
						{
							
							// Forward message data as PLAYER_UPDATED event
							this.handleMessage({
								type: 		Multiplayer.MessageTypes.PLAYER_UPDATED,
								player_id: 	Game.player.id,
								position: 	{ x: Game.player.position.x.toFixed(4), y: Game.player.position.y.toFixed(4), z: Game.player.position.z.toFixed(4) },
								rotation: 	{ x: Game.player.rotation._x.toFixed(4), y: Game.player.rotation._y.toFixed(4), z: Game.player.rotation._z.toFixed(4) },
							});
							
							
						} // Otherwise, if the player is not the P2P host...
						else
						{
							
							// Get the P2P host's data channel
							const p2p_data_channel = this.p2p_connections[this.p2p_host_id].p2p_data_channel;
							
							// If the P2P host's data channel is ready for broadcast...
							if (p2p_data_channel && p2p_data_channel.readyState === 'open')
							{
								
								// Send the PLAYER_UPDATED message to the P2P host for broadcast
								p2p_data_channel.send(JSON.stringify({
									type: 		Multiplayer.MessageTypes.PLAYER_UPDATED,
									player_id: 	Game.player.id,
									position: 	{ x: Game.player.position.x.toFixed(4), y: Game.player.position.y.toFixed(4), z: Game.player.position.z.toFixed(4) },
									rotation: 	{ x: Game.player.rotation._x.toFixed(4), y: Game.player.rotation._y.toFixed(4), z: Game.player.rotation._z.toFixed(4) },
								}));
								
							}
							
						}
						
						
					} // Otherwise, if the player is connected to a dedicated server...
					else
					{
						
						// If the dedicated server is ready for broadcast...
						if (this.server_dedicated && this.server_dedicated.readyState === WebSocket.OPEN)
						{
							
							// Send the UPDATE_PLAYER message to the dedicated server for broadcast
							this.server_dedicated.send(JSON.stringify({
								type: 		Multiplayer.MessageTypes.UPDATE_PLAYER,
								player_id: 	Game.player.id,
								position: 	{ x: Game.player.position.x.toFixed(4), y: Game.player.position.y.toFixed(4), z: Game.player.position.z.toFixed(4) },
								rotation: 	{ x: Game.player.rotation._x.toFixed(4), y: Game.player.rotation._y.toFixed(4), z: Game.player.rotation._z.toFixed(4) },
							}));
							
						}
						
					}
					
				}
				
			//#endregion
			
			
			//#region [Functions]
				
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
				 * @param {WebSocket} connection An optional WebSocketServer connection to the player.
				 * @returns Returns the player's simplified object after they've been added to the game.
				 */
				static addPlayer(player, connection)
				{
					
					// Initialize new player
					let new_player = new Player();
					new_player.id = player.id;
					new_player.name = player.name;
					new_player.colour = new THREE.Color(player.colour);
					new_player.position.set(player.position.x, player.position.y, player.position.z);
					new_player.rotation.set(player.rotation.x, player.rotation.y, player.rotation.z);
					
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