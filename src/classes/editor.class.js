// three.js Import
import * as THREE from '../libraries/threejs/three.js';

// Class Imports
import Billboard from './billboard.class.js';

/**
 * The in-game world editor.
 */
class Editor
{
	
	/**
	 * Initializes the in-game world editor.
	 */
	constructor()
	{
		
		// Class Declarations/Initialization
		
        
        // Enable/disable editor
        this.enabled = false;
        
		
		// Highlighted objects
		
		// The colour of highlighted objects in the editor
		this.highlighted_object_colour = 0xffff00;
		
		// The object highlighted in the editor
		this.highlighted_object = null;
		
		// The original materials of the object being highlighted in the editor
		this.highlighted_object_original_materials = new WeakMap();
        
        
        // Selected objects
		
		// The colour of selected objects in the editor
		this.selected_object_colour = 0xffff00;
		
		// The object selected in the editor
		this.selected_object = null;
		
		// The original materials of the object being selected in the editor
		this.selected_object_original_materials = new WeakMap();
		
	}
    
    
    // Editor Event Handlers
	
	/**
	 * Handles editor processes that update every frame.
	 *
	 * @param {world} world The game world in which the player exists.
	 */
	update(world)
	{
		
		// Check if editor is enabled
		if (this.enabled)
		{
			
			// If the player is dragging with the left mouse button...
			if (this.controls.is_mouse_left_down && this.controls.is_mouse_dragging)
			{
				
				// Handle transform controls mouse move event
				this.controls.transform_controls.mouseMove(this);
				
				// Update editor selected object UI elements
				world.editorUpdateSelectedObjectUI();
				
			}
			else
			{
				
				// Handle transform controls mouse hover event
				this.controls.transform_controls.mouseHover(this);
				
			}
			
		}
		
		// Do the following regardless of whether editor mode is enabled...
		//
		//	NOTE: These method calls may or may not have their own editor mode checks.
		
		// Handle editor mode object highlighting
		world.editorHandleHighlightedObject(this);
		
	}
	
	/**
	 * Handles player left mouse down editor mode.
	 */
	handleEditorLeftMouseDown()
	{
		
		// Check if editor mode is enabled
		if (this.controls.mode_editor)
		{
			
			// Handle transform controls mouse down event
			this.controls.transform_controls.mouseDown(this);
			
		}
		
	}
	
	/**
	 * Handles player left mouse up in editor mode.
	 */
	handleEditorLeftMouseUp(world)
	{
		
		// Check if editor mode is enabled
		if (this.controls.mode_editor)
		{
			
			// If the mouse is locked to the renderer...
			if (this.controls.is_mouse_locked)
			{
				
				// If the mouse is currently dragging...
				if (this.controls.is_mouse_dragging)
				{
					
					// The mouse is no longer dragging
					this.controls.is_mouse_dragging = false;
					
					// Handle transform controls mouse up event
					this.controls.transform_controls.mouseUp(this);
					
					
				} // Otherwise, if the mouse is not currently dragging...
				else
				{
					
					// Select the object the player is facing
					world.editorSelectObject(this);
					
				}
				
			}
			
		}
		
	}
	
	/**
	 * Handles player right mouse down in editor mode.
	 */
	handleEditorRightMouseDown()
	{
		// Do nothing.
	}
	
	/**
	 * Handles player right mouse up in editor mode.
	 */
	handleEditorRightMouseUp(world)
	{
		
		// Check if editor mode is enabled
		if (this.controls.mode_editor)
		{
			
			// If the mouse is locked to the renderer...
			if (this.controls.is_mouse_locked)
			{
				
				// Attempt to reset the selected object
				world.editorResetSelectedObject(this);
				
			}
			
		}
		
	}
    
    
    // Editor Methods
    
    /**
	 * Toggle editor on/off.
	 */
	toggle(world)
	{
		
		// Toggle editor
		if (this.enabled)
		{
			
			// Hide editor UI
			$("#editor").hide();
			
			// Reset any highlighted or selected objects
			world.editorResetHighlightedObject();
			world.editorResetSelectedObject(this);
			
			// Disable editor
			this.enabled = false;
			
		}
        else
		{
			
			// Enable editor
			this.enabled = true;
			
			// Initialize UI elements
			$("#editor-world-name").val(world.name);
			
			// Show editor UI
			$("#editor").show();
			
		}
		
		
	}
	
