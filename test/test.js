const Server = require('../src/server');
const fs = require('fs');
const path = require('path');
global.assert = require('assert');

let demoMiddleware = {
    pattern: '(.*)', //match all interface
    handle: async (req) => {
        //you can get schema info by "req.api.schema", get/add some request field to "req.api.payload",also you can throw a error here,the framework will response error to client
    }
};

let server = new Server({
    host: "127.0.0.1",
    port: 3005,
    handlerDir: `${__dirname}/common/handler`,
    schemaDir: `${__dirname}/common/schema`
}, [demoMiddleware]);

server.on("error", (err) => {
    // console.log(err.stack);
});
server.on("started", () => {
    console.log("server start....");
});

server.start();

const samplePath = `${__dirname}/sample`;
let cases = fs.readdirSync(samplePath).filter(file => fs.lstatSync(path.join(samplePath, file)).isDirectory());
cases.forEach((c) => {
    require(`${samplePath}/${c}`);
});