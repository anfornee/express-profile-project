'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * removeColumn "UserId" from table "posts"
 * addColumn "userId" to table "posts"
 *
 **/

var info = {
    "revision": 5,
    "name": "id_name_fix",
    "created": "2019-05-29T22:37:45.353Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "removeColumn",
        params: ["posts", "UserId"]
    },
    {
        fn: "addColumn",
        params: [
            "posts",
            "userId",
            {
                "type": Sequelize.INTEGER(11),
                "field": "userId",
                "allowDuplicate": true,
                "references": {
                    "model": "users",
                    "key": "UserId"
                },
                "allowNull": false
            }
        ]
    }
];

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
