import * as THREE from 'three';

export class PlayerCamera {
    constructor(camera, object) {
        this._camera = camera;
        this._object = object;

        this._currentPosition = new THREE.Vector3();
        this._currentLookat = new THREE.Vector3();
    }

    _CalculateIdealOffset() {
        const idealOffset = new THREE.Vector3(0, 4.0, -5);
        idealOffset.applyQuaternion(this._object._model.quaternion);
        idealOffset.add(this._object._model.position);
        return idealOffset;
    }

    _CalculateIdealLookat() {
        const idealLookat = new THREE.Vector3(0, 0.25, 5);
        idealLookat.applyQuaternion(this._object._model.quaternion);
        idealLookat.add(this._object._model.position);
        return idealLookat;
    }

    SetCamera(camera) {
        this._camera = camera;
    }

    SetObject(object) {
        this._object = object;
    }

    Update(timeElapsedSec) {
        if (!this._camera || !this._object)
            return;

        const idealOffset = this._CalculateIdealOffset();
        const idealLookat = this._CalculateIdealLookat();

        // const t = 0.05;
        // const t = 4.0 * timeElapsed;
        const t = 1.0 - Math.pow(0.001, timeElapsedSec);

        this._currentPosition.lerp(idealOffset, t);
        this._currentLookat.lerp(idealLookat, t);

        this._camera.position.copy(this._currentPosition);
        this._camera.lookAt(this._currentLookat);
    }
};