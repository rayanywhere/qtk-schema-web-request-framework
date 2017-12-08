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
const request = {
    type: "string",
    description: "请求的内容"
};
const response = {
    type: "object",
    description: "原文返回请求的内容",
    additionalProperties: false,
    properties: {
        requestField: {
            type: "string",
            description: "请求的内容"
        },
        responseStatus: {
            type : "integer",
            description : `请求结果:${JSON.stringify(constant.ResponseStatus)}`,
            enum : Object.values(constant.ResponseStatus)
        }
    },
    required: ["requestField", "responseStatus"]
};

module.exports = {info, request, response, constant};