// three.js Imports
import * as THREE from '../libraries/threejs/three.js';

// Static Class Imports
import Editor from './editor.class.js';

/**
 * A collection of useful custom shaders.
 */
class Shaders
{
	
	//#region [Constructor]
		
		/**
		 * Initializes the collection of custom shaders.
		 */
		static { }
		
	//#endregion
	
	
	//#region [Methods]
		
		/**
		 * Returns an solid colour cel shader material.
		 *
		 * @param {hexidecimal} colour The material's colour.
		 * @param {THREE.Vector3} gradient_direction The direction of the lighting gradient.
		 * @return {THREE.ShaderMaterial} The custom shader material.
		 */
		static celShader(colour, gradient_direction)
		{
			return new THREE.ShaderMaterial({
				uniforms: {
					colour: { value: new THREE.Color(colour) },
					gradient_direction: { value: gradient_direction } // Default THREE.Vector3(1.0, 1.0, 0.0)
				},
				vertexShader: `
					varying vec3 transformed_normal;
					
					void main()
					{
						transformed_normal = normalize(normalMatrix * normal);
						gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
					}
				`,
				fragmentShader: `
					varying vec3 transformed_normal;
					
					uniform vec3 colour;
					uniform vec3 gradient_direction;
					
					void main()
					{
						vec3 normal = normalize(transformed_normal);
						
						float gradient_factor = dot(normal, normalize(gradient_direction));
						gradient_factor = (gradient_factor + 1.0) / 2.0;
						
						vec3 final_colour = colour * gradient_factor;
						
						gl_FragColor = vec4(final_colour, 1.0);
					}
				`,
				transparent: true
			});
		}
		
		/**
		 * Returns an outlined colour shader material for a THREE.Points object.
		 *
		 * @param {hexidecimal} point_colour The colour of each point.
		 * @param {float} point_size The radius of each point.
		 * @param {hexidecimal} outline_colour The colour of each point's outline.
		 * @param {float} outline_size The thickness of each point's outline.
		 * @return {THREE.ShaderMaterial} The custom shader material for a THREE.Points object.
		 */
		static pointOutline(point_colour, point_size, outline_colour, outline_size)
		{
			return new THREE.ShaderMaterial({
				uniforms: {
					point_colour: { value: new THREE.Color(point_colour) },
					outline_colour: { value: new THREE.Color(outline_colour) },
					point_size: { value: point_size },
					outline_size: { value: outline_size }
				},
				vertexShader: `
					uniform float point_size;
					
					void main()
					{
						vec4 view_position = modelViewMatrix * vec4(position, 1.0);
						gl_PointSize = point_size * (300.0 / -view_position.z);
						gl_Position = projectionMatrix * view_position;
					}
				`,
				fragmentShader: `
					uniform vec3 point_colour;
					uniform vec3 outline_colour;
					uniform float outline_size;
					
					void main()
					{
						vec2 origin = gl_PointCoord - vec2(0.5);
						float distance = length(origin);
						
						if (distance > 0.5)
						{
							discard;
						}
						
						if (distance > (0.5 - outline_size))
						{
							gl_FragColor = vec4(outline_colour, 1.0);
						}
						else
						{
							gl_FragColor = vec4(point_colour, 1.0);
						}
					}
				`,
				transparent: true
			});
		}
		
