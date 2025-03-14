'use strict'
const { NotFoundError } = require("../../core/error.response.js")
const { convertToObjectIdMongodb } = require("../../utils/index.js")
const cartModel = require("../cart.model.js")





const findCartById = async (cartId)=>{
    console.log("cartId trong repo:::", cartId)
    return await cartModel.findOne({ _id: convertToObjectIdMongodb(cartId), cart_state:'active'}).lean()
}


module.exports = {
    findCartById
}