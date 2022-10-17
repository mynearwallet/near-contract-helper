const Cache = require('node-cache');

const CHUNK_SIZE = 25;

const cache = new Cache({ stdTTL: 60 * 60, checkperiod: 0, useClones: false });

async function getFtMetadata (ctx) {
    const { tokens } = ctx.query;
    let chunkedList = [];
    
    try {
        const tokensArray = decodeURIComponent(tokens).split(',');
        if (!tokensArray[0].length) {
            throw new Error('Argument is not an array or being null');
        }
        const uniqueTokensArray = [...new Set(tokensArray)];
        for (let i = 0; i < uniqueTokensArray.length; i += CHUNK_SIZE) {
            chunkedList.push(uniqueTokensArray.slice(i, i + CHUNK_SIZE));
        }
    } catch (err) {
        console.error(err);
        ctx.status = 400;
        ctx.body = {};
        return;
    }
    
    const result = {};
    let hasError = false;
    for (let i = 0; i < chunkedList.length; i++) {
        await Promise.all(chunkedList[i].map(async (token) => {
            if (!cache.has(token)) {
                const metadata = await ctx.nearViewAccount.viewFunction(
                    token,
                    'ft_metadata'
                );
                cache.set(token, metadata);
            }
    
            result[token] = cache.get(token);
        })).catch((err) => {
            console.error(err);
            hasError = true;
        });
        if (hasError) {
            ctx.status = 400;
            ctx.body = {};
            return;
        }
    }

    ctx.body = result;
}

module.exports = {
    getFtMetadata,
};
