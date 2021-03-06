const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs').promises;

const { Repository } = require('./github');
const handlers = require('./handlers');

const DEFAULT_SHELL = '/bin/bash';
const PRE_RUN_SCRIPT_PERMISSIONS = 0o744;

/**
 * Raw configuration.
 */
const RAW_CONFIG = {
    TYPE: process.env.TYPE || null,
    FILE: process.env.FILE || null,
    BRANCH_NAME: process.env.BRANCH_NAME || process.env.TYPE,
    BRANCH_PREFIX: process.env.BRANCH_PREFIX || 'update',
    REPOSITORY: process.env.REPOSITORY || process.env.GITHUB_REPOSITORY,
    USERNAME: process.env.USERNAME || null,
    PASSWORD: process.env.PASSWORD || null,
    PRE_RUN_SCRIPT: process.env.PRE_RUN_SCRIPT || null,
};

const CONFIG = {};

// TODO: might be prudent to put helper functions from here to i.e. utils.js

/**
 * This function processes RAW_CONFIG object. Reasoning is that environment
 * variables, that populates this Config can only contain string, but sometimes
 * we need other types. It also checks, if RAW_CONFIG object contains all
 * necessary properties and those properties are valid.
 */
const processConfig = () => {
    for (const [key, value] of Object.entries(RAW_CONFIG)) {
        if (!value) {
            if (key === 'USERNAME' || key === 'PASSWORD') {
                throw new Error(`Invalid USERNAME or PASSWORD!`);
            };
            throw new Error(
                `Invalid configuration value: ${value} for ${key}.`,
            );
        }
        CONFIG[key] = value;
    }
};

/**
 * Execute custom shell script before calling processor
 * @param {string} script - path to script
 */
const preRunScript = async (script) => {
    console.log(`changing permissions of ${script} to 744`);
    fs.chmod(script, PRE_RUN_SCRIPT_PERMISSIONS);
    console.log(`Executing ${script}`);
    const { stdout, stderr } = await exec(
        script,
        { shell: DEFAULT_SHELL },
    );
    console.log(stdout, stderr);
};

/**
 * Clone repository and checkout the feature branch
 * @param {string} branchName - feature branch name
 * @return {object}
 */
const initializeRepo = async (branchName) => {
    const repository = new Repository({
        repository: CONFIG.REPOSITORY,
        username: CONFIG.USERNAME,
        password: CONFIG.PASSWORD,
        branchName,
    });
    await repository.clone();
    await repository.checkout();
    return repository;
};

/**
 * Define handle types
 */
const PROCESSOR_TYPES = {
    ubuntu: handlers.handleUbuntu,
    helmfile: handlers.handleHelmfile,
};

/**
 * Main function
 */
(async () => {
    try {
        processConfig();
    } catch (err) {
        console.error('Config processor has failed!', err);
        process.exit(1);
    }

    if (CONFIG.PRE_RUN_SCRIPT) {
        try {
            await preRunScript(CONFIG.PRE_RUN_SCRIPT);
        } catch (err) {
            console.error(`Running ${CONFIG.PRE_RUN_SCRIPT} failed.`, err);
            process.exit(1);
        }
    }

    try {
        const repository = await initializeRepo(
            `${CONFIG.BRANCH_PREFIX}/${CONFIG.BRANCH_NAME}`,
        );
        const fullFilePath = `${repository.path}/${CONFIG.FILE}`;
        await PROCESSOR_TYPES[CONFIG.TYPE](fullFilePath);
        console.log(`Successfully executed processor ${CONFIG.TYPE}.`);
        await repository.push(`update ${CONFIG.TYPE}`);
        await repository.createPullRequest();
        console.log('Pull-request created.');
    } catch (err) {
        console.error(`${CONFIG.TYPE} processor failed.`, err);
        process.exit(1);
    }
})();
