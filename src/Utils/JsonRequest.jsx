import * as d3 from 'd3';

class JsonRequest {

    constructor(type, url, data) {

        this.doneCb = function (data) { };
        this.failCb = function (error, data) {
            console.error(error, data);
        };
        this.alwaysCb = function (xhr, data) { };

        d3.request(url)
            .header('Content-Type', 'application/json')
            .on('error', (error) => {
                let data = this._onResponse(error.target);
                this.failCb(error.target, data);
            })
            .on('load', (xhr) => {
                let data = this._onResponse(xhr);
                this.doneCb(data);
            })
            .send(type, (data === undefined) ? undefined : JSON.stringify(data));
    }

    _onResponse(xhr) {
        let data = JSON.parse(xhr.responseText);
        this.alwaysCb(xhr, data);
        return data;
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