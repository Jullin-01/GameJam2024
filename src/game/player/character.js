import * as THREE from 'three';
import { FiniteStateMachine, State } from '../../common/finiteStateMachine.js';
import { ModelManager } from '../../resourceManager/modelManager.js';

export class Character {
    constructor(model, color, rigidbody, position, orientation, control) {
        this._model = model;
        this._color = color;
        this._rigidbody = rigidbody;
        this._position = position;
        this._orientation = orientation;
        this._control = control;

        this._accelerationBonus = 0;

        this._Init();
    }

    _Init() {
        if (this._color) {
            ModelManager.UpdateModelColor(this._model, this._color, 'Mat.base');
        }

        if (this._position) {
            this._model.position.copy(this._position);
        }

        if (this._orientation) {
            this._model.rotation.copy(this._orientation);
        }

        this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
        this._acceleration = new THREE.Vector3(1, 0.15, 8.0);
        this._velocity = new THREE.Vector3(0, 0, 0);

        this._characterFSM = new _CharacterFSM(this);
        this._characterFSM.SetState('idle');
    }

    Update(timeElapsedSec) {
        this._control.Update(timeElapsedSec);
        this._characterFSM.Update(timeElapsedSec, this._control);

        ///////////
        const controlObject = this._model;
        const velocity = this._velocity;
        const frameDecceleration = new THREE.Vector3(
            velocity.x * this._decceleration.x,
            velocity.y * this._decceleration.y,
            velocity.z * this._decceleration.z
        );

        frameDecceleration.multiplyScalar(timeElapsedSec);
        frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
            Math.abs(frameDecceleration.z), Math.abs(velocity.z));

        velocity.add(frameDecceleration);

        const acc = this._acceleration.clone();
        acc.z += this._accelerationBonus;

        if (this._control._keys.forward) {
            velocity.z += acc.z * timeElapsedSec;
        }

        if (this._control._keys.backward) {
            velocity.z -= acc.z * timeElapsedSec;
        }

        if (this._control._keys.left || this._control._keys.right) {
            const direction = this._control._keys.right ? -1 : 1;
            const _Q = new THREE.Quaternion();
            const _A = new THREE.Vector3(0, 1, 0);
            const _R = controlObject.quaternion.clone();
            _Q.setFromAxisAngle(_A, direction * 4.0 * Math.PI * timeElapsedSec * this._acceleration.y);
            _R.multiply(_Q);
            controlObject.quaternion.copy(_R);
        }

        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(controlObject.quaternion);
        forward.normalize();

        const sideways = new THREE.Vector3(1, 0, 0);
        sideways.applyQuaternion(controlObject.quaternion);
        sideways.normalize();

        sideways.multiplyScalar(velocity.x * timeElapsedSec);
        forward.multiplyScalar(velocity.z * timeElapsedSec);
        controlObject.position.add(forward);
        controlObject.position.add(sideways);

        this._rigidbody.Update(timeElapsedSec);

        // TODO:
        this._model.sphereMesh.position.copy(this._model.position).add(this._model.sphereMesh.positionOffset);

        if (this._model.position.y < -20) // TODO:
            this._model.position.set(-2, 2, -11);
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
        this._AddState('jump', _JumpState);
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

    Update(_, input) {
        if (input._keys.forward || input._keys.backward ||
            input._keys.left || input._keys.right) {
            this._parent.SetState('running');
        } else if (input._keys.space) {
            this._parent.SetState('jump');
        }
    }
};

class _JumpState extends State {
    constructor(parent) {
        super(parent, 'jump');

        this._FinishedCallback = () => {
            this._Finished();
        };
    }

    Enter(prevState) {
        const animations = this._parent._character._model.animations;
        const mixer = this._parent._character._model.mixer;
        const clip = THREE.AnimationClip.findByName(animations, 'jump');
        const jumpAction = mixer.clipAction(clip);

        mixer.addEventListener('finished', this._FinishedCallback);

        if (prevState) {
            const prevClip = THREE.AnimationClip.findByName(animations, prevState.Name);
            const prevAction = mixer.clipAction(prevClip);

            jumpAction.reset();
            jumpAction.setLoop(THREE.LoopOnce, 1);
            jumpAction.clampWhenFinished = true;
            jumpAction.crossFadeFrom(prevAction, 0.2, true);
            jumpAction.play();
        } else {
            jumpAction.play();
        }
    }

    _Finished() {
        this._Cleanup();

        const input = this._parent._character._control;

        if (input._keys.forward || input._keys.backward) {
            this._parent.SetState('running');
            return;
        }

        this._parent.SetState('idle');
    }

    _Cleanup() {
        const mixer = this._parent._character._model.mixer;
        mixer.removeEventListener('finished', this._FinishedCallback);
    }

    Exit() {
        this._Cleanup();
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

            if (prevState.Name == 'jump') {
                const ratio = runAction.getClip().duration / prevAction.getClip().duration;
                runAction.time = prevAction.time * ratio;
            } else {
                runAction.time = 0.0;
                runAction.setEffectiveTimeScale(1.0);
                runAction.setEffectiveWeight(1.0);
            }

            runAction.crossFadeFrom(prevAction, 0.5, true);
            runAction.play();
        } else {
            runAction.play();
        }
    }

    Exit() {
    }

    Update(_, input) {
        if (input._keys.forward || input._keys.backward ||
            input._keys.left || input._keys.right) {
            if (input._keys.space) {
                this._parent.SetState('jump');
            }
            return;
        }

        this._parent.SetState('idle');
    }
};