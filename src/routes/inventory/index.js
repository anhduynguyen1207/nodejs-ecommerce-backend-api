'use strict'

const express = require('express')
const inventoryController = require('../../controllers/inventory.controller.js')
const asyncHandler = require('../../helper/asyncHandler.js')
const { authenticationV2 } = require('../../auth/authUtils.js')
const router = express.Router()

//get amount a discount


//authentication//
router.use(authenticationV2)
/////////////////

router.post('', asyncHandler(inventoryController.addStockToInventory))



module.exports = router