'use strict'


const CheckoutService = require("../services/checkout.service.js")

const {CREATED, OK, SuccessResponse } = require('../core/sucess.response')

class CheckoutController {
    checkoutReview = async (req, res, next)=>{      
        new SuccessResponse({
            message: 'Create new Cart success',
            metadata: await CheckoutService.checkoutReview(req.body)
        }).send(res)
    }

}

module.exports = new CheckoutController()