import { AudioManager } from './audioManager.js';
import { ModelManager } from './modelManager.js';

let audioFiles = [
    'GameSketch1.wav',
    'GameSketch1.2.wav'
];

let glbFiles = [
    'bear.glb',
    'map_cinematic_full.glb'
];

export class ResourceLoader {
    constructor() {
        this._audioManager = null;
        this._modelManager = null;
        this._Init();
    }

    _Init() {
        this._audioManager = new AudioManager();
        this._modelManager = new ModelManager();
    }

    async AllLoad(callback) {
        // audio
        for (let i = 0; i < audioFiles.length; i++)
        {
            this._audioManager.LoadAudio(audioFiles[i]);
        }

        // glb
        for (let i = 0; i < glbFiles.length; i++)
        {
            await this._modelManager.LoadGlbModel(glbFiles[i]);
        }

        callback();
    }
};