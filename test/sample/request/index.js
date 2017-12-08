const Client = require("../../../").Client;
const serverIp = "127.0.0.1";
const serverPort = 3005;

describe("#request", function() {
    it('should return hi', async function () {
        let client = new Client({
            host : serverIp,
            port : serverPort,
            schemaDir: `${__dirname}/../../common/schema`,
            protocol : 'http',
            root : '/'
        })
        let response = await client.call("test", "hi");
        assert(response.requestField === 'hi', 'incorrect response');
    });

    it('should return 500', async function () {
        let client = new Client({
            host : serverIp,
            port : serverPort,
            schemaDir: `${__dirname}/../../common/schema`,
            protocol : 'http',
            root : '/'
        })
       
        try {
            let response = await client.call("error.test", "hi");
        }
        catch (err) {
            assert (err.message == "server returned error as 500", 'incorrect response');
        }
    });

    it('should return request timeout', async function () {
        let client = new Client({
            host : serverIp,
            port : serverPort,
            schemaDir: `${__dirname}/../../common/schema`,
            protocol : 'http',
            root : '/'
        })
        try {
            await client.call("test", "hi", 50); //server will sleep 100ms before response
        }
        catch (err) {
            assert (err.message == "ESOCKETTIMEDOUT", 'incorrect response');
        }
    });
});