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

    it('Works as exprected', async () => {
        await request
            .get('/tokens/ft_metadata?tokens=wrap.testnet,usdc.testnet') 
            .expect(200)
            .expect((res) => {
                assert(!!res.body['usdc.testnet']);
                assert(!!res.body['wrap.testnet']);
            });
    });

    it('Only unique tokens', async () => {      
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

    it('One of the tokens not exist', async () => {      
        await request
            .get('/tokens/ft_metadata?tokens=wrap.testnet,usdc.1111')
            .expect(400)
            .expect((res) => {
                assert(Object.keys(res.body).length === 0);
            });
    });

    it('Null as an argument', async () => {
        await request
            .get('/tokens/ft_metadata?tokens=')
            .expect(400)
            .expect((res) => {
                assert(Object.keys(res.body).length === 0);
            });
    });

    it('Junk as an argument', async () => {      
        await request
            .get('/tokens/ft_metadata?tokens=sdasdasdasd')
            .expect(400)
            .expect((res) => {
                assert(Object.keys(res.body).length === 0);
            });
    });

    it('Parsing arguments error. URI malformed', async () => {      
        await request
            .get('/tokens/ft_metadata?tokens=!@#$$%')
            .expect(400)
            .expect((res) => {
                assert(Object.keys(res.body).length === 0);
            });
    });
});
