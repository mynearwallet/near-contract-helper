const Cache = require('node-cache');

const CHUNK_SIZE = 25;

const cache = new Cache({ stdTTL: 60 * 60, checkperiod: 0, useClones: false });

function parseTokenNamesFromURI ({ tokens }) {
    try {
        const tokensCollection = decodeURIComponent(tokens).split(',');
        if (!tokensCollection[0].length) {
            throw new Error('Argument is not an array or being null');
        }
        return tokensCollection;
    } catch (err) {
        console.error(err);
        return [];
    }
}

function arrayPartition (array, size) {
    let chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

async function execBatch (batches, callback) {
    const result = {};
    let hasError = false;
    for (let i = 0; i < batches.length; i++) {
        await Promise.all(batches[i].map(async (token) => {
            result[token] = await callback(token);
        })).catch((err) => {
            console.error(err);
            hasError = true;
        });
        if (hasError) {
            return {};
        }
    }
    return result;
}

async function getFtMetadata (ctx) {
    const rawTokens = parseTokenNamesFromURI(ctx.query);
    const uniqueTokens = [...new Set(rawTokens)];
    const batches = arrayPartition(uniqueTokens, CHUNK_SIZE);
    
    const result = await execBatch(batches, async (token) => { 
        if (!cache.has(token)) {
            const metadata = await ctx.nearViewAccount.viewFunction(
                token,
                'ft_metadata'
            );
            cache.set(token, metadata);
        }

        return cache.get(token);
    });
    ctx.body = result;
}

module.exports = {
    getFtMetadata,
};
