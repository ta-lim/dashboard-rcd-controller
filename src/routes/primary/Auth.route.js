import AuthController from "../../controllers/primary/Auth.controller.js";
import Primary from "./Primary.js";

class AuthRoute extends Primary{
  constructor(server) {
    super(server);
    
    this.endpointPrefix = this.endpointPrefix + '/auth'; // /api/v1/primary/auth
    this.AuthController = new AuthController(this.server);

    this.routes();
  }

  routes(){
    this.API.post(this.endpointPrefix + '/login', (req,res) => this.AuthController.login(req, res));
    this.API.post(this.endpointPrefix + '/create', this.AuthorizationMiddleware.check(), (req,res) => this.AuthController.createAccount(req, res));
    this.API.post(this.endpointPrefix + '/change-password', this.AuthorizationMiddleware.check(), (req,res) => this.AuthController.changePassword(req, res));

    this.API.get(this.endpointPrefix + '/check-token', this.AuthorizationMiddleware.check(), (req, res) => this.AuthController.tokenCheck(req, res));
    this.API.get(this.endpointPrefix + '/refresh-token', this.AuthorizationMiddleware.check(), (req, res) => this.AuthController.refreshToken(req, res));
    this.API.get(this.endpointPrefix + '/list-users', this.AuthorizationMiddleware.check(), (req, res) => this.AuthController.getListUsers(req, res));

  }
  
}

export default AuthRoute;