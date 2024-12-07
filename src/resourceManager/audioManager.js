import * as THREE from 'three';

export class AudioManager {
    constructor() {
        this._map = null;
        this._audioListener = null;
        this._sound = null;
        this._loader = null;
        this._isVolumeOn = true;
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
        this._backgroundSound = new THREE.Audio(this._audioListener);
        this._gameObjSound = new THREE.Audio(this._audioListener);
    }

    SwitchVolume() {
        this._isVolumeOn = !this._isVolumeOn;
        if (this._isVolumeOn)
        {
            this.SetVolumeOn();
        } else {
            this.SetVolumeOff();
        }

        return this._isVolumeOn;
    }

    SetVolumeOn() {
        this._backgroundSound.setVolume(1);
        this._gameObjSound.setVolume(1)
    }

    SetVolumeOff() {
        this._backgroundSound.setVolume(0);
        this._gameObjSound.setVolume(0)
    }

    StartPlaybackBackground(name, loopFlag) {
        if (this._backgroundSound) {
            this._backgroundSound.setBuffer(this._map.get(name));
            this._backgroundSound.setLoop(loopFlag);
            this._backgroundSound.play();
        }
    }

    StopPlaybackBackground() {
        if (this._backgroundSound) {
            this._backgroundSound.stop();
        }
    }

    PlayGameObjSound(name) {
        if (this._gameObjSound) {
            if (this._gameObjSound.isPlaying) {
                this._gameObjSound.stop();
            }

            this._gameObjSound.setBuffer(this._map.get(name));
            this._gameObjSound.setLoop(false);
            this._gameObjSound.play();
        }
    }
}