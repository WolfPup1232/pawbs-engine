// three.js Imports
import * as THREE from '../libraries/threejs/three.js';
import { CustomOutlineEffect } from '../libraries/threejs/modules/CustomOutlineEffect.js';

// Class Imports
import World from './world.class.js';
import Player from './player.class.js';
import Controls from './controls.class.js';

// Event Handler Imports
import initializeEditorUIEventHandlers from '../handlers/editor.events.js';
import initializeUtilityUIEventHandlers from '../handlers/utility.events.js';

// Static Class Imports
import Assets from './assets.class.js';

/**
 * The game.
 */
class Game
{
	
	// Class Declarations
	
	// 
	static player;
	
	// 
	static world;
	
	
	// HTML Elements
	
	// 
	static window_interface;
	
	// 
	static dom_document;
	
	
	// Renderer
	
	// 
	static renderer;
	
	// Renderer Flags
	
	// 
	static render_once = false;
	
	// 
	static stop_animating = false;
	
	
	// Constructor
	
	/**
	 * Initializes the game.
	 */
	static
	{
		
		// Do nothing.
		
	}
	
	
	// Methods
	
	 /**
	 * Re-initializes the game.
	 *
	 * @param {Window} window_interface A reference to the web browser window, which contains the DOM document.
	 * @param {Document} dom_document A reference to the DOM document within the web browser window.
	 * @param {Function} callback The callback function which is invoked when the game is initialized.
	 */
	static initialize(window_interface, dom_document, callback)
	{
	
		// Initialize browser something
		this.window_interface = window_interface;
		this.dom_document = dom_document;
		
		// Initialize renderer
		let renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		$('#renderer').append(renderer.domElement);
		
		// Initialize cel shader effect
		this.renderer = new CustomOutlineEffect(renderer, { defaultThickness: 0.0032 });
		
		// Initialize world
		this.world = new World();
		this.world.load(Assets.worlds.TestWorld)
		
		// Initialize player
		this.player = new Player();
		
		// Initialize player's keyboard/mouse controls
		this.player.controls = new Controls();
		this.player.controls.initializeControlEventListeners();
		
		// Initialize UI event handlers
		initializeUtilityUIEventHandlers();
		initializeEditorUIEventHandlers();
		
		// Perform the next step using the callback function
		callback();
		
	}
	
	/**
	 * Updates the game.
	 */
	static update()
	{
		
		// Update the world
		//this.world.update();
		
		// Update the player (movement, collision detection, etc.)
		this.player.update();
		
	}
	
}
export default Game;