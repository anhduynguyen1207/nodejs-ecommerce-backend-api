'use strict'
const { convertToObjectIdMongodb } = require("../../utils/index.js")
const discountModel = require("../discount.model.js")
const {getSelectData, unGetSelectData} = require('../../utils/')

const checkDiscountExist =  async ({code, shopId})=>{
    const foundDiscount = await discountModel.findOne({
        discount_code: code,
        discount_shopId: convertToObjectIdMongodb(shopId)
    }).lean()
    return foundDiscount
}

const findAllDiscountCodesUnSelect = async({
    limit = 50, page = 1, sort = 'ctime',
    filter, unSelect, model
})=> {
    const skip = (page -1) * limit;
    const sortBy = sort === 'ctime' ? {_id: -1}:{_id: 1}
    const document = await model.find( filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(unGetSelectData(unSelect))
    .lean()

    return document
}

const findAllDiscountCodesSelect = async({
    limit = 50, page = 1, sort = 'ctime',
    filter, select, model
})=> {
    const skip = (page -1) * limit;
    const sortBy = sort === 'ctime' ? {_id: -1}:{_id: 1}
    const document = await model.find( filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean()

    return document
}


module.exports = {
    checkDiscountExist,
    findAllDiscountCodesUnSelect,
    findAllDiscountCodesSelect
}