import * as THREE from 'three';
//import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {CinematicFSM} from './cinematicFSM.js';
import { Character } from '../character.js';
import * as ENV from './environmentPosition.js';

export class Cinematic {
    constructor(parent) {
        console.log('Cinematic constructor');
        this._parent = parent;
        this._is_rendering_enabled = false;
        
        this._cinematicFSM = null;

        this._mixersArray = [];
        this._bears = [];
        
        this._Init();
    }

    _Init() {
        this._scene = new THREE.Scene();
        this._canvas = document.getElementById('canvas');

        // Renderer
        this._renderer = new THREE.WebGLRenderer({ canvas: this._canvas });
        this._renderer.setSize(window.innerWidth, window.innerHeight);

        this._fov = 22.89519413064574;
        this._aspect = 16 / 9;

        // Camera
        this._camera = new THREE.PerspectiveCamera(
            this._fov,
            this._aspect,
            0.1,
            1000
        );
        this._scene.add(this._camera);

        this._OnWindowResize();

        // Skybox
        this._skyboxMaterialArray = [
            new THREE.MeshBasicMaterial({ map: this._CreateGradientTexture('#B0E0E6', '#76b5dc'), side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ map: this._CreateGradientTexture('#B0E0E6', '#76b5dc'), side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ map: this._CreateGradientTexture('#B0E0E6', '#B0E0E6'), side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ map: this._CreateGradientTexture('#76b5dc', '#76b5dc'), side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ map: this._CreateGradientTexture('#B0E0E6', '#76b5dc'), side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ map: this._CreateGradientTexture('#B0E0E6', '#76b5dc'), side: THREE.BackSide }),
        ];
        this._skyboxGeometry = new THREE.BoxGeometry(450, 450, 450);
        this._skybox = new THREE.Mesh(this._skyboxGeometry, this._skyboxMaterialArray);
        this._scene.add(this._skybox);

        // Lights
        this._ambientLight = new THREE.AmbientLight(0xEDEDED, 0.8);
        this._scene.add(this._ambientLight);

        this._directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
        this._directionalLight.position.set(10, 11, 7);
        this._scene.add(this._directionalLight);

        // Controls
        //this._controls = new OrbitControls(this._camera, this._renderer.domElement);

        // map
        this._cinematicMap = this._parent._modelManager.GetCloneGlbModelByName('map_cinematic_full.glb');
        this._scene.add(this._cinematicMap);

        // flowers, mushrooms, threes, rocks
        this._LoadEnvironmentModels('flower.glb', ENV.flowersAttributes);
        this._LoadEnvironmentModels('mushroom.glb', ENV.mushroomsAttributes);
        this._LoadEnvironmentModels('three1.glb', ENV.three1Attributes);
        this._LoadEnvironmentModels('three2.glb', ENV.three2Attributes);
        this._LoadEnvironmentModels('three3.glb', ENV.three3Attributes);
        this._LoadEnvironmentModels('three4.glb', ENV.three4Attributes);
        this._LoadEnvironmentModels('rock1.glb', ENV.rock1Attributes);
        this._LoadEnvironmentModels('rock2.glb', ENV.rock2Attributes);
        this._LoadEnvironmentModels('rock3.glb', ENV.rock3Attributes);
        this._LoadEnvironmentModels('rock4.glb', ENV.rock4Attributes);
        this._LoadEnvironmentModels('rock5.glb', ENV.rock5Attributes);

        // Bears [0] - main1, [1] - main2, [2..n] - other
        this._CreateBearsArray();

        this._bears[2].StartRunning(); // test

        this._cinematicFSM = new CinematicFSM(this);
        this._cinematicFSM.SetState('part1');

        // Event Listener
        window.addEventListener('resize', () => this._OnWindowResize());
        //window.addEventListener('click', () => this._SwitchCamera());

        // Animate
        this._clock = new THREE.Clock();
        this._Animate();
    }

    _LoadEnvironmentModels(modelName, attr) {
        const modelManager = this._parent._modelManager;
        const scene = this._scene;

        for (let i = 0; i < attr.length; i++) {
            const model = modelManager.GetCloneGlbModelByName(modelName);
            const position = new THREE.Vector3(attr[i][0].x, attr[i][0].z, -attr[i][0].y);
            const scale = new THREE.Vector3(attr[i][1].x, attr[i][1].z, attr[i][1].y);

            model.position.copy(position);
            model.scale.copy(scale);

            scene.add(model);
        }        
    }

