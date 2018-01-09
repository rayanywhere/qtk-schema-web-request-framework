const Express = require('express');
const SchemaResolver = require('../common/schema_resolver');
const JsonBodyParser = require('./json_body_parser');
const StateParser = require('./state_parser');
const EventEmitter = require('events').EventEmitter;

module.exports = class extends EventEmitter {

    constructor({host, 
        port, 
        handlerDir, 
        schemaDir, 
        middlewares = [], 
        route = i => i
    }) {
        super();
        this._host = host;
        this._port = port;
        this._app = new Express();
        this._app.use(JsonBodyParser);
        this._app.post('/*', this._executor(handlerDir, schemaDir, middlewares, route));
        this._app.use((err, req, res, next) => {
            if(err) {
                this.emit('error', err);
                res.sendStatus(500);
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
                apiSchema.responseValidator.validate(outgoing);
                res.json({response: outgoing});
            }
            catch(err) {
                next(err);
            }
        }
    }

}