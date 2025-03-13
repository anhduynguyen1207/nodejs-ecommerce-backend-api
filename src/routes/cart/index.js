'use strict'

const express = require('express')
const carttController = require('../../controllers/cart.controller.js')
const asyncHandler = require('../../helper/asyncHandler.js')
const { authenticationV2 } = require('../../auth/authUtils.js')
const router = express.Router()

//get amount a discount


//authentication//
// router.use(authenticationV2)
/////////////////

router.post('', asyncHandler(carttController.addToCart))
router.delete('', asyncHandler(carttController.delete))
router.post('/update', asyncHandler(carttController.update))
router.get('', asyncHandler(carttController.listToCart))


module.exports = router