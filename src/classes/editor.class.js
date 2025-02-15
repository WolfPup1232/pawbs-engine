// three.js Imports
import * as THREE from '../libraries/threejs/three.js';

// Class Imports
import Billboard from './billboard.class.js';

// Static Class Imports
import Game from './game.class.js';
import Assets from './assets.class.js';
import Shaders from './shaders.class.js';
import Debug from './debug.class.js';

/**
 * The in-game world editor.
 */
class Editor
{
	
	//#region [Class Declarations]
		
		/**
		 * Flag indicating whether the editor is enabled or disabled.
		 */
		static enabled = false;
		
		
		//#region [Object Selection Tools]
			
			/**
			 * Object selection tool modes.
			 */
			static SelectionModes = {
				Objects: 	1,
				Faces: 		2,
				Vertices: 	3
			};
			
			/**
			 * The current object selection tool mode.
			 */
			static selection_mode = this.SelectionModes.Objects;
			
			/**
			 * Enable or disable terrain selection mode.
			 */
			static select_terrain = false;
			
		//#endregion
		
		
		//#region [Object Selection Tool Modes]
			
			
			//#region [Highlighted/Selected Objects]
				
				
				//#region [Highlighted Objects]
					
					/**
					 * The group of highlighted objects.
					 */
					static highlighted_objects = new THREE.Group();
					
					/**
					 * The colour of highlighted objects.
					 */
					static highlighted_object_colour = 0xffffff;
					
				//#endregion
				
				
				//#region [Selected Objects]
					
					/**
					 * The group of selected objects.
					 */
					static selected_objects = new THREE.Group();
					
					/**
					 * The colour of selected objects.
					 */
					static selected_object_colour = 0xffffff;
					
				//#endregion
				
				
			//#endregion
			
			
			//#region [Highlighted/Selected Faces]
				
				
				//#region [Hovered Faces]
					
					/**
					 * The hovered object whose faces should be highlighted or selected.
					 */
					static hovered_faces_object = null;
					
					/**
					 * The index of the last face which was hovered over.
					 */
					static previously_hovered_face_index = null;
					
				//#endregion
				
				
				//#region [Highlighted Faces]
					
					/**
					 * The colour of highlighted object faces.
					 */
					static highlighted_face_colour = 0xaaaaaa;
					
				//#endregion
				
				
				//#region [Selected Faces]
					
					/**
					 * The colour of selected object faces.
					 */
					static selected_face_colour = 0x666666;
					
				//#endregion
				
				
			//#endregion
			
			
			//#region [Highlighted/Selected Vertices]
				
				/**
				 * The size of the vertex highlight/selection radius.
				 */
				static vertex_pointer_radius = 0.25;
				
				
				//#region [Highlighted Vertices]
					
					/**
					 * The hovered object whose vertices should be highlighted.
					 */
					static highlighted_vertices_object = null;
					
					/**
					 * The colour of highlighted object vertices.
					 */
					static highlighted_vertex_colour = 0x000000;
					
					/**
					 * The colour of highlighted object vertices,
					 */
					static highlighted_vertex_outline_colour = 0x000000;
					
					/**
					 * The size of highlighted object vertices.
					 */
					static highlighted_vertex_size = 0.125;
					
					/**
					 * The thickness of highlighted object vertices outlines.
					 */
					static highlighted_vertex_outline_size = 0.1;
					
				//#endregion
				
				
				//#region [Selected Vertices]
					
					/**
					 * The selected object whose vertices should be highlighted or selected.
					 */
					static selected_vertices_object = null;
					
					/**
					 * The radius of the selected object's vertex selection area.
					 */
					static selected_vertices_object_highlight_vertices_radius = 0.25;
					
					/**
					 * The colour of the selected object's vertex selection area.
					 */
					static selected_vertices_object_highlight_vertices_colour = 0xff0000;
					
					/**
					 * The colour of un-selected object vertices.
					 */
					static unselected_vertex_colour = 0xffffff;
					
					/**
					 * The colour of selected object vertices.
					 */
					static selected_vertex_colour = 0xff0000;
					
					/**
					 * The colour of selected object vertices.
					 */
					static selected_vertex_outline_colour = 0x000000;
					
					/**
					 * The size of selected object vertices.
					 */
					static selected_vertex_size = 0.25;
					
					/**
					 * The thickness of selected object vertices outlines.
					 */
					static selected_vertex_outline_size = 0.1;
					
				//#endregion
				
				
			//#endregion
			
			
		//#endregion
		
		
		//#region [Editor Tools]
			
			/**
			 * Editor tool modes.
			 */
			static ToolMode = {
				None: 		0,
				Spawn: 		1,
				NPC: 		2,
				Cinematics:	3
			};
			
			/**
			 * The current editor tool mode.
			 */
			static tool_mode = this.ToolMode.None;
			
		//#endregion
		
		
		//#region [Editor Tool Modes]
			
			
			//#region [Spawn Tools]
				
				/**
				 * Spawn tool modes.
				 */
				static SpawnTools = {
					Objects: 	1,
					NPCs: 		2,
					Walls: 		3,
					Terrain: 	4
				};
				
				/**
				 * The current spawn tool mode.
				 */
				static spawn_tool = this.SpawnTools.Objects;
				
				/**
				 * The colour of spawned objects.
				 */
				static spawned_object_colour = 0xd3d3d3;
				
			//#endregion
			
			
			//#region [Wall Tools]
				
				/**
				 * The grid which will act as a visual aid for the wall tool.
				 */
				static grid_helper = new THREE.GridHelper();
				
			//#endregion
			
			
			//#region [Terrain Tools]
				
				/**
				 * Terrain tool modes.
				 */
				static TerrainTools = {
					Square: 1,
					Circle: 2
				};
				
				/**
				 * The current terrain tool mode.
				 */
				static terrain_tool = this.TerrainTools.Square;
				
				/**
				 * The radius of the terrain tool's vertex selection area.
				 */
				static terrain_tool_select_vertex_radius = 1;
				
			//#endregion
			
			
		//#endregion
		
		
		//#region [Clipboard]
			
			/**
			 * The group of cut/copied objects.
			 */
			static clipboard_objects = new THREE.Group();
			
		//#endregion
		
		
	//#endregion
	
	
	//#region [Constructor]
		
		/**
		 * Initializes the in-game world editor.
		 */
		static
		{
			
			// Add a deep clone function to the Object3D type along with a userData clone function to handle recursion (the Object3D's default clone method doesn't clone certain stuff, sad puppey)
			THREE.Object3D.prototype.userDataClone = function(clone)
			{
				if (this.userData)
				{
					Object.entries(this.userData).forEach(([key, value]) => {
						if (typeof value.clone === 'function')
						{
							clone.userData[key] = value.clone();
						}
						else
						{
							clone.userData[key] = structuredClone(value);
						}
					});
				}
				
				if (this.geometry)
				{
					clone.geometry = this.geometry.clone();
				}
				
				if (this.material)
				{
					clone.material = this.material.clone();
				}
				
				if (this.children && this.children.length > 0)
				{
					for (let i = 0; i < this.children.length; i++)
					{
						this.children[i].userDataClone(clone.children[i]);
					}
				}
			};
			THREE.Object3D.prototype.deepClone = function()
			{
				const clone = this.clone(true);
				
				if (this.geometry)
				{
					clone.geometry = this.geometry.clone();
				}
				
				if (this.material)
				{
					clone.material = this.material.clone();
				}
				
				this.userDataClone(clone);
				
				if (this.children && this.children.length > 0)
				{
					for (let i = 0; i < this.children.length; i++)
					{
						this.children[i].userDataClone(clone.children[i]);
					}
				}
				
				return clone;
			};
			
			// Add a function to the Object3D type which gets the top-most parent from an object's chain of parents' parents.
			THREE.Object3D.prototype.getTopMostParent = function()
			{
				let object = this;
				
				while (object.parent && !(object.parent instanceof THREE.Scene))
				{
					object = object.parent;
				}
				
				return object;
			};
			
			// Add a function to the Object3D type which raycasts only objects which are not flagged to be skipped by the raycaster
			THREE.Raycaster.prototype.intersectRaycastableObjects = function(objects, recursive = false, intersects = [])
			{
				
				// Iterate through the specified list of objects...
				for (let i = 0; i < objects.length; i++)
				{
					let object = objects[i];
					
					// Make sure the object is on the same layers as the raycaster...
					if (object.layers.test(Game.player.raycaster.layers))
					{
						
						// Skip raycasting flagged objects
						let skip_raycast = false;
						if (object.userData && object.userData.ignore_raycast)
						{
							skip_raycast = true;
						}
						
						// Raycast unflagged objects
						if (!skip_raycast)
						{
							object.raycast(Game.player.raycaster, intersects);
						}
						
					}
					
					// If flagged as recursive, call this function for object's children
					if (recursive)
					{
						Game.player.raycaster.intersectRaycastableObjects(object.children, true, intersects);
					}
				}
				
				// Sort list of intersected objects by distance
				intersects.sort(function(a, b) { return a.distance - b.distance; });
				
				// Return list of intersected objects
				return intersects;
				
			};
			
		}
		
	//#endregion
	
	
	//#region [Event Handlers]
		
		/**
		 * Handles player left mouse down.
		 *
		 * @param {Event} event The event object passed by the event handler.
		 */
		static handleLeftMouseDown(event)
		{
			
			// If the mouse is locked to the renderer...
			if (Game.player.controls.mouse_locked)
			{
				
				// Handle transform controls mouse down event
				Game.player.controls.transform_controls.mouseDown();
				
			}
			
		}
		
		/**
		 * Handles player left mouse up.
		 *
		 * @param {Event} event The event object passed by the event handler.
		 */
		static handleLeftMouseUp(event)
		{
			
			// If the mouse is locked to the renderer...
			if (Game.player.controls.mouse_locked)
			{
				
				// If the mouse is currently dragging...
				if (Game.player.controls.mouse_dragging)
				{
					
					// Handle transform controls mouse up event
					Game.player.controls.transform_controls.mouseUp();
					
					
				} // Otherwise, if the mouse is not currently dragging...
				else
				{
					
					// Select the object that the player is facing
					if (this.selection_mode == this.SelectionModes.Objects)
					{
						this.selectObjects();
						
					} // Otherwise, select the object face that the player is facing
					else if (this.selection_mode == this.SelectionModes.Faces)
					{
						this.selectFace();
						
					} // Otherwise, select the object vertex that the player is facing
					else if (this.selection_mode == this.SelectionModes.Vertices)
					{
						this.selectVertex()
					}
					
				}
				
			}
			
		}
		
