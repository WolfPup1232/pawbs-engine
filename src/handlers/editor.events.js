// three.js Imports
import * as THREE from '../libraries/threejs/three.js';

// Class Imports
import Billboard from '../classes/billboard.class.js';

// Static Class Imports
import Editor from '../classes/editor.class.js';
import Assets from '../classes/assets.class.js';

/**
 * Initializes the Editor UI event handlers.
 *
 * @param {World} world The current game world.
 * @param {Player} player The player editing the game world.
 */
export default function initializeEditorUIEventHandlers(world, player)
{
	
	//#region [Editor Main Menu]
		
		
		//#region [World Options]
			
			/**
			 * Editor world name text change event.
			 */
			$("#editor-world-name").change(function()
			{
					
				// Set world name
				world.name = $("#editor-world-name").val();
					
			});
			
			/**
			 * Editor world new button click event.
			 */
			$("#editor-world-new").click(function()
			{
					
				// Create a new empty world
				Editor.newWorld(world, player);
					
			});
			
			/**
			 * Editor world load button click event.
			 */
			$("#editor-world-load").click(function()
			{
					
				// Load a world from a JSON file
				Editor.loadWorld(world, player);
					
			});
			
			/**
			 * Editor world save button click event.
			 */
			$("#editor-world-save").click(function()
			{
					
				// Save the selected world as a JSON file
				Editor.saveWorld(world, player);
					
			});
			
			/**
			 * Editor world save button click event.
			 */
			$("#editor-world-triggers").click(function()
			{
					
				// TODO: Show world events trigger editor.
					
			});
			
		//#endregion
		
		
		//#region [Tools]
			
			/**
			 * Editor tool type selected checkbox change event.
			 */
			$('input[type="checkbox"][name="editor-tool-types"]').change(function()
			{
					
				// Get editor tool type selected checkbox value
				let selected_value = $(this).val();
				
				// Hide all editor tools
				$("#editor-spawn-tool").hide();
				
				// Spawn Tool
				if (selected_value === 'spawn')
				{
					
					// Uncheck other tools
					$("#editor-tool-cinematics").prop("checked", false);
					
					// Show/hide spawn tool
					if ($("#editor-tool-spawn").is(':checked'))
					{
						
						// Show spawn tool
						$("#editor-spawn-tool").show();
						
						// Update object spawn tool UI
						Editor.updateSpawnToolUI(world, player);
						
					}
					else
					{
						
						// Disable spawn tool animations
						Assets.objectThumbnailsStopAnimating();
						
					}
					
					
				} // Cinematics Tool
				else if (selected_value === 'cinematics')
				{
					
					// Uncheck other tools
					$("#editor-tool-spawn").prop("checked", false);
					
					// Show/hide cinematics tool
					if ($("#editor-tool-cinematics").is(':checked'))
					{
						
						// Do something.
						
					}
					
				}
				
			});
			
		//#endregion
		
		
		//#region [Object Selection Types]
			
			/**
			 * Editor object selection type selected radio button change event.
			 */
			$('input[type="radio"][name="editor-world-select-types"]').change(function()
			{
				
				// Get editor object selection type selected radio button value
				let selected_value = $(this).val();
				
				// Disable all selection type modes
				Editor.select_objects = false;
				Editor.select_faces = false;
				Editor.select_vertices = false;
				
				// Reset all highlighted or selected objects, faces, and vertices
				Editor.resetHighlightedAndSelectedObjectsFacesVertices(world, player);
				
				// Change object selection type mode based on selected radio button value
				if (selected_value === 'objects')
				{
					
					// Object selection mode
					Editor.select_objects = true;
					
				}
				else if (selected_value === 'faces')
				{
					
					// Face selection mode
					Editor.select_faces = true;
					
				}
				else if (selected_value === 'vertices')
				{
					
					// Vertex selection mode
					Editor.select_vertices = true;
					player.controls.transform_controls.setMode('translate');
					
				}
				
				// Update the editor selected objects UI
				Editor.updateSelectedObjectsUI(player);
				
			});
			
		//#endregion
		
		
	//#endregion
	
	
	//#region [Selected Objects Window]
		
		
		//#region [Selected Objects General]
			
			
			//#region [Save Objects]
				
				/**
				 * Editor selected objects save dialog prefab name change event.
				 */
				$("#editor-selected-objects-save-modal-prefab-name").on('input', function()
				{
					
					// Get prefab name
					const prefab_name = $("#editor-selected-objects-save-modal-prefab-name").val();
					
					// Pre-fill file name and path with prefab name
					$("#editor-selected-objects-save-modal-objects-name").val(prefab_name);
					$("#editor-selected-objects-save-modal-objects-path").val("./objects/" + prefab_name + ".json");
					
					// Validate prefab name length to enable/disable save button
					if (prefab_name.length > 0)
					{
						$("#editor-selected-objects-save-modal-prefab-save").prop('disabled', false);
					}
					else
					{
						$("#editor-selected-objects-save-modal-prefab-save").prop('disabled', true);
					}
					
					// Check if prefab already exists by name and warn user
					if (Assets.objects.hasOwnProperty(prefab_name))
					{
						$("#editor-selected-objects-save-modal-prefab-name-warning").html("You already have a prefab with the name '" + prefab_name + "'.<br />The reference to it in your prefabs library will be overwritten if you continue.");
					}
					else
					{
						$("#editor-selected-objects-save-modal-prefab-name-warning").html("");
					}
					
				});
				
				/**
				 * Editor selected objects save dialog save prefab button click event.
				 */
				$("#editor-selected-objects-save-modal-prefab-save").click(function()
				{
					
					// Save prefab to a JSON file
					Editor.saveSelectedObjects($("#editor-selected-objects-save-modal-prefab-name").val(), player);
					
					// Update UI to show save success confirmations
					$("#editor-selected-objects-save-modal-prefab-save-checkbox").removeClass();
					$("#editor-selected-objects-save-modal-prefab-save-checkbox").addClass("bi bi-check-lg");
					
					$("#editor-selected-objects-save-modal-prefab-save-checkbox-bg").removeClass();
					$("#editor-selected-objects-save-modal-prefab-save-checkbox-bg").addClass("badge text-success-emphasis bg-success-subtle border border-success-subtle float-end");
					
					// Validate objects.json path length to enable/disable save button
					if ($("#editor-selected-objects-save-modal-objects-path").val().length > 0)
					{
						$("#editor-selected-objects-save-modal-objects-save").prop('disabled', false);
					}
					else
					{
						$("#editor-selected-objects-save-modal-objects-save").prop('disabled', true);
					}
					
				});
				
				/**
				 * Editor selected objects save dialog objects.json path change event.
				 */
				$("#editor-selected-objects-save-modal-objects-path").on('input', function(e)
				{
					
					// Validate objects.json path length to enable/disable save button
					if ($("#editor-selected-objects-save-modal-objects-path").val().length > 0)
					{
						$("#editor-selected-objects-save-modal-objects-save").prop('disabled', false);
					}
					else
					{
						$("#editor-selected-objects-save-modal-objects-save").prop('disabled', true);
					}
					
					// Initialize objects.json file path prefix and suffix
					const prefix = './objects/';
					const suffix = '.json';
					
					// Get current objects.json path
					let current_path = $(this).val();
					
					// Strip the existing prefix and suffix from the path to get the editable portion
					let editable_value = current_path.replace(new RegExp(`^${prefix}`), '').replace(new RegExp(`${suffix}$`), '');
					
					// If the entire input is selected...
					if (this.selectionStart === 0 && this.selectionEnd === current_path.length)
					{
						
						// Get the newly typed character
						if (e)
						{
							editable_value = e.originalEvent.data || '';
						}
						
					}
					
					// Rebuild the objects.json file path with the editable portion bookended by the prefix and suffix
					$(this).val(prefix + editable_value + suffix);
					
					// Set the cursor just after the last typed character
					const cursor_position = prefix.length + editable_value.length;
					$(this)[0].setSelectionRange(cursor_position, cursor_position);
					
				});
				
				/**
				 * Editor selected objects save dialog objects.json path focus and click events.
				 */
				$('#editor-selected-objects-save-modal-objects-path').on('focus click', function()
				{
					
					// Initialize objects.json file path prefix and suffix
					const prefix = './objects/';
					const suffix = '.json';
					
					// Get current objects.json path
					let currentValue = $(this).val();
					
					// Strip the existing prefix and suffix from the path to get the editable portion
					let editable_value = currentValue.replace(new RegExp(`^${prefix}`), '').replace(new RegExp(`${suffix}$`), '');
					
					// Set the cursor position just after the prefix
					const cursor_position = prefix.length + editable_value.length;
					$(this)[0].setSelectionRange(prefix.length, cursor_position);
					
				});
				
				/**
				 * Editor selected objects save dialog save objects.json button click event.
				 */
				$("#editor-selected-objects-save-modal-objects-save").click(function()
				{
					
					// Add the saved prefab's file path to the object paths array
					Assets.paths_objects[$("#editor-selected-objects-save-modal-objects-name").val()] = $("#editor-selected-objects-save-modal-objects-path").val();
					
					// Save the updated object paths array to the objects.json file
					Assets.saveObjectPaths();
					
					// Update UI to show save success confirmations
					$("#editor-selected-objects-save-modal-objects-save-checkbox").removeClass();
					$("#editor-selected-objects-save-modal-objects-save-checkbox").addClass("bi bi-check-lg");
					
					$("#editor-selected-objects-save-modal-objects-save-checkbox-bg").removeClass();
					$("#editor-selected-objects-save-modal-objects-save-checkbox-bg").addClass("badge text-success-emphasis bg-success-subtle border border-success-subtle float-end");
					
				});
				
				/**
				 * Editor selected objects modal hide event.
				 */
				$('#editor-selected-objects-save-modal').on('hidden.bs.modal', function()
				{
					
					// If both the prefab and the objects.json file have been saved...
					if ($("#editor-selected-objects-save-modal-objects-save-checkbox").hasClass("bi bi-check-lg"))
					{
						
						// Reset all fields in the selected objects save dialog
						$("#editor-selected-objects-save-modal-prefab-name").val("");
						
						$("#editor-selected-objects-save-modal-objects-name").val("");
						$("#editor-selected-objects-save-modal-objects-path").val("");
						
						$("#editor-selected-objects-save-modal-prefab-name-warning").html("");
						
						$("#editor-selected-objects-save-modal-prefab-save-checkbox").removeClass();
						$("#editor-selected-objects-save-modal-prefab-save-checkbox").addClass("bi bi-dash-lg");
						
						$("#editor-selected-objects-save-modal-prefab-save-checkbox-bg").removeClass();
						$("#editor-selected-objects-save-modal-prefab-save-checkbox-bg").addClass("badge text-warning-emphasis bg-warning-subtle border border-warning-subtle float-end");
						
						$("#editor-selected-objects-save-modal-objects-save-checkbox").removeClass();
						$("#editor-selected-objects-save-modal-objects-save-checkbox").addClass("bi bi-dash-lg");
						
						$("#editor-selected-objects-save-modal-objects-save-checkbox-bg").removeClass();
						$("#editor-selected-objects-save-modal-objects-save-checkbox-bg").addClass("badge text-warning-emphasis bg-warning-subtle border border-warning-subtle float-end");
						
						$("#editor-selected-objects-save-modal-prefab-save").prop('disabled', true);
						$("#editor-selected-objects-save-modal-objects-save").prop('disabled', true);
						
					}
					
				})
				
			//#endregion
			
			
			//#region [Cut/Copy/Paste Objects]
				
				/**
				 * Editor selected objects cut button click event.
				 */
				$("#editor-selected-objects-cut").click(function()
				{
					
					// Cut selected objects
					Editor.cutSelectedObjects(world, player);
					
				});
				
				/**
				 * Editor selected objects copy button click event.
				 */
				$("#editor-selected-objects-copy").click(function()
				{
					
					// Copy selected objects
					Editor.copySelectedObjects();
					
				});
				
				/**
				 * Editor clipboard objects paste button click event.
				 */
				$("#editor-selected-objects-paste").click(function()
				{
					
					// Paste clipboard objects
					Editor.pasteClipboardObjects(world, player);
					
				});
				
			//#endregion
			
			
			//#region [Delete Objects]
				
				/**
				 * Editor selected objects delete button click event.
				 */
				$("#editor-selected-objects-delete").click(function()
				{
					
					// Delete selected objects
					Editor.deleteSelectedObjects(world, player);
					
				});
				
			//#endregion
			
			
			//#region [Group/Ungroup Objects]
				
				/**
				 * Editor selected objects group button click event.
				 */
				$("#editor-selected-objects-group").click(function()
				{
					
					// Group selected objects
					Editor.groupSelectedObjects(world, player);
					
				});
				
				/**
				 * Editor selected objects ungroup button click event.
				 */
				$("#editor-selected-objects-ungroup").click(function()
				{
					
					// Ungroup selected objects
					Editor.ungroupSelectedObjects(world, player);
					
				});
				
			//#endregion
			
			
		//#endregion
		
		
		//#region [Selected Objects Transforms]
			
			
			//#region [Editor Selected Objects Transform Types]
			
				/**
				 * Editor selected objects transform type selected radio button change event.
				 */
				$('input[type="radio"][name="editor-selected-objects-transforms"]').change(function()
				{
					
					// Get editor selected objects transform type selected radio button value
					let selected_value = $(this).val();
					
					// Hide all transform controls
					$("#editor-selected-objects-transform-position").hide();
					$("#editor-selected-objects-transform-scale").hide();
					$("#editor-selected-objects-transform-rotation").hide();
					
					// Change player transform controls mode based on selected radio button value
					if (selected_value === 'position')
					{
						
						// Translate mode
						player.controls.transform_controls.setMode('translate');
						
						// Show translate controls
						$("#editor-selected-objects-transform-position").show();
						
					}
					else if (selected_value === 'scale')
					{
						
						// Scale mode
						player.controls.transform_controls.setMode('scale');
						
						// Show scale controls
						$("#editor-selected-objects-transform-scale").show();
						
					}
					else if (selected_value === 'rotation')
					{
						
						// Rotate mode
						player.controls.transform_controls.setMode('rotate');
						
						// Show rotation controls
						$("#editor-selected-objects-transform-rotation").show();
						
					}
					
					// Update the editor selected objects UI
					Editor.updateSelectedObjectsUI(player);
					
				});
				
			//#endregion
			
			
			//#region [Editor Selected Objects Position]
				
				/**
				 * Editor selected objects position grid snap change event.
				 */
				$("#editor-selected-objects-transform-position-snap").change(function()
				{
					
					// Check if position grid snap is enabled
					if ($("#editor-selected-objects-transform-position-snap-checkbox").prop("checked"))
					{
						
						// Set position grid snap
						player.controls.transform_controls.translationSnap = $("#editor-selected-objects-transform-position-snap").val();
						
					}
					
				});
				
				/**
				 * Editor selected objects position grid snap checkbox change event.
				 */
				$("#editor-selected-objects-transform-position-snap-checkbox").change(function()
				{
					
					// Check if position grid snap is enabled
					if ($(this).prop("checked"))
					{
						
						// Set position grid snap
						player.controls.transform_controls.translationSnap = $("#editor-selected-objects-transform-position-snap").val();
						
					}
					else
					{
						
						// Disable position grid snap
						player.controls.transform_controls.translationSnap = null;
						
					}
					
				});
				
				/**
				 * Editor selected objects position X-axis change event.
				 */
				$("#editor-selected-objects-transform-position-x").change(function()
				{
						
					// Set selected objects X-axis position
					Editor.selected_objects.position.x = $("#editor-selected-objects-transform-position-x").val();
						
				});
				
				/**
				 * Editor selected objects position Y-axis change event.
				 */
				$("#editor-selected-objects-transform-position-y").change(function()
				{
					
					// Set selected objects Y-axis position
					Editor.selected_objects.position.y = $("#editor-selected-objects-transform-position-y").val();
					
				});
				
				/**
				 * Editor selected objects position Z-axis change event.
				 */
				$("#editor-selected-objects-transform-position-z").change(function()
				{
					
					// Set selected objects Z-axis position
					Editor.selected_objects.position.z = $("#editor-selected-objects-transform-position-z").val();
					
				});
				
			//#endregion
			
			
			//#region [Editor Selected Objects Scale]
				
				/**
				 * Editor selected objects scale grid snap change event.
				 */
				$("#editor-selected-objects-transform-scale-snap").change(function()
				{
					
					// Check if scale grid snap is enabled
					if ($("#editor-selected-objects-transform-scale-snap-checkbox").prop("checked"))
					{
						
						// Set scale grid snap
						player.controls.transform_controls.scaleSnap = $("#editor-selected-objects-transform-scale-snap").val();
						
					}
					
				});
				
				/**
				 * Editor selected objects scale grid snap checkbox change event.
				 */
				$("#editor-selected-objects-transform-scale-snap-checkbox").change(function()
				{
					
					// Check if scale grid snap is enabled
					if ($(this).prop("checked"))
					{
						
						// Set scale grid snap
						player.controls.transform_controls.scaleSnap = $("#editor-selected-objects-transform-scale-snap").val();
						
					}
					else
					{
						
						// Disable scale grid snap
						player.controls.transform_controls.scaleSnap = null;
						
					}
					
				});
				
				/**
				 * Editor selected objects scale X-axis change event.
				 */
				$("#editor-selected-objects-transform-scale-x").change(function()
				{
					
					// Set selected objects X-axis scale 
					Editor.selected_objects.scale.x = $("#editor-selected-objects-transform-scale-x").val().slice(0, -1) / 100;
					
				});
				
				/**
				 * Editor selected objects scale Y-axis change event.
				 */
				$("#editor-selected-objects-transform-scale-y").change(function()
				{
					
					// Set selected objects Y-axis scale 
					Editor.selected_objects.scale.y = $("#editor-selected-objects-transform-scale-y").val().slice(0, -1) / 100;
					
				});
				
				/**
				 * Editor selected objects scale Z-axis change event.
				 */
				$("#editor-selected-objects-transform-scale-z").change(function()
				{
					
					// Set selected objects Z-axis scale 
					Editor.selected_objects.scale.z = $("#editor-selected-objects-transform-scale-z").val().slice(0, -1) / 100;
					
				});
				
			//#endregion
			
			
			//#region [Editor Selected Objects Rotation]
				
				/**
				 * Editor selected objects rotation grid snap change event.
				 */
				$("#editor-selected-objects-transform-rotation-snap").change(function()
				{
					
					// Check if rotation grid snap is enabled
					if ($("#editor-selected-objects-transform-rotation-snap-checkbox").prop("checked"))
					{
						
						// Set rotation grid snap
						player.controls.transform_controls.rotationSnap = $("#editor-selected-objects-transform-rotation-snap").val();
						
					}
					
				});
				
				/**
				 * Editor selected objects rotation grid snap checkbox change event.
				 */
				$("#editor-selected-objects-transform-rotation-snap-checkbox").change(function()
				{
					
					// Check if rotation grid snap is enabled
					if ($(this).prop("checked"))
					{
						
						// Set rotation grid snap
						player.controls.transform_controls.rotationSnap = $("#editor-selected-objects-transform-rotation-snap").val();
						
					}
					else
					{
						
						// Disable rotation grid snap
						player.controls.transform_controls.rotationSnap = null;
						
					}
					
				});
				
				/**
				 * Editor selected objects rotation X-axis change event.
				 */
				$("#editor-selected-objects-transform-rotation-x").change(function()
				{
					
					// Set selected objects X-axis rotation by converting the input degrees to radians
					Editor.selected_objects.rotation.x = $("#editor-selected-objects-transform-rotation-x").val().slice(0, -1) * (Math.PI / 180);
					
				});
				
				/**
				 * Editor selected objects rotation Y-axis change event.
				 */
				$("#editor-selected-objects-transform-rotation-y").change(function()
				{
					
					// Set selected objects Y-axis rotation by converting the input degrees to radians
					Editor.selected_objects.rotation.y = $("#editor-selected-objects-transform-rotation-y").val().slice(0, -1)  * (Math.PI / 180);
					
				});
				
				/**
				 * Editor selected objects rotation Z-axis change event.
				 */
				$("#editor-selected-objects-transform-rotation-z").change(function()
				{
					
					// Set selected objects Z-axis rotation by converting the input degrees to radians
					Editor.selected_objects.rotation.z = $("#editor-selected-objects-transform-rotation-z").val().slice(0, -1)  * (Math.PI / 180);
					
				});
				
			//#endregion
			
			
		//#endregion
		
		
		//#region [Selected Objects Materials]
		
		
			//#region [Material Colour Picker]
				
				/**
				 * Editor selected objects colour picker input event.
				 */
				$("#editor-selected-objects-materials-selected-colour").on('input', function()
				{
					
					// Get hex string of the selected colour
					const selected_colour = $(this).val();
					
					// Set the colour of all selected objects to the selected colour
					if (Editor.selected_objects.children.length > 0)
					{
						Editor.selected_objects.traverse((child) => {
							if (child.isMesh)
							{
								child.userData.original_material.color.set(new THREE.Color(selected_colour));
								child.material = new THREE.MeshBasicMaterial({ color: new THREE.Color(selected_colour), wireframe: true });
							}
						});
					}
					
				});
				
				
				//#region [Material Texture Remover]
					
					/**
					 * Editor selected objects texture reset button click event.
					 */
					$("#editor-selected-objects-materials-texture-reset-button").click(function()
					{
						
						// Get hex string of the editor's default spawned object colour
						const selected_colour = "#" + Editor.spawned_object_colour.toString(16);
						
						// Set the selected colour picker to the new colour
						$('#editor-selected-objects-materials-selected-colour').css('background-color', selected_colour);
						$('#editor-selected-objects-materials-selected-colour').val(selected_colour);
						
						// Set the colour of all selected objects to the selected colour
						if (Editor.selected_objects.children.length > 0)
						{
							Editor.selected_objects.traverse((child) => {
								if (child.isMesh)
								{
									child.material = new THREE.MeshBasicMaterial({ color: new THREE.Color(selected_colour) });
									child.userData.original_material = child.material.clone();
									child.material = new THREE.MeshBasicMaterial({ color: new THREE.Color(selected_colour), wireframe: true });
								}
							});
						}
						
					});
					
				//#endregion
				
				
			//#endregion
			
			
		//#endregion
		
		
	//#endregion
	
	
	//#region [Editor Spawn Tool]
		
		/**
		 * Editor spawn tool mouse wheel scroll event.
		 */
		$("#editor-spawn-tool-container").on("wheel", function(e)
		{
			
			// Scroll the spawn tool horizontally based on the mouse wheel scroll amount
			if (Math.abs(e.originalEvent.deltaY) > 0)
			{
				e.preventDefault();
				$("#editor-spawn-tool-scroll").scrollLeft($("#editor-spawn-tool-scroll").scrollLeft() + e.originalEvent.deltaY);
			}
			
		});
		
		
		//#region [Spawn Primitive Objects]
			
			/**
			 * Editor spawn tool primitive object attribute text change event.
			 */
			$("[id^='editor-spawn-']").change(function()
			{
				
				// Get name of primitive object to be spawned
				let primitive_name = $(this).attr("id").split("-")[3];
				let primitive_object = null;
				
				// Cube
				if (primitive_name == "cube")
				{
					
					// Get field values
					let width = $("#editor-spawn-cube-width").val();
					let height = $("#editor-spawn-cube-height").val();
					let depth = $("#editor-spawn-cube-depth").val();
					
					let width_segments = $("#editor-spawn-cube-width-segments").val();
					let height_segments = $("#editor-spawn-cube-height-segments").val();
					let depth_segments = $("#editor-spawn-cube-depth-segments").val();
					
					// Initialize object
					primitive_object = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth, width_segments, height_segments, depth_segments), new THREE.MeshBasicMaterial({ color: Editor.spawned_object_colour }));
					
					
				} // Sphere
				else if (primitive_name == "sphere")
				{
					
					// Get field values
					let diameter = $("#editor-spawn-sphere-diameter").val();
					let radius = diameter / 2;
					
					let width_segments = $("#editor-spawn-sphere-width-segments").val();
					let height_segments = $("#editor-spawn-sphere-height-segments").val();
					
					// Initialize object
					primitive_object = new THREE.Mesh(new THREE.SphereGeometry(radius, width_segments, height_segments), new THREE.MeshBasicMaterial({ color: Editor.spawned_object_colour }));
					
					
				} // Cylinder
				else if (primitive_name == "cylinder")
				{
					
					// Get field values
					let diameter_top = $("#editor-spawn-cylinder-top-diameter").val();
					let radius_top = diameter_top / 2;
					
					let diameter_bottom = $("#editor-spawn-cylinder-bottom-diameter").val();
					let radius_bottom = diameter_bottom / 2;
					
					let height = $("#editor-spawn-cylinder-height").val();
					let radial_segments = $("#editor-spawn-cylinder-radial-segments").val();
					let height_segments = $("#editor-spawn-cylinder-height-segments").val();
					
					// Initialize object
					primitive_object = new THREE.Mesh(new THREE.CylinderGeometry(radius_top, radius_bottom, height, radial_segments, height_segments), new THREE.MeshBasicMaterial({ color: Editor.spawned_object_colour }));
					
					
				} // Cone
				else if (primitive_name == "cone")
				{
					
					// Get field values
					let diameter = $("#editor-spawn-cone-diameter").val();
					let radius = diameter / 2;
					
					let height = $("#editor-spawn-cone-height").val();
					let radial_segments = $("#editor-spawn-cone-radial-segments").val();
					let height_segments = $("#editor-spawn-cone-height-segments").val();
					
					// Initialize object
					primitive_object = new THREE.Mesh(new THREE.ConeGeometry(radius, height, radial_segments, height_segments), new THREE.MeshBasicMaterial({ color: Editor.spawned_object_colour }));
					
					
				} // Torus
				else if (primitive_name == "torus")
				{
					
					// Get field values
					let diameter = $("#editor-spawn-torus-diameter").val();
					let radius = diameter / 2;
					
					let diameter_tube = $("#editor-spawn-torus-tube-diameter").val();
					let radius_tube = diameter_tube / 2;
					
					let radial_segments = $("#editor-spawn-torus-radial-segments").val();
					let tubular_segments = $("#editor-spawn-torus-tubular-segments").val();
					
					// Initialize object
					primitive_object = new THREE.Mesh(new THREE.TorusGeometry(radius, radius_tube, radial_segments, tubular_segments), new THREE.MeshBasicMaterial({ color: Editor.spawned_object_colour }));
					
					
				} // Plane
				else if (primitive_name == "plane")
				{
					
					// Get field values
					let width = $("#editor-spawn-plane-width").val();
					let height = $("#editor-spawn-plane-height").val();
					
					let width_segments = $("#editor-spawn-plane-width-segments").val();
					let height_segments = $("#editor-spawn-plane-height-segments").val();
					
					// Initialize object
					primitive_object = new THREE.Mesh(new THREE.PlaneGeometry(width, height, width_segments, height_segments), new THREE.MeshBasicMaterial({ color: Editor.spawned_object_colour }));
					
					
				} // Circle
				else if (primitive_name == "circle")
				{
					
					// Get field values
					let diameter = $("#editor-spawn-circle-diameter").val();
					let radius = diameter / 2;
					
					let segments = $("#editor-spawn-circle-segments").val();
					
					// Initialize object
					primitive_object = new THREE.Mesh(new THREE.CircleGeometry(radius, segments), new THREE.MeshBasicMaterial({ color: Editor.spawned_object_colour }));
					
					
				} // Ring
				else if (primitive_name == "ring")
				{
					
					// Get field values
					let inner_diameter = $("#editor-spawn-ring-inner-diameter").val();
					let inner_radius = inner_diameter / 2;
					
					let outer_diameter = $("#editor-spawn-ring-outer-diameter").val();
					let outer_radius = outer_diameter / 2;
					
					let radial_segments = $("#editor-spawn-ring-radial-segments").val();
					let height_segments = $("#editor-spawn-ring-height-segments").val();
					
					// Initialize object
					primitive_object = new THREE.Mesh(new THREE.RingGeometry(inner_radius, outer_radius, radial_segments, height_segments), new THREE.MeshBasicMaterial({ color: Editor.spawned_object_colour }));
					
				}
				
				// Replace primitive object in assets
				if (primitive_object != null)
				{
					primitive_object.path = "";
					Assets.objects["primitive_" + primitive_name] = primitive_object;
				}
				
			});
			
		//#endregion
		
		
	//#endregion
	
}