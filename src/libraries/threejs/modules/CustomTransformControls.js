// three.js Imports
import {
	Box3,
	BoxGeometry,
	BufferGeometry,
	Color,
	CylinderGeometry,
	DoubleSide,
	Euler,
	Float32BufferAttribute,
	Line,
	LineBasicMaterial,
	Matrix4,
	Mesh,
	MeshBasicMaterial,
	Object3D,
	OctahedronGeometry,
	PlaneGeometry,
	Quaternion,
	SphereGeometry,
	TorusGeometry,
	Vector3
} from "../three.js";

// Static Class Imports
import Game from "../../../classes/game.class.js";
import Multiplayer from "../../../classes/multiplayer.class.js";


//#region [Global Declarations]
	
	
	//#region [Event Objects]
		
		/**
		 * Event fired whenever the transform controls have changed.
		 */
		const change_event = { type: "change" };
		
		/**
		 * Event fired when the user presses the mouse button on a gizmo axis.
		 */
		const mouse_down_event = { type: "mouseDown" };
		
		/**
		 * Event fired when the user releases the mouse button after dragging.
		 */
		const mouse_up_event = { type: "mouseUp", mode: null };
		
		/**
		 * Event fired when the attached object has been modified.
		 */
		const object_change_event = { type: "objectChange" };
		
	//#endregion


	//#region [Constants]
		
		/**
		 * Small epsilon to guard against divide-by-zero during scale calculations.
		 */
		const EPSILON = 1e-6;
		
		/**
		 * Minimum scale value to prevent objects from becoming too small.
		 */
		const MIN_SCALE = 1e-3;
		
		/**
		 * Maximum scale value to prevent objects from becoming too large.
		 */
		const MAX_SCALE = 1e3;
		
		/**
		 * Default gain factor for uniform XYZ scaling sensitivity.
		 */
		const XYZ_SCALE_GAIN_DEFAULT = 0.25;
		
		/**
		 * Default dead zone for uniform XYZ scaling to prevent jitter.
		 */
		const XYZ_SCALE_DEADZONE_DEFAULT = 0.01;
		
		/**
		 * Threshold for hiding axis handles when nearly parallel to camera view.
		 */
		const AXIS_HIDE_THRESHOLD = 0.99;
		
		/**
		 * Threshold for hiding planar handles when nearly edge-on to camera.
		 */
		const PLANE_HIDE_THRESHOLD = 0.2;
		
		/**
		 * Threshold for flipping axis direction based on camera orientation.
		 */
		const AXIS_FLIP_THRESHOLD = 0.0;
		
	//#endregion


	//#region [Shared State Variables]
		
		
		//#region [Attached Object]
			
			/**
			 * Attached object's bounding box extents in local space.
			 */
			const object_extents = new Vector3();
			
			/**
			 * Attached object's bounding box half-extents in local space.
			 */
			const object_half_extents = new Vector3();
			
			/**
			 * Attached object's position in world space.
			 */
			const object_position_world = new Vector3();
			
			/**
			 * Attached object's position in world space at drag start.
			 */
			const object_position_world_at_drag_start = new Vector3();
			
			/**
			 * Attached object's quaternion in world space.
			 */
			const object_quaternion_world = new Quaternion();
			
			/**
			 * Attached object's quaternion in world space at drag start.
			 */
			const object_quaternion_world_at_drag_start = new Quaternion();
			
			/**
			 * Attached object's inverse quaternion in world space.
			 */
			const object_inverse_quaternion_world = new Quaternion();
			
			/**
			 * Attached object's scale in world space.
			 */
			const object_scale_world = new Vector3();
			
			/**
			 * Attached object's scale in world space at drag start.
			 */
			const object_scale_world_at_drag_start = new Vector3();
			
			/**
			 * Attached object's position in local space at drag start.
			 */
			const object_position_local_at_drag_start = new Vector3();
			
			/**
			 * Attached object's quaternion in local space at drag start.
			 */
			const object_quaternion_local_at_drag_start = new Quaternion();
			
			/**
			 * Attached object's inverse quaternion in local space at drag start.
			 */
			const object_inverse_quaternion_local_at_drag_start = new Quaternion();
			
			/**
			 * Attached object's scale in local space at drag start.
			 */
			const object_scale_local_at_drag_start = new Vector3();
			
			/**
			 * Attached object's axis of rotation.
			 */
			const object_rotation_axis = new Vector3();
			
			/**
			 * Attached object's rotation amount.
			 */
			let object_rotation_angle = 0;
			
		//#endregion
		
		
		//#region [Parent Object]
			
			/**
			 * Attached object's parent object position in world space.
			 */
			const parent_position_world = new Vector3();
			
			/**
			 * Attached object's parent object quaternion in world space.
			 */
			const parent_quaternion_world = new Quaternion();
			
			/**
			 * Attached object's parent object inverse quaternion in world space.
			 */
			const parent_inverse_quaternion_world = new Quaternion();
			
			/**
			 * Attached object's parent object scale in world space.
			 */
			const parent_scale_world = new Vector3();
			
		//#endregion
		
		
		//#region [Camera]
			
			/**
			 * Player's camera position in world space.
			 */
			const camera_position_world = new Vector3();
			
			/**
			 * Player's camera quaternion in world space.
			 */
			const camera_quaternion_world = new Quaternion();
			
			/**
			 * Player's camera scale in world space.
			 */
			const camera_scale_world = new Vector3();
			
			/**
			 * Player's camera view direction vector pointing from the camera to the object.
			 */
			const camera_view_direction = new Vector3();
			
		//#endregion
		
		
		//#region [Raycaster]
			
			/**
			 * Player's raycaster intersection point position in world space, recorded at drag start.
			 */
			const intersection_point_start = new Vector3();
			
			/**
			 * Player's current raycaster intersection point position in world space.
			 */
			const intersection_point_world_current = new Vector3();
			
			/**
			 * Player's last-known raycaster intersection point position in world space.
			 */
			const intersection_point_end = new Vector3();
			
			/**
			 * Offset between player raycaster's intersection point start and end positions in world space.
			 */
			const intersection_point_offset = new Vector3();
			
			/**
			 * Normalized direction of the player's raycaster at drag start.
			 */
			const raycaster_direction_at_drag_start = new Vector3();
			
			/**
			 * Last-known normalized direction of the player's raycaster while dragging.
			 */
			const raycaster_direction_last = new Vector3();
			
		//#endregion
		
		
	//#endregion
	
	
//#endregion


/**
 * A custom modification of the three.js TransformControls example code.
 */
class CustomTransformControls extends Object3D
{
	
	//#region [Class Declarations / Constructor]
		
		/**
		 * Initializes the transform controls gizmo and interaction plane.
		 *
		 * @param {THREE.Camera} camera The player's camera.
		 * @param {Document} dom_document A reference to the DOM document within the web browser window.
		 */
		constructor(camera, dom_document)
		{
			
			// Initialization
			
			// Call parent Object3D constructor
			super();
			
			// Initialize visibility and DOM document
			this.visible = false;
			this.dom_document = dom_document;
			
			
			// Class Declarations
			
			/**
			 * Type check flag for instances of the transform controls.
			 */
			this.is_transform_controls = true;
			
			/**
			 * The current axis end-cap which was grabbed at drag start.
			 */
			this.axis_active_cap_at_drag_start = 0;
			
			/**
			 * The last desired scale ratio used for damping large scale changes between frames.
			 */
			this.last_desired_ratio = null;
			
			/**
			 * Flag to skip scale clamping and damping for end-cap handles to preserve perfect follow behavior.
			 */
			this.skip_scale_clamp = false;
			
			/**
			 * Custom transform controls gizmo object.
			 */
			this.gizmo = new CustomTransformControlsGizmo();
			this.add(this.gizmo);
			
			/**
			 * Custom transform controls interaction plane object.
			 */
			this.plane = new CustomTransformControlsPlane();
			this.add(this.plane);
			
			/**
			 * Reference to this custom transform controls object for property definition closures.
			 */
			const scope = this;
			
			
			// Property Definitions
			
			/**
			 * Defines a mirrored property on the controls, gizmo, and plane.
			 *
			 * @param {string} prop_name The property name.
			 * @param {*} default_value The default value.
			 */
			function defineProperty(prop_name, default_value)
			{
				
				// Set new property's default value
				let prop_value = default_value;
				
				// Add new property to object...
				Object.defineProperty(scope, prop_name, {
					get: function ()
					{
						
						// Get property value from custom transform controls object
						return prop_value !== undefined ? prop_value : default_value;
						
					},
					set: function (value)
					{
						
						// If the new value is different from the old value...
						if (prop_value !== value)
						{
							
							// Set property's new value on custom transform controls object
							prop_value = value;
							
							// Also share the new value with correspondingly-named properties on both child objects
							scope.plane[prop_name] = value;
							scope.gizmo[prop_name] = value;
							
							// Dispatch a "propertyChanged" event just in case anything's listening for it
							scope.dispatchEvent({ type: prop_name + "Changed", value: value });
							scope.dispatchEvent(change_event);
						}
					}
				});
				
				scope[prop_name] = default_value;
				scope.plane[prop_name] = default_value;
				scope.gizmo[prop_name] = default_value;
				
			}
			
			// Define properties with getters/setters - setting a property triggers a change event, and defined properties are passed down to the gizmo and plane
			defineProperty("camera", camera);
			defineProperty("object", undefined);
			defineProperty("enabled", true);
			defineProperty("axis", null);
			defineProperty("mode", "translate");
			defineProperty("translation_snap", null);
			defineProperty("rotation_snap", null);
			defineProperty("scale_snap", null);
			defineProperty("space", "world");
			defineProperty("size", 1);
			defineProperty("dragging", false);
			defineProperty("show_x", true);
			defineProperty("show_y", true);
			defineProperty("show_z", true);
			defineProperty("world_position", object_position_world);
			defineProperty("world_position_start", object_position_world_at_drag_start);
			defineProperty("world_quaternion", object_quaternion_world);
			defineProperty("world_quaternion_start", object_quaternion_world_at_drag_start);
			defineProperty("camera_position", camera_position_world);
			defineProperty("camera_quaternion", camera_quaternion_world);
			defineProperty("point_start", intersection_point_start);
			defineProperty("point_end", intersection_point_end);
			defineProperty("rotation_axis", object_rotation_axis);
			defineProperty("rotation_angle", object_rotation_angle);
			defineProperty("eye", camera_view_direction);
			
		}
		
	//#endregion
	
	
	//#region [Methods]
		
		/**
		 * Updates key transformation variables, then calls Object3D.updateMatrixWorld().
		 */
		updateMatrixWorld()
		{
			
			// If an object is attached to the transform controls...
			if (this.object !== undefined)
			{
				
				// Update the attached object's matrix
				this.object.updateMatrixWorld();
				
				// If the attached object has a parent...
				if (this.object.parent !== null)
				{
					
					// Extract the parent's world matrix into separate variables
					this.object.parent.matrixWorld.decompose(parent_position_world, parent_quaternion_world, parent_scale_world);
					
				}
				
				// Extract the attached object's world matrix into separate variables
				this.object.matrixWorld.decompose(object_position_world, object_quaternion_world, object_scale_world);
				
				// Get parent object and world space inverse quaternions
				parent_inverse_quaternion_world.copy(parent_quaternion_world).invert();
				object_inverse_quaternion_world.copy(object_quaternion_world).invert();
				
			}
			
			// Update camera world transform and extract its world matrix into separate variables
			this.camera.updateMatrixWorld();
			this.camera.matrixWorld.decompose(camera_position_world, camera_quaternion_world, camera_scale_world);
			
			// Eye vector points from object to camera
			camera_view_direction.copy(camera_position_world).sub(object_position_world).normalize();
			
			// Call base update implementation
			super.updateMatrixWorld();
			
		}
		