		/**
		 * Handles player right mouse down.
		 *
		 * @param {Event} event The event object passed by the event handler.
		 */
		static handleRightMouseDown(event)
		{
			
			// Do nothing.
			
		}
		
		/**
		 * Handles player right mouse up.
		 *
		 * @param {Event} event The event object passed by the event handler.
		 */
		static handleRightMouseUp(event)
		{
			
			// If the mouse is locked to the renderer...
			if (Game.player.controls.mouse_locked)
			{
				
				// Unlock the mouse from the renderer
				Game.player.controls.unlockPointerLockControls();
				Game.player.controls.transform_controls.dragging = false;
				
				// Prevent the right-click context menu from appearing
				Game.ui.utilities.preventContextMenu();
				
			}
			
		}
		
	//#endregion
	
	
	//#region [Methods]
		
		/**
		 * Toggle editor on/off.
		 */
		static toggle()
		{
			
			// Check if editor is enabled
			if (this.enabled)
			{
				
				// Reset all highlighted or selected objects, faces, and vertices
				this.resetHighlightedAndSelectedObjectsFacesVertices();
				
				// Remove player transform controls from the world
				Game.world.scene.remove(Game.player.controls.transform_controls);
				
				// Disable noclip
				Game.player.noclip = false;
				
				// Hide editor UI
				Game.ui.editor.hide();
				
				// Disable editor
				this.enabled = false;
				
			}
			else
			{
				
				// Enable editor
				this.enabled = true;
				
				// Add player transform controls to the world
				Game.world.scene.add(Game.player.controls.transform_controls);
				
				// Show editor UI
				Game.ui.editor.show();
				
			}
			
		}
		
		/**
		 * Updates editor processes every frame.
		 */
		static update()
		{
			
			// If the player is dragging with the left mouse button...
			if (Game.player.controls.mouse_left_down && Game.player.controls.mouse_dragging)
			{
				
				// Handle transform controls mouse move event
				Game.player.controls.transform_controls.mouseMove();
				
				// Update selected object UI elements
				Game.ui.editor.updateSelectedObjectsWindow();
				
			}
			else
			{
				
				// Handle transform controls mouse hover event
				Game.player.controls.transform_controls.mouseHover();
				
			}
			
			// Update transform controls gizmo size
			if (Game.player.controls.transform_controls.object)
			{
				
				// Set the minimum gizmo size and its corresponding distance
				const min_gizmo_size = 0.5;
				const min_distance = 0;
				
				// Set the maximum gizmo size and its corresponding distance
				const max_gizmo_size = 1;
				const max_distance = 20;
				
				// Get distance between gizmo and player
				const distance = Game.player.position.distanceTo(Game.player.controls.transform_controls.object.position);
				
				// Calculate gizmo size
				const gizmo_size = THREE.MathUtils.clamp(THREE.MathUtils.mapLinear(distance, min_distance, max_distance, max_gizmo_size, min_gizmo_size), min_gizmo_size, max_gizmo_size);
				
				// Set gizmo size
				Game.player.controls.transform_controls.size = gizmo_size;
				
			}
			
			// Update object highlighting
			if (this.selection_mode == this.SelectionModes.Objects)
			{
				this.highlightObjects();
				
			} // Otherwise, update object face highlighting
			else if (this.selection_mode == this.SelectionModes.Faces)
			{
				this.highlightFace();
				
			} // Otherwise, update object vertex highlighting
			else if (this.selection_mode == this.SelectionModes.Vertices)
			{
				this.highlightVertices();
			}
			
		}
		
		
		//#region [World Methods]
			
			/**
			 * Resets the current world using some hard-coded defaults.
			 */
			static newWorld()
			{
				
				// Reset all highlighted or selected objects, faces, and vertices
				this.resetHighlightedAndSelectedObjectsFacesVertices();
				
				// Remove all objects and terrain from the world
				Game.world.removeAllObjects();
				
				// Initialize the world's properties
				Game.world.name = "";
				
				// Initialize default terrain
				const plane_geometry = new THREE.PlaneGeometry(100, 100);
				const plane_material = new THREE.MeshBasicMaterial({ color: 0x302400 });
				const plane = new THREE.Mesh(plane_geometry, plane_material);
				plane.rotation.x = -Math.PI / 2;
				plane.position.y = 0;
				plane.position.z = 0;
				plane.name = "plane";
				Game.world.addTerrain(plane);
				
				// Initialize default objects
				const apple = new Billboard(1.5, 1.5, Assets.textures.apple1);
				apple.position.set(0, 0.75, -5);
				apple.name = "apple";
				Game.world.addObject(apple);
				
				// Reset the player's position
				Game.player.position.x = 0;
				Game.player.position.y = Game.player.height;
				Game.player.position.z = 0;
				
				// Add player transform controls to the world
				Game.world.scene.add(Game.player.controls.transform_controls);
				
			}
			
			/**
			 * Loads a world from a saved JSON file using an open file dialog.
			 */
			static loadWorld()
			{
				
				// Reset all highlighted or selected objects, faces, and vertices
				this.resetHighlightedAndSelectedObjectsFacesVertices();
				
				// Show open file dialog...
				Game.ui.utilities.showOpenFileDialog('.json', (event) => {
				
					// Initialize a file reader to read the selected file
					let reader = new FileReader();
					
					// Callback function to attempt to parse the selected file's JSON contents
					reader.onload = function(event)
					{
						try
						{
							
							// Parse JSON file contents
							let json = JSON.parse(event.target.result);
							
							// Load world from JSON file contents
							Game.world.loadFromJSON(json);
							
							// Add player transform controls to the scene
							Game.world.scene.add(Game.player.controls.transform_controls);
							
							// Update player position and rotation
							Game.player.position.x = Game.world.player_position.x;
							Game.player.position.y = Game.world.player_position.y;
							Game.player.position.z = Game.world.player_position.z;
							Game.player.rotation.x = 0;
							Game.player.rotation.y = 0;
							Game.player.rotation.z = 0;
							
							// Update editor main menu
							Game.ui.editor.updateEditorMenu();
							
							
						}
						catch (error)
						{
							
							// Error loading world
							console.error("Error loading world: ", error);
							
						}
					};
					
					// Read the selected file as text
					reader.readAsText(event.target.files[0]);
				
				});
				
			}
			
			/**
			 * Saves the world to a JSON file using a save file dialog.
			 */
			static saveWorld()
			{
				
				// Reset all highlighted or selected objects, faces, and vertices
				this.resetHighlightedAndSelectedObjectsFacesVertices();
			
				// Create a temporary link element to trigger a save file dialog
				let link = document.createElement('a');
				
				// Serialize the game world's contents to an object URL for download
				link.href = URL.createObjectURL(new Blob([JSON.stringify(Game.world.toJSON())], { type: "application/json" }));
				
				// Set the download file name
				link.download = Game.world.name + ".json";
				
				// Append the link element to the document body
				document.body.appendChild(link);
				
				// Trigger the save file dialog
				link.click();
				
				// Remove the link element from the document body
				document.body.removeChild(link);
				
			}
			
		//#endregion
		
		
		//#region [Object Methods]
			
			/**
			 * Spawns a new object into the world at the location the player is facing.
			 *
			 * @param {THREE.Object3D} object The object to be spawned.
			 */
			static spawn(object)
			{
				
				// Cast a ray from the player's position in the direction the player is looking
				Game.player.raycaster.ray.origin.copy(Game.player.position);
				Game.player.raycaster.ray.direction.set(0, 0, -1).applyQuaternion(Game.player.quaternion);
				Game.player.raycaster.near = 0;
				Game.player.raycaster.far = Infinity;
				
				// Check intersections with world objects
				const intersects = Game.player.raycaster.intersectRaycastableObjects(Game.world.all_objects, true);
				if (intersects.length > 0)
				{
					
					// Get the first object object that the player is looking at
					let intended_position = intersects[0].point;
					
					// Initialize a bounding box for positioning the object being spawned
					let bounding_box = new THREE.Box3();
					object.traverse((child) => {
						if (child.isMesh && child.geometry)
						{
							
							// Update the child's world matrix to ensure the bounding box is accurate
							child.updateWorldMatrix(true, false);
							
							// Compute the bounding box of the child in world coordinates
							const child_bounding_box = new THREE.Box3().setFromObject(child);
							
							// Expand the main box to include the child's bounding box
							bounding_box.union(child_bounding_box);
							
						}
					});
					
					// Position the object so its lowest point touches the intersection point
					intended_position.y += (object.position.y - bounding_box.min.y);
					object.position.copy(intended_position);
					
					// Spawn the object
					this.addObject(object);
					
				}
				
			}
			
			/**
			 * Gets all world objects according to the object selection type enabled in the editor.
			 *
			 * @return {array} Returns all world objects by selected type.
			 */
			static getObjects()
			{
				
				// Return all world objects by selected type
				if (this.select_terrain)
				{
					return Game.world.terrain;
				}
				else
				{
					return Game.world.objects;
				}
				
			}
			
			/**
			 * Adds the specified object to the world according to the object selection type enabled in the editor.
			 *
			 * @param {THREE.Object3D} object The object to be added to the world.
			 */
			static addObject(object)
			{
				
				// Add world object by selected type
				if (this.select_terrain)
				{
					Game.world.addTerrain(object);
				}
				else
				{
					Game.world.addObject(object);
				}
				
			}
			
			/**
			 * Removes the specified object from the world according to the object selection type enabled in the editor.
			 *
			 * @param {THREE.Object3D} object The object to be removed from the world.
			 */
			static removeObject(object)
			{
				
				// Remove world object by selected type
				if (this.select_terrain)
				{
					Game.world.removeTerrain(object);
				}
				else
				{
					Game.world.removeObject(object);
				}
				
			}
			
