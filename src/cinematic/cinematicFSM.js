import * as THREE from 'three';
import { FiniteStateMachine, State } from '../common/finiteStateMachine.js';

export class CinematicFSM extends FiniteStateMachine {
    constructor(parent) {
        super();
        this._parent = parent;
        this._Init();
    }

    _Init() {
        this._AddState('part1', _Part1); // "orange bear looks at the world"
        this._AddState('part2', _Part2); // "green bear runs up to orange bear"
        this._AddState('part3', _Part3); // "green bear and orange bear agree to run away together"
        this._AddState('part4', _Part4); // "many bears are running from the portal to this world"
        this._AddState('part5', _Part5); // "Game Jam 2024"
    }
};

class _Part1 extends State { // "orange bear looks at the world"
    constructor(parent) {
        super(parent, 'part1');
        this._time = 0;
    }

    Enter(prevState) {
        console.log("Enter Part1");
        this._time = 0;
        this._parent._parent._SwitchCamera(1);
    }

    Exit() {
        console.log("Exit Part1");
    }

    Update(timeElapsedSec) {
        this._time += timeElapsedSec;

        if (this._time >= 5) {
            this._parent.SetState('part2');
        }
    }
};

class _Part2 extends State { // "green bear runs up to orange bear"
    constructor(parent) {
        super(parent, 'part2');
        this._time = 0;

        this._greenBear = this._parent._parent._bears[1];
        this._greenBearBeginPosition =this._greenBear._model.position;
        this._greenBearEndPosition = new THREE.Vector3(-0.2, 0, 0.5);
        this._greenBearDirectionRunning = this._greenBearEndPosition.clone().sub(this._greenBearBeginPosition).normalize();

        const rotY = this._greenBearDirectionRunning.angleTo(new THREE.Vector3(1, 0, 0));
        this._greenBearRotation = new THREE.Euler(0, Math.PI / 2 + rotY, 0, 'XYZ');
    }

    Enter(prevState) {
        console.log("Enter Part2");
        this._time = 0;

        this._greenBear._directionRunning.copy(this._greenBearDirectionRunning);
        this._greenBear._model.rotation.copy(this._greenBearRotation);
        
        this._greenBear.StartRunning();

        this._parent._parent._SwitchCamera(0);
    }

    Exit() {
        console.log("Exit Part2");
        this._greenBear.StopRunning();
        this._greenBear._model.position.copy(this._greenBearEndPosition);
    }

    Update(timeElapsedSec) {
        this._time += timeElapsedSec;

        if (this._greenBear._model.position.x >= -0.2) {
            this._greenBear.StopRunning();
        }

        if (this._time >= 5) {
            this._parent.SetState('part3');
        }
    }
};

class _Part3 extends State { // "green bear and orange bear agree to run away together"
    constructor(parent) {
        super(parent, 'part3');
        this._time = 0;
        this._actionIndex = 0;

        this._orangeBear = this._parent._parent._bears[0];
        this._greenBear = this._parent._parent._bears[1];
        
        this._orangeBearToGreenBearRotation = new THREE.Euler(0, Math.PI / 2 - 0.5, 0, 'XYZ');

        this._rotationRunning = new THREE.Euler(0, Math.PI / 2 - 0.25, 0, 'XYZ');
        this._directionRunning = new THREE.Vector3(0, 0, 1).applyEuler(this._rotationRunning);
    }

    Enter(prevState) {
        console.log("Enter Part3");
        this._time = 0;
        this._actionIndex = 0;
        this._parent._parent._SwitchCamera(1);
    }

    Exit() {
        console.log("Exit Part3");
    }

