// three.js Imports
import * as THREE from '../libraries/threejs/three.js';

// Class Imports
import Billboard from './billboard.class.js';

// Static Class Imports
import Assets from './assets.class.js';

/**
 * The in-game world editor.
 */
class Editor
{
	
	// Class Declarations
	
	// Editor enabled/disabled flag
	static enabled = false;
	
	
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
	
	
	// Clipboard objects
	
	// The group of cut/copied objects
	static clipboard_objects = new THREE.Group();
	
	
	// Spawned objects
	
	// The colour of spawned objects
	static spawned_object_colour = 0xd3d3d3;
	
	
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
					clone.userData[key] = value.clone();
				});
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
		
	}
	
	
	// Event Handler Methods
	
	/**
	 * Handles player left mouse down.
	 *
	 * @param {player} player The player to handle mouse input for.
	 */
	static handleLeftMouseDown(event, player)
	{
		
		// Check if editor is enabled
		if (this.enabled)
		{
			
			// If the mouse is locked to the renderer...
			if (player.controls.is_mouse_locked)
			{
				
				// Prevent shift-clicking from highlighting text
				if (event.shiftKey)
				{
					event.preventDefault();
				}
				
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
	static handleLeftMouseUp(world, player)
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
	static handleRightMouseDown()
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
	static handleRightMouseUp(dom_document, world, player)
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
				player.controls.transform_controls.dragging = false;
				
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
	 * @param {world} world The current game world.
	 * @param {player} player The player editing the game world.
	 */
	static toggle(world, player)
	{
		
		// Check if editor is enabled
		if (this.enabled)
		{
			
			// Hide editor UI
			$("#editor").hide();
			
			// Reset any highlighted or selected objects
			this.resetHighlightedObjects();
			this.resetSelectedObjects(world, player);
			
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
			this.updateSelectedObjectMaterialTextureFolders();
			
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
	static update(world, player)
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
	static resize()
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
	 * @param {world} world The current game world.
	 * @param {player} player The player editing the game world.
	 */
	static newWorld(world, player)
	{
	
		// Check if editor is enabled
		if (this.enabled)
		{
		
			// Reset any highlighted or selected objects
			this.resetHighlightedObjects();
			this.resetSelectedObjects(world, player);
			
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
			const campfire = new Billboard(1.5, 1.5, Assets.textures.campfire);
			campfire.position.set(0, 0.75, -5);
			campfire.name = "campfire";
			world.addObject(campfire);
			
			// Reset the player's position
			player.position.x = 0;
			player.position.y = player.height;
			player.position.z = 0;
			
			// Add player transform controls to the world
			world.scene.add(player.controls.transform_controls);
		
		}
		
	}
	
	/**
	 * Loads a world from a saved JSON file using an open file dialog.
	 *
	 * @param {world} world The current game world.
	 * @param {player} player The player editing the game world.
	 */
	static loadWorld(world, player)
	{
		
		// Check if editor is enabled
		if (this.enabled)
		{
			
			// Reset any highlighted or selected objects
			this.resetHighlightedObjects();
			this.resetSelectedObjects(world, player);
			
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
	static saveWorld(world, player)
	{
		
		// Check if editor is enabled
		if (this.enabled)
		{
			
			// Reset any highlighted or selected objects
			this.resetHighlightedObjects();
			this.resetSelectedObjects(world, player);
		
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
	 * @param {world} world The current game world.
	 * @param {player} player The player editing the game world.
	 */
	static spawn(Geometry, world, player)
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
					spawn_object = new Billboard(1, 1, Assets.textures.campfire);
					
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
	static updateHighlightedObject(world, player)
	{
		
		// If editor is enabled, update object highlighting...
		if (this.enabled)
		{
			
			// Initialize potential new highlighted object
			let new_highlighted_objects = null;
			
			// Cast a ray from the player's position in the direction the player is looking
			player.raycaster.ray.origin.copy(player.position);
			player.raycaster.ray.direction.set(0, 0, -1).applyQuaternion(player.quaternion);
			player.raycaster.near = 0;
			player.raycaster.far = Infinity;
			
			// Check intersections with world objects
			const intersects = player.raycaster.intersectObjects(world.objects, true);
			if (intersects.length > 0)
			{
				
				// Get the first object object that the player is looking at
				new_highlighted_objects = intersects[0].object.getTopMostParent();
				
				// Reset highlighted objects
				this.resetHighlightedObjects();
				
				// If the new highlighted object is different than the current highlighted object and any of the selected objects
				if (!this.highlighted_objects.getObjectById(new_highlighted_objects.id) && !this.selected_objects.getObjectById(new_highlighted_objects.id))
				{
					
					// Check if the object is a group
					if (new_highlighted_objects.isGroup)
					{
						
						// Make the new highlighted object's material transparent
						new_highlighted_objects.traverse((child) => {
							if (child.isMesh)
							{
								child.userData.original_material = child.material.clone();
								child.material = new THREE.MeshBasicMaterial({ color: child.material.color.getHex(), transparent: true, opacity: 0.5 });
							}
						});
						
					}
					else
					{
						
						// Make the new highlighted object's material transparent
						new_highlighted_objects.userData.original_material = new_highlighted_objects.material.clone();
						new_highlighted_objects.material = new THREE.MeshBasicMaterial({ color: new_highlighted_objects.material.color.getHex(), transparent: true, opacity: 0.5 });
						
					}
					
					// Set the highlighted objects
					this.highlighted_objects = new_highlighted_objects;
					
				}
				else if (this.selected_objects.getObjectById(new_highlighted_objects.id))
				{
					
					// Reset the highlighted object
					this.resetHighlightedObjects();
					
				}
				
				
			} // Otherwise, if the player isn't looking at any objects...
			else
			{
				
				// Reset the highlighted object
				this.resetHighlightedObjects();
				
			}
			
		} // Otherwise, if editor is disabled...
		else
		{
			
			// Reset the highlighted object
			this.resetHighlightedObjects();
			
		}
		
	}
	
	/**
	 * Resets the highlighted object.
	 */
	static resetHighlightedObjects()
	{
		
		// If an object is highlighted...
		if (this.highlighted_objects)
		{
			
			// Check if the object is a group
			if (this.highlighted_objects.isGroup)
			{
				
				// Reset highlighted objects materials
				this.highlighted_objects.traverse((child) => {
					if (child.isMesh)
					{
						if (child.userData.original_material != null)
						{
							child.material = child.userData.original_material.clone();
							child.userData.original_material = null;
						}
					}
				});
				
			}
			else
			{
				
				// Reset highlighted object material
				this.highlighted_objects.material = this.highlighted_objects.userData.original_material;
				this.highlighted_objects.userData.original_material = null;
				
			}
			
			// Reset the highlighted objects group
			this.highlighted_objects = new THREE.Group();
			
		}
		
	}
	
	/**
	 * Selects whichever object the player is looking at.
	 *
	 * @param {world} world The current game world.
	 * @param {player} player The player editing the game world.
	 */
	static selectObject(world, player)
	{
		
		// Check if editor is enabled
		if (this.enabled)
		{
			
			// Detatch transform controls if they're attached to anything
			player.controls.transform_controls.detach();
			
			// Cast a ray from the player's position in the direction the player is looking
			player.raycaster.ray.origin.copy(player.position);
			player.raycaster.ray.direction.set(0, 0, -1).applyQuaternion(player.quaternion);
			player.raycaster.near = 0;
			player.raycaster.far = Infinity;
			
			// Check intersections with world objects
			const intersects = player.raycaster.intersectObjects(world.objects, true);
			if (intersects.length > 0)
			{
				
				// Get the first object object that the player is looking at
				let new_selected_object = intersects[0].object.getTopMostParent();
				
				// If the new selected object is already highlighted...
				if (this.highlighted_objects.getObjectById(new_selected_object.id))
				{
					
					// Reset highlighted object
					this.resetHighlightedObjects();
					
				}
				
				// If the new selected object is different than the current selected object...
				if (!this.selected_objects.getObjectById(new_selected_object.id))
				{
					
					// Check if the object is a group
					if (new_selected_object.isGroup)
					{
						
						// Make the new selected object's material wireframe
						new_selected_object.traverse((child) => {
							if (child.isMesh)
							{
								child.userData.original_material = child.material.clone();
								child.material = new THREE.MeshBasicMaterial({ color: this.selected_object_colour, wireframe: true });
							}
						});
						
					}
					else
					{
					
						// Make the new selected object's material wireframe
						new_selected_object.userData.original_material = new_selected_object.material.clone();
						new_selected_object.material = new THREE.MeshBasicMaterial({ color: this.selected_object_colour, wireframe: true });
					
					}
					
					// Remove the new selected object from the world in preparation to add it to the group
					world.removeObject(new_selected_object);
					
					// Select multiple objects if shift key is held down...
					if (player.controls.modifier_shift_left_pressed)
					{
						world.removeObject(this.selected_objects);
					}
					else
					{
						
						// Reset the selected object if only one object is being selected
						this.resetSelectedObjects(world, player);
						
					}
					
					// Set the selected objects group's position to that of the first selected object
					if (this.selected_objects.children.length == 0)
					{
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
					
					// Re-add the group back to the world
					world.addObject(this.selected_objects);
					
					// Attach transform controls to new selected object
					player.controls.transform_controls.attach(this.selected_objects);
					
					// Update selected object UI
					this.updateSelectedObjectUI(player);
					
					
				} // Otherwise, if the new selected object is the same as the current selected object...
				else
				{
					
					// Reset the selected objects
					this.resetSelectedObjects(world, player);
					
				}
				
				
			} // Otherwise, if the player isn't looking at any objects...
			else
			{
				
				// Reset the selected objects
				this.resetSelectedObjects(world, player);
				
			}
			
			
		} // Otherwise, if editor is disabled...
		else
		{
			
			// Reset the selected objects
			this.resetSelectedObjects(world, player);
			
		}
		
	}
	
	/**
	 * Resets the selected objects.
	 *
	 * @param {world} world The current game world.
	 * @param {player} player The player editing the game world.
	 */
	static resetSelectedObjects(world, player)
	{
		
		// If any object is selected...
		if (this.selected_objects.children.length > 0)
		{
			
			// Detatch transform controls if they're attached to anything
			player.controls.transform_controls.detach();
			
			// Reset selected object materials
			this.selected_objects.traverse((child) => {
				if (child.isMesh)
				{
					if (child.userData.original_material != null)
					{
						child.material = child.userData.original_material.clone();
						child.userData.original_material = null;
					}
				}
			});
			
			// Remove the selected objects from the world to re-add them to the world outside of the selected objects group
			world.removeObject(this.selected_objects);
			
			// Prepare selected objects to be deselected
			let objects_to_deselect = [];
			for (let i = 0; i < this.selected_objects.children.length; i++)
			{
				
				// Get the selected objects group's child
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
				
				// Get selected objects group's child
				let selected_object = objects_to_deselect[i];
				
				// Remove the child from the selected objects group
				this.selected_objects.remove(selected_object);
				
				// Re-add the child to the world
				world.addObject(selected_object);
				
			}
			
			// Reset the selected objects group
			this.selected_objects = new THREE.Group();
			
			// Update selected object UI
			this.updateSelectedObjectUI(player);
			
		}
		
	}
	
	/**
	 * Cuts the selected objects.
	 *
	 * @param {world} world The current game world.
	 * @param {player} player The player editing the game world.
	 */
	static cutSelectedObjects(world, player)
	{
		
		// Check if editor is enabled
		if (this.enabled)
		{
			
			// Detatch transform controls
			player.controls.transform_controls.detach();
			
			// Remove selected objects from the world
			world.removeObject(this.selected_objects);
			
			// Copy the selected objects to the clipboard
			this.clipboard_objects = this.selected_objects.deepClone();
			
			// Reset the selected objects group
			this.selected_objects = new THREE.Group();
			
			// Update selected object UI
			this.updateSelectedObjectUI(player);
			
		}
		
	}
	
	/**
	 * Copies the selected objects.
	 */
	static copySelectedObjects()
	{
		
		// Check if editor is enabled
		if (this.enabled)
		{
		
			// Copy the selected objects to the clipboard
			this.clipboard_objects = this.selected_objects.deepClone();
		
		}
		
	}
	
	/**
	 * Pastes the clipboard objects.
	 *
	 * @param {world} world The current game world.
	 * @param {player} player The player editing the game world.
	 */
	static pasteClipboardObjects(world, player)
	{
		
		// Check if editor is enabled
		if (this.enabled)
		{
			
			// Reset the selected objects
			this.resetSelectedObjects(world, player);
			
			// Copy the selected objects to the clipboard
			this.selected_objects = this.clipboard_objects.deepClone();
			
			// Re-add the group back to the world
			world.addObject(this.selected_objects);
			this.selected_objects.updateMatrixWorld();
			
			// Attach transform controls to new selected object
			player.controls.transform_controls.attach(this.selected_objects);
			
			// Update selected object UI
			this.updateSelectedObjectUI(player);
			
		}
		
	}
	
	/**
	 * Deletes the selected objects.
	 */
	static deleteSelectedObjects(world, player)
	{
		
		// Check if editor is enabled
		if (this.enabled)
		{
			
			// If an object is selected...
			if (this.selected_objects.children.length > 0)
			{
				
				// Detatch transform controls from object
				player.controls.transform_controls.detach();
				
				// Remove each selected object from the world
				for (let i = 0; i < this.selected_objects.children.length; i++)
				{
					world.removeObject(this.selected_objects[i]);
				}
				
				// Remove the selected objects froup from the world
				world.removeObject(this.selected_objects);
				
				// Reset the selected objects group
				this.selected_objects = new THREE.Group();
				
				// Update selected object UI
				this.updateSelectedObjectUI(player);
				
			}
			
		}
		
	}
	
	/**
	 * Groups the selected objects.
	 */
	static groupSelectedObjects(world, player)
	{
		
		// Check if editor is enabled
		if (this.enabled)
		{
			
			// If an object is selected...
			if (this.selected_objects.children.length > 0)
			{
				
				// Detatch transform controls from object
				player.controls.transform_controls.detach();
				
				// Remove the selected objects froup from the world
				world.removeObject(this.selected_objects);
				
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
				world.addObject(this.selected_objects);
				
				// Attach transform controls to new selected object
				player.controls.transform_controls.attach(this.selected_objects);
				
				// Update selected object UI
				this.updateSelectedObjectUI(player);
				
			}
			
		}
		
	}
	
	/**
	 * Un-groups the selected objects.
	 */
	static ungroupSelectedObjects(world, player)
	{
		
		// Check if editor is enabled
		if (this.enabled)
		{
			
			// If an object is selected...
			if (this.selected_objects.children.length > 0 && this.selected_objects.children[0].isGroup)
			{
				
				// Detatch transform controls from object
				player.controls.transform_controls.detach();
				
				// Remove the selected objects froup from the world
				world.removeObject(this.selected_objects);
				
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
				world.addObject(this.selected_objects);
				
				// Attach transform controls to new selected object
				player.controls.transform_controls.attach(this.selected_objects);
				
				// Update selected object UI
				this.updateSelectedObjectUI(player);
				
			}
			
		}
		
	}
	
	/**
	 * Updates the selected object UI elements.
	 *
	 * @param {player} player The player editing the game world.
	 */
	static updateSelectedObjectUI(player)
	{
		
		// Check if editor is enabled
		if (this.enabled)
		{
			
			// Check if object is selected
			if (this.selected_objects.children.length > 0)
			{
				
				// Show selected object UI
				$("#editor-selected-objects").show();
				
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
				if (player.controls.transform_controls.mode == "rotate")
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
	 * Updates the selected object material texture folders UI element.
	 */
	static updateSelectedObjectMaterialTextureFolders()
	{
		
		// Get a reference to this editor to pass into the texture folder change event
		let self = this;
		
		// Get the texture folder select element and add a default option to it
		let select = $('#editor-selected-objects-materials-texture-select');
		select.empty();
		$('<option>', { value: "/", text: "Uncategorized" }).appendTo(select);
		
		// Generate texture folder options by iterating through every texture file path
		for (let [name, texture] of Object.entries(Assets.textures))
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
		this.updateSelectedObjectMaterialTexturePicker();
		
		// Texture folder change event
		$('#editor-selected-objects-materials-texture-select').on('change', function()
		{
			
			// Update the list of textures in the texture picker
			self.updateSelectedObjectMaterialTexturePicker();
			
		});
		
	}
	
	/**
	 * Updates the selected object material texture picker UI elements.
	 */
	static updateSelectedObjectMaterialTexturePicker()
	{
		
		// Get a reference to this editor to pass into the texture picker click event
		let self = this;
		
		// Empty the texture picker of any previous textures
		$('.editor-selected-objects-materials-texture-grid').empty();
		
		// Generate texture list by iterating through every texture file path
		for (let [key, texture] of Object.entries(Assets.textures))
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
			if (self.selected_objects.children.length > 0)
			{
				
				// Get the texture from the textures list by finding its key using its file path
				let texture =  Assets.textures[Object.keys(Assets.textures).find(key => Assets.textures[key].path === $(this).attr('src'))];
				
				// Set the selected object's new texture
				self.selected_objects.traverse((child) => {
					if (child.isMesh)
					{
						child.material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
						child.userData.original_material = child.material.clone();
						child.material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, wireframe: true });
					}
				});
				
			}
			
		});
		
		// Re-initialize tooltips so the colour cell tooltips render
		$('[data-bs-toggle="tooltip"]').each(function() { let tooltip = new bootstrap.Tooltip($(this)); $(this).on('click', function() { tooltip.hide(); }); });
		
	}
	
}
export default Editor;