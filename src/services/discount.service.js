'use strict'

const { BadRequestError, NotFoundError } = require("../core/error.response.js")
const discountModel = require("../models/discount.model")
const { checkDiscountExist, findAllDiscountCodesUnSelect } = require("../models/repositories/discount.repo.js")
const { findAllProducts } = require("../models/repositories/product.repo.js")
const { convertToObjectIdMongodb } = require("../utils/index.js")


/*
    Discount Service
    1/ Genertor Discount Code [Shop \ Amin ]
    2/ Get discount amount [User]
    3/ Get all discount codes [User \ Shop]
    4/ Verify discount code [User]
    5/ Delete discount code [Admin \ Shop]
    6/ Cancel discount code [uses]
*/

class DissCountService{

    static async createDiscountCode(payload){
        const {
            code, start_date, end_date, is_active,
            shopId, min_order_value, product_ids, applies_to, name,description,
            type, value, uses_used, max_uses, uses_count, max_uses_per_user,max_value
        } = payload
        // kierm tra
        if(new Date () < new Date(start_date) || new Date() > new Date(end_date) ){
            throw new BadRequestError('Discount code has expried!')
        }

        if(new Date(start_date) >= new Date(end_date)){
            throw new BadRequestError('Start date must be before End date')
        }

        //create index for discount code
        const foundDiscount = await checkDiscountExist(code,shopId)
        
        if(foundDiscount && foundDiscount.discount_is_active){
            throw new BadRequestError('Discount exist!')
        }

        const newDiscount = await discountModel.create({
            discount_name: name,               
            discount_description: description, 
            discount_type: type,
            discount_code: code,
            discount_value: value,
            discount_min_order_value:min_order_value || 0,
            discount_max_value:max_value,
            discount_start_date: new Date(start_date),
            discount_end_date:  new Date(end_date),
            discount_max_uses :max_uses,
            discount_uses_count: uses_count,
            discount_uses_used :uses_used,
            discount_max_uses_per_user:max_uses_per_user,
            discount_shopId:shopId,
            discount_is_active: is_active,                
            discount_applies_to: applies_to ==='all'? [] : product_ids,
            discount_product_ids,
        })
        return newDiscount
    }
    static async updateDiscountCode(){

    }

    /* 
        Get all discount code available with products
    */

    static async getAllDiscountCodeWithProduct({
        code, shopId, userId, limit, page
    }){
        //create index for discount_code
        const foundDiscount = await checkDiscountExist(code,shopId)
        if(!foundDiscount || !foundDiscount.discount_is_active){
            throw new NotFoundError('Discount not exist!')
        }
        const {discount_applies_to, discount_product_ids} = foundDiscount
        let products
        if(discount_applies_to === 'all'){
            //findAllProducts
            products = await findAllProducts({
                filter:{
                    product_shop: convertToObjectIdMongodb(shopId),
                    isPublished : true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }
        if(discount_applies_to === 'specific'){
            products = await findAllProducts({
                filter:{
                    _id: {$in: discount_product_ids},
                    isPublished : true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }
        return products
    }

    /* 
        Get all discount code of shop
    */
    static async getAllDiscountCodeByShop({
        limit,page,shopId
    }){
        const discounts = await findAllDiscountCodesUnSelect({
            limit: +limit,
            page: +page,
            filter:{
                discount_shopId: convertToObjectIdMongodb(shopId),
                discount_is_active: true
            },
            unSelect: ['__v', 'discount_shopId'],
            model: discountModel
        })
        return discounts
    }
}