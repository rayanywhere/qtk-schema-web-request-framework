const Express = require('express');
const SchemaResolver = require('../common/schema_resolver');
const JsonBodyParser = require('./json_body_parser');
const StateParser = require('./state_parser');
const EventEmitter = require('events').EventEmitter;
const WebError = require('../error');

module.exports = class extends EventEmitter {

    constructor({host, 
        port, 
        handlerDir, 
        schemaDir, 
        middlewares = [],
        errorDetail = false,
        route = i => i
    }) {
        super();
        this._host = host;
        this._port = port;
        this._errorDetail = errorDetail;
        this._app = new Express();
        this._app.use(JsonBodyParser);
        this._app.post('/*', this._executor(handlerDir, schemaDir, middlewares, route));
        this._app.use((err, req, res, next) => {
            if(err) {
                this.emit('error', err);
                let webError = WebError.fromError(err);
                if(this._errorDetail) {
                    res.status(500).json({
                        code: webError.code,
                        stack: webError.stack
                    });
                }
                else {
                    res.status(500).json({code: webError.code});
                }
            }
        });
    }
    
    start() {
        let httpServer = this._app.listen(this._port, this._host);
        this.emit("started");
        return httpServer;
    }

    _executor(handlerDir, schemaDir, middlewares, route) {
        let schemaResolver = new SchemaResolver(schemaDir);
        return async (req, res, next) => {
            try {
                let apiName = route(req.originalUrl.replace(/^\//, ''));
                let apiSchema = schemaResolver.resolve(apiName);
                let payload = {
                    state: StateParser(req),
                    constant: apiSchema.constant,
                    request: req.body.request
                };

                for (let middleware of middlewares) {
                    let regex = new RegExp(middleware.pattern);
                    if (regex.test(apiName)) {
                        await middleware.handle({
                            name: apiName,
                            schema: apiSchema,
                            payload: payload
                        });
                    }
                }

                apiSchema.requestValidator.validate(payload.request);
                let outgoing = await require(`${handlerDir}/${apiName}`)(payload);
                if(outgoing === undefined) outgoing = null;
                apiSchema.responseValidator.validate(outgoing);
                res.json({response: outgoing});
            }
            catch(err) {
                next(err);
            }
        }
    }

}