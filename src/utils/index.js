'use strict'

const _ = require('lodash')
const { Types } = require('mongoose')


const convertToObjectIdMongodb = id => Types.ObjectId(id)

const getInfoData = ({fileds=[], object={}})=>{
    return _.pick(object, fileds)
}
// ['a', 'b'] = {a:1, b:1}
const getSelectData = (select=[])=>{
    return Object.fromEntries(select.map(el =>[el, 1]))
}
// ['a', 'b'] = {a:0, b:0}
const unGetSelectData = (select=[])=>{
    return Object.fromEntries(select.map(el =>[el, 0]))
}

const removeUndefineObject = obj =>{
    Object.keys(obj).forEach( k =>{
        if(obj[k]== null || obj[k]== undefined){
            delete obj[k]
        }
    })
    return obj
}

const updateNestedObjectParser = obj =>{
    const final = {}
    // console.log(`[1]::`, obj)
    Object.keys(obj).forEach( k=>{
        if(typeof obj[k] === 'object' && !Array.isArray(obj[k])){
            const res= updateNestedObjectParser(obj[k])
            Object.keys(res).forEach(a=>{
                final[`${k}.${a}`]= res[a]
            })
        }else{
            final[k] = obj[k]
        }
    })
    // console.log(`[2]::`, final)
    return final
}

module.exports= {
    getInfoData,
    getSelectData,
    unGetSelectData,
    removeUndefineObject,
    updateNestedObjectParser,
    convertToObjectIdMongodb
}