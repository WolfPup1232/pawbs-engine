// three.js Imports
import * as THREE from '../libraries/threejs/three.js';

// Class Imports
import Billboard from '../classes/billboard.class.js';

// Static Class Imports
import Editor from '../classes/editor.class.js';

/**
 * Initializes the Editor UI event handlers.
 *
 * @param {World} world The current game world.
 * @param {Player} player The player editing the game world.
 */
export default function initializeEditorUIEventHandlers(world, player)
{
	
	//#region [Editor Title Window]
	
	/**
	* Editor world name text change event.
	*/
	$("#editor-world-name").change(function()
	{
		if (Editor.enabled)
		{
			
			// Set world name
			world.name = $("#editor-world-name").val();
			
		}
	});
	
	//#endregion
	
	
	//#region [Editor New/Load/Save World]
	
	/**
	* Editor world new button click event.
	*/
	$("#editor-world-new").click(function()
	{
		if (Editor.enabled)
		{
			
			// Create a new empty world
			Editor.newWorld(world, player);
			
		}
	});
	
	/**
	* Editor world load button click event.
	*/
	$("#editor-world-load").click(function()
	{
		if (Editor.enabled)
		{
			
			// Load a world from a JSON file
			Editor.loadWorld(world, player);
			
		}
	});
	
	/**
	* Editor world save button click event.
	*/
	$("#editor-world-save").click(function()
	{
		if (Editor.enabled)
		{
			
			// Save the selected world as a JSON file
			Editor.saveWorld(world, player);
			
		}
	});
	
	//#endregion
	
	
	//#region [Editor Spawn Objects]
	
	/**
	* Editor world spawn billboard button click event.
	*/
	$("#editor-world-geometry-billboard").click(function()
	{
		if (Editor.enabled)
		{
			
			// Spawn a new billboard
			Editor.spawn(Billboard, world, player)
			
		}
	});
	
	/**
	* Editor world spawn plane button click event.
	*/
	$("#editor-world-geometry-plane").click(function()
	{
		if (Editor.enabled)
		{
			
			// Spawn a new plane
			Editor.spawn(THREE.PlaneGeometry, world, player)
			
		}
	});
	
	/**
	* Editor world spawn box button click event.
	*/
	$("#editor-world-geometry-box").click(function()
	{
		if (Editor.enabled)
		{
			
			// Spawn a new box
			Editor.spawn(THREE.BoxGeometry, world, player)
			
		}
	});
	
	/**
	* Editor world spawn cylinder button click event.
	*/
	$("#editor-world-geometry-cylinder").click(function()
	{
		if (Editor.enabled)
		{
			
			// Spawn a new cylinder
			Editor.spawn(THREE.CylinderGeometry, world, player)
			
		}
	});
	
	/**
	* Editor world spawn sphere button click event.
	*/
	$("#editor-world-geometry-sphere").click(function()
	{
		if (Editor.enabled)
		{
			
			// Spawn a new sphere
			Editor.spawn(THREE.SphereGeometry, world, player)
			
		}
	});
	
	//#endregion
	
	
	//#region [Editor Object Selection Types]

	/**
	* Editor object selection type selected radio button change event.
	*/
	$('input[type="radio"][name="editor-world-select-types"]').change(function()
	{
		if (Editor.enabled)
		{
		
			// Get editor object selection type selected radio button value
			let selected_value = $(this).val();
			
			// Disable all selection type modes
			Editor.select_objects = false;
			Editor.select_faces = false;
			Editor.select_vertices = false;
			
			Editor.resetHighlightedObjects();
			Editor.resetSelectedObjects(world, player);
			
			Editor.resetHighlightedAndSelectedFaces(world, player);
			
			Editor.resetHighlightedVertices();
			Editor.resetSelectedVertices(world, player);
			
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
			
			// Update the editor selected object UI
			Editor.updateSelectedObjectsUI(player);
			
		}
		
	});
	
	//#endregion
	
	
	//#region [Editor Selected Object Window]
	
	/**
	* Editor selected objects cut button click event.
	*/
	$("#editor-selected-objects-cut").click(function()
	{
		if (Editor.enabled)
		{
			
			// Cut selected objects
			Editor.cutSelectedObjects(world, player);
			
		}
	});
	
	/**
	* Editor selected objects copy button click event.
	*/
	$("#editor-selected-objects-copy").click(function()
	{
		if (Editor.enabled)
		{
			
			// Copy selected objects
			Editor.copySelectedObjects();
			
		}
	});
	
	/**
	* Editor clipboard objects paste button click event.
	*/
	$("#editor-selected-objects-paste").click(function()
	{
		if (Editor.enabled)
		{
			
			// Paste clipboard objects
			Editor.pasteClipboardObjects(world, player);
			
		}
	});
	
	/**
	* Editor selected objects delete button click event.
	*/
	$("#editor-selected-objects-delete").click(function()
	{
		if (Editor.enabled)
		{
			
			// Delete selected objects
			Editor.deleteSelectedObjects(world, player);
			
		}
	});
	
	/**
	* Editor selected objects group button click event.
	*/
	$("#editor-selected-objects-group").click(function()
	{
		if (Editor.enabled)
		{
			
			// Group selected objects
			Editor.groupSelectedObjects(world, player);
			
		}
	});
	
	/**
	* Editor selected objects ungroup button click event.
	*/
	$("#editor-selected-objects-ungroup").click(function()
	{
		if (Editor.enabled)
		{
			
			// Ungroup selected objects
			Editor.ungroupSelectedObjects(world, player);
			
		}
	});
	
	//#endregion
	
	
	//#region [Editor Selected Object Transform Types]
	
	/**
	* Editor selected objects transform type selected radio button change event.
	*/
	$('input[type="radio"][name="editor-selected-objects-transforms"]').change(function()
	{
		if (Editor.enabled)
		{
		
			// Get editor selected object transform type selected radio button value
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
			
			// Update the editor selected object UI
			Editor.updateSelectedObjectsUI(player);
			
		}
		
	});
	
	//#endregion
	
	
	//#region [Editor Selected Object Position]
	
	/**
	* Editor selected object position grid snap change event.
	*/
	$("#editor-selected-objects-transform-position-snap").change(function()
	{
		if (Editor.enabled)
		{
			
			// Check if position grid snap is enabled
			if ($("#editor-selected-objects-transform-position-snap-checkbox").prop("checked"))
			{
				
				// Set position grid snap
				player.controls.transform_controls.translationSnap = $("#editor-selected-objects-transform-position-snap").val();
				
			}
			
		}
	});
	
	/**
	* Editor selected object position grid snap checkbox change event.
	*/
	$("#editor-selected-objects-transform-position-snap-checkbox").change(function()
	{
		if (Editor.enabled)
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
			
		}
	});
	
	/**
	* Editor selected object position X-axis change event.
	*/
	$("#editor-selected-objects-transform-position-x").change(function()
	{
		if (Editor.enabled)
		{
			
			// Set selected object X-axis position
			Editor.selected_objects.position.x = $("#editor-selected-objects-transform-position-x").val();
			
		}
	});
	
	/**
	* Editor selected object position Y-axis change event.
	*/
	$("#editor-selected-objects-transform-position-y").change(function()
	{
		if (Editor.enabled)
		{
			
			// Set selected object Y-axis position
			Editor.selected_objects.position.y = $("#editor-selected-objects-transform-position-y").val();
			
		}
	});
	
	/**
	* Editor selected object position Z-axis change event.
	*/
	$("#editor-selected-objects-transform-position-z").change(function()
	{
		if (Editor.enabled)
		{
			
			// Set selected object Z-axis position
			Editor.selected_objects.position.z = $("#editor-selected-objects-transform-position-z").val();
			
		}
	});
	
	//#endregion
	
	
	//#region [Editor Selected Object Scale]
	
	/**
	* Editor selected object scale grid snap change event.
	*/
	$("#editor-selected-objects-transform-scale-snap").change(function()
	{
		if (Editor.enabled)
		{
			
			// Check if scale grid snap is enabled
			if ($("#editor-selected-objects-transform-scale-snap-checkbox").prop("checked"))
			{
				
				// Set scale grid snap
				player.controls.transform_controls.scaleSnap = $("#editor-selected-objects-transform-scale-snap").val();
				
			}
			
		}
	});
	
	/**
	* Editor selected object scale grid snap checkbox change event.
	*/
	$("#editor-selected-objects-transform-scale-snap-checkbox").change(function()
	{
		if (Editor.enabled)
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
			
		}
	});
	
	/**
	* Editor selected object scale X-axis change event.
	*/
	$("#editor-selected-objects-transform-scale-x").change(function()
	{
		if (Editor.enabled)
		{
			
			// Set selected object X-axis scale 
			Editor.selected_objects.scale.x = $("#editor-selected-objects-transform-scale-x").val().slice(0, -1) / 100;
			
		}
	});
	
	/**
	* Editor selected object scale Y-axis change event.
	*/
	$("#editor-selected-objects-transform-scale-y").change(function()
	{
		if (Editor.enabled)
		{
			
			// Set selected object Y-axis scale 
			Editor.selected_objects.scale.y = $("#editor-selected-objects-transform-scale-y").val().slice(0, -1) / 100;
			
		}
	});
	
	/**
	* Editor selected object scale Z-axis change event.
	*/
	$("#editor-selected-objects-transform-scale-z").change(function()
	{
		if (Editor.enabled)
		{
			
			// Set selected object Z-axis scale 
			Editor.selected_objects.scale.z = $("#editor-selected-objects-transform-scale-z").val().slice(0, -1) / 100;
			
		}
	});
	
	//#endregion
	
	
	//#region [Editor Selected Object Rotation]
	
	/**
	* Editor selected object rotation grid snap change event.
	*/
	$("#editor-selected-objects-transform-rotation-snap").change(function()
	{
		if (Editor.enabled)
		{
			
			// Check if rotation grid snap is enabled
			if ($("#editor-selected-objects-transform-rotation-snap-checkbox").prop("checked"))
			{
				
				// Set rotation grid snap
				player.controls.transform_controls.rotationSnap = $("#editor-selected-objects-transform-rotation-snap").val();
				
			}
			
		}
	});
	
	/**
	* Editor selected object rotation grid snap checkbox change event.
	*/
	$("#editor-selected-objects-transform-rotation-snap-checkbox").change(function()
	{
		if (Editor.enabled)
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
			
		}
	});
	
	/**
	* Editor selected object rotation X-axis change event.
	*/
	$("#editor-selected-objects-transform-rotation-x").change(function()
	{
		if (Editor.enabled)
		{
			
			// Set selected object X-axis rotation by converting the input degrees to radians
			Editor.selected_objects.rotation.x = $("#editor-selected-objects-transform-rotation-x").val().slice(0, -1) * (Math.PI / 180);
			
		}
	});
	
	/**
	* Editor selected object rotation Y-axis change event.
	*/
	$("#editor-selected-objects-transform-rotation-y").change(function()
	{
		if (Editor.enabled)
		{
			
			// Set selected object Y-axis rotation by converting the input degrees to radians
			Editor.selected_objects.rotation.y = $("#editor-selected-objects-transform-rotation-y").val().slice(0, -1)  * (Math.PI / 180);
			
		}
	});
	
	/**
	* Editor selected object rotation Z-axis change event.
	*/
	$("#editor-selected-objects-transform-rotation-z").change(function()
	{
		if (Editor.enabled)
		{
			
			// Set selected object Z-axis rotation by converting the input degrees to radians
			Editor.selected_objects.rotation.z = $("#editor-selected-objects-transform-rotation-z").val().slice(0, -1)  * (Math.PI / 180);
			
		}
	});
	
	//#endregion
	
	
	//#region [Editor Selected Object Materials]
	
	/**
	* Editor selected object colour picker input event.
	*/
	$("#editor-selected-objects-materials-selected-colour").on('input', function()
	{
		if (Editor.enabled)
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
			
		}
	});
	
	/**
	* Editor selected object texture reset button click event.
	*/
	$("#editor-selected-objects-materials-texture-reset-button").click(function()
	{
		if (Editor.enabled)
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
			
		}
	});
	
	//#endregion
	
}