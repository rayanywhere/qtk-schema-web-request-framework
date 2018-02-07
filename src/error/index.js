module.exports = class WebError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'WebError';
        this.code = code;
    }
    static fromError(err) {
        if(err instanceof WebError) {
            return err;
        }
        else {
            let error = new WebError(err.message, 0);
            error.stack = err.stack;
            return error;
        }
    }
}