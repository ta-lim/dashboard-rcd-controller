import ResponsePreset from '../../helpers/ResponsePreset.helper.js';
import UserModel from '../../models/User.model.js';

// Library
import JWT from "jsonwebtoken";
import cors from 'cors';

class Authorization {
  constructor(server) {
    this.server = server;
    this.ResponsePreset = new ResponsePreset();

    this.UserModel = new UserModel(this.server).table;
  }

  check() {
    return (req, res, next) => {
      if(!req.headers['authorization'] && req.query.token) req.headers['authorization'] = req.query.token;
      req.middlewares.authorization = {};
      const token = req.headers['authorization'];
      
      if(!token || token === 'undefined') {
        if(this.optionalRoutes(req) === true) return next();

        return res.status(401).json(this.ResponsePreset.resErr(
          401,
          'Request Unauthorized',
          'token',
          { code: -1 }
        ));
      };
      
      JWT.verify(token, this.server.env.JWT_TOKEN_SECRET, async (err, data) => {
        if(err) {
          if(err.name !== 'TokenExpiredError') return res.status(401).json(this.ResponsePreset.resErr(
            401,
            'Token Unauthorized',
            'token',
            { code: -2 }
          ));
          
          if(!req.path.endsWith('/auth/refresh-token')) return res.status(401).json(this.ResponsePreset.resErr(
            401,
            'Token Expired',
            'token',
            { code: -3 }
          ));
          
          data = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf8'));
        }
        
        const getDataUserModel = await this.UserModel.findOne({
          where: {
            username: data.data.username
          }
        });

        if(getDataUserModel === null) return res.status(401).json(this.ResponsePreset.resErr(
          401,
          'Token Unauthorized',
          'token',
          { code: -2 }
        )); 

        req.middlewares.authorization = data;

        return next();
      });
    }
  }

  integratedTokenPermission(res, level) {
    return;
  }

  optionalRoutes(req) {
    switch(true) {
      default: return false;
    }
  }

}

export default Authorization;