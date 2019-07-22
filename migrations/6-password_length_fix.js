'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * changeColumn "Password" on table "users"
 *
 **/

var info = {
    "revision": 6,
    "name": "password_length_fix",
    "created": "2019-05-29T22:39:47.643Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "changeColumn",
    params: [
        "users",
        "Password",
        {
            "type": Sequelize.STRING,
            "field": "Password",
            "allowNull": true
        }
    ]
}];

module.exports = {
    pos: 0,
    up: function(queryInterface, Sequelize)
    {
        var index = this.pos;
        return new Promise(function(resolve, reject) {
            function next() {
                if (index < migrationCommands.length)
                {
                    let command = migrationCommands[index];
                    console.log("[#"+index+"] execute: " + command.fn);
                    index++;
                    queryInterface[command.fn].apply(queryInterface, command.params).then(next, reject);
                }
                else
                    resolve();
            }
            next();
        });
    },
    info: info
};
