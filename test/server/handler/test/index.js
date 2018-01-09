module.exports = async ({request, session, constant}) => {
    await sleep(100)
    return {
        requestField: request,
        responseStatus: constant.ResponseStatus.SUCCESS
    }
};

function sleep(millisecond) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            return resolve('');
        }, millisecond)
    })
}