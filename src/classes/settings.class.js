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
				
				
				//#region [Game Root Path]
					
					/**
					 * The default game root path.
					 */
					this.development_path_root = ".";
					
					/**
					 * The default game root path in production mode.
					 */
					this.production_path_root = "./src";
					
					/**
					 * The default game root path for the Pawbs Engine servers.
					 */
					this.server_development_path_root = "..";
					
					/**
					 * The default game root path for the Pawbs Engine servers in production mode.
					 */
					this.server_production_path_root = "./src";
					
				//#endregion
				
				
				//#region [File Paths]
					
					/**
					 * The default game settings file path.
					 */
					this.default_path_settings = "/settings.json";
					
					/**
					 * The default game worlds list file path.
					 */
					this.default_path_worlds = "/worlds/worlds.json";
					
					/**
					 * The default object assets list file path.
					 */
					this.default_path_objects = "/objects/objects.json";
					
					/**
					 * The default texture assets list file path.
					 */
					this.default_path_textures = "/textures/textures.json";
					
				//#endregion
				
				
			//#endregion
			
			
			//#region [Multiplayer Settings]
				
				/**
				 * The player's multiplayer nickname.
				 */
				this.multiplayer_nickname = "Noob";
				
				/**
				 * The default multiplayer server connection type.
				 */
				this.multiplayer_default_connection_type = Multiplayer.ConnectionTypes.None;
				
				
				//#region [Dedicated Server]
					
					/**
					 * The Pawbs Engine dedicated server address.
					 */
					this.multiplayer_development_dedicated_server = "ws://localhost:3000";
					
					/**
					 * The Pawbs Engine dedicated server address in production mode.
					 */
					this.multiplayer_production_dedicated_server = "wss://pawbs-engine.fly.dev:3443";
					
				//#endregion
				
				
				//#region [Signaling Server]
					
					/**
					 * The Pawbs Engine signaling server address.
					 */
					this.multiplayer_development_signaling_server = "ws://localhost:5000";
					
					/**
					 * The Pawbs Engine signaling server address in production mode.
					 */
					this.multiplayer_production_signaling_server = "wss://pawbs-engine.fly.dev:5443";
					
				//#endregion
				
				
				//#region [HTTP Server]
					
					/**
					 * The Pawbs Engine HTTP server address.
					 */
					this.multiplayer_development_http_server = "https://pawbs-engine.fly.dev";
					
					/**
					 * The Pawbs Engine HTTP server address in production mode.
					 */
					this.multiplayer_production_http_server = "https://pawbs-engine.fly.dev";
					
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
		
		/**
		 * Flag indicating whether or not the game has detected that it is in production mode.
		 */
		get is_production()
		{
			return (Multiplayer.is_server || (location.hostname != "" && (Game.settings.multiplayer_production_dedicated_server.includes(location.hostname) ||
																		  Game.settings.multiplayer_production_http_server.includes(location.hostname) ||
																		  Game.settings.multiplayer_production_signaling_server.includes(location.hostname))));
		}
		
		/**
		 * Flag indicating whether or not the game has detected that it is in containerized mode.
		 */
		get is_containerized()
		{
			return (typeof process !== 'undefined' && process.env.NODE_ENV == 'container');
		}
		
		
		//#region [Default Files/Folders]
			
			/**
			 * The default game root path.
			 */
			get path_root()
			{
				
				// Get the default game root path
				let path = Game.settings.development_path_root
				
				// If the game is in production mode...
				if (Game.settings.is_production)
				{
					
					// If the game is containerized...
					if (Game.settings.is_containerized)
					{
						
						// Get the default server production game root path
						path = Game.settings.server_production_path_root;
						
						
					} // Otherwise, if the game is not containerized...
					else
					{
						
						// Get the default server game root path
						path = Game.settings.server_development_path_root;
						
					}
					
					
				} // Otherwise, if the game is not in production mode...
				else
				{
					
					// If the game is containerized...
					if (Game.settings.is_containerized)
					{
						
						// Get the default production game path root
						path = Game.settings.production_path_root;
						
					}
					
				}
				
				// Return the default game root path
				return path;
				
			}
			
			/**
			 * The default game settings file path.
			 */
			get path_settings()
			{		
				return Game.settings.path_root + Game.settings.default_path_settings;
			}
			
			/**
			 * The default game worlds list file path.
			 */
			get path_worlds()
			{		
				return Game.settings.path_root + Game.settings.default_path_worlds;
			}
			
			/**
			 * The default object assets list file path.
			 */
			get path_objects()
			{		
				return Game.settings.path_root + Game.settings.default_path_objects;
			}
			
			/**
			 * The default texture assets list file path.
			 */
			get path_textures()
			{		
				return Game.settings.path_root + Game.settings.default_path_textures;
			}
			
		//#endregion
		
		
		//#region [Multiplayer Settings]
			
			
			//#region [Dedicated Server]
				
				/**
				 * The Pawbs Engine dedicated server address.
				 */
				get multiplayer_dedicated_server()
				{
					if (Game.settings.is_production)
					{
						return Game.settings.multiplayer_production_dedicated_server;
					}
					else
					{
						return Game.settings.multiplayer_development_dedicated_server;
					}
				}
				
			//#endregion
			
			
			//#region [Signaling Server]
				
				/**
				 * The Pawbs Engine signaling server address.
				 */
				get multiplayer_signaling_server()
				{
					if (Game.settings.is_production)
					{
						return Game.settings.multiplayer_production_signaling_server;
					}
					else
					{
						return Game.settings.multiplayer_development_signaling_server;
					}
				}
				
			//#endregion
			
			
			//#region [HTTP Server]
				
				/**
				 * The Pawbs Engine HTTP server address.
				 */
				get multiplayer_http_server()
				{
					if (Game.settings.is_production)
					{
						return Game.settings.multiplayer_production_http_server;
					}
					else
					{
						return Game.settings.multiplayer_development_http_server;
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
			if (!Multiplayer.is_server)
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