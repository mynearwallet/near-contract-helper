const Cache = require('node-cache');
const Airtable = require('airtable');

const cache = new Cache({ stdTTL: 60, checkperiod: 0, useClones: false });

const env = {
    apiKey: process.env.BLACKLIST_API_KEY,
    baseId: process.env.BLACKLIST_BASE_ID,
    tableName: process.env.BLACKLIST_TABLE_NAME
};

function hasRequiredVariablesDefined() {
    return env.apiKey && env.baseId && env.tableName;
}

function createBlacklistModule(apiKey, baseId, tableName) {
    const base = new Airtable({ apiKey }).base(baseId);
    const table = base(tableName);

    async function fetchBlacklistedTokens() {
        const tokensRecords = await table.select({
            maxRecords: 100,
            view: 'Grid view'
        }).firstPage();

        return tokensRecords.map(record => ({ address: record.get('token_address') }));
    }

    async function fetchAndCacheBlacklist(cache) {
        const blacklist = await fetchBlacklistedTokens();
        cache.set('blacklist', blacklist);
        return blacklist;
    }

    async function getBlacklist(ctx) {
        ctx.body = cache.get('blacklist') || await fetchAndCacheBlacklist(cache);
    }

    return getBlacklist;
}

let getBlacklist = null;
if (hasRequiredVariablesDefined()) {
    getBlacklist = createBlacklistModule(env.apiKey, env.baseId, env.tableName);
}

module.exports = {
    getBlacklist,
};