			/**
			 * Resets all highlighted and selected objects, faces, and vertices.
			 */
			static resetHighlightedAndSelectedObjectsFacesVertices()
			{
				
				// Reset highlighted and selected objects
				this.resetHighlightedObjects();
				this.resetSelectedObjects();
				
				// Reset highlighted and selected faces
				this.resetHighlightedAndSelectedFaces();
				
				// Reset highlighted and selected vertices
				this.resetHighlightedVertices();
				this.resetSelectedVertices();
				
			}
			
		//#endregion
		
		
		//#region [Highlight / Select Objects]
			
			/**
			 * Highlights whichever objects the player is looking at.
			 */
			static highlightObjects()
			{
				
				// Initialize potential new highlighted objects
				let new_highlighted_objects = null;
				
				// Cast a ray from the player's position in the direction the player is looking
				Game.player.raycaster.ray.origin.copy(Game.player.position);
				Game.player.raycaster.ray.direction.set(0, 0, -1).applyQuaternion(Game.player.quaternion);
				Game.player.raycaster.near = 0;
				Game.player.raycaster.far = Infinity;
				
				// Check intersections with world objects
				const intersects = Game.player.raycaster.intersectRaycastableObjects(this.getObjects(), true);
				if (intersects.length > 0)
				{
					
					// Get the first object or group of objects that the player is looking at
					new_highlighted_objects = intersects[0].object.getTopMostParent();
					
					// Reset previously highlighted objects
					this.resetHighlightedObjects();
					
					// If the new highlighted objects are different than the current highlighted objects or any of the selected objects...
					if (!this.highlighted_objects.getObjectById(new_highlighted_objects.id) && !this.selected_objects.getObjectById(new_highlighted_objects.id))
					{
						
						// If the new highlighted objects are a group...
						if (new_highlighted_objects.isGroup)
						{
							
							// Make the new highlighted object's children's material transparent
							new_highlighted_objects.traverse((child) => {
								if (child.isMesh && child.material)
								{
									child.userData.original_material = child.material.clone();
									child.material = new THREE.MeshBasicMaterial({ color: child.material.color.getHex(), transparent: true, opacity: 0.5, side: child.material.side });
								}
							});
							
							
						} // Otherwise, if the new highlighted object is a singular object...
						else
						{
							
							// Make the new highlighted object's material transparent
							new_highlighted_objects.userData.original_material = new_highlighted_objects.material.clone();
							new_highlighted_objects.material = new THREE.MeshBasicMaterial({ color: new_highlighted_objects.material.color.getHex(), transparent: true, opacity: 0.5, side: new_highlighted_objects.material.side });
							
						}
						
						// Set the highlighted objects to the newly highlighted objects
						this.highlighted_objects = new_highlighted_objects;
						
						
					} // Otherwise, if the new highlighted objects are the same as any of the selected objects...
					else if (this.selected_objects.getObjectById(new_highlighted_objects.id))
					{
						
						// Reset the highlighted objects
						this.resetHighlightedObjects();
						
					}
					
					
				} // Otherwise, if the player isn't looking at any objects...
				else
				{
					
					// Reset the highlighted objects
					this.resetHighlightedObjects();
					
				}
				
			}
			
			/**
			 * Resets the highlighted objects.
			 */
			static resetHighlightedObjects()
			{
				
				// If objects are highlighted...
				if (this.highlighted_objects)
				{
					
					// If the highlighted objects are a group...
					if (this.highlighted_objects.isGroup)
					{
						
						// Reset highlighted object's children's materials
						this.highlighted_objects.traverse((child) => {
							if (child.isMesh)
							{
								if (child.userData.original_material != null)
								{
									child.material = child.userData.original_material.clone();
									delete child.userData.original_material;
								}
							}
						});
						
						
					} // Otherwise, if the new highlighted object is a singular object...
					else
					{
						
						// Reset highlighted object's material
						this.highlighted_objects.material = this.highlighted_objects.userData.original_material;
						delete this.highlighted_objects.userData.original_material;
						
					}
					
					// Reset the highlighted objects group
					this.highlighted_objects = new THREE.Group();
					
				}
				
			}
			
			/**
			 * Selects whichever objects the player is looking at.
			 */
			static selectObjects()
			{
				
				// Detatch transform controls if they're attached to anything
				Game.player.controls.transform_controls.detach();
				
				// Cast a ray from the player's position in the direction the player is looking
				Game.player.raycaster.ray.origin.copy(Game.player.position);
				Game.player.raycaster.ray.direction.set(0, 0, -1).applyQuaternion(Game.player.quaternion);
				Game.player.raycaster.near = 0;
				Game.player.raycaster.far = Infinity;
				
				// Check intersections with world objects
				const intersects = Game.player.raycaster.intersectRaycastableObjects(this.getObjects(), true);
				if (intersects.length > 0)
				{
					
					// Get the first object or group of objects that the player is looking at
					let new_selected_object = intersects[0].object.getTopMostParent();
					
					// If the new selected objects are highlighted...
					if (this.highlighted_objects.getObjectById(new_selected_object.id))
					{
						
						// Reset highlighted objects
						this.resetHighlightedObjects();
						
					}
					
					// If the new selected object is different than the current selected object...
					if (!this.selected_objects.getObjectById(new_selected_object.id))
					{
						
						// If the new selected objects are a group...
						if (new_selected_object.isGroup)
						{
							
							// Make the new selected object's children's material wireframe
							new_selected_object.traverse((child) => {
								if (child.isMesh)
								{
									child.userData.original_material = child.material.clone();
									child.material = new THREE.MeshBasicMaterial({ color: this.selected_object_colour, wireframe: true });
								}
							});
							
							
						} // Otherwise, if the new selected object is a singular object...
						else
						{
						
							// Make the new selected object's material wireframe
							new_selected_object.userData.original_material = new_selected_object.material.clone();
							new_selected_object.material = new THREE.MeshBasicMaterial({ color: this.selected_object_colour, wireframe: true });
						
						}
						
						// Remove the new selected objects from the world in preparation to add it to the selected objects group
						this.removeObject(new_selected_object);
						
						// Select multiple objects if shift or control key is held down...
						if (Game.player.controls.modifier_shift_left_pressed || Game.player.controls.modifier_control_left_pressed)
						{
							
							// Remove the selected objects group from the world because it may already be in it if multiple objects are being selected
							this.removeObject(this.selected_objects);
							
							
						} // Otherwise, if only one object is being selected...
						else
						{
							
							// Reset the selected objects if only one object is being selected
							this.resetSelectedObjects();
							
						}
						
						// If no previous objects have been selected yet...
						if (this.selected_objects.children.length == 0)
						{
							
							// Set the selected objects group's position to that of the newly selected object
							this.selected_objects.position.copy(new_selected_object.position);
							
						}
						
						// Calculate the position/scale/rotation offset between the selected objects group and the object being currently selected
						let selected_objects_offset = new THREE.Vector3().subVectors(new_selected_object.position, this.selected_objects.position);
						selected_objects_offset.divide(this.selected_objects.scale);
						selected_objects_offset.applyQuaternion(this.selected_objects.quaternion.clone().invert());
						
						// Set the new selected object's position/scale/rotation according to the offset
						new_selected_object.position.copy(selected_objects_offset);
						new_selected_object.scale.divide(this.selected_objects.scale);
						new_selected_object.quaternion.premultiply(this.selected_objects.quaternion.clone().invert());
						
						// Get the new selected object
						this.selected_objects.add(new_selected_object);
						
						// Add (or re-add) the selected object group back to the world
						this.addObject(this.selected_objects);
						
						// Attach transform controls to the selected objects group
						Game.player.controls.transform_controls.attach(this.selected_objects);
						
						// Update selected objects UI
						Game.ui.editor.updateSelectedObjectsWindow();
						
						
					} // Otherwise, if the new selected object is the same as the current selected object...
					else
					{
						
						// Reset the selected objects
						this.resetSelectedObjects();
						
					}
					
					
				} // Otherwise, if the player isn't looking at any objects...
				else
				{
					
					// Reset the selected objects
					this.resetSelectedObjects();
					
				}
				
			}
			
			/**
			 * Resets the selected objects.
			 */
			static resetSelectedObjects()
			{
				
				// If any object is selected...
				if (this.selected_objects.children.length > 0)
				{
					
					// Detatch transform controls if they're attached to anything
					Game.player.controls.transform_controls.detach();
					
					// Reset selected object's materials
					this.selected_objects.traverse((child) => {
						if (child.isMesh)
						{
							if (child.userData.original_material != null)
							{
								child.material = child.userData.original_material.clone();
								delete child.userData.original_material;
							}
						}
					});
					
					// Remove the selected objects from the world to re-add them to the world outside of the selected objects group
					this.removeObject(this.selected_objects);
					
					// Prepare the selected objects to be deselected by iterating through the selected objects group's children
					let objects_to_deselect = [];
					for (let i = 0; i < this.selected_objects.children.length; i++)
					{
						
						// Get the selected objects group's current child
						let selected_object = this.selected_objects.children[i];
						
						// Get child's position/scale/rotation
						let selected_object_position = selected_object.position.clone();
						let selected_object_scale = selected_object.scale.clone();
						let selected_object_rotation = selected_object.quaternion.clone();
						
						// Calculate the child's new position/scale/rotation relative to the world instead of the selected objects group
						selected_object_rotation.premultiply(this.selected_objects.quaternion);
						selected_object_position.applyQuaternion(this.selected_objects.quaternion);
						selected_object_position.multiply(this.selected_objects.scale);
						selected_object_position.add(this.selected_objects.position);
						selected_object_scale.multiply(this.selected_objects.scale);
						
						// Set the child's new position/scale/rotation
						selected_object.position.copy(selected_object_position);
						selected_object.scale.copy(selected_object_scale);
						selected_object.quaternion.copy(selected_object_rotation);
						
						// Prepare the child object to be deselected
						objects_to_deselect.push(selected_object);
						
					}
					
					// Remove selected objects from the selected objects group and re-add them to the world
					for (let i = 0; i < objects_to_deselect.length; i++)
					{
						
						// Get selected objects group's current child
						let selected_object = objects_to_deselect[i];
						
						// Remove the child from the selected objects group
						this.selected_objects.remove(selected_object);
						
						// Re-add the child to the world
						this.addObject(selected_object);
						
					}
					
					// Reset the selected objects group
					this.selected_objects = new THREE.Group();
					
					// Update selected objects UI
					Game.ui.editor.updateSelectedObjectsWindow();
					
				}
				
			}
			