		/**
		 * Handles hover interactions for axis highlighting.
		 */
		mouseHover()
		{
			
			// If no object is attached to the transform controls, or a drag is in progress, abort...
			if (this.object === undefined || this.dragging === true)
			{
				return;
			}
			
			// Cast a ray from the player's position in the direction the player is looking
			Game.player.raycaster.ray.origin.copy(Game.player.position);
			Game.player.raycaster.ray.direction.set(0, 0, -1).applyQuaternion(Game.player.quaternion);
			Game.player.raycaster.near = 0;
			Game.player.raycaster.far = Infinity;
			
			// Check for any intersections with the gizmo picker for the current mode, and if an axis was hit, get its name...
			const intersect = this.intersectObjectWithRay(this.gizmo.picker[this.mode], Game.player.raycaster);
			if (intersect)
			{
				this.axis = intersect.object.name;
			}
			else // Otherwise, if no axis was hit...
			{
				this.axis = null;
			}
			
		}
		
		/**
		 * Begins a drag interaction on the current axis/mode.
		 */
		mouseDown()
		{
			
			// If no object is attached to the transform controls, or a drag is in progress, or mouse is not down, abort...
			if (this.object === undefined || this.dragging === true || Game.player.controls.mouse_left_down == false)
			{
				return;
			}
			
			// If a gizmo axis is currently active...
			if (this.axis !== null)
			{
				
				// Cast a ray from the player's position in the direction the player is looking
				Game.player.raycaster.ray.origin.copy(Game.player.position);
				Game.player.raycaster.ray.direction.set(0, 0, -1).applyQuaternion(Game.player.quaternion);
				Game.player.raycaster.near = 0;
				Game.player.raycaster.far = Infinity;
				
				// Check for any intersections with the interaction plane...
				const plane_intersect = this.intersectObjectWithRay(this.plane, Game.player.raycaster, true);
				if (plane_intersect)
				{
					
					// Get player's raycaster intersection point
					intersection_point_world_current.copy(plane_intersect.point);
					intersection_point_end.copy(plane_intersect.point).sub(object_position_world_at_drag_start);
					
					// Resolve working space based on mode/axis
					const space = this.resolveTransformSpace(this.mode, this.axis);
					
					// If rotating in local space, optionally snap to increments
					if (space === "local" && this.mode === "rotate" && this.rotation_snap)
					{
						if (this.axis === "X")
						{
							this.object.rotation.x = this.applySnap(this.object.rotation.x, this.rotation_snap);
						}
						if (this.axis === "Y")
						{
							this.object.rotation.y = this.applySnap(this.object.rotation.y, this.rotation_snap);
						}
						if (this.axis === "Z")
						{
							this.object.rotation.z = this.applySnap(this.object.rotation.z, this.rotation_snap);
						}
					}
					
					// Get attached object's world transforms at drag start
					this.object.updateMatrixWorld();
					if (this.object.parent)
					{
						this.object.parent.updateMatrixWorld();
						
						this.object.parent.getWorldQuaternion(new Quaternion());
						parent_inverse_quaternion_world.copy(new Quaternion()).invert();
						this.object.parent.getWorldScale(parent_scale_world);
					}
					else
					{
						parent_inverse_quaternion_world.identity();
						parent_scale_world.set(1, 1, 1);
					}
					this.object.matrixWorld.decompose(object_position_world_at_drag_start, object_quaternion_world_at_drag_start, object_scale_world_at_drag_start);
					object_inverse_quaternion_world.copy(object_quaternion_world_at_drag_start).invert();
					
					// Get attached object's local transforms at drag start
					object_position_local_at_drag_start.copy(this.object.position);
					object_quaternion_local_at_drag_start.copy(this.object.quaternion);
					object_inverse_quaternion_local_at_drag_start.copy(this.object.quaternion).invert();
					object_scale_local_at_drag_start.copy(this.object.scale);
					
					// Get local space half-extents so we can convert scale-ratios to distance
					const object_box3 = new Box3();
					object_box3.setFromObject(this.object);
					const object_matrix4 = new Matrix4();
					object_matrix4.copy(this.object.matrixWorld).invert();
					object_box3.applyMatrix4(object_matrix4);
					object_box3.getSize(object_extents);
					object_box3.getSize(object_half_extents).multiplyScalar(0.5);
					
					// Reset per-drag damping state for the mouseMove limiter
					this.last_desired_ratio = 1;
					
					// Get the currently active end-cap which was grabbed at start
					if (this.axis && this.axis.endsWith("_POS"))
					{
						this.axis_active_cap_at_drag_start = +1;
					}
					else if (this.axis && this.axis.endsWith("_NEG"))
					{
						this.axis_active_cap_at_drag_start = -1;
					}
					else
					{
						this.axis_active_cap_at_drag_start = 0;
					}
					
					// Get fixed half-extent along the axis in world units at drag start...
					if (!this.world_half_extent_start)
					{
						this.world_half_extent_start = { x: 0, y: 0, z: 0 };
					}
					const parent_scale = parent_scale_world || new Vector3(1, 1, 1);
					this.world_half_extent_start.x = object_half_extents.x * object_scale_local_at_drag_start.x * parent_scale.x;
					this.world_half_extent_start.y = object_half_extents.y * object_scale_local_at_drag_start.y * parent_scale.y;
					this.world_half_extent_start.z = object_half_extents.z * object_scale_local_at_drag_start.z * parent_scale.z;
					
					// Signed distance to the active opposite plane (per-frame)
					this.switch_prev_distance = null;
					
					// Switch to prevent instant flip-flop (re-arms once you move away a bit)
					this.switch_armed = true;
					
					// Get axis direction in world space at drag start
					let axis_at_drag_start = (this.axis && this.axis[0]) || "X";
					this.axis_direction_at_drag_start = new Vector3(axis_at_drag_start === "X" ? 1 : 0, axis_at_drag_start === "Y" ? 1 : 0, axis_at_drag_start === "Z" ? 1 : 0).applyQuaternion(object_quaternion_local_at_drag_start).normalize();
					
					// Measure baseline scalar distance along the active world axis by projecting the pointer ray onto the axis line through world_position_start
					// (This defines the reference value used for computing scale ratios during the drag)
					const ray_origin_local = Game.player.raycaster.ray.origin;
					const ray_direction_local = Game.player.raycaster.ray.direction.clone().normalize();
					this.axis_distance_baseline = this.closestAxisParamFromRay(ray_origin_local, ray_direction_local, object_position_world_at_drag_start, this.axis_direction_at_drag_start);
					
				}
				
				// Begin dragging and emit mouse down event
				this.dragging = true;
				mouse_down_event.mode = this.mode;
				this.dispatchEvent(mouse_down_event);
				
			}
			
		}
		
