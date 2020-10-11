const simpleGit = require('simple-git');
const fs = require('fs');
const github = require('octonode');


/**
 * Allows to manage repository.
 * It is used to clone, edit, commit, push changes to upstream
 * and opening pull request
 */
class Repository {
    /**
     * @param {string} repository       - github repository, format: org/name
     * @param {string} username         - github username
     * @param {string} password         - github personal access token
     * @param {string} path             - where to clone repository
     * @param {string} branchNamePrefix - branch name prefix
     * @param {string} pathPrefix       - local repository path prefix
     */
    constructor({
        repository,
        password,
        path,
        username,
        branchName,
        pathPrefix = '/tmp/',
    }) {
        this.repoGithubClient = null;
        this.cloneGitClient = null;
        this.repoGitClient = null; // has different baseDir than cloneGitClient
        this.url = null;
        this.path = null;
        this.branchName = branchName;
        this.pathPrefix = pathPrefix;
        this.init(username, password, repository, path);
    }

    /**
     * Initialize objet properties
     * @param {string} username   - github username
     * @param {string} password   - github password
     * @param {string} repository - github repository
     * @param {string} path       - where to clone repository
     */
    init(username, password, repository, path) {
        if (!repository) throw new Error('REPOSITORY must be supplied');
        if (!username && !password) {
            this.url = `https://github.com/${repository}`;
            this.githubRepoClient = github.client().repo(repository);
        } else if (username && password) {
            this.url = `https://${username}:${password}@github.com/${repository}`;
            this.githubRepoClient = github.client(password).repo(repository);
        } else {
            throw new Error(
                'Invalid authentication options. Check USERNAME and PASSWORD',
            );
        }
        if (!path) this.path = `${this.pathPrefix}${repository}`;
        const fileSystemPath = `${this.pathPrefix}${repository.split('/')[0]}`;
        if (!fs.existsSync(fileSystemPath)) {
            fs.mkdirSync(fileSystemPath);
        }
        this.cloneGitClient = simpleGit({ baseDir: fileSystemPath });
    }

    /**
     * Clones repository to path
     */
    async clone() {
        // TODO: add options
        await this.cloneGitClient.clone(this.url);
        this.repoGitClient = simpleGit({ baseDir: this.path });
    }

    /**
     * Creates new local branch
     */
    async checkout() {
        await this.repoGitClient.checkoutLocalBranch(this.branchName);
    }

    /**
     * Push branch to remote origin
     * TODO: Hardcoded origin. Could be parameter?
     * @param {string} commitMessage - commit message
     */
    async push(commitMessage) {
        await this.repoGitClient
            .addConfig('user.email', 'deployment-bumper')
            .addConfig('user.name', 'deployment-bumper')
            .add('.')
            .commit(commitMessage)
            .push('origin', this.branchName);
    }

    /**
     * Create pull request
     * @param {string} branch - against which branch to open pull request
     *                          if not supplied use default branch
     */
    async createPullRequest(branch) {
        if (!branch) {
            // eslint-disable-next-line max-len
            branch = (await this.githubRepoClient.infoAsync())[0].default_branch;
        }
        await this.githubRepoClient.prAsync({
            'title': `Deployment update: ${this.branchName}`,
            'body': 'Updating image to latest version',
            'head': this.branchName,
            'base': branch,
        });
    }
}

module.exports = {
    Repository,
};
