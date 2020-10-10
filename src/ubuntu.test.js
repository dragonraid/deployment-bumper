const axios = require('axios');
const { Ubuntu } = require('./ubuntu');

jest.mock('axios');

describe('Ubuntu can', () => {
    test('determine latest image', async () => {
        const criteria = {
            cloud: 'Amazon AWS',
            zone: 'sa-east-1',
            version: '20.04',
            architecture: 'amd64',
            instanceType: 'hvm-ssd',
        };
        const axiosResponse = {
            data: `{ "aaData": [["Amazon AWS", "sa-east-1", "focal", "20.04", "amd64",  "hvm-ssd", "20200907", "<a href=\\"https://console.aws.amazon.com/ec2/home?region=sa-east-1#launchAmi=ami-0f4c19e1a758f4efd\\">ami-0f4c19e1a758f4efd</a>"],
            ["Amazon AWS", "sa-east-1", "focal", "20.04", "amd64",  "hvm-ssd", "20190907", "<a href=\\"https://console.aws.amazon.com/ec2/home?region=sa-east-1#launchAmi=ami-0f4c19e1a758f4efe\\">ami-0f4c19e1a758f4efe</a>"],
            ["Amazon AWS", "us-west-2", "focal", "18.04", "amd64",  "hvm-ssd", "20200907", "<a href=\\"https://console.aws.amazon.com/ec2/home?region=sa-east-1#launchAmi=ami-0f4c19e1a758f4eff\\">ami-0f4c19e1a758f4eff</a>"],]}`,
        };
        const expected = {
            cloud: 'Amazon AWS',
            zone: 'sa-east-1',
            name: 'focal',
            version: '20.04',
            architecture: 'amd64',
            instanceType: 'hvm-ssd',
            release: '20200907',
            link: 'https://console.aws.amazon.com/ec2/home?region=sa-east-1#launchAmi=ami-0f4c19e1a758f4efd',
            id: 'ami-0f4c19e1a758f4efd',
        };

        axios.get.mockResolvedValue(axiosResponse);
        const ubuntu = new Ubuntu(criteria);
        expect(await ubuntu.latest).toMatchObject(expected);
        // TODO: add tests for other providers
    });
});
