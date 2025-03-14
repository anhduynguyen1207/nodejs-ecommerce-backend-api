'use strict'


const InventoryService = require("../services/inventory.service.js")

const {CREATED, OK, SuccessResponse } = require('../core/sucess.response')

class InventoryController {
    addStockToInventory = async (req, res, next)=>{      
        new SuccessResponse({
            message: 'Add stock success',
            metadata: await InventoryService.addStockToInventory(req.body)
        }).send(res)
    }

}

module.exports = new InventoryController()