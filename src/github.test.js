const { Repository } = require('./github');

const username = 'username';
const password = 'password';
const repository = 'foo/bar';

describe('Repository', () => {
    test('can be initialized with credentials', () => {
        const repo = new Repository({ repository, username, password });
        expect(repo.url).toBe(`https://${username}:${password}@github.com/${repository}`);
    });

    test('can be initialized without credentials', () => {
        const repo = new Repository({ repository });
        expect(repo.url).toBe(`https://github.com/${repository}`);
    });

    test('throws an error, when either username is not supplied', () => {
        expect(() => {
            new Repository({ repository, password });
        }).toThrow();
    });

    test('throws an error, when either password is not supplied', () => {
        expect(() => {
            new Repository({ repository, username });
        }).toThrow();
    });
});
