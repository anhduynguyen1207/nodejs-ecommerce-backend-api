'use strict'

const express = require('express')
const discountController = require('../../controllers/discount.controller.js')
const asyncHandler = require('../../helper/asyncHandler.js')
const { authenticationV2 } = require('../../auth/authUtils.js')
const router = express.Router()

//get amount a discount
router.post('/amount', asyncHandler(discountController.getDiscountAmount))
router.get('/list_product_code', asyncHandler(discountController.getAllDiscountCodeWithProducts))

//authentication//
router.use(authenticationV2)
/////////////////

router.post('', asyncHandler(discountController.createDiscountCode))
router.get('', asyncHandler(discountController.getAllDiscountCode))

module.exports = router