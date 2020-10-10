const fs = require('fs').promises;
const yaml = require('js-yaml');
const _ = require('lodash');

const FILE_TYPES = {
    yml: 'YAML',
    yaml: 'YAML',
    json: 'JSON',
};

const FILE_TYPE_PROCESSORS = {
    YAML: {
        read: yaml.safeLoad,
        write: yaml.safeDump,
    },
    JSON: {
        read: JSON.parse,
        write: _.bind(JSON.stringify, null, _, _, 4),
    },
};

/**
 * Process various filetypes
 */
class File {
    /**
     * @param {string} file          - file to be edited
     * @param {object} keyValuePairs - key-value pairs to be edited
     */
    constructor({
        filePath,
        keyValuePairs,
    }) {
        this.filePath = null;
        this.keyValuePairs = null;
        this.type = null;
        this.init(filePath, keyValuePairs);
    }

    /**
     * Initiates properties by parsing descriptor
     * @param {string} filePath      - file to be edited
     * @param {object} keyValuePairs - key-value pairs to be edited
     */
    init(filePath, keyValuePairs) {
        const fileSplit = filePath.split('.');
        const fileType = fileSplit[fileSplit.length - 1];
        this.filePath = filePath;
        this.type = FILE_TYPES[fileType.toLocaleLowerCase()];

        if (typeof keyValuePairs !== 'object') {
            throw new Error(
                `"keyValuePairs" must be an object. Got ${keyValuePairs}`,
            );
        }
        // TODO: add validation for key value
        this.keyValuePairs = keyValuePairs;
    }


    /**
     * Run main logic
     * @param {string} value - value of specified key will be changed
     * TODO: implement multiple values for multiple keys
     */
    async run() {
        const data = await this.read();
        const editedData = this.edit(data);
        await this.write(editedData);
        // if changed write, else do nothing
    }

    /**
     * Reads and parses file
     * @return {object}
     */
    async read() {
        const content = await fs.readFile(this.filePath, 'utf8');
        return FILE_TYPE_PROCESSORS[this.type]['read'](content);
    }

    /**
     * Stringifies and writes data to file
     * @param {object} data - data to be stringified and written
     */
    async write(data) {
        const content = FILE_TYPE_PROCESSORS[this.type]['write'](data);
        await fs.writeFile(this.filePath, content);
    }

    /**
     * Edit file data and return edited data
     * @param {object} data - parsed file data
     * @return {object}
     */
    edit(data) {
        for (const [key, value] of Object.entries(this.keyValuePairs)) {
            _.set(data, key, value);
        }
        return data;
    }
}


module.exports = {
    File,
};
