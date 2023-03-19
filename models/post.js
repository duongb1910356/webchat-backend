'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsToMany(models.Post, {as: 'sub1', through: "subposts", foreignKey: "id_pre"})
      this.belongsToMany(models.Post, {as: 'sub2', through: "subposts", foreignKey: "id"})

    }
  }
  Post.init({
    title: DataTypes.STRING,
  }, {
    createdAt: false,
    updatedAt: false,
    sequelize,
    modelName: 'Post',
  });
  return Post;
};