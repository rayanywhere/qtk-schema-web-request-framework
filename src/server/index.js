const Express = require('express');
const iconv = require('iconv-lite');
const ContentType = require('content-type');
const schemaValidater = require('../common/schema_validater.js');
const EventEmitter = require('events').EventEmitter;

module.exports = class extends EventEmitter {

    constructor({host, port, handlerDir, schemaDir}, middlewares = []) {
        super();
        this._host = host;
        this._port = port;
        this._handlerDir = handlerDir;
        this._schemaDir = schemaDir;
        this._app = new Express();
        this._init(middlewares);
    }

    _init(middlewares = []) {
        this._app.use((req, res, next) => {
            let chunks = [];
            req.on('data', (chunk) => { 
                chunks.push(chunk);
            });
            req.on('end', () => {
                try {
                    let contentType = ContentType.parse(req.headers['content-type']);
                    let charset = contentType.parameters.charset ? contentType.parameters.charset : 'UTF-8';
                    let body = iconv.decode(Buffer.concat(chunks), charset);
                    req.body = JSON.parse(body);
                    next();
                }
                catch(err) {
                    this.emit("error", err);
                    next('Internal Server Error');
                }
            });
        });

        this._app.post('/*', async (req, res) => {
            let response = {
                end : (outgoing = undefined, status = 0) => {
                    if (status == 0) {
                        res.json(outgoing);
                    }
                    else {
                        res.sendStatus(500);
                    }
                }
            }

            let apiName = req.originalUrl.replace(/^\//, '');
            try {
                let interfaceSchema,isValid,errMsg;
                [interfaceSchema, errMsg] = schemaValidater.resolve(this._schemaDir, apiName);
                if (interfaceSchema == undefined) {
                    throw new Error(errMsg);
                }
                
                //数据包装
                let request = {
                    api : {
                        name: apiName,
                        schema: interfaceSchema,
                        payload: {
                            state: req.get('Web-State') == undefined ? {} : req.get('Web-State').split('&').reduce((state, item) => {
                                let [key, value] = item.split('='); 
                                if (value != undefined) {
                                    state[key] = value;
                                }
                                return state;
                            }, {}),
                            constant: interfaceSchema.constant,
                            request: req.body.request
                        }
                    }
                }

                //中间件处理
                for (let middleware of middlewares) {
                    let regex = new RegExp(middleware.pattern);
                    if (regex.test(request.api.name)) {
                        await middleware.handle(request);
                    }
                }

                //控制器层处理
                [isValid, errMsg] = schemaValidater.validate('request', request.api.payload.request, request.api.schema);
                if (!isValid) { throw new Error(errMsg); }

                let outgoing = await require(`${this._handlerDir}/${request.api.name}`)(request.api.payload);

                [isValid, errMsg] = schemaValidater.validate('response', outgoing, request.api.schema);
                if (!isValid) { throw new Error(errMsg); }

                response.end({response: outgoing});
            }
            catch(err) {
                this.emit("error", err);
                response.end(undefined, -1);
            }
        });
    }

    start() {
        this._app.listen(this._port, this._host);
        this.emit("started");
    }
}