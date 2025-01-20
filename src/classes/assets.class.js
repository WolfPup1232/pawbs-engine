// three.js Imports
import * as THREE from '../libraries/threejs/three.js';
import { CustomObjectLoader } from '../libraries/threejs/modules/CustomObjectLoader.js';
import { CustomOutlineEffect } from '../libraries/threejs/modules/CustomOutlineEffect.js';

// Static Class Imports
import Editor from './editor.class.js';

/**
 * A collection of in-game assets.
 */
class Assets
{
	
	//#region [Class Declarations]
		
		
		//#region [Asset Path Lists]
			
			/**
			 * Texture file paths.
			 */
			static paths_textures = {};
			
			/**
			 * Object file paths.
			 */
			static paths_objects = {};
			
		//#endregion
		
		
		//#region [Game Asset Lists]
			
			/**
			 * The list of textures loaded by the game.
			 */
			static textures = {};
			
			/**
			 * The list of object prefabs loaded by the game.
			 */
			static objects = {};
			
			/**
			 * The list of worlds loaded by the game.
			 */
			static worlds = {};
			
		//#endregion
		
		
	//#endregion
	
	
	//#region [Private Class Declarations]
		
		/**
		 * List of active object thumbnail animation IDs.
		 */
		static #object_thumbnail_animations = [];
		
		/**
		 * Flag to stop all object thumbnail animations.
		 */
		static #object_thumbnails_stop_animating = false;
		
		/**
		 * Flag to stop specific object thumbnail animation.
		 */
		static #object_thumbnail_stop_animating_id = null;
		
	//#endregion
	
	
	//#region [Constructor]
		
		/**
		 * Initializes the collection of in-game assets.
		 */
		static { }
		
	//#endregion
	
	
	//#region [Methods]
		
		/**
		 * Loads all game assets from the textures, objects, and worlds JSON files.
		 *
		 * @param {Function} callback The callback function which is invoked when all assets have been loaded.
		 */
		static load(callback)
		{
			
			// Load textures
			fetch('./textures/textures.json').then((response) => response.json()).then((texture_paths) => { this.loadTextures(texture_paths, () => {
				
				// Load objects
				fetch('./objects/objects.json').then((response) => response.json()).then((object_paths) => { this.loadObjects(object_paths, () => {
					
					// Load worlds
					fetch('./worlds/worlds.json').then((response) => response.json()).then((world_paths) => { this.loadWorlds(world_paths, () => {
						
						// Perform the next step using the callback function
						callback();
						
					}); }).catch(error => {
						
						// Error loading worlds
						console.error("Error loading ./world/worlds.json: ", error);
						
					});
					
				}); }).catch(error => {
					
					// Error loading objects
					console.error("Error loading ./objects/objects.json: ", error);
					
				});
				
			}); }).catch(error => {
				
				// Error loading textures
				console.error("Error loading ./textures/textures.json: ", error);
				
			});
		}
		
		
		//#region [Textures]
			
			/**
			 * Initializes the game textures list according to the list of textures in the textures.json file.
			 *
			 * @param {Object} texture_paths The key/value pair list of texture names and their associated paths loaded from the textures.json file.
			 * @param {Function} callback The callback function which is invoked when all textures have been loaded.
			 */
			static loadTextures(texture_paths, callback)
			{
				
				// Initialize texture loader
				let texture_loader = new THREE.TextureLoader();
				
				// Get list of texture paths
				this.paths_textures = texture_paths;
				
				// Get all keys (texture names) from the list of texture paths
				const texture_keys = Object.keys(texture_paths);
				
				// Load each texture
				texture_keys.forEach((key) => {
					texture_loader.load(texture_paths[key], (texture) => {
						
						// Add texture path to loaded texture
						texture.path = texture_paths[key];
						
						// Store loaded texture by name
						this.textures[key] = texture;
						
					},
					undefined, // No onProgress callback
					(error) => {
						
						// Error loading texture
						console.error("Error loading texture: ", error);
						
					});
					
				});
				
				// All textures are loaded, now perform the next step using the callback function
				callback();
				
			}
			
