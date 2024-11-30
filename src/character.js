import * as THREE from 'three';
import { FiniteStateMachine, State } from './common/finiteStateMachine.js';
import { ModelManager } from './resourceManager/modelManager.js';

export class Character {
    constructor(model, color, colorName, position, orientation) {
        this._model = model;
 
        ModelManager.UpdateGlbModelColor(this._model, color, colorName);
        this._model.position.copy(position);
        this._model.rotation.copy(orientation);

        this._velocityRunning = 1;
        this._directionRunning = new THREE.Vector3(1, 0, 0);
        this._isRunning = false;

        this._Init();
    }

    _Init() {
        this._characterFSM = new _CharacterFSM(this);
        this._characterFSM.SetState('idle');
    }

    SetPositionAndOrientation(position, orientation) {
        this._model.position.copy(position);
        this._model.rotation.copy(orientation);
    }

    StartRunning() {
        this._characterFSM.SetState('running');
        this._isRunning = true;
    }

    StopRunning() {
        this._isRunning = false;
        this._characterFSM.SetState('idle');
    }

    Update(timeElapsedSec) {
        if (this._isRunning) {
            this._model.position.add(this._directionRunning.clone().multiplyScalar(this._velocityRunning * timeElapsedSec));
        }
    }
};

class _CharacterFSM extends FiniteStateMachine {
    constructor(character) {
        super();
        this._character = character;
        this._Init();
    }

    _Init() {
        this._AddState('idle', _IdleState);
        this._AddState('running', _RunningState);
    }
};

class _IdleState extends State {
    constructor(parent) {
        super(parent, 'idle');
    }

    Enter(prevState) {
        const animations = this._parent._character._model.animations;
        const mixer = this._parent._character._model.mixer;
        const clip = THREE.AnimationClip.findByName(animations, 'idle');
        const idleAction = mixer.clipAction(clip);

        if (prevState) {
            const prevClip = THREE.AnimationClip.findByName(animations, prevState.Name);
            const prevAction = mixer.clipAction(prevClip);
            idleAction.time = 0.0;
            idleAction.enabled = true;
            idleAction.setEffectiveTimeScale(1.0);
            idleAction.setEffectiveWeight(1.0);
            idleAction.crossFadeFrom(prevAction, 0.5, true);
            idleAction.play();
        } else {
            idleAction.play();
        }
    }

    Exit() {
    }

    Update() {
    }
};

class _RunningState extends State {
    constructor(parent) {
        super(parent, 'running');
    }

    Enter(prevState) {
        const animations = this._parent._character._model.animations;
        const mixer = this._parent._character._model.mixer;
        const clip = THREE.AnimationClip.findByName(animations, 'running');
        const runAction = mixer.clipAction(clip);
        if (prevState) {
            const prevClip = THREE.AnimationClip.findByName(animations, prevState.Name);
            const prevAction = mixer.clipAction(prevClip);

            runAction.enabled = true;

            runAction.time = 0.0;
            runAction.setEffectiveTimeScale(1.0);
            runAction.setEffectiveWeight(1.0);

            runAction.crossFadeFrom(prevAction, 0.5, true);
            runAction.play();
        } else {
            runAction.play();
        }
    }

    Exit() {
    }

    Update() {
    }
};