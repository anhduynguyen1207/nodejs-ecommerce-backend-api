'use strict'

const { BadRequestError } = require("../core/error.response.js")
const { inventory } = require("../models/order.model.js")
const { getProductbyId } = require("../models/repositories/product.repo.js")


class InventoryService {
    static async addStockToInventory({
        stock,
        productId,
        shopId,
        location= '123 Nguyen Tri Phuong, HCM city'
    }){
        const product = await getProductbyId(productId)
        if(!product) throw new BadRequestError('The product dose not exist!')

        const query = { inven_shopId: shopId, inven_productId: productId},
        updateSet ={
            $inc:{
                inven_stock: stock
            },
            $set:{
                inven_location: location
            }
        }, options = {upsert: true, new:true}
        return await inventory.findOneAndUpdate(query, updateSet, options)
    }
}

module.exports = InventoryService