const Transport = require("./transport");
const SchemaResolver = require('../common/schema_resolver');

module.exports = class extends Transport{
    constructor({protocol, host, port, path, schemaDir}) {
        super({protocol, host, port, path});
        this._schemaDir = schemaDir;
        this._schemaResolver = new SchemaResolver(schemaDir);
    }

    async call(apiName, request, timeout = 30000) {
        let apiSchema = this._schemaResolver.resolve(apiName);
        apiSchema.requestValidator.validate(request);
        let response = await this.run(apiName, request, timeout);
        apiSchema.responseValidator.validate(response);
        return response;
    }
}