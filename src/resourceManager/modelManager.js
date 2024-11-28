import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

export class ModelManager {
    constructor() {
        this._map = null;
        this._loader = null;
        this._Init();
    }

    _Init() {
        this._map = new Map();
        this._loader = new GLTFLoader();
    }

    async LoadGlbModel(name) {
        let model = null;

        if (this._map.has(name)) {
            return this.CloneGlbModel(this._map.get(name));
        }

        let glb = await this._loader.loadAsync('./static/' + name);

        model = glb.scene;

        if (glb.hasOwnProperty('animations')) {
            model.animations = glb.animations;
        }

        this._map.set(name, model);

        return this.CloneGlbModel(model);
    }

    CloneGlbModel(model) {
        let copyOfModel = model;

        copyOfModel = clone(model);

        copyOfModel.traverse(function (object) {
            if (object.material && object.material.name == 'Mat.base') {
                object.material = object.material.clone();
            }
        });

        if (model.hasOwnProperty('animations')) {
            copyOfModel.mixer = new THREE.AnimationMixer(copyOfModel);
        }

        return copyOfModel;
    }

    GetCloneGlbModelByName(name) {
        return this.CloneGlbModel(this._map.get(name));
    }

    static UpdateGlbModelColor(model, color, materialName) {
        model.traverse(function (object) {
            if (object.material && object.material.name == materialName) {
                object.material.color.setStyle(color);
            }
        });
    }
}