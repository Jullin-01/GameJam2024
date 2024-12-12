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

export class Joystick {
    constructor() {
        this._isDragging = false;
        this._initialOffset = { x: 0, y: 0 };
        this._direction = { x: 0, y: 0 };
        this._Init();
    }

    _Init() {
        this._joystick = document.getElementById("joystick");
        this._knob = document.getElementById("knob");

        this._centerX = this._joystick.offsetWidth / 2;
        this._centerY = this._joystick.offsetHeight / 2;

        // touch events
        this._joystick.addEventListener("touchstart", (event) => {
            this._isDragging = true;
            
            const rect = this._joystick.getBoundingClientRect();
            const touch = event.touches[0];
            this._initialOffset.x = touch.clientX - rect.left - this._centerX;
            this._initialOffset.y = touch.clientY - rect.top - this._centerY;

            this._MoveKnob(event.touches[0].clientX, event.touches[0].clientY);
        });

        this._joystick.addEventListener("touchmove", (event) => {
            event.preventDefault();
            if (this._isDragging) {
                this._MoveKnob(event.touches[0].clientX, event.touches[0].clientY);
            }
        });

        this._joystick.addEventListener("touchend", () => {
            this._isDragging = false;
            this._ResetKnob();
        });

        // mouse events
        this._joystick.addEventListener("mousedown", (event) => {
            this._isDragging = true;

            const rect = this._joystick.getBoundingClientRect();
            this._initialOffset.x = event.clientX - rect.left - this._centerX;
            this._initialOffset.y = event.clientY - rect.top - this._centerY;

            this._MoveKnob(event.clientX, event.clientY);
        });

        window.addEventListener("mousemove", (event) => {
            if (this._isDragging) {
                this._MoveKnob(event.clientX, event.clientY);
            }
        });

        window.addEventListener("mouseup", () => {
            this._isDragging = false;
            this._ResetKnob();
        });
    }

    _MoveKnob(clientX, clientY) {
        const rect = this._joystick.getBoundingClientRect();
        let x = clientX - rect.left - this._centerX - this._initialOffset.x;
        let y = clientY - rect.top - this._centerY - this._initialOffset.y;

        const distance = Math.sqrt(x * x + y * y);
        const maxDistance = this._joystick.offsetWidth / 2;

        if (distance > maxDistance) {
            const angle = Math.atan2(y, x);
            x = Math.cos(angle) * maxDistance;
            y = Math.sin(angle) * maxDistance;
        }

        this._knob.style.transform = `translate(${x + this._centerX - this._knob.offsetWidth / 2}px, ${y + this._centerY - this._knob.offsetHeight / 2}px)`;

        this._direction.x = x / maxDistance;
        this._direction.y = y / maxDistance;
    }

    _ResetKnob() {
        this._knob.style.transform = `translate(-50%, -50%)`;
        this._direction = { x: 0, y: 0 };
    }
};