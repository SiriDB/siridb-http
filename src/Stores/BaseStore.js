import Vlow from 'vlow';
import JsonRequest from '../Utils/JsonRequest';

class BaseStore extends Vlow.Store {

    fetch(url) {
        return new JsonRequest('GET', url);
    }

    post(url, data) {
        return new JsonRequest('POST', url, data);
    }

    postraw(url, raw) {
        return new JsonRequest('POST', url, raw, true);
    }
}

export default BaseStore;