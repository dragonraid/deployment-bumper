const util = require('util');
const exec = util.promisify(require('child_process').exec);

const execute = async (command) => {
    const { stdout, stderr } = await exec(command);
    console.log(stdout, stderr);
}

const main = async () => {
    await execute('npm install --only=prod');
    await execute('npm start');
};

main();
