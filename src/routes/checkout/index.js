'use strict'

const express = require('express')
const checkoutController = require('../../controllers/checkout.controller.js')
const asyncHandler = require('../../helper/asyncHandler.js')
const { authenticationV2 } = require('../../auth/authUtils.js')
const router = express.Router()

//get amount a discount


//authentication//
// router.use(authenticationV2)
/////////////////

router.post('/review', asyncHandler(checkoutController.checkoutReview))



module.exports = router