// Static Class Imports
import Game from './game.class.js';
import Multiplayer from './multiplayer.class.js';

/**
 * A serializable object containing the game's settings and defaults.
 */
class Settings
{
	
	//#region [Class Declarations / Constructor]
		
		/**
		 * Initializes a new settings object to provide serializable default values to the game.
		 */
		constructor()
		{
			
			//#region [Default Files/Folders]
				
				
				//#region [Game Root Directory Path]
					
					/**
					 * The default local game root path.
					 */
					this.path_local_root = ".";
					
					/**
					 * The default local game root path when the game is started from the npm start command in the repository root directory.
					 */
					this.path_local_root_shortcut = "..";
					
					/**
					 * The default local game root path when the game is started from a single shortcut in the repository root directory.
					 */
					this.path_local_root_shortcut_single = "..";
					
					/**
					 * The default remote game root path.
					 */
					this.path_remote_root = "..";
					
					/**
					 * The default remote game root path when the game is running from a container.
					 */
					this.path_remote_root_containerized = "./src";
					
				//#endregion
				
				
				//#region [Server Root Directory Path]
					
					/**
					 * The default local server root path.
					 */
					this.path_local_server_root = "..";
					
					/**
					 * The default local server root path when the server is started from the npm start command in the repository root directory.
					 */
					this.path_local_server_root_shortcut = "./src";
					
					/**
					 * The default local server root path when the server is started from a single shortcut in the repository root directory.
					 */
					this.path_local_server_root_shortcut_single = "..";
					
					/**
					 * The default remote server root path.
					 */
					this.path_remote_server_root = "./src";
					
					/**
					 * The default remote server root path when the server is running from inside a container.
					 */
					this.path_remote_server_root_containerized = "./src";
					
				//#endregion
				
				
				//#region [JSON File Paths]
					
					/**
					 * The default local game settings JSON file path.
					 */
					this.path_local_settings = "/settings.json";
					
					/**
					 * The default local game worlds list JSON file path.
					 */
					this.path_local_worlds = "/worlds/worlds.json";
					
					/**
					 * The default local object assets list JSON file path.
					 */
					this.path_local_objects = "/objects/objects.json";
					
					/**
					 * The default local texture assets list JSON file path.
					 */
					this.path_local_textures = "/textures/textures.json";
					
					/**
					 * The default local dedicated servers list JSON file path.
					 */
					this.path_local_servers = "/servers/servers.json";
					
					/**
					 * The default remote dedicated servers list JSON file path.
					 */
					this.path_remote_servers = "https://pawbs-engine.fly.dev/servers/servers.json";
					
				//#endregion
				
				
			//#endregion
			
			
			//#region [Multiplayer Settings]
				
				/**
				 * The player's multiplayer nickname.
				 */
				this.multiplayer_nickname = "Noob";
				
				/**
				 * The player's multiplayer colour.
				 */
				this.multiplayer_colour = "rgb(0, 128, 0)";
				
				/**
				 * The default multiplayer server name.
				 */
				this.multiplayer_default_server_name = "My Puppey Game! :)";
				
				/**
				 * The default multiplayer server connection type.
				 */
				this.multiplayer_default_connection_type = Multiplayer.ConnectionTypes.None;
				
				/**
				 * The default multiplayer server tick rate.
				 */
				this.multiplayer_default_tick_hz = 50;
				
				
				//#region [Dedicated Server]
					
					/**
					 * The default local dedicated server address.
					 */
					this.multiplayer_local_dedicated_server = "ws://localhost:3000";
					
					/**
					 * The default remote dedicated server address.
					 * Change this to your own dedicated server's address if you want!
					 */
					this.multiplayer_remote_dedicated_server = "wss://pawbs-engine.fly.dev:3443";
					
				//#endregion
				
				
				//#region [Signaling Server]
					
					/**
					 * The default local signaling server address.
					 */
					this.multiplayer_local_signaling_server = "ws://localhost:5000";
					
					/**
					 * The default remote signaling server address.
					 * Change this to your own signaling server's address if you want!
					 */
					this.multiplayer_remote_signaling_server = "wss://pawbs-engine.fly.dev:5443";
					
				//#endregion
				
				
				//#region [HTTP Server]
					
					/**
					 * The default local HTTP server address.
					 */
					this.multiplayer_local_http_server = "http://localhost:4000";
					
					/**
					 * The default remote HTTP server address.
					 * Change this to your own HTTP server's address if you want!
					 */
					this.multiplayer_remote_http_server = "https://pawbs-engine.fly.dev";
					
				//#endregion
				
				
				//#region [Chat]
					
					/**
					 * The maximum number of chat messages that will show in the chat window.
					 */
					this.multiplayer_chat_messages_max = 100;
					
					/**
					 * The duration for which the chat window will be visible after being activated or updated.
					 */
					this.multiplayer_chat_hide_duration = 30000;
					
				//#endregion
				
				
			//#endregion
			
			
			//#region [Utility]
				
				/**
				 * The default text encoding for loading files.
				 */
				this.default_file_encoding = "utf8";
				
			//#endregion
			
		}
		
