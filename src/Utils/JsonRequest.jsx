import * as d3 from 'd3';

class JsonRequest {

    constructor(type, url, data, isStringified) {

        this.doneCb = function (data) { };
        this.failCb = function (error, msg) {
            console.error(error, msg || 'unknwon error occurred');
        };
        this.alwaysCb = function (xhr, data) { };

        let xhr = new XMLHttpRequest();
        xhr.open(type, url, true);
        xhr.setRequestHeader('Content-type', 'application/json');

        xhr.onreadystatechange = () => {
            if (xhr.readyState != XMLHttpRequest.DONE) {
                return;
            }

            let data;

            if (xhr.status == 200) {
                data = JSON.parse(xhr.responseText);
                this.doneCb(data);
            } else {
                try {
                    data = JSON.parse(xhr.responseText);
                } catch (e) {
                    data = xhr.responseText;
                }
                this.failCb(xhr, data);
            }
            this.alwaysCb(xhr, data);
        };

        xhr.send((data === undefined || isStringified) ?
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