		/**
		 * Handles drag interactions while the mouse is moving.
		 */
		mouseMove()
		{
			
			// Cache current axis, mode, object, and transform space
			const axis = this.axis;
			const mode = this.mode;
			const object = this.object;
			const space = this.resolveTransformSpace(mode, axis);
			
			// If no object is attached to the transform controls, or there's no active axis, or no drag is in progress, or the mouse is not down, abort...
			if (object === undefined || axis === null || this.dragging === false || Game.player.controls.mouse_left_down == false)
			{
				return;
			}
			
			// Cast a ray from the player's position in the direction the player is looking
			Game.player.raycaster.ray.origin.copy(Game.player.position);
			Game.player.raycaster.ray.direction.set(0, 0, -1).applyQuaternion(Game.player.quaternion);
			Game.player.raycaster.near = 0;
			Game.player.raycaster.far = Infinity;
			
			// Check for any intersections with the interaction plane, and if there are none, abort...
			const plane_intersect = this.intersectObjectWithRay(this.plane, Game.player.raycaster, true);
			if (!plane_intersect)
			{
				return;
			}
			
			// Update the end point relative to the world position at drag start
			intersection_point_end.copy(plane_intersect.point).sub(object_position_world_at_drag_start);
			
			// If translate mode is active...
			if (mode === "translate")
			{
				
				// Apply translation
				intersection_point_offset.copy(intersection_point_end).sub(intersection_point_start);
				
				// If in local space and not the uniform axis...
				if (space === "local" && axis !== "XYZ")
				{
					
					// Transform offset to local space
					intersection_point_offset.applyQuaternion(object_inverse_quaternion_world);
					
				}
				
				// Zero out locked axes...
				if (axis.indexOf("X") === -1)
				{
					intersection_point_offset.x = 0;
				}
				if (axis.indexOf("Y") === -1)
				{
					intersection_point_offset.y = 0;
				}
				if (axis.indexOf("Z") === -1)
				{
					intersection_point_offset.z = 0;
				}
				
				// Convert offset back to the appropriate space and normalize it by parent scale...
				if (space === "local" && axis !== "XYZ")
				{
					intersection_point_offset.applyQuaternion(object_quaternion_local_at_drag_start).divide(parent_scale_world);
				}
				else
				{
					intersection_point_offset.applyQuaternion(parent_inverse_quaternion_world).divide(parent_scale_world);
				}
				
				// Apply position
				object.position.copy(intersection_point_offset).add(object_position_local_at_drag_start);
				
				// Apply translation snap
				if (this.translation_snap)
				{
					
					// Local-space snapping
					if (space === "local")
					{
						object.position.applyQuaternion(new Quaternion().copy(object_quaternion_local_at_drag_start).invert());
						this.applyAxisSnap(object.position, axis, this.translation_snap);
						object.position.applyQuaternion(object_quaternion_local_at_drag_start);
					}
					
					// World-space snapping
					if (space === "world")
					{
						if (object.parent)
						{
							object.position.add(new Vector3().setFromMatrixPosition(object.parent.matrixWorld));
						}
						
						this.applyAxisSnap(object.position, axis, this.translation_snap);
						
						if (object.parent)
						{
							object.position.sub(new Vector3().setFromMatrixPosition(object.parent.matrixWorld));
						}
					}
					
				}
				
				
			} // Otherwise, if scale mode is active...
			if (mode === "scale")
			{
				
				// Current active axis - may change mid-drag due to auto-switching between positive/negative ends
				let axis = this.axis;
				
				// First character of axis name (X, Y, or Z) used to determine which component to scale
				let axis_char = axis[0];
				
				// Unit vector pointing along the active axis in world space, used to measure distances
				const axis_world = new Vector3(axis_char === "X" ? 1 : 0, axis_char === "Y" ? 1 : 0, axis_char === "Z" ? 1 : 0).applyQuaternion(object_quaternion_local_at_drag_start).normalize();
				
				// Origin point of the player's raycaster in world space
				const ray_origin_local = Game.player.raycaster.ray.origin;
				
				// Normalized direction vector of the player's raycaster
				const ray_direction_local = Game.player.raycaster.ray.direction.clone().normalize();
				
				// Distance along the axis at drag start (used as baseline for calculating scale ratios)
				let axis_distance_start = (this.axis_distance_baseline != null) ? this.axis_distance_baseline : intersection_point_start.dot(axis_world);
				
				// Current distance along the axis based on current mouse/ray position
				let axis_distance_current = this.closestAxisParamFromRay(ray_origin_local, ray_direction_local, object_position_world_at_drag_start, axis_world);
				
				// If using end-caps, handle bidirectional auto-switching with fixed +/-axis_extent_current planes...
				if (axis.endsWith("_POS") || axis.endsWith("_NEG"))
				{
					
					// Fixed half-extent (world) captured at mouseDown
					const axis_extent_current = this.world_half_extent_start[axis_char.toLowerCase()] || 0;
					
					// Resolve the active cap (+1 for POS, -1 for NEG) if not set
					if (this.axis_active_cap_at_drag_start !== 1 && this.axis_active_cap_at_drag_start !== -1)
					{
						this.axis_active_cap_at_drag_start = axis.endsWith("_POS") ? 1 : -1;
					}
					
					// The target plane coordinate relative to the pivot
					const target_plane = -this.axis_active_cap_at_drag_start * axis_extent_current;
					
					// Hysteresis band around the target plane
					const hysteresis_band = (this.handle_switch_hysteresis != null) ? this.handle_switch_hysteresis : Math.max(1e-4, 0.01 * axis_extent_current);
					
					// Signed distance to the target plane for this frame
					const delta_now = axis_distance_current - target_plane;
					if (this.switch_prev_distance == null) this.switch_prev_distance = (axis_distance_start - target_plane);
					
					// Consider switching when the sign flips or we enter the narrow band
					const sign_flipped = (this.switch_prev_distance * delta_now) <= 0;
					const in_band = Math.abs(delta_now) <= hysteresis_band;
					
					// Only switch when armed to prevent rapid flip-flopping...
					if (this.switch_armed && (sign_flipped || in_band))
					{
						
						// Flip POS/NEG and rebase baselines to keep the drag continuous
						this.axis_active_cap_at_drag_start *= -1;
						this.axis = axis = axis.endsWith("_POS") ? axis.replace("_POS", "_NEG") : axis.replace("_NEG", "_POS");
						
						// Rebase kinematic baselines (do not change fixed +/-axis_extent_current planes)
						this.object.updateMatrixWorld();
						if (this.object.parent)
						{
							this.object.parent.updateMatrixWorld();
						}
						
						object_position_local_at_drag_start.copy(this.object.position);
						object_quaternion_local_at_drag_start.copy(this.object.quaternion);
						object_scale_local_at_drag_start.copy(this.object.scale);
						this.object.matrixWorld.decompose(object_position_world_at_drag_start, object_quaternion_world_at_drag_start, object_scale_world_at_drag_start);
						
						// Re-seed point_start from the current pointer world point...
						if (plane_intersect && plane_intersect.point)
						{
							intersection_point_start.copy(plane_intersect.point).sub(object_position_world_at_drag_start);
							intersection_point_world_current.copy(plane_intersect.point);
						}
						else
						{
							intersection_point_start.copy(intersection_point_end);
						}
						
						// Re-calculate half-extents in local space for the new baseline
						const object_box3 = new Box3();
						object_box3.setFromObject(this.object);
						const object_matrix4 = new Matrix4();
						object_matrix4.copy(this.object.matrixWorld).invert();
						object_box3.applyMatrix4(object_matrix4);
						object_box3.getSize(object_extents);
						object_box3.getSize(object_half_extents).multiplyScalar(0.5);
						
						// Re-calculate axis basis and distances for this same frame under the new axis
						axis_char = axis[0];
						axis_world.set(axis_char === "X" ? 1 : 0, axis_char === "Y" ? 1 : 0, axis_char === "Z" ? 1 : 0).applyQuaternion(object_quaternion_local_at_drag_start).normalize();
						
						// Re-calculate distance along the axis at drag start from the same ray using new baselines
						axis_distance_start = this.closestAxisParamFromRay(ray_origin_local, ray_direction_local, object_position_world_at_drag_start, axis_world);
						this.axis_distance_baseline = axis_distance_start;
						
						// Re-calculate current distance along the axis
						axis_distance_current = this.closestAxisParamFromRay(ray_origin_local, ray_direction_local, object_position_world_at_drag_start, axis_world);
						
						// Reset per-frame ratio damper for smoothness
						this.last_desired_ratio = null;
						
						// Disarm switching until we move clearly away from the new plane
						this.switch_armed = false;
						this.switch_prev_distance = axis_distance_current - (-this.axis_active_cap_at_drag_start * axis_extent_current);
						
					}
					else
					{
						
						// Update previous distance and re-arm once outside the wider band
						this.switch_prev_distance = delta_now;
						
						if (!this.switch_armed && Math.abs(delta_now) >= hysteresis_band * 2.0)
						{
							this.switch_armed = true;
						}
						
					}
				}
				
				// The desired object scale ratio
				let desired_scale_ratio = 0;
				
				// If uniform XYZ scaling mode is active...
				if (axis === "XYZ")
				{
					
					// Get distance from object to intersection point at drag start
					const start_distance = Math.max(EPSILON, intersection_point_start.length());
					
					// Get distance from object to current intersection point
					const current_distance = Math.max(EPSILON, intersection_point_end.length());
					
					// Calculate raw scale ratio based on distance change
					const raw_scale_ratio = current_distance / start_distance;
					
					// Get gain factor to reduce sensitivity of uniform scaling
					const scale_gain = (this.xyz_scale_gain != null) ? this.xyz_scale_gain : XYZ_SCALE_GAIN_DEFAULT;
					
					// Get dead zone to prevent jitter when ratio is close to 1
					const scale_dead_zone = (this.xyz_scale_deadzone != null) ? this.xyz_scale_deadzone : XYZ_SCALE_DEADZONE_DEFAULT;
					
					// Apply dead zone and gain to calculate final desired ratio
					desired_scale_ratio = (Math.abs(raw_scale_ratio - 1) < scale_dead_zone) ? 1 : 1 + (raw_scale_ratio - 1) * scale_gain;
					
					
				} // Otherwise, if scaling from a positive or negative end-cap handle...
				else if (axis.endsWith("_POS") || axis.endsWith("_NEG"))
				{
					
					// Axis key in lowercase (x, y, or z) for accessing object properties
					const axis_key = axis_char.toLowerCase();
					
					// Direction sign (+1 for positive end-cap, -1 for negative end-cap)
					const direction_sign = (this.axis_active_cap_at_drag_start === 1) ? 1 : -1;
					
					// Half-extent of the object along this axis at drag start (in world units)
					const axis_extent_current = this.world_half_extent_start[axis_key] || 0;
					
					// Current mouse position projected onto the axis relative to object pivot
					const mouse_axis_distance = axis_distance_current;
					
					// Calculate new half-extent (average of initial extent and mouse position)
					let axis_extent_world = (axis_extent_current + direction_sign * mouse_axis_distance) * 0.5;
					axis_extent_world = Math.max(1e-9, axis_extent_world);
					
					// Half-extent in local space (before any scaling)
					const half_local = object_half_extents[axis_key] || 0.000001;
					
					// Calculate new local scale value from world half-extent
					const new_local_scale = axis_extent_world / (half_local * ((object_scale_world_at_drag_start[axis_key] / Math.max(1e-9, object_scale_local_at_drag_start[axis_key])) || 1));
					
					// Calculate ratio of new scale to original scale
					desired_scale_ratio = new_local_scale / Math.max(1e-9, object_scale_local_at_drag_start[axis_key]);
					
					// Skip clamping and damping for end-caps to preserve perfect follow behavior
					this.skip_scale_clamp = true;
					
					
				} // Otherwise, if scaling using the regular X/Y/Z handles, which scales the object along the selected axis from its center...
				else
				{
					
					// Calculate ratio for single-axis scaling relative to the pivot point (the middle/center of the object)
					desired_scale_ratio = Math.abs(axis_distance_current) / Math.max(EPSILON, Math.abs(axis_distance_start));
					
				}
				
				// If scale clamping is *not* flagged to be skipped...
				if (!this.skip_scale_clamp)
				{
					
					// Limit the scale ratio based on camera distance to prevent extreme scaling...
					if (this.camera && this.camera.position && intersection_point_world_current)
					{
						
						// Calculate how much the max ratio increases per meter of camera distance (default 1.5)
						const scale_rate_per_meter = (this.scale_max_per_meter != null) ? this.scale_max_per_meter : 1.5;
						
						// Get distance from camera to the current intersection point
						const distance = this.camera.position.distanceTo(intersection_point_world_current);
						
						// Get the minimum distance to use for calculation to prevent infinite scaling when very close
						const distance_floor = (this.scale_distance_floor != null) ? this.scale_distance_floor : 0.25;
						
						// Calculate the max allowed ratio (further away = more scaling allowed, but the minimum is 1.05)
						const max_ratio = Math.max(1.05, 1 + scale_rate_per_meter * Math.max(distance, distance_floor));
						
						// Clamp ratio in logarithmic space for symmetric behavior (2x and 0.5x are equally distant from 1x)
						const ln_max = Math.log(max_ratio);
						const ln_raw = Math.log(Math.max(1e-6, desired_scale_ratio));
						const ln_clamped = Math.min(Math.max(ln_raw, -ln_max), ln_max);
						
						// Convert desired scale ratio back from logarithmic space
						desired_scale_ratio = Math.exp(ln_clamped);
						
					}
					
					// Damp large changes across frames to prevent jerky scaling...
					if (this.last_desired_ratio != null)
					{
						
						// Get the maximum multiplicative change per frame (default 20%)
						const max_step = (this.scale_max_step != null) ? this.scale_max_step : 0.2;
						
						// Calculate upper and lower bounds based on last frame's ratio
						const max_ratio_increase = this.last_desired_ratio * (1 + max_step);
						const max_ratio_decrease = this.last_desired_ratio / (1 + max_step);
						
						// Clamp the desired ratio to within one step of the previous value
						desired_scale_ratio = Math.min(Math.max(desired_scale_ratio, max_ratio_decrease), max_ratio_increase);
						
						// Store ratio for next frame's damping calculation
						this.last_desired_ratio = desired_scale_ratio;
						
					}
					
				}
				
				// Disable scale clamp skip flag
				this.skip_scale_clamp = false;
				
				// Apply ratio on selected axes...
				const scale_ratio_vector = new Vector3(1, 1, 1);
				if (axis.indexOf("X") !== -1) scale_ratio_vector.x = desired_scale_ratio;
				if (axis.indexOf("Y") !== -1) scale_ratio_vector.y = desired_scale_ratio;
				if (axis.indexOf("Z") !== -1) scale_ratio_vector.z = desired_scale_ratio;
				
				// Clamp absolute scale values...
				const new_scale = object_scale_local_at_drag_start.clone().multiply(scale_ratio_vector);
				new_scale.x = Math.min(Math.max(isFinite(new_scale.x) ? new_scale.x : object_scale_local_at_drag_start.x, MIN_SCALE), MAX_SCALE);
				new_scale.y = Math.min(Math.max(isFinite(new_scale.y) ? new_scale.y : object_scale_local_at_drag_start.y, MIN_SCALE), MAX_SCALE);
				new_scale.z = Math.min(Math.max(isFinite(new_scale.z) ? new_scale.z : object_scale_local_at_drag_start.z, MIN_SCALE), MAX_SCALE);
				object.scale.copy(new_scale);
				
				// Optionally snap scale to a grid...
				if (this.scale_snap)
				{
					if (axis.indexOf("X") !== -1)
					{
						object.scale.x = this.applySnap(object.scale.x, this.scale_snap) || this.scale_snap;
					}
					if (axis.indexOf("Y") !== -1)
					{
						object.scale.y = this.applySnap(object.scale.y, this.scale_snap) || this.scale_snap;
					}
					if (axis.indexOf("Z") !== -1)
					{
						object.scale.z = this.applySnap(object.scale.z, this.scale_snap) || this.scale_snap;
					}
				}
				
				// Shift the object center/pivot point based on half-extents (using the current axis)...
				const scale_delta = new Vector3().copy(object.scale).sub(object_scale_local_at_drag_start);
				if (axis.indexOf("X") === -1) scale_delta.x = 0;
				if (axis.indexOf("Y") === -1) scale_delta.y = 0;
				if (axis.indexOf("Z") === -1) scale_delta.z = 0;
				
				// Calculate how much the object's bounds have grown/shrunk in local space
				const local_pull = scale_delta.clone().multiply(object_half_extents);
				
				// Transform the local pull into world space, accounting for object rotation and parent scale
				const world_pull = local_pull.applyQuaternion(object_quaternion_local_at_drag_start).multiply(parent_scale_world);
				
				// Reset the object's position to its original drag start position
				object.position.copy(object_position_local_at_drag_start);
				
				// For end-cap handles (_POS/_NEG), shift the pivot to keep the opposite face anchored... (X, Y, Z, and XYZ scale from center, no adjustment needed)
				if (!(axis === "XYZ" || axis === "X" || axis === "Y" || axis === "Z"))
				{
					
					// If selected end-cap is positive...
					if (axis.endsWith("_POS"))
					{
						
						// shift position forward (anchor the negative face)
						object.position.add(world_pull);
						
					} // Otherwise, if selected end-cap is negative...
					else
					{
						
						// shift position backward (anchor the positive face)
						object.position.sub(world_pull);
						
					}
					
				}
				
				
			} // Otherwise, if rotate mode is active...
			else if (mode === "rotate")
			{
				
				// Calculate the mouse movement vector on the interaction plane
				intersection_point_offset.copy(intersection_point_end).sub(intersection_point_start);
				
				// Calculate rotation sensitivity based on camera distance (closer = faster rotation)
				const rotation_speed = 20 / object_position_world.distanceTo(new Vector3().setFromMatrixPosition(this.camera.matrixWorld));
				
				// If rotating on E axis... (screen-space rotation around camera view direction)
				if (axis === "E")
				{
					
					// Rotate around the camera's forward axis
					object_rotation_axis.copy(camera_view_direction);
					
					// Calculate angle between start and end intersection points
					object_rotation_angle = intersection_point_end.angleTo(intersection_point_start);
					
					// Normalize the intersection directions for cross product calculation
					raycaster_direction_at_drag_start.copy(intersection_point_start).normalize();
					raycaster_direction_last.copy(intersection_point_end).normalize();
					
					// Determine rotation direction using cross product sign
					object_rotation_angle *= (raycaster_direction_last.cross(raycaster_direction_at_drag_start).dot(camera_view_direction) < 0 ? 1 : -1);
					
					
				} // Otherwise, if rotating on XYZE axis... (trackball-style free rotation)
				else if (axis === "XYZE")
				{
					
					// Rotation axis is perpendicular to both mouse movement and camera direction
					object_rotation_axis.copy(intersection_point_offset).cross(camera_view_direction).normalize();
					
					// Rotation angle based on mouse movement projected onto the rotation plane
					object_rotation_angle = intersection_point_offset.dot(new Vector3().copy(object_rotation_axis).cross(camera_view_direction)) * rotation_speed;
					
					
				} // Otherwise, if rotating on X, Y, or Z axis... (constrained single-axis rotation)
				else if (axis === "X" || axis === "Y" || axis === "Z")
				{
					
					// Get the unit vector for the selected axis
					const unit_vector = (axis === "X") ? new Vector3(1, 0, 0) : (axis === "Y") ? new Vector3(0, 1, 0) : new Vector3(0, 0, 1);
					object_rotation_axis.copy(unit_vector);
					
					// Create a copy to transform into world space if needed
					const rotation_vector = unit_vector.clone();
					
					// In local space, transform the axis by the object's world rotation
					if (space === "local")
					{
						rotation_vector.applyQuaternion(object_quaternion_world);
					}
					
					// Calculate rotation angle from mouse movement perpendicular to the axis
					object_rotation_angle = intersection_point_offset.dot(rotation_vector.cross(camera_view_direction).normalize()) * rotation_speed;
					
				}
				
				// Apply rotation snap if enabled...
				if (this.rotation_snap)
				{
					object_rotation_angle = this.applySnap(object_rotation_angle, this.rotation_snap);
				}
				
				// Apply the calculated rotation to the object in local space... (except E and XYZE which are always world-relative)
				if (space === "local" && axis !== "E" && axis !== "XYZE")
				{
					
					// Start from the original rotation and multiply by the new rotation
					object.quaternion.copy(object_quaternion_local_at_drag_start);
					object.quaternion.multiply(new Quaternion().setFromAxisAngle(object_rotation_axis, object_rotation_angle)).normalize();
					
					
				} // Otherwise, apply world space rotation instead...
				else
				{
					
					// Transform the rotation axis into parent space
					object_rotation_axis.applyQuaternion(parent_inverse_quaternion_world);
					
					// Apply the rotation before the original rotation (world-space behavior)
					object.quaternion.copy(new Quaternion().setFromAxisAngle(object_rotation_axis, object_rotation_angle));
					object.quaternion.multiply(object_quaternion_local_at_drag_start).normalize();
					
				}
				
			}
			
			// If game is multiplayer...
			if (Multiplayer.enabled)
			{
				
				// Attempt to send a multiplayer object update...
				const now = performance.now();
				if (now - Multiplayer.object_update_last >= Multiplayer.object_update_rate)
				{
					Multiplayer.object_update_last = now;
					Multiplayer.sendObjectUpdate(object.simplified());
				}
				
			}
			
			// Dispatch change events
			this.dispatchEvent(change_event);
			this.dispatchEvent(object_change_event);
			
		}
		
