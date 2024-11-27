import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {CameraSwitcher} from './camera.js';


export class Cinematic {
    constructor(renderer) {
        console.log('Cinematic constructor');
        this._renderer = renderer;
        this._is_rendering_enabled = false;
        this._cameraSwitcher = new CameraSwitcher();
        this._Init();
    }

    _Init() {
        this._scene = new THREE.Scene();

        this._canvas = document.getElementById('canvas');

        // Renderer
        this._renderer = new THREE.WebGLRenderer({ canvas: this._canvas });
        this._renderer.setSize(window.innerWidth, window.innerHeight);

        // Camera
        this._camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        
        this._updateCameraPosition();
        this._scene.add(this._camera);

        // Skybox
        this._skyboxMaterialArray = [
            new THREE.MeshBasicMaterial({ map: this._createGradientTexture('#B0E0E6', '#76b5dc'), side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ map: this._createGradientTexture('#B0E0E6', '#76b5dc'), side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ map: this._createGradientTexture('#B0E0E6', '#B0E0E6'), side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ map: this._createGradientTexture('#76b5dc', '#76b5dc'), side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ map: this._createGradientTexture('#B0E0E6', '#76b5dc'), side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ map: this._createGradientTexture('#B0E0E6', '#76b5dc'), side: THREE.BackSide }),
        ];
        this._skyboxGeometry = new THREE.BoxGeometry(50, 50, 50);
        this._skybox = new THREE.Mesh(this._skyboxGeometry, this._skyboxMaterialArray);
        this._scene.add(this._skybox);

        // Lights
        this._ambientLight = new THREE.AmbientLight(0xEDEDED, 0.8);
        this._scene.add(this._ambientLight);

        this._directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
        this._directionalLight.position.set(10, 11, 7);
        this._scene.add(this._directionalLight);

        // Controls
        this._controls = new OrbitControls(this._camera, this._renderer.domElement);

        // Event Listener
        window.addEventListener('resize', () => this._OnWindowResize());
        window.addEventListener('click', () => this._SwitchCamera());

        // Animate
        this._clock = new THREE.Clock();
        this._Animate();
        this._LoadBearModel();
        this._LoadMapModel();
    }

    _OnWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Updating the location of the side camera
        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();

        // Update render sizes
        this._renderer.setSize(width, height);
    }

    _createGradientTexture(color1, color2) {
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

    _LoadBearModel() {
        this._loader = new GLTFLoader();
        this._bearModel = null;
        this._mixer = null;

        this._loader.load(
            './static/bear.glb',
            (glb) => {
                this._bearModel = glb.scene;
                this._bearModel.position.set(0, 0, 0);
                this._bearModel.rotation.y = Math.PI / 2;
                this._scene.add(glb.scene);
                this._mixer = new THREE.AnimationMixer(glb.scene);
                this._mixer.clipAction(THREE.AnimationClip.findByName(glb.animations, 'idle')).play();
            },
        );
    }

    _LoadMapModel() {
        this._loader = new GLTFLoader();
        this._mapModel = null;

        this._loader.load(
            './static/map_cinematic_full.glb',
            (glb) => {
                this._mapModel = glb.scene;
                this._scene.add(glb.scene);
            },
        );
    }

    _updateCameraPosition() {
        // Getting current position from CameraSwitcher
        const position = this._cameraSwitcher.getCurrentPosition();
        this._camera.position.set(position.x, position.y, position.z);
        this._camera.lookAt(0, 0, 0); // Looking to the center of the stage
    }

    _SwitchCamera() {
        // Switch to next camera
        const nextPosition = this._cameraSwitcher.switchToNextCamera();
        this._updateCameraPosition();
        console.log(`Switched to camera at position: x=${nextPosition.x}, y=${nextPosition.y}, z=${nextPosition.z}`);
    }

    _Animate() {
        requestAnimationFrame(this._Animate.bind(this));

        const delta = this._clock.getDelta();

        if (this._mixer) {
            this._mixer.update(delta);
        }

        this._controls.update();
        this._renderer.render(this._scene, this._camera);
    }
}