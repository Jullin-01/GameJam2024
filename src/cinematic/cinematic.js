import * as THREE from 'three';
//import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {CinematicFSM} from './cinematicFSM.js';
import { Character } from '../character.js';
import * as ENV from './environmentPosition.js';
import * as BEARS from './bearPosition.js';
import * as PORTAL from './portalShader.js';

export class Cinematic {
    constructor(parent) {
        console.log('Cinematic constructor');
        this._parent = parent;
        this._resourceLoader = parent._ResourceLoader;
        this._viewport = parent._Viewport;       
        this._cinematicFSM = null;
        this._mixersArray = [];
        this._bears = [];       
        this._uTime = 0;

        this._isRenderingEnabled = false;

        this._Init();
    }

    _Init() {
        this._scene = new THREE.Scene();

        // Renderer
        this._renderer = this._viewport.GetRenderer();

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
        this._ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.0);
        this._scene.add(this._ambientLight);

        this._directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.5);
        this._directionalLight.position.set(10, 12, 7);
        
        this._directionalLight.castShadow = true;
        this._directionalLight.shadow.bias = -0.0005;
        this._directionalLight.shadow.normalBias = 0.05;
        
        this._directionalLight.shadow.mapSize.width = 2048;
        this._directionalLight.shadow.mapSize.height = 2048;
        this._directionalLight.shadow.camera.near = 0.5;
        this._directionalLight.shadow.camera.far = 50;

        this._directionalLight.shadow.camera.left = -25;
        this._directionalLight.shadow.camera.right = 25;
        this._directionalLight.shadow.camera.bottom = -25;
        this._directionalLight.shadow.camera.top = 25;

        this._scene.add(this._directionalLight);

        const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1.0);
        this._scene.add(hemisphereLight);

        const portalLight = new THREE.PointLight(0x00FF00, 3.0);
        portalLight.position.set(-10.0052, 0.75, 5.7884);
        this._scene.add(portalLight);

        // Controls
        //this._controls = new OrbitControls(this._camera, this._renderer.domElement);

        // map
        this._cinematicMap = this._resourceLoader._modelManager.GetCloneGlbModelByName('map_cinematic_full.glb');

        // portal material
        this._portalMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: {
                    value: 0
                },
            },
            vertexShader: PORTAL._VS,
            fragmentShader: PORTAL._FS,
        });

        this._cinematicMap.children[2].material = this._portalMaterial;

        this._scene.add(this._cinematicMap);

        this._renderer.compile(this._scene, this._camera);

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

        this._cinematicFSM = new CinematicFSM(this);
        this._cinematicFSM.SetState('part1');

        this._clock = new THREE.Clock();
    }

    StartRendering() {
        this._viewport._isCinematic = true;
        this._viewport._camera = null;
        this._viewport.Resize();
        this._isRenderingEnabled = true;
        this._Animate();
    }

    StopRendering() {
        this._isRenderingEnabled = false;
    }

    _LoadEnvironmentModels(modelName, attr) {
        const modelManager = this._resourceLoader._modelManager;
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
        const modelManager = this._resourceLoader._modelManager;
        const bears = this._bears;
        const scene = this._scene;

        for (let i = 0; i < BEARS.bearsAttributes.length; i++) {
            const model = modelManager.GetCloneGlbModelByName('bear.glb');
  
            const position = new THREE.Vector3(BEARS.bearsAttributes[i][0].x, BEARS.bearsAttributes[i][0].z, -BEARS.bearsAttributes[i][0].y);
            const color = new THREE.Vector3(BEARS.bearsAttributes[i][1].r, BEARS.bearsAttributes[i][1].g, BEARS.bearsAttributes[i][1].b);
            const orientation = new THREE.Euler(0, Math.PI / 2, 0, 'XYZ');

            const character = new Character(model, color, 'Mat.base', position, orientation);

            scene.add(character._model);
            this._mixersArray.push(character._model.mixer);

            bears.push(character);
        }
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
        if (this._isRenderingEnabled) {
            requestAnimationFrame(this._Animate.bind(this));

            const delta = this._clock.getDelta();

            this._uTime += delta;
            this._portalMaterial.uniforms.uTime.value = this._uTime;

            if (this._cinematicFSM) {
                this._cinematicFSM.Update(delta);
            }

            this._bears.forEach((bear) => {
                if (bear) {
                    bear.Update(delta);
                }
            });

            this._mixersArray.forEach((mixer) => {
                if (mixer) {
                    mixer.update(delta);
                }
            });

            if (this._camera) {
                this._renderer.render(this._scene, this._camera);
            }
        }
    }
}