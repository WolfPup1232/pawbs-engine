// three.js Imports
import * as THREE from '../three.js';

// Static Class Imports
import Game from '../../../classes/game.class.js';

/**
 * Extends the three.js Object3D class with new functions.
 */
export default function initializeObject3DExtension()
{
	
	//#region [Functions]
		
		// -------- Object3D.userData Fields --------
		//
		// locked
		//
		// loaded_from_level
		//
		// ignore_raycast
		// ignore_collision
		//
		// original_material
		// base_material_visible
		// use_base_material
		//
		// original_geometry
		// selected_faces
		// has_deleted_faces
		// face_group_ids
		// face_groups
		//
		// vertices
		// object_indices_at_positions
		// selected_vertex_indices
		// selected_vertices_initial_position
		// selected_vertices_initial_delta
		// selected_vertices_initial_matrix
		// selected_vertices
		// vertex_index
		// initial_vertex_positions
		//
		// ------------------------------------------
		
		// Add a function to the Object3D class which returns whether or not the object is unlocked for editing
		THREE.Object3D.prototype.unlocked = function()
		{
			return (!this.userData.locked || (this.userData.locked && (this.userData.locked == "" || this.userData.locked == Game.player.id)));
		}
		
		// Add a function to the Object3D class which locks the object for editing
		THREE.Object3D.prototype.lock = function()
		{
			this.userData.locked = Game.player.id;
		}
		
		// Add a function to the Object3D class which unlocks the object for editing
		THREE.Object3D.prototype.unlock = function()
		{
			this.userData.locked = "";
		}
		
		// Add a function to the Object3D class which returns a simplified version of the object for storage and communication
		THREE.Object3D.prototype.simplified = function()
		{
			
			// Initialize data object
			const data = {};
			
			// Get object ID info
			data.type = this.type;
			data.uuid = this.uuid;
			data.name = this.name;
			
			// Get object basic info
			data.visible = this.visible;
			data.castShadow = this.castShadow;
			data.receiveShadow = this.receiveShadow;
			data.frustumCulled = this.frustumCulled;
			data.renderOrder = this.renderOrder;
			
			// Get object matrix
			this.updateMatrix();
			data.matrixAutoUpdate = this.matrixAutoUpdate;
			data.matrix = this.matrix.toArray();
			
			// Get object userData
			data.userData = _unbuildAny(this.userData);
			
			// If object is Mesh/Line/Points...
			if (this instanceof THREE.Mesh || this instanceof THREE.Line || this instanceof THREE.LineSegments || this instanceof THREE.Points)
			{
				
				// Get object Mesh/Line/Points flag...
				if (this instanceof THREE.Mesh)
				{
					data.isMesh = this.isMesh;
				}
				else if (this instanceof THREE.Line)
				{
					data.isLine = this.isLine;
				}
				else if (this instanceof THREE.Points)
				{
					data.isPoints = this.isPoints;
				}
				
				// Get object geometry...
				if (this.geometry)
				{
					data.geometry = this.geometry.toJSON();
				}
				
				// Get object material...
				if (this.material)
				{
					if (Array.isArray(this.material))
					{
						data.material = this.material.map((m) => m.toJSON());
					}
					else
					{
						data.material = this.material.toJSON();
					}
				}
				
			}
			
			// Recursively get object's simplified child objects
			data.children = this.children.map((child) => child.simplified());
			
			// Return simplified object
			return data;
			
		};
		
		// Add a function to the Object3D class which sets the object's attributes from a simplified version of the object
		THREE.Object3D.prototype.setSimplified = function(data)
		{
			
			// Set object ID info
			this.uuid = data.uuid;
			this.name = data.name;
			this.type = data.type;
			
			// Set object basic info
			this.visible = data.visible;
			this.castShadow = data.castShadow;
			this.receiveShadow = data.receiveShadow;
			this.frustumCulled = data.frustumCulled;
			this.renderOrder = data.renderOrder;
			
			// Set object matrix and extract it into separate variables...
			this.matrixAutoUpdate = data.matrixAutoUpdate;
			if (data.matrix)
			{
				this.matrix.fromArray(data.matrix);
				this.matrix.decompose(this.position, this.quaternion, this.scale);
			}
			
			// Set object Mesh/Line/Points flag...
			if (data.isMesh)
			{
				this.isMesh = data.isMesh;
			}
			else if (data.isLine)
			{
				this.isLine = data.isLine;
			}
			else if (data.isPoints)
			{
				this.isPoints = data.isPoints;
			}
			
			// Re-build object userData
			this.userData = _rebuildAny(data.userData);
			
			// Re-build object geometry...
			if (data.geometry)
			{
				
				// If there's geometry which can be parsed directly by the geometry loader...
				if (data.geometry && data.geometry.data && data.geometry.data.attributes)
				{
					
					// Initialize geometry loader and parse geometry to re-build it
					const geometry_loader = new THREE.BufferGeometryLoader();
					this.geometry = geometry_loader.parse(data.geometry);
					
					
				} // Otherwise, if geometry needs to be re-built manually instead...
				else
				{
					
					// Re-build geometry manually...
					this.geometry = _rebuildAny({
						__type: 'ThreeGeneric',
						class: data.geometry.type || 'BufferGeometry',
						value: data.geometry
					});
					
				}
				
				// Re-compute geometry bounds
				this.geometry.computeBoundingBox();
				this.geometry.computeBoundingSphere();
				
				
			} // Otherwise, if object has no geometry to re-build...
			else
			{
				
				// No geometry!
				this.geometry = undefined;
				
			}
			
			// Re-build object material...
			if (data.material)
			{
				
				// Initialize material loader
				const material_loader = new THREE.MaterialLoader();
				
				// Attempt to re-build material...
				if (Array.isArray(data.material))
				{
					this.material = data.material.map((material_data) => material_loader.parse(material_data));
				}
				else
				{
					this.material = material_loader.parse(data.material);
				}
				
				
			}  // Otherwise, if object has no material to re-build...
			else
			{
				
				// No material!
				this.material = undefined;
				
			}
			
			// Clear any existing child objects...
			while (this.children.length > 0)
			{
				this.remove(this.children[0]);
			}
			
			// Re-build child objects...
			if (Array.isArray(data.children))
			{
				
				// Iterate through all child objects...
				for (const child of data.children)
				{
					
					// Re-build child object
					const new_child = _createObject3DOfType(child.type);
					new_child.setSimplified(child);
					
					// Add child object to array
					this.add(new_child);
					
				}
				
			}
			
			// Return re-built object
			return this;
			
		};
		
		// Add a deep clone function to the Object3D type along with a userData clone function to handle recursion (the Object3D's default clone method doesn't clone certain stuff, sad puppey)
		THREE.Object3D.prototype.userDataClone = function(clone)
		{
			if (this.userData)
			{
				Object.entries(this.userData).forEach(([key, value]) => {
					if (typeof value.clone === 'function')
					{
						clone.userData[key] = value.clone();
					}
					else
					{
						clone.userData[key] = structuredClone(value);
					}
				});
			}
			
			if (this.geometry)
			{
				clone.geometry = this.geometry.clone();
			}
			
			if (this.material)
			{
				clone.material = this.material.clone();
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
			
			if (this.geometry)
			{
				clone.geometry = this.geometry.clone();
			}
			
			if (this.material)
			{
				clone.material = this.material.clone();
			}
			
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
		
		// Add a function to the Object3D type which gets the top-most parent from an object's chain of parents' parents
		THREE.Object3D.prototype.getTopMostParent = function()
		{
			let object = this;
			
			while (object.parent && !(object.parent instanceof THREE.Scene))
			{
				object = object.parent;
			}
			
			return object;
		};
		
	//#endregion
	
	
	//#region [Helper Functions]
		
		/**
		 * Initialize a new Object3D of the specified type.
		 *
		 * @param {string} type A string value specifying the type of Object3D to return.
		 * @returns Returns a new Object3D of the specified type.
		 */
		function _createObject3DOfType(type)
		{
			switch (type)
			{
				case 'Mesh':         return new THREE.Mesh();
				case 'Line':         return new THREE.Line();
				case 'LineSegments': return new THREE.LineSegments();
				case 'Points':       return new THREE.Points();
				case 'Group':        return new THREE.Group();
				default:             return new THREE.Object3D();
			}
		}
		
		/**
		 * Attempts to re-build a geometry object of the specified type using the data provided.
		 *
		 * @param {string} type A string value specifying the type of geometry to return.
		 * @param {Object} data The geometry object with parameters to be re-built.
		 * @returns Returns a new geometry object of the specified type.
		 */
		function _rebuildGeometryByParameter(type, data)
		{
			switch (type)
			{
				case 'BoxGeometry': return new THREE.BoxGeometry(data.width, data.height, data.depth, data.widthSegments, data.heightSegments, data.depthSegments);
				case 'PlaneGeometry': return new THREE.PlaneGeometry(data.width, data.height, data.widthSegments, data.heightSegments);
				case 'CircleGeometry': return new THREE.CircleGeometry(data.radius, data.segments, data.thetaStart, data.thetaLength);
				case 'SphereGeometry': return new THREE.SphereGeometry(data.radius, data.widthSegments, data.heightSegments, data.phiStart, data.phiLength, data.thetaStart, data.thetaLength);
				case 'CylinderGeometry': return new THREE.CylinderGeometry(data.radiusTop, data.radiusBottom, data.height, data.radialSegments, data.heightSegments, data.openEnded, data.thetaStart, data.thetaLength);
				case 'ConeGeometry': return new THREE.ConeGeometry(data.radius, data.height, data.radialSegments, data.heightSegments, data.openEnded, data.thetaStart, data.thetaLength);
				case 'TorusGeometry': return new THREE.TorusGeometry(data.radius, data.tube, data.radialSegments, data.tubularSegments, data.arc);
				case 'TorusKnotGeometry': return new THREE.TorusKnotGeometry(data.radius, data.tube, data.tubularSegments, data.radialSegments, data.p, data.q);
				case 'RingGeometry': return new THREE.RingGeometry(data.innerRadius, data.outerRadius, data.thetaSegments, data.phiSegments, data.thetaStart, data.thetaLength);
				case 'TetrahedronGeometry': return new THREE.TetrahedronGeometry(data.radius, data.detail);
				case 'OctahedronGeometry': return new THREE.OctahedronGeometry(data.radius, data.detail);
				case 'IcosahedronGeometry': return new THREE.IcosahedronGeometry(data.radius, data.detail);
				case 'DodecahedronGeometry': return new THREE.DodecahedronGeometry(data.radius, data.detail);
				case 'PolyhedronGeometry': return new THREE.PolyhedronGeometry(data.vertices, data.indices, data.radius, data.detail);
				default:
					console.warn(`_rebuildGeometryByParameter: Unrecognized param-based geometry type "${type}". Returning empty BufferGeometry.`);
					return new THREE.BufferGeometry();
			}
		}
		
		/**
		 * Disassembles the specified value into a format which can be encoded and compressed for storage and communication.
		 *
		 * @param {any} value The value to be disassembled.
		 * @returns Returns the disassembled value.
		 */
		function _unbuildAny(value)
		{
			
			// Null / Primitives
			if (value === null || value === undefined || typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean')
			{
				return value;
			}
			
			// Arrays
			if (Array.isArray(value))
			{
				return { __type: 'Array', value: value.map(_unbuildAny) };
			}
			
			// Sets
			if (value instanceof Set)
			{
				return { __type: 'Set', value: Array.from(value).map(_unbuildAny) };
			}
			
			// Maps
			if (value instanceof Map)
			{
				return {
					__type: 'Map',
					value: Array.from(value.entries()).map(([k, v]) => [_unbuildAny(k), _unbuildAny(v)])
				};
			}
			
			// Object3Ds
			if (value instanceof THREE.Object3D)
			{
				return {
					__type: 'Object3D',
					value: value.simplified()
				};
			}
			
			// BufferAttributes
			if (value instanceof THREE.BufferAttribute || value instanceof THREE.InterleavedBufferAttribute)
			{
				return {
					__type: 'ThreeGeneric',
					class: (value instanceof THREE.InterleavedBufferAttribute ? 'InterleavedBufferAttribute' : 'BufferAttribute'),
					value: {
						itemSize: 	value.itemSize,
						type: 		value.array?.constructor?.name || 'Float32Array',
						array: 		Array.from(value.array),
						normalized: value.normalized === true,
						name: 		value.name || undefined
					}
				};
			}
			
			// ThreeGeneric (BufferGeometry / Material / Texture / Color / etc.)
			if (value && typeof value.toJSON === 'function')
			{
				return {
					__type: 'ThreeGeneric',
					class: value.constructor?.name || 'UnknownThreeClass',
					value: value.toJSON()
				};
			}
			
			// Object / Date
			if (typeof value === 'object')
			{
				
				// Date
				if (value instanceof Date)
				{
					return { __type: 'Date', value: value.toISOString() };
				}
				
				// Object
				const result = {};
				for (const key in value)
				{
					if (Object.prototype.hasOwnProperty.call(value, key))
					{
						result[key] = _unbuildAny(value[key]);
					}
				}
				
				return { __type: 'Object', value: result };
			}
			
			// Function
			if (typeof value === 'function')
			{
				return { __type: 'Function', value: '[Function]' };
			}
			
			// If all else fails, return a string
			return String(value);
			
		}
		
		/**
		 * Re-builds the specified object back into its original type.
		 *
		 * @param {Object} data The object to be re-built.
		 * @returns Returns the re-built object.
		 */
		function _rebuildAny(data)
		{
			
			// Null / Primitives
			if (data === null || data === undefined || typeof data === 'number' || typeof data === 'string' || typeof data === 'boolean')
			{
				return data;
			}
			
			// If the specified object is in the expected format...
			if (typeof data === 'object' && data.__type)
			{
				
				// Attempt to re-build the object by type...
				switch (data.__type)
				{
					
					// Arrays
					case 'Array':
					{
						return data.value.map(_rebuildAny);
					}
					
					// Sets
					case 'Set':
					{
						return new Set(data.value.map(_rebuildAny));
					}
					
					// Maps
					case 'Map':
					{
						return new Map(data.value.map(([k, v]) => [_rebuildAny(k), _rebuildAny(v)]));
					}
					
					// Object3Ds
					case 'Object3D':
					{
						const new_object = _createObject3DOfType(data.value.type);
						new_object.setSimplified(data.value);
						return new_object;
					}
					
					// ThreeGeneric (BufferGeometry / Material / Texture / Color / etc.)
					case 'ThreeGeneric':
					{
						
						// Geometry
						if (data.class.endsWith('Geometry'))
						{
							
							// If there's geometry which can be parsed directly by the geometry loader...
							if (data.value && data.value.data && data.value.data.attributes)
							{
								
								// Initialize geometry loader and parse geometry to re-build it
								const geometry_loader = new THREE.BufferGeometryLoader();
								return geometry_loader.parse(data.value);
								
								
							} // Otherwise, if geometry needs to be re-built manually instead...
							else
							{
								
								// Re-build geometry manually
								return _rebuildGeometryByParameter(data.class, data.value);
								
							}
						}
						
						// Material
						if (data.class.endsWith('Material'))
						{
							const material_loader = new THREE.MaterialLoader();
							return material_loader.parse(data.value);
						}
						
						// Colors
						if (data.class === 'Color')
						{
							return new THREE.Color(data.value);
						}
						
						// Textures
						if (data.class === 'Texture')
						{
							return new THREE.Texture();
						}
						
						// BufferAttributes
						if (data.class === 'BufferAttribute' || data.class === 'InterleavedBufferAttribute')
						{
							
							// Get attribute array
							const typed_array_constructor = globalThis[data.value.type] || Float32Array;
							const typed_array = new typed_array_constructor(data.value.array);
							
							// Initialize attribute...
							let attribute;
							if (data.class === 'BufferAttribute')
							{
								attribute = new THREE.BufferAttribute(typed_array, data.value.itemSize, data.value.normalized);
							}
							else
							{
								attribute = new THREE.BufferAttribute(typed_array, data.value.itemSize, data.value.normalized);
							}
							
							// Set attribute name...
							if (data.value.name)
							{
								attribute.name = data.value.name;
							}
							
							// Return re-built attribute
							return attribute;
							
						}
						
						return data.value;
						
					}
					
					// Objects
					case 'Object':
					{
						
						// Attempt to re-build object...
						const new_object = {};
						for (const key in data.value)
						{
							new_object[key] = _rebuildAny(data.value[key]);
						}
						
						// Return re-built object
						return new_object;
						
					}
					
					// Dates
					case 'Date':
					{
						return new Date(data.value);
					}
					
					// Functions
					case 'Function':
					{
						return undefined;
					}
					
					default:
					{
						return data.value;
					}
					
				}
				
				
			} // Otherwise, if the specified object is missing its __type field...
			else if (typeof data === 'object')
			{
				
				// Attempt to re-build object...
				const new_object = {};
				for (const key in data)
				{
					new_object[key] = _rebuildAny(data[key]);
				}
				
				// Return re-built object
				return new_object;
				
			}
			
			return data;
			
		}
		
	//#endregion
	
}