		/**
		 * Ends a drag interaction when the mouse is released.
		 */
		mouseUp()
		{
			
			// If the mouse is still down, abort...
			if (Game.player.controls.mouse_left_down == true) return;
			
			// If a drag was in progress on a valid axis...
			if (this.dragging && (this.axis !== null))
			{
				
				// Dispatch mouse button release event
				mouse_up_event.mode = this.mode;
				this.dispatchEvent(mouse_up_event);
				
			}
			
			// Reset drag state
			this.dragging = false;
			this.axis = null;
			
		}
		
		/**
		 * Applies snap rounding to specific axes of a Vector3.
		 *
		 * @param {THREE.Vector3} vector The vector to modify in place.
		 * @param {string} axis The axis string (e.g., "X", "XY", "XYZ").
		 * @param {number} snap_amount The snap increment.
		 */
		applyAxisSnap(vector, axis, snap_amount)
		{
			if (axis.indexOf("X") !== -1)
			{
				vector.x = this.applySnap(vector.x, snap_amount);
			}
			
			if (axis.indexOf("Y") !== -1)
			{
				vector.y = this.applySnap(vector.y, snap_amount);
			}
			
			if (axis.indexOf("Z") !== -1)
			{
				vector.z = this.applySnap(vector.z, snap_amount);
			}
		}
		
		/**
		 * Sets the current transform mode.
		 *
		 * @param {string} mode The transform mode.
		 */
		setMode(mode)
		{
			this.mode = mode;
		}
		
		/**
		 * Sets the translation snap value.
		 *
		 * @param {number} translation_snap The translation snap value.
		 */
		setTranslationSnap(translation_snap)
		{
			this.translation_snap = translation_snap;
		}
		
		/**
		 * Sets the rotation snap value.
		 *
		 * @param {number} rotation_snap The rotation snap value.
		 */
		setRotationSnap(rotation_snap)
		{
			this.rotation_snap = rotation_snap;
		}
		
		/**
		 * Sets the scale snap value.
		 *
		 * @param {number} scale_snap The scale snap value.
		 */
		setScaleSnap(scale_snap)
		{
			this.scale_snap = scale_snap;
		}
		
		/**
		 * Sets the gizmo size multiplier.
		 *
		 * @param {number} size The size multiplier.
		 */
		setSize(size)
		{
			this.size = size;
		}
		
		/**
		 * Sets the transform space.
		 *
		 * @param {"local"|"world"} space The transform space.
		 */
		setSpace(space)
		{
			this.space = space;
		}
		
		/**
		 * Disposes of any allocated geometries and materials.
		 */
		dispose()
		{
			
			// Dispose of all of the object's children...
			this.traverse(function(child)
			{
				if (child.geometry) child.geometry.dispose();
				if (child.material) child.material.dispose();
			});
			
		}
		
	//#endregion
	
	
	//#region [Functions]
		
		/**
		 * Attaches the transform controls to the specified object.
		 *
		 * @param {THREE.Object3D} object The object to attach the transform controls to.
		 * @return {CustomTransformControls} Returns the transform controls now attached to the specified object.
		 */
		attach(object)
		{
			
			// Attach the transform controls
			this.object = object;
			
			// Make the transform controls visible
			this.visible = true;
			
			// Return the transform controls
			return this;
			
		}
		
		/**
		 * Detaches the transform controls from its current object, hiding the controls from visibility.
		 *
		 * @return {CustomTransformControls} Returns the transform controls, which have now been detached and made invisible.
		 */
		detach()
		{
			
			// Detach the transform controls
			this.object = undefined;
			this.axis = null;
			
			// Make the transform controls invisible
			this.visible = false;
			
			// Return the transform controls
			return this;
			
		}
		
		/**
		 * Gets the current transform mode.
		 *
		 * @return {string} Returns the current transform mode.
		 */
		getMode()
		{
			return this.mode;
		}
		
		/**
		 * Applies snap rounding to a single value.
		 *
		 * @param {number} value The value to snap.
		 * @param {number} snap_amount The snap increment.
		 * @return {number} Returns the snapped value.
		 */
		applySnap(value, snap_amount)
		{
			return Math.round(value / snap_amount) * snap_amount;
		}
		
		/**
		 * Resolves the effective transform space based on current mode and axis.
		 * Scaling always uses local space, while certain combined axes use world space.
		 *
		 * @param {string} mode The current transform mode (translate, rotate, scale).
		 * @param {string} axis The current active axis.
		 * @return {string} Returns the resolved transform space (local or world).
		 */
		resolveTransformSpace(mode, axis)
		{
			
			// Scaling always occurs in local space...
			if (mode === "scale")
			{
				return "local";
			}
			
			// Editor/combined axes always use world space...
			if (axis === "E" || axis === "XYZE" || axis === "XYZ")
			{
				return "world";
			}
			
			// Otherwise, return the configured space
			return this.space;
			
		}
		
		/**
		* Checks the specified raycaster for any intersections with the specified object and returns the first intersected object,
		* unless invisible hits are explicitly allowed.
		*
		* @param {THREE.Object3D} object The object to test for ray intersections.
		* @param {THREE.Raycaster} raycaster The raycaster used to perform the intersection test.
		* @param {boolean} include_invisible Flag indicating whether or not to include invisible objects.
		* @return {THREE.Intersection|false} Returns the first intersection result, or false if none were found.
		*/
		intersectObjectWithRay(object, raycaster, include_invisible)
		{
			
			// Check intersections with world objects...
			const all_intersections = raycaster.intersectObject(object, true);
			
			// Return the first hit that is visible... (unless invisible hits are allowed)
			for (let i = 0; i < all_intersections.length; i++)
			{
				if (all_intersections[i].object.visible || include_invisible)
				{
					return all_intersections[i];
				}
			}
			
			// Otherwise, return false if no intersections occurred
			return false;
			
		}
		
		/**
		* Finds the point on the axis line (axis_point + axis_dir * t) that is closest to the given ray (ray_origin + ray_direction * r)
		* using the standard closest-point-between-two-lines formula from 3D geometry. This is stable even when the ray is far from the axis.
		*
		* @param {THREE.Vector3} ray_origin The origin of the ray.
		* @param {THREE.Vector3} ray_direction The (approximately normalized) direction of the ray.
		* @param {THREE.Vector3} axis_point A point on the axis line (pivot).
		* @param {THREE.Vector3} axis_dir The (approximately normalized) axis direction.
		* @return {number} Returns the axis parameter "t" corresponding to the closest approach point to the ray.
		*/
		closestAxisParamFromRay(ray_origin, ray_direction, axis_point, axis_dir)
		{
			
			// Vector from the axis point to the ray origin
			const ray_to_axis_offset = new Vector3().copy(ray_origin).sub(axis_point);
			
			// Dot products needed for the closed-form solution (these form a system of linear equations for finding closest points on two lines)
			const ray_dot_ray = ray_direction.dot(ray_direction);           // Squared length of ray direction (~1 if normalized)
			const ray_dot_axis = ray_direction.dot(axis_dir);               // Cosine of angle between ray and axis (times lengths)
			const axis_dot_axis = axis_dir.dot(axis_dir);                   // Squared length of axis direction (~1 if normalized)
			const ray_dot_offset = ray_direction.dot(ray_to_axis_offset);   // Projection of offset onto ray direction
			const axis_dot_offset = axis_dir.dot(ray_to_axis_offset);       // Projection of offset onto axis direction
			
			// Calculate denominator to determine if lines are parallel (approaches zero when parallel)
			const denominator = (ray_dot_ray * axis_dot_axis) - (ray_dot_axis * ray_dot_axis);
			
			// If lines are not nearly parallel, use the closed-form analytical solution...
			if (Math.abs(denominator) > 1e-8)
			{
				
				// Return point derived from minimizing the squared distance between points on each line
				return ((ray_dot_ray * axis_dot_offset) - (ray_dot_axis * ray_dot_offset)) / denominator;
				
				
			} // Otherwiise, if lines are nearly parallel, fall back to projecting the ray origin onto the axis line... (the closed-form solution is numerically unstable)
			else
			{
				
				// Find the closest point on the ray to the axis point
				const projected_point = new Vector3().copy(ray_to_axis_offset).addScaledVector(ray_direction, ray_dot_offset / Math.max(ray_dot_ray, 1e-8));
				
				// Return the point projected onto the axis
				return projected_point.dot(axis_dir) / Math.max(axis_dot_axis, 1e-8);
				
			}
			
		}
		
