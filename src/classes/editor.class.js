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
		
		// The highlighted object
		this.highlighted_object = null;
		
		// The colour of highlighted objects
		this.highlighted_object_colour = 0xffffff;
		
		// The original colour/materials of the highlighted object
		this.highlighted_object_original_materials = new WeakMap();
        
        
        // Selected objects
		
		// The selected object
		this.selected_object = null;
		
		// The colour of selected objects
		this.selected_object_colour = 0xffffff;
		
		// The original colour/materials of the selected object
		this.selected_object_original_materials = new WeakMap();
		
		
		// Spawned objects
		
		// The colour of spawned objects
		this.spawned_object_colour = 0xd3d3d3;
		
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
		
			// If the mouse is locked to the renderer...
			if (player.controls.is_mouse_locked)
			{
			
				// Handle transform controls mouse down event
				player.controls.transform_controls.mouseDown(player);
			
			}
			
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
			
			// The mouse is no longer dragging
			player.controls.is_mouse_dragging = false;
			
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
	 * @param {document} dom_document A reference to the DOM document within the web browser window.
	 * @param {world} world The current game world.
	 * @param {player} player The player to handle mouse input for.
	 */
	handleRightMouseUp(dom_document, world, player)
	{
		
		// Check if editor is enabled
		if (this.enabled)
		{
			
			// If the mouse is locked to the renderer...
			if (player.controls.is_mouse_locked)
			{
				
				// Unlock the mouse from the renderer
				player.controls.pointer_lock_controls.unlock();
				player.controls.is_mouse_dragging = false;
				
				// Disable right-click menu
				$(dom_document).one('contextmenu', function(event)
				{
					event.preventDefault();
				});
				
			}
			
		}
		
	}
    
    
    // Methods
	
	/**
	 * Toggle editor on/off.
	 *
	 * @param {textures} textures The list of game textures.
	 * @param {world} world The current game world.
	 * @param {player} player The player editing the game world.
	 */
	toggle(textures, world, player)
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
			
			// Update selected object material colours UI
			this.updateSelectedObjectMaterialColoursUI();
			
			// Updated selected object material textures UI
			this.updateSelectedObjectMaterialTextureFolders(textures);
			
			// Resize UI elements
			this.resize();
			
			// Show editor UI
			$("#editor").show();
			
		}
		
	}
	
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
				this.updateSelectedObjectUI(player);
				
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
	 * Resized editor UI elements.
	 */
	resize()
	{
		
		// Check if editor is enabled
		if (this.enabled)
		{
		
			// Set selected objects window maximum height
			$("#editor-selected-objects-inner").css({"max-height": "calc(" + ($('#renderer').height() - $('#editor-title').height()) + "px - 2rem)"});
			
		}
		
	}
	
	/**
	 * Resets the current world using some hard-coded defaults.
	 *
	 * @param {textures} textures The list of game textures.
	 * @param {world} world The current game world.
	 * @param {player} player The player editing the game world.
	 */
	newWorld(textures, world, player)
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
			const plane_geometry = new THREE.PlaneGeometry(100, 100);
			const plane_material = new THREE.MeshBasicMaterial({ color: 0x302400 });
			const plane = new THREE.Mesh(plane_geometry, plane_material);
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
	 * Spawns a new object into the world at the location the player is facing.
	 *
	 * @param {Geometry} three.mesh The class of geometry to be spawned.
	 * @param {textures} textures The list of game textures.
	 * @param {world} world The current game world.
	 * @param {player} player The player editing the game world.
	 */
	spawn(Geometry, textures, world, player)
	{
		
		// Check if editor is enabled
		if (this.enabled)
		{
			
			// Cast a ray from the player's position in the direction the player is looking
			player.raycaster.ray.origin.copy(player.position);
			player.raycaster.ray.direction.set(0, 0, -1).applyQuaternion(player.quaternion);
			player.raycaster.near = 0;
			player.raycaster.far = Infinity;
			
			// Check intersections with world objects
			const intersects = player.raycaster.intersectObjects(world.all_objects);
			if (intersects.length > 0)
			{
			
				// Get the first object object that the player is looking at
				let intersect_object = intersects[0].object;
				let intended_position = intersects[0].point;
				
				// Initialize object to be spawned
				let spawn_object = new Geometry();
				let spawn_object_material = new THREE.MeshBasicMaterial({ color: this.spawned_object_colour });
				
				// Re-initialize object to be spawned by specified type
				if (spawn_object instanceof Billboard)
				{
					
					// Spawn Billboard
					spawn_object = new Billboard(1, 1, textures.campfire);
					
				}
				else if (spawn_object instanceof THREE.PlaneGeometry)
				{
					
					// Spawn Plane
					spawn_object = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), spawn_object_material);
					
				}
				else if (spawn_object instanceof THREE.BoxGeometry)
				{
					
					// Spawn Box
					spawn_object = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), spawn_object_material);
					
				}
				if (spawn_object instanceof THREE.CylinderGeometry)
				{
					
					// Spawn Cylinder
					spawn_object = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1), spawn_object_material);
					
				}
				if (spawn_object instanceof THREE.SphereGeometry)
				{
					
					// Spawn Sphere
					spawn_object = new THREE.Mesh(new THREE.SphereGeometry(0.5), spawn_object_material);
					
				}
				
				// Get the spawn object's bounding box
				let spawn_object_box = new THREE.Box3();
				let spawn_object_size = new THREE.Vector3();
				
				spawn_object.geometry.computeBoundingBox();
				spawn_object.geometry.boundingBox.getSize(spawn_object_size);
				
				spawn_object_box.setFromCenterAndSize(intended_position, spawn_object_size);
					
				// Get the intersect object's bounding box
				let intersect_object_box = new THREE.Box3().setFromObject(intersect_object);
					
				intersect_object.updateMatrixWorld();
				intersect_object_box.applyMatrix4(intersect_object.matrixWorld);
				
				// Check for intersection between the object being spawned and the intersect object
				if (spawn_object_box.intersectsBox(intersect_object_box))
				{
					
					// Check for horizontal collision between the object being spawned and the intersect object
					if (spawn_object_box.max.y > intersect_object_box.min.y && spawn_object_box.min.y < intersect_object_box.max.y)
					{
						
						// Adjust horizontal axis to avoid collision
						let overlap_x = Math.min(spawn_object_box.max.x - intersect_object_box.min.x, intersect_object_box.max.x - spawn_object_box.min.x);
						let overlap_z = Math.min(spawn_object_box.max.z - intersect_object_box.min.z, intersect_object_box.max.z - spawn_object_box.min.z);
						
						// Adjust spawned object's horizontal intended position
						if (overlap_x < overlap_z)
						{
							intended_position.x -= (spawn_object_box.min.x < intersect_object_box.min.x) ? overlap_x : -overlap_x;
						}
						else
						{
							intended_position.z -= (spawn_object_box.min.z < intersect_object_box.min.z) ? overlap_z : -overlap_z;
						}
						
					}
					
					// Check for vertical collision between the object being spawned and the intersect object's upper surface
					if (spawn_object_box.min.y < intersect_object_box.max.y && spawn_object_box.max.y > intersect_object_box.max.y)
					{
						
						// Adjust spawned object's vertical intended position
						intended_position.y += (intersect_object_box.max.y - spawn_object_box.min.y);
						
					}
					
					// Check for vertical collision between the object being spawned and the intersect object's lower surface
					if (spawn_object_box.max.y > intersect_object_box.min.y && spawn_object_box.min.y < intersect_object_box.min.y)
					{
						
						// Adjust spawned object's vertical intended position
						intended_position.y -= (spawn_object_box.max.y - intersect_object_box.min.y);
						
					}
				}
				
				// Set the position of the object being spawned
				spawn_object.position.x = intended_position.x;
				spawn_object.position.y = intended_position.y + ((spawn_object_box.max.y - spawn_object_box.min.y) / 2);
				spawn_object.position.z = intended_position.z;
				
				// Spawn the object
				world.addObject(spawn_object);
				
			}
			
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
						
						new_highlighted_object.material = new THREE.MeshBasicMaterial({ color: new_highlighted_object.material.color.getHex(), transparent: true, opacity: 0.5 });
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
						
						new_selected_object.material = new THREE.MeshBasicMaterial({ color: this.selected_object_colour, wireframe: true });
					}
					
					// Get the new selected object
					this.selected_object = new_selected_object;
					
					// Attach transform controls to new selected object
					player.controls.transform_controls.attach(this.selected_object);
					
					// Initialize selected object UI elements
					this.updateSelectedObjectUI(player);
					
					// Show selected object UI
					$("#editor-selected-objects").show();
					
					
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
		$("#editor-selected-objects").hide();
		
	}
	
	/**
	 * Cuts the selected object.
	 */
	cutSelectedObject()
	{
	}
	
	/**
	 * Copies the selected object.
	 */
	copySelectedObject()
	{
	}
	
	/**
	 * Pastes the selected object.
	 */
	pasteSelectedObject()
	{
	}
	
	/**
	 * Deletes the selected object.
	 */
	deleteSelectedObject(world, player)
	{
		
		// Check if editor is enabled
		if (this.enabled)
		{
			
			// If an object is selected...
			if (this.selected_object)
			{
				
				// Detatch transform controls from object
				player.controls.transform_controls.detach();
				
				// Remove the object
				world.removeObject(this.selected_object);
				
			}
			
		}
		
	}
	
	/**
	 * Updates the selected object UI elements.
	 *
	 * @param {player} player The player editing the game world.
	 */
	updateSelectedObjectUI(player)
	{
		
		// Check if editor is enabled
		if (this.enabled)
		{
			
			// Check if object is selected
			if (this.selected_object)
			{
				
				// Update grid snaps
				if ($("#editor-selected-objects-transform-position-snap-checkbox").is(':checked'))
				{
					$("#editor-selected-objects-transform-position-snap").val(player.controls.transform_controls.translationSnap);
				}
				if ($("#editor-selected-objects-transform-scale-snap-checkbox").is(':checked'))
				{
					$("#editor-selected-objects-transform-scale-snap").val(player.controls.transform_controls.scaleSnap);
				}
				if ($("#editor-selected-objects-transform-rotation-snap-checkbox").is(':checked'))
				{
					$("#editor-selected-objects-transform-rotation-snap").val(player.controls.transform_controls.rotationSnap);
				}
				
				// Update position
				$("#editor-selected-objects-transform-position-x").val(this.selected_object.position.x);
				$("#editor-selected-objects-transform-position-y").val(this.selected_object.position.y);
				$("#editor-selected-objects-transform-position-z").val(this.selected_object.position.z);
				
				// Update scale
				$("#editor-selected-objects-transform-scale-x").val(((this.selected_object.scale.x / 1) * 100) + "%");
				$("#editor-selected-objects-transform-scale-y").val(((this.selected_object.scale.y / 1) * 100) + "%");
				$("#editor-selected-objects-transform-scale-z").val(((this.selected_object.scale.z / 1) * 100) + "%");
				
				// If transform controls rotation mode is selected...
				if (player.controls.transform_controls.mode == "rotate")
				{
					
					// Check if selected object is billboard
					if (this.selected_object instanceof Billboard)
					{
						
						// Hide rotation for billboards
						$("#editor-selected-objects-transform-rotation").hide();
						
					}
					else
					{
						
						// Update rotation
						$("#editor-selected-objects-transform-rotation").show();
						
						$("#editor-selected-objects-transform-rotation-x").val((this.selected_object.rotation.x * (180 / Math.PI)) + "°");
						$("#editor-selected-objects-transform-rotation-y").val((this.selected_object.rotation.y * (180 / Math.PI)) + "°");
						$("#editor-selected-objects-transform-rotation-z").val((this.selected_object.rotation.z * (180 / Math.PI)) + "°");
						
					}
					
				}
				
			}
			
		}
		
	}
	
	/**
	 * Updates the selected object material colours UI elements.
	 */
	updateSelectedObjectMaterialColoursUI()
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
			if (self.selected_object)
			{
				self.selected_object.material = self.selected_object_original_materials.get(self.selected_object);
				self.selected_object.material.color.set(new THREE.Color(selected_colour));
				self.selected_object_original_materials.set(self.selected_object, self.selected_object.material);
				self.selected_object.material = new THREE.MeshBasicMaterial({ color: new THREE.Color(selected_colour), wireframe: true });
			}
			
		});
		
		// Re-initialize tooltips so the colour cell tooltips render
		$('[data-bs-toggle="tooltip"]').each(function() { let tooltip = new bootstrap.Tooltip($(this)); $(this).on('click', function() { tooltip.hide(); }); });
		
	}
	
	/**
	 * Updates the selected object material texture folders UI element.
	 */
	updateSelectedObjectMaterialTextureFolders(textures)
	{
		
		// Get a reference to this editor to pass into the texture folder change event
		let self = this;
		
		// Get the texture folder select element and add a default option to it
		let select = $('#editor-selected-objects-materials-texture-select');
		select.empty();
		$('<option>', { value: "/", text: "Uncategorized" }).appendTo(select);
		
		// Generate texture folder options by iterating through every texture file path
		for (let [name, texture] of Object.entries(textures))
		{
			
			// Get texture file path parts
			let parts = texture.path.split('/');
			
			// Initialize empty option element values
			let text = "";
			let value = "/";
			
			// Get just the relevant parts of the texture file path
			for (let i = 2; i < parts.length - 1; i++)
			{
				
				// Cleanly format the folder name to add to the label
				text += parts[i].charAt(0).toUpperCase() + parts[i].slice(1) + "/";
				
				// Get the unformatted folder name to add to the folder path value
				value += parts[i] + "/";
				
			}
			
			// Remove the trailing slash from the label
			text = text.slice(0,-1);
			
			// Make sure the texture folder isn't already in the texture folders select element
			let option = $('#editor-selected-objects-materials-texture-select option:contains("' + text + '")');
			if (option.length === 0)
			{
				
				// Add the texture folder to the texture folders select element
				$('<option>', { value: value, text: text }).appendTo(select);
				
			}
			
		}
		
		// Get a list of all the options that have been added to the texture folders select element
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
		
		// Empty the texture folders select element and add the newly sorted options to it
		select.empty().append(options);
		
		// Select the default texture folder option
		select.val($("#editor-selected-objects-materials-texture-select option:first").val());
		
		// Update the list of textures in the texture picker
		this.updateSelectedObjectMaterialTexturePicker(textures);
		
		// Texture folder change event
		$('#editor-selected-objects-materials-texture-select').on('change', function()
		{
			
			// Update the list of textures in the texture picker
			self.updateSelectedObjectMaterialTexturePicker(textures);
			
		});
		
	}
	
	/**
	 * Updates the selected object material texture picker UI elements.
	 */
	updateSelectedObjectMaterialTexturePicker(textures)
	{
		
		// Get a reference to this editor to pass into the texture picker click event
		let self = this;
		
		// Empty the texture picker of any previous textures
		$('.editor-selected-objects-materials-texture-grid').empty();
		
		// Generate texture list by iterating through every texture file path
		for (let [key, texture] of Object.entries(textures))
		{
			
			// Get texture file path parts
			let parts = texture.path.split('/');
			
			// Get just the relevant parts of the texture file path to use later to get only textures from the selected texture folder
			let value = "/";
			for (let i = 2; i < parts.length - 1; i++)
			{
				value += parts[i] + "/";
			}
			
			// Check if the current texture belongs to the selected texture folder
			if ($('#editor-selected-objects-materials-texture-select').find(':selected').val() == value)
			{
				
				// Initialize a new texture element for the texture picker UI
				const cell = $('<div class="editor-selected-objects-materials-texture-cell"><img src="' + texture.path + '" class="editor-selected-objects-materials-texture-image img-fluid" alt="' + key + '" data-bs-title="' + key + '" data-bs-toggle="tooltip" data-bs-placement="bottom"></div>');
				
				// Add the new texture element to the texture picker UI
				$('.editor-selected-objects-materials-texture-grid').append(cell);
				
			}
			
		}
		
		// Texture element click event
		$('.editor-selected-objects-materials-texture-image').on('click', function()
		{
			
			// Set the selected object's new texture
			if (self.selected_object)
			{
				
				// Get the texture from the textures list by finding its key using its file path
				let texture =  textures[Object.keys(textures).find(key => textures[key].path === $(this).attr('src'))];
				
				// Remove any old textures
				if (self.highlighted_object_original_materials)
				{
					self.highlighted_object_original_materials.delete(self.selected_object);
				}
				
				// Set the selected object's new texture
				self.selected_object.material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
				self.selected_object_original_materials.set(self.selected_object, self.selected_object.material);
				self.selected_object.material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, wireframe: true });
				
			}
			
		});
		
		// Re-initialize tooltips so the colour cell tooltips render
		$('[data-bs-toggle="tooltip"]').each(function() { let tooltip = new bootstrap.Tooltip($(this)); $(this).on('click', function() { tooltip.hide(); }); });
		
	}
    
}
export default Editor;