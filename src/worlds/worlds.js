// three.js Import
import * as THREE from '../libraries/threejs/three.js';

// Class Imports
import World from '../classes/world.class.js';
import Billboard from '../classes/billboard.class.js';


// Custom Game Worlds

/**
 * Custom game world - World1.
 */
class World1
{
	
	/**
	 * Initializes the custom game world.
	 */
	constructor(textures)
	{
		
		// Initialize World
		this.world = new World();
		
		
		// Initialize Terrain
		
		// Lower Plane
		const lowerPlaneGeometry = new THREE.PlaneGeometry(100, 100);
		const lowerPlaneMaterial = new THREE.MeshBasicMaterial({ color: 0x302400 });
		const lowerPlane = new THREE.Mesh(lowerPlaneGeometry, lowerPlaneMaterial);
		lowerPlane.rotation.x = -Math.PI / 2;
		lowerPlane.position.y = 0;
		this.world.addTerrain(lowerPlane);

		// Higher Plane
		const higherPlaneGeometry = new THREE.PlaneGeometry(20, 20);
		const higherPlaneMaterial = new THREE.MeshBasicMaterial({ color: 0x705504 });
		const higherPlane = new THREE.Mesh(higherPlaneGeometry, higherPlaneMaterial);
		higherPlane.rotation.x = -Math.PI / 2;
		higherPlane.position.x = 0;
		higherPlane.position.z = -25;
		higherPlane.position.y = 3.5; // Plane height
		this.world.addTerrain(higherPlane);

		// Ramp
		const rampGeometry = new THREE.PlaneGeometry(10, 15);
		const rampMaterial = new THREE.MeshBasicMaterial({ color: 0x555555 });
		const ramp = new THREE.Mesh(rampGeometry, rampMaterial);
		ramp.rotation.x = -Math.PI / 3; // Diagonal ramp
		ramp.position.set(0, 0, -10); // Adjust position to connect planes
		this.world.addTerrain(ramp);
		
		
		// Initialize Objects
		
		// Campfire1
		const campfire1 = new Billboard(1.5, 1.5, textures.campfire);
		campfire1.position.set(-5, 0.75, -10);
		//this.world.addObject(campfire1);
		
		// Campfire2
		const campfire2 = new Billboard(1.5, 1.5, textures.campfire);
		campfire2.position.set(3, 0.75, -10);
		//this.world.addObject(campfire2);

		// Step1
		const step1Geometry = new THREE.BoxGeometry(3, 0.4, 3);
		const step1Material = new THREE.MeshBasicMaterial({ color: 0xac8053 });
		const step1 = new THREE.Mesh(step1Geometry, step1Material);
		step1.position.set(5, 0.2, -10);
		this.world.addObject(step1);
		
		// Step2
		const step2Geometry = new THREE.BoxGeometry(3, 0.4, 3);
		const step2Material = new THREE.MeshBasicMaterial({ color: 0x9b734b });
		const step2 = new THREE.Mesh(step2Geometry, step2Material);
		step2.position.set(7.5, 0.6, -10);
		this.world.addObject(step2);
		
		// Step3
		const step3Geometry = new THREE.BoxGeometry(3, 0.4, 3);
		const step3Material = new THREE.MeshBasicMaterial({ color: 0x8a6642 });
		const step3 = new THREE.Mesh(step3Geometry, step3Material);
		step3.position.set(10, 1, -10);
		this.world.addObject(step3);
		
		// Step4
		const step4Geometry = new THREE.BoxGeometry(3, 0.52, 3);
		const step4Material = new THREE.MeshBasicMaterial({ color: 0xff9900 });
		const step4 = new THREE.Mesh(step4Geometry, step4Material);
		step4.position.set(15, 0.26, -10);
		this.world.addObject(step4);
		
		// Step5
		const step5Geometry = new THREE.BoxGeometry(3, 0.52, 3);
		const step5Material = new THREE.MeshBasicMaterial({ color: 0xe68a00 });
		const step5 = new THREE.Mesh(step5Geometry, step5Material);
		step5.position.set(20, 1.26, -10);
		this.world.addObject(step5);
		
		// Step6
		const step6Geometry = new THREE.BoxGeometry(3, 0.52, 3);
		const step6Material = new THREE.MeshBasicMaterial({ color: 0xcc7a00 });
		const step6 = new THREE.Mesh(step6Geometry, step6Material);
		step6.position.set(25, 2.5, -10);
		this.world.addObject(step6);
		
		// Step7
		const step7Geometry = new THREE.BoxGeometry(3, 0.52, 3);
		const step7Material = new THREE.MeshBasicMaterial({ color: 0x1a0f00 });
		const step7 = new THREE.Mesh(step7Geometry, step7Material);
		step7.position.set(32, 5, -10);
		this.world.addObject(step7);

		// Tree on Lower Plane
		const treeTrunkGeometry = new THREE.CylinderGeometry(0.5, 0.5, 5);
		const treeTrunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
		const tree = new THREE.Mesh(treeTrunkGeometry, treeTrunkMaterial);
		tree.position.set(-5, 2.5, -15);
		this.world.addObject(tree);

		const treeCrownGeometry = new THREE.SphereGeometry(2);
		const treeCrownMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
		const treeCrown = new THREE.Mesh(treeCrownGeometry, treeCrownMaterial);
		treeCrown.position.set(-5, 6, -15);
		this.world.addObject(treeCrown);

		// Tree on Higher Plane
		const tree2TrunkGeometry = new THREE.CylinderGeometry(0.5, 0.5, 5);
		const tree2TrunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
		const tree2 = new THREE.Mesh(tree2TrunkGeometry, tree2TrunkMaterial);
		tree2.position.set(10, 12.5, 10);
		this.world.addObject(tree2);

		const tree2CrownGeometry = new THREE.SphereGeometry(2);
		const tree2CrownMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
		const tree2Crown = new THREE.Mesh(tree2CrownGeometry, tree2CrownMaterial);
		tree2Crown.position.set(10, 17, 10);
		this.world.addObject(tree2Crown);
		
	}
	
}


/**
 * Custom game world - World2.
 */
class World2
{
	
	/**
	 * Initializes the custom game world.
	 */
	constructor(textures)
	{
		
		// Initialize World
		this.world = new World();
		
		
		// Initialize Terrain
		
		// Lower Plane
		const lowerPlaneGeometry = new THREE.PlaneGeometry(100, 100);
		const lowerPlaneMaterial = new THREE.MeshBasicMaterial({ color: 0x302400 });
		const lowerPlane = new THREE.Mesh(lowerPlaneGeometry, lowerPlaneMaterial);
		lowerPlane.rotation.x = -Math.PI / 2;
		lowerPlane.position.y = 0;
		this.world.addTerrain(lowerPlane);
		
		
		// Initialize Objects

		// Tree on Lower Plane
		const treeTrunkGeometry = new THREE.CylinderGeometry(0.5, 0.5, 5);
		const treeTrunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
		const tree = new THREE.Mesh(treeTrunkGeometry, treeTrunkMaterial);
		tree.position.set(-5, 2.5, -15);
		this.world.addObject(tree);

		const treeCrownGeometry = new THREE.SphereGeometry(2);
		const treeCrownMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
		const treeCrown = new THREE.Mesh(treeCrownGeometry, treeCrownMaterial);
		treeCrown.position.set(-5, 6, -15);
		this.world.addObject(treeCrown);
		
	}
	
}

export { World1, World2 };
