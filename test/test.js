require('./server');
const client = require('./client');
const assert = require('assert');

describe("#request", function() {
    it('should return hi', async function () {
        let response = await client.call("test", "hi");
        assert(response.requestField === 'hi', 'incorrect response');
    });

    it('should return 500', async function () {
        await client.call("error.test", "hi").catch(err => {
            assert (err.message == "server returned error as 500", 'incorrect response');
        });
    });

    it('should return request timeout', async function () {
        //server will sleep 100ms before response
        await client.call("test", "hi", 50).catch(err => {
            assert (err.message == "ESOCKETTIMEDOUT", 'incorrect response');
        });
    });
});
