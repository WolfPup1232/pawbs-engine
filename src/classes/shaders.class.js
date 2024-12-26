// three.js Imports
import * as THREE from '../libraries/threejs/three.js';

/**
 * A collection of useful custom shaders.
 */
class Shaders
{
	
	
	// Constructor
	
	/**
	 * Initializes the collection of custom shaders.
	 */
	static
	{
		
		// Do nothing.
		
	}
	
	
	// Methods
	
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
	 * @param {float} radius_size The size of the highlighted radius.
	 * @param {hexidecimal} radius_colour The colour of the highlighted radius.
	 * @return {THREE.ShaderMaterial} The custom shader material for a THREE.Points object.
	 */
	static pointOutlineInRadius(point_colour, point_size, outline_colour, outline_size, radius_size, radius_colour)
	{
		return new THREE.ShaderMaterial({
			uniforms: {
				point_colour: { value: new THREE.Color(point_colour) },
				outline_colour: { value: new THREE.Color(outline_colour) },
				radius_colour: { value: new THREE.Color(radius_colour) },
				point_size: { value: point_size },
				outline_size: { value: outline_size },
				radius_size: { value: radius_size },
				intersection_point: { value: new THREE.Vector3() }
			},
			vertexShader: `
				uniform float radius_size;
				uniform float point_size;
				
				varying float within_square;
				
				uniform vec3 intersection_point;
				
				void main()
				{
					vec4 world_position = modelMatrix * vec4(position, 1.0);
					vec3 offset = world_position.xyz - intersection_point;
					
					// Check if the point is within the square radius in the XZ plane...
					if (abs(offset.x) <= radius_size && abs(offset.z) <= radius_size)
					{
						// Inside the square
						within_square = 1.0;
					}
					else
					{
						// Outside the square
						within_square = 0.0;
					}
					
					vec4 view_position = modelViewMatrix * vec4(position, 1.0);
					gl_PointSize = point_size * (300.0 / -view_position.z);
					gl_Position = projectionMatrix * view_position;
				}
			`,
			fragmentShader: `
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
					
					// Determine color based on whether the point is within the square
					vec3 color = mix(point_colour, radius_colour, within_square);
					
					if (distance > (0.5 - outline_size))
					{
						gl_FragColor = vec4(outline_colour, 1.0);
					}
					else
					{
						gl_FragColor = vec4(color, 1.0);
					}
				}
			`,
			transparent: true
		});
	}
	
}
export default Shaders;