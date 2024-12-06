class _ControllerInput {
    constructor() {
        this._keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            space: false,
        };
        this._Init();
    }

    _Init() {
    }

    Update() {

    }
};

export class ControllerInput extends _ControllerInput {
    constructor() {
        super();
        this._Init();
    }

    _Init() {
        document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
    }

    _onKeyDown(event) {
        switch (event.keyCode) {
            case 87: // w
            case 38:
                this._keys.forward = true;
                break;
            case 65: // a
            case 37:
                this._keys.left = true;
                break;
            case 83: // s
            case 40: 
                this._keys.backward = true;
                break;
            case 68: // d
            case 39:
                this._keys.right = true;
                break;
            case 32: // SPACE
                this._keys.space = true;
                break;
        }
    }

    _onKeyUp(event) {
        switch (event.keyCode) {
            case 87: // w
            case 38:
                this._keys.forward = false;
                break;
            case 65: // a
            case 37:
                this._keys.left = false;
                break;
            case 83: // s
            case 40: 
                this._keys.backward = false;
                break;
            case 68: // d
            case 39:
                this._keys.right = false;
                break;
            case 32: // SPACE
                this._keys.space = false;
                break;
        }
    }
};