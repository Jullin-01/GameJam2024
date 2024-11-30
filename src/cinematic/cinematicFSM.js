import * as THREE from 'three';
import { FiniteStateMachine, State } from '../common/finiteStateMachine.js';

export class CinematicFSM extends FiniteStateMachine {
    constructor(parent) {
        super();
        this._parent = parent;
        this._Init();
    }

    _Init() {
        this._AddState('part1', _Part1);
        this._AddState('part2', _Part2);
        this._AddState('part3', _Part3);
        this._AddState('part4', _Part4);
        this._AddState('part5', _Part5);
    }
};

class _Part1 extends State {
    constructor(parent) {
        super(parent, 'part1');
        this._time = 0;
    }

    Enter(prevState) {
        console.log("Enter Part1");
        this._time = 0;
        this._parent._parent._SwitchCamera(0);
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

class _Part2 extends State {
    constructor(parent) {
        super(parent, 'part2');
        this._time = 0;
    }

    Enter(prevState) {
        console.log("Enter Part2");
        this._time = 0;
        this._parent._parent._SwitchCamera(1);
    }

    Exit() {
        console.log("Exit Part2");
    }

    Update(timeElapsedSec) {
        this._time += timeElapsedSec;

        if (this._time >= 5) {
            this._parent.SetState('part3');
        }
    }
};

class _Part3 extends State {
    constructor(parent) {
        super(parent, 'part3');
        this._time = 0;
    }

    Enter(prevState) {
        console.log("Enter Part3");
        this._time = 0;
        this._parent._parent._SwitchCamera(2);
    }

    Exit() {
        console.log("Exit Part3");
    }

    Update(timeElapsedSec) {
        this._time += timeElapsedSec;

        if (this._time >= 5) {
            this._parent.SetState('part4');
        }
    }
};

class _Part4 extends State {
    constructor(parent) {
        super(parent, 'part4');
        this._time = 0;
    }

    Enter(prevState) {
        console.log("Enter Part4");
        this._time = 0;
        this._parent._parent._SwitchCamera(3);
    }

    Exit() {
        console.log("Exit Part4");
    }

    Update(timeElapsedSec) {
        this._time += timeElapsedSec;
    }
};

class _Part5 extends State {
    constructor(parent) {
        super(parent, 'part5');
        this._time = 0;
    }

    Enter(prevState) {
        console.log("Enter Part5");
        this._time = 0;
    }

    Exit() {
        console.log("Exit Part5");
    }

    Update(timeElapsedSec) {
        this._time += timeElapsedSec;
    }
};