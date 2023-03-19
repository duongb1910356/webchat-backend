'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    static associate(models) {
        this.belongsToMany(models.User, {as: "have", through: "joins", foreignKey: "idgroup"});
    }
  }
  Group.init({
    id: {type: DataTypes.STRING, primaryKey: true},
    groupname: {type: DataTypes.STRING},
    num: {type: DataTypes.INTEGER},
    photoURL: {type: DataTypes.STRING}
  }, {
    createdAt: false,
    updatedAt: false,
    sequelize,
    modelName: 'Group',
  });

  return Group;
};