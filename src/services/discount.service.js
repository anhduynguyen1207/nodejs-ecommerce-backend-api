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
            codeId, start_date, end_date, is_active,
            shopId, min_order_value, product_ids, applies_to, name,description,
            type, value, uses_used, max_uses, uses_count, max_uses_per_user,max_value
        } = payload
        // kierm tra
        // if(new Date () < new Date(start_date) || new Date() > new Date(end_date) ){
        //     throw new BadRequestError('Discount code has expried!')
        // }

        if(new Date(start_date) >= new Date(end_date)){
            throw new BadRequestError('Start date must be before End date')
        }

        //create index for discount code
        const foundDiscount = await checkDiscountExist(codeId,shopId)
        
        if(foundDiscount && foundDiscount.discount_is_active){
            throw new BadRequestError('Discount exist!')
        }

        const newDiscount = await discountModel.create({
            discount_name: name,               
            discount_description: description, 
            discount_type: type,
            discount_code: codeId,
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
            discount_applies_to: applies_to,
            discount_product_ids:applies_to ==='all'? [] : product_ids 
        })
        return newDiscount
    }
    static async updateDiscountCode(){

    }

    /* 
        Get all discount code available with products
    */

    static async getAllDiscountCodeWithProduct({
        codeId, shopId, userId, limit, page
    }){
        //create index for discount_code
        const foundDiscount = await checkDiscountExist(codeId,shopId)
        console.log(`foundDiscount::`,foundDiscount)
        if(!foundDiscount || !foundDiscount.discount_is_active){
            throw new NotFoundError('Discount not exist!')
        }
        const {discount_applies_to, discount_product_ids} = foundDiscount
        let products
        if(discount_applies_to === 'all'){
            console.log(`all::`)
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
            console.log(`specific::`)
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

    /* 
        Apply Discount Code
        products = [
            {
                productId,
                shopId,
                quantity,
                name,
                price
            },
            {
                productId,
                shopId,
                quantity,
                name,
                price
            }
        ]

    */
   //4. 
    static async getDiscountAmount({ codeId, userId, shopId, products}){
        const foundDiscount = await checkDiscountExist(codeId,shopId)
        if(!foundDiscount)  throw new NotFoundError(`Discount doesn't exist!`)
        
        const {
            discount_is_active,
            discount_max_uses,
            discount_min_order_value,
            discount_max_uses_per_user,
            discount_uses_used,
            discount_type,
            discount_value,
            discount_start_date,
            discount_end_date
        } = foundDiscount
        if(!discount_is_active) throw new NotFoundError(`Discount expried!`)
        if(discount_max_uses == 0) throw new NotFoundError(`Discount are out!`)
        
        // if (new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)){
        //     throw new NotFoundError(`Discount expried!`)
        // }
        //check xem có set giá trị tối thiểu hay không
        let totalOrder =0
        if(discount_min_order_value > 0){
            //get total
            totalOrder = products.reduce((acc, product)=>{
                return acc + (product.quantity * product.price)
            }, 0)

            if(totalOrder < discount_min_order_value){
                throw new NotFoundError(`Discount requires a minium order value of ${discount_min_order_value}!`)
            }
        }
        if(discount_max_uses_per_user > 0 ){
            const userUsesDisCount = discount_uses_used.find(user => user.userId === userId)
            if(userUsesDisCount){
                if(discount_max_uses_per_user = 1) throw new NotFoundError(`You used this voucher, Pls choose other voucher`)
            }
        }
        // check xem discount nay la fix_amount || percentage
        const amount = discount_type === 'fix_ammount' ? discount_value : totalOrder * (discount_value /100)
        return {
            totalOrder,      // tổng giá trị đơn hàng
            discount: amount, // disscount sau khi tính fix_amount hay % 
            totalPrice: totalOrder - amount // giá tiền còn lại sau khi disscount
        }
    }

    //5 Xoa nên tạo 1 table khác để lưu các discount đã xoá sau khi có thể lấy ra sử dụng cách lưu cột trong table discount sẽ làm tốn index
    //Nhưng trong bài này vì thời gian nên xoá ra khỏi db luôn.
    static async deleteDiscountCode({shopId, codeId}){
        // Trong thật tế cần check xem discount này đang sử dụng ở đâu không rồi mới xoá 
       const deleted = await discountModel.findOneAndDelete({
            discount_code: codeId,
            discount_shopId: convertToObjectIdMongodb(shopId)
       })
       return deleted
    }
    //6. Cancal Disscount Code ()
    static async cancelDiscountCode({codeId, shopId,userId}){
        const foundDiscount = await checkDiscountExist(codeId,shopId)
        if(!foundDiscount)  throw new NotFoundError(`Discount doesn't exist!`)
        const result = await discountModel.findByIdAndUpdate(foundDiscount._id,{
            $pull:{
                discount_uses_used: userId
            },
            $inc:{
                discount_max_uses: 1,
                discount_uses_count: -1
            }
        })
        return result
    }
}

module.exports = DissCountService