const util = require('util');
const exec = util.promisify(require('child_process').exec);

const HELMFILE_BIN_PATH = '/usr/local/bin/helmfile';
const HELMFILE_DEPS_COMMAND = 'deps';

const GLOBAL_ARGUMENTS = {
    file: '-f',
    environment: '-e',
};

/**
 * Process helmfile https://github.com/roboll/helmfile
 */
class Helmfile {
    /**
     * Runs helmfile deps command to update chart dependencies
     * @param {object} globalArgs - global arguments
     */
    constructor(globalArgs) {
        this.helmfile = HELMFILE_BIN_PATH;
        this.globalArgs = null;
        this.init(globalArgs);
    }

    /**
     * Constructs global arguments of helmfile
     * @param {array} args - arguments i.e [{key1: val1},.. {keyN: valN}]
     */
    init(args) {
        let argString = '';
        const globalArgsKeys = Object.keys(GLOBAL_ARGUMENTS);
        const argKeys = Object.keys(args);
        argKeys.forEach((argKey) => {
            if (globalArgsKeys.includes(argKey)) {
                const fullArg = `${GLOBAL_ARGUMENTS[argKey]} ${args[argKey]} `;
                argString = argString.concat(fullArg);
            } else {
                console.log(`Helmfile: unknown global argument ${argKey}`);
            }
        });
        this.globalArgs = argString.trim();
    }

    /**
     * Execute helmfile command with args
     * @param {string} args - command argument
     * @return {object}
     */
    async execute(args) {
        const command = `${this.helmfile} ${this.globalArgs} ${args}`;
        let stdout;
        let stderr;
        try {
            ({ stdout, stderr } = await exec(command));
        } catch (err) {
            console.error('Helmfile execute exits with an error', err);
            throw err;
        };

        return { stdout, stderr };
    }

    /**
     * Runs helmfile deps command to update dependencies.
     */
    async run() {
        const { stdout, stderr } = await this.execute(HELMFILE_DEPS_COMMAND);
        if (stderr) {
            // eslint-disable-next-line max-len
            console.log(`helmfile ${HELMFILE_DEPS_COMMAND} stderr:\n ${stderr}`);
        }
        console.log(`helmfile ${HELMFILE_DEPS_COMMAND} stdout:\n ${stdout}`);
    }
}

module.exports = {
    Helmfile,
};
