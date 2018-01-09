module.exports = (req) => {
    return req.get('Web-State') == undefined ? {} : req.get('Web-State').split(';').reduce((state, item) => {
        let [key, value] = item.split('='); 
        if (value != undefined) {
            state[key] = value;
        }
        return state;
    }, {});
};