import { currentInstance,getCurrentInstance,setCurrentInstance } from "./component"
// 枚举
const enum LifeCycle{
    BEFORE_MOUNT="bm",
    MOUNTED="m",
    BEFORE_UPDATE="bu",
    UPDATED = "u"
}

const createHooks = (type:any)=>{
    // 1. hook，我们指定要执行的函数, 2.target当前组件实例
    return function(hook:any,target=currentInstance){
        injectHook(type,hook,target)
    }
}
function injectHook(type:any,hook:any,target:any){
    // 不存在实例，直接返回
    if(!target){
        return
    }
    // 获取当前实例的生命周期函数列表没有则新建
    let hooks = target[type] || (target[type] = [])
    // 对函数进行一些处理，因为可能需要获取当前的实例
    const rap = ()=>{
        setCurrentInstance(target)
        hook()
        setCurrentInstance(null)
    }

    // 将函数添加
    hooks.push(rap)

}
// 生命周期函数
export const onBeforeMount = createHooks(LifeCycle.BEFORE_MOUNT)
export const onMounted = createHooks(LifeCycle.MOUNTED)
export const onBeforeUpdate = createHooks(LifeCycle.BEFORE_UPDATE)
export const onUpdated = createHooks(LifeCycle.UPDATED)

// 执行生命周期
export function invokArrayFns(arr:Array<any>){
    arr.forEach(fn=>{fn()})
}
