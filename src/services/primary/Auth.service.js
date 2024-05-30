import { where } from "sequelize";
import JwtHelper from "../../helpers/JWT.helper.js";
import UserModel from "../../models/User.model.js";

import md5 from 'md5';


class AuthService{
  constructor(server){
    this.server = server;

    this.UserModel = new UserModel(this.server).table;
    this.JwtHelper = new JwtHelper(this.server);
  }

  async createAccount(data) {
    const userModeData = await this.UserModel.findOne({
      where: {
        username: data.username
      }
    });

    if(userModeData !== null) return -1;
    const password = md5(data.password + ' - ' + this.server.env.HASH_SALT);
    const role = data.role === "1" ? "admin" : data.role === "2" ? "staff" : null;

    const addUserModel = await this.UserModel.create({
      name: data.name,
      username: data.username,
      password: password,
      role: role
    })
    
    return 1;
  }

  async login(data, rememberMe) {
    const getDataUserModel = await this.UserModel.findOne({ 
      where: {
        username: data.username,
        password: md5(data.password + ' - ' + this.server.env.HASH_SALT)
      } 
    });

    if(getDataUserModel === null) return -1;

    if(rememberMe === "true") return this.JwtHelper.generateWithRefreshToken({ role: getDataUserModel.dataValues.role, username: getDataUserModel.dataValues.username })

    return this.JwtHelper.generateToken({ role: getDataUserModel.dataValues.role, username: getDataUserModel.dataValues.username});
  }

  async changePassword(username, newPassword) {
    const checkSamePassword = await this.UserModel.findAll({
      where: {
        username: username,
        password: md5(newPassword + ' - ' + this.server.env.HASH_SALT)
      }
    })
    // console.log(username, newPassword)
    console.log(checkSamePassword)
    if(checkSamePassword.length !== 0) return -1

    const changePasswordModel = await this.UserModel.update(
      {
        password: md5(newPassword + ' - ' + this.server.env.HASH_SALT)
      },{
        where: {
          username: username
        }
      }
    )

    console.log(changePasswordModel)
    return 1;
  }

  async refreshToken(tokenData, refreshToken){
    return this.JwtHelper.refreshTokenValidation(tokenData, refreshToken);
  }

  async tokenCheck(username){
    const getDataUserModel = await this.UserModel.findOne({
      where: {
        username
      }
    })

    if(getDataUserModel === null) return -1;

    return{
      name: getDataUserModel.dataValues.name,
      role: getDataUserModel.dataValues.role
    }
  }

  async getListUsers(){
    const getListUsersModel = await this.UserModel.findAll({
      attributes:[
        "username",
        "name",
        "role"
      ]
    })

    return getListUsersModel;
  }
} 

export default AuthService