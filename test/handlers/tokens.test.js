const assert = require('assert');
const supertest = require('supertest');
require('dotenv').config({ path: 'test/.env.test' });

const server = require('../../indexer');

describe('Tokens', () => {
    let request;

    before(async () => {
        request = supertest.agent(server);
    });

    after(() => server.close());

    it('GET /tokens/ft_metadata works', async () => {
        await request
            .get('/tokens/ft_metadata?tokens=wrap.testnet,usdc.testnet')
            .expect(200)
            .expect((res) => {
                console.log('res.body = ', res);
                assert(!!res.body['usdc.testnet']);
                assert(!!res.body['wrap.testnet']);
            });

        await request
            .get('/tokens/ft_metadata?tokens=wrap.testnet,usdc.1111')
            .expect(200)
            .expect((res) => {
                assert(!!res.body['wrap.testnet']);
            });
        
        await request
            .get('/tokens/ft_metadata?tokens=')
            .expect(200)
            .expect((res) => {
                assert(Object.keys(res.body).length === 0);
            });
        
        await request
            .get('/tokens/ft_metadata?tokens=sdasdasdasd')
            .expect(200)
            .expect((res) => {
                assert(Object.keys(res.body).length === 0);
            });
    });

});
