// three.js Import
import * as THREE from '../three.js';

// Class Imports
import Billboard from '../../../classes/billboard.class.js';

class CustomObjectLoader extends THREE.ObjectLoader
{
    constructor(manager)
    {
        super(manager);
    }

    parseObject(data, geometries, materials, animations)
    {
        let object;

        switch (data.type)
        {
            case 'Billboard':
                object = new Billboard();

                // Assign geometry and material
                object.geometry = geometries[data.geometry];
                object.material = materials[data.material];

                // Apply custom properties if any
                // object.customProperty = data.customProperty;
                // object.texture = data.texture;
                // object.texture_back = data.texture_back;
                // object.texture_left = data.texture_left;
                // object.texture_right = data.texture_right;

                // Parse standard object properties
                super.parseObject(data, object, geometries, materials, animations);

                break;

            default:
                object = super.parseObject(data, geometries, materials, animations);
        }

        return object;
    }
}

export { CustomObjectLoader };