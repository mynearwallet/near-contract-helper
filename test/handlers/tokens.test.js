const assert = require('assert');
const supertest = require('supertest');
require('dotenv').config({ path: 'test/.env.test' });

const server = require('../../indexer');

describe('Tokens: GET /tokens/ft_metadata', () => {
    let request;

    before(() => {
        request = supertest.agent(server);
    });

    after(() => server.close());

    it('Works as expected', async () => {
        await request
            .get('/tokens/ft_metadata?tokens=wrap.testnet,usdc.testnet') 
            .expect(200)
            .expect((res) => {
                assert(!!res.body['usdc.testnet']);
                assert(!!res.body['wrap.testnet']);
            });
    });

    it('Works with only unique tokens', async () => {      
        await request
            .get('/tokens/ft_metadata?tokens=wrap.testnet,usdc.testnet,usdc.testnet')
            .expect(200)
            .expect((res) => {
                assert(!!res.body['usdc.testnet']);
                assert(!!res.body['wrap.testnet']);
                assert(Object.keys(res.body).length === 2);
            });
    });

    // Add test cases for chunking

    it('Returns nothing when one of the tokens not exist', async () => {      
        await request
            .get('/tokens/ft_metadata?tokens=wrap.testnet,usdc.1111')
            .expect(200)
            .expect((res) => {
                console.warn('res.body= ', res.body);
                assert(Object.keys(res.body).length === 0);
            });
    });

    it('Returns nothing when null as an argument', async () => {
        await request
            .get('/tokens/ft_metadata?tokens=')
            .expect(200)
            .expect((res) => {
                assert(Object.keys(res.body).length === 0);
            });
    });

    it('Returns nothing when junk as an argument', async () => {      
        await request
            .get('/tokens/ft_metadata?tokens=sdasdasdasd')
            .expect(200)
            .expect((res) => {
                assert(Object.keys(res.body).length === 0);
            });
    });

    it('Returns nothing when parsing arguments error. URI malformed', async () => {      
        await request
            .get('/tokens/ft_metadata?tokens=%%%%%')
            .expect(200)
            .expect((res) => {
                assert(Object.keys(res.body).length === 0);
            });
    });
});
