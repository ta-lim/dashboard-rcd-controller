import Primary from "./Primary.js";
import RcdController from "../../controllers/primary/Rcd.controller.js";

class RcdRoute extends Primary {
  constructor(server) {
    super(server);
    
    this.endpointPrefix = this.endpointPrefix + '/rcd'; // /api/v1/primary/rcd
    this.RcdController = new RcdController(this.server);

    this.routes();
  }

  routes() {
    this.API.get(this.endpointPrefix, (req, res) => this.RcdController.getAllData(req,res));
    this.API.get(this.endpointPrefix + '/analyze', (req, res) => this.RcdController.getAnalyze(req,res));
    this.API.get(this.endpointPrefix + '/detail/:id', (req, res) => this.RcdController.getDetail(req,res));
    this.API.get(this.endpointPrefix + '/search', (req, res) => this.RcdController.search(req, res));
    this.API.get(this.endpointPrefix + '/filter', (req, res) => this.RcdController.filterData(req, res));
    this.API.get(this.endpointPrefix + '/master-data-filter', (req, res) => this.RcdController.masterDataFilter(req, res));
    this.API.get(this.endpointPrefix + '/download', this.AuthorizationMiddleware.check(), (req, res) => this.RcdController.downloadData(req, res));

    this.API.post(this.endpointPrefix + '/create',this.AuthorizationMiddleware.check(),  (req, res) => this.RcdController.createData(req, res));

    this.API.put(this.endpointPrefix + '/update', this.AuthorizationMiddleware.check(), (req, res) => this.RcdController.updateData(req, res));
    this.API.put(this.endpointPrefix + '/update-status', this.AuthorizationMiddleware.check(),  (req, res) => this.RcdController.updateStatus(req, res));

    this.API.delete(this.endpointPrefix + '/delete/:id', this.AuthorizationMiddleware.check(), (req, res) => this.RcdController.deleteData(req, res))

  }
}

export default RcdRoute;
