// three.js Import
import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';

// Class Imports
import World from '../Classes/world.class.js';


// Custom Game Worlds

/**
 * Custom game world - World1.
 */
class World1
{
	
	/**
	 * Initializes the custom game world.
	 */
	constructor()
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
		higherPlane.position.z = -23;
		higherPlane.position.y = 10; // Plane height
		this.world.addTerrain(higherPlane);

		// Ramp
		const rampGeometry = new THREE.PlaneGeometry(10, 15);
		const rampMaterial = new THREE.MeshBasicMaterial({ color: 0x555555 });
		const ramp = new THREE.Mesh(rampGeometry, rampMaterial);
		ramp.rotation.x = -Math.PI / 3; // Diagonal ramp
		ramp.position.set(0, 0, -10); // Adjust position to connect planes
		this.world.addTerrain(ramp);
		
		
		// Initialize Objects

		// Enemy
		const enemyGeometry = new THREE.BoxGeometry(1, 2, 1);
		const enemyMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
		const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
		enemy.position.set(5, 1, -10);
		this.world.addObject(enemy);

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
	constructor()
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
