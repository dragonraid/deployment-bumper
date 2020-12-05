const { Helmfile } = require('./processors/helmfile');
const { Ubuntu } = require('./processors/ubuntu');

/**
 * Ubuntu processor handler. Edits specified value in specified file
 * based on input parameters
 * @param {object} filePath - full path to file
 */
const handleUbuntu = async (filePath) => {
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

    const filter = {};
    Object.keys(filterValues).forEach((value) => {
        if (filterValues[value]) filter[value] = filterValues[value];
    });
    const ubuntu = new Ubuntu(filter, filePath, keys);
    await ubuntu.run();
    console.log(`File "${filePath}" has been successfully updated.`);
};

/**
 * Helmfile processor handler. Updates helmfiles lock file.
 * @param {object} filePath - full path to file
 */
const handleHelmfile = async (filePath) => {
    const helmfileArgs = {
        file: filePath,
    };
    if (process.env.ENVIRONMENT) {
        helmfileArgs.environment = process.env.ENVIRONMENT;
    }

    const helmfile = new Helmfile(helmfileArgs);
    await helmfile.run();
    console.log(`File "${filePath}" has been successfully updated.`);
};

module.exports = {
    handleUbuntu,
    handleHelmfile,
};
