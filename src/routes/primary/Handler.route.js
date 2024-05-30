import AuthRoute from "./Auth.route.js";
import RcdRoute from "./Rcd.route.js";

class PrimaryHandler{
  constructor(server) {
    new RcdRoute(server);
    new AuthRoute(server);
  }
}

export default PrimaryHandler;