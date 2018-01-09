const Client = require("../../").Client;
const serverIp = "127.0.0.1";
const serverPort = 3005;

module.exports = new Client({
    host: serverIp,
    port: serverPort,
    schemaDir: `${__dirname}/../schema`,
    protocol: 'http',
    path: '/'
})