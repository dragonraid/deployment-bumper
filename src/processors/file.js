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
     * @param {string} filePath      - file to be edited
     */
    constructor(filePath) {
        this.filePath = null;
        this.type = null;
        this.init(filePath);
    }

    /**
     * Initiates properties by parsing descriptor
     * @param {string} filePath      - file to be edited
     */
    init(filePath) {
        if (!filePath) {
            throw new Error('filePath cannot be empty!');
        }
        const fileSplit = filePath.split('.');
        const fileType = fileSplit[fileSplit.length - 1];
        this.filePath = filePath;
        this.type = FILE_TYPES[fileType.toLocaleLowerCase()];
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
     * @param {object} data          - parsed file data
     * @param {object} keyValuePairs - key-values pair that edits data
     * @return {object}
     */
    edit(data, keyValuePairs) {
        for (const [key, value] of Object.entries(keyValuePairs)) {
            _.set(data, key, value);
        }
        return data;
    }
}


module.exports = {
    File,
};
