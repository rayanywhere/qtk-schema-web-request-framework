const Request = require("request");
const SessionStorage = require('./lib/session_storage_emulator.js');

module.exports = class  Transport {
    constructor({protocol, host, port, path}) {
        this._protocol = protocol;
        this._host = host;
        this._port = port;
        this._path = path;
        this._sessionStorage = new SessionStorage();
    }

    run(interfaceName, request, timeout) { 
        return this._transport(interfaceName, request, timeout);
    }

    putState(key, value) {
        let states = this._sessionStorage.getItem('Web-State');
        if (typeof states !== 'string') {
            states = '';
        }

        let statesMap = new Map();
        for (let pair of states.split(';')) {
            let [pairKey, pairValue] = pair.trim().split('=', 2);
            if (pairKey.length > 0) {
                statesMap.set(pairKey, pairValue);
            }
        }
        statesMap.set(key, value);

        states = [];
        for (let [key, value] of statesMap) {
            states.push(`${key}=${value}`);
        }

        this._sessionStorage.setItem(`Web-State`, states.join(';'));
    }

    removeState(key) {
        let states = this._sessionStorage.getItem('Web-State');
        if (typeof states !== 'string') {
            states = '';
        }

        let statesMap = new Map();
        for (let pair of states.split(';')) {
            let [pairKey, pairValue] = pair.trim().split('=', 2);
            if (pairKey.length > 0) {
                statesMap.set(pairKey, pairValue);
            }
        }
        statesMap.delete(key);

        states = [];
        for (let [key, value] of statesMap) {
            states.push(`${key}=${value}`);
        }

        this._sessionStorage.setItem(`Web-State`, states.join(';'));
    }

    clearState() {
        this._sessionStorage.removeItem(`Web-State`);
    }

    async _transport(name, request, timeout) {
        return await new Promise((resolve, reject) => {
            let states = this._sessionStorage.getItem('Web-State');
            Request({
                method: 'post',
                url: `${this._protocol}://${this._host}:${this._port}${this._path}${name}`,
                json: {request},
                timeout: timeout,
                headers : {
                    'Web-State' : states
                }
            }, (error, response, body) => {
                if (error) {
                    return reject(error);
                } 
                else if (response.statusCode == 200) {
                    return resolve(body['response']);
                }
                else if (response.statusCode == 500) {
                    return reject(new Error('server returned error as 500', '网络出错啦'));
                }
                else {
                    return reject(new Error(`unexpected status(${response.statusCode}) returned by the server`));
                }
            })
        })
    }
}