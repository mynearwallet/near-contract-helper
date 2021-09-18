'use strict';

module.exports = (sequelize, DataTypes) => {
    const EmailDomainBlacklist = sequelize.define('EmailDomainBlacklist', {
        domainName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isTemporaryEmailService: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        hasValidDNSMXRecord: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        error: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        staleAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    }, {
        timestamps: true,
    });

    return EmailDomainBlacklist;
};
