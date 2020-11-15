const util = require('util');
const exec = util.promisify(require('child_process').exec);

/**
 * Wrapper around helm command
 * https://helm.sh/
 */
class Helm {
    /**
     * @param {string} execPath - path to helm executable
     * @param {string} output   - output format
     */
    constructor(execPath = '/usr/local/bin/helm', output = '-o json') {
        this.execPath = execPath;
        this.output = output;
    }

    /**
     * Executes helm with options
     * @param {string} options - command options
     */
    async _execute(options) {
        const command = `${this.execPath} ${options} ${this.output}`;
        const { error, stdout, stderr } = await exec(command);
        if (error) {
            throw new Error(
                `Unable to execute helm with ${options} options`,
                err,
                stderr,
            );
        }
        return stdout;
    }

    /**
     * Get helm version. This function is used to check if helm is installed
     */
    async getVersion() {
        console.log(await this._execute('version'));
    }

    /**
     * Add helm chart repository
     * @param {string} name - helm chart repository name
     * @param {string} url  - helm chart repository url
     */
    async addRepo(name, url) {
        const options = `repo add ${name} ${url}`;
        return await this._execute(options);
    }

    /**
     * Removes helm chart repository
     * @param {string} name - helm chart repository name
     */
    async removeRepo(name) {
        const options = `repo remove ${name}`;
        return await this._execute(options);
    }

    /**
     * Update all added repositories
     */
    async updateRepos() {
        const options = `repo update`;
        return await this._execute(options);
    }

    /**
     * Search all repositories by keyword
     * @param {string} keyword - keyword to be searched. This will most likely
     *                           be full or part of the chart's name
     */
    async searchRepos(keyword) {
        const options = `search repo ${keyword}`;
        return await this._execute(options);
    }

    /**
     * Get helm's chart latest version
     * @param {string} repo  - helm repository name
     * @param {string} chart - helm chart name
     */
    async getChartVersion(repo, chart) {
        const keyword = `${repo}/${chart}`;
        const response = JSON.parse(await this._execute(keyword));
        return response['version'];
    }
}


module.exports = {
    Helm,
};