	/**
	 * Resets the current world using some hard-coded defaults.
	 */
	newWorld(player)
	{
		
		// Reset any highlighted or selected objects
		this.editorResetHighlightedObject();
		this.editorResetSelectedObject(player);
		
		// Remove all objects from the world
		this.removeAllObjects();
		
		// Initialize the world's properties
		this.name = "";
		
		// Initialize default terrain
		const planeGeometry = new THREE.PlaneGeometry(100, 100);
		const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x302400 });
		const plane = new THREE.Mesh(planeGeometry, planeMaterial);
		plane.rotation.x = -Math.PI / 2;
		plane.position.y = 0;
		plane.position.z = 0;
		this.addTerrain(plane);
		
		// Reset the player's position
		player.position.x = 0;
		player.position.y = player.height;
		player.position.z = 0;
		
	}
	
	/**
	 * Loads a world from a saved JSON file using an open file dialog.
	 */
	loadWorld(player)
	{
		
		// Reset any highlighted or selected objects
		this.editorResetHighlightedObject();
		this.editorResetSelectedObject(player);
		
		// Get a reference to this world to pass into the file load callback
		let self = this;
		
		// Initialize a three.js object loader to convert JSON objects to valid three.js objects
		let loader = new THREE.ObjectLoader();
		
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
					
					// Initialize a new world to load file contents into
					let world = new World();
					
					// Get world properties
					world.name = json.name;
					world.player_position = new THREE.Vector3(json.player_position.x, json.player_position.y, json.player_position.z);
					
					// Get world objects and terrain
					world.terrain = json.terrain.map(meshJSON => {
						return loader.parse(meshJSON);
					});
					world.objects = json.objects.map(meshJSON => {
						return loader.parse(meshJSON);
					});
					
					// Add all world objects to the scene
					for (let i = 0; i < world.all_objects.length; i++)
					{
						world.scene.add(world.all_objects[i]);
					}
					
					// Add player transform controls to the scene
					world.scene.add(player.controls.transform_controls);
					
					// Replace current world with new world
					Object.assign(self, world);
					
					// Update player position
					player.position.x = self.player_position.x;
					player.position.y = self.player_position.y;
					player.position.z = self.player_position.z;
					
					// Initialize UI elements
					$("#editor-world-name").val(self.name);
					
					
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
	saveWorld(player)
	{
		
		// Reset any highlighted or selected objects
		this.editorResetHighlightedObject();
		this.editorResetSelectedObject(player);
	
		// Create a temporary link element to trigger a save file dialog
		let link = document.createElement('a');
		
		// Serialize the world object's contents to an object URL for download
		link.href = URL.createObjectURL(new Blob([JSON.stringify(this.toJSON())], { type: "application/json" }));
		
		// Set the download file name
		link.download = this.name + ".json";
		
		// Append the link element to the document body
		document.body.appendChild(link);
		
		// Trigger the save file dialog
		link.click();
		
		// Remove the link element from the document body
		document.body.removeChild(link);
		
	}
	
	
	/**
	 * Handles highlighting whichever object the player is looking at in editor mode.
	 *
	 * @param {player} player The player editing the world.
	 */
	editorHandleHighlightedObject(player)
	{
		
		// If editor mode is enabled, handle object highlighting...
		if (player.controls.mode_editor)
		{
			
			// Initialize potential new highlighted object
			let new_highlighted_object = null;
			
			// Cast a ray from the player's position in the direction the player is looking
			player.raycaster.ray.origin.copy(player.position);
			player.raycaster.ray.direction.set(0, 0, -1).applyQuaternion(player.quaternion);
			player.raycaster.near = 0;
			player.raycaster.far = Infinity;
			
			// Check intersections with all world objects
			const intersects = player.raycaster.intersectObjects(this.objects);
			if (intersects.length > 0)
			{
				
				// Get the first object object that the player is looking at
				new_highlighted_object = intersects[0].object;
				
				// If the new highlighted object is different than the current highlighted object and current selected object
				if (this.editor_highlighted_object !== new_highlighted_object && this.editor_selected_object !== new_highlighted_object)
				{
					
					// Reset the old highlighted object's material
					if (this.editor_highlighted_object)
					{
						this.editor_highlighted_object.material = this.editor_highlighted_object_original_materials.get(this.editor_highlighted_object);
					}
					
					// Set the new highlighted object's material to a solid colour
					if (new_highlighted_object)
					{
						if (!this.editor_highlighted_object_original_materials.has(new_highlighted_object))
						{
							this.editor_highlighted_object_original_materials.set(new_highlighted_object, new_highlighted_object.material);
						}
						
						new_highlighted_object.material = new THREE.MeshBasicMaterial({ color: this.editor_highlighted_object_colour });
					}
					
					// Get the new highlighted object
					this.editor_highlighted_object = new_highlighted_object;
					
				}
				else if (this.editor_selected_object == new_highlighted_object)
				{
					
					// Reset the highlighted object
					this.editorResetHighlightedObject();
					
				}
				
				
			} // Otherwise, if the player isn't looking at any objects...
			else
			{
				
				// Reset the highlighted object
				this.editorResetHighlightedObject();
				
			}
			
		} // Otherwise, if editing mode is disabled...
		else
		{
			
			// Reset the highlighted object
			this.editorResetHighlightedObject();
			
		}
		
	}
	
	/**
	 * Resets the highlighted object in the editor mode.
	 */
	editorResetHighlightedObject()
	{
		
		// If an object is highlighted...
		if (this.editor_highlighted_object)
		{
			
			// Reset the highlighted object's material
			this.editor_highlighted_object.material = this.editor_highlighted_object_original_materials.get(this.editor_highlighted_object);
			
			// Reset the highlighted object
			this.editor_highlighted_object = null;
			
		}
		
	}
	
	/**
	 * Selects whichever object the player is looking at in editor mode.
	 *
	 * @param {player} player The player editing the world.
	 */
	editorSelectObject(player)
	{
		
		// If editor mode is enabled, handle object selection...
		if (player.controls.mode_editor)
		{
			
			// Initialize potential new selected object
			let new_selected_object = null;
			
			// Detatch transform controls if they're attached to anything
			player.controls.transform_controls.detach();
			
			// Cast a ray from the player's position in the direction the player is looking
			player.raycaster.ray.origin.copy(player.position);
			player.raycaster.ray.direction.set(0, 0, -1).applyQuaternion(player.quaternion);
			player.raycaster.near = 0;
			player.raycaster.far = Infinity;
			
			// Check intersections with all world objects
			const intersects = player.raycaster.intersectObjects(this.objects);
			if (intersects.length > 0)
			{
				
				// Get the first object object that the player is looking at
				new_selected_object = intersects[0].object;
				
				// If the new selected object is already highlighted...
				if (this.editor_highlighted_object == new_selected_object)
				{
					// Reset highlighted object
					this.editorResetHighlightedObject();
				}
				
				// If the new selected object is different than the current selected object...
				if (this.editor_selected_object !== new_selected_object)
				{
					
					// Reset the old selected object's material
					if (this.editor_selected_object)
					{
						this.editor_selected_object.material = this.editor_selected_object_original_materials.get(this.editor_selected_object);
					}
					
					// Set the new selected object's material to a solid colour
					if (new_selected_object)
					{
						if (!this.editor_selected_object_original_materials.has(new_selected_object))
						{
							this.editor_selected_object_original_materials.set(new_selected_object, new_selected_object.material);
						}
						
						new_selected_object.material = new THREE.MeshBasicMaterial({ color: this.editor_selected_object_colour, transparent: true,  opacity: 0.75 });
					}
					
					// Get the new selected object
					this.editor_selected_object = new_selected_object;
					
					// Attach transform controls to new selected object
					player.controls.transform_controls.attach(this.editor_selected_object);
					
					// Initialize selected object UI elements
					this.editorUpdateSelectedObjectUI();
					
					// Show selected object UI
					$("#editor-selected-object").show();
					
					
				} // Otherwise, if the new selected object is the same as the current selected object...
				else
				{
					
					// Reset the selected object
					this.editorResetSelectedObject(player);
					
				}
				
				
			} // Otherwise, if the player isn't looking at any objects...
			else
			{
				
				// Reset the selected object
				this.editorResetSelectedObject(player);
				
			}
			
			
		} // Otherwise, if editing mode is disabled...
		else
		{
			
			// Reset the selected object
			this.editorResetSelectedObject(player);
			
		}
		
	}
	
	/**
	 * Resets the selected object in the editor mode.
	 */
	editorResetSelectedObject(player)
	{
		
		// If an object is selected...
		if (this.editor_selected_object)
		{
			
			// Reset the selected object's material
			this.editor_selected_object.material = this.editor_selected_object_original_materials.get(this.editor_selected_object);
			
			// Reset the selected object
			this.editor_selected_object = null;
			
			// Detatch transform controls if they're attached to anything
			player.controls.transform_controls.detach();
		}
		
		// Hide selected object UI
		$("#editor-selected-object").hide();
		
	}
	
	editorUpdateSelectedObjectUI()
	{
		
		$("#editor-selected-object-position-x").val(this.editor_selected_object.position.x);
		$("#editor-selected-object-position-y").val(this.editor_selected_object.position.y);
		$("#editor-selected-object-position-z").val(this.editor_selected_object.position.z);
		
		$("#editor-selected-object-scale-x").val((this.editor_selected_object.scale.x / 1) * 100);
		$("#editor-selected-object-scale-y").val((this.editor_selected_object.scale.y / 1) * 100);
		$("#editor-selected-object-scale-z").val((this.editor_selected_object.scale.z / 1) * 100);
		
		if (this.editor_selected_object instanceof Billboard)
		{
			$("#editor-selected-object-rotation").hide();
		}
		else
		{
			$("#editor-selected-object-rotation").show();
			
			$("#editor-selected-object-rotation-x").val(this.editor_selected_object.rotation.x * (180 / Math.PI));
			$("#editor-selected-object-rotation-y").val(this.editor_selected_object.rotation.y * (180 / Math.PI));
			$("#editor-selected-object-rotation-z").val(this.editor_selected_object.rotation.z * (180 / Math.PI));
		}
		
	}
    
}