	//#endregion
	
}


//#region [CustomTransformControlsGizmo Class]
	
	/**
	 * The visual gizmo and invisible pickers used by custom transform controls to transform a selected object.
	 */
	class CustomTransformControlsGizmo extends Object3D
	{
		
		//#region [Class Declarations / Constructor]
			
			/**
			 * Initializes a new custom transform controls gizmo.
			 */
			constructor()
			{	
				
				// Initialization
				
				// Call the gizmo's parent class (THREE.Object3D) to initialize the actual gizmo object
				super();
				
				// Set object type
				this.type = "CustomTransformControlsGizmo";
				
				
				// Class Declarations
				
				/**
				 * Type check flag for gizmo instances.
				 */
				this.is_transform_controls_gizmo = true;
				
				
				// Gizmo Declarations/Helpers/Initialization
				
				//#region [Gizmo Materials]
					
					/**
					 * Base mesh material applied to solid gizmo components.
					 */
					const gizmo_material = new MeshBasicMaterial({
						depthTest: false,
						depthWrite: false,
						transparent: true,
						side: DoubleSide,
						fog: false,
						toneMapped: false
					});
					
					/**
					 * Base line material applied to outline helpers.
					 */
					const gizmo_line_material = new LineBasicMaterial({
						depthTest: false,
						depthWrite: false,
						transparent: true,
						linewidth: 1,
						fog: false,
						toneMapped: false
					});
					
					/**
					 * Semi-transparent material used for invisible picker geometry.
					 */
					const mat_invisible = gizmo_material.clone();
					mat_invisible.opacity = 0.15;
					
					/**
					 * Helper material used for drag previews.
					 */
					const mat_helper = gizmo_material.clone();
					mat_helper.opacity = 0.33;
					
					/**
					 * Red-tinted gizmo material for the X axis.
					 */
					const mat_red = gizmo_material.clone();
					mat_red.color.set(0xff0000);
					
					/**
					 * Green-tinted gizmo material for the Y axis.
					 */
					const mat_green = gizmo_material.clone();
					mat_green.color.set(0x00ff00);
					
					/**
					 * Blue-tinted gizmo material for the Z axis.
					 */
					const mat_blue = gizmo_material.clone();
					mat_blue.color.set(0x0000ff);
					
					/**
					 * Semi-transparent neutral material reused for planar handles.
					 */
					const mat_white_transparent = gizmo_material.clone();
					mat_white_transparent.opacity = 0.25;
					
					/**
					 * Yellow-tinted transparent material for XY handles.
					 */
					const mat_yellow_transparent = mat_white_transparent.clone();
					mat_yellow_transparent.color.set(0xffff00);
					
					/**
					 * Cyan-tinted transparent material for YZ handles.
					 */
					const mat_cyan_transparent = mat_white_transparent.clone();
					mat_cyan_transparent.color.set(0x00ffff);
					
					/**
					 * Magenta-tinted transparent material for XZ handles.
					 */
					const mat_magenta_transparent = mat_white_transparent.clone();
					mat_magenta_transparent.color.set(0xff00ff);
					
					/**
					 * Solid yellow material reused for uniform-scale handles.
					 */
					const mat_yellow = gizmo_material.clone();
					mat_yellow.color.set(0xffff00);
					
					/**
					 * Red line material for X-axis outlines.
					 */
					const mat_line_red = gizmo_line_material.clone();
					mat_line_red.color.set(0xff0000);
					
					/**
					 * Green line material for Y-axis outlines.
					 */
					const mat_line_green = gizmo_line_material.clone();
					mat_line_green.color.set(0x00ff00);
					
					/**
					 * Blue line material for Z-axis outlines.
					 */
					const mat_line_blue = gizmo_line_material.clone();
					mat_line_blue.color.set(0x0000ff);
					
					/**
					 * Cyan line material for planar YZ outlines.
					 */
					const mat_line_cyan = gizmo_line_material.clone();
					mat_line_cyan.color.set(0x00ffff);
					
					/**
					 * Magenta line material for planar XZ outlines.
					 */
					const mat_line_magenta = gizmo_line_material.clone();
					mat_line_magenta.color.set(0xff00ff);
					
					/**
					 * Yellow line material for uniform-axis outlines.
					 */
					const mat_line_yellow = gizmo_line_material.clone();
					mat_line_yellow.color.set(0xffff00);
					
					/**
					 * Neutral gray line material used for helper outlines.
					 */
					const mat_line_gray = gizmo_line_material.clone();
					mat_line_gray.color.set(0x787878);
					
					/**
					 * Semi-transparent yellow line material used for outer rotation rings.
					 */
					const mat_line_yellow_transparent = mat_line_yellow.clone();
					mat_line_yellow_transparent.opacity = 0.25;
					
				//#endregion
				
				
				//#region [Reusable Gizmo Geometry]
					
					/**
					 * Cone-tipped cylinder geometry used for arrow handles.
					 */
					const arrow_geometry = new CylinderGeometry(0, 0.05, 0.2, 12, 1, false);
					
					/**
					 * Box geometry used for scale handle cubes.
					 */
					const scale_handle_geometry = new BoxGeometry(0.125, 0.125, 0.125);
					
					/**
					 * Line geometry reused for axis lines.
					 */
					const line_geometry = new BufferGeometry();
					line_geometry.setAttribute("position", new Float32BufferAttribute([0, 0, 0, 1, 0, 0], 3));
					
					/**
					 * Creates a circular BufferGeometry used for rotate/scale rings.
					 *
					 * @param {number} radius The circle's radius.
					 * @param {number} arc The normalized arc length (0...1).
					 * @return {THREE.BufferGeometry} Returns the generated circle geometry.
					 */
					function circleGeometry(radius, arc)
					{
						
						// Initialize empty geometry
						const geometry = new BufferGeometry();
						const vertices = [];
						
						// Initialize circular vertices...
						for (let i = 0; i <= 64 * arc; ++i)
						{
							vertices.push(0, Math.cos(i / 32 * Math.PI) * radius, Math.sin(i / 32 * Math.PI) * radius);
						}
						geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
						
						// Return circle geometry
						return geometry;
						
					}
					
					/**
					 * Special geometry for transform helper. If scaled with position vector it spans from [0,0,0] to position.
					 *
					 * @return {THREE.BufferGeometry} Returns the helper geometry.
					 */
					function translateHelperGeometry()
					{
						
						// Initialize helper geometry
						const geometry = new BufferGeometry();
						geometry.setAttribute("position", new Float32BufferAttribute([0, 0, 0, 1, 1, 1], 3));
						
						// Return helper geometry
						return geometry;
						
					}
					
				//#endregion
				
				
				//#region [Gizmo Visual Mesh Definitions]
					
					/**
					 * Mesh definitions for translation gizmo visuals.
					 */
					const gizmo_translate = {
						X: [
							[new Mesh(arrow_geometry, mat_red),  [1, 0, 0], [0, 0, -Math.PI / 2], null, "fwd"],
							[new Mesh(arrow_geometry, mat_red),  [1, 0, 0], [0, 0,  Math.PI / 2], null, "bwd"],
							[new Line(line_geometry, mat_line_red)]
						],
						Y: [
							[new Mesh(arrow_geometry, mat_green), [0, 1, 0], null, null, "fwd"],
							[new Mesh(arrow_geometry, mat_green), [0, 1, 0], [Math.PI, 0, 0], null, "bwd"],
							[new Line(line_geometry, mat_line_green), null, [0, 0, Math.PI / 2]]
						],
						Z: [
							[new Mesh(arrow_geometry, mat_blue),  [0, 0, 1], [Math.PI / 2, 0, 0], null, "fwd"],
							[new Mesh(arrow_geometry, mat_blue),  [0, 0, 1], [-Math.PI / 2, 0, 0], null, "bwd"],
							[new Line(line_geometry, mat_line_blue), null, [0, -Math.PI / 2, 0]]
						],
						XYZ: [
							[new Mesh(new OctahedronGeometry(0.1, 0), mat_white_transparent.clone()), [0, 0, 0], [0, 0, 0]]
						],
						XY: [
							[new Mesh(new PlaneGeometry(0.295, 0.295), mat_yellow_transparent.clone()), [0.15, 0.15, 0]],
							[new Line(line_geometry, mat_line_yellow), [0.18, 0.3, 0], null, [0.125, 1, 1]],
							[new Line(line_geometry, mat_line_yellow), [0.3, 0.18, 0], [0, 0, Math.PI / 2], [0.125, 1, 1]]
						],
						YZ: [
							[new Mesh(new PlaneGeometry(0.295, 0.295), mat_cyan_transparent.clone()), [0, 0.15, 0.15], [0, Math.PI / 2, 0]],
							[new Line(line_geometry, mat_line_cyan), [0, 0.18, 0.3], [0, 0, Math.PI / 2], [0.125, 1, 1]],
							[new Line(line_geometry, mat_line_cyan), [0, 0.3, 0.18], [0, -Math.PI / 2, 0], [0.125, 1, 1]]
						],
						XZ: [
							[new Mesh(new PlaneGeometry(0.295, 0.295), mat_magenta_transparent.clone()), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]],
							[new Line(line_geometry, mat_line_magenta), [0.18, 0, 0.3], null, [0.125, 1, 1]],
							[new Line(line_geometry, mat_line_magenta), [0.3, 0, 0.18], [0, -Math.PI / 2, 0], [0.125, 1, 1]]
						]
					};
					
					/**
					 * Mesh definitions for scale gizmo visuals.
					 */
					const gizmo_scale = {
						X: [
							[new Mesh(scale_handle_geometry, mat_red), [0.8, 0, 0], [0, 0, -Math.PI / 2]],
							[new Line(line_geometry, mat_line_red), null, null, [0.8, 1, 1]]
						],
						Y: [
							[new Mesh(scale_handle_geometry, mat_green), [0, 0.8, 0]],
							[new Line(line_geometry, mat_line_green), null, [0, 0, Math.PI / 2], [0.8, 1, 1]]
						],
						Z: [
							[new Mesh(scale_handle_geometry, mat_blue), [0, 0, 0.8], [Math.PI / 2, 0, 0]],
							[new Line(line_geometry, mat_line_blue), null, [0, -Math.PI / 2, 0], [0.8, 1, 1]]
						],
						X_POS: [[new Mesh(new BoxGeometry(0.125, 0.125, 0.125), mat_red)]],
						X_NEG: [[new Mesh(new BoxGeometry(0.125, 0.125, 0.125), mat_red)]],
						Y_POS: [[new Mesh(new BoxGeometry(0.125, 0.125, 0.125), mat_green)]],
						Y_NEG: [[new Mesh(new BoxGeometry(0.125, 0.125, 0.125), mat_green)]],
						Z_POS: [[new Mesh(new BoxGeometry(0.125, 0.125, 0.125), mat_blue)]],
						Z_NEG: [[new Mesh(new BoxGeometry(0.125, 0.125, 0.125), mat_blue)]],
						XYZ:   [[new Mesh(new BoxGeometry(0.125, 0.125, 0.125), mat_white_transparent.clone()), [0, 0, 0], [0, 0, 0]]],
						XY: [
							[new Mesh(scale_handle_geometry, mat_yellow_transparent), [0.85, 0.85, 0], null, [2, 2, 0.2]],
							[new Line(line_geometry, mat_line_yellow), [0.855, 0.98, 0], null, [0.125, 1, 1]],
							[new Line(line_geometry, mat_line_yellow), [0.98, 0.855, 0], [0, 0, Math.PI / 2], [0.125, 1, 1]]
						],
						YZ: [
							[new Mesh(scale_handle_geometry, mat_cyan_transparent), [0, 0.85, 0.85], null, [0.2, 2, 2]],
							[new Line(line_geometry, mat_line_cyan), [0, 0.855, 0.98], [0, 0, Math.PI / 2], [0.125, 1, 1]],
							[new Line(line_geometry, mat_line_cyan), [0, 0.98, 0.855], [0, -Math.PI / 2, 0], [0.125, 1, 1]]
						],
						XZ: [
							[new Mesh(scale_handle_geometry, mat_magenta_transparent), [0.85, 0, 0.85], null, [2, 0.2, 2]],
							[new Line(line_geometry, mat_line_magenta), [0.855, 0, 0.98], null, [0.125, 1, 1]],
							[new Line(line_geometry, mat_line_magenta), [0.98, 0, 0.855], [0, -Math.PI / 2, 0], [0.125, 1, 1]]
						]
					};
					
					/**
					 * Mesh definitions for rotation gizmo visuals.
					 */
					const gizmo_rotate = {
						X: [
							[new Line(circleGeometry(1, 0.5), mat_line_red)],
							[new Mesh(new OctahedronGeometry(0.04, 0), mat_red), [0, 0, 0.99], null, [1, 3, 1]]
						],
						Y: [
							[new Line(circleGeometry(1, 0.5), mat_line_green), null, [0, 0, -Math.PI / 2]],
							[new Mesh(new OctahedronGeometry(0.04, 0), mat_green), [0, 0, 0.99], null, [3, 1, 1]]
						],
						Z: [
							[new Line(circleGeometry(1, 0.5), mat_line_blue), null, [0, Math.PI / 2, 0]],
							[new Mesh(new OctahedronGeometry(0.04, 0), mat_blue), [0.99, 0, 0], null, [1, 3, 1]]
						],
						E: [
							[new Line(circleGeometry(1.25, 1), mat_line_yellow_transparent), null, [0, Math.PI / 2, 0]],
							[new Mesh(new CylinderGeometry(0.03, 0, 0.15, 4, 1, false), mat_line_yellow_transparent), [1.17, 0, 0], [0, 0, -Math.PI / 2], [1, 1, 0.001]],
							[new Mesh(new CylinderGeometry(0.03, 0, 0.15, 4, 1, false), mat_line_yellow_transparent), [-1.17, 0, 0], [0, 0,  Math.PI / 2], [1, 1, 0.001]],
							[new Mesh(new CylinderGeometry(0.03, 0, 0.15, 4, 1, false), mat_line_yellow_transparent), [0, -1.17, 0], [Math.PI, 0, 0], [1, 1, 0.001]],
							[new Mesh(new CylinderGeometry(0.03, 0, 0.15, 4, 1, false), mat_line_yellow_transparent), [0,  1.17, 0], [0, 0, 0], [1, 1, 0.001]]
						],
						XYZE: [
							[new Line(circleGeometry(1, 1), mat_line_gray), null, [0, Math.PI / 2, 0]]
						]
					};
					
				//#endregion
				
				
				//#region [Helper Visual Mesh Definitions]
					
					/**
					 * Mesh definitions for translation helper visuals.
					 */
					const helper_translate = {
						START: [[new Mesh(new OctahedronGeometry(0.01, 2), mat_helper), null, null, null, "helper"]],
						END:   [[new Mesh(new OctahedronGeometry(0.01, 2), mat_helper), null, null, null, "helper"]],
						DELTA: [[new Line(translateHelperGeometry(), mat_helper), null, null, null, "helper"]],
						X:     [[new Line(line_geometry, mat_helper.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], "helper"]],
						Y:     [[new Line(line_geometry, mat_helper.clone()), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], "helper"]],
						Z:     [[new Line(line_geometry, mat_helper.clone()), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1], "helper"]]
					};
					
					/**
					 * Mesh definitions for scale helper visuals.
					 */
					const helper_scale = {
						X:     [[new Line(line_geometry, mat_helper.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], "helper"]],
						Y:     [[new Line(line_geometry, mat_helper.clone()), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], "helper"]],
						Z:     [[new Line(line_geometry, mat_helper.clone()), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1], "helper"]],
						X_POS: [[new Line(line_geometry, mat_helper.clone()), null, null, [0.15, 1, 1], "helper"]],
						X_NEG: [[new Line(line_geometry, mat_helper.clone()), null, null, [0.15, 1, 1], "helper"]],
						Y_POS: [[new Line(line_geometry, mat_helper.clone()), null, null, [0.15, 1, 1], "helper"]],
						Y_NEG: [[new Line(line_geometry, mat_helper.clone()), null, null, [0.15, 1, 1], "helper"]],
						Z_POS: [[new Line(line_geometry, mat_helper.clone()), null, null, [0.15, 1, 1], "helper"]],
						Z_NEG: [[new Line(line_geometry, mat_helper.clone()), null, null, [0.15, 1, 1], "helper"]]
					};
					
					/**
					 * Mesh definitions for rotation helper visuals.
					 */
					const helper_rotate = {
						AXIS: [[new Line(line_geometry, mat_helper.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], "helper"]]
					};
					
				//#endregion
				
				
				//#region [Invisible Picker Mesh Definitions]
					
					/**
					 * Mesh definitions for invisible pickers used to detect translation interactions.
					 */
					const picker_translate = {
						X:  [[new Mesh(new CylinderGeometry(0.2, 0, 1, 4, 1, false), mat_invisible), [0.6, 0, 0], [0, 0, -Math.PI / 2]]],
						Y:  [[new Mesh(new CylinderGeometry(0.2, 0, 1, 4, 1, false), mat_invisible), [0, 0.6, 0]]],
						Z:  [[new Mesh(new CylinderGeometry(0.2, 0, 1, 4, 1, false), mat_invisible), [0, 0, 0.6], [Math.PI / 2, 0, 0]]],
						XYZ:[[new Mesh(new OctahedronGeometry(0.2, 0), mat_invisible)]],
						XY: [[new Mesh(new PlaneGeometry(0.4, 0.4), mat_invisible), [0.2, 0.2, 0]]],
						YZ: [[new Mesh(new PlaneGeometry(0.4, 0.4), mat_invisible), [0, 0.2, 0.2], [0, Math.PI / 2, 0]]],
						XZ: [[new Mesh(new PlaneGeometry(0.4, 0.4), mat_invisible), [0.2, 0, 0.2], [-Math.PI / 2, 0, 0]]]
					};
					
					/**
					 * Mesh definitions for invisible pickers used to detect scale interactions.
					 */
					const picker_scale = {
						X: [[new Mesh(new CylinderGeometry(0.2, 0, 0.8, 4, 1, false), mat_invisible), [0.5, 0, 0], [0, 0, -Math.PI / 2]]],
						Y: [[new Mesh(new CylinderGeometry(0.2, 0, 0.8, 4, 1, false), mat_invisible), [0, 0.5, 0]]],
						Z: [[new Mesh(new CylinderGeometry(0.2, 0, 0.8, 4, 1, false), mat_invisible), [0, 0, 0.5], [Math.PI / 2, 0, 0]]],
						X_POS: [[new Mesh(new BoxGeometry(0.2, 0.2, 0.2), mat_invisible)]],
						X_NEG: [[new Mesh(new BoxGeometry(0.2, 0.2, 0.2), mat_invisible)]],
						Y_POS: [[new Mesh(new BoxGeometry(0.2, 0.2, 0.2), mat_invisible)]],
						Y_NEG: [[new Mesh(new BoxGeometry(0.2, 0.2, 0.2), mat_invisible)]],
						Z_POS: [[new Mesh(new BoxGeometry(0.2, 0.2, 0.2), mat_invisible)]],
						Z_NEG: [[new Mesh(new BoxGeometry(0.2, 0.2, 0.2), mat_invisible)]],
						XYZ:   [[new Mesh(new BoxGeometry(0.2, 0.2, 0.2), mat_invisible), [0, 0, 0]]],
						XY:    [[new Mesh(scale_handle_geometry, mat_invisible), [0.85, 0.85, 0], null, [3, 3, 0.2]]],
						YZ:    [[new Mesh(scale_handle_geometry, mat_invisible), [0, 0.85, 0.85], null, [0.2, 3, 3]]],
						XZ:    [[new Mesh(scale_handle_geometry, mat_invisible), [0.85, 0, 0.85], null, [3, 0.2, 3]]]
					};
					
					/**
					 * Mesh definitions for invisible pickers used to detect rotation interactions.
					 */
					const picker_rotate = {
						X: [[new Mesh(new TorusGeometry(1, 0.1, 4, 24), mat_invisible), [0, 0, 0], [0, -Math.PI / 2, -Math.PI / 2]]],
						Y: [[new Mesh(new TorusGeometry(1, 0.1, 4, 24), mat_invisible), [0, 0, 0], [Math.PI / 2, 0, 0]]],
						Z: [[new Mesh(new TorusGeometry(1, 0.1, 4, 24), mat_invisible), [0, 0, 0], [0, 0, -Math.PI / 2]]],
						E: [[new Mesh(new TorusGeometry(1.25, 0.1, 2, 24), mat_invisible)]],
						XYZE: [[new Mesh(new SphereGeometry(0.7, 10, 8), mat_invisible)]]
					};
					
				//#endregion
				
				
				//#region [Gizmo Initialization]
					
					/**
					 * Creates a gizmo, helper, or picker object as described by the specified set of mesh definitions.
					 *
					 * @param {Object<string,Array>} mesh_definitions The set of mesh definitions describing the object to be created.
					 * @return {THREE.Object3D} Returns the constructed gizmo object.
					 */
					function constructGizmoObject(mesh_definitions)
					{
						
						// Initialize an empty gizmo object
						const gizmo = new Object3D();
						
						// Iterate through each axis of the specified mesh definitions...
						for (const name in mesh_definitions)
						{
							
							// Iterate through each mesh definition in the current axis...
							for (let i = mesh_definitions[name].length; i--;)
							{
								
								// Get current mesh and its attributes
								const mesh = mesh_definitions[name][i][0].clone();
								const position = mesh_definitions[name][i][1];
								const rotation = mesh_definitions[name][i][2];
								const scale = mesh_definitions[name][i][3];
								const tag = mesh_definitions[name][i][4];
								
								// Set current mesh's name and tag, which are essential for picking and updating logic
								mesh.name = name;
								mesh.tag = tag;
								
								// Set current mesh's position...
								if (position)
								{
									mesh.position.set(position[0], position[1], position[2]);
								}
								
								// Set current mesh's rotation...
								if (rotation)
								{
									mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
								}
								
								// Set current mesh's scale...
								if (scale)
								{
									mesh.scale.set(scale[0], scale[1], scale[2]);
								}
								
								// Update current mesh's transforms to bake geometry in local space
								mesh.updateMatrix();
								const temp_geometry = mesh.geometry.clone();
								temp_geometry.applyMatrix4(mesh.matrix);
								mesh.geometry = temp_geometry;
								mesh.renderOrder = Infinity;
								
								// Reset current mesh's transforms so the baked geometry remains at origin
								mesh.position.set(0, 0, 0);
								mesh.rotation.set(0, 0, 0);
								mesh.scale.set(1, 1, 1);
								
								// Add current mesh to gizmo object
								gizmo.add(mesh);
								
							}
							
						}
						
						// Return gizmo object
						return gizmo;
						
					}
					
					/**
					 * Gizmo object group which holds object meshes for gizmo translate/scale/rotate visuals.
					 */
					this.gizmo  = {};
					
					/**
					 * Helper object group which holds object meshes for helper translate/scale/rotate visuals.
					 */
					this.helper = {};
					
					/**
					 * Picker object group which holds invisible meshes used to detect gizmo translate/scale/rotate interactions.
					 */
					this.picker = {};
					
					// Initialize gizmo visuals and add them to the gizmo object...
					this.add(this.gizmo["translate"] = constructGizmoObject(gizmo_translate));
					this.add(this.gizmo["scale"] = constructGizmoObject(gizmo_scale));
					this.add(this.gizmo["rotate"] = constructGizmoObject(gizmo_rotate));
					
					// Initialize helper visuals and add them to the gizmo object...
					this.add(this.helper["translate"] = constructGizmoObject(helper_translate));
					this.add(this.helper["scale"] = constructGizmoObject(helper_scale));
					this.add(this.helper["rotate"] = constructGizmoObject(helper_rotate));
					
					// Initialize invisible picker meshes and add them to the gizmo object...
					this.add(this.picker["translate"] = constructGizmoObject(picker_translate));
					this.add(this.picker["scale"] = constructGizmoObject(picker_scale));
					this.add(this.picker["rotate"] = constructGizmoObject(picker_rotate));
					
					// Pickers should always be invisible of course...
					this.picker["translate"].visible = false;
					this.picker["scale"].visible = false;
					this.picker["rotate"].visible = false;
					
				//#endregion
				
			}
			
		//#endregion
		
		
		//#region [Methods]
			
			/**
			 * Updates transformations and appearance of individual handles each frame.
			 *
			 * @param {boolean} force Flag indicating whether or not the matrix update is being forced.
			 */
			updateMatrixWorld(force)
			{
				
				// Get rotation to apply to handles (scale mode uses object's rotation, other modes use identity)
				const quaternion = (this.mode === "scale") ? object_quaternion_world : new Quaternion();
				
				// Show only gizmos for the current transform mode, hide all others...
				this.gizmo["translate"].visible = (this.mode === "translate");
				this.gizmo["rotate"].visible    = (this.mode === "rotate");
				this.gizmo["scale"].visible     = (this.mode === "scale");
				
				// Show only helpers for the current transform mode, hide all others...
				this.helper["translate"].visible = (this.mode === "translate");
				this.helper["rotate"].visible    = (this.mode === "rotate");
				this.helper["scale"].visible     = (this.mode === "scale");
				
				// Collect all handles for the current mode... (pickers = invisible hit areas / gizmos = visible handles / helpers = guides)
				let handles = [];
				handles = handles.concat(this.picker[this.mode].children);
				handles = handles.concat(this.gizmo[this.mode].children);
				handles = handles.concat(this.helper[this.mode].children);
				
				// Process each handle to update its position, rotation, scale, and visibility...
				for (let i = 0; i < handles.length; i++)
				{
					
					// Get current handle being processed
					const handle = handles[i];
					
					// Reset handle to default state at object position
					handle.visible = true;
					handle.rotation.set(0, 0, 0);
					handle.position.copy(object_position_world);
					
					// Initialize handle scale factor for keeping handles at a consistent screen size for usability's sake
					let factor;
					
					// If camera is orthographic...
					if (this.camera.isOrthographicCamera)
					{
						
						// Calculate handle scale factor using the camera view height divided by its zoom
						factor = (this.camera.top - this.camera.bottom) / this.camera.zoom;
						
						
					} // Otherwise, for perspective camera...
					else
					{
						
						// Calculate handle scale factor based on camera distance and field of view
						factor = object_position_world.distanceTo(camera_position_world) * Math.min(1.9 * Math.tan(Math.PI * this.camera.fov / 360) / this.camera.zoom, 7);
						
					}
					
					// Apply the scale factor to the current handle
					handle.scale.set(1, 1, 1).multiplyScalar(factor * this.size / 7);
					
					// If the current handle is a helper...
					if (handle.tag === "helper")
					{
						
						// Hide helpers by default until explicitly shown
						handle.visible = false;
						
						// If handle is AXIS helper... (shows rotation axis line during rotate operations)
						if (handle.name === "AXIS")
						{
							
							// Position handle at drag start and show it if any axis is active
							handle.position.copy(object_position_world_at_drag_start);
							handle.visible = !!this.axis;
							
							// If X axis is active...
							if (this.axis === "X")
							{
								
								// Orient helper for X rotation
								const axis_rotation = new Quaternion().setFromEuler(new Euler(0, 0, 0));
								handle.quaternion.copy(quaternion).multiply(axis_rotation);
								
								// Hide the helper if it's nearly parallel to the camera...
								if (Math.abs(new Vector3(1, 0, 0).applyQuaternion(quaternion).dot(camera_view_direction)) > 0.9)
								{
									handle.visible = false;
								}
								
								
							} // Otherwise, if Y axis is active...
							else if (this.axis === "Y")
							{
								
								// Orient helper for Y rotation
								const axis_rotation = new Quaternion().setFromEuler(new Euler(0, 0, Math.PI / 2));
								handle.quaternion.copy(quaternion).multiply(axis_rotation);
								
								// Hide the helper if it's nearly parallel to the camera...
								if (Math.abs(new Vector3(0, 1, 0).applyQuaternion(quaternion).dot(camera_view_direction)) > 0.9)
								{
									handle.visible = false;
								}
								
								
							} // Otherwise, if Z axis is active...
							else if (this.axis === "Z")
							{
								
								// Orient helper for Z rotation
								const axis_rotation = new Quaternion().setFromEuler(new Euler(0, Math.PI / 2, 0));
								handle.quaternion.copy(quaternion).multiply(axis_rotation);
								
								// Hide the helper if it's nearly parallel to the camera...
								if (Math.abs(new Vector3(0, 0, 1).applyQuaternion(quaternion).dot(camera_view_direction)) > 0.9)
								{
									handle.visible = false;
								}
								
								
							} // Otherwise, if XYZE axis is active...
							else if (this.axis === "XYZE")
							{
								
								// Orient axis helper for free rotation
								const rotation_offset = new Quaternion().setFromEuler(new Euler(0, Math.PI / 2, 0));
								handle.quaternion.setFromRotationMatrix(new Matrix4().lookAt(new Vector3(0, 0, 0), object_rotation_axis, new Vector3(0, 1, 0)));
								handle.quaternion.multiply(rotation_offset);
								
								// Show handle only while dragging
								handle.visible = this.dragging;
								
								
							} // Otherwise, if E axis is active...
							else if (this.axis === "E")
							{
								
								// Hide the helper (screen-space rotation doesn't need an axis helper)
								handle.visible = false;
								
							}
							
							
						} // Otherwise, if handle is START helper... (shows marker at drag start position)
						else if (handle.name === "START")
						{
							handle.position.copy(object_position_world_at_drag_start);
							handle.visible = this.dragging;
							
						} // Otherwise, if handle is END helper... (shows marker at current object position)
						else if (handle.name === "END")
						{
							handle.position.copy(object_position_world);
							handle.visible = this.dragging;
							
						} // Otherwise, if handle is DELTA helper... (shows line from start to current position)
						else if (handle.name === "DELTA")
						{
							handle.position.copy(object_position_world_at_drag_start);
							handle.quaternion.copy(object_quaternion_world_at_drag_start);
							const delta_vector = new Vector3(1e-10, 1e-10, 1e-10).add(object_position_world_at_drag_start).sub(object_position_world).multiplyScalar(-1);
							const local_delta = delta_vector.applyQuaternion(object_quaternion_world_at_drag_start.clone().invert());
							handle.scale.copy(local_delta);
							handle.visible = this.dragging;
							
						} // Otherwise, if handle is an axis-specific helper... (X/Y/Z lines, show only when their axis is active)
						else
						{
							
							// Apply any rotation to the handle
							handle.quaternion.copy(quaternion);
							
							// If mouse is dragging...
							if (this.dragging)
							{
								
								// Position handle at drag start
								handle.position.copy(object_position_world_at_drag_start);
								
								
							} // Otherwise, if mouse is not dragging...
							else
							{
								
								// Position handle at current object position
								handle.position.copy(object_position_world);
								
							}
							
							// Show handle only if it's part of the active axis...
							if (this.axis)
							{
								handle.visible = (this.axis.search(handle.name) !== -1);
							}
							
						}
						
						// The current handle is a helper, so just skip the rest of the logic for it
						continue;
						
					}
					
					// If gizmo is translating or scaling...
					if (this.mode === "translate" || this.mode === "scale")
					{
						
						// Keep handle upright
						handle.quaternion.copy(new Quaternion(0, 0, 0, 1));
						
						
					} // Otherwise, if gizmo is rotating...
					else
					{
						
						// Align handle to current local/world rotation
						handle.quaternion.copy(quaternion);
						
					}
					
					// If scaling an object using any of the end-caps...
					if (this.mode === "scale" && (handle.name.endsWith("_POS") || handle.name.endsWith("_NEG")) && handle.tag !== "helper")
					{
						
						// Bounding box for calculating object extents
						const bounding_box = new Box3();
						
						// Inverse matrix for transforming box to local space
						const inverse_matrix = new Matrix4();
						
						// Half-extents of the object in local space
						const half_extents = new Vector3();
						
						// World position of the object
						const world_position = new Vector3();
						
						// World quaternion (rotation) of the object
						const world_quaternion = new Quaternion();
						
						// World scale of the object
						const world_scale = new Vector3();
						
						// Update object's world matrix and extract its components
						this.object.updateMatrixWorld();
						this.object.matrixWorld.decompose(world_position, world_quaternion, world_scale);
						
						// Get the object's local half-extents at the current scale
						bounding_box.setFromObject(this.object);
						inverse_matrix.copy(this.object.matrixWorld).invert();
						bounding_box.applyMatrix4(inverse_matrix);
						bounding_box.getSize(half_extents).multiplyScalar(0.5);
						
						// Get handle's axis and its +/- sign
						const handle_axis = handle.name.charAt(0);
						const handle_axis_sign = handle.name.endsWith("POS") ? 1 : -1;
						
						// Get current world half-extent on this axis
						const axis_extent_current = (handle_axis === "X") ? half_extents.x * world_scale.x : (handle_axis === "Y") ? half_extents.y * world_scale.y : half_extents.z * world_scale.z;
						
						// Get local-space and world-space axis directions
						const axis_direction_local = (handle_axis === "X") ? new Vector3(1, 0, 0) : (handle_axis === "Y") ? new Vector3(0, 1, 0) : new Vector3(0, 0, 1);
						const axis_direction_world = axis_direction_local.clone().applyQuaternion(world_quaternion);
						
						// Get the object's position while dragging vs idle
						const base_position = this.dragging ? object_position_world_at_drag_start : object_position_world;
						
						// Flag indicating whether or not this handle is on the same axis as the active one
						const is_same_axis_as_active = !!this.axis && this.axis[0] === handle_axis && (this.axis.endsWith("_POS") || this.axis.endsWith("_NEG"));
						
						// Position active end-cap exactly on the dragged face...
						if (this.dragging && handle.name === this.axis)
						{
							const face_offset = handle_axis_sign * (-axis_extent_current + 2 * axis_extent_current);
							handle.position.copy(base_position).addScaledVector(axis_direction_world, face_offset);
							handle.quaternion.set(0, 0, 0, 1);
							handle.visible = true;
							continue;
						}
						
						// Position opposite end-cap on the same axis while dragging...
						if (this.dragging && is_same_axis_as_active && handle.name !== this.axis)
						{
							const active_sign = this.axis.endsWith("_POS") ? 1 : -1;
							const opposite_sign = -active_sign;
							const anchor_offset = opposite_sign * axis_extent_current;
							handle.position.copy(base_position).addScaledVector(axis_direction_world, anchor_offset);
							handle.quaternion.set(0, 0, 0, 1);
							handle.visible = true;
							continue;
						}
						
						// Position all other end-caps with a small outward pad...
						const pad = 0.02;
						const offset = axis_direction_local.multiplyScalar((axis_extent_current + pad) * handle_axis_sign).applyQuaternion(world_quaternion);
						handle.position.copy(base_position).add(offset);
						
						// If gizmo is translating or scaling...
						if (this.mode === "translate" || this.mode === "scale")
						{
							
							// Keep handle upright
							handle.quaternion.copy(new Quaternion(0, 0, 0, 1));
							
							
						} // Otherwise, if gizmo is rotating...
						else
						{
							
							// Align handle to current local/world rotation
							handle.quaternion.copy(quaternion);
							
						}
						
						// Make sure handle is visible
						handle.visible = true;
						
					}
					
					// Flip or hide handle depending on camera alignment for translate/scale modes...
					if (this.mode === "translate" || this.mode === "scale")
					{
						
						// Hide translate/scale handle facing the camera...
						if (handle.name === "X" || handle.name === "XYZX")
						{
							if (Math.abs(new Vector3(1, 0, 0).applyQuaternion(quaternion).dot(camera_view_direction)) > AXIS_HIDE_THRESHOLD)
							{
								handle.scale.set(1e-10, 1e-10, 1e-10);
								handle.visible = false;
							}
						}
						else if (handle.name === "Y" || handle.name === "XYZY")
						{
							if (Math.abs(new Vector3(0, 1, 0).applyQuaternion(quaternion).dot(camera_view_direction)) > AXIS_HIDE_THRESHOLD)
							{
								handle.scale.set(1e-10, 1e-10, 1e-10);
								handle.visible = false;
							}
						}
						else if (handle.name === "Z" || handle.name === "XYZZ")
						{
							if (Math.abs(new Vector3(0, 0, 1).applyQuaternion(quaternion).dot(camera_view_direction)) > AXIS_HIDE_THRESHOLD)
							{
								handle.scale.set(1e-10, 1e-10, 1e-10);
								handle.visible = false;
							}
						}
						
						// Hide planar translate/scale handle when nearly edge-on to the camera...
						if (handle.name === "XY")
						{
							if (Math.abs(new Vector3(0, 0, 1).applyQuaternion(quaternion).dot(camera_view_direction)) < PLANE_HIDE_THRESHOLD)
							{
								handle.scale.set(1e-10, 1e-10, 1e-10);
								handle.visible = false;
							}
						}
						else if (handle.name === "YZ")
						{
							if (Math.abs(new Vector3(1, 0, 0).applyQuaternion(quaternion).dot(camera_view_direction)) < PLANE_HIDE_THRESHOLD)
							{
								handle.scale.set(1e-10, 1e-10, 1e-10);
								handle.visible = false;
							}
						}
						else if (handle.name === "XZ")
						{
							if (Math.abs(new Vector3(0, 1, 0).applyQuaternion(quaternion).dot(camera_view_direction)) < PLANE_HIDE_THRESHOLD)
							{
								handle.scale.set(1e-10, 1e-10, 1e-10);
								handle.visible = false;
							}
						}
						
						// Flip or hide translate/scale handle occluded behind another handle based on camera direction...
						if (handle.name.search("X") !== -1)
						{
							if (new Vector3(1, 0, 0).applyQuaternion(quaternion).dot(camera_view_direction) < AXIS_FLIP_THRESHOLD)
							{
								if (handle.tag === "fwd")
								{
									handle.visible = false;
								}
								else
								{
									handle.scale.x *= -1;
								}
							}
							else if (handle.tag === "bwd")
							{
								handle.visible = false;
							}
						}
						else if (handle.name.search("Y") !== -1)
						{
							if (new Vector3(0, 1, 0).applyQuaternion(quaternion).dot(camera_view_direction) < AXIS_FLIP_THRESHOLD)
							{
								if (handle.tag === "fwd")
								{
									handle.visible = false;
								}
								else
								{
									handle.scale.y *= -1;
								}
							}
							else if (handle.tag === "bwd")
							{
								handle.visible = false;
							}
						}
						else if (handle.name.search("Z") !== -1)
						{
							if (new Vector3(0, 0, 1).applyQuaternion(quaternion).dot(camera_view_direction) < AXIS_FLIP_THRESHOLD)
							{
								if (handle.tag === "fwd")
								{
									handle.visible = false;
								}
								else
								{
									handle.scale.z *= -1;
								}
							}
							else if (handle.tag === "bwd")
							{
								handle.visible = false;
							}
						}
						
					}
					
					// Rotate handle according to camera alignment for rotation mode...
					if (this.mode === "rotate")
					{
						const local_quaternion = new Quaternion().copy(quaternion);
						const local_eye = new Vector3().copy(camera_view_direction).applyQuaternion(local_quaternion.clone().invert());
						if (handle.name.search("E") !== -1)
						{
							handle.quaternion.setFromRotationMatrix(new Matrix4().lookAt(camera_view_direction, new Vector3(0, 0, 0), new Vector3(0, 1, 0)));
						}
						else if (handle.name === "X")
						{
							const ring_rotation = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.atan2(-local_eye.y, local_eye.z));
							handle.quaternion.copy(local_quaternion).multiply(ring_rotation);
						}
						else if (handle.name === "Y")
						{
							const ring_rotation = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.atan2(local_eye.x, local_eye.z));
							handle.quaternion.copy(local_quaternion).multiply(ring_rotation);
						}
						else if (handle.name === "Z")
						{
							const ring_rotation = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.atan2(local_eye.y, local_eye.x));
							handle.quaternion.copy(local_quaternion).multiply(ring_rotation);
						}
					}
					
					// Hide any disabled axes
					handle.visible = handle.visible && (handle.name.indexOf("X") === -1 || this.show_x);
					handle.visible = handle.visible && (handle.name.indexOf("Y") === -1 || this.show_y);
					handle.visible = handle.visible && (handle.name.indexOf("Z") === -1 || this.show_z);
					handle.visible = handle.visible && (handle.name.indexOf("E") === -1 || (this.show_x && this.show_y && this.show_z));
					
					// Cache original handle material properties for later restoration
					handle.material.cached_opacity = handle.material.cached_opacity || handle.material.opacity;
					handle.material.cached_color = handle.material.cached_color || handle.material.color.clone();
					
					// Reset handle material to original values before applying highlighting
					handle.material.color.copy(handle.material.cached_color);
					handle.material.opacity = handle.material.cached_opacity;
					
					// If gizmo is disabled...
					if (!this.enabled)
					{
						
						// Dim the handle
						handle.material.opacity *= 0.5;
						handle.material.color.lerp(new Color(1, 1, 1), 0.5);
						
						
					} // Otherwise, if an axis is selected...
					else if (this.axis)
					{
						
						// If handle exactly matches the selected axis...
						if (handle.name === this.axis)
						{
							
							// Highlight the handle
							handle.material.opacity = 1.0;
							handle.material.color.lerp(new Color(1, 1, 1), 0.5);
							
							
						} // Otherwise, if handle is part of a multi-axis selection (e.g., "X" in "XY")...
						else if (this.axis.split("").some(function(a){ return handle.name === a; }))
						{
							
							// Highlight the handle
							handle.material.opacity = 1.0;
							handle.material.color.lerp(new Color(1, 1, 1), 0.5);
							
							
						} // Otherwise, if handle is not selected...
						else
						{
							
							// Dim the handle
							handle.material.opacity *= 0.25;
							handle.material.color.lerp(new Color(1, 1, 1), 0.5);
							
						}
						
					}
					
				}
				
				// Finish by calling the parent method
				super.updateMatrixWorld(force);
				
			}
			
		//#endregion
		
	}
	
