module.exports = class {
    constructor() {
        this._storage = {};
    }

    getItem(key) {
        return this._storage[key];
    }

    setItem(key, value) {
        this._storage[key] = value;
    }
    
    removeItem(key) {
        this._storage[key] = undefined;
    }
};