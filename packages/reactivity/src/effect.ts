// 副作用函数

import { isArray,isIntergerKey } from "@vue/shared"
import {TriggerOpTypes} from './oprtations'

// 全局变量，用于保存副作用函数
let activeEffect:any
export function effect<T =any>(fn:()=>T,options:{lazy:boolean,sch?:any}={lazy:false}){ 
    const effect = createReactEffect(fn,options)
    // 如果为false,立即执行一次
    if (!options.lazy){
        effect()
    }
    return effect
}
let uid = 0
function createReactEffect(fn:()=>any,options:object){
    const effect = function reactiveEffect(){ 
        activeEffect = effect
        return fn()
    }
    effect.id = uid++ // 唯一标识
    effect._isEffect = true // 是否为响应式
    effect.raw = fn // 保存用户方法
    effect.options = options // 保存用户配置
    return effect
}
// 容器，用于存储依赖
const targetMap = new WeakMap()
export function track(target:object,operate:string,key:string|symbol|number){
    // 判断是否有依赖方法
    if (!activeEffect){
        return 
    }
    // 获取目标对象对应的映射
    let depMap = targetMap.get(target)
    // 如果不存在，新建
    if (!depMap){
        depMap = new Map()
        targetMap.set(target,depMap)
    }
    // 获取对应属性的依赖列表
    let effectSet = depMap.get(key)
    // 如果不存在，新建
    if(!effectSet){
        effectSet = new Set()
        depMap.set(key,effectSet)
    }
    // 判断是否已经存在方法
    if(!effectSet.has(activeEffect)){
        effectSet.add(activeEffect)
    }
}
// 触发更新的函数
export function trigger(target:object,type:string,key:string|symbol|number,value:any){
    
    let depsMap = targetMap.get(target)
    // 是响应式数据，但视图中没有依赖它的
    if (!depsMap){
        return 
    }
    // 用一个数组来存储待处理的函数
    let deps:any[] = []
    const add = function(set:Set<any>|undefined){
        if(set === undefined){
            return
        }
        set.forEach(v=>{
            deps.push(v)
        })
    }
    // 如果key是长度，并且目标对象是数组
    // 这个分支用于处理直接修改数组长度的情况
    if (key === 'length' && isArray(target)){
        let newLength = Number(value)
        depsMap.forEach((dep:any,key:any)=>{
            // 直接修改长度，数组有些索引会直接受到影响，将它们的副作用函数也存储起来
            if (key === "length" || key >= newLength){  
                add(dep)
            }
        })
    }else {
        if (key!==undefined){
            // 不用担心新增的属性，前面通过反射已经添加了
            add(depsMap.get(key))
        }
        switch(type){
            // 如果是添加值
            case TriggerOpTypes.ADD:

                // 判断是否是数组
                if(isArray(target) && isIntergerKey(key)){
                    // 数组长度增加，直接触发关于数组长度的副作用函数
                    add(depsMap.get('length'))
                }
        }
    }
    
    // 执行副作用函数
    deps.forEach(effect=>{
        // 如果存在sch方法，则是计算属性触发的
        if (effect.options.sch){
            // 执行，让计算属性可以再次执行
            effect.options.sch()
        }else {
            effect()
        }
        
    })
    

}