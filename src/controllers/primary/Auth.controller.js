import AuthService from "../../services/primary/Auth.service.js";
import ResponsePreset from "../../helpers/ResponsePreset.helper.js";
import AuthValidator from "../../validators/primary/Auth.validator.js";

import Ajv from "ajv";

class AuthController { 
  constructor(server) {
    this.server = server;

    this.Ajv = new Ajv();
    this.ResponsePreset = new ResponsePreset();
    
    this.AuthValidator = new AuthValidator();
    this.AuthService = new AuthService(this.server);

  }

  async createAccount(req, res) {
    const schemeValidate = this.Ajv.compile(this.AuthValidator.createUserScheme);

    if(!schemeValidate(req.body)) return res.status(400).json(this.ResponsePreset.resErr(
      400,
      schemeValidate.errors[0].message,
      'validator',
      schemeValidate.errors[0]
    ));

    const createAccountSrv = await this.AuthService.createAccount(req.body);

    if(createAccountSrv === -1) return res.status(403).json(this.ResponsePreset.resErr(
      403,
      'Forbidden, Username Already Registered',
      'service',
      { code: -1 }
    ));
    if( createAccountSrv === 1 ) return res.status(200).json(this.ResponsePreset.resOK('OK', null))
  }

  async login(req, res){
    const schemeValidate = this.Ajv.compile(this.AuthValidator.loginScheme);

    if(!schemeValidate(req.body)) return res.status(400).json(this.ResponsePreset.resErr(
      400,
      schemeValidate.errors[0].message,
      'validator',
      schemeValidate.errors[0]
    ));

    const rememberMe = req.query.rememberMe;
    
    const loginSrv = await this.AuthService.login(req.body, rememberMe);

    if(loginSrv === -1) return res.status(404).json(this.ResponsePreset.resErr(
      404,
      'Not Found, username or password is wrong',
      'service',
      { code: -1 }
    ))
    return res.status(200).json(this.ResponsePreset.resOK('OK', loginSrv))
  }

  async changePassword(req, res) {
    const schemeValidateChagePassword = this.Ajv.compile(this.AuthValidator.changePasswordScheme);

    if(!schemeValidateChagePassword(req.body)) return res.status(400).json(this.ResponsePreset.resErr(
      400,
      schemeValidateChagePassword.errors[0].message,
      'validator',
      schemeValidateChagePassword.errors[0]
    ));
    const { username, newPassword } = req.body
    const changePasswordSrv = await this.AuthService.changePassword(username, newPassword);
    if(changePasswordSrv === -1) return res.status(404).json(this.ResponsePreset.resErr(
      404,
      'Same password with before used',
      'service',
      { code: -1 }
    ))

    if(changePasswordSrv === 1) return res.status(200).json(this.ResponsePreset.resOK('Success update password'))
  }

  async refreshToken(req, res){
    const tokenData = req.middlewares.authorization;
    const { refreshToken } = req.query;
    const getRefreshTokenSrv = await this.AuthService.refreshToken(tokenData, refreshToken);
    
    if(getRefreshTokenSrv === -1) return res.status(401).json(this.ResponsePreset.resErr(
      401,
      'Refresh Token Unauthorized',
      'service',
      { code: -1 }
    ));

    if(getRefreshTokenSrv === -2) return res.status(401).json(this.ResponsePreset.resErr(
      401,
      'Refresh Token Id Not Same',
      'service',
      { code: -2 }
    ));

    if(getRefreshTokenSrv === -3) return res.status(401).json(this.ResponsePreset.resErr(
      401,
      'Refresh Token User Id Not Same',
      'service',
      { code: -3 }
    ));

    return res.status(200).json(this.ResponsePreset.resOK('OK', getRefreshTokenSrv));

  }

  async tokenCheck(req, res){
    const username = req.middlewares.authorization.data.username;
    const tokenCheckSrv = await this.AuthService.tokenCheck(username);

    if(tokenCheckSrv === -1) return res.status(404).json(this.ResponsePreset.resErr(
      404,
      'Not Found, User Username Not Exist',
      'service',
      { code: -1 }

    ))
    
    return res.status(200).json(this.ResponsePreset.resOK('OK', tokenCheckSrv))
  }
  
  async getListUsers(req, res){
    const role = req.middlewares.authorization.data.role;

    if(role !== "admin") return res.status(401).json(this.ResponsePreset.resErr(
      401,
      'Request Unauthorized',
      'token',
      { code: -1 }
    ));
    const listUserSrv = await this.AuthService.getListUsers()

    if(listUserSrv.length !== 0) return res.status(200).json(this.ResponsePreset.resOK("OK",listUserSrv))

  }
}

export default AuthController;