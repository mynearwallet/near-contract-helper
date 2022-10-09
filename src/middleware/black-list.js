const Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.BLACKLIST_API_KEY }).base(process.env.BLACKLIST_BASE_ID);
const Cache = require('node-cache');

async function fetchBlacklistedTokens() {
    const tokensRecords = await base('Tokens Blacklist').select({
        maxRecords: 100,
        view: 'Grid view'
    }).firstPage();

    return tokensRecords.map(record => ({ address: record.get('token_address') }));
}


const cache = new Cache({ stdTTL: 60, checkperiod: 0, useClones: false });

async function fetchAndCacheBlacklist(cache) {
    const blacklist = await fetchBlacklistedTokens();
    cache.set('blacklist', blacklist);
    return blacklist;
}

async function getBlacklist(ctx) {
    ctx.body = cache.get('blacklist') || await fetchAndCacheBlacklist(cache);
}

module.exports = {
    getBlacklist,
};