	//#endregion
	
	
	//#region [Properties]
		
		
		//#region [Flags]
			
			/**
			 * Flag indicating whether or not the game's current connection type indicates that it's a server instead of a client.
			 */
			get is_server()
			{
				return (Multiplayer.connection_type == Multiplayer.ConnectionTypes.DedicatedServer ||
						Multiplayer.connection_type == Multiplayer.ConnectionTypes.HTTPServer ||
						Multiplayer.connection_type == Multiplayer.ConnectionTypes.SignalingServer);
			}
			
			/**
			 * Flag indicating whether or not the game is currently being served from a remote server address.
			 */
			get is_remote()
			{
				return ((typeof process !== 'undefined' && process.argv.length > 2 && process.argv.includes("remote")) ||
						(typeof location !== 'undefined' && location.hostname != "" && (Game.settings.multiplayer_remote_dedicated_server.includes(location.hostname) ||
																						Game.settings.multiplayer_remote_http_server.includes(location.hostname) ||
																						Game.settings.multiplayer_remote_signaling_server.includes(location.hostname))));
			}
			
			/**
			 * Flag indicating whether or not the game has detected that it is running from a container.
			 */
			get is_containerized()
			{
				return (typeof process !== 'undefined' && process.argv.length > 2 && process.argv.includes("container"));
			}
			
			/**
			 * Flag indicating whether or not the game has detected that it is running from the npm start command in the repository root directory.
			 */
			get is_shortcut()
			{
				return (typeof process !== 'undefined' && process.argv.length > 2 && process.argv.includes("shortcut"));
			}
			
			/**
			 * Flag indicating whether or not the game has detected that it is running from a single shortcut in the repository root directory.
			 */
			get is_shortcut_single()
			{
				return (typeof process !== 'undefined' && process.argv.length > 2 && process.argv.includes("shortcut-single"));
			}
			
		//#endregion
		
		
		//#region [Default Files/Folders]
			
			/**
			 * The default game root directory path.
			 */
			get path_root()
			{
				
				// Get the default local root path
				let path = Game.settings.path_local_root
				
				// If the game is being run from a server console...
				if (Game.settings.is_server)
				{
					
					// If server running remotely from a container...
					if (Game.settings.is_remote && Game.settings.is_containerized)
					{
						
						// Get default containerized server root path
						path = Game.settings.path_remote_server_root_containerized;
						
						
					}  // Otherwise, if server running remotely but uncontainerized...
					else if (Game.settings.is_remote)
					{
						
						// Get default remote server root path
						path = Game.settings.path_remote_server_root;
						
						
					} // Otherwise, if server is being run from the npm start command in the repo root directory...
					else if (Game.settings.is_shortcut)
					{
						
						// Get default server shortcut root path
						path = Game.settings.path_local_server_root_shortcut;
						
						
					} // Otherwise, if server is being run from a single shortcut in the repo root directory...
					else if (Game.settings.is_shortcut_single)
					{
						
						// Get default server single shortcut root path
						path = Game.settings.path_local_server_root_shortcut_single;
						
						
					} // Othehrwise, if the server is running locally without any flags...
					else
					{
						
						// Get default local server root path
						path = Game.settings.path_local_server_root;
						
					}
					
					
				} // Otherwise, if the game is being run from a web browser...
				else
				{
					
					// If game is hosted remotely from a container...
					if (Game.settings.is_remote && Game.settings.is_containerized)
					{
						
						// Get default containerized root path
						path = Game.settings.path_remote_root_containerized;
						
						
					} // Otherwise, if game is hosted remotely but uncontainerized...
					else if (Game.settings.is_remote)
					{
						
						// Get default remote root path
						path = Game.settings.path_remote_root;
						
						
					} // Otherwise, if game is being run from the npm start command in the repo root directory...
					else if (Game.settings.is_shortcut)
					{
						
						// Get default shortcut root path
						path = Game.settings.path_local_root_shortcut;
						
						
					} // Otherwise, if game is being run from a single shortcut in the repo root directory...
					else if (Game.settings.is_shortcut_single)
					{
						
						// Get default single shortcut root path
						path = Game.settings.path_local_root_shortcut_single;
						
					}
					
				}
				
				// Return game root directory path
				return path;
				
			}
			
