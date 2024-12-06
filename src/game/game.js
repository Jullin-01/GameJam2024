import * as THREE from 'three';
import { ControllerInput } from './player/controllerInput.js';
import { Character } from './player/character.js';
import { Rigidbody } from '../common/rigidbody.js';
import { PlayerCamera } from './player/playerCamera.js';
import * as ENV from './environmentPositionGame.js';
import * as WALLS from './wallPosition.js';

export class Game {
    static worldColliders = [];

    constructor(parent) {
        console.log('Game constructor');
        this._parent = parent;
        this._resourceLoader = parent._ResourceLoader;
        this._viewport = parent._Viewport;
        this._mixersArray = [];
        this._uTime = 0;

        this._isRenderingEnabled = false;

        this._player = null;
        this._playerCamera = null;

        this._Init();
    }

    _Init() {
        this._scene = new THREE.Scene();

        // Renderer
        this._renderer = this._viewport.GetRenderer();

        this._fov = 45;
        this._aspect = window.innerWidth / window.innerHeight;

        // Camera
        this._camera = new THREE.PerspectiveCamera(
            this._fov,
            this._aspect,
            0.1,
            1000
        );
        //this._camera.position.set(0.85, 1.0, 2.0);
        this._camera.position.set(0, 30, 0);        
        this._camera.lookAt(0, 0, 0);
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

        this._player = this._CreatePlayer();
        this._scene.add(this._player._model.sphereMesh);
        this._scene.add(this._player._model);
        this._mixersArray.push(this._player._model.mixer);

        this._playerCamera = new PlayerCamera(this._camera, this._player);

        this._CreateLabyrinth();

        const cookieMan = this._CreateCookieManClose();
        this._scene.add(cookieMan);

        const cupcake = this._CreateCupcake();
        this._scene.add(cupcake);

        this._goldPlus = this._CreateGoldPlus();
        this._goldPlus.position.set(7.25, 0.25, -7.35);
        this._goldPlus.defaultY = this._goldPlus.position.y;
        this._scene.add(this._goldPlus);
        
        this._wall = this._CreateWall(2, 0.75, 0.5);
        //this._scene.add(this._wall);

        this._renderer.compile(this._scene, this._camera);

        this._clock = new THREE.Clock();
    }

    StartRendering() {
        this._viewport._isCinematic = false;
        this._viewport._camera = this._camera;
        this._viewport.Resize();
        this._isRenderingEnabled = true;
        this._Animate();
    }

    StopRendering() {
        this._isRenderingEnabled = false;
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

    _CreateLabyrinth() {
        this._landscape = this._resourceLoader._modelManager.GetCloneGlbModelByName('mapGame.glb');
        this._scene.add(this._landscape);

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

        this._CreateWalls();
        this._CreateGates();
    }

    _CreateWalls() {
        const scene = this._scene;
        const attr = WALLS.wallsAttributes;

        for (let i = 0; i < attr.length; i++) {
            const model = this._CreateWall(attr[i][1].x, attr[i][1].z, attr[i][1].y);
            model.position.set(attr[i][0].x, attr[i][0].z, -attr[i][0].y);
            scene.add(model);

            const obb = {
                center: model.position.clone(),
                halfSize: new THREE.Vector3(attr[i][1].x / 2, attr[i][1].z / 2, attr[i][1].y / 2),
                axes: [
                    new THREE.Vector3(1, 0, 0).applyQuaternion(model.quaternion),
                    new THREE.Vector3(0, 1, 0).applyQuaternion(model.quaternion),
                    new THREE.Vector3(0, 0, 1).applyQuaternion(model.quaternion)
                ]
            };

            const wallCollider = {
                type: "Box",
                obb: obb,
                object: model
            };

            Game.worldColliders.push(wallCollider);
        }        
    }

    _CreateGates() {
        let gate;
        const gatesAttributes = [
            // position,                     orientation     type
            [{ x: -5.2, y: 0.5, z: -5.2 }, { rotY: 0 }, { type: 'Up' }], // gateUp 1
            [{ x: -3.15, y: 0.5, z: 0 }, { rotY: 0 }, { type: 'Up' }], // gateUp 2
            [{ x: -3.15, y: 0.5, z: -7.35 }, { rotY: 0 }, { type: 'Up' }], // gateUp 3
            [{ x: 1.05, y: 0.5, z: 5.25 }, { rotY: Math.PI / 2 }, { type: 'Up' }], // gateUp 4
            [{ x: 5.25, y: 0.5, z: 3.15 }, { rotY: 0 }, { type: 'Up' }], // gateUp 5
            [{ x: -1.05, y: 0.5, z: -7.35 }, { rotY: 0 }, { type: 'Up' }], // gateUp 6
            [{ x: 3.15, y: 0.5, z: -1.05 }, { rotY: Math.PI / 2 }, { type: 'Up' }], // gateUp 7
            [{ x: -7.3, y: 0.5, z: 0 }, { rotY: 0 }, { type: 'Down' }], // gateDown 1
            [{ x: -7.3, y: 0.5, z: 4.2 }, { rotY: 0 }, { type: 'Down' }], // gateDown 2
            [{ x: -3.15, y: 0.5, z: 6.25 }, { rotY: 0 }, { type: 'Down' }], // gateDown 3
            [{ x: 5.25, y: 0.5, z: 0 }, { rotY: 0 }, { type: 'Down' }], // gateDown 4
            [{ x: 7.25, y: 0.5, z: -2.1 }, { rotY: 0 }, { type: 'Down' }], // gateDown 5
            [{ x: 7.25, y: 0.5, z: -6.25 }, { rotY: 0 }, { type: 'Down' }], // gateDown 6
            [{ x: 4.2, y: 0.5, z: -7.3 }, { rotY: Math.PI / 2 }, { type: 'Down' }], // gateDown 7
        ];

        const gateUp = this._CreateGateUp();
        const gateDown = this._CreateGateDown();

        for (let i = 0; i < gatesAttributes.length; i++) {
            gate = gatesAttributes[i][2].type == 'Up' ? gateUp.clone() : gateDown.clone();
            gate.position.set(gatesAttributes[i][0].x, gatesAttributes[i][0].y, gatesAttributes[i][0].z);
            gate.rotateY(gatesAttributes[i][1].rotY);
            this._scene.add(gate);
        }
    }

    _CreatePlayer() {
        const model = this._resourceLoader._modelManager.GetCloneGlbModelByName('bear.glb');
        const control = new ControllerInput();
        const playerStartPosition = new THREE.Vector3(-8.6, 0, -1);
        const playerStartOrientation = new THREE.Euler(0, Math.PI / 2, 0, 'XYZ');

        const colliderOffset = new THREE.Vector3(0, 0.25, 0);
        const spherePosition = new THREE.Vector3().copy(playerStartPosition).add(colliderOffset);

        const collider = {
            type: "Sphere",
            offset: colliderOffset,
            object: new THREE.Sphere(spherePosition, 0.25)
        };

        const rigidbody = new Rigidbody(model, collider, false, false);
        const player = new Character(model, null, rigidbody, playerStartPosition, playerStartOrientation, control);

        if (1) {
            const sphereGeometry = new THREE.SphereGeometry(0.25, 32, 16);
            const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 });
            const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphereMesh.positionOffset = collider.offset;
            sphereMesh.position.copy(playerStartPosition).add(sphereMesh.positionOffset);
            player._model.sphereMesh = sphereMesh;
        }
    
