'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Join extends Model {
    static associate(models) {
    }
  }
  Join.init({
    uid: {type: DataTypes.STRING, primaryKey: true},
    idgroup: {type: DataTypes.STRING, primaryKey: true},
  }, {
    createdAt: false,
    updatedAt: false,
    sequelize,
    modelName: 'Join',
  });

  return Join;
};