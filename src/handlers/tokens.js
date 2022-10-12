async function getFtMetadata (ctx) {
    const { tokens } = ctx.params;
    const result = {};
    try {
        const tokensArray = JSON.parse(tokens);
        const account = await ctx.near.account('dontcare');
        await Promise.all(tokensArray.map(async (token) => {
            result[token] = await account.viewFunction(
                token,
                'ft_metadata'
            );
        }));

    } catch (err) {
        console.error(err);
    }
    ctx.body = {
        result: JSON.stringify(result)
    };
}

module.exports = {
    getFtMetadata,
};
