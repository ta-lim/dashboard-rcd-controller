// Library
import JWT from 'jsonwebtoken';
import { customAlphabet } from 'nanoid';

class JwtHelper {
  constructor(server) {
    this.server = server;
  }

  generateToken(data = null) {
    const idGen = customAlphabet('1234567890', 10);
    const tokenId = idGen();

    return JWT.sign(
      {
        tokenId,
        data
      },
      this.server.env.JWT_TOKEN_SECRET,
      { expiresIn: this.server.env.JWT_TOKEN_EXPIRED }
    )
  }

  generateWithRefreshToken(data = null) {
    const idGen = customAlphabet('1234567890', 10);
    const tokenId = idGen();
    const token = JWT.sign(
      {
        tokenId,
        data
      },
      this.server.env.JWT_TOKEN_SECRET,
      { expiresIn: this.server.env.JWT_TOKEN_EXPIRED }
    );

    return {
      token,
      refreshToken: JWT.sign(
        {
          tokenId,
          data,
          refreshToken: true
        },
        this.server.env.JWT_TOKEN_SECRET
      )
    }
  }

  async refreshTokenValidation(tokenData, refreshToken) {
    return JWT.verify(refreshToken, this.server.env.JWT_TOKEN_SECRET, (err, data) => {
      if(err) return -1;

      if(data.refreshToken !== true) return -1;
      if(data.tokenId !== tokenData.tokenId) return -2;
      if(data.data.userUUID !== tokenData.data.userUUID) return -3;

      return this.generateWithRefreshToken(tokenData.data);
    });
  }

  generateCustomToken(data = null, expired = null) {
    const idGen = customAlphabet('1234567890', 10);
    const tokenId = idGen();

    return JWT.sign(
      {
        tokenId,
        data
      },
      this.server.env.JWT_TOKEN_SECRET,
      { expiresIn: expired }
    )
  }

  validateCustomToken(token) {
    return JWT.verify(token, this.server.env.JWT_TOKEN_SECRET, (err, data) => {
      if(err) return -1;
      return data;
    });
  }
}

export default JwtHelper;