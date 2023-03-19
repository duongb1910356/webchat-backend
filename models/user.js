'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // // this.hasOne(models.Post,{
      // //   foreignKey: 'id'
      // // })
      this.belongsToMany(models.User, { as: "friend1", through: "friends", foreignKey: "idp1" });
      this.belongsToMany(models.User, { as: "friend2", through: "friends", foreignKey: "idp2" });
      this.belongsToMany(models.Group, {as: "depend", through: "joins", foreignKey: "uid"});
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
  User.init({
    uid: { type: DataTypes.STRING, primaryKey: true },
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    pass: DataTypes.STRING,
    photoURL: DataTypes.STRING,
    socketID: DataTypes.STRING,
    phone: DataTypes.TEXT,
    dob: DataTypes.DATE,
    gender: DataTypes.STRING
  }, {
    createdAt: false,
    updatedAt: false,
    sequelize,
    modelName: 'User',
  });
  return User;
};