		/**
		 * Returns an outlined colour shader material for a THREE.Points object.
		 *
		 * @param {hexidecimal} point_colour The colour of each point.
		 * @param {float} point_size The radius of each point.
		 * @param {hexidecimal} outline_colour The colour of each point's outline.
		 * @param {float} outline_size The thickness of each point's outline.
		 * @param {Editor.TerrainTools} radius_shape The the highlighted radius's shape.
		 * @param {float} radius_size The size of the highlighted radius.
		 * @param {hexidecimal} radius_colour The colour of the highlighted radius.
		 * @return {THREE.ShaderMaterial} The custom shader material for a THREE.Points object.
		 */
		static pointOutlineInRadius(point_colour, point_size, outline_colour, outline_size, radius_shape, radius_size, radius_colour)
		{
			return new THREE.ShaderMaterial({
				uniforms: {
					point_colour: { value: new THREE.Color(point_colour) },
					outline_colour: { value: new THREE.Color(outline_colour) },
					radius_colour: { value: new THREE.Color(radius_colour) },
					point_size: { value: point_size },
					outline_size: { value: outline_size },
					radius_size: { value: radius_size },
					radius_shape: { value: radius_shape },
					highlight_vertices: { value: true },
					intersection_point: { value: new THREE.Vector3() }
				},
				vertexShader: `
					uniform vec3 intersection_point;
					
					uniform int radius_shape;
					
					uniform float radius_size;
					uniform float point_size;
					
					varying float within_square;
					
					void main()
					{
						vec4 world_position = modelMatrix * vec4(position, 1.0);
						vec3 offset = world_position.xyz - intersection_point;
						
						within_square = 0.0;
						
						if (radius_shape == 1)
						{
							if (abs(offset.x) <= radius_size && abs(offset.z) <= radius_size)
							{
								within_square = 1.0;
							}
						}
						else if (radius_shape == 2)
						{
							if ((dot(offset, offset)) <= (radius_size * radius_size))
							{
								within_square = 1.0;
							}
						}
						
						vec4 view_position = modelViewMatrix * vec4(position, 1.0);
						gl_PointSize = point_size * (300.0 / -view_position.z);
						gl_Position = projectionMatrix * view_position;
					}
				`,
				fragmentShader: `
					uniform bool highlight_vertices;
					
					uniform vec3 point_colour;
					uniform vec3 radius_colour;
					uniform vec3 outline_colour;
					
					uniform float outline_size;
					
					varying float within_square;
					
					void main()
					{
						vec2 origin = gl_PointCoord - vec2(0.5);
						float distance = length(origin);
						
						if (distance > 0.5)
						{
							discard;
						}
						
						vec3 colour = point_colour;
						
						if (highlight_vertices)
						{
							colour = mix(point_colour, radius_colour, within_square);
						}
						
						if (distance > (0.5 - outline_size))
						{
							gl_FragColor = vec4(outline_colour, 1.0);
						}
						else
						{
							gl_FragColor = vec4(colour, 1.0);
						}
					}
				`,
				transparent: true
			});
		}
		
		/**
		 * Returns a shader material that multiplies a vertical gradient over the base colour/texture while preserving vertex colours.
		 *
		 * @param {THREE.Material} original_material The source material whose colour and texture are used as the base.
		 * @return {THREE.ShaderMaterial} The custom shader material.
		 */
		static Soft(original_material)
		{
			// Check if a texture map is present
			const has_map = !!original_material.map;
			
			// Initialize default fallback colour and texture
			const default_colour = new THREE.Color(0xffffff);
			const default_texture = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, THREE.RGBAFormat);
			default_texture.needsUpdate = true;
			
			// Get base colour and texture
			const base_colour = original_material.color ? original_material.color.clone() : default_colour;
			const texture_map = original_material.map || default_texture;
			
			// Initialize shader material
			let shader_material = new THREE.ShaderMaterial({
				uniforms: {
					base_colour: { value: base_colour },
					texture_map: { value: texture_map },
					use_map:	 { value: has_map }
				},
				vertexColors: true,
				vertexShader: `
					varying vec2 vertex_uv;
					varying vec3 vertex_colour;
					
					void main()
					{
						vertex_uv = uv;
						vertex_colour = color;
						
						gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
					}
				`,
				fragmentShader: `
					uniform vec3 base_colour;
					uniform sampler2D texture_map;
					uniform bool use_map;
					
					varying vec2 vertex_uv;
					varying vec3 vertex_colour;
					
					void main()
					{
						// Start from base material colour multiplied by per-vertex colour.
						vec3 final_colour = base_colour * vertex_colour;
						
						// Optionally multiply by the texture sample.
						if (use_map)
						{
							final_colour *= texture2D(texture_map, vertex_uv).rgb;
						}
						
						// Gentle vertical gradient (UV-space Y).
						float gradient_factor = 0.4 + 0.6 * vertex_uv.y;
						final_colour *= gradient_factor;
						
						gl_FragColor = vec4(final_colour, 1.0);
					}
				`,
				transparent: true
			});
			
			// Mirror useful fields for external use
			shader_material.color = base_colour;
			shader_material.map = texture_map;
			shader_material.side = THREE.DoubleSide;
			
			// Return shader material
			return shader_material;
			
		}
		
		/**
		 * Empty shader.
		 *
		 * @returns Nothing.
		 */
		static None()
		{
			return null;
		}
		
		
	//#endregion
	
}
export default Shaders;