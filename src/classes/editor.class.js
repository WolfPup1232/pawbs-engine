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
	
	// Class Declarations
	
	// Editor enabled/disabled flag
	static enabled = false;
	
	
	// Selection modes
	
	// Select objects flag
	static select_objects = true;
	
	// Select object faces flag
	static select_faces = false;
	
	// Select object vertices
	static select_vertices = false;
	
	// Select terrain flag
	static select_terrain = false;
	
	
	// Tool modes
	
	// Spawn tool flag
	static tool_spawn = false;
	
	// NPCs tool flag
	static tool_npcs = false;
	
	// Cinematics tool flag
	static tool_cinematics = false;
	
	
	// Spawn tool modes
	
	// Spawn objects flag
	static spawn_objects = true;
	
	// Spawn NPCs flag
	static spawn_npcs = false;
	
	// Spawn walls flag
	static spawn_walls = false;
	
	// Spawn terrain flag
	static spawn_terrain = false;
	
	
	// Highlighted objects
	
	// The group of highlighted objects
	static highlighted_objects = new THREE.Group();
	
	// The colour of highlighted objects
	static highlighted_object_colour = 0xffffff;
	
	
	// Selected objects
	
	// The group of selected objects
	static selected_objects = new THREE.Group();
	
	// The colour of selected objects
	static selected_object_colour = 0xffffff;
	
	
	// Hovered object faces
	
	// The hovered object whose faces should be highlighted or selected
	static hovered_faces_object = null;
	
	// The index of the last face which was hovered over
	static previously_hovered_face_index = null;
	
	
	// Highlighted object faces
	
	// The colour of highlighted object faces
	static highlighted_face_colour = 0xaaaaaa;
	
	
	// Selected object faces
	
	// The colour of selected object faces
	static selected_face_colour = 0x666666;
	
	
	// Highlighted object vertices
	
	// The hovered object whose vertices should be highlighted
	static highlighted_vertices_object = null;
	
	// The colour of highlighted object vertices
	static highlighted_vertex_colour = 0x000000;
	
	// The colour of highlighted object vertices
	static highlighted_vertex_outline_colour = 0x000000;
	
	// The size of highlighted object vertices
	static highlighted_vertex_size = 0.25;
	
	// The thickness of highlighted object vertices outlines
	static highlighted_vertex_outline_size = 0.1;
	
	
	// Selected object vertices
	
	// The selected object whose vertices should be highlighted or selected
	static selected_vertices_object = null;
	
	// The radius of the selected object's vertex selection area
	static selected_vertices_object_highlight_vertex_radius = 0.25;
	
	// The colour of the selected object's vertex selection area
	static selected_vertices_object_highlight_vertex_colour = 0xff0000;
	
	// The colour of un-selected object vertices
	static unselected_vertex_colour = 0xffffff;
	
	// The colour of selected object vertices
	static selected_vertex_colour = 0xff0000;
	
	// The colour of selected object vertices
	static selected_vertex_outline_colour = 0x000000;
	
	// The size of selected object vertices
	static selected_vertex_size = 0.25;
	
	// The thickness of selected object vertices outlines
	static selected_vertex_outline_size = 0.1;
	
	
	// Clipboard objects
	
	// The group of cut/copied objects
	static clipboard_objects = new THREE.Group();
	
	
	// Spawn tool
	
	// The colour of spawned objects
	static spawned_object_colour = 0xd3d3d3;
	
	
	// Wall tool
	
	// The grid which will act as a visual aid for the wall tool
	static grid_helper = new THREE.GridHelper();
	
	
	// Constructor
	
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
	
	
	// Event Handler Methods
	
	/**
	 * Handles player left mouse down.
	 */
	static handleLeftMouseDown(event)
	{
		
		// If the mouse is locked to the renderer...
		if (Game.player.controls.is_mouse_locked)
		{
			
			// Prevent shift-clicking from highlighting text
			if (event.shiftKey)
			{
				event.preventDefault();
			}
			
			// Handle transform controls mouse down event
			Game.player.controls.transform_controls.mouseDown();
			
		}
		
	}
	
	/**
	 * Handles player left mouse up.
	 */
	static handleLeftMouseUp()
	{
		
		// If the mouse is locked to the renderer...
		if (Game.player.controls.is_mouse_locked)
		{
			
			// If the mouse is currently dragging...
			if (Game.player.controls.is_mouse_dragging)
			{
				
				// Handle transform controls mouse up event
				Game.player.controls.transform_controls.mouseUp();
				
				
			} // Otherwise, if the mouse is not currently dragging...
			else
			{
				
				// Select the object that the player is facing
				if (this.select_objects)
				{
					this.selectObjects();
				}
				
				// Select the object face that the player is facing
				if (this.select_faces)
				{
					this.selectFace();
				}
				
				// Select the object vertex that the player is facing
				if (this.select_vertices)
				{
					this.selectVertex()
				}
				
			}
			
		}
		
	}
	
	/**
	 * Handles player right mouse down.
	 */
	static handleRightMouseDown()
	{
		
		// Do nothing.
		
	}
	
	/**
	 * Handles player right mouse up.
	 */
	static handleRightMouseUp()
	{
		
		// If the mouse is locked to the renderer...
		if (Game.player.controls.is_mouse_locked)
		{
			
			// Unlock the mouse from the renderer
			Game.player.controls.pointer_lock_controls.unlock();
			//Game.player.controls.is_mouse_dragging = false;
			Game.player.controls.transform_controls.dragging = false;
			
			// Disable right-click menu
			$(Game.dom_document).one('contextmenu', function(event)
			{
				event.preventDefault();
			});
			
		}
		
	}
	
	
	// Methods
	
	/**
	 * Toggle editor on/off.
	 */
	static toggle()
	{
		
		// Check if editor is enabled
		if (this.enabled)
		{
			
			// Hide editor UI
			$("#editor").hide();
			
			// Reset all highlighted or selected objects, faces, and vertices
			this.resetHighlightedAndSelectedObjectsFacesVertices();
			
			// Remove player transform controls from the world
			Game.world.scene.remove(Game.player.controls.transform_controls);
			
			// Disable noclip
			Game.player.noclip = false;
			
			// Disable editor
			this.enabled = false;
			
		}
		else
		{
			
			// Enable editor
			this.enabled = true;
			
			// Add player transform controls to the world
			Game.world.scene.add(Game.player.controls.transform_controls);
			
			// Initialize UI elements
			$("#editor-world-name").val(Game.world.name);
			$("#editor-camera-walk").prop("checked", !Game.player.noclip);
			
			// Update selected object material colours UI
			this.updateSelectedObjectMaterialColoursUI();
			
			// Update selected object material textures UI
			this.updateSelectedObjectMaterialTexturesUI();
			
			// Update object spawn tool UI
			this.updateSpawnToolUI();
			
			// Resize UI elements
			this.resize();
			
			// Show editor UI
			$("#editor").show();
			
		}
		
	}
	
	/**
	 * Updates editor processes every frame.
	 */
	static update()
	{
		
		// If the player is dragging with the left mouse button...
		if (Game.player.controls.is_mouse_left_down && Game.player.controls.is_mouse_dragging)
		{
			
			// Handle transform controls mouse move event
			Game.player.controls.transform_controls.mouseMove();
			
			// Update selected object UI elements
			this.updateSelectedObjectsUI();
			
		}
		else
		{
			
			// Handle transform controls mouse hover event
			Game.player.controls.transform_controls.mouseHover();
			
		}
		
		// Update object highlighting
		if (this.select_objects)
		{
			this.highlightObjects();
		}
		
		// Update object face highlighting
		if (this.select_faces)
		{
			this.highlightFace();
		}
		
		// Update object vertex highlighting
		if (this.select_vertices)
		{
			this.highlightVertices();
		}
		
	}
	
	/**
	 * Resized editor UI elements.
	 */
	static resize()
	{
		
		// Set selected objects window maximum height
		$("#editor-selected-objects-inner").css({"max-height": "calc(" + ($('#renderer').height() - $('#editor-menu').height()) + "px - 2rem)"});
		
	}
	
	
	// World Methods
	
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
		
		// Initialize a temporary file input element to trigger an open file dialog
		let file_input = $('<input type="file" accept=".json" style="display:none;">');
		$('body').append(file_input);
		
		// Trigger the open file dialog
		file_input.trigger('click');
		
		// Handle file selection
		file_input.on('change', function(event)
		{
			
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
					
					// Initialize UI elements
					$("#editor-world-name").val(Game.world.name);
					
					
				}
				catch (error)
				{
					
					// Error loading world
					console.error("Error loading world: ", error);
					
				}
			};
			
			// Read the selected file as text
			reader.readAsText(event.target.files[0]);
			
			// Remove temporary file input element after selected file is loaded
			file_input.remove();
			
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
	
	
	// Object Methods
	
	/**
	 * Spawns a new object into the world at the location the player is facing.
	 *
	 * @param {THREE.Object3D} obect The object to be spawned.
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
	 * @param {THREE.Object3D} obect The object to be added to the world.
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
	 * @param {THREE.Object3D} obect The object to be removed from the world.
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
	
	
	// Highlight / Select Objects
	
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
						if (child.isMesh)
						{
							child.userData.original_material = child.material.clone();
							child.material = new THREE.MeshBasicMaterial({ color: child.material.color.getHex(), transparent: true, opacity: 0.5, side: new_highlighted_objects.material.side });
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
				
			}
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
				this.updateSelectedObjectsUI();
				
				
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
			this.updateSelectedObjectsUI();
			
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
		this.updateSelectedObjectsUI(Game.player);
		
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
		this.updateSelectedObjectsUI();
		
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
			this.updateSelectedObjectsUI();
			
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
			this.updateSelectedObjectsUI();
			
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
			this.updateSelectedObjectsUI();
			
		}
		
	}
	
	
	// Highlight / Select Faces
	
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
		if (this.select_faces)
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
		mesh.userData.face_groups = {};
		
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
	
	
	// Highlight / Select Vertices
	
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
			intersect_object = intersects[0].object;
			intersect_point = intersects[0].point;
			
			// Check if the intersected object is a mesh and doesn't already have highlighted vertices, or if it's a set of points...
			if ((intersect_object instanceof THREE.Mesh && !intersect_object.userData.vertices) || intersect_object instanceof THREE.Points)
			{
			
				// If the intersect object is a set of points...
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
				if (intersect_object instanceof THREE.Mesh && intersect_object != this.highlighted_vertices_object && intersect_object != this.selected_vertices_object && !(this.selected_vertices_object && this.selected_vertices_object.userData.selected_vertices && this.selected_vertices_object.userData.selected_vertices.getObjectById(intersect_object.id)))
				{
					
					// Reset the highlighted vertices
					this.resetHighlightedVertices();
					
					// Get intersected object to highlight its vertices
					this.highlighted_vertices_object = intersect_object;
					
					// Draw the object's vertices and store them in the userData
					this.highlighted_vertices_object.userData.vertices = new THREE.Points(this.highlighted_vertices_object.geometry, Shaders.pointOutlineInRadius(this.highlighted_vertex_colour, this.highlighted_vertex_size, this.highlighted_vertex_outline_colour, this.highlighted_vertex_outline_size, this.selected_vertices_object_highlight_vertex_radius, this.selected_vertices_object_highlight_vertex_colour));
					this.highlighted_vertices_object.userData.vertices.userData.ignore_raycast = true;
					this.highlighted_vertices_object.add(this.highlighted_vertices_object.userData.vertices);
					
					// Reset the object's collection of indices at vertex positions
					this.highlighted_vertices_object.userData.object_indices_at_positions = new Map();
					
					// Get the object's vertices and vertex count
					const highlighted_vertices_object_position = this.highlighted_vertices_object.geometry.getAttribute('position');
					const highlighted_vertices_object_vertex_count = highlighted_vertices_object_position.count;
					
					// Generate new collection of indices at vertex positions for the object...
					for (let i = 0; i < highlighted_vertices_object_vertex_count; i++)
					{
						const position = new THREE.Vector3().fromBufferAttribute(highlighted_vertices_object_position, i);
						const key = position.x.toFixed(5) + ',' + position.y.toFixed(5) + ',' + position.z.toFixed(5);
						
						if (!this.highlighted_vertices_object.userData.object_indices_at_positions.has(key))
						{
							this.highlighted_vertices_object.userData.object_indices_at_positions.set(key, []);
						}
						
						let object_indices_at_positions = this.highlighted_vertices_object.userData.object_indices_at_positions.get(key);
						object_indices_at_positions.push(i);
						
						this.highlighted_vertices_object.userData.object_indices_at_positions.set(key, object_indices_at_positions);
						
					}
					
					
				} // Otherwise, if the intersected object fails *all* those conditions, and we're sure it's *not* just the highlighted vertices object...
				else if (intersect_object != this.highlighted_vertices_object)
				{
					
					// Reset the highlighted vertices
					this.resetHighlightedVertices();
					
				}
				
				
			} // Otherwise, if the intersected object is the highlighted or selected vertices object...
			else if (intersect_object == this.highlighted_vertices_object || intersect_object == this.selected_vertices_object)
			{
				let points_object = null;
				
				// Get highlighted object's points object
				if (intersect_object == this.highlighted_vertices_object)
				{
					this.highlighted_vertices_object.children.forEach(child => {
						if (child instanceof THREE.Points)
						{
							points_object = child;
						}
					});
					
				} // Get selected object's points object
				else if (intersect_object == this.selected_vertices_object)
				{
					this.selected_vertices_object.children.forEach(child => {
						if (child instanceof THREE.Points)
						{
							points_object = child;
						}
					});
				}
					
				// Update the object's shader material
				if (points_object.material.uniforms && points_object.material.uniforms.intersection_point)
				{
					points_object.material.uniforms.intersection_point.value.copy(intersect_point);
				}
				
				
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
			
			// Remove the set of points from the highlighted vertices object
			this.highlighted_vertices_object.remove(this.highlighted_vertices_object.userData.vertices);
			
			// Delete the points object from the object's userData
			delete this.highlighted_vertices_object.userData.vertices;
			
			// If we're not flagged to preserve object indices at positions...
			if (!preserve_indices)
			{
				
				// Delete the object indices at positions too
				delete this.highlighted_vertices_object.userData.object_indices_at_positions;
				
			}
			
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
			let intersect_object = intersects[0].object;
			
			// Check if the intersected object is a mesh and already has highlighted vertices, or if it's a set of points...
			if ((intersect_object instanceof THREE.Mesh && intersect_object.userData.vertices) || intersect_object instanceof THREE.Points)
			{
				
				// Check if the set of points overlaps the selected vertices object, and retrieve it instead...
				if (intersect_object instanceof THREE.Points)
				{
					
					// Check if the intersect object overlaps the selected vertices object or the highlighted vertices object, and if it does, set it to the corresponding object instead...
					intersects.forEach(intersect => {
						if (intersect.object == this.highlighted_vertices_object)
						{
							intersect_object = intersect.object;
						}
						else if (intersect.object == this.selected_vertices_object)
						{
							intersect_object = intersect.object;
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
					
					// Draw the object's vertices and store them in the userData
					this.selected_vertices_object.userData.vertices = new THREE.Points(this.selected_vertices_object.geometry, Shaders.pointOutlineInRadius(this.unselected_vertex_colour, this.selected_vertex_size, this.selected_vertex_outline_colour, this.selected_vertex_outline_size, this.selected_vertices_object_highlight_vertex_radius, this.selected_vertices_object_highlight_vertex_colour));
					this.selected_vertices_object.userData.vertices.userData.ignore_raycast = true;
					this.selected_vertices_object.add(this.selected_vertices_object.userData.vertices);
					
					// Reset the selected vertex indices and selected vertices initial matrix in preparation for storing those values
					this.selected_vertices_object.userData.selected_vertex_indices = new Set();
					this.selected_vertices_object.userData.selected_vertices_initial_matrix = new THREE.Matrix4();
					
					
				} // Otherwise, if the intersect object is already selected...
				else if (intersect_object == this.selected_vertices_object)
				{
					
					// Cast a ray from the player's position in the direction the player is looking
					Game.player.raycaster.ray.origin.copy(Game.player.position);
					Game.player.raycaster.ray.direction.set(0, 0, -1).applyQuaternion(Game.player.quaternion);
					Game.player.raycaster.near = 0;
					Game.player.raycaster.far = Infinity;
					
					// Check intersections with any of the selected vertices object's vertices
					const intersects = Game.player.raycaster.intersectObject(this.selected_vertices_object.userData.vertices);
					if (intersects.length > 0)
					{
						
						// Get the index of the intersected vertex
						const index = intersects[0].index;
						
						// Get the position of the intersected vertex
						const position = new THREE.Vector3().fromBufferAttribute(this.selected_vertices_object.geometry.getAttribute('position'), index);
						const key = position.x.toFixed(5) + ',' + position.y.toFixed(5) + ',' + position.z.toFixed(5);
						
						// Get all intersected vertex indices corresponding to that position
						const indices = this.selected_vertices_object.userData.object_indices_at_positions.get(key);
						
						// If intersected vertex indices were found, and they're not already selected...
						if (indices && !this.selected_vertices_object.userData.selected_vertex_indices.has(indices[0]))
						{
							
							// Clear any previous selected vertices if the shift key isn't being pressed...
							if (!Game.player.controls.modifier_shift_left_pressed && !Game.player.controls.modifier_control_left_pressed)
							{
								this.selected_vertices_object.userData.selected_vertex_indices.clear();
							}
							
							// Select the intersected vertices
							indices.forEach(i => this.selected_vertices_object.userData.selected_vertex_indices.add(i));
							
						} // Otherwise, if no intersected vertex indices were found (unlikely), or they're already selected (likely)...
						else
						{
							
							// Clear any previous selected vertices
							this.selected_vertices_object.userData.selected_vertex_indices.clear();
							
						}
						
						// If any vertices were actually successfully selected...
						if (this.selected_vertices_object.userData.selected_vertex_indices.size > 0)
						{
							
							// Remove the selected vertex helper spheres group from the world
							this.removeObject(this.selected_vertices_object.userData.selected_vertices);
							
							// Re-initialize the group which will contain selected vertex helper spheres
							this.selected_vertices_object.userData.selected_vertices = new THREE.Group();
							this.selected_vertices_object.userData.selected_vertices.userData.ignore_raycast = true;
							
							// Get the helper sphere group's initial position, scale, and rotation in preparation for repositioning it over the selected vertices object
							let selected_vertices_object_position = this.selected_vertices_object.userData.selected_vertices.position.clone();
							let selected_vertices_object_scale = this.selected_vertices_object.userData.selected_vertices.scale.clone();
							let selected_vertices_object_rotation = this.selected_vertices_object.userData.selected_vertices.quaternion.clone();
							
							// Modify those initial position values according to the selected vertices obect's position, rotation, and scale
							selected_vertices_object_rotation.premultiply(this.selected_vertices_object.quaternion);
							selected_vertices_object_position.applyQuaternion(this.selected_vertices_object.quaternion);
							selected_vertices_object_position.multiply(this.selected_vertices_object.scale);
							selected_vertices_object_position.add(this.selected_vertices_object.position);
							selected_vertices_object_scale.multiply(this.selected_vertices_object.scale);
							
							// Position, rotate, and scale the helper sphere group according to those modified position values
							this.selected_vertices_object.userData.selected_vertices.position.copy(selected_vertices_object_position);
							this.selected_vertices_object.userData.selected_vertices.scale.copy(selected_vertices_object_scale);
							this.selected_vertices_object.userData.selected_vertices.quaternion.copy(selected_vertices_object_rotation);
							
							// Get the inverse scale of the helper sphere group so that we can make sure the helper spheres don't end up all stretched and weird if the selected vertices object's scale has been changed at all
							const selected_vertices_object_inverse_scale = new THREE.Vector3(1 / this.selected_vertices_object.userData.selected_vertices.scale.x, 1 / this.selected_vertices_object.userData.selected_vertices.scale.y, 1 / this.selected_vertices_object.userData.selected_vertices.scale.z);
							
							// Add helper spheres for each selected vertex...
							for (let index of this.selected_vertices_object.userData.selected_vertex_indices)
							{
								
								// Get the position of the current selected index
								const position = new THREE.Vector3();
								position.fromBufferAttribute(this.selected_vertices_object.geometry.getAttribute('position'), index);
								
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
								this.selected_vertices_object.userData.selected_vertices.add(sphere);
								
							}
							
							// Add the selected vertex helper spheres group to the world
							this.addObject(this.selected_vertices_object.userData.selected_vertices);
							
							// Get center point of selected vertices
							const selected_vertices_bounds = new THREE.Box3().setFromObject(this.selected_vertices_object.userData.selected_vertices);
							const selected_vertices_point = new THREE.Vector3();
							selected_vertices_bounds.getCenter(selected_vertices_point);
							
							// Attach the transform controls to the selected vertices group
							Game.player.controls.transform_controls.position.x = selected_vertices_point.x;
							Game.player.controls.transform_controls.position.y = selected_vertices_point.y;
							Game.player.controls.transform_controls.position.z = selected_vertices_point.z;
							Game.player.controls.transform_controls.attach(this.selected_vertices_object.userData.selected_vertices);
							
							
						} // Otherwise, if no vertices were selected...
						else
						{
							
							// Reset the selected vertices just in case
							this.resetSelectedVertices();
							
						}
						
					}
					
					
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
			
			// Remove the set of points from the selected vertices object
			this.selected_vertices_object.remove(this.selected_vertices_object.userData.vertices);
			
			// Remove the helper spheres group from the world
			this.removeObject(this.selected_vertices_object.userData.selected_vertices);
			
			// Delete everything related to selected vertices from the object's userData
			delete this.selected_vertices_object.userData.vertices;
			delete this.selected_vertices_object.userData.selected_vertices;
			delete this.selected_vertices_object.userData.selected_vertices_initial_matrix;
			delete this.selected_vertices_object.userData.selected_vertex_indices;
			delete this.selected_vertices_object.userData.object_indices_at_positions;
			
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
		if (Editor.select_vertices && Editor.selected_vertices_object)
		{
			
			// If the player's mouse is currently dragging...
			if (Game.player.controls.is_mouse_dragging)
			{
				
				// Get the selected vertices group's initial matrix
				Editor.selected_vertices_object.userData.selected_vertices_initial_matrix.copy(Editor.selected_vertices_object.userData.selected_vertices.matrix);
				
				// Initialize the collection which will store the initial positions of the selected object vertices
				Editor.selected_vertices_object.userData.initial_vertex_positions = {};
				
				// Iterate through the selected vertices group's helper spheres
				Editor.selected_vertices_object.userData.selected_vertices.children.forEach(child => {
					
					// Get the vertex index from the current helper sphere
					const index = child.userData.vertex_index;
					
					// Get the vertex position corresponding to the index
					const position = new THREE.Vector3();
					position.fromBufferAttribute(Editor.selected_vertices_object.geometry.getAttribute('position'), index);
					
					// Add the vertex position to the collection of initial positions
					Editor.selected_vertices_object.userData.initial_vertex_positions[index] = position.clone();
					
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
		if (Editor.select_vertices)
		{
			
			// If the selected vertices group isn't empty...
			if (Editor.selected_vertices_object.userData.selected_vertices)
			{
				
				// Get the selected vertices object's world matrix for applying vertex transforms according to world space instead of local space
				const selected_vertices_object_world_matrix = Editor.selected_vertices_object.matrixWorld;
				
				// Get the selected vertices object's inverse world matrix for applying vertex transforms back to local space from world space
				const selected_vertices_object_inverse_world_matrix = new THREE.Matrix4().copy(selected_vertices_object_world_matrix).invert();
				
				// Get the delta matrix between the helper spheres group's initial and current positions
				const selected_vertices_delta_matrix = new THREE.Matrix4().multiplyMatrices(Editor.selected_vertices_object.userData.selected_vertices.matrix, Editor.selected_vertices_object.userData.selected_vertices_initial_matrix.clone().invert());
				
				// Get the selected vertices object's position
				const position = Editor.selected_vertices_object.geometry.getAttribute('position');
				
				// Iterate through each of the selected vertices to update their positions according to the delta matrix
				for (let index of Editor.selected_vertices_object.userData.selected_vertex_indices)
				{
					
					// Get the initial local vertex position
					const vertex = Editor.selected_vertices_object.userData.initial_vertex_positions[index].clone();
					
					// Transform the vertex from local space to world space
					vertex.applyMatrix4(selected_vertices_object_world_matrix);
					
					// Apply the delta matrix to adjust the vertex position in world space
					vertex.applyMatrix4(selected_vertices_delta_matrix);
					
					// Get the new X, Y, and Z values of the adjusted vertex position
					const x = vertex.x;
					const y = vertex.y;
					const z = vertex.z;
					
					// Transform the vertex back to local space with the new vertex position
					vertex.set(x, y, z).applyMatrix4(selected_vertices_object_inverse_world_matrix);
					
					// Update the selected vertices object's position with the modified vertex
					position.setXYZ(index, vertex.x, vertex.y, vertex.z);
					
				}
				
				// Mark the selected vertices object's position attribute for an update and recalculate its bounding geometry
				position.needsUpdate = true;
				Editor.selected_vertices_object.geometry.computeVertexNormals();
				Editor.selected_vertices_object.geometry.computeBoundingSphere();
				Editor.selected_vertices_object.geometry.computeBoundingBox();
				
			}
			
		}
		
	}
	
	
	// Editor UI
	
	/**
	 * Updates the main editor UI elements.
	 */
	static updateEditorWorldUI()
	{
		
		// Do something.
		
	}
	
	/**
	 * Updates the selected object UI elements.
	 */
	static updateSelectedObjectsUI()
	{
		
		// Check if object selection mode is enabled and object is selected
		if (this.select_objects && this.selected_objects.children.length > 0)
		{
			
			// Show selected object UI
			$("#editor-selected-objects").show();
			
			// Update grid snaps
			if ($("#editor-selected-objects-transform-position-snap-checkbox").is(':checked'))
			{
				$("#editor-selected-objects-transform-position-snap").val(Game.player.controls.transform_controls.translationSnap);
			}
			if ($("#editor-selected-objects-transform-scale-snap-checkbox").is(':checked'))
			{
				$("#editor-selected-objects-transform-scale-snap").val(Game.player.controls.transform_controls.scaleSnap);
			}
			if ($("#editor-selected-objects-transform-rotation-snap-checkbox").is(':checked'))
			{
				$("#editor-selected-objects-transform-rotation-snap").val(Game.player.controls.transform_controls.rotationSnap);
			}
			
			// Update position
			$("#editor-selected-objects-transform-position-x").val(this.selected_objects.position.x);
			$("#editor-selected-objects-transform-position-y").val(this.selected_objects.position.y);
			$("#editor-selected-objects-transform-position-z").val(this.selected_objects.position.z);
			
			// Update scale
			$("#editor-selected-objects-transform-scale-x").val(((this.selected_objects.scale.x / 1) * 100) + "%");
			$("#editor-selected-objects-transform-scale-y").val(((this.selected_objects.scale.y / 1) * 100) + "%");
			$("#editor-selected-objects-transform-scale-z").val(((this.selected_objects.scale.z / 1) * 100) + "%");
			
			// If more than one object is selected...
			if (this.selected_objects.children.length > 1)
			{
				
				// Show object group button
				$("#editor-selected-objects-group-label").show();
				$("#editor-selected-objects-ungroup-label").hide();
				
				
			} // Otherwise, if an object group is selected...
			else if (this.selected_objects.children.length > 0 && this.selected_objects.children[0].isGroup)
			{
				
				// Show object ungroup button
				$("#editor-selected-objects-group-label").hide();
				$("#editor-selected-objects-ungroup-label").show();
				
			}
			else
			{
				
				// Hide object grouping buttons
				$("#editor-selected-objects-group-label").hide();
				$("#editor-selected-objects-ungroup-label").hide();
				
			}
			
			// If transform controls rotation mode is selected...
			if (Game.player.controls.transform_controls.mode == "rotate")
			{
				
				// Check if selected object is billboard
				if (this.selected_objects.children.length == 1 && this.selected_objects.children[0] instanceof Billboard)
				{
					
					// Hide rotation for billboards
					$("#editor-selected-objects-transform-rotation").hide();
					
				}
				else
				{
					
					// Update rotation
					$("#editor-selected-objects-transform-rotation").show();
					
					$("#editor-selected-objects-transform-rotation-x").val((this.selected_objects.rotation.x * (180 / Math.PI)) + "°");
					$("#editor-selected-objects-transform-rotation-y").val((this.selected_objects.rotation.y * (180 / Math.PI)) + "°");
					$("#editor-selected-objects-transform-rotation-z").val((this.selected_objects.rotation.z * (180 / Math.PI)) + "°");
					
				}
				
			}
			
		}
		else
		{
			
			// Hide selected object UI
			$("#editor-selected-objects").hide();
			
		}
		
	}
	
	/**
	 * Updates the selected object material colours UI elements.
	 */
	static updateSelectedObjectMaterialColoursUI()
	{
		
		// Get a reference to this editor to pass into the colour cell click event
		let self = this;
		
		// Initialize list of classic MSPaint colours
		const ms_paint_colours = [
			"#000000", "#800000", "#008000", "#000080", "#800080", "#008080", "#808000", "#402000",
			"#808080", "#FF0000", "#00FF00", "#0000FF", "#FF00FF", "#00FFFF", "#FFFF00", "#804000",
			"#C0C0C0", "#FF8080", "#00FF80", "#4080FF", "#FF80FF", "#80FFFF", "#FFFF80", "#FF8000",
			"#FFFFFF", "#FFC0C0", "#C0FFC0", "#C0C0FF", "#FFC0FF", "#C0FFFF", "#FFFFC0", "#FFC080"
		];
		
		// Reset the colour grid
		$('.editor-selected-objects-materials-colour-grid').empty();
		
		// Initialize the colour grid using the MSPaint colours
		ms_paint_colours.forEach(color => {
			
			// Get RGB values from the current hex colour
			const r = parseInt(color.slice(1, 3), 16);
			const g = parseInt(color.slice(3, 5), 16);
			const b = parseInt(color.slice(5, 7), 16);
			
			// Initialize a new colour cell element for the colour picker UI
			const cell = $('<div class="editor-selected-objects-materials-colour-cell" data-bs-title="' + r + ', ' + g + ', ' + b + '" data-bs-toggle="tooltip" data-bs-placement="bottom"></div>');
			cell.css('background-color', color);
			
			// Add the new colour cell element to the colour picker UI
			$('.editor-selected-objects-materials-colour-grid').append(cell);
			
		});
		
		// Colour cell click event
		$('.editor-selected-objects-materials-colour-cell').click(function()
		{
			
			// Get the background colour of the selected colour cell
			const selected_colour = $(this).css('background-color');
			
			// Set the selected object's new colour
			$('#editor-selected-objects-materials-selected-colour').val('#' + selected_colour.match(/\d+/g).map(function(value) { return ('0' + parseInt(value).toString(16)).slice(-2); }).join(''));
			if (self.selected_objects.children.length > 0)
			{
				self.selected_objects.traverse((child) => {
					if (child.isMesh)
					{
						child.material = child.userData.original_material.clone();
						child.material.color.set(new THREE.Color(selected_colour));
						child.userData.original_material = child.material.clone();
						child.material = new THREE.MeshBasicMaterial({ color: new THREE.Color(selected_colour), wireframe: true });
					}
				});
			}
			
		});
		
		// Re-initialize tooltips so the colour cell tooltips render
		$('[data-bs-toggle="tooltip"]').each(function() { let tooltip = new bootstrap.Tooltip($(this)); $(this).on('click', function() { tooltip.hide(); }); });
		
	}
	
	/**
	 * Updates the selected object material textures UI elements.
	 */
	static updateSelectedObjectMaterialTexturesUI()
	{
		
		// Update selected object material textures UI
		this.updateAssetPickerFolders(Assets.textures, "#editor-selected-objects-materials-texture-select", "#editor-selected-objects-materials-texture-grid");
		
	}
	
	/**
	 * Updates the spawn tool UI elements.
	 */
	static updateSpawnToolUI()
	{
		
		// Update object spawn tool prefabs UI
		this.updateAssetPickerFolders(Assets.objects, "#editor-spawn-category-select", "#editor-spawn-panel-objects");
		
	}
	
	/**
	 * Updates an asset picker's list of asset folders using the provided array of assets. Triggers updating an asset picker's list of asset thumbnails as well.
	 *
	 * @param {array} assets The array of assets to generate thumbnails and a folder structure listing with.
	 * @param {string} dropdown_element The ID of the HTML DOM select element to list the assets folder structure in.
	 * @param {string} grid_element The ID of the HTML DOM grid element to fill with asset thumbnails.
	 */
	static updateAssetPickerFolders(assets, dropdown_element, grid_element)
	{
		
		// Get the asset folder select element and add a default option to it
		let select = $(dropdown_element);
		select.empty();
		$('<option>', { value: "/", text: "Uncategorized" }).appendTo(select);
		
		// Generate asset folder options by iterating through every asset file path
		for (let [name, asset] of Object.entries(assets))
		{
			
			// Get asset file path parts
			let parts = asset.path.split('/');
			
			// Initialize empty option element values
			let text = "";
			let value = "/";
			
			// Get just the relevant parts of the asset file path
			for (let i = 2; i < parts.length - 1; i++)
			{
				
				// Cleanly format the folder name to add to the label
				text += parts[i].charAt(0).toUpperCase() + parts[i].slice(1) + "/";
				
				// Get the unformatted folder name to add to the folder path value
				value += parts[i] + "/";
				
			}
			
			// Remove the trailing slash from the label
			text = text.slice(0,-1);
			
			// Make sure the asset folder isn't already in the asset folders select element
			let option = $(dropdown_element + ' option:contains("' + text + '")');
			if (option.length === 0)
			{
				
				// Add the asset folder to the asset folders select element
				$('<option>', { value: value, text: text }).appendTo(select);
				
			}
			
		}
		
		// Get a list of all the options that have been added to the asset folders select element
		let options = select.find('option');
		
		// Sort all the options alphabetically
		options.sort(function(a, b)
		{
			
			// Get each option label's folder path parts
			let path_a = $(a).attr('value').split('/').filter(Boolean);
			let path_b = $(b).attr('value').split('/').filter(Boolean);
			
			// Sort each subfolder level of the folder path
			for (let i = 0; i < Math.min(path_a.length, path_b.length); i++)
			{
				let folder_a = path_a[i].toLowerCase();
				let folder_b = path_b[i].toLowerCase();
				
				if (folder_a < folder_b) return -1;
				if (folder_a > folder_b) return 1;
			}
			
			// Subfolders with no additional subfolders come first
			return path_a.length - path_b.length;
			
		});
		
		// Empty the asset folders select element and add the newly sorted options to it
		select.empty().append(options);
		
		// Select the default asset folder option
		select.val($(dropdown_element + ' option:first').val());
		
		// Initialize asset folder select element change event based on asset type...
		if (assets == Assets.textures)
		{
			
			// Texture folder change event
			$(dropdown_element).on('change', function()
			{
				
				// Update the list of textures in the texture picker
				Editor.updateAssetPicker(Assets.textures, dropdown_element, grid_element);
				
			});
			
		}
		else if (assets == Assets.objects)
		{
			
			// Object folder change event
			$(dropdown_element).on('change', function()
			{
				
				// Stop animating object thumbnails
				Assets.objectThumbnailsStopAnimating().then(() => {
					
					// If object spawn tool is enabled...
					if (Editor.tool_spawn && Editor.spawn_objects)
					{
						
						// Update the list of prefab objects in the spawn tool
						Editor.updateAssetPicker(Assets.objects, dropdown_element, grid_element);
						
					}
					
				});
				
			});
			
		}
		
		// Update the list of assets in the asset picker
		this.updateAssetPicker(assets, dropdown_element, grid_element);
		
	}
	
	/**
	 * Updates an asset picker's list of assets using the provided array of assets.
	 *
	 * @param {array} assets The array of assets to generate thumbnails and a folder structure listing with.
	 * @param {string} dropdown_element The ID of the HTML DOM select element to list the assets folder structure in.
	 * @param {string} grid_element The ID of the HTML DOM spawn grid element to fill with asset thumbnails.
	 */
	static updateAssetPicker(assets, dropdown_element, grid_element)
	{
		
		// Hide anything that could be obscuring the spawn grid
		$(".tooltip").hide();
		$("div[id^='editor-spawn-panel-']").hide();
		$("div[id^='editor-spawn-primitive-']").remove();
		
		// Empty the asset picker of any previous assets
		$(grid_element).empty();
		
		// Generate asset list by iterating through every asset file path
		for (let [key, asset] of Object.entries(assets))
		{
			
			// Skip if asset file path is empty
			if (asset.path == "")
			{
				continue;
			}
			
			// Get asset file path parts
			let parts = asset.path.split('/');
			
			// Get just the relevant parts of the asset file path to use later to get only assets from the selected asset folder
			let value = "/";
			for (let i = 2; i < parts.length - 1; i++)
			{
				value += parts[i] + "/";
			}
			
			// Check if the current asset belongs to the selected asset folder
			if ($(dropdown_element).find(':selected').val() == value)
			{
				
				// Initialize texture picker...
				if (assets == Assets.textures)
				{
					
					// Initialize a new texture element for the texture picker UI
					const cell = $('<div class="editor-selected-objects-materials-texture-cell"><img src="' + asset.path + '" class="editor-selected-objects-materials-texture-image img-fluid" alt="' + key + '" data-bs-title="' + key + '" data-bs-toggle="tooltip" data-bs-placement="bottom"></div>');
					
					// Add the new texture element to the texture picker UI
					$(grid_element).append(cell);
					
					// Texture element click event
					$('.editor-selected-objects-materials-texture-image').on('click', function()
					{
						
						// Set the selected object's new texture
						if (Editor.selected_objects.children.length > 0)
						{
							
							// Get the texture from the textures list by finding its key using its file path
							let texture =  Assets.textures[Object.keys(Assets.textures).find(key => Assets.textures[key].path === $(this).attr('src'))];
							
							// Set the selected object's new texture
							Editor.selected_objects.traverse((child) => {
								if (child.isMesh)
								{
									child.material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
									child.userData.original_material = child.material.clone();
									child.material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, wireframe: true });
								}
							});
							
						}
						
					});
					
					
				} // Initialize object picker...
				else if (assets == Assets.objects)
				{
					
					// Initialize a new prefab object thumbnail for the spawn tool UI
					$(grid_element).append($('<div id="editor-spawn-cell-' + key + '" class="editor-spawn-cell" data-bs-title="' + key + '" data-bs-toggle="tooltip" data-bs-placement="bottom"></div>'));
					Assets.createObjectThumbnail(Assets.objects[key].deepClone(), "#editor-spawn-cell-" + key);
					
					// Thumbnail element click event
					$('#editor-spawn-cell-' + key).on('click', function()
					{
						
						// If a primitive object's thumbnail was clicked...
						if (asset.path.startsWith("./objects/primitives/"))
						{
							
							// Hide the spawn objects panel
							$('#editor-spawn-panel-objects').hide();
							
							// Initialize a new primitive object thumbnail for the selected primitive's spawn panel UI
							$('#editor-spawn-panel-' + key + '-thumbnail').append($('<div id="editor-spawn-primitive-' + key + '" class="editor-spawn-cell" data-bs-title="Spawn ' + key + '." data-bs-toggle="tooltip" data-bs-placement="top"></div>'));
							Assets.createObjectThumbnail(asset.deepClone(), "#editor-spawn-primitive-" + key);
							
							// Show the selected primitive's spawn panel UI
							$('#editor-spawn-panel-' + key).show();
							
							// Primitive object element click event
							$('#editor-spawn-primitive-' + key).on('click', function()
							{
								
								// Spawn primitive
								Editor.spawn(Assets.objects["primitive_" + key].deepClone());
								
							});
							
							// Primitive spawn panel close button click event
							$('#editor-spawn-panel-' + key + '-close').click(function()
							{
								
								// Hide the selected primitive's spawn panel UI
								$('#editor-spawn-panel-' + key).hide();
								
								// Stop animating the selected primitive's spawn panel UI thumbnail
								Assets.objectThumbnailStopAnimating($("#editor-spawn-primitive-" + key).attr("animation_id")).then(() => {
									
									// Remove the primitive object thumbnail
									$("#editor-spawn-primitive-" + key).remove();
									
								});
								
								// Show the spawn objects panel
								$('#editor-spawn-panel-objects').show();
								
							});
							
							
						} // Otherwise, if a regular object's thumbnail was clicked...
						else
						{
							
							// Spawn object
							Editor.spawn(asset.deepClone());
							
						}
						
						// Re-initialize tooltips so previously hidden elements' tooltips render
						$('[data-bs-toggle="tooltip"]').each(function() { let tooltip = new bootstrap.Tooltip($(this)); $(this).on('click', function() { tooltip.hide(); }); });
						
					});
					
				}
				
			}
			
		}
		
		// Show the spawn objects panel
		$('#editor-spawn-panel-objects').show();
		
		// Re-initialize tooltips so the colour cell tooltips render
		$('[data-bs-toggle="tooltip"]').each(function() { let tooltip = new bootstrap.Tooltip($(this)); $(this).on('click', function() { tooltip.hide(); }); });
		
	}
	
}
export default Editor;