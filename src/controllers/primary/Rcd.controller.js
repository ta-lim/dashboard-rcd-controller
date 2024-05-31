import RcdService from "../../services/primary/Rcd.service.js";
import RcdValidator from "../../validators/primary/Rcd.validator.js";

// Helper
import ResponsePreset from "../../helpers/ResponsePreset.helper.js";

// Library
import Ajv from 'ajv';
import addFormats from "ajv-formats"

class RcdController {
  constructor(server) {
    this.server = server;

    // Init Service
    this.RcdService = new RcdService(this.server);

    // Init Helper
    this.ResponsePreset = new ResponsePreset();

    this.Ajv = new Ajv();
    addFormats(this.Ajv);
    this.RcdValidator = new RcdValidator();
    
    this.Ajv.addKeyword('futureDate', {
      type: 'string',
      validate: function (schema, data) {
        const today = new Date().setHours(0, 0, 0, 0);
        const date = new Date(data).setHours(0, 0, 0, 0);
        return date >= today;
      },
      errors: false
    }); 
  }

  async createData(req, res){
    const schemeValidate = this.Ajv.compile(this.RcdValidator.createDataScheme);

    if(!schemeValidate(req.body)) return res.status(400).json(this.ResponsePreset.resErr(
      400,
      schemeValidate.errors[0].message,
      'validator',
      schemeValidate.errors[0]
    ));
    
    const createDataSrv = await this.RcdService.createData(req.body);
    if(createDataSrv === 1) return res.status(200).json(this.ResponsePreset.resOK("OK", null))
  }

  async getAllData(req, res){
    const { category, subCategory } = req.query
    if ( !category) return res.status(400).json(this.ResponsePreset.resErr(
      404,
      "Not found",
      'service',
      -1
    ))
    const getAllData = await this.RcdService.getAllData(category, subCategory);

    return res.status(200).json(this.ResponsePreset.resOK('OK', getAllData));
  }

  async getDetail(req, res){
    const { id } = req.params
    const getDetail = await this.RcdService.getDetail(id);

    return res.status(200).json(this.ResponsePreset.resOK('OK', getDetail));

  }

  async updateData(req, res){
    const schemeValidate = this.Ajv.compile(this.RcdValidator.updateDataScheme);

    if(!schemeValidate(req.body)) return res.status(400).json(this.ResponsePreset.resErr(
      400,
      schemeValidate.errors[0].message,
      'validator',
      schemeValidate.errors[0]
    ));
    const updateDataSrv = await this.RcdService.updateData(req.body, req.middlewares.authorization);
    if (updateDataSrv === 1) return res.status(200).json(this.ResponsePreset.resOK("OK", null))
    if (updateDataSrv === -1) return res.status(401).json(this.ResponsePreset.resErr( 
      400,
      'Bad request, Minimum length search 3 ',
      'service'
    ))
  }

  async updateStatus(req, res){
    const schemeValidate = this.Ajv.compile(this.RcdValidator.updateStatusScheme);
    
    if(!schemeValidate(req.body)) return res.status(400).json(this.ResponsePreset.resErr(
      400,
      schemeValidate.errors[0].message,
      'validator',
      schemeValidate.errors[0]
    ));
    const updateStatusSrv = await this.RcdService.updateStatus(req.body);

    if (updateStatusSrv) return res.status(200).json(this.ResponsePreset.resOK("OK", null)) ;
    
  }

  async deleteData(req, res){
    const { id } = req.params

    const deleteDataSrv = await this.RcdService.deleteData(id, req.middlewares.authorization);
    if(deleteDataSrv === -1) return res.status(401).json(this.ResponsePreset.resErr(
      401,
      'Request Unauthorized',
      'role',
      { code: -1 }
    ));

    if(deleteDataSrv === 1) return res.status(200).json(this.ResponsePreset.resOK("OK", deleteDataSrv));
  }

  async getAnalyze(req, res){
    const { category,subCategory } = req.query

    const getAnalyzeSrv = await this.RcdService.getAnalyze(category, subCategory);

    return res.status(200).json(this.ResponsePreset.resOK('OK', getAnalyzeSrv))
  }

  async search(req, res){
    const { title, category, subCategory } = req.query;

    if(title.length < 3) return res.status(400).json(this.ResponsePreset.resErr(
      400,
      'Bad request, Minimum length search 3 ',
      'service'
    ))
    

    const searchSrv = await this.RcdService.search(title, category, subCategory);
    
    if (searchSrv === -1) return res.status(400).json({
      message: 'Error required spesific category',
    })
    res.status(200).json(this.ResponsePreset.resOK( 'OK', searchSrv ))
  }

  async downloadData(req, res){
    try{
      const { category } = req.query;
      const downloadDocumentSrv = await this.RcdService.downloadData(category, req.middlewares.authorization);
      if(downloadDocumentSrv === -1) return res.status(401).json(this.ResponsePreset.resErr(
        401,
        'Request Unauthorized',
        'role',
        { code: -1 }
      ));

      res.setHeader('Content-Type', downloadDocumentSrv.mime);
      res.setHeader('Content-Disposition', 'attachment; filename=' + downloadDocumentSrv.title + '.xlsx');
      res.status(200).send(downloadDocumentSrv.file);
    } catch(err) {
      return res.status(500).json({
        status: 500,
        message: 'Server Error',
        err: err.message
      });
    }
  }
  async masterDataFilter(req, res){
    const { category, subCategory } = req.query;

    const masterDataFilterSrv = await this.RcdService.masterDataFilter(category, subCategory);
      
    return res.status(200).json(this.ResponsePreset.resOK("OK", masterDataFilterSrv))

  }
  async filterData(req, res){
  
    if (Object.keys(req.query).length !== 0) {
      const {picOne, status, timeline, UIC, category, subCategory} = req.query
      const filterDataSrv = await this.RcdService.filterData({picOne, status, timeline, UIC, category, subCategory})

      return res.status(200).json(this.ResponsePreset.resOK("OK", filterDataSrv))
      
    }
  }
}
export default RcdController