			/**
			 * Saves the selected objects to a JSON file using a save file dialog.
			 *
			 * @param {string} prefab_name The name of the prefab to be saved.
			 */
			static saveSelectedObjects(prefab_name)
			{
				
				// If any object is selected...
				if (this.selected_objects.children.length > 0)
				{
					
					// Get a clone of the selected objects, that way we don't screw up the actual selected objects
					let selected_objects = this.selected_objects.deepClone();
					
					// Detatch transform controls if they're attached to anything
					Game.player.controls.transform_controls.detach();
					
					// Reset selected object's materials
					selected_objects.traverse((child) => {
						if (child.isMesh)
						{
							if (child.userData.original_material != null)
							{
								child.material = child.userData.original_material.clone();
								delete child.userData.original_material;
							}
						}
					});
					
					// If the selected objects group only has one child object...
					if (selected_objects.children.length == 1)
					{
							
						// Get a clone of the selected objects group's only child
						let selected_object = selected_objects.children[0].clone(true);
						
						// Get child's position/scale/rotation
						let selected_object_position = selected_object.position.clone();
						let selected_object_scale = selected_object.scale.clone();
						let selected_object_rotation = selected_object.quaternion.clone();
						
						// Calculate the child's new position/scale/rotation relative to the world instead of the selected objects group
						selected_object_rotation.premultiply(selected_objects.quaternion);
						selected_object_position.applyQuaternion(selected_objects.quaternion);
						selected_object_position.multiply(selected_objects.scale);
						selected_object_position.add(selected_objects.position);
						selected_object_scale.multiply(selected_objects.scale);
						
						// Set the child's new position/scale/rotation
						selected_object.position.copy(selected_object_position);
						selected_object.scale.copy(selected_object_scale);
						selected_object.quaternion.copy(selected_object_rotation);
						
						// Prepare the child object to be deselected
						selected_objects = selected_object;
						
					}
					
					// Create a temporary link element to trigger a save file dialog
					let link = document.createElement('a');
					
					// Serialize the game world's contents to an object URL for download
					link.href = URL.createObjectURL(new Blob([JSON.stringify(selected_objects.toJSON())], { type: "application/json" }));
					
					// Set the download file name
					link.download = prefab_name;
					
					// Append the link element to the document body
					document.body.appendChild(link);
					
					// Trigger the save file dialog
					link.click();
					
					// Remove the link element from the document body
					document.body.removeChild(link);
				
				}
				
			}
			
			/**
			 * Cuts the selected objects.
			 */
			static cutSelectedObjects()
			{
				
				// Detatch transform controls
				Game.player.controls.transform_controls.detach();
				
				// Remove selected objects from the world
				this.removeObject(this.selected_objects);
				
				// Copy the selected objects to the clipboard
				this.clipboard_objects = this.selected_objects.deepClone();
				
				// Reset the selected objects group
				this.selected_objects = new THREE.Group();
				
				// Update selected object UI
				Game.ui.editor.updateSelectedObjectsWindow();
				
			}
			
			/**
			 * Copies the selected objects.
			 */
			static copySelectedObjects()
			{
				
				// Copy the selected objects to the clipboard
				this.clipboard_objects = this.selected_objects.deepClone();
				
			}
			
			/**
			 * Pastes the clipboard objects.
			 */
			static pasteClipboardObjects()
			{
				
				// Reset the selected objects
				this.resetSelectedObjects();
				
				// Copy the selected objects to the clipboard
				this.selected_objects = this.clipboard_objects.deepClone();
				
				// Re-add the group back to the world
				this.addObject(this.selected_objects);
				this.selected_objects.updateMatrixWorld();
				
				// Attach transform controls to new selected object
				Game.player.controls.transform_controls.attach(this.selected_objects);
				
				// Update selected object UI
				Game.ui.editor.updateSelectedObjectsWindow();
				
			}
			
			/**
			 * Deletes the selected objects.
			 */
			static deleteSelectedObjects()
			{
				
				// If an object is selected...
				if (this.selected_objects.children.length > 0)
				{
					
					// Detatch transform controls from object
					Game.player.controls.transform_controls.detach();
					
					// Remove the selected objects froup from the world
					this.removeObject(this.selected_objects);
					
					// Reset the selected objects group
					this.selected_objects = new THREE.Group();
					
					// Update selected object UI
					Game.ui.editor.updateSelectedObjectsWindow();
					
				}
				
			}
			
			/**
			 * Groups the selected objects.
			 */
			static groupSelectedObjects()
			{
				
				// If an object is selected...
				if (this.selected_objects.children.length > 0)
				{
					
					// Detatch transform controls from object
					Game.player.controls.transform_controls.detach();
					
					// Remove the selected objects froup from the world
					this.removeObject(this.selected_objects);
					
					// The new object group will just be a clone of the selected objects group
					let grouped_objects = this.selected_objects.deepClone();
					
					// Reset the selected objects group
					this.selected_objects = new THREE.Group();
					
					// Set the selected objects group's position to that of the first selected object
					this.selected_objects.position.copy(grouped_objects.position);
					
					// Calculate the position/scale/rotation offset between the selected objects group and the object being currently selected
					let selected_objects_offset = new THREE.Vector3().subVectors(grouped_objects.position, this.selected_objects.position);
					
					// Set the new selected object's position/scale/rotation according to the offset
					grouped_objects.position.copy(selected_objects_offset);
					
					// Get the new selected object
					this.selected_objects.add(grouped_objects);
					
					// Re-add the group back to the world
					this.addObject(this.selected_objects);
					
					// Attach transform controls to new selected object
					Game.player.controls.transform_controls.attach(this.selected_objects);
					
					// Update selected object UI
					Game.ui.editor.updateSelectedObjectsWindow();
					
				}
				
			}
			
			/**
			 * Un-groups the selected objects.
			 */
			static ungroupSelectedObjects()
			{
				
				// If an object is selected...
				if (this.selected_objects.children.length > 0 && this.selected_objects.children[0].isGroup)
				{
					
					// Detatch transform controls from object
					Game.player.controls.transform_controls.detach();
					
					// Remove the selected objects froup from the world
					this.removeObject(this.selected_objects);
					
					// Get the selected objects group's child
					let selected_object_group = this.selected_objects.children[0];
					
					// Get child's position/scale/rotation
					let selected_object_position = selected_object_group.position.clone();
					let selected_object_scale = selected_object_group.scale.clone();
					let selected_object_rotation = selected_object_group.quaternion.clone();
					
					// Calculate the child's new position/scale/rotation relative to the world instead of the selected objects group
					selected_object_rotation.premultiply(this.selected_objects.quaternion);
					selected_object_position.applyQuaternion(this.selected_objects.quaternion);
					selected_object_position.multiply(this.selected_objects.scale);
					selected_object_position.add(this.selected_objects.position);
					selected_object_scale.multiply(this.selected_objects.scale);
					
					// Set the child's new position/scale/rotation
					selected_object_group.position.copy(selected_object_position);
					selected_object_group.scale.copy(selected_object_scale);
					selected_object_group.quaternion.copy(selected_object_rotation);
					
					// Remove the child from the selected objects group
					this.selected_objects.remove(selected_object_group);
					
					// Get the selected objects group's child
					this.selected_objects = selected_object_group;
					
					// Re-add the child to the world
					this.addObject(this.selected_objects);
					
					// Attach transform controls to new selected object
					Game.player.controls.transform_controls.attach(this.selected_objects);
					
					// Update selected object UI
					Game.ui.editor.updateSelectedObjectsWindow();
					
				}
				
			}
			
			/**
			 * Sets the material colour of the selected objects.
			 */
			static setSelectedObjectsColour(selected_colour)
			{
				
				// Set the selected object's new colour...
				if (this.selected_objects.children.length > 0)
				{
					this.selected_objects.traverse((child) => {
						if (child.isMesh)
						{
							child.material = child.userData.original_material.clone();
							child.material.color.set(new THREE.Color(selected_colour));
							child.userData.original_material = child.material.clone();
							child.material = new THREE.MeshBasicMaterial({ color: new THREE.Color(selected_colour), wireframe: true });
						}
					});
				}
				
			}
			
		//#endregion
		
		
		//#region [Highlight / Select Faces]
			
