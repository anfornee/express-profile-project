/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('posts', {
    PostId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    PostTitle: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    PostBody: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'users',
        key: 'UserId'
      },
      allowDuplicate: true
    },
    createdAt: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    Deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: '0'
    }
  }, {
      tableName: 'posts'
    });
};
