// three.js Imports
import {
	Euler,
	EventDispatcher,
	Vector3
} from '../three.js';

// Static Class Imports
import Multiplayer from '../../../classes/multiplayer.class.js';

/**
 * A custom modification of the three.js PointerLockControls example code.
 */
class CustomPointerLockControls extends EventDispatcher
{
	
	//#region [Class Declarations / Constructor]
		
		/**
		 * Initializes custom pointer lock controls to lock the mouse to the canvas for in-game mouse movement.
		 *
		 * @param {THREE.Camera} camera The player's camera.
		 * @param {HTMLElement} dom_element The HTML DOM element to attach the pointer lock controls to.
		 */
		constructor(camera, dom_element)
		{
			
			// Initialization
			
			// Call parent EventDispatcher constructor
			super();
			
			
			// Class Declarations
			
			/**
			 * The HTML DOM element to attach the pointer lock controls to.
			 */
			this.dom_element = dom_element;
			
			/**
			 * Flag indicating whether or not the pointer is currently locked to the canvas.
			 */
			this.is_locked = false;
			
			/**
			 * Minimum vertical angle in radians (0 = looking straight up).
			 */
			this.min_polar_angle = 0;
			
			/**
			 * Maximum vertical angle in radians (Math.PI = looking straight down).
			 */
			this.max_polar_angle = Math.PI;
			
			/**
			 * Timestamp of the last lock state change (used to ignore spurious mouse events during transitions).
			 */
			let last_lock_change_time = 0;
			
			/**
			 * Reference to this instance for use in event handlers.
			 */
			const scope = this;
			
			
			//#region [Event Handlers]
				
				/**
				 * Handle mouse movement to rotate the camera.
				 *
				 * @param {MouseEvent} event The mouse move event.
				 */
				function onMouseMove(event)
				{
					
					// If pointer is not locked, ignore mouse movement...
					if (scope.is_locked === false)
					{
						return;
					}
					
					// Ignore mouse movement for 50ms after lock state changes... (prevents spurious camera snaps)
					if (performance.now() - last_lock_change_time < 50)
					{
						return;
					}
					
					// Get mouse movement delta
					const movement_x = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
					const movement_y = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
					
					// Reject abnormally large movements...
					if (Math.abs(movement_x) > 200 || Math.abs(movement_y) > 200)
					{
						return;
					}
					
					// Get the current camera rotation as Euler angles
					const euler = new Euler(0, 0, 0, 'YXZ');
					euler.setFromQuaternion(camera.quaternion);
					
					// Apply mouse movement to rotation (with sensitivity multiplier)
					euler.y -= movement_x * 0.002;
					euler.x -= movement_y * 0.002;
					
					// Clamp vertical rotation to min/max polar angles
					euler.x = Math.max((Math.PI / 2) - scope.max_polar_angle, Math.min((Math.PI / 2) - scope.min_polar_angle, euler.x));
					
					// Apply the new rotation to the camera
					camera.quaternion.setFromEuler(euler);
					
					// Dispatch change event
					scope.dispatchEvent({type: 'change'});
					
				}
				
				/**
				 * Handle pointer lock state changes.
				 */
				function onPointerlockChange()
				{
					
					// Record timestamp to ignore spurious mouse events during transition
					last_lock_change_time = performance.now();
					
					// If pointer lock is now active on the attached HTML DOM element...
					if (scope.dom_element.ownerDocument.pointerLockElement === scope.dom_element)
					{
						
						// Pointer is now locked
						scope.is_locked = true;
						
						// Dispatch lock event
						scope.dispatchEvent({type: 'lock'});
						
						
					} // Otherwise, if the pointer lock is no longer active on the attached HTML DOM element...
					else
					{
						
						// Pointer is now unlocked
						scope.is_locked = false;
						
						// Dispatch unlock event
						scope.dispatchEvent({type: 'unlock'});
						
					}
					
				}
				
				/**
				 * Handle pointer lock errors.
				 */
				function onPointerlockError()
				{
					
					// Log error to console
					console.error('THREE.CustomPointerLockControls: Unable to use Pointer Lock API');
					
				}
				
			//#endregion
			
			
			//#region [Methods]
				
				/**
				 * Connects the pointer lock controls by adding event listeners to the HTML DOM element's parent document.
				 */
				this.connect = function()
				{
					
					// Add mouse move listener
					scope.dom_element.ownerDocument.addEventListener('mousemove', onMouseMove);
					
					// Add pointer lock state change listener
					scope.dom_element.ownerDocument.addEventListener('pointerlockchange', onPointerlockChange);
					
					// Add pointer lock error listener
					scope.dom_element.ownerDocument.addEventListener('pointerlockerror', onPointerlockError);
					
				};
				
				/**
				 * Disconnects the pointer lock controls by removing event listeners from the HTML DOM element's parent document.
				 */
				this.disconnect = function()
				{
					
					// Remove mouse move listener
					scope.dom_element.ownerDocument.removeEventListener('mousemove', onMouseMove);
					
					// Remove pointer lock state change listener
					scope.dom_element.ownerDocument.removeEventListener('pointerlockchange', onPointerlockChange);
					
					// Remove pointer lock error listener
					scope.dom_element.ownerDocument.removeEventListener('pointerlockerror', onPointerlockError);
					
				};
				
				/**
				 * Disposes of the controls by disconnecting all event listeners from the HTML DOM element's parent document.
				 */
				this.dispose = function()
				{
					
					// Disconnect all event listeners
					this.disconnect();
					
				};
				
				/**
				 * Moves the camera forward parallel to the xz-plane.
				 *
				 * @param {number} distance The distance to move forward.
				 */
				this.moveForward = function(distance)
				{
					
					// Get the camera's right vector from its matrix
					const vector = new Vector3();
					vector.setFromMatrixColumn(camera.matrix, 0);
					
					// Cross with up vector to get forward direction (parallel to xz-plane)
					vector.crossVectors(camera.up, vector);
					
					// Move the camera position
					camera.position.addScaledVector(vector, distance);
					
				};
				
				/**
				 * Moves the camera right.
				 *
				 * @param {number} distance The distance to move right.
				 */
				this.moveRight = function(distance)
				{
					
					// Get the camera's right vector from its matrix
					const vector = new Vector3();
					vector.setFromMatrixColumn(camera.matrix, 0);
					
					// Move the camera position
					camera.position.addScaledVector(vector, distance);
					
				};
				
				/**
				 * Requests pointer lock on the DOM element.
				 */
				this.lock = function()
				{
					
					// If the game is multiplayer but *not* a dedicated server...
					if (!Multiplayer.is_dedicated_server)
					{
						
						// Request pointer lock on the DOM element
						const promise = this.dom_element.requestPointerLock();
						
						// Handle promise rejection... (some browsers return a Promise, others return undefined)
						if (promise && promise.catch)
						{
							promise.catch(function()
							{
								// Silently ignore - this happens when the user presses the Escape key during lock request
							});
						}
						
					}
					
				};
				
				/**
				 * Exits pointer lock.
				 */
				this.unlock = function()
				{
					
					// If the game is multiplayer but *not* a dedicated server...
					if (!Multiplayer.is_dedicated_server)
					{
						
						// Exit pointer lock
						scope.dom_element.ownerDocument.exitPointerLock();
						
					}
					
				};
				
			//#endregion
			
			
			//#region [Functions]
				
				/**
				 * Returns the camera object which the pointer lock controls are attached to.
				 *
				 * @returns {THREE.Camera} Returns the attached camera object.
				 */
				this.getObject = function()
				{
					
					// Return the camera
					return camera;
					
				};
				
				/**
				 * Returns a function that gets the camera's forward direction.
				 *
				 * @returns {Function} Returns a function that copies the forward direction into the provided vector.
				 */
				this.getDirection = function()
				{
					
					// Create direction vector pointing forward
					const direction = new Vector3(0, 0, -1);
					
					// Return a function that applies camera rotation to direction...
					return function(v)
					{
						return v.copy(direction).applyQuaternion(camera.quaternion);
					};
					
				}();
				
			//#endregion
			
			
			// Post-initialization
			
			// Connect event listeners on initialization
			this.connect();
			
		}
		
	//#endregion
	
}

export default CustomPointerLockControls;