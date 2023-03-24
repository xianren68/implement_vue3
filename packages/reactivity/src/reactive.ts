// 响应式系统核心模块
// 1.主要分为 是否深层，或者是否可读
// 2. 我们可以通过函数柯里化，通过传入参数的不同来完成不同的操作
import { isObject } from "@vue/shared";
import { reactiveHandlers,shallowReactiveHandlers,shallowReadonlyHandlers,readonlyHandlers } from "./baseHandlers";
// 定义两个容器
// 1. 用来装可以修改的
const reactiveMap = new WeakMap()
// 2. 用来装只读的
const readonlyMap = new WeakMap()
// 深层代理
export function reactive<T extends Object>(target:T){
    return createReactiveObject(target,false,reactiveHandlers,reactiveMap)
}
// 浅层代理
export function shallowReactive<T extends Object>(target:T){
    return createReactiveObject(target,false,shallowReactiveHandlers,reactiveMap)
}
// 只读
export function readonly<T extends Object>(target:T){
    return createReactiveObject(target,true,readonlyHandlers,readonlyMap)
}
// 浅层只读
export function shallowReadonly<T extends Object>(target:T){
    return createReactiveObject(target,true,shallowReadonlyHandlers,readonlyMap)
}
// 核心函数，用于处理传入的不同参数
function createReactiveObject(target:object,isReadonly:boolean,baseHandlers: ProxyHandler<any>,proxyMap:WeakMap<object,any>){
    // 判断传入的值是否为对象类型
    if(!isObject(target)){
        // 不是对象，直接返回
        return target
    }
    // 判断是否已经被包装过了
    const existing = proxyMap.get(target)
    if (existing){
        return existing
    }
    // 不存在，放入容器中
    // 创建对应的代理
    const proxy = new Proxy(target,baseHandlers)
    proxyMap.set(target,proxy)
    return proxy

}




