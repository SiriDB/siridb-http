import * as d3 from 'd3';

class JsonRequest {

    constructor(type, url, data, isStringified) {

        this.doneCb = function (data) { };
        this.failCb = function (error, msg) {
            console.error(error, msg || 'unknwon error occurred');
        };
        this.alwaysCb = function (xhr, data) { };

        d3.request(url)
            .header('Content-Type', 'application/json')
            .on('error', (error) => {
                this.alwaysCb(error, error.target.responseText);
                this.failCb(error.target, error.target.responseText);
            })
            .on('load', (xhr) => {
                let data = JSON.parse(xhr.responseText);
                this.alwaysCb(xhr, data);
                this.doneCb(data);
            })
            .send(type, (data === undefined || isStringified) ?
                data : JSON.stringify(data));
    }

    done(doneCb) {
        this.doneCb = doneCb;
        return this;
    }

    fail(failCb) {
        this.failCb = failCb;
        return this;
    }

    always(alwaysCb) {
        this.alwaysCb = alwaysCb;
        return this;
    }
}

export default JsonRequest;