			/**
			 * The default game settings JSON file path.
			 */
			get path_settings()
			{
				return Game.settings.path_root + Game.settings.path_local_settings;
			}
			
			/**
			 * The default game worlds list JSON file path.
			 */
			get path_worlds()
			{
				return Game.settings.path_root + Game.settings.path_local_worlds;
			}
			
			/**
			 * The default object assets list JSON file path.
			 */
			get path_objects()
			{
				return Game.settings.path_root + Game.settings.path_local_objects;
			}
			
			/**
			 * The default texture assets list JSON file path.
			 */
			get path_textures()
			{
				return Game.settings.path_root + Game.settings.path_local_textures;
			}
			
			/**
			 * The default local dedicated servers list JSON file path.
			 */
			get path_servers()
			{
				
				// Return the default local root path
				return Game.settings.path_root + Game.settings.path_local_servers;
				
			}
			
		//#endregion
		
		
		//#region [Multiplayer Settings]
			
			
			//#region [Dedicated Server]
				
				/**
				 * The Pawbs Engine dedicated server address.
				 */
				get multiplayer_dedicated_server()
				{
					
					// If game is hosted remotely...
					if (Game.settings.is_remote)
					{
						
						// Get the remote dedicated server address
						return Game.settings.multiplayer_remote_dedicated_server;
						
						
					} // Othehrwise, if the server is running locally...
					else
					{
						
						// Get the local dedicated server address
						return Game.settings.multiplayer_local_dedicated_server;
						
					}
				}
				
			//#endregion
			
			
			//#region [Signaling Server]
				
				/**
				 * The Pawbs Engine signaling server address.
				 */
				get multiplayer_signaling_server()
				{
					
					// If game is hosted remotely...
					if (Game.settings.is_remote)
					{
						
						// Get the remote signaling server address
						return Game.settings.multiplayer_remote_signaling_server;
						
						
					} // Othehrwise, if the server is running locally...
					else
					{
						
						// Get the local signaling server address
						return Game.settings.multiplayer_local_signaling_server;
						
					}
				}
				
			//#endregion
			
			
			//#region [HTTP Server]
				
				/**
				 * The Pawbs Engine HTTP server address.
				 */
				get multiplayer_http_server()
				{
					
					// If game is hosted remotely...
					if (Game.settings.is_remote)
					{
						
						// Get the remote HTTP server address
						return Game.settings.multiplayer_remote_http_server;
						
						
					} // Othehrwise, if the server is running locally...
					else
					{
						
						// Get the local HTTP server address
						return Game.settings.multiplayer_local_http_server;
						
					}
				}
				
			//#endregion
			
			
		//#endregion
		
		
	//#endregion
	
	
	//#region [Methods]
		
		/**
		 * Loads the game settings JSON file.
		 *
		 * @param {Function} callback The callback function which is invoked when the setting file has been loaded.
		 */
		load(callback)
		{
			
			// If game settings are not being loaded in any multiplayer server mode...
			if (!Game.settings.is_server)
			{
				
				// Load game settings
				fetch(Game.settings.path_settings).then((response) => response.json()).then((settings) => {
				
					// Perform the next step using the callback function
					callback(settings);
				
				}).catch(error => {
					
					// Error loading settings
					console.error("Error fetching '" + Game.settings.path_settings + "': ", error);
					
				});
				
			}
			else
			{
				
				// Load game settings
				Game.file_system.promises.readFile(Game.settings.path_settings, this.default_file_encoding).then((response) => JSON.parse(response)).then((settings) => { 
					
					// Perform the next step using the callback function
					callback(settings);
					
				}).catch(error => {
					
					// Error loading settings
					console.error("Error reading '" + Game.settings.path_settings + "':", error);
					
				});
				
			}
			
		}
		
		/**
		 * Saves the settings to a JSON file using a save file dialog.
		 */
		save()
		{
			
			// Create a temporary link element to trigger a save file dialog
			let link = document.createElement('a');
			
			// Serialize the settings contents to an object URL for download
			link.href = URL.createObjectURL(new Blob([JSON.stringify(this, null, 4)], { type: "application/json" }));
			
			// Set the download file name
			link.download = "settings.json";
			
			// Append the link element to the document body
			document.body.appendChild(link);
			
			// Trigger the save file dialog
			link.click();
			
			// Remove the link element from the document body
			document.body.removeChild(link);
			
		}
		
	//#endregion
	
}
export default Settings;