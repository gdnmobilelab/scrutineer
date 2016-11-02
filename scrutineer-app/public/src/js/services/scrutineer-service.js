//CONFIG supplied on `window`
const jsonFetch = require('../../../../shared-utils/json-request');

class ScrutineerService {
    createModification(modification, sendNotification = false) {
        Object.keys(modification).forEach((key) => {
            //Don't submit empty strings! It's invalid!
            if (typeof modification[key] === 'string' && modification[key].length < 1) {
                modification[key] = null;
            }
        });

        return jsonFetch(`${CONFIG.API_URL}/api/notifications/modifications?send=${sendNotification}`, {
            method: 'POST',
            body: JSON.stringify(modification),
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
}


export default new ScrutineerService()