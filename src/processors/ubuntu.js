const axios = require('axios');
const { File } = require('./file');

const UBUNTU_IMAGE_FINDER_URL = 'https://cloud-images.ubuntu.com/locator/releasesTable?_=1598175887311';
const FIELD_MAPPINGS = {
    cloud: 0,
    zone: 1,
    name: 2,
    version: 3,
    architecture: 4,
    instanceType: 5,
    release: 6,
    id: 7,
};
const LINK_REGEX = /(.*\")(.*)(\">)(.*)(<.*)/;

/**
 * Linux ubuntu handler
 */
class Ubuntu extends File {
    /**
     * Represents ubuntu image
     * @param {object} criteria - object with filter properties. For example:
     *                              {
     *                                  cloud: 'Amazon AWS',
     *                                  zone: 'us-east-1',
     *                                  name: 'bionic',
     *                                  version: '18.04',
     *                                  architecture: 'amd64',
     *                                  instanceType: 'hvm-ssd',
     *                                  release: '20201204'
     *                              }
     * @param {string} filePath - path to file
     * @param {array} keys      - string keys to be replaced
     */
    constructor(criteria, filePath, keys) {
        super(filePath);
        this.criteria = criteria;
        this.keys = keys;
        this.allImages = null;
        this.processedImages = null;
    }

    /**
     * Gets images from UBUNTU_IMAGE_FINDER_URL and makes them parsable
     */
    async getImages() {
        const response = await axios.get(UBUNTU_IMAGE_FINDER_URL);
        let data = response.data.replace(/\n/g, '');
        const lastIndexOfComma = data.lastIndexOf(',');
        // eslint-disable-next-line max-len
        data = `${data.substring(0, lastIndexOfComma)}${data.substring(lastIndexOfComma + 1)}`;
        const images = JSON.parse(data);
        this.allImages = images.aaData;
    }

    /**
     * Filters images by criteria and sorts them by release.
     * Release represents date
     */
    filterImages() {
        let images = this.allImages;
        Object.keys(this.criteria).forEach((key) => {
            const index = FIELD_MAPPINGS[key];
            images = images.filter(
                (image) => image[index] === this.criteria[key],
            );
        });

        images = images.map(this._constructImageProperties);
        this.processedImages = images.sort(
            (a, b) => (
                // eslint-disable-next-line max-len
                Number(a[FIELD_MAPPINGS.link]) > Number(b[FIELD_MAPPINGS.link])) ? -1 : 1,
        );
    }

    /**
     * Constructs object from array with properties
     * @param {array} image - array with image properties
     * @return {object}
     */
    _constructImageProperties(image) {
        const imageObj = {};
        Object.keys(FIELD_MAPPINGS).forEach((field) => {
            if (field === 'id' && image[0] === 'Amazon AWS') {
                const splitVal = image[FIELD_MAPPINGS[field]].match(LINK_REGEX);
                imageObj.link = splitVal[2];
                imageObj.id = splitVal[4];
            } else {
                imageObj[field] = image[FIELD_MAPPINGS[field]];
            }
        });
        return imageObj;
    }

    /**
     * Runs, initializes and edits file
     */
    async run() {
        await this.getImages();
        this.filterImages();
        const latest = this.processedImages[0];
        const keyValuePairs = {};
        this.keys.forEach((key) => {
            keyValuePairs[key] = latest.id;
        });
        const data = await this.read();
        const editedData = this.edit(data, keyValuePairs);
        await this.write(editedData);
    }
}

module.exports = {
    Ubuntu,
};


