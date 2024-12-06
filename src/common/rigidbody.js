import * as THREE from 'three';
import { Game } from '../game/game.js';

const params = {
    gravity: -9.8,
};

export class Rigidbody {
    constructor(object, collider, useGravity, isKinematic) {
        this._object = object;            // Model for which the rigidbody is created.
        this._collider = collider;        // Collider surrounding the model.
        this._useGravity = useGravity;    // If enabled, the object is affected by gravity.
        this._isKinematic = isKinematic;  // If enabled, the object will not be driven by the physics engine.

        this._velocityY = 0;
        this._isOnGround = false;
        this._position = new THREE.Vector3(0, 0, 0);
        this._newPosition = new THREE.Vector3(0, 0, 0);
        this._tmp1V3 = new THREE.Vector3(0, 0, 0);
        this._tmp2V3 = new THREE.Vector3(0, 0, 0);
    }

    _closestPointOnOBB(obb, point) {
        const halfSize = obb.halfSize;
        const localPoint = this._tmp1V3.copy(point).sub(obb.center);
        const closestPoint = this._tmp2V3.set(0, 0, 0);

        for (let i = 0; i < 3; i++) {
            let dist = localPoint.dot(obb.axes[i]);
            dist = Math.max(-halfSize.getComponent(i), Math.min(halfSize.getComponent(i), dist));
            closestPoint.addScaledVector(obb.axes[i], dist);
        }

        return closestPoint.add(obb.center);
    }

    Update(timeElapsedSec) {
        if (this._isKinematic || this._collider.type != "Sphere")
            return;

        this._position.copy(this._object.position);

        if (this._useGravity) {
            if (this._isOnGround) {
                this._velocityY = timeElapsedSec * params.gravity;
            } else {
                this._velocityY += timeElapsedSec * params.gravity;
            }
        }

        this._position.y += this._velocityY * timeElapsedSec;
        this._object.position.y = this._position.y;

        const worldColliders = Game.worldColliders;

        this._newPosition.copy(this._position).add(this._collider.offset);

        worldColliders.forEach((collider) => {
            if (collider.type == "Sphere") {
                const correctionVector = this._newPosition.clone().sub(collider.object.center).normalize();
                const dist = collider.object.center.distanceTo(this._newPosition) - collider.object.radius;

                if (dist < this._collider.object.radius) {
                    const penetrationDepth = this._collider.object.radius - dist;
                    this._newPosition.add(correctionVector.multiplyScalar(penetrationDepth));
                }
            } else if (collider.type == "Box") {
                const closestPoint = this._closestPointOnOBB(collider.obb, this._newPosition);
                const dist = closestPoint.distanceTo(this._newPosition);
                const correctionVector = this._newPosition.clone().sub(closestPoint).normalize();

                if (dist < this._collider.object.radius) {
                    const penetrationDepth = this._collider.object.radius - dist;
                    this._newPosition.add(correctionVector.multiplyScalar(penetrationDepth));
                }
            }
        });

        const deltaVector = this._tmp1V3;
        const tmpPosition = this._tmp2V3.copy(this._position).add(this._collider.offset);

        deltaVector.subVectors(this._newPosition, tmpPosition);

        this._isOnGround = deltaVector.y > Math.abs(timeElapsedSec * this._velocityY * 0.25);

        const offset = Math.max(0.0, deltaVector.length() - 1e-5);
        deltaVector.normalize().multiplyScalar(offset);

        this._object.position.add(deltaVector);
        this._collider.object.center.copy(this._object.position).add(this._collider.offset); // TODO:

        if (!this._isOnGround) { // TODO:
            deltaVector.normalize();
            //this._object.velocity.addScaledVector(deltaVector, - deltaVector.dot(this._object.velocity));
        } else {
            this._velocityY = 0;
        }
    }
};