			/**
			 * Highlights whichever object face the player is looking at.
			 */
			static highlightFace()
			{
				
				// Cast a ray from the player's position in the direction the player is looking
				Game.player.raycaster.ray.origin.copy(Game.player.position);
				Game.player.raycaster.ray.direction.set(0, 0, -1).applyQuaternion(Game.player.quaternion);
				Game.player.raycaster.near = 0;
				Game.player.raycaster.far = Infinity;
				
				// Check intersections with world objects
				const intersects = Game.player.raycaster.intersectRaycastableObjects(this.getObjects(), true);
				if (intersects.length > 0)
				{
					
					// Get first intersected object
					const intersect_object = intersects[0].object;
					const intersect_face_index = intersects[0].faceIndex;
					
					// If geometry is indexed and doesn't have any deleted faces...
					if (intersect_object.geometry.index && !intersect_object.userData.has_deleted_faces)
					{
						
						// Store the original geometry in the intersected object's userData
						intersect_object.userData.original_geometry = intersect_object.geometry;
						
						// Initialize values to hold the collection of selected object faces and a flag indicating whether or not any faces have been deleted
						intersect_object.userData.selected_faces = new Set();
						intersect_object.userData.has_deleted_faces = false;
						
						// Convert geometry to non-indexed geometry for face manipulation
						intersect_object.geometry = intersect_object.geometry.toNonIndexed();
						
						// Assign a default white colour to each of the geometry's vertices
						const colors = [];
						for (let i = 0; i < intersect_object.geometry.attributes.position.count; i++)
						{
							colors.push(1, 1, 1);
						}
						intersect_object.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
						intersect_object.material.vertexColors = true;
						intersect_object.material.needsUpdate = true;
						
						// Create groups of faces/triangles for highlighting/selecting/deleting later
						this.createFaceGroups(intersect_object);
						
					}
					
					// The object is now non-indexed and has its face groups identified
					
					// If the previously hovered face index is different than the currently intersected face index, or the currently intersected object
					// is different than the last object which was being hovered over...
					if (this.previously_hovered_face_index !== intersect_face_index || this.hovered_faces_object !== intersect_object)
					{
						
						// If an object face was previously being hovered over, reset its colour...
						if (this.hovered_faces_object && this.previously_hovered_face_index !== null)
						{
							
							// Get the previously hovered face's group id and group
							const face_group_id = this.hovered_faces_object.userData.face_group_ids.getX(this.previously_hovered_face_index * 3);
							const face_group = this.hovered_faces_object.userData.face_groups[face_group_id];
							
							// Reset the colour of the face which was previously being hovered over...
							if (!(this.hovered_faces_object.userData.selected_faces && this.hovered_faces_object.userData.selected_faces.has(face_group_id)))
							{
								this.setFaceGroupColour(this.hovered_faces_object, face_group, new THREE.Color(0xffffff));
							}
							
						}
						
						// If the currently intersected face isn't already selected, highlight it...
						if (!(intersect_object.userData.selected_faces && (intersect_object.userData.face_group_ids && intersect_object.userData.selected_faces.has(intersect_object.userData.face_group_ids.getX(intersect_face_index * 3)))))
						{
							
							// Get the intersected face's group
							const face_group = intersect_object.userData.face_groups[intersect_object.userData.face_group_ids.getX(intersect_face_index * 3)];
							
							// Highlight the face group...
							const color = new THREE.Color(this.highlighted_face_colour);
							if (face_group)
							{
								face_group.forEach((fIndex) => {
									const vertex_indices = [fIndex * 3, fIndex * 3 + 1, fIndex * 3 + 2];
									vertex_indices.forEach((i) => {
										intersect_object.geometry.attributes.color.setXYZ(i, color.r, color.g, color.b);
									});
								});
								intersect_object.geometry.attributes.color.needsUpdate = true;
							}
							
						}
						
						// Set the hovered faces object and face index
						this.hovered_faces_object = intersect_object;
						this.previously_hovered_face_index = intersect_face_index;
						
					}
					
					
				} // Otherwise, if the player isn't looking at any objects...
				else
				{
					
					// If an object face was previously being hovered over, reset its colour...
					if (this.hovered_faces_object && this.previously_hovered_face_index !== null)
					{
						
						// Get the previously hovered face's group id and group
						const face_group_id = this.hovered_faces_object.userData.face_group_ids.getX(this.previously_hovered_face_index * 3);
						const face_group = this.hovered_faces_object.userData.face_groups[face_group_id];
						
						// Reset the colour of the face which was previously being hovered over...
						if (!(this.hovered_faces_object.userData.selected_faces && this.hovered_faces_object.userData.selected_faces.has(face_group_id)))
						{
							this.setFaceGroupColour(this.hovered_faces_object, face_group, new THREE.Color(0xffffff));
						}
						
					}
					
					// Convert the object back to indexed geometry if it's allowed to be (only it has no selected or deleted faces)...
					if (this.hovered_faces_object && (this.hovered_faces_object.userData && this.hovered_faces_object.userData.selected_faces && this.hovered_faces_object.userData.selected_faces.size === 0 && !this.hovered_faces_object.userData.has_deleted_faces && this.hovered_faces_object.userData.original_geometry))
					{
						
						// Reset the object's geometry back to its original indexed geometry
						this.hovered_faces_object.geometry = this.hovered_faces_object.userData.original_geometry;
						this.hovered_faces_object.material.vertexColors = false;
						this.hovered_faces_object.material.needsUpdate = true;
						
						// Delete the object's geometry face modification related userData values
						delete this.hovered_faces_object.userData.original_geometry;
						delete this.hovered_faces_object.userData.face_groups;
						delete this.hovered_faces_object.userData.selected_faces;
						delete this.hovered_faces_object.userData.has_deleted_faces;
						
					}
					
					// Reset the hovered faces object and face index
					this.hovered_faces_object = null;
					this.previously_hovered_face_index = null;
					
				}
				
			}
			
			/**
			 * Selects whichever object face is currently highlighted.
			 */
			static selectFace()
			{
				
				// If an object is being hovered over...
				if (this.hovered_faces_object && this.previously_hovered_face_index !== null)
				{
					
					// Get the hovered face's group id and group
					const face_group_id = this.hovered_faces_object.userData.face_group_ids.getX(this.previously_hovered_face_index * 3);
					const face_group = this.hovered_faces_object.userData.face_groups[face_group_id];
					
					// Initialize flag indicating the hovered face's group should be selected if it isn't already selected
					const select_face_group = !(this.hovered_faces_object.userData.selected_faces && this.hovered_faces_object.userData.selected_faces.has(face_group_id));

					// If the player is not holding down the shift key to select multiple faces...
					if (!Game.player.controls.modifier_shift_left_pressed && !Game.player.controls.modifier_control_left_pressed)
					{
						
						// Deselect all world object's faces...
						this.getObjects().forEach((object) => {
							object.traverse((child) => {
								
								// If any of the child object's faces are selected...
								if (child.userData.selected_faces)
								{
									
									// Reset the object's selected faces
									child.userData.selected_faces.clear();
									
									// Reset the object's selected face colours
									if (child.material && child.material.vertexColors)
									{
										const colour = new THREE.Color(0xffffff);
										const colours = child.geometry.attributes.color;
										for (let i = 0; i < colours.count; i++)
										{
											colours.setXYZ(i, colour.r, colour.g, colour.b);
										}
										colours.needsUpdate = true;
									}
									
								}
								
							});
						});
						
					}
					
					// Select the hovered face group if it wasn't already selected...
					if (select_face_group)
					{
						this.hovered_faces_object.userData.selected_faces.add(face_group_id);
						this.setFaceGroupColour(this.hovered_faces_object, face_group, new THREE.Color(this.selected_face_colour));
					}
					
					
				} // Otherwise, if no object is being hovered over...
				else
				{
					
					// Deselect all world object's faces...
					this.getObjects().forEach((object) => {
						object.traverse((child) => {
							
							// If any of the child object's faces are selected...
							if (child.userData.selected_faces)
							{
								
								// Reset the object's selected faces
								child.userData.selected_faces.clear();
								
								// Reset the object's selected face colours
								if (child.material && child.material.vertexColors)
								{
									const colour = new THREE.Color(0xffffff);
									const colours = child.geometry.attributes.color;
									for (let i = 0; i < colours.count; i++)
									{
										colours.setXYZ(i, colour.r, colour.g, colour.b);
									}
									colours.needsUpdate = true;
								}
								
							}
							
						});
					});
					
				}
				
			}
			
			/**
			 * Resets any highlighted or selected object faces.
			 */
			static resetHighlightedAndSelectedFaces()
			{
				
				// Deselect all world object's faces...
				this.getObjects().forEach((object) => {
					object.traverse((child) => {
						
						// Convert the object back to indexed geometry if it's allowed to be (only it has no selected or deleted faces)...
						if (child.userData && child.userData.selected_faces && child.userData.selected_faces.size === 0 && !child.userData.has_deleted_faces && child.userData.original_geometry)
						{
							
							// Reset the object's geometry back to its original indexed geometry
							child.geometry = child.userData.original_geometry;
							child.material.vertexColors = false;
							child.material.needsUpdate = true;
							
							// Delete the object's geometry face modification related userData values
							delete child.userData.original_geometry;
							delete child.userData.face_groups;
							delete child.userData.selected_faces;
							delete child.userData.has_deleted_faces;
							
							
						} // Otherwise, if the object is not allowed to be converted back to indexed geometry...
						else
						{
							
							// If any of the child object's faces are selected...
							if (child.userData.selected_faces)
							{
								
								// Reset the object's selected faces
								child.userData.selected_faces.clear();
								
								// Reset selected face colours
								if (child.material && child.material.vertexColors)
								{
									const colour = new THREE.Color(0xffffff);
									const colours = child.geometry.attributes.color;
									for (let i = 0; i < colours.count; i++)
									{
										colours.setXYZ(i, colour.r, colour.g, colour.b);
									}
									colours.needsUpdate = true;
								}
								
							}
							
						}
						
						// Reset the hovered faces object and face index
						this.previously_hovered_face_index = null;
						this.hovered_faces_object = null;
						
					});
				});
			}
			
			/**
			 * Deletes the selected object faces.
			 */
			static deleteSelectedFaces()
			{
				
				// Check if object face selection is enabled...
				if (this.selection_mode == this.SelectionModes.Faces)
				{
					
					// Iterate through all object looking for selected faces to delete...
					this.getObjects().forEach((object) => {
						object.traverse((child) => {
							
							// If the child object has any selected faces...
							if (child.userData.selected_faces && child.userData.selected_faces.size > 0)
							{
								
								// Get the positions, colours, and normals from the object's geometry
								const position = child.geometry.attributes.position;
								const colours = child.geometry.attributes.color;
								const normals = child.geometry.attributes.normal;
								
								// Get the object's array of face group IDs
								const face_group_ids = child.userData.face_group_ids;
								
								// Initialize an array of all faces to delete
								let faces_to_delete = [];
								child.userData.selected_faces.forEach((face_group_id) => {
									const face_group = child.userData.face_groups[face_group_id];
									faces_to_delete = faces_to_delete.concat(face_group);
								});
								
								// Sort the faces to delete in descending order
								faces_to_delete.sort((a, b) => b - a);
								
								// Iterate through each face to delete and delete it...
								faces_to_delete.forEach((face_index) => {
									
									// Get the vertices of the current face to be deleted
									const vertices = [face_index * 3, face_index * 3 + 1, face_index * 3 + 2];
									
									// Sort the vertices
									vertices.sort((a, b) => b - a);
									
									// Remove each vertex...
									vertices.forEach((i) => {
										
										// Remove vertex position data
										const position_array = Array.from(position.array);
										position_array.splice(i * 3, 3);
										position.array = new Float32Array(position_array);
										
										// Remove vertex colour data
										const colour_array = Array.from(colours.array);
										colour_array.splice(i * 3, 3);
										colours.array = new Float32Array(colour_array);
										
										// Remove vertex normals data
										const normals_array = Array.from(normals.array);
										normals_array.splice(i * 3, 3);
										normals.array = new Float32Array(normals_array);
										
										// Remove face group id
										const face_group_ids_array = Array.from(face_group_ids.array);
										face_group_ids_array.splice(i, 1);
										face_group_ids.array = new Uint16Array(face_group_ids_array);
										
									});
									
									// Update geometry attribute counts
									const new_count = position.array.length / 3;
									position.count = new_count;
									colours.count = new_count;
									normals.count = new_count;
									face_group_ids.count = new_count;
									
									// Set geometry attributes to require an update
									position.needsUpdate = true;
									colours.needsUpdate = true;
									normals.needsUpdate = true;
									face_group_ids.needsUpdate = true;
									
								});
								
								// Clear the object's selected faces and flag it as having deleted faces
								child.userData.selected_faces.clear();
								child.userData.has_deleted_faces = true;
								
								// Compute geometry normals
								child.geometry.computeVertexNormals();
								
								// Re-create the object's face groups
								this.createFaceGroups(child);
								
							}
							
						});
					});
					
					// Reset the previously hovered face index
					this.previously_hovered_face_index = null;
					
				}
				
			}
			
