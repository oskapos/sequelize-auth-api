import JWTUtils from '../utils/jwt-utils';

function requiresAuth(tokenType = 'accessToken') {
  return function (req, res, next) {
    const authHeader = req.headers.authorization;

    //Check if the auth header exists and valid
    if (authHeader) {
      try {
        var [bearer, token] = authHeader.split(' '); //Bearer 'oaihjnrsioaucnaov'

        if (bearer.toLowerCase() !== 'bearer' || !token) {
          throw Error;
        }
      } catch (err) {
        return res.status(401).send({ success: false, message: 'Bearer token malformed' });
      }
    } else {
      return res.status(401).send({ success: false, message: 'authorization header not found' });
    }

    //Verify the Token
    try {
      let jwt;
      switch (tokenType) {
        case 'refreshToken':
          jwt = JWTUtils.verifyRefreshToken(token);
        case 'accessToken':
        default:
          jwt = JWTUtils.verifyAccessToken(token);
      }
      req.body.jwt = jwt;
      next();
    } catch (err) {
      return res.status(401).send({ success: false, message: 'Invalid Token' });
    }
  };
}

export default requiresAuth;
