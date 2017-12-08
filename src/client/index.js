const Transport = require("./transport");
const schemaValidater = require('../common/schema_validater.js');

module.exports = class extends Transport{
    constructor({protocol, host, port, root, schemaDir}) {
        super({protocol, host, port, root});
        this._schemaDir = schemaDir;
    }

    async call(interfaceName, request, timeout = 30000) {
        let interfaceSchema,isValid, errMsg;
        [interfaceSchema, errMsg] = schemaValidater.resolve(this._schemaDir, interfaceName);
        if (interfaceSchema == undefined) {
            throw new Error(errMsg);
        }

        [isValid, errMsg] = schemaValidater.validate('request', request, interfaceSchema);
        if (!isValid) { throw new Error(errMsg); }

        let response = await this.run(interfaceName, request, timeout);

        [isValid, errMsg] = schemaValidater.validate('response', response, interfaceSchema);
        if (!isValid) { throw new Error(errMsg);  }
        
        return response;
    }
}