			/**
			 * Create groups of faces for an object's geometry, which consist of one-to-many faces (aka triangles), and store them in the object's userData. Boxes will generate groups of two faces/triangles which make up the surfaces of each side. Other geometries keep it to one face/triangle per group.
			 *
			 * @param {THREE.Mesh} mesh The object whose full surface of triangles will be grouped up according to geometry type.
			 */
			static createFaceGroups(mesh)
			{
				
				// Get the object geometry's face count (each face has 3 vertices, because each face is a triangle)
				const geometry_face_count = mesh.geometry.attributes.position.count / 3;
				
				// Initialize an array of face group IDs
				const face_group_ids = new Uint16Array(geometry_face_count * 3);
				
				// Initialize a counter for tracking the current face group id as face groups are being created
				let current_face_group_id = 0;
				
				// If the object was originally a box (not accounting for the user messing with the vertices after the fact)...
				if (mesh.userData.original_geometry && mesh.userData.original_geometry.type === 'BoxGeometry')
				{
					
					// Each side of a box consists of two faces/triangles, so provide the current face group id to two faces/triangles accordingly
					// by letting the vertex offset value climb twice as high before moving on to the next face group...
					for (let i = 0; i < geometry_face_count; i += 2)
					{
						for (let j = 0; j < 2; j++)
						{
							const vertexOffset = (i + j) * 3;
							face_group_ids[vertexOffset] = current_face_group_id;
							face_group_ids[vertexOffset + 1] = current_face_group_id;
							face_group_ids[vertexOffset + 2] = current_face_group_id;
						}
						current_face_group_id++;
					}
					
					
				} // Otherwise, if the object was originally any other type of object (again, not accounting for the user messing with vertices)...
				else
				{
					
					// For all other geometries, each face group will only have one face/triangle, so let the vertex offset value climb accordingly
					// and move on to the next face group only after one face/triangle has been added...
					for (let i = 0; i < geometry_face_count; i++)
					{
						const vertexOffset = i * 3;
						face_group_ids[vertexOffset] = current_face_group_id;
						face_group_ids[vertexOffset + 1] = current_face_group_id;
						face_group_ids[vertexOffset + 2] = current_face_group_id;
						current_face_group_id++;
					}
					
				}
				
				// Add the array of face group IDs to the object
				mesh.userData.face_group_ids = new THREE.BufferAttribute(face_group_ids, 1);
				
				// Initialize a collection of face groups to add to the object
				mesh.userData.face_groups = { };
				
				// Add each of the object's faces to the appropriate face group according to the group IDs that were just created...
				for (let i = 0; i < geometry_face_count; i++)
				{
					const face_group_id = mesh.userData.face_group_ids.getX(i * 3);
					if (!mesh.userData.face_groups[face_group_id])
					{
						mesh.userData.face_groups[face_group_id] = [];
					}
					mesh.userData.face_groups[face_group_id].push(i);
				}
				
			}
			
			/**
			 * Sets the specified object's face group to the desired colour.
			 *
			 * @param {THREE.Mesh} mesh The object whose face group colour is to be set.
			 * @param {array} face_group The face group whose colour is to be set.
			 * @param {THREE.Color} colour The colour to set the specified face group's faces to.
			 */
			static setFaceGroupColour(mesh, face_group, colour)
			{
				
				// If the face group is valid...
				if (face_group)
				{
					
					// Iterate through each face to re-colour...
					face_group.forEach((face_index) => {
						
						// Get the vertices of the current face to re-colour
						const vertices = [face_index * 3, face_index * 3 + 1, face_index * 3 + 2];
						
						// Set the colour of the face's vertices
						vertices.forEach((i) => {
							mesh.geometry.attributes.color.setXYZ(i, colour.r, colour.g, colour.b);
						});
					});
					
					// Set the geometry colour attribute to require an update
					mesh.geometry.attributes.color.needsUpdate = true;
					
				}
				
			}
			
		//#endregion
		
		
		//#region [Highlight / Select Vertices]
			
			/**
			 * Highlights the vertices of whichever object the player is looking at.
			 */
			static highlightVertices()
			{
				
				// Cast a ray from the player's position in the direction the player is looking
				Game.player.raycaster.ray.origin.copy(Game.player.position);
				Game.player.raycaster.ray.direction.set(0, 0, -1).applyQuaternion(Game.player.quaternion);
				Game.player.raycaster.near = 0;
				Game.player.raycaster.far = Infinity;
				
				// Get first intersected object
				let intersect_object = null;
				let intersect_point = null;
				
				// Check intersections with world objects
				const intersects = Game.player.raycaster.intersectRaycastableObjects(this.getObjects(), true);
				if (intersects.length > 0)
				{
					
					// Get first intersected object
					intersect_object = intersects[0].object.getTopMostParent();
					intersect_point = intersects[0].point;
					
					// Check if the intersected object is a mesh or a group and doesn't already have highlighted vertices, or if it's just a set of points...
					if ((intersect_object instanceof THREE.Mesh || intersect_object instanceof THREE.Group) && intersect_object != this.highlighted_vertices_object && intersect_object != this.selected_vertices_object || intersect_object instanceof THREE.Points)
					{
					
						// If the intersect object is just a set of points...
						if (intersect_object instanceof THREE.Points)
						{
							
							// Check if the intersect object overlaps the selected vertices object or the highlighted vertices object, and if it does, set it to the corresponding object instead...
							let overlap_found = false;
							intersects.forEach(intersect => {
								if (intersect.object == this.selected_vertices_object)
								{
									overlap_found = true;
									intersect_object = this.selected_vertices_object;
								}
								else if (intersect.object == this.highlighted_vertices_object)
								{
									overlap_found = true;
									intersect_object = this.highlighted_vertices_object;
								}
							});
							
							// If no overlap was found, just set the intersect object to the first available intersected mesh...
							if (!overlap_found)
							{
								intersects.forEach(intersect => {
									if (intersect.object instanceof THREE.Mesh)
									{
										intersect_object = intersect.object;
									}
								});
							}
							
						}
						
						// If the intersected object is now a mesh and doesn't match the highlighted verticies object, the selected vertices object, or any of the spheres in the selected vertices object's group of selected vertices... (I know, right? Mouthful...)
						if ((intersect_object instanceof THREE.Mesh || intersect_object instanceof THREE.Group) && intersect_object != this.highlighted_vertices_object && intersect_object != this.selected_vertices_object && !(this.selected_vertices_object && this.selected_vertices_object.userData.selected_vertices && this.selected_vertices_object.userData.selected_vertices.getObjectById(intersect_object.id)))
						{
							
							// Reset the highlighted vertices
							this.resetHighlightedVertices();
							
							// Disable vertex highlighting on the selected object's shader
							if (this.selected_vertices_object)
							{
								this.selected_vertices_object.traverse((child) => {
									if (child instanceof THREE.Points)
									{
										if (child.material && child.material.uniforms)
										{
											child.material.uniforms.highlight_vertices.value = false;
										}
									}
								});
								
							}
							
							// Get intersected object to highlight its vertices
							this.highlighted_vertices_object = intersect_object;
							
							// Traverse the object to highlight all of its vertices and its children's vertices
							this.highlighted_vertices_object.traverse((child) => {
								if (child.isMesh && child.geometry)
								{
									
									// Draw the object's vertices and store them in the userData
									child.userData.vertices = new THREE.Points(child.geometry, Shaders.pointOutline(this.highlighted_vertex_colour, this.highlighted_vertex_size, this.highlighted_vertex_outline_colour, this.highlighted_vertex_outline_size));
									child.userData.vertices.userData.ignore_raycast = true;
									child.add(child.userData.vertices);
									
									// Reset the object's collection of indices at vertex positions
									child.userData.object_indices_at_positions = new Map();
									
									// Enable vertex highlighting on the object's shader
									if (child.material.uniforms && child.material.uniforms.highlight_vertices)
									{
										child.material.uniforms.highlight_vertices.value = true;
									}
									
									// Get the object's vertices and vertex count
									const highlighted_vertices_object_position = child.geometry.getAttribute('position');
									const highlighted_vertices_object_vertex_count = highlighted_vertices_object_position.count;
									
									// Generate new collection of indices at vertex positions for the object...
									for (let i = 0; i < highlighted_vertices_object_vertex_count; i++)
									{
										const position = new THREE.Vector3().fromBufferAttribute(highlighted_vertices_object_position, i);
										const key = position.x.toFixed(5) + ',' + position.y.toFixed(5) + ',' + position.z.toFixed(5);
										
										if (!child.userData.object_indices_at_positions.has(key))
										{
											child.userData.object_indices_at_positions.set(key, []);
										}
										
										let object_indices_at_positions = child.userData.object_indices_at_positions.get(key);
										object_indices_at_positions.push(i);
										
										child.userData.object_indices_at_positions.set(key, object_indices_at_positions);
										
									}
									
								}
							});
							
							
						} // Otherwise, if the intersected object fails *all* those conditions, and we're sure it's *not* just the highlighted vertices object...
						else if (intersect_object != this.highlighted_vertices_object)
						{
							
							// Reset the highlighted vertices
							this.resetHighlightedVertices();
							
						}
						
						
					} // Otherwise, if the intersected object is the highlighted or selected vertices object...
					else if (intersect_object == this.highlighted_vertices_object || intersect_object == this.selected_vertices_object)
					{
						
						// If the highlighted object exists, but the mouse is not intersecting it...
						if (this.highlighted_vertices_object && intersect_object != this.highlighted_vertices_object)
						{
						
							// Reset the highlighted vertices
							this.resetHighlightedVertices();
							
						}
						
						// Update the intersected object's shader material
						intersect_object.traverse((child) => {
							if (child instanceof THREE.Points)
							{
								
								// Check if the shader material has highlighted vertices to update...
								if (child.material && child.material.uniforms && child.material.uniforms.highlight_vertices)
								{
									
									// If the transform controls are dragging, disable highlighted vertices...
									if (Game.player.controls.transform_controls.dragging)
									{
										
										// Disable highlighted vertices
										child.material.uniforms.highlight_vertices.value = false;
										
										
									} // Otherwise, enable highlighted vertices and update them...
									else
									{
										
										// Enable highlighted vertices
										child.material.uniforms.highlight_vertices.value = true;
										
										// Update the mouse's intersection point
										child.material.uniforms.intersection_point.value.copy(intersect_point);
										
										// Update the highlight radius
										if (this.tool_mode == this.ToolMode.Spawn && this.spawn_tool == this.SpawnTools.Terrain)
										{
											this.vertex_pointer_radius = this.terrain_tool_select_vertex_radius;
										}
										else
										{
											this.vertex_pointer_radius = this.selected_vertices_object_highlight_vertices_radius;
										}
										child.material.uniforms.radius_size.value = this.vertex_pointer_radius;
										
										// Update the highlight radius shape
										child.material.uniforms.radius_shape.value = this.terrain_tool;
										
									}
									
								}
								
							}
						});
						
						
					} // Otherwise, if the intersected object is any other object...
					else
					{
						
						// Reset the highlighted vertices
						this.resetHighlightedVertices();
						
					}
					
					
				}  // Otherwise, if the player isn't looking at any objects...
				else
				{
					
					// Reset the highlighted vertices
					this.resetHighlightedVertices();
					
				}
				
			}
			
