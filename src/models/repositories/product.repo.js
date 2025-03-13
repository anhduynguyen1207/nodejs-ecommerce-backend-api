'use strict'


const { Types } = require('mongoose')
const { product, clothing, electronic, furniture}= require('../../models/product.model.js')
const {getSelectData, unGetSelectData, convertToObjectIdMongodb} = require('../../utils/')
const findAllDaftsForShop = async({query, limit, skip})=>{
    return await queryProduct({query, limit, skip})
}

const findAllPublishForShop = async({query, limit, skip})=>{
    return await queryProduct({query, limit, skip})
}
const publishProductByShop = async ({product_shop, product_id})=>{
    const foundFound = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    })
    if(!foundFound) return null
    foundFound.isDraft = false
    foundFound.isPublished = true
    const {mofifiedCount} = await foundFound.updateOne(foundFound)
    return mofifiedCount
}

const unPublishProductByShop = async ({product_shop, product_id})=>{
    const foundFound = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    })
    if(!foundFound) return null
    foundFound.isDraft = true
    foundFound.isPublished = false
    const {mofifiedCount} = await foundFound.updateOne(foundFound)
    return mofifiedCount
}

const queryProduct = async ({query, limit, skip})=>{
    return await product.find(query).
    populate('product_shop', 'name email -_id')
    .sort({ updateAp: -1})
    .skip(skip)
    .limit(limit)
    .lean()
    .exec()

}

//search product
const searchProductByUser = async ({keySearch})=>{
    const regexSearch = new RegExp(keySearch)
    const result = await product.find({
        isPublished: true,
        $text: {$search: regexSearch}
    },{score:{$meta: 'textScore'}})
    .sort({score:{$meta: 'textScore'}})
    .lean()

    return result;
}

const findAllProducts = async ({limit , sort, page, filter, select}) =>{
    const skip = (page -1) * limit;
    const sortBy = sort === 'ctime' ? {_id: -1}:{_id: 1}
    const products = await product.find( filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean()

    return products
}

const findDetailsProduct = async ({product_id, unselect}) =>{
    return await product.findById(product_id).select(unGetSelectData(unselect))
}

const updateProductById = async ({
    productId,
    bodyUpdate,
    model,
    isNew = true
}) =>{
    return await model.findByIdAndUpdate(productId, bodyUpdate, {
        new: isNew
    })
}

const getProductbyId = async (productId) =>{
    return await product.findOne({_id: convertToObjectIdMongodb(productId)}).lean()
}

module.exports = {
    findAllDaftsForShop,
    publishProductByShop,
    findAllPublishForShop,
    unPublishProductByShop,
    searchProductByUser,
    findAllProducts,
    findDetailsProduct,
    updateProductById,
    getProductbyId
}