// 副作用函数
// 全局变量，用于保存副作用函数
let activeEffect:any
export function effect<T =any>(fn:()=>T,options:{lazy:boolean}={lazy:false}){ 
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
        fn()
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
    console.log(targetMap);
}