			/**
			 * Resets the highlighted vertices object.
			 *
			 * @param {boolean} preserve_indices Boolean flag indicating whether or not to preserve the object indices at positions in preparation for making the highlighted vertices object into the selected vertices object.
			 */
			static resetHighlightedVertices(preserve_indices = false)
			{
				
				// If vertices are highlighted...
				if (this.highlighted_vertices_object)
				{
					
					// Remove vertices from each of the highlighted object's children...
					this.highlighted_vertices_object.traverse((child) => {
						if (child.isMesh && child.geometry)
						{
							
							// Remove the set of points from the highlighted vertices object
							child.remove(child.userData.vertices);
							
							// Delete the points object from the object's userData
							delete child.userData.vertices;
							
							// If we're not flagged to preserve object indices at positions...
							if (!preserve_indices)
							{
								
								// Delete the object indices at positions too
								delete child.userData.object_indices_at_positions;
								
							}
							
						}
					});
					
					// Reset the highlighted vertices object
					this.highlighted_vertices_object = null;
					
				}
				
			}
			
			/**
			 * Selects the highlighted vertices object which the player is looking at. If the object is already selected, then selects whichever individual vertex the player is looking at.
			 */
			static selectVertex()
			{
				
				// Cast a ray from the player's position in the direction the player is looking
				Game.player.raycaster.ray.origin.copy(Game.player.position);
				Game.player.raycaster.ray.direction.set(0, 0, -1).applyQuaternion(Game.player.quaternion);
				Game.player.raycaster.near = 0;
				Game.player.raycaster.far = Infinity;
				Game.player.raycaster.params.Points.threshold = 0.1;
				
				// Check intersections with world objects
				const intersects = Game.player.raycaster.intersectObjects(this.getObjects(), true);
				if (intersects.length > 0)
				{
					
					// Get first intersected object
					let intersect_object = intersects[0].object.getTopMostParent();
					let intersect_point = intersects[0].point;
					
					// Check if the intersected object is a mesh and already has highlighted vertices, or if it's a set of points...
					if ((intersect_object instanceof THREE.Mesh || intersect_object instanceof THREE.Group) && (intersect_object == this.highlighted_vertices_object || intersect_object == this.selected_vertices_object) || intersect_object instanceof THREE.Points)
					{
						
						// Check if the set of points overlaps the selected vertices object, and retrieve it instead...
						if (intersect_object instanceof THREE.Points)
						{
							
							// Check if the intersect object overlaps the selected vertices object or the highlighted vertices object, and if it does, set it to the corresponding object instead...
							intersects.forEach(intersect => {
								if (intersect.object == this.highlighted_vertices_object)
								{
									intersect_object = intersect.object;
									intersect_point = intersect.point;
								}
								else if (intersect.object == this.selected_vertices_object)
								{
									intersect_object = intersect.object;
									intersect_point = intersect.point;
								}
							});
							
						}
						
						// If the intersect object is already highlighted, then select it...
						if (intersect_object == this.highlighted_vertices_object)
						{
							
							// Clear any previous selected vertices object
							this.resetSelectedVertices();
							
							// Reset the highlighted vertices object (which is what's being intersected here, obviously) but preserve its object indices at positions because we still need them
							this.resetHighlightedVertices(true);
							
							// Select the intersected object
							this.selected_vertices_object = intersect_object;
							
							// Iterate through the selected object and all its children...
							this.selected_vertices_object.traverse((child) => {
								if (child.isMesh && child.geometry)
								{
									
									// Draw the object's vertices and store them in the userData
									child.userData.vertices = new THREE.Points(child.geometry, Shaders.pointOutlineInRadius(this.unselected_vertex_colour, this.selected_vertex_size, this.selected_vertex_outline_colour, this.selected_vertex_outline_size, this.terrain_tool, (this.spawn_tool == this.SpawnTools.Terrain ? this.terrain_tool_select_vertex_radius : this.selected_vertices_object_highlight_vertices_radius), this.selected_vertices_object_highlight_vertices_colour));
									child.userData.vertices.userData.ignore_raycast = true;
									child.add(child.userData.vertices);
									
									// Reset the selected vertex indices and selected vertices initial matrix in preparation for storing those values
									child.userData.selected_vertex_indices = new Set();
									child.userData.selected_vertices_initial_position = new THREE.Vector3();
									child.userData.selected_vertices_initial_delta = new THREE.Vector3();
									child.userData.selected_vertices_initial_matrix = new THREE.Matrix4();
									
								}
							});
							
							
						} // Otherwise, if the intersect object is already selected...
						else if (intersect_object == this.selected_vertices_object)
						{
							
							// Iterate through the selected object and all its children...
							this.selected_vertices_object.traverse((child) => {
								if (child.isMesh && child.geometry)
								{
									
									// Get the object's vertex positions
									const positions = child.geometry.getAttribute('position');
									
									// Get the vertex indices of the vertices within the vertex selection radius...
									let indices = [];
									
									// Iterate through each of the vertices...
									for (let i = 0; i < positions.count; i++)
									{
										
										// Get the position of the current vertex
										const vertex_position = new THREE.Vector3().fromBufferAttribute(positions, i);
										const world_vertex_position = child.localToWorld(vertex_position.clone());
										
										// Get distance between the current vertex position and the intersect point
										const offset = world_vertex_position.sub(intersect_point);
										
										// Select the vertex index based on the terrain tool shape...
										if (this.terrain_tool == this.TerrainTools.Square)
										{
											if (Math.abs(offset.x) <= this.vertex_pointer_radius && Math.abs(offset.z) <= this.vertex_pointer_radius)
											{
												indices.push(i);
											}
										}
										else if (this.terrain_tool == this.TerrainTools.Circle)
										{
											if ((offset.x * offset.x + offset.z * offset.z) <= (this.vertex_pointer_radius * this.vertex_pointer_radius))
											{
												indices.push(i);
											}
										}
										
									}
									
									// If intersected vertex indices were found, and they're not already selected...
									if (indices)
									{
										
										// Clear any previous selected vertices if the shift key isn't being pressed...
										if (!Game.player.controls.modifier_shift_left_pressed && !Game.player.controls.modifier_control_left_pressed)
										{
											child.userData.selected_vertex_indices.clear();
										}
										
										// Select the intersected vertices
										indices.forEach(i => child.userData.selected_vertex_indices.add(i));
										
										
									} // Otherwise, if no intersected vertex indices were found (unlikely), or they're already selected (likely)...
									else
									{
										
										// Clear any previous selected vertices
										child.userData.selected_vertex_indices.clear();
										
									}
									
									// If any vertices were actually successfully selected...
									if (child.userData.selected_vertex_indices.size > 0)
									{
										
										// Remove the selected vertex helper spheres group from the world
										if (child.userData.selected_vertices)
										{
											this.removeObject(child.userData.selected_vertices);
										}
										
										// Re-initialize the group which will contain selected vertex helper spheres
										child.userData.selected_vertices = new THREE.Group();
										child.userData.selected_vertices.userData.ignore_raycast = true;
										
										// Get the helper sphere group's initial position, scale, and rotation in preparation for repositioning it over the selected vertices object
										let selected_vertices_object_position = child.userData.selected_vertices.position.clone();
										let selected_vertices_object_scale = child.userData.selected_vertices.scale.clone();
										let selected_vertices_object_rotation = child.userData.selected_vertices.quaternion.clone();
										
										// Modify those initial position values according to the selected vertices obect's position, rotation, and scale
										selected_vertices_object_rotation.premultiply(child.quaternion);
										selected_vertices_object_position.applyQuaternion(child.quaternion);
										selected_vertices_object_position.multiply(child.scale);
										selected_vertices_object_position.add(child.position);
										selected_vertices_object_scale.multiply(child.scale);
										
										// Position, rotate, and scale the helper sphere group according to those modified position values
										child.userData.selected_vertices.position.copy(selected_vertices_object_position);
										child.userData.selected_vertices.scale.copy(selected_vertices_object_scale);
										child.userData.selected_vertices.quaternion.copy(selected_vertices_object_rotation);
										
										// Get the inverse scale of the helper sphere group so that we can make sure the helper spheres don't end up all stretched and weird if the selected vertices object's scale has been changed at all
										const selected_vertices_object_inverse_scale = new THREE.Vector3(1 / child.userData.selected_vertices.scale.x, 1 / child.userData.selected_vertices.scale.y, 1 / child.userData.selected_vertices.scale.z);
										
										// Add helper spheres for each selected vertex...
										for (let index of child.userData.selected_vertex_indices)
										{
											
											// Get the position of the current selected index
											const position = new THREE.Vector3();
											position.fromBufferAttribute(child.geometry.getAttribute('position'), index);
											
											// Initialize a helper sphere
											const sphere_geometry = new THREE.SphereGeometry(0.05, 8, 8);
											const sphere_material = new THREE.MeshBasicMaterial({ color: this.selected_vertex_colour });
											const sphere = new THREE.Mesh(sphere_geometry, sphere_material);
											sphere.userData.ignore_raycast = true;
											
											// Position and scale the helper sphere
											sphere.position.copy(position);
											sphere.scale.copy(selected_vertices_object_inverse_scale);
											
											// Store the helper sphere's vertex index for applying transforms to the vertex later on
											sphere.userData.vertex_index = index;
											
											// Add the helper sphere to the helper sphere group
											child.userData.selected_vertices.add(sphere);
											
										}
											
										// Add the selected vertex helper spheres group to the world
										this.addObject(child.userData.selected_vertices);
										
										// Get the bounds of the area of the helper spheres group
										const selected_vertices_bounds = new THREE.Box3();
										for (let i = 0; i < child.userData.selected_vertices.children.length; i++)
										{
											const sphere = child.userData.selected_vertices.children[i];
											selected_vertices_bounds.expandByPoint(sphere.position);
										}
										
										// Get center of helper spheres group
										const selected_vertices_point = new THREE.Vector3();
										selected_vertices_bounds.getCenter(selected_vertices_point);
										
										// Reposition helper spheres group
										for (let i = 0; i < child.userData.selected_vertices.children.length; i++)
										{
											const sphere = child.userData.selected_vertices.children[i];
											sphere.position.sub(selected_vertices_point);
										}
										selected_vertices_point.applyMatrix4(child.matrixWorld);
										child.userData.selected_vertices.position.x = selected_vertices_point.x;
										child.userData.selected_vertices.position.y = selected_vertices_point.y;
										child.userData.selected_vertices.position.z = selected_vertices_point.z;
										
										// Attach player transform controls to helper spheres group
										Game.player.controls.transform_controls.attach(child.userData.selected_vertices);
										
									}
									else
									{
										
										// Remove the selected vertex helper spheres group from the world
										this.removeObject(child.userData.selected_vertices);
										delete child.userData.selected_vertices;
										
									}
									
								}
							});
							
							
						} // Otherwise, if the intersected object is neither highlighted nor selected...
						else
						{
							
							// Reset the selected vertices
							this.resetSelectedVertices();
							
						}
						
						
					} // Otherwise, if the intersected object is a mesh but doesn't have any highlighted vertices, and it's not a set of points either...
					else
					{
						
						// Reset the selected vertices
						this.resetSelectedVertices();
						
					}
					
					
				} // Otherwise, if the player isn't looking at any objects...
				else
				{
					
					// Reset the selected vertices
					this.resetSelectedVertices();
					
				}
				
			}
			
