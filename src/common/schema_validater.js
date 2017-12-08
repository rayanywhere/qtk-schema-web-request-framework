const Ajv = require('ajv');
const ajv = new Ajv();
const fs = require("fs");
require('ajv-keywords')(ajv, 'switch');

module.exports = class {
	static resolve(schemaDir, interfaceName) {
		if (!fs.existsSync(`${schemaDir}/${interfaceName}/index.js`)) {
			return [null, `schema: ${interfaceName} is not exist`]
		}

		const schema =  require(`${schemaDir}/${interfaceName}/index.js`);
		if ((typeof schema.request !== 'object') 
			|| (typeof schema.response !== 'object') 
			|| (typeof schema.info !== 'object')) {
			return [null, `bad format of schema ${interfaceName}, expecting request/response/info to be objects.`];
		}
		return [schema, null];
	}
	
	static validate(module, instance, schema) {
		if (ajv.validate(schema[module], instance)) {
			return [true, null];
		}
		return [false, `invalid ${module}\n instance:${JSON.stringify(instance)}\nschema:${JSON.stringify(schema[module])}\n${ajv.errorsText()}`];
	}
}