//#endregion


//#region [CustomTransformControlsPlane Class]
	
	/**
	 * The invisible interaction plane used by custom transform controls to compute pointer projections.
	 */
	class CustomTransformControlsPlane extends Mesh
	{
		
		//#region [Class Declarations / Constructor]
			
			/**
			 * Initializes a new invisible interaction plane for computing pointer projections.
			 */
			constructor()
			{
				
				// Initialization
				
				// Call the interaction plane's parent class (THREE.Mesh) to initialize the actual plane object
				super(new PlaneGeometry(100000, 100000, 2, 2), new MeshBasicMaterial({ visible: false, wireframe: true, side: DoubleSide, transparent: true, opacity: 0.1, toneMapped: false }));
				
				// Set object type
				this.type = "CustomTransformControlsPlane";
				
								
				// Class Declarations
					
				/**
				 * Type check flag for plane instances.
				 */
				this.is_transform_controls_plane = true;
				
			}
			
		//#endregion
		
		
		//#region [Methods]
			
			/**
			 * Orients the interaction plane for the current transform mode, axis, and space.
			 *
			 * @param {boolean} force Flag indicating whether or not the matrix update was forced.
			 */
			updateMatrixWorld(force)
			{
				
				// Copy position from the world transform
				this.position.copy(object_position_world);
				
				// Get current transform space
				let space = this.space;
				
				// Scale is always oriented to local space...
				if (this.mode === "scale")
				{
					space = "local";
				}
				
				// Build local axes in the chosen space
				const unit_x = new Vector3(1, 0, 0).applyQuaternion(space === "local" ? object_quaternion_world : new Quaternion());
				const unit_y = new Vector3(0, 1, 0).applyQuaternion(space === "local" ? object_quaternion_world : new Quaternion());
				const unit_z = new Vector3(0, 0, 1).applyQuaternion(space === "local" ? object_quaternion_world : new Quaternion());
				
				// Align the plane for the current transform mode, axis, and space
				let align_vector = new Vector3().copy(unit_y);
				
				// If interaction plane is translating or scaling...
				if (this.mode == "translate" || this.mode == "scale")
				{
					
					// Orient plane based on the axis being transformed...
					switch (this.axis)
					{
						case "X":
							align_vector.copy(camera_view_direction).cross(unit_x);
							align_vector.copy(unit_x).cross(align_vector);
							break;
						case "Y":
							align_vector.copy(camera_view_direction).cross(unit_y);
							align_vector.copy(unit_y).cross(align_vector);
							break;
						case "Z":
							align_vector.copy(camera_view_direction).cross(unit_z);
							align_vector.copy(unit_z).cross(align_vector);
							break;
						case "XY":
							align_vector.copy(unit_z);
							break;
						case "YZ":
							align_vector.copy(unit_x);
							break;
						case "XZ":
							align_vector.copy(unit_y);
							break;
						case "XYZ":
						case "E":
							align_vector.set(0, 0, 0);
							break;
					}
					
					
				} // Otherwise, if interaction plane is rotating...
				else if (this.mode == "rotate")
				{
					
					// Orient plane to face camera directly
					align_vector.set(0, 0, 0);
					
				}
				
				// If align vector is zero, make plane parallel to the camera...
				if (align_vector.length() === 0)
				{
					this.quaternion.copy(camera_quaternion_world);
					
				} // Otherwise, align plane to the chosen direction...
				else
				{
					const look_matrix = new Matrix4().lookAt(new Vector3(0, 0, 0), align_vector, unit_y);
					this.quaternion.setFromRotationMatrix(look_matrix);
				}
				
				// Finish by calling the parent method
				super.updateMatrixWorld(force);
				
			}
			
		//#endregion
		
	}
	
//#endregion


export { CustomTransformControls, CustomTransformControlsGizmo, CustomTransformControlsPlane };