'use strict'

const {model, Schema} = require('mongoose'); // Erase if already required
const DOCUMENT_NAME = 'Discount'
const COLLECTION_NAME = 'discounts'
// Declare the Schema of the Mongo model
var discountSchema = new Schema({
    discount_name:{
        type:String,
        required:true,
    },
    discount_description:{
        type:String,
        required:true,
    },
    discount_type:{
        type:String,
        default:'fixed_amount', //percentage
    },
    discount_value:{
        type:Number,
        required:true,
    },
    discount_code:{ 
        type:String,
        required:true,
    },
    discount_start_date:{  // ngày có hiệu lực 
        type:Date,
        required:true,
    },
    discount_end_date:{  // ngày hết hiệu lực
        type:Date,
        required:true,
    },
    discount_max_uses:{  //số lượng discount được áp dụng
        type:Number,
        required:true,
    },
    discount_uses_count:{  // số discount đã sử dụng
        type:Number,
        required:true,
    },
    discount_uses_used:{  // những user đã sử dụng
        type:Array,
        default:[],
    },
    discount_max_uses_per_user:{  // số lượng cho phép tối đa mỗi user sử dụng
        type:Number,
        required:true,
    },
    discount_min_order_value:{  // gia tri don hang toi thieu de ap dung discount nay
        type:Number,
        required:true,
    },
    discount_max_value:{  
        type:Number,
        required:true,
    },
    discount_shopId:{
        type:Schema.Types.ObjectId,
        ref: 'Shop'
    },
    discount_is_active:{
        type:Boolean,
        default:true,
    },
    discount_applies_to:{
        type:String,
        required:true,
        enum: ['all', 'specific']
    },
    discount_product_ids:{     // những sản phẩm được áp dụng
        type:Array,
        default:[],
    }
},{
    timestamps: true,
    collection: COLLECTION_NAME
});
//Export the model
module.exports = model(DOCUMENT_NAME, discountSchema)