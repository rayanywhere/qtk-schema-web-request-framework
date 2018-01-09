const {string, object, integer} = require('semantic-schema').describer;

const info = {
    title: "测试接口",
    author: "skip",
    description: "这是一个测试接口",
    auth: false
};
const constant = {
    ResponseStatus: {
        SUCCESS: 0,
        FAILED: 1
    }
};
const request = string().desc("请求的内容");
const response = object().requiredAll().desc("原文返回请求的内容").properties({
    requestField: string().desc("请求的内容"),
    responseStatus: integer()
        .enum(...Object.values(constant.ResponseStatus))
        .desc(`请求结果:${JSON.stringify(constant.ResponseStatus)}`)
});

module.exports = {info, request, response, constant};