    _CreateBearsArray() {
        const bearsAttributes = [
            // color,              position,             orientation
            [{ r: 1, g: 0, b: 0 }, { x: 0, y: 0, z: 0 }, { x: 0, y: Math.PI / 2, z: 0, order: 'XYZ' }],
            [{ r: 0, g: 1, b: 0 }, { x: -1, y: 0, z: -1 }, { x: 0, y: Math.PI / 2, z: 0, order: 'XYZ' }],
            [{ r: 0, g: 1, b: 1 }, { x: -8, y: 0, z: 6 }, { x: 0, y: Math.PI / 2, z: 0, order: 'XYZ' }],
        ];

        const modelManager = this._parent._modelManager;
        const bears = this._bears;
        const scene = this._scene;

        for (let i = 0; i < bearsAttributes.length; i++) {
            const model = modelManager.GetCloneGlbModelByName('bear.glb');
  
            const color = new THREE.Vector3(bearsAttributes[i][0].r, bearsAttributes[i][0].g, bearsAttributes[i][0].b);
            const position = new THREE.Vector3(bearsAttributes[i][1].x, bearsAttributes[i][1].y, bearsAttributes[i][1].z);
            const orientation = new THREE.Euler(bearsAttributes[i][2].x, bearsAttributes[i][2].y, bearsAttributes[i][2].z, bearsAttributes[i][2].order);

            const character = new Character(model, color, 'Mat.base', position, orientation);

            scene.add(character._model);
            this._mixersArray.push(character._model.mixer);

            bears.push(character);
        }
    }

    _OnWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
 
        const windowAspect = width / height;

        if (windowAspect > this._aspect) {
            // The screen is wider than necessary - add stripes on the sides
            const renderHeight = height;
            const renderWidth = renderHeight * this._aspect;
            this._renderer.setSize(renderWidth, renderHeight);

            // Center the canvas horizontally
            this._renderer.domElement.style.marginLeft = `${(width - renderWidth) / 2}px`;
            this._renderer.domElement.style.marginTop = `0px`;
        } else {
            // The screen is higher than necessary - add stripes at the top and bottom
            const renderWidth = width;
            const renderHeight = renderWidth / this._aspect;
            this._renderer.setSize(renderWidth, renderHeight);

            // Center the canvas vertically
            this._renderer.domElement.style.marginTop = `${(height - renderHeight) / 2}px`;
            this._renderer.domElement.style.marginLeft = `0px`;
        }
 
        // Updating the location of the side camera
        //this._camera.aspect = width / height;
        //this._camera.updateProjectionMatrix();

        // Update render sizes
        //this._renderer.setSize(width, height);
    }

    _CreateGradientTexture(color1, color2) {
        const size = 512; // Texture size
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Create a Linear Gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, size);
        gradient.addColorStop(0, color1); // Up
        gradient.addColorStop(1, color2); // Down

        // Fill with a gradient
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        // Creating a texture
        return new THREE.CanvasTexture(canvas);
    }

    _SwitchToCameraNumber(cameraNumber) {
        cameraNumber = cameraNumber % this._cinematicMap.cameras.length;

        const cameraFov = this._cinematicMap.cameras[cameraNumber].fov;
        const cameraPosition = this._cinematicMap.cameras[cameraNumber].position;
        const cameraRotation = this._cinematicMap.cameras[cameraNumber].rotation;
        
        this._camera.fov = cameraFov;
        this._camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
        this._camera.rotation.copy(new THREE.Euler(cameraRotation.x, cameraRotation.y, cameraRotation.z, cameraRotation.order));
    }

    _SwitchCamera(cameraNumber) {
        this._SwitchToCameraNumber(cameraNumber);
    }

    _Animate() {
        requestAnimationFrame(this._Animate.bind(this));

        const delta = this._clock.getDelta();

        if (this._cinematicFSM) {
            this._cinematicFSM.Update(delta);
        }

        this._bears.forEach((bear) => {
            if(bear) {
                bear.Update(delta);
            }
        });

        this._mixersArray.forEach((mixer) => {
            if (mixer) {
                mixer.update(delta);
            }
        });

        //this._controls.update();
        if (this._camera) {
            this._renderer.render(this._scene, this._camera);
        }
    }
}