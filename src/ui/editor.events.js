// three.js Imports
import * as THREE from '../libraries/threejs/three.js';

// Static Class Imports
import Game from '../classes/game.class.js';
import Assets from '../classes/assets.class.js';
import Editor from '../classes/editor.class.js';

// Class Imports
import Billboard from '../classes/billboard.class.js';

/**
 * Initializes the in-game editor UI event handlers.
 */
export default function initializeEditorUIEventHandlers()
{
	
	/**
	 * Editor UI functions.
	 */
	Game.ui.editor = { };
	
	
	//#region [Functions]
		
		
		//#region [Editor UI]
			
			/**
			 * Initializes and shows the editor UI.
			 */
			Game.ui.editor.show = function show()
			{
				
				// Initialize selected objects material colour grid
				Game.ui.utilities.initializeColourGrid("#editor-selected-objects-materials-colour-grid", "editor-selected-objects-materials-colour-cell", "#editor-selected-objects-materials-selected-colour", Game.ui.utilities.getMSPaintColours, function() {
					
					// Get the background colour of the selected colour cell
					const selected_colour = $(this).css('background-color');
					
					// Set the selected object's new colour
					Editor.setSelectedObjectsColour(selected_colour);
					
					// Set the colour element's new colour
					$("#editor-selected-objects-materials-selected-colour").val('#' + selected_colour.match(/\d+/g).map(function(value) { return ('0' + parseInt(value).toString(16)).slice(-2); }).join(''));
					
				});
				
				// Update editor UI
				Game.ui.editor.update();
				
				// Show editor UI
				$('#editor').show();
				
			}
			
			/**
			 * Hides the editor UI.
			 */
			Game.ui.editor.hide = function hide()
			{
				
				// Hide editor
				$('#editor').hide();
				
			}
			
			/**
			 * Updates the editor UI.
			 */
			Game.ui.editor.update = function update()
			{
				
				// Update editor main menu
				Game.ui.editor.updateEditorMenu();
				
				// Update scene graph UI
				Game.ui.editor.updateSceneGraphWindow();
				
				// Update selected object material textures UI
				Game.ui.editor.updateAssetPickerFolders(Assets.textures, "#editor-selected-objects-materials-texture-select", "#editor-selected-objects-materials-texture-grid");
				
				// Update object spawn tool UI
				Game.ui.editor.updateSpawnToolWindow();
				
			}
			
		//#endregion
		
		
		//#region [Scene Graph]
			
			/**
			 * Updates the scene graph window UI elements.
			 */
			Game.ui.editor.updateSceneGraphWindow = function updateSceneGraphWindow()
			{
				
				// De-initialize any existing event handlers on the scene graph container and its controls
				Game.ui.utilities.removeAllEventHandlers("#editor-scene-graph-list-container");
				Game.ui.utilities.removeAllEventHandlers("#editor-scene-graph-sort");
				
				// Get scene graph container
				const container = $("#editor-scene-graph-list-container");
				
				// Get the current sort mode
				const sort_mode = ($("#editor-scene-graph-sort").val() || "none");
				const sort_by_type = (sort_mode === "type");
				
				// Re-initialize the scene graph root list
				container.empty();
				const root_list = $('<ul id="editor-scene-graph-list"></ul>');
				container.append(root_list);
				
				// Get root objects
				let roots = Game.world && Game.world.objects ? Array.from(Game.world.objects) : [];
				
				// Render root objects and their children
				Game.ui.editor.updateSceneGraphObjects(root_list, roots, 0, sort_by_type);
				
				// Toggle expand/collapse handler...
				container.on('click', '.editor-scene-graph-toggle:not(.disabled)', function()
				{
					
					// Get the current list item and its children
					const li = $(this).closest('li');
					const children = li.children('ul.editor-scene-graph-children');
					
					// Toggle visibility and update the caret icon accordingly...
					if (children.is(':visible'))
					{
						children.hide();
						$(this).html('<i class="bi bi-caret-right-fill"></i>');
					}
					else
					{
						children.show();
						$(this).html('<i class="bi bi-caret-down-fill"></i>');
					}
					
				});
				
				// When sort dropdown changes, re-render scene graph to apply new sort mode...
				$('#editor-scene-graph-sort').on('change', () => {
					Game.ui.editor.updateSceneGraphWindow();
				});
				
				// Refresh all UI tooltips
				Game.ui.refreshTooltips();
				
			};
			
			/**
			 * Lists an array of objects in the specified HTML DOM <ul> element.
			 *
			 * @param {JQuery<HTMLElement>} ul_element The specified HTML DOM <ul> element to append items to.
			 * @param {Array<THREE.Object3D>} objects The array of objects to list.
			 * @param {number} depth The current tree depth.
			 * @param {boolean} sort_by_type Boolean flag indicating whether or not to sort objects alphabetically by type.
			 */
			Game.ui.editor.updateSceneGraphObjects = function(ul_element, objects, depth, sort_by_type)
			{
				
				// If there are no children to render, abort...
				if (!objects || objects.length === 0)
				{
					return;
				}
				
				// Get copy of objects array
				let items = Array.from(objects);
				
				// If sorting by type, order items alphabetically by their Object3D.type...
				if (sort_by_type)
				{
					items.sort((a, b) => {
						const ta = (a.type || "").toLowerCase();
						const tb = (b.type || "").toLowerCase();
						if (ta < tb) return -1; if (ta > tb) return 1; return 0;
					});
				}
				
				// Render each object as a list item with a label row and an optional children list...
				items.forEach(object => {
					
					// Determine if this node has children
					const has_children = object.children && object.children.length > 0;
					
					// Initialize object display name
					const display_name = (object.name && object.name.trim().length > 0) ? object.name : 
						((object.userData && object.userData.name) ? object.userData.name : (object.type || "Object3D") + " #" + object.id);
					
					// Initialize list item and row
					const li = $('<li class="editor-scene-graph-item" data-object-id="' + object.id + '"></li>');
					const row = $('<span class="editor-scene-graph-label"></span>');
					
					// if object has children, initialize expand/collapse toggle...
					const toggle = $('<span class="editor-scene-graph-toggle' + (has_children ? '' : ' disabled') + '" role="button" aria-label="toggle"></span>');
					if (has_children)
					{
						toggle.html('<i class="bi bi-caret-down-fill"></i>');
					}
					else
					{
						toggle.html('<i class="bi bi-dot"></i>');
					}
					
					// Initialize name text and a small type badge
					const name = $('<span class="editor-scene-graph-name"></span>').text(display_name);
					const type = $('<span class="editor-scene-graph-type-badge"></span>').text(object.type || 'Object3D');
					
					// Assemble the row and append it to the list item
					row.append(toggle).append(name).append(type);
					li.append(row);
					
					// Add the list item to the list
					ul_element.append(li);
					
					// If the object has children, render them as a nested <ul>...
					if (has_children)
					{
						
						// Initialize list of object's children and add it to the list item
						const child_ul = $('<ul class="editor-scene-graph-children"></ul>');
						li.append(child_ul);
						
						// Collapse children by default when the depth is >= 1 to keep the tree tidy...
						if (depth >= 1)
						{
							child_ul.hide();
							toggle.html('<i class="bi bi-caret-right-fill"></i>');
						}
						
						// Recursively render object's children
						this.updateSceneGraphObjects(child_ul, object.children, depth + 1);
						
					}
					
				});
				
			};
			
		//#endregion
		
		
		//#region [Editor Main Menu]
			
			/**
			 * Updates the editor's main menu UI elements.
			 */
			Game.ui.editor.updateEditorMenu = function updateEditorMenu()
			{
				
				// Update world name
				$('#editor-world-name').val(Game.world.name);
				
				// Update player noclip button
				$('#editor-camera-walk').prop('checked', !Game.player.noclip);
				
			}
			
		//#endregion
		
		
		//#region [Selected Objects Window]
			
			/**
			 * Updates the selected objects window UI elements.
			 */
			Game.ui.editor.updateSelectedObjectsWindow = function updateSelectedObjectsWindow()
			{
				
				// Check if object selection mode is enabled and object is selected
				if (Editor.selection_mode == Editor.SelectionModes.Objects && Editor.selected_objects.children.length > 0)
				{
					
					// Show selected object UI
					$('#editor-selected-objects').show();
					$('#editor-tool-selected').prop('checked', true);
					$('#editor-tool-selected').prop('disabled', false);
					
					// Update grid snaps
					if ($('#editor-selected-objects-transform-position-snap-checkbox').is(':checked'))
					{
						$('#editor-selected-objects-transform-position-snap').val(Game.player.controls.transform_controls.translationSnap);
					}
					if ($('#editor-selected-objects-transform-scale-snap-checkbox').is(':checked'))
					{
						$('#editor-selected-objects-transform-scale-snap').val(Game.player.controls.transform_controls.scaleSnap);
					}
					if ($('#editor-selected-objects-transform-rotation-snap-checkbox').is(':checked'))
					{
						$('#editor-selected-objects-transform-rotation-snap').val(Game.player.controls.transform_controls.rotationSnap);
					}
					
					// Update position
					$('#editor-selected-objects-transform-position-x').val(Editor.selected_objects.position.x);
					$('#editor-selected-objects-transform-position-y').val(Editor.selected_objects.position.y);
					$('#editor-selected-objects-transform-position-z').val(Editor.selected_objects.position.z);
					
					// Update scale
					$('#editor-selected-objects-transform-scale-x').val(((Editor.selected_objects.scale.x / 1) * 100) + "%");
					$('#editor-selected-objects-transform-scale-y').val(((Editor.selected_objects.scale.y / 1) * 100) + "%");
					$('#editor-selected-objects-transform-scale-z').val(((Editor.selected_objects.scale.z / 1) * 100) + "%");
					
					// If more than one object is selected...
					if (Editor.selected_objects.children.length > 1)
					{
						
						// Show object group button
						$('#editor-selected-objects-group-label').show();
						$('#editor-selected-objects-ungroup-label').hide();
						
						
					} // Otherwise, if an object group is selected...
					else if (Editor.selected_objects.children.length > 0 && Editor.selected_objects.children[0].isGroup)
					{
						
						// Show object ungroup button
						$('#editor-selected-objects-group-label').hide();
						$('#editor-selected-objects-ungroup-label').show();
						
					}
					else
					{
						
						// Hide object grouping buttons
						$('#editor-selected-objects-group-label').hide();
						$('#editor-selected-objects-ungroup-label').hide();
						
					}
					
					// If transform controls rotation mode is selected...
					if (Game.player.controls.transform_controls.mode == "rotate")
					{
						
						// Check if selected object is billboard
						if (Editor.selected_objects.children.length == 1 && Editor.selected_objects.children[0] instanceof Billboard)
						{
							
							// Hide rotation for billboards
							$('#editor-selected-objects-transform-rotation').hide();
							
						}
						else
						{
							
							// Update rotation
							$('#editor-selected-objects-transform-rotation').show();
							
							$('#editor-selected-objects-transform-rotation-x').val((Editor.selected_objects.rotation.x * (180 / Math.PI)) + "°");
							$('#editor-selected-objects-transform-rotation-y').val((Editor.selected_objects.rotation.y * (180 / Math.PI)) + "°");
							$('#editor-selected-objects-transform-rotation-z').val((Editor.selected_objects.rotation.z * (180 / Math.PI)) + "°");
							
						}
						
					}
					
				}
				else
				{
					
					// Hide selected object UI
					$('#editor-selected-objects').hide();
					$('#editor-tool-selected').prop('checked', false);
					$('#editor-tool-selected').prop('disabled', true);
					
				}
				
			}
			
		//#endregion
		
		
		//#region [Spawn Tool]
			
			/**
			 * Updates the spawn tool window UI elements.
			 */
			Game.ui.editor.updateSpawnToolWindow = function updateSpawnToolWindow()
			{
				
				// Update object spawn tool asset UI
				Game.ui.editor.updateAssetPickerFolders(Assets.objects, "#editor-spawn-category-select", "#editor-spawn-panel-objects");
				
			}
			
		//#endregion
		
		
		//#region [Asset Picker]
			
			/**
			 * Updates an asset picker's list of asset folders using the provided array of assets. Triggers updating an asset picker's list of asset thumbnails as well.
			 *
			 * @param {array} assets The array of assets to generate thumbnails and a folder structure listing with.
			 * @param {string} dropdown_element The ID of the HTML DOM select element to list the assets folder structure in.
			 * @param {string} grid_element The ID of the HTML DOM grid element to fill with asset thumbnails.
			 */
			Game.ui.editor.updateAssetPickerFolders = function updateAssetPickerFolders(assets, dropdown_element, grid_element, show_add_button = false)
			{
				
				// Remove any existing event handlers
				Game.ui.utilities.removeAllEventHandlers(dropdown_element);
				
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
					$(dropdown_element).on('change', () => {
						
						// Update the list of textures in the texture picker
						Game.ui.editor.updateAssetPicker(Assets.textures, dropdown_element, grid_element, show_add_button);
						
					});
					
				}
				else if (assets == Assets.objects)
				{
					
					// Object folder change event
					$(dropdown_element).on('change', () => {
						
						// Stop animating object thumbnails
						Assets.objectThumbnailsStopAnimating().then(() => {
							
							// If object spawn tool is enabled...
							if (Editor.spawn_tool == Editor.SpawnTools.Objects)
							{
								
								// Update the list of prefab objects in the spawn tool
								Game.ui.editor.updateAssetPicker(Assets.objects, dropdown_element, grid_element, show_add_button);
								
							}
							
						});
						
					});
					
				}
				
				// Update the list of assets in the asset picker
				Game.ui.editor.updateAssetPicker(assets, dropdown_element, grid_element, show_add_button);
				
			}
			
			/**
			 * Updates an asset picker's list of assets using the provided array of assets.
			 *
			 * @param {array} assets The array of assets to generate thumbnails and a folder structure listing with.
			 * @param {string} dropdown_element The ID of the HTML DOM select element to list the assets folder structure in.
			 * @param {string} grid_element The ID of the HTML DOM spawn grid element to fill with asset thumbnails.
			 */
			Game.ui.editor.updateAssetPicker = function updateAssetPicker(assets, dropdown_element, grid_element, show_add_button = false)
			{
				
				// Hide anything that could be obscuring the spawn grid
				$('.tooltip').hide();
				$('div[id^="editor-spawn-panel-"]').hide();
				$('div[id^="editor-spawn-primitive-"]').remove();
				
				// Remove any existing event handlers
				Game.ui.utilities.removeAllEventHandlers(grid_element);
				
				// Empty the asset picker of any previous assets
				$(grid_element).empty();
				
				// If an "Add" button should be displayed in the asset picker...
				if (show_add_button)
				{
					
					// Add Texture button...
					if (assets == Assets.textures)
					{
						
						// Initialize a new Add Texture button element for the texture picker UI
						$(grid_element).append('<div class="editor-selected-objects-materials-texture-cell d-flex"><span class="m-auto fs-1" data-bs-title="Import Texture..." data-bs-toggle="tooltip" data-bs-placement="bottom"><i class="bi bi-plus-lg"></i></span></div>');
						
						// Texture element click event
						$('.editor-selected-objects-materials-texture-image').on('click', function()
						{
							
							// Import a texture from an image file
							Editor.importTexture();
							
							// Update the list of assets in the asset picker
							Game.ui.editor.updateAssetPicker(assets, dropdown_element, grid_element, show_add_button);
							
						});
						
					}
					
				}
				
				// Generate asset list by iterating through every asset file path...
				for (let [key, asset] of Object.entries(assets))
				{
					
					// Skip if asset file path is empty...
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
					
					// Check if the current asset belongs to the selected asset folder...
					if ($(dropdown_element).find(':selected').val() == value)
					{
						
						// Initialize texture picker elements...
						if (assets == Assets.textures)
						{
							
							// Initialize a new texture element for the texture picker UI
							$(grid_element).append('<div class="editor-selected-objects-materials-texture-cell"><img src="' + asset.path + '" class="editor-selected-objects-materials-texture-image img-fluid" alt="' + key + '" data-bs-title="' + key + '" data-bs-toggle="tooltip" data-bs-placement="bottom"></div>');
							
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
							
							
						} // Initialize object picker elements...
						else if (assets == Assets.objects)
						{
							
							// Initialize a new prefab object thumbnail for the spawn tool UI
							$(grid_element).append($('<div id="editor-spawn-cell-' + key + '" class="editor-spawn-cell" data-bs-title="' + key + '" data-bs-toggle="tooltip" data-bs-placement="bottom"></div>'));
							Assets.createObjectThumbnail(Assets.objects[key].deepClone(), $('#editor-spawn-cell-' + key));
							
							// Prefab object thumbnail element click event
							$('#editor-spawn-cell-' + key).on('click', () => {
								
								// If a primitive object's thumbnail was clicked...
								if (asset.path.startsWith("./objects/primitives/"))
								{
									
									// Hide the spawn objects panel
									$('#editor-spawn-panel-objects').hide();
									
									// Initialize a new primitive object thumbnail for the selected primitive's spawn panel UI
									$('#editor-spawn-panel-' + key + '-thumbnail').append($('<div id="editor-spawn-primitive-' + key + '" class="editor-spawn-cell" data-bs-title="Spawn ' + key + '." data-bs-toggle="tooltip" data-bs-placement="top"></div>'));
									Assets.createObjectThumbnail(asset.deepClone(), $('#editor-spawn-primitive-' + key));
									
									// Show the selected primitive's spawn panel UI
									$('#editor-spawn-panel-' + key).show();
									$('#editor-spawn-panel-' + key + '-close').show();
									
									// Primitive object element click event
									$('#editor-spawn-primitive-' + key).on('click', () => {
										
										// Spawn primitive
										Editor.spawn(Assets.objects["primitive_" + key].deepClone());
										
									});
									
									// Primitive spawn panel close button click event
									$('#editor-spawn-panel-' + key + '-close').on('click', () => {
										
										// Hide the selected primitive's spawn panel UI
										$('#editor-spawn-panel-' + key).hide();
										
										// Stop animating the selected primitive's spawn panel UI thumbnail
										Assets.objectThumbnailStopAnimating($('#editor-spawn-primitive-' + key).attr("animation_id")).then(() => {
											
											// Remove the primitive object thumbnail
											$('#editor-spawn-primitive-' + key).remove();
											
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
								
								// Refresh all UI tooltips
								Game.ui.refreshTooltips();
								
							});
							
						}
						
					}
					
				}
				
				// Show the spawn objects panel
				$('#editor-spawn-panel-objects').show();
				
				// Refresh all UI tooltips
				Game.ui.refreshTooltips();
				
			}
			
		//#endregion
		
		
	//#endregion
	
	
	//#region [Event Handlers]
		
		
		//#region [Editor Main Menu]
			
			
			//#region [World Options]
				
				/**
				 * Editor world name text change event.
				 */
				$('#editor-world-name').on('change', function()
				{
						
					// Set world name
					Game.world.name = $('#editor-world-name').val();
						
				});
				
				/**
				 * Editor world new button click event.
				 */
				$('#editor-world-new').on('click', function()
				{
						
					// Create a new empty world
					Editor.newWorld();
						
				});
				
				/**
				 * Editor world load button click event.
				 */
				$('#editor-world-load').on('click', function()
				{
						
					// Load a world from a JSON file
					Editor.loadWorld();
						
				});
				
				/**
				 * Editor world save button click event.
				 */
				$('#editor-world-save').on('click', function()
				{
						
					// Save the selected world as a JSON file
					Editor.saveWorld();
						
				});
				
				/**
				 * Editor world save button click event.
				 */
				$('#editor-world-triggers').on('click', function()
				{
						
					// TODO: Show global events trigger editor.
						
				});
				
			//#endregion
			
			
			//#region [Camera Modes]
				
				/**
				 * Editor walk mode button click event.
				 */
				$('#editor-camera-walk').on('click', function()
				{
					
					// Get editor camera mode selected checkbox value
					let selected_value = $(this).val();
					
					// Walk Mode
					if (selected_value === 'walk')
					{
						
						// Enable/disable noclip
						if ($(this).is(':checked'))
						{
							
							// Noclip disabled
							Game.player.noclip = false;
							
						}
						else
						{
							
							// Noclip enabled
							Game.player.noclip = true;
							
						}
						
					}
					
				});
				
			//#endregion
			
			
			//#region [Object Selection Types]
				
				/**
				 * Editor object selection type selected radio button change event.
				 */
				$('input[type="radio"][name="editor-select-types"]').on('change', function()
				{
					
					// Get editor object selection type selected radio button value
					Editor.selection_mode = parseInt($(this).val());
					
					// Reset all highlighted or selected objects, faces, and vertices
					Editor.resetHighlightedAndSelectedObjectsFacesVertices();
					
					// Change object selection type mode based on selected radio button value
					if (Editor.selection_mode === Editor.SelectionModes.Objects)
					{
						// Do nothing.
					}
					else if (Editor.selection_mode === Editor.SelectionModes.Faces)
					{
						// Do nothing.
					}
					else if (Editor.selection_mode === Editor.SelectionModes.Vertices)
					{
						Game.player.controls.transform_controls.setMode('translate');
					}
					
					// Update the editor selected objects UI
					Game.ui.editor.updateSelectedObjectsWindow();
					
				});
				
				/**
				 * Editor terrain selection button click event.
				 */
				$('#editor-select-terrain').on('click', function(event)
				{
					
					// Enable/disable terrain selection
					if ($(this).is(':checked'))
					{
						
						// Terrain selection enabled
						Editor.resetHighlightedAndSelectedObjectsFacesVertices();
						Editor.select_terrain = true;
						
					}
					else
					{
						
						// Terrain selection disabled
						Editor.resetHighlightedAndSelectedObjectsFacesVertices();
						Editor.select_terrain = false;
						
					}
					
					// Prevent this event from triggering parent element click events
					event.stopPropagation();
					
				});
				
			//#endregion
			
			
			//#region [Tools]
				
				/**
				* 
				*/
				$('#editor-tool-selected').on('change', function()
				{
					
					// 
					if ($(this).prop('checked'))
					{
						
						// 
						$('#editor-selected-objects').show();
						
					}
					else
					{
						
						// 
						$('#editor-selected-objects').hide();
						
					}
					
				});
				
				/**
				* 
				*/
				$('#editor-tool-spawn').on('change', function()
				{
					
					// 
					if ($(this).prop('checked'))
					{
						
						// 
						$('#editor-spawn-tool').show();
						
						if (Editor.spawn_tool == Editor.SpawnTools.Objects)
						{
							
							// Enable spawn objects tool
							$('#editor-spawn-objects').prop('checked', true);
							$('#editor-spawn-objects').trigger('change');
							
						}
						if (Editor.spawn_tool == Editor.SpawnTools.NPCs)
						{
							// Do nothing.
						}
						if (Editor.spawn_tool == Editor.SpawnTools.Walls)
						{
							// Do nothing.
						}
						else if (Editor.spawn_tool == Editor.SpawnTools.Terrain)
						{
							
							// Enable spawn terrain tool
							$('#editor-spawn-terrain').prop('checked', true);
							$('#editor-spawn-terrain').trigger('change');
							
						}
						
					}
					else
					{
						
						// 
						$('#editor-spawn-tool').hide();
						
					}
					
				});
				
			//#endregion
			
			
		//#endregion
		
		
		//#region [Selected Objects Window]
			
			
			//#region [Selected Objects General]
				
				
				//#region [Save Objects]
					
					/**
					 * Editor selected objects save dialog prefab name change event.
					 */
					$('#editor-selected-objects-save-modal-prefab-name').on('input', function()
					{
						
						// Get prefab name
						const prefab_name = $('#editor-selected-objects-save-modal-prefab-name').val();
						
						// Pre-fill file name and path with prefab name
						$('#editor-selected-objects-save-modal-objects-name').val(prefab_name);
						$('#editor-selected-objects-save-modal-objects-path').val('./objects/' + prefab_name + '.json');
						
						// Validate prefab name length to enable/disable save button
						if (prefab_name.length > 0)
						{
							$('#editor-selected-objects-save-modal-prefab-save').prop('disabled', false);
						}
						else
						{
							$('#editor-selected-objects-save-modal-prefab-save').prop('disabled', true);
						}
						
						// Check if prefab already exists by name and warn user
						if (Assets.objects.hasOwnProperty(prefab_name))
						{
							$('#editor-selected-objects-save-modal-prefab-name-warning').html('You already have a prefab with the name "' + prefab_name + '".<br />The reference to it in your prefabs library will be overwritten if you continue.');
						}
						else
						{
							$('#editor-selected-objects-save-modal-prefab-name-warning').html('');
						}
						
					});
					
					/**
					 * Editor selected objects save dialog save prefab button click event.
					 */
					$('#editor-selected-objects-save-modal-prefab-save').on('click', function()
					{
						
						// Save prefab to a JSON file
						Editor.saveSelectedObjects($('#editor-selected-objects-save-modal-prefab-name').val());
						
						// Update UI to show save success confirmations
						$('#editor-selected-objects-save-modal-prefab-save-checkbox').removeClass();
						$('#editor-selected-objects-save-modal-prefab-save-checkbox').addClass('bi bi-check-lg');
						
						$('#editor-selected-objects-save-modal-prefab-save-checkbox-bg').removeClass();
						$('#editor-selected-objects-save-modal-prefab-save-checkbox-bg').addClass('badge text-success-emphasis bg-success-subtle border border-success-subtle float-end');
						
						// Validate objects.json path length to enable/disable save button
						if ($('#editor-selected-objects-save-modal-objects-path').val().length > 0)
						{
							$('#editor-selected-objects-save-modal-objects-save').prop('disabled', false);
						}
						else
						{
							$('#editor-selected-objects-save-modal-objects-save').prop('disabled', true);
						}
						
					});
					
					/**
					 * Editor selected objects save dialog objects.json path change event.
					 */
					$('#editor-selected-objects-save-modal-objects-path').on('input', function(event)
					{
						
						// Validate objects.json path length to enable/disable save button
						if ($('#editor-selected-objects-save-modal-objects-path').val().length > 0)
						{
							$('#editor-selected-objects-save-modal-objects-save').prop('disabled', false);
						}
						else
						{
							$('#editor-selected-objects-save-modal-objects-save').prop('disabled', true);
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
							if (event)
							{
								editable_value = event.originalEvent.data || '';
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
					$('#editor-selected-objects-save-modal-objects-save').on('click', function()
					{
						
						// Add the saved prefab's file path to the object paths array
						Assets.paths_objects[$('#editor-selected-objects-save-modal-objects-name').val()] = $('#editor-selected-objects-save-modal-objects-path').val();
						
						// Save the updated object paths array to the objects.json file
						Assets.saveObjectPaths();
						
						// Update UI to show save success confirmations
						$('#editor-selected-objects-save-modal-objects-save-checkbox').removeClass();
						$('#editor-selected-objects-save-modal-objects-save-checkbox').addClass('bi bi-check-lg');
						
						$('#editor-selected-objects-save-modal-objects-save-checkbox-bg').removeClass();
						$('#editor-selected-objects-save-modal-objects-save-checkbox-bg').addClass('badge text-success-emphasis bg-success-subtle border border-success-subtle float-end');
						
					});
					
					/**
					 * Editor selected objects modal hide event.
					 */
					$('#editor-selected-objects-save-modal').on('hidden.bs.modal', function()
					{
						
						// If both the prefab and the objects.json file have been saved...
						if ($('#editor-selected-objects-save-modal-objects-save-checkbox').hasClass('bi bi-check-lg'))
						{
							
							// Reset all fields in the selected objects save dialog
							$('#editor-selected-objects-save-modal-prefab-name').val('');
							
							$('#editor-selected-objects-save-modal-objects-name').val('');
							$('#editor-selected-objects-save-modal-objects-path').val('');
							
							$('#editor-selected-objects-save-modal-prefab-name-warning').html('');
							
							$('#editor-selected-objects-save-modal-prefab-save-checkbox').removeClass();
							$('#editor-selected-objects-save-modal-prefab-save-checkbox').addClass('bi bi-dash-lg');
							
							$('#editor-selected-objects-save-modal-prefab-save-checkbox-bg').removeClass();
							$('#editor-selected-objects-save-modal-prefab-save-checkbox-bg').addClass('badge text-warning-emphasis bg-warning-subtle border border-warning-subtle float-end');
							
							$('#editor-selected-objects-save-modal-objects-save-checkbox').removeClass();
							$('#editor-selected-objects-save-modal-objects-save-checkbox').addClass('bi bi-dash-lg');
							
							$('#editor-selected-objects-save-modal-objects-save-checkbox-bg').removeClass();
							$('#editor-selected-objects-save-modal-objects-save-checkbox-bg').addClass('badge text-warning-emphasis bg-warning-subtle border border-warning-subtle float-end');
							
							$('#editor-selected-objects-save-modal-prefab-save').prop('disabled', true);
							$('#editor-selected-objects-save-modal-objects-save').prop('disabled', true);
							
						}
						
					})
					
				//#endregion
				
				
				//#region [Cut/Copy/Paste Objects]
					
					/**
					 * Editor selected objects cut button click event.
					 */
					$('#editor-selected-objects-cut').on('click', function()
					{
						
						// Cut selected objects
						Editor.cutSelectedObjects();
						
					});
					
					/**
					 * Editor selected objects copy button click event.
					 */
					$('#editor-selected-objects-copy').on('click', function()
					{
						
						// Copy selected objects
						Editor.copySelectedObjects();
						
					});
					
					/**
					 * Editor clipboard objects paste button click event.
					 */
					$('#editor-selected-objects-paste').on('click', function()
					{
						
						// Paste clipboard objects
						Editor.pasteClipboardObjects();
						
					});
					
				//#endregion
				
				
				//#region [Delete Objects]
					
					/**
					 * Editor selected objects delete button click event.
					 */
					$('#editor-selected-objects-delete').on('click', function()
					{
						
						// Delete selected objects
						Editor.deleteSelectedObjects();
						
					});
					
				//#endregion
				
				
				//#region [Group/Ungroup Objects]
					
					/**
					 * Editor selected objects group button click event.
					 */
					$('#editor-selected-objects-group').on('click', function()
					{
						
						// Group selected objects
						Editor.groupSelectedObjects();
						
					});
					
					/**
					 * Editor selected objects ungroup button click event.
					 */
					$('#editor-selected-objects-ungroup').on('click', function()
					{
						
						// Ungroup selected objects
						Editor.ungroupSelectedObjects();
						
					});
					
				//#endregion
				
				
			//#endregion
			
			
			//#region [Selected Objects Transforms]
				
				
				//#region [Selected Objects Transform Types]
				
					/**
					 * Editor selected objects transform type selected radio button change event.
					 */
					$('input[type="radio"][name="editor-selected-objects-transforms"]').on('change', function()
					{
						
						// Get editor selected objects transform type selected radio button value
						let selected_value = $(this).val();
						
						// Hide all transform controls
						$('#editor-selected-objects-transform-position').hide();
						$('#editor-selected-objects-transform-scale').hide();
						$('#editor-selected-objects-transform-rotation').hide();
						
						// Change player transform controls mode based on selected radio button value
						if (selected_value === 'position')
						{
							
							// Translate mode
							Game.player.controls.transform_controls.setMode('translate');
							
							// Show translate controls
							$('#editor-selected-objects-transform-position').show();
							
						}
						else if (selected_value === 'scale')
						{
							
							// Scale mode
							Game.player.controls.transform_controls.setMode('scale');
							
							// Show scale controls
							$('#editor-selected-objects-transform-scale').show();
							
						}
						else if (selected_value === 'rotation')
						{
							
							// Rotate mode
							Game.player.controls.transform_controls.setMode('rotate');
							
							// Show rotation controls
							$('#editor-selected-objects-transform-rotation').show();
							
						}
						
						// Update the editor selected objects UI
						Game.ui.editor.updateSelectedObjectsWindow();
						
					});
					
				//#endregion
				
				
				//#region [Selected Objects Position]
					
					/**
					 * Editor selected objects position grid snap change event.
					 */
					$('#editor-selected-objects-transform-position-snap').on('change', function()
					{
						
						const snap_amount = parseFloat(this.value);
						
						if (!$('#editor-selected-objects-transform-position-snap-checkbox').prop('checked') || !snap_amount)
						{
							Game.player.controls.transform_controls.translationSnap = Game.player.controls.transform_controls.scaleSnap = null;
							$('#editor-selected-objects-transform-scale-snap').val('');
							
							return;
						}
						
						Game.player.controls.transform_controls.translationSnap = snap_amount;
						
						let scale_snap = 0.01;
						const object = Game.player.controls.transform_controls.object;
						
						if (object)
						{
							
							const box   = new THREE.Box3().setFromObject(object);
							const size  = new THREE.Vector3();
							box.getSize(size);
							const half  = size.multiplyScalar(0.5);
							
							switch (Game.player.controls.transform_controls.axis?.charAt(0))
							{
								case 'X':
									scale_snap = snap_amount / half.x;
									break;
								case 'Y':
									scale_snap = snap_amount / half.y;
									break;
								case 'Z':
									scale_snap = snap_amount / half.z;
									break;
								default:
									scale_snap = snap_amount / Math.max(half.x, half.y, half.z);
							}
							
						}
						
						Game.player.controls.transform_controls.scaleSnap = scale_snap;
						$('#editor-selected-objects-transform-scale-snap').val(scale_snap.toFixed(4));
						
					});
					
					/**
					 * Editor selected objects position grid snap checkbox change event.
					 */
					$('#editor-selected-objects-transform-position-snap-checkbox').on('change', function()
					{
						
						// Check if position grid snap is enabled
						if ($(this).prop('checked'))
						{
							
							// Set position grid snap
							Game.player.controls.transform_controls.translationSnap = $('#editor-selected-objects-transform-position-snap').val();
							
						}
						else
						{
							
							// Disable position grid snap
							Game.player.controls.transform_controls.translationSnap = null;
							
						}
						
					});
					
					/**
					 * Editor selected objects position X-axis change event.
					 */
					$('#editor-selected-objects-transform-position-x').on('change', function()
					{
							
						// Set selected objects X-axis position
						Editor.selected_objects.position.x = $('#editor-selected-objects-transform-position-x').val();
							
					});
					
					/**
					 * Editor selected objects position Y-axis change event.
					 */
					$('#editor-selected-objects-transform-position-y').on('change', function()
					{
						
						// Set selected objects Y-axis position
						Editor.selected_objects.position.y = $('#editor-selected-objects-transform-position-y').val();
						
					});
					
					/**
					 * Editor selected objects position Z-axis change event.
					 */
					$('#editor-selected-objects-transform-position-z').on('change', function()
					{
						
						// Set selected objects Z-axis position
						Editor.selected_objects.position.z = $('#editor-selected-objects-transform-position-z').val();
						
					});
					
				//#endregion
				
				
				//#region [Selected Objects Scale]
					
					/**
					 * Editor selected objects scale grid snap change event.
					 */
					$('#editor-selected-objects-transform-scale-snap').on('change', function()
					{
						
						const snap_amount = parseFloat(this.value);
						
						if (!$('#editor-selected-objects-transform-scale-snap-checkbox').prop('checked') || !snap_amount)
						{
							Game.player.controls.transform_controls.scaleSnap = Game.player.controls.transform_controls.translationSnap = null;
							$('#editor-selected-objects-transform-position-snap').val('');
							
							return;
						}
						
						Game.player.controls.transform_controls.scaleSnap = snap_amount;
						
						let translation_snap = 0.01;
						const object = Game.player.controls.transform_controls.object;
						
						if (object)
						{
							
							const size = new THREE.Vector3();
							new THREE.Box3().setFromObject(object).getSize(size);
							size.multiplyScalar(0.5);
							
							const axis = (Game.player.controls.transform_controls.axis || '').charAt(0);
							switch (axis)
							{
								case 'X':
									translation_snap = snap_amount * size.x;
									break;
								case 'Y':
									translation_snap = snap_amount * size.y;
									break;
								case 'Z':
									translation_snap = snap_amount * size.z;
									break;
								default:
									translation_snap = snap_amount * Math.max(size.x, size.y, size.z);
							}
							
						}
						
						Game.player.controls.transform_controls.translationSnap = translation_snap;
						$('#editor-selected-objects-transform-position-snap').val(translation_snap.toFixed(4));
						
					});
					
					/**
					 * Editor selected objects scale grid snap checkbox change event.
					 */
					$('#editor-selected-objects-transform-scale-snap-checkbox').on('change', function()
					{
						
						// Check if scale grid snap is enabled
						if ($(this).prop('checked'))
						{
							
							// Set scale grid snap
							Game.player.controls.transform_controls.scaleSnap = $('#editor-selected-objects-transform-scale-snap').val();
							
						}
						else
						{
							
							// Disable scale grid snap
							Game.player.controls.transform_controls.scaleSnap = null;
							
						}
						
					});
					
					/**
					 * Editor selected objects scale X-axis change event.
					 */
					$('#editor-selected-objects-transform-scale-x').on('change', function()
					{
						
						// Set selected objects X-axis scale 
						Editor.selected_objects.scale.x = $('#editor-selected-objects-transform-scale-x').val().slice(0, -1) / 100;
						
					});
					
					/**
					 * Editor selected objects scale Y-axis change event.
					 */
					$('#editor-selected-objects-transform-scale-y').on('change', function()
					{
						
						// Set selected objects Y-axis scale 
						Editor.selected_objects.scale.y = $('#editor-selected-objects-transform-scale-y').val().slice(0, -1) / 100;
						
					});
					
					/**
					 * Editor selected objects scale Z-axis change event.
					 */
					$('#editor-selected-objects-transform-scale-z').on('change', function()
					{
						
						// Set selected objects Z-axis scale 
						Editor.selected_objects.scale.z = $('#editor-selected-objects-transform-scale-z').val().slice(0, -1) / 100;
						
					});
					
				//#endregion
				
				
				//#region [Selected Objects Rotation]
					
					/**
					 * Editor selected objects rotation grid snap change event.
					 */
					$('#editor-selected-objects-transform-rotation-snap').on('change', function()
					{
						
						// Check if rotation grid snap is enabled
						if ($('#editor-selected-objects-transform-rotation-snap-checkbox').prop('checked'))
						{
							
							// Set rotation grid snap
							Game.player.controls.transform_controls.rotationSnap = $('#editor-selected-objects-transform-rotation-snap').val();
							
						}
						
					});
					
					/**
					 * Editor selected objects rotation grid snap checkbox change event.
					 */
					$('#editor-selected-objects-transform-rotation-snap-checkbox').on('change', function()
					{
						
						// Check if rotation grid snap is enabled
						if ($(this).prop('checked'))
						{
							
							// Set rotation grid snap
							Game.player.controls.transform_controls.rotationSnap = $('#editor-selected-objects-transform-rotation-snap').val();
							
						}
						else
						{
							
							// Disable rotation grid snap
							Game.player.controls.transform_controls.rotationSnap = null;
							
						}
						
					});
					
					/**
					 * Editor selected objects rotation X-axis change event.
					 */
					$('#editor-selected-objects-transform-rotation-x').on('change', function()
					{
						
						// Set selected objects X-axis rotation by converting the input degrees to radians
						Editor.selected_objects.rotation.x = $('#editor-selected-objects-transform-rotation-x').val().slice(0, -1) * (Math.PI / 180);
						
					});
					
					/**
					 * Editor selected objects rotation Y-axis change event.
					 */
					$('#editor-selected-objects-transform-rotation-y').on('change', function()
					{
						
						// Set selected objects Y-axis rotation by converting the input degrees to radians
						Editor.selected_objects.rotation.y = $('#editor-selected-objects-transform-rotation-y').val().slice(0, -1)  * (Math.PI / 180);
						
					});
					
					/**
					 * Editor selected objects rotation Z-axis change event.
					 */
					$('#editor-selected-objects-transform-rotation-z').on('change', function()
					{
						
						// Set selected objects Z-axis rotation by converting the input degrees to radians
						Editor.selected_objects.rotation.z = $('#editor-selected-objects-transform-rotation-z').val().slice(0, -1)  * (Math.PI / 180);
						
					});
					
				//#endregion
				
				
			//#endregion
			
			
			//#region [Selected Objects Materials]
				
				
				//#region [Material Colour Picker]
					
					/**
					 * Editor selected objects colour picker input event.
					 */
					$('#editor-selected-objects-materials-selected-colour').on('input', function()
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
						$('#editor-selected-objects-materials-texture-reset-button').on('click', function()
						{
							
							// Get hex string of the editor's default spawned object colour
							const selected_colour = '#' + Editor.spawned_object_colour.toString(16);
							
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
		
		
		//#region [Spawn Tool]
			
			/**
			 * Editor spawn tool type selected radio button change event.
			 */
			$('input[type="radio"][name="editor-spawn-types"]').on('change', function()
			{
				
				// Get editor spawn tool type selected radio button value
				Editor.spawn_tool = parseInt($(this).val());
				
				// Hide all editor tool panels
				$('[id^="editor-spawn-panel-"]').hide();
				$('#editor-spawn-object-categories').hide();
				$('#editor-spawn-terrain-tools').hide();
				
				// Stop object thumbnails from animating
				Assets.objectThumbnailsStopAnimating();
				
				// Spawn Objects
				if (Editor.spawn_tool === Editor.SpawnTools.Objects)
				{
					
					// Show the spawn objects panel
					$('#editor-spawn-panel-objects').show();
					$('#editor-spawn-object-categories').show();
					
					// Enable object selection mode
					$('#editor-select-objects').prop('checked', true);
					$('#editor-select-objects').trigger('change');
					
					// Disable terrain selection mode
					if (Editor.select_terrain)
					{
						$('#editor-select-terrain').trigger('click');
					}
					
					// Update spawn objects tool UI
					Game.ui.editor.updateSpawnToolWindow();
					
					
				} // Spawn NPCs
				else if (Editor.spawn_tool === Editor.SpawnTools.NPCs)
				{
					
					// Show the spawn npcs panel
					$('#editor-spawn-panel-npcs').show();
					
					
				} // Spawn Walls
				else if (Editor.spawn_tool === Editor.SpawnTools.Walls)
				{
					
					// Show the spawn walls panel
					$('#editor-spawn-panel-walls').show();
					
					
				} // Spawn Terrain
				else if (Editor.spawn_tool === Editor.SpawnTools.Terrain)
				{
					
					// Show the spawn terrain panel
					$('#editor-spawn-terrain-tools').show();
					$('#editor-spawn-panel-terrain').show();
					
					// Enable vertex selection mode
					$('#editor-select-vertices').prop('checked', true);
					$('#editor-select-vertices').trigger('change');
					
					// Enable terrain selection mode
					if (!Editor.select_terrain)
					{
						$('#editor-select-terrain').trigger('click');
					}
					
				}
				
			});
			
			/**
			 * Editor spawn tool mouse wheel scroll event.
			 */
			$('#editor-spawn-tool-container').on('wheel', function(event)
			{
				
				// Scroll the spawn tool horizontally based on the mouse wheel scroll amount
				if (Math.abs(event.originalEvent.deltaY) > 0)
				{
					event.preventDefault();
					$('#editor-spawn-tool-scroll').scrollLeft($('#editor-spawn-tool-scroll').scrollLeft() + event.originalEvent.deltaY);
				}
				
			});
			
			
			//#region [Spawn Primitive Objects]
				
				/**
				 * Editor spawn tool primitive object attribute text change event.
				 */
				$('[id^="editor-spawn-"]').on('change', function()
				{
					
					// Get name of primitive object to be spawned
					let primitive_name = $(this).attr('id').split('-')[3];
					let primitive_object = null;
					
					// Cube
					if (primitive_name == 'cube')
					{
						
						// Get field values
						let width = $('#editor-spawn-cube-width').val();
						let height = $('#editor-spawn-cube-height').val();
						let depth = $('#editor-spawn-cube-depth').val();
						
						let width_segments = $('#editor-spawn-cube-width-segments').val();
						let height_segments = $('#editor-spawn-cube-height-segments').val();
						let depth_segments = $('#editor-spawn-cube-depth-segments').val();
						
						// Initialize object
						primitive_object = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth, width_segments, height_segments, depth_segments), new THREE.MeshBasicMaterial({ color: Editor.spawned_object_colour }));
						
						
					} // Sphere
					else if (primitive_name == 'sphere')
					{
						
						// Get field values
						let diameter = $('#editor-spawn-sphere-diameter').val();
						let radius = diameter / 2;
						
						let width_segments = $('#editor-spawn-sphere-width-segments').val();
						let height_segments = $('#editor-spawn-sphere-height-segments').val();
						
						// Initialize object
						primitive_object = new THREE.Mesh(new THREE.SphereGeometry(radius, width_segments, height_segments), new THREE.MeshBasicMaterial({ color: Editor.spawned_object_colour }));
						
						
					} // Cylinder
					else if (primitive_name == 'cylinder')
					{
						
						// Get field values
						let diameter_top = $('#editor-spawn-cylinder-top-diameter').val();
						let radius_top = diameter_top / 2;
						
						let diameter_bottom = $('#editor-spawn-cylinder-bottom-diameter').val();
						let radius_bottom = diameter_bottom / 2;
						
						let height = $('#editor-spawn-cylinder-height').val();
						let radial_segments = $('#editor-spawn-cylinder-radial-segments').val();
						let height_segments = $('#editor-spawn-cylinder-height-segments').val();
						
						// Initialize object
						primitive_object = new THREE.Mesh(new THREE.CylinderGeometry(radius_top, radius_bottom, height, radial_segments, height_segments), new THREE.MeshBasicMaterial({ color: Editor.spawned_object_colour }));
						
						
					} // Cone
					else if (primitive_name == 'cone')
					{
						
						// Get field values
						let diameter = $('#editor-spawn-cone-diameter').val();
						let radius = diameter / 2;
						
						let height = $('#editor-spawn-cone-height').val();
						let radial_segments = $('#editor-spawn-cone-radial-segments').val();
						let height_segments = $('#editor-spawn-cone-height-segments').val();
						
						// Initialize object
						primitive_object = new THREE.Mesh(new THREE.ConeGeometry(radius, height, radial_segments, height_segments), new THREE.MeshBasicMaterial({ color: Editor.spawned_object_colour }));
						
						
					} // Torus
					else if (primitive_name == 'torus')
					{
						
						// Get field values
						let diameter = $('#editor-spawn-torus-diameter').val();
						let radius = diameter / 2;
						
						let diameter_tube = $('#editor-spawn-torus-tube-diameter').val();
						let radius_tube = diameter_tube / 2;
						
						let radial_segments = $('#editor-spawn-torus-radial-segments').val();
						let tubular_segments = $('#editor-spawn-torus-tubular-segments').val();
						
						// Initialize object
						primitive_object = new THREE.Mesh(new THREE.TorusGeometry(radius, radius_tube, radial_segments, tubular_segments), new THREE.MeshBasicMaterial({ color: Editor.spawned_object_colour }));
						
						
					} // Plane
					else if (primitive_name == 'plane')
					{
						
						// Get field values
						let width = $('#editor-spawn-plane-width').val();
						let height = $('#editor-spawn-plane-height').val();
						
						let width_segments = $('#editor-spawn-plane-width-segments').val();
						let height_segments = $('#editor-spawn-plane-height-segments').val();
						
						// Initialize object
						primitive_object = new THREE.Mesh(new THREE.PlaneGeometry(width, height, width_segments, height_segments), new THREE.MeshBasicMaterial({ color: Editor.spawned_object_colour, side: THREE.DoubleSide }));
						
						
					} // Circle
					else if (primitive_name == 'circle')
					{
						
						// Get field values
						let diameter = $('#editor-spawn-circle-diameter').val();
						let radius = diameter / 2;
						
						let segments = $('#editor-spawn-circle-segments').val();
						
						// Initialize object
						primitive_object = new THREE.Mesh(new THREE.CircleGeometry(radius, segments), new THREE.MeshBasicMaterial({ color: Editor.spawned_object_colour, side: THREE.DoubleSide }));
						
						
					} // Ring
					else if (primitive_name == 'ring')
					{
						
						// Get field values
						let inner_diameter = $('#editor-spawn-ring-inner-diameter').val();
						let inner_radius = inner_diameter / 2;
						
						let outer_diameter = $('#editor-spawn-ring-outer-diameter').val();
						let outer_radius = outer_diameter / 2;
						
						let radial_segments = $('#editor-spawn-ring-radial-segments').val();
						let height_segments = $('#editor-spawn-ring-height-segments').val();
						
						// Initialize object
						primitive_object = new THREE.Mesh(new THREE.RingGeometry(inner_radius, outer_radius, radial_segments, height_segments), new THREE.MeshBasicMaterial({ color: Editor.spawned_object_colour, side: THREE.DoubleSide }));
						
					}
					
					// Replace primitive object in assets
					if (primitive_object != null)
					{
						primitive_object.path = '';
						Assets.objects['primitive_' + primitive_name] = primitive_object;
					}
					
				});
				
			//#endregion
			
			
			//#region [Terrain Tool]
				
				/**
				 * Editor selected objects transform type selected radio button change event.
				 */
				$('input[type="radio"][name="editor-terrain-shape"]').on('change', function()
				{
					
					// Get terrain tool shape selected radio button value
					Editor.terrain_tool = parseInt($(this).val());
					
				});
				
				/**
				 * Editor selected objects position X-axis change event.
				 */
				$('#editor-terrain-radius').on('change', function()
				{
						
					// Set selected objects X-axis position
					Editor.terrain_tool_select_vertex_radius = $('#editor-terrain-radius').val();
						
				});
				
			//#endregion
			
			
		//#endregion
		
		
	//#endregion
	
}