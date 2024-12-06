import * as THREE from 'three';

export class ImageManager {
    constructor() {
        this._map = null;
        this._loader = null;
        this._Init();
    }

    _Init() {
        this._map = new Map();
        this._loader = new THREE.TextureLoader();
    }

    async _waitUntil(condition, time = 100) {
        while (!condition()) {
            await new Promise((resolve) => setTimeout(resolve, time));
        }
    }

    async LoadImage(name) {
        let loadingComplete = false; 
        let image = null;

        if (this._map.has(name)) {
            return this._map.get(name);
        }

        this._loader.load('./static/' + name, function(_image) {
            image = _image;
            loadingComplete = true;
        });

        await this._waitUntil(() => loadingComplete === true);
        
        this._map.set(name, image);

        return this._map.get(name);
    }

    GetImageByName(name) {
        return this._map.get(name);
    }
}