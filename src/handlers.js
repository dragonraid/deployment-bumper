const { Ubuntu } = require('./processors/ubuntu');
const { File } = require('./processors/file');

/**
 * Ubuntu processor handler. Edits specified value in specified file
 * based on input parameters
 * @param {object} repository - repository object
 */
const handleUbuntu = async (repository) => {
    const filterValues = {
        cloud: process.env.CLOUD || null,
        zone: process.env.ZONE || null,
        version: process.env.VERSION || null,
        architecture: process.env.ARCHITECTURE || null,
        instanceType: process.env.INSTANCE_TYPE || null,
        release: process.env.RELEASE || null,
    };

    const rawKeys = process.env.KEYS;
    let keys;
    if (rawKeys) {
        keys = rawKeys.split(',');
    } else {
        throw new Error('KEYS must be supplied!');
    }

    const filePath = process.env.FILE;
    if (!filePath) {
        throw new Error('FILE must be supplied');
    }
    const fullFilePath = `${repository.path}/${filePath}`;

    const filter = {};
    Object.keys(filterValues).forEach((value) => {
        if (filterValues[value]) filter[value] = filterValues[value];
    });
    const ubuntu = new Ubuntu(filter, fullFilePath, keys);
    await ubuntu.run();
    console.log(`File "${fullFilePath}" has been successfully updated.`);
};

module.exports = {
    handleUbuntu,
};