			/**
			 * Resets the selected vertices object.
			 */
			static resetSelectedVertices()
			{
				
				// If vertices are selected...
				if (this.selected_vertices_object)
				{
					
					// Detach the transform controls from the selected vertices object
					Game.player.controls.transform_controls.detach();
					
					// Iterate through the selected object and all its children...
					this.selected_vertices_object.traverse((child) => {
						if (child.isMesh && child.geometry)
						{
							
							// Remove the set of points from the selected vertices object
							child.remove(child.userData.vertices);
							
							// Remove the helper spheres group from the world
							this.removeObject(child.userData.selected_vertices);
							
							// Delete everything related to selected vertices from the object's userData
							delete child.userData.vertices;
							delete child.userData.selected_vertices;
							delete child.userData.selected_vertices_initial_position;
							delete child.userData.selected_vertices_initial_delta;
							delete child.userData.selected_vertices_initial_matrix;
							delete child.userData.selected_vertex_indices;
							delete child.userData.object_indices_at_positions;
							
						}
					});
					
					// Reset the selected vertices object
					this.selected_vertices_object = null;
					
				}
				
			}
			
			/**
			 * Updates the initial positions of the selected object vertices for calculating transforms.
			 */
			static updateSelectedVertexInitialPositions()
			{
				
				// If vertex selection mode is enabled...
				if (this.selection_mode == this.SelectionModes.Vertices && this.selected_vertices_object)
				{
					
					// If the player's mouse is currently dragging...
					if (Game.player.controls.mouse_dragging)
					{
						
						// Iterate through the selected object and all its children...
						this.selected_vertices_object.traverse((child) => {
							if (child.isMesh && child.geometry)
							{
								
								// Initialize the collection which will store the initial positions of the selected object vertices
								child.userData.initial_vertex_positions = { };
								
								// If the object has a group of helper spheres...
								if (child.userData.selected_vertices)
								{
									
									// Get the helper spheres group's initial world position
									child.userData.selected_vertices.getWorldPosition(child.userData.selected_vertices_initial_position);
									
									// Get the selected vertices group's initial matrix
									child.userData.selected_vertices_initial_matrix.copy(child.userData.selected_vertices.matrix);
									
									// Iterate through the selected vertices group's helper spheres
									child.userData.selected_vertices.children.forEach(sphere => {
										
										// Get the vertex index from the current helper sphere
										const index = sphere.userData.vertex_index;
										
										// Get the vertex position corresponding to the index
										const position = new THREE.Vector3();
										position.fromBufferAttribute(child.geometry.getAttribute('position'), index);
										
										// Add the vertex position to the collection of initial positions
										child.userData.initial_vertex_positions[index] = position.clone();
										
									});
								
								}
								
							}
						});
						
					}
					
				}
				
			}
			
			/**
			 * Updates the positions of the selected object vertices during vertex transformation.
			 */
			static updateSelectedVertexPositions()
			{
				
				// If vertex selection mode is enabled...
				if (this.selection_mode == this.SelectionModes.Vertices && this.selected_vertices_object)
				{
					
					// Initialize transform delta and delta matrix
					let transform_delta = new THREE.Vector3();
					let transform_delta_matrix = new THREE.Matrix4();
					
					// Get transform delta and matrix from selected vertices...
					this.selected_vertices_object.traverse((child) => {
						if (child.isMesh && child.geometry)
						{
							
							// If the selected vertices group isn't empty...
							if (child.userData.selected_vertices)
							{
								
								// Get the delta matrix between the helper spheres group's initial and current positions
								const selected_vertices_delta_matrix = new THREE.Matrix4().multiplyMatrices(child.userData.selected_vertices.matrix, child.userData.selected_vertices_initial_matrix.clone().invert());
								
								// If the player's transform controls are attached to the selected vertices group...
								if (Game.player.controls.transform_controls.object == child.userData.selected_vertices)
								{
									
									// Get the selected vertices group's world position
									let selected_vertices_position = new THREE.Vector3();
									child.userData.selected_vertices.getWorldPosition(selected_vertices_position);
									
									// Calculate the transform delta and delta matrix
									transform_delta = new THREE.Vector3().subVectors(selected_vertices_position, child.userData.selected_vertices_initial_position);
									transform_delta_matrix = selected_vertices_delta_matrix.clone();
									
								}
								
							}
							
						}
					});
					
					// Use the transform delta and matrix to transform the selected vertices...
					this.selected_vertices_object.traverse((child) => {
						if (child.isMesh && child.geometry)
						{
							
							// If the selected vertices group isn't empty...
							if (child.userData.selected_vertices)
							{
								
								// Get the selected vertices object's world matrix for applying vertex transforms according to world space instead of local space
								const selected_vertices_object_world_matrix = child.matrixWorld;
								
								// Get the selected vertices object's inverse world matrix for applying vertex transforms back to local space from world space
								const selected_vertices_object_inverse_world_matrix = new THREE.Matrix4().copy(selected_vertices_object_world_matrix).invert();
								
								// Get the selected vertices object's position
								const position = child.geometry.getAttribute('position');
								
								// Iterate through each of the selected vertices to update their positions according to the delta matrix...
								for (let index of child.userData.selected_vertex_indices)
								{
									
									// Get the initial local vertex position...
									if (child.userData.initial_vertex_positions.hasOwnProperty(index))
									{
										const vertex = child.userData.initial_vertex_positions[index].clone();
										
										// Transform the vertex from local space to world space
										vertex.applyMatrix4(selected_vertices_object_world_matrix);
										
										// Apply the delta matrix to adjust the vertex position in world space
										vertex.applyMatrix4(transform_delta_matrix);
										
										// Get the new X, Y, and Z values of the adjusted vertex position
										const x = vertex.x;
										const y = vertex.y;
										const z = vertex.z;
										
										// Transform the vertex back to local space with the new vertex position
										vertex.set(x, y, z).applyMatrix4(selected_vertices_object_inverse_world_matrix);
										
										// Update the selected vertices object's position with the modified vertex
										position.setXYZ(index, vertex.x, vertex.y, vertex.z);
									}
									
								}
								
								// If the player's transform controls aren't attached to the selected vertices group...
								if (Game.player.controls.transform_controls.object != child.userData.selected_vertices)
								{
									
									// If the transform delta is different than the initial delta...
									if (!child.userData.selected_vertices_initial_delta.equals(transform_delta))
									{
										
										// Get the selected vertices group's world position
										let selected_vertices_position = new THREE.Vector3();
										child.userData.selected_vertices.getWorldPosition(selected_vertices_position);
										
										// Calculate the new world position using the transform delta
										const new_position = new THREE.Vector3().addVectors(child.userData.selected_vertices_initial_position, transform_delta);
										
										// Update the selected vertices group's world position with the new position
										child.userData.selected_vertices.parent.worldToLocal(new_position);
										child.userData.selected_vertices.position.copy(new_position);
										
										// Update the initial delta
										child.userData.selected_vertices_initial_delta = transform_delta.clone();
										
									}
									
								}
								
								// Mark the selected vertices object's position attribute for an update and recalculate its bounding geometry
								position.needsUpdate = true;
								child.geometry.computeVertexNormals();
								child.geometry.computeBoundingSphere();
								child.geometry.computeBoundingBox();
								
							}
							
						}
					});
					
				}
				
			}
			
		//#endregion
		
		
	//#endregion
	
}
export default Editor;