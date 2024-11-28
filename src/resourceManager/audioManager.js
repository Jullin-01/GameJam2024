import * as THREE from 'three';

export class AudioManager {
    constructor() {
        this._map = null;
        this._audioListener = null;
        this._sound = null;
        this._loader = null;
        this._Init();
    }

    _Init() {
        this._map = new Map();
        this._loader = new THREE.AudioLoader();
    }

    async _waitUntil(condition, time = 100) {
        while (!condition()) {
            await new Promise((resolve) => setTimeout(resolve, time));
        }
    }

    async LoadAudio(name) {
        let loadingComplete = false; 
        let audio = null;

        if (this._map.has(name)) {
            return this._map.get(name);
        }

        this._loader.load('./static/' + name, function(buffer) {
            audio = buffer;
            loadingComplete = true;
        });

        await this._waitUntil(() => loadingComplete === true);
        
        this._map.set(name, audio);

        return this._map.get(name);
    }

    InitAudioPlayer() {
        this._audioListener = new THREE.AudioListener();
        this._sound = new THREE.Audio(this._audioListener);
    }

    StartPlayback(name, loopFlag) {
        if (this._sound) {
            this._sound.setBuffer(this._map.get(name));
            this._sound.setLoop(loopFlag);
            this._sound.play();
        }
    }

    StopPlayback() {
        if (this._sound) {
            this._sound.stop();
        }
    }
}