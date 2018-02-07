const Server = require('../../src/server');
const fs = require('fs');
const path = require('path');

let demoMiddleware = {
    pattern: '(.*)', //match all interface
    handle: async ({name, schema, pyload/*{constant, state, request}*/}) => {
        // will be called before entering handler, can be used for authorization.
    }
};

let server = new Server({
    host: "127.0.0.1",
    port: 3005,
    handlerDir: `${__dirname}/handler`,
    schemaDir: `${__dirname}/../schema`,
    middlewares: [demoMiddleware],
    errorDetail: true
});

server.on("error", (err) => {
    console.log(err);
});
server.on("started", () => {
    console.log("server start....");
});

server.start();
