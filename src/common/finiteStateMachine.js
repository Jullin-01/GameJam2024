class FiniteStateMachine {
    constructor() {
        this._states = {};
        this._currentState = null;
    }

    _AddState(name, type) {
        this._states[name] = type;
    }

    SetState(name) {
        const prevState = this._currentState;

        if (prevState) {
            if (prevState.Name == name) {
                return;
            }
            prevState.Exit();
        }

        const state = new this._states[name](this, name);

        this._currentState = state;
        state.Enter(prevState);
    }

    Update(timeElapsed, input) {
        if (this._currentState) {
            this._currentState.Update(timeElapsed, input);
        }
    }
};

class State {
    constructor(parent, name) {
        this._parent = parent;
        this._name = name;
    }

    get Name() {
        return this._name;
    }

    Enter() { }
    Exit() { }
    Update() { }
};

export { FiniteStateMachine, State };