			/**
			 * Saves the list of textures to an updated textures.json file.
			 */
			static saveTexturePaths()
			{
				
				// Create a temporary link element to trigger a save file dialog
				let link = document.createElement('a');
				
				// Serialize the texture path list contents to an object URL for download
				link.href = URL.createObjectURL(new Blob([JSON.stringify(this.paths_textures, null, 4)], { type: "application/json" }));
				
				// Set the download file name
				link.download = "textures.json";
				
				// Append the link element to the document body
				document.body.appendChild(link);
				
				// Trigger the save file dialog
				link.click();
				
				// Remove the link element from the document body
				document.body.removeChild(link);
				
			}
			
		//#endregion
		
		
		//#region [Objects]
			
			/**
			 * Initializes the game objects list according to the list of objects in the objects.json file.
			 *
			 * @param {Object} object_paths The key/value pair list of object names and their associated paths loaded from the object.json file.
			 * @param {Function} callback The callback function which is invoked when all objects have been loaded.
			 */
			static loadObjects(object_paths, callback)
			{
				
				// Initialize object loader
				let object_loader = new CustomObjectLoader();
				
				// Get list of object paths
				this.paths_objects = object_paths;
				
				// Get all keys (object names) from the list of object paths
				const object_keys = Object.keys(object_paths);
				
				// Load each object
				object_keys.forEach((key) => {
					object_loader.load(object_paths[key], (object) => {
						
						// Add object path to loaded object
						object.path = object_paths[key];
						
						// Store loaded object by name
						this.objects[key] = object;
						
					},
					undefined, // No onProgress callback
					(error) => {
						
						// Error loading object
						console.error("Error loading object: ", error);
						
					});
					
				});
				
				// Initialize primitive objects
				let object_cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1, 1, 1, 1), new THREE.MeshBasicMaterial({ color: Editor.spawned_object_colour }));
				object_cube.path = "./objects/primitives/cube.json";
				this.objects["cube"] = object_cube;
				
				let object_sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 10), new THREE.MeshBasicMaterial({ color: Editor.spawned_object_colour }));
				object_sphere.path = "./objects/primitives/sphere.json";
				this.objects["sphere"] = object_sphere;
				
				let object_cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 10, 1), new THREE.MeshBasicMaterial({ color: Editor.spawned_object_colour }));
				object_cylinder.path = "./objects/primitives/cylinder.json";
				this.objects["cylinder"] = object_cylinder;
				
				let object_cone = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1, 10, 1), new THREE.MeshBasicMaterial({ color: Editor.spawned_object_colour }));
				object_cone.path = "./objects/primitives/cone.json";
				this.objects["cone"] = object_cone;
				
				let object_torus = new THREE.Mesh(new THREE.TorusGeometry(0.375, 0.1875, 10, 10), new THREE.MeshBasicMaterial({ color: Editor.spawned_object_colour }));
				object_torus.path = "./objects/primitives/torus.json";
				this.objects["torus"] = object_torus;
				
				let object_plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), new THREE.MeshBasicMaterial({ color: Editor.spawned_object_colour, side: THREE.DoubleSide }));
				object_plane.path = "./objects/primitives/plane.json";
				this.objects["plane"] = object_plane;
				
				let object_circle = new THREE.Mesh(new THREE.CircleGeometry(0.5, 10), new THREE.MeshBasicMaterial({ color: Editor.spawned_object_colour, side: THREE.DoubleSide }));
				object_circle.path = "./objects/primitives/circle.json";
				this.objects["circle"] = object_circle;
				
				let object_ring = new THREE.Mesh(new THREE.RingGeometry(0.25, 0.5, 10, 1), new THREE.MeshBasicMaterial({ color: Editor.spawned_object_colour, side: THREE.DoubleSide }));
				object_ring.path = "./objects/primitives/ring.json";
				this.objects["ring"] = object_ring;
				
				// Initialize primitive object clones for their corresponding thumbnails, blank paths so they don't load in the asset browser
				this.objects["primitive_cube"] = object_cube.deepClone();
				this.objects["primitive_cube"].path = "";
				
				this.objects["primitive_sphere"] = object_sphere.deepClone();
				this.objects["primitive_sphere"].path = "";
				
				this.objects["primitive_cylinder"] = object_cylinder.deepClone();
				this.objects["primitive_cylinder"].path = "";
				
				this.objects["primitive_cone"] = object_cone.deepClone();
				this.objects["primitive_cone"].path = "";
				
				this.objects["primitive_torus"] = object_torus.deepClone();
				this.objects["primitive_torus"].path = "";
				
				this.objects["primitive_plane"] = object_plane.deepClone();
				this.objects["primitive_plane"].path = "";
				
				this.objects["primitive_circle"] = object_circle.deepClone();
				this.objects["primitive_circle"].path = "";
				
				this.objects["primitive_ring"] = object_ring.deepClone();
				this.objects["primitive_ring"].path = "";
				
				// All objects are loaded, now perform the next step using the callback function
				callback();
				
			}
			
			/**
			 * Saves the list of objects to an updated objects.json file.
			 */
			static saveObjectPaths()
			{
				
				// Create a temporary link element to trigger a save file dialog
				let link = document.createElement('a');
				
				// Serialize the object path list contents to an object URL for download
				link.href = URL.createObjectURL(new Blob([JSON.stringify(this.paths_objects, null, 4)], { type: "application/json" }));
				
				// Set the download file name
				link.download = "objects.json";
				
				// Append the link element to the document body
				document.body.appendChild(link);
				
				// Trigger the save file dialog
				link.click();
				
				// Remove the link element from the document body
				document.body.removeChild(link);
				
			}
			
		//#endregion
		
		
		//#region [Worlds]
			
			/**
			 * Initializes the game worlds list according to the list of worlds in the worlds.json file.
			 *
			 * @param {Object} world_paths The key/value pair list of world names and their associated paths loaded from the worlds.json file.
			 * @param {Function} callback The callback function which is invoked when all worlds have been loaded.
			 */
			static loadWorlds(world_paths, callback)
			{
				
				// Get list of worlds
				this.worlds = world_paths;
				
				// All worlds are loaded, now perform the next step using the callback function
				callback();
				
			}
			
			/**
			 * Saves the list of worlds to an updated worlds.json file.
			 */
			static saveWorldPaths()
			{
				
				// Create a temporary link element to trigger a save file dialog
				let link = document.createElement('a');
				
				// Serialize the texture path list contents to an object URL for download
				link.href = URL.createObjectURL(new Blob([JSON.stringify(this.worlds, null, 4)], { type: "application/json" }));
				
				// Set the download file name
				link.download = "worlds.json";
				
				// Append the link element to the document body
				document.body.appendChild(link);
				
				// Trigger the save file dialog
				link.click();
				
				// Remove the link element from the document body
				document.body.removeChild(link);
				
			}
			
		//#endregion
		
		
		//#region [Object Thumbnails]
			
			/**
			 * Initializes an animated thumbnail for the specified object inside of the specified HTML DOM element using a three.js renderer.
			 *
			 * @param {THREE.Object3D} object The object to be rendered in an animated thumbnail.
			 * @param {Element} cell The ID of the HTML DOM grid cell element which will contain the object thumbnail.
			 */
			static createObjectThumbnail(object, cell)
			{
				
				// Get thumbnail's container DOM element
				const container = cell;
				
				// Initialize three.js renderer and add it to the thumbnail's container
				const renderer = new THREE.WebGLRenderer();
				renderer.setSize(container.width(), container.height());
				container.append(renderer.domElement);
				
				// Initialize cel shader effect
				const effect = new CustomOutlineEffect(renderer, { defaultThickness: 0.032 });
				
				// Initialize three.js scene and add object to it
				const scene = new THREE.Scene();
				scene.background = new THREE.Color(0xffffff);
				scene.add(object);
				
				// Initialize camera
				const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
				
				// Calculate sizes for camera placement
				const box = new THREE.Box3().setFromObject(object);
				const size = box.getSize(new THREE.Vector3());
				const center = box.getCenter(new THREE.Vector3());
				const diagonal_size = Math.sqrt(size.x * size.x + size.y * size.y + size.z * size.z);
				
				// Calculate object distance from camera
				let object_distance = 0;
				if (object.geometry && object.geometry.boundingSphere)
				{
					object_distance = ((object.geometry.boundingSphere.radius / 2) * 5.5) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
				}
				else
				{
					object_distance = (diagonal_size * 1.1) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
				}
				
				// Calculate position of camera based on a 33.75-degree angle (in radians)
				const angle = THREE.MathUtils.degToRad(28.125);
				const camera_y = object_distance * Math.sin(angle);
				const camera_z = object_distance * Math.cos(angle);
				const quaternion = new THREE.Quaternion().setFromRotationMatrix(object.matrixWorld);
				const offset = new THREE.Vector3(0, camera_y, camera_z).applyQuaternion(quaternion);
				
				// Set camera position relative to object's center
				camera.position.set(center.x + offset.x, center.y + offset.y, center.z + offset.z);
				camera.lookAt(center);
				camera.updateProjectionMatrix();
				
				// Initialize new animation ID to track active thumbnail animations and add it to the HTML DOM element and the array of active thumbnail animations
				const animation_id = THREE.MathUtils.generateUUID();
				container.attr("animation_id", animation_id);
				this.#object_thumbnail_animations.push(animation_id);
				
				// Animate object thumbnail
				this.objectThumbnailAnimate(animation_id, effect, scene, camera, object);
				
			}
			
			/**
			 * Animates one frame of the object thumbnail.
			 *
			 * @param {string} animation_id The ID of the active thumbnail animation.
			 * @param {THREE.WebGLRenderer} renderer The three.js renderer displaying the object thumbnail.
			 * @param {THREE.Scene} scene The three.js scene containing the object and camera to use during object thumbnail rendering.
			 * @param {THREE.PerspectiveCamera} camera The three.js camera used to render the object thumbnail.
			 * @param {THREE.Object3D} object The three.js object to be rendered.
			 * @param {boolean} single_frame Flag which determines whether or not to render only one single frame of animation for the thumbnail.
			 */
			static objectThumbnailAnimate(animation_id, renderer, scene, camera, object, single_frame = false)
			{
				
				// Get animation request ID and set animation loop callback
				const request_id = requestAnimationFrame(() => this.objectThumbnailAnimate(animation_id, renderer, scene, camera, object));
				
				// Rotate object slightly
				object.rotation.y += 0.01;
				
				// Render thumbnail
				renderer.render(scene, camera);
				
				// Check if animation stop flag is enabled...
				if (this.#object_thumbnails_stop_animating || this.#object_thumbnail_stop_animating_id == animation_id || single_frame)
				{
					
					// Remove animation ID from array of active thumbnail animations
					this.#object_thumbnail_animations.splice(this.#object_thumbnail_animations.indexOf(animation_id), 1);
					
					// Stop animating
					cancelAnimationFrame(request_id);
					
				}
				
			}
			
			/**
			 * Stops all thumbnail animations.
			 */
			static async objectThumbnailsStopAnimating()
			{
				
				// Enable animation stop flag
				this.#object_thumbnails_stop_animating = true;
				
				// Wait until all animations are stopped to reset the animation stop flag
				return await new Promise((resolve) => {
					const interval = setInterval(() => {
						
						// If there are no active animations...
						if (this.#object_thumbnail_animations.length == 0)
						{
							
							// Reset animation stop flag
							this.#object_thumbnails_stop_animating = false;
							
							// Animating has stopped
							clearInterval(interval);
							resolve();
							
						}
						
					}, 100);
				});
				
			}
			
			/**
			 * Stops the specified thumbnail animation.
			 *
			 * @param {string} animation_id The ID of the thumbnail animation to be stopped.
			 */
			static async objectThumbnailStopAnimating(animation_id)
			{
				
				// Enable animation stop flag
				this.#object_thumbnail_stop_animating_id = animation_id;
				
				// Wait until specified animation is stopped to reset the animation stop flag
				return await new Promise((resolve) => {
					const interval = setInterval(() => {
						
						// If the specified animation is no longer active...
						if (!this.#object_thumbnail_animations.includes(animation_id))
						{
							
							// Reset animation stop flag
							this.#object_thumbnail_stop_animating_id = null;
							
							// Animation has stopped
							clearInterval(interval);
							resolve();
							
						}
						
					}, 100);
				});
				
			}
			
		//#endregion
		
		
	//#endregion
	
}
export default Assets;