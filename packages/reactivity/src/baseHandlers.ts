// 存储proxy捕获器对象
// get操作分为 1.是否为只读的 2.是否是浅层的
// 通过一个柯里化函数来实现

import { isObject,isArray,isIntergerKey, hasOwn,isChange} from "@vue/shared"
import { reactive, readonly } from "./reactive"
import {track,trigger} from './effect'
import { TrackOpTypes,TriggerOpTypes } from "./oprtations"

// 创建getter
function createGetter(isReadonly=false,isShallow=false){
    return function(target:object,key:string|symbol|number,receiver:object){
        
        // 获取数据
        let res = Reflect.get(target,key,receiver)
        // 判断是否为只读，只读类型不会添加依赖
        if (isReadonly){
            return res
        }
        // 这里添加依赖
        track(target,TrackOpTypes.GET,key)  
        
        // 判断是不是浅层的
        if(isShallow) {
            return res
        }
        
        // 判断key对应的值是否为对象
        // 是对象，递归处理
        // 这是vue3性能优化很重要的一环，懒代理，对于引用类型，它只有在被访问时才会被递归代理
        if (isObject(res)){
            return isReadonly? readonly(res):reactive(res)
        }
        return res
    }
}
// 创建setter
function createSetter(isShallow=true){
    return function(target:any,key:string|symbol|number,value:any,receiver:object){
        // 触发更新
        // 拿到旧值
        let oldValue = target[key]
        // 判断是数组还是对象，并且判断是添加还是修改
        let isAdd = isArray(target) && isIntergerKey(key)?target.length < Number(key):
        !hasOwn(target,key)
        const result = Reflect.set(target,key,value)
        // 触发更新
        if (isAdd){
            // 添加，直接触发
            trigger(target,TriggerOpTypes.ADD,key,value)
        }else {
            // 修改，判断两次值是否发生变化
            if(isChange(oldValue,value)){
                trigger(target,TriggerOpTypes.SET,key,value)
            }

        }
        return result
    }
}
// 为四个拦截器对象分别设置getter
const get = createGetter()
const getShallow = createGetter(false,true)
const getReadonly = createGetter(true,true)
const getShallowReadonly = createGetter(true)
// 只读的对象不用设置setter
const set = createSetter()
const setShallow = createSetter(true)
export const reactiveHandlers = {
    get,
    set,
}
export const shallowReactiveHandlers = {
    get:getShallow,
    set:setShallow
}
export const readonlyHandlers = {
    get:getReadonly,
    set(){
        console.log("只读无法被修改")  
        return false
    }
}
export const shallowReadonlyHandlers = {
    get:getShallowReadonly,
    set(){
        console.log("只读无法被修改")  
        return false
    }
}