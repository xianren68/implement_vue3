// 判断是否为对象类型
export const isObject = (val:unknown):boolean=>{
    return typeof val === "object"
}
// 判断是否为数组
export const isArray = Array.isArray
// 判断是否为数字类型
export const isNumber = (val:unknown)=> typeof val === "number"
// 判断是否为字符串
export const isString = (val:unknown)=> typeof val === "string"
// 判断是否为方法
export const isFunction = (val:unknown)=> typeof val === "function"
// 判断属性是否在对象中拥有
export const hasOwn = (target:object,key:string|number|symbol):boolean=>{
    return target.hasOwnProperty(key)
}
// 判断是否为整数
export const isIntergerKey = (val:unknown)=> parseInt(val as string) + "" === val
 