    Update(timeElapsedSec) {
        this._time += timeElapsedSec;

        if (this._actionIndex == 0 && this._time >= 0.5) // wait
        {
            this._actionIndex++;
        } 
        else if (this._actionIndex == 1) { // orange bear rotation to green bear
            this._actionIndex++;
            this._orangeBear._model.rotation.copy(this._orangeBearToGreenBearRotation);
        } 
        else if (this._actionIndex == 2 && this._time >= 1) { // begin green bear happy
            this._actionIndex++;
            this._greenBear.BecomeHappy();
        }
        else if (this._actionIndex == 3 && this._time >= 2) { // begin orange bear happy
            this._actionIndex++;
            this._greenBear.StopRunning(); // to idle animation
            this._orangeBear.BecomeHappy();
        }
        else if (this._actionIndex == 4 && this._time >= 3) { // end happy
            this._actionIndex++;           
            this._orangeBear.StopRunning(); // to idle animation
            this._greenBear.StopRunning(); // to idle animation
        }
        else if (this._actionIndex == 5 && this._time >= 3.5) { // begin running orange bear
            this._actionIndex++;
            this._orangeBear._model.rotation.copy(this._rotationRunning);
            this._orangeBear._directionRunning.copy(this._directionRunning);
            this._orangeBear.StartRunning();
        }
        else if (this._actionIndex == 6 && this._time >= 3.8) { // begin running green bear
            this._actionIndex++;
            this._greenBear._model.rotation.copy(this._rotationRunning);
            this._greenBear._directionRunning.copy(this._directionRunning);
            this._greenBear.StartRunning();
        }

        if (this._time >= 5) {
            this._parent.SetState('part4');
        }
    }
};

class _Part4 extends State { // "many bears are running from the portal to this world"
    constructor(parent) {
        super(parent, 'part4');
        this._time = 0;

        this._bears = this._parent._parent._bears;
    }

    Enter(prevState) {
        console.log("Enter Part4");
        this._time = 0;

        for (let i = 0; i < this._bears.length; i++) {
                this._bears[i].StartRunning();
        }     

        this._camera = this._parent._parent._camera;

        this._parent._parent._SwitchCamera(3);

        this._beginCameraPosition = new THREE.Vector3(6.00474, 3.88295, 0.578749);
        this._endCameraPosition = this._camera.position.clone();

        this._camera.position.copy(this._beginCameraPosition);
    }

    Exit() {
        console.log("Exit Part4");
    }

    Update(timeElapsedSec) {
        this._time += timeElapsedSec;
        
        const startTime = 0.02; 
        const cameraAnimationTime = 4;

        if (this._time >= startTime && this._time < cameraAnimationTime) {
            const t = Math.min(this._time / cameraAnimationTime, 1);
            this._camera.position.lerpVectors(this._beginCameraPosition, this._endCameraPosition, t);
        }

        if (this._time >= 7) {
            this._parent.SetState('part5');
        }
    }
};

class _Part5 extends State { // "Game Jam 2024"
    constructor(parent) {
        super(parent, 'part5');
        this._time = 0;
        this._actionIndex = 0;
        this._bears = this._parent._parent._bears;

        this._greetings = document.getElementById("greetings");
        this._registration = document.getElementById("registration");
    }

    Enter(prevState) {
        console.log("Enter Part5");
        this._time = 0;

        this._greetings.style.opacity = '1'; 

        //// TODO:
        //this._bears = this._parent._parent._bears;
        //for (let i = 0; i < this._bears.length; i++) {
        //    this._bears[i].StartRunning();
        //}
        ////
        
        this._parent._parent._SwitchCamera(2);
    }

    Exit() {
        console.log("Exit Part5");
    }

    Update(timeElapsedSec) {
        this._time += timeElapsedSec;

        if (this._actionIndex == 0 && this._time >= 5) // wait
        {
            this._actionIndex++;
        } 
        else if (this._actionIndex == 1) { 
            this._actionIndex++;
            for (let i = 0; i < this._bears.length; i++) {
                this._bears[i]._model.position.set(0, 0, 0);
                this._registration.style.display = 'flex';
        };
        } 

        if (this._time >= 5) {
            this._greetings.style.opacity = '0';         
        }

        if (this._time >= 7.5) {
            this._greetings.style.display = 'none';         
        }
    }
};