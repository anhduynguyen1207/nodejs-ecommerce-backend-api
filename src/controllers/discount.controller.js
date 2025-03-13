'use strict'


const DisscountService = require("../services/discount.service.js")

const {CREATED, OK, SuccessResponse } = require('../core/sucess.response')

class DisscountController {
    createDiscountCode = async(req, res, next)=>{
        new SuccessResponse({
            message: 'Create Code success',
            metadata: await DisscountService.createDiscountCode({
                ...req.body,
                shopId: req.user.userId
            })
        }).send(res)
    }

    getAllDiscountCode = async (req, res, next)=>{
        new SuccessResponse({
            message: 'Get All Discount Code success',
            metadata: await DisscountService.getAllDiscountCodeByShop({
                ...req.query,
                shopId: req.user.userId
            })
        }).send(res)
    }

    getDiscountAmount = async (req, res, next)=>{
        new SuccessResponse({
            message: 'Get Discount Amount success',
            metadata: await DisscountService.getDiscountAmount({
                ...req.body
            })
        }).send(res)
    }

    getAllDiscountCodeWithProducts = async (req, res, next)=>{        
        new SuccessResponse({
            message: 'Get Discount Amount success',
            metadata: await DisscountService.getAllDiscountCodeWithProduct({
                ...req.query
            })
        }).send(res)
    }
}

module.exports = new DisscountController()