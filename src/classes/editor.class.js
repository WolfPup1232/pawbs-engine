// three.js Import
import * as THREE from '../libraries/threejs/three.js';

// Class Imports
import World from './world.class.js';
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
		
		// The highlighted object
		this.highlighted_object = null;
		
		// The colour of highlighted objects
		this.highlighted_object_colour = 0xffff00;
		
		// The original colour/materials of the highlighted object
		this.highlighted_object_original_materials = new WeakMap();
        
        
        // Selected objects
		
		// The selected object
		this.selected_object = null;
		
		// The colour of selected objects
		this.selected_object_colour = 0xffff00;
		
		// The original colour/materials of the selected object
		this.selected_object_original_materials = new WeakMap();
		
	}
	
    
    // Event Handlers
	
	/**
	 * Handles player left mouse down.
	 *
	 * @param {player} player The player to handle mouse input for.
	 */
	handleLeftMouseDown(player)
	{
		
		// Check if editor is enabled
		if (this.enabled)
		{
			
			// Handle transform controls mouse down event
			player.controls.transform_controls.mouseDown(player);
			
		}
		
	}
	
	/**
	 * Handles player left mouse up.
	 *
	 * @param {world} world The current game world.
	 * @param {player} player The player to handle mouse input for.
	 */
	handleLeftMouseUp(world, player)
	{
		
		// Check if editor is enabled
		if (this.enabled)
		{
			
			// If the mouse is locked to the renderer...
			if (player.controls.is_mouse_locked)
			{
				
				// If the mouse is currently dragging...
				if (player.controls.is_mouse_dragging)
				{
					
					// The mouse is no longer dragging
					player.controls.is_mouse_dragging = false;
					
					// Handle transform controls mouse up event
					player.controls.transform_controls.mouseUp(player);
					
					
				} // Otherwise, if the mouse is not currently dragging...
				else
				{
					
					// Select the object the player is facing
					this.selectObject(world, player);
					
				}
				
			}
			
		}
		
	}
	
	/**
	 * Handles player right mouse down.
	 */
	handleRightMouseDown()
	{
		
		// Check if editor is enabled
		if (this.enabled)
		{
			
			// Do nothing.
			
		}
		
	}
	
	/**
	 * Handles player right mouse up.
	 *
	 * @param {world} world The current game world.
	 * @param {player} player The player to handle mouse input for.
	 */
	handleRightMouseUp(world, player)
	{
		
		// Check if editor is enabled
		if (this.enabled)
		{
			
			// If the mouse is locked to the renderer...
			if (player.controls.is_mouse_locked)
			{
				
				// Reset the selected object
				this.resetSelectedObject(player);
				
			}
			
		}
		
	}
    
    
    // Methods
	
	/**
	 * Updates editor processes every frame.
	 *
	 * @param {world} world The current game world.
	 * @param {player} player The player editing the game world.
	 */
	update(world, player)
	{
		
		// Check if editor is enabled
		if (this.enabled)
		{
			
			// If the player is dragging with the left mouse button...
			if (player.controls.is_mouse_left_down && player.controls.is_mouse_dragging)
			{
				
				// Handle transform controls mouse move event
				player.controls.transform_controls.mouseMove(player);
				
				// Update selected object UI elements
				this.updateSelectedObjectUI();
				
			}
			else
			{
				
				// Handle transform controls mouse hover event
				player.controls.transform_controls.mouseHover(player);
				
			}
			
		}
		
		// Update object highlighting
		this.updateHighlightedObject(world, player);
		
	}
    
    /**
	 * Toggle editor on/off.
	 *
	 * @param {world} world The current game world.
	 * @param {player} player The player editing the game world.
	 */
	toggle(world, player)
	{
		
		// Check if editor is enabled
		if (this.enabled)
		{
			
			// Hide editor UI
			$("#editor").hide();
			
			// Reset any highlighted or selected objects
			this.resetHighlightedObject();
			this.resetSelectedObject(player);
			
			// Remove player transform controls from the world
			world.scene.remove(player.controls.transform_controls);
			
			// Disable editor
			this.enabled = false;
			
		}
        else
		{
			
			// Enable editor
			this.enabled = true;
			
			// Add player transform controls to the world
			world.scene.add(player.controls.transform_controls);
			
			// Initialize UI elements
			$("#editor-world-name").val(world.name);
			
			// Show editor UI
			$("#editor").show();
			
		}
		
	}
	
	/**
	 * Resets the current world using some hard-coded defaults.
	 *
	 * @param {world} world The current game world.
	 * @param {textures} textures The list of game textures.
	 * @param {player} player The player editing the game world.
	 */
	newWorld(world, textures, player)
	{
	
		// Check if editor is enabled
		if (this.enabled)
		{
		
			// Reset any highlighted or selected objects
			this.resetHighlightedObject();
			this.resetSelectedObject(player);
			
			// Remove all objects from the world
			world.removeAllObjects();
			
			// Initialize the world's properties
			world.name = "";
			
			// Initialize default terrain
			const planeGeometry = new THREE.PlaneGeometry(100, 100);
			const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x302400 });
			const plane = new THREE.Mesh(planeGeometry, planeMaterial);
			plane.rotation.x = -Math.PI / 2;
			plane.position.y = 0;
			plane.position.z = 0;
			plane.name = "plane";
			world.addTerrain(plane);
			
			// Initialize default objects
			const campfire = new Billboard(1.5, 1.5, textures.campfire);
			campfire.position.set(0, 0.75, -5);
			campfire.name = "campfire";
			world.addObject(campfire);
			
			// Reset the player's position
			player.position.x = 0;
			player.position.y = player.height;
			player.position.z = 0;
		
		}
		
	}
	
	/**
	 * Loads a world from a saved JSON file using an open file dialog.
	 *
	 * @param {world} world The current game world.
	 * @param {player} player The player editing the game world.
	 */
	loadWorld(world, player)
	{
		
		// Check if editor is enabled
		if (this.enabled)
		{
			
			// Reset any highlighted or selected objects
			this.resetHighlightedObject();
			this.resetSelectedObject(player);
			
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
						
						// Load world from JSON file contents
						world.loadFromJSON(json);
						
						// Add player transform controls to the scene
						world.scene.add(player.controls.transform_controls);
						
						// Update player position and rotation
						player.position.x = world.player_position.x;
						player.position.y = world.player_position.y;
						player.position.z = world.player_position.z;
						player.rotation.x = 0;
						player.rotation.y = 0;
						player.rotation.z = 0;
						
						// Initialize UI elements
						$("#editor-world-name").val(world.name);
						
						
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
		
	}
	
	/**
	 * Saves the world to a JSON file using a save file dialog.
	 *
	 * @param {world} world The current game world.
	 * @param {player} player The player editing the game world.
	 */
	saveWorld(world, player)
	{
		
		// Check if editor is enabled
		if (this.enabled)
		{
			
			// Reset any highlighted or selected objects
			this.resetHighlightedObject();
			this.resetSelectedObject(player);
		
			// Create a temporary link element to trigger a save file dialog
			let link = document.createElement('a');
			
			// Serialize the game world's contents to an object URL for download
			link.href = URL.createObjectURL(new Blob([JSON.stringify(world.toJSON())], { type: "application/json" }));
			
			// Set the download file name
			link.download = world.name + ".json";
			
			// Append the link element to the document body
			document.body.appendChild(link);
			
			// Trigger the save file dialog
			link.click();
			
			// Remove the link element from the document body
			document.body.removeChild(link);
			
		}
		
	}
	
	
	/**
	 * Updates highlighting whichever object the player is looking at.
	 *
	 * @param {world} world The current game world.
	 * @param {player} player The player editing the game world.
	 */
	updateHighlightedObject(world, player)
	{
		
		// If editor is enabled, update object highlighting...
		if (this.enabled)
		{
			
			// Initialize potential new highlighted object
			let new_highlighted_object = null;
			
			// Cast a ray from the player's position in the direction the player is looking
			player.raycaster.ray.origin.copy(player.position);
			player.raycaster.ray.direction.set(0, 0, -1).applyQuaternion(player.quaternion);
			player.raycaster.near = 0;
			player.raycaster.far = Infinity;
			
			// Check intersections with world objects
			const intersects = player.raycaster.intersectObjects(world.objects);
			if (intersects.length > 0)
			{
				
				// Get the first object object that the player is looking at
				new_highlighted_object = intersects[0].object;
				
				// If the new highlighted object is different than the current highlighted object and current selected object
				if (this.highlighted_object !== new_highlighted_object && this.selected_object !== new_highlighted_object)
				{
					
					// Reset the old highlighted object's material
					if (this.highlighted_object)
					{
						this.highlighted_object.material = this.highlighted_object_original_materials.get(this.highlighted_object);
					}
					
					// Set the new highlighted object's material to a solid colour
					if (new_highlighted_object)
					{
						if (!this.highlighted_object_original_materials.has(new_highlighted_object))
						{
							this.highlighted_object_original_materials.set(new_highlighted_object, new_highlighted_object.material);
						}
						
						new_highlighted_object.material = new THREE.MeshBasicMaterial({ color: this.highlighted_object_colour });
					}
					
					// Get the new highlighted object
					this.highlighted_object = new_highlighted_object;
					
				}
				else if (this.selected_object == new_highlighted_object)
				{
					
					// Reset the highlighted object
					this.resetHighlightedObject();
					
				}
				
				
			} // Otherwise, if the player isn't looking at any objects...
			else
			{
				
				// Reset the highlighted object
				this.resetHighlightedObject();
				
			}
			
		} // Otherwise, if editor is disabled...
		else
		{
			
			// Reset the highlighted object
			this.resetHighlightedObject();
			
		}
		
	}
	
	/**
	 * Resets the highlighted object.
	 */
	resetHighlightedObject()
	{

		// If an object is highlighted...
		if (this.highlighted_object)
		{
			
			// Reset the highlighted object's material
			this.highlighted_object.material = this.highlighted_object_original_materials.get(this.highlighted_object);
			
			// Reset the highlighted object
			this.highlighted_object = null;
			
		}
		
	}
	
	/**
	 * Selects whichever object the player is looking at.
	 *
	 * @param {world} world The current game world.
	 * @param {player} player The player editing the game world.
	 */
	selectObject(world, player)
	{
		
		// Check if editor is enabled
		if (this.enabled)
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
			
			// Check intersections with world objects
			const intersects = player.raycaster.intersectObjects(world.objects);
			if (intersects.length > 0)
			{
				
				// Get the first object object that the player is looking at
				new_selected_object = intersects[0].object;
				
				// If the new selected object is already highlighted...
				if (this.highlighted_object == new_selected_object)
				{
					
					// Reset highlighted object
					this.resetHighlightedObject();
					
				}
				
				// If the new selected object is different than the current selected object...
				if (this.selected_object !== new_selected_object)
				{
					
					// Reset the old selected object's material
					if (this.selected_object)
					{
						this.selected_object.material = this.selected_object_original_materials.get(this.selected_object);
					}
					
					// Set the new selected object's material to a solid colour
					if (new_selected_object)
					{
						if (!this.selected_object_original_materials.has(new_selected_object))
						{
							this.selected_object_original_materials.set(new_selected_object, new_selected_object.material);
						}
						
						new_selected_object.material = new THREE.MeshBasicMaterial({ color: this.selected_object_colour, transparent: true,  opacity: 0.75 });
					}
					
					// Get the new selected object
					this.selected_object = new_selected_object;
					
					// Attach transform controls to new selected object
					player.controls.transform_controls.attach(this.selected_object);
					
					// Initialize selected object UI elements
					this.updateSelectedObjectUI();
					
					// Show selected object UI
					$("#editor-selected-object").show();
					
					
				} // Otherwise, if the new selected object is the same as the current selected object...
				else
				{
					
					// Reset the selected object
					this.resetSelectedObject(player);
					
				}
				
				
			} // Otherwise, if the player isn't looking at any objects...
			else
			{
				
				// Reset the selected object
				this.resetSelectedObject(player);
				
			}
			
			
		} // Otherwise, if editor is disabled...
		else
		{
			
			// Reset the selected object
			this.resetSelectedObject(player);
			
		}
		
	}
	
	/**
	 * Resets the selected object.
	 *
	 * @param {player} player The player editing the game world.
	 */
	resetSelectedObject(player)
	{
		
		// If an object is selected...
		if (this.selected_object)
		{
			
			// Reset the selected object's material
			this.selected_object.material = this.selected_object_original_materials.get(this.selected_object);
			
			// Reset the selected object
			this.selected_object = null;
			
			// Detatch transform controls if they're attached to anything
			player.controls.transform_controls.detach();
		}
		
		// Hide selected object UI
		$("#editor-selected-object").hide();
		
	}
	
	/**
	 * Updates the selected object UI elements.
	 */
	updateSelectedObjectUI()
	{
		
		// Check if editor is enabled
		if (this.enabled)
		{
			
			// Check if object is selected
			if (this.selected_object)
			{
				
				// Update position
				$("#editor-selected-object-position-x").val(this.selected_object.position.x);
				$("#editor-selected-object-position-y").val(this.selected_object.position.y);
				$("#editor-selected-object-position-z").val(this.selected_object.position.z);
				
				// Update scale
				$("#editor-selected-object-scale-x").val((this.selected_object.scale.x / 1) * 100);
				$("#editor-selected-object-scale-y").val((this.selected_object.scale.y / 1) * 100);
				$("#editor-selected-object-scale-z").val((this.selected_object.scale.z / 1) * 100);
				
				// Check if object is billboard
				if (this.selected_object instanceof Billboard)
				{
					
					// Hide rotation for billboards
					$("#editor-selected-object-rotation").hide();
					
				}
				else
				{
					
					// Update rotation
					$("#editor-selected-object-rotation").show();
					
					$("#editor-selected-object-rotation-x").val(this.selected_object.rotation.x * (180 / Math.PI));
					$("#editor-selected-object-rotation-y").val(this.selected_object.rotation.y * (180 / Math.PI));
					$("#editor-selected-object-rotation-z").val(this.selected_object.rotation.z * (180 / Math.PI));
					
				}
				
			}
			
		}
		
	}
    
}
export default Editor;