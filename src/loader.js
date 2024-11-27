import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function loadBearModel(scene, callback) {
    const loader = new GLTFLoader();
    loader.load('./static/bear.glb', (glb) => {
        const bearModel = glb.scene;

        // Setting the position and rotation
        bearModel.position.set(0, 0, 0);
        bearModel.rotation.y = Math.PI / 2;

        scene.add(bearModel);

        // Creating AnimationMixer
        const mixer = new THREE.AnimationMixer(bearModel);
        const clip = THREE.AnimationClip.findByName(glb.animations, 'idle');
        if (clip) {
            mixer.clipAction(clip).play();
        }

        // Returning the model and animation via callback
        callback(bearModel, mixer);
    });
}

// Function for downloading map
export function loadMapModel(scene, callback) {
    const loader = new GLTFLoader();
    loader.load('./static/map_cinematic_full.glb', (glb) => {
        const mapModel = glb.scene;

        scene.add(mapModel);

        // Returning the card model via callback
        callback(mapModel);
    });
}