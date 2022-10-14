const Cache = require('node-cache');

const cache = new Cache({ stdTTL: 60 * 60, checkperiod: 0, useClones: false });

async function getFtMetadata (ctx) {
    const { tokens } = ctx.query;
    const result = {};

    try {
        const tokensArray = decodeURIComponent(tokens).split(',');
        if (tokensArray[0].length) {
            await Promise.allSettled(tokensArray.map(async (token) => {
                if (!cache.has(token)) {
                    const metadata = await ctx.nearDontCareAccount.viewFunction(
                        token,
                        'ft_metadata'
                    );
                    cache.set(token, metadata);
                }

                result[token] = cache.get(token);
            }));
        }
    } catch (err) {
        console.error(err);
    }

    ctx.body = JSON.stringify(result);
}

module.exports = {
    getFtMetadata,
};
