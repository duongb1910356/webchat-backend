'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Friend extends Model {
    static associate(models) {
    }

    // async getListFriend() {
    //   const friends = await User.findOne({
    //     where: { uid: this.uid },
    //     include: [{ model: User, as: "friend1" }],
    //   });
    //   // console.log(JSON.stringify(friends.friend1))
    //   return JSON.stringify(friends.friend1)
    // }
  }
  Friend.init({
    idp1: {type: DataTypes.STRING, primaryKey: true},
    idp2: {type: DataTypes.STRING, primaryKey: true},
  }, {
    createdAt: false,
    updatedAt: false,
    sequelize,
    modelName: 'Friend',
  });
  return Friend;
};