        return player;
    }

    _CreateWall(width, height, depth) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshLambertMaterial({ /*color: 0x00ff00*/ map: this._CreateGradientTexture('#9E7216', '#9F7023') });
        const wall = new THREE.Mesh(geometry, material);
        wall.castShadow = true;
        wall.receiveShadow = true;
        
        return wall;
    }

    _CreateGoldPlus() {
        const group = new THREE.Group();

        const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const material = new THREE.MeshLambertMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 0.3});
        const cube = new THREE.Mesh(geometry, material);
        cube.castShadow = true;

        group.add(cube);

        let tmpCube = cube.clone();
        tmpCube.position.set(0.1, 0, 0);
        group.add(tmpCube);
        
        tmpCube = cube.clone();
        tmpCube.position.set(-0.1, 0, 0);
        group.add(tmpCube);

        tmpCube = cube.clone();
        tmpCube.position.set(0, 0.1, 0);
        group.add(tmpCube);

        tmpCube = cube.clone();
        tmpCube.position.set(0, -0.1, 0);
        group.add(tmpCube);
        
        return group;
    }

    _CreateCupcake() {
        const texture = this._resourceLoader._imageManager.GetImageByName('cupcake.png');
        const planeGeometry = new THREE.PlaneGeometry(0.55, 0.5);
        const planeMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.position.set(1.05, 0.25, -3.15);
        return plane;
    }

    _CreateCookieManOpen() {
        return this._CreateCookieMan(true);
    }

    _CreateCookieManClose() {
        return this._CreateCookieMan(false);
    }

    _CreateCookieMan(isOpen) {
        const imageName = isOpen ? 'cookieWelcome.png' : 'cookieStop.png';
        const texture = this._resourceLoader._imageManager.GetImageByName(imageName);
        const planeGeometry = new THREE.PlaneGeometry(1.1, 1);
        const planeMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotateY(-Math.PI / 2);
        plane.position.set(8.7, 0.5, 1.05);
        return plane;
    }

    _CreateGateUp() {
        return this._CreateGate(true);
    }

    _CreateGateDown() {
        return this._CreateGate(false);
    }

    _CreateGate(isUp) {
        const group = new THREE.Group();

        const planeGeometry = new THREE.PlaneGeometry(1, 1);
        const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xcaf0f8, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        group.add(plane);

        const shape = new THREE.Shape();
        shape.moveTo(0, 0.125);
        shape.lineTo(-0.25, -0.125);
        shape.lineTo(0.25, -0.125);
        shape.lineTo(0, 0.125);            
        const geometry = new THREE.ShapeGeometry(shape);
        const color = isUp ? 0x4cbb17 : 0xed2939;
        const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
        const triangle = new THREE.Mesh(geometry, material);
        triangle.position.set(0, 0, 0.001);

        if (!isUp) {
            triangle.rotateZ(Math.PI);
        }

        group.add(triangle);

        const triangle2 = triangle.clone();
        triangle2.position.set(0, 0, -0.001);
        group.add(triangle2);

        return group;
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

    _Animate() {
        if (this._isRenderingEnabled) {
            requestAnimationFrame(this._Animate.bind(this));

            const delta = this._clock.getDelta();
            this._uTime += delta;

            if (delta > 0) {
                this._goldPlus.rotateY((-2 * Math.PI * delta) / 8);
                this._goldPlus.position.y = this._goldPlus.defaultY + Math.sin(this._clock.getElapsedTime() * 2) * 0.025;

                this._wall.rotateY((2 * Math.PI * delta) / 8);

                if (this._player) {
                    this._player.Update(delta);
                }

                this._playerCamera.Update(delta);
            }

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