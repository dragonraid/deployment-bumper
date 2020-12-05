const { Helmfile } = require('./helmfile');

jest.mock('axios');

describe('Helmfile can', () => {
    test('construct global arguments', () => {
        const globalArgsInput = {
            file: '/tmp/helmfile.yaml',
            environment: 'default',
        };
        const globalArgsOutput = '-f /tmp/helmfile.yaml -e default';
        const helmfile = new Helmfile(globalArgsInput);
        expect(helmfile.globalArgs).toBe(globalArgsOutput);
    });

    test('construct only global arguments', () => {
        const globalArgsInput = {
            file: '/tmp/helmfile.yaml',
            environment: 'default',
            foo: 'bar',
        };
        const globalArgsOutput = '-f /tmp/helmfile.yaml -e default';
        const helmfile = new Helmfile(globalArgsInput);
        expect(helmfile.globalArgs).toBe(globalArgsOutput);
    });
});
