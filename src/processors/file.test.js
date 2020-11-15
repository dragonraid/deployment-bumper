const { File } = require('./file');
const fs = require('fs').promises;
const yaml = require('js-yaml');


const filePathJson = './test_file.JSON';
const filePathYaml = './test_file.yaml';
const keyValuePairs = {
    key1: 'value1',
};
const origFileData = {
    key1: 'valueXXX',
    keyN: 'valueN',
};
const resultedFileData = {
    key1: 'value1',
    keyN: 'valueN',
};

const jsonFile = new File({ filePath: filePathJson, keyValuePairs });
const yamlFile = new File({ filePath: filePathYaml, keyValuePairs });

describe('File', () => {
    test('throws an error if not properly initialized', () => {
        expect(() => new File()).toThrow();
    });
});

describe('JSON file', () => {
    beforeEach(async () => {
        const content = JSON.stringify(origFileData);
        await fs.writeFile(filePathJson, content);
    });

    afterAll(async () => {
        await fs.unlink(filePathJson);
    });

    test('can be initialized', () => {
        expect(jsonFile.type).toBe('JSON');
    });

    test('can be read', async () => {
        const fileRead = await jsonFile.read();
        expect(fileRead).toMatchObject(origFileData);
    });

    test('can be written', async () => {
        await jsonFile.write(resultedFileData);
        const content = await fs.readFile(filePathJson, 'utf8');
        const data = JSON.parse(content);
        expect(data).toMatchObject(resultedFileData);
    });

    test('is able to execute run() function', async () => {
        await jsonFile.run();
        const content = await fs.readFile(filePathJson, 'utf8');
        const data = JSON.parse(content);
        expect(data).toMatchObject(resultedFileData);
    });
});

describe('YAML file', () => {
    beforeEach(async () => {
        const content = yaml.safeDump(origFileData);
        await fs.writeFile(filePathYaml, content);
    });

    afterAll(async () => {
        await fs.unlink(filePathYaml);
    });

    test('can be initialized', () => {
        expect(yamlFile.type).toBe('YAML');
    });

    test('can be read', async () => {
        const fileRead = await yamlFile.read();
        expect(fileRead).toMatchObject(origFileData);
    });

    test('can be written', async () => {
        await yamlFile.write(resultedFileData);
        const content = await fs.readFile(filePathYaml, 'utf8');
        const data = yaml.safeLoad(content);
        expect(data).toMatchObject(resultedFileData);
    });

    test('is able to execute run() function', async () => {
        await yamlFile.run();
        const content = await fs.readFile(filePathYaml, 'utf8');
        const data = yaml.safeLoad(content);
        expect(data).toMatchObject(resultedFileData);
    });
});

describe('File', () => {
    test('can be edited', () => {
        const editedData = jsonFile.edit(origFileData);
        expect(editedData).toMatchObject(resultedFileData);
    });
});
