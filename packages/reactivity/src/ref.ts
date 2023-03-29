// ref相关的方法
import {isChange,isArray} from '@vue/shared'
import {track,trigger} from './effect'
import {TrackOpTypes,TriggerOpTypes} from './oprtations'
export function ref(val:unknown){
    if (typeof val === "object"){

    }else {
        return createRef(val,false)
    }
}
// 一个类用来创建ref实例
class RefImpl<T>{
    // ref对象的标识
    public readonly __v_isRef = true
    constructor(private val:T,public isShallow:boolean){

    }
    // 访问属性
    get value(){
        // 收集依赖
        track(this,TrackOpTypes.GET,'value')
        return this.val
    }
    // 设置属性
    set value(newValue){
        if(isChange(this.val,newValue)){
            this.val = newValue
            // 触发更新
            trigger(this,TriggerOpTypes.SET,'value',newValue)
        }
    }
}
function createRef(val:unknown,isShallow:boolean){
    return new RefImpl(val,isShallow)
}
// toRef对象
class ObjectRefImpl<T extends object,K extends keyof T> {
    public readonly __v_isRef = true
    constructor(public readonly target:T,public readonly key:K,private defaultValue?:T[K]){

    }
    // 不用收集依赖或触发更新，因为target一般是Proxy对象，对属性进行操作的时候会自己触发捕获器
    get value(){
        return this.target[this.key]
    }
    set value(newValue) {
        if(isChange(this.target[this.key],newValue)){
            this.target[this.key] = newValue
        }
    }

}
// 一般用于解构一些响应式对象，将指定的属性单独拿出来作为响应式
export function toRef<T extends object,K extends keyof T>(target:T,key:K){
    return new ObjectRefImpl(target,key)
}
// 将整个对象都解构
export function toRefs<T extends object>(target:T){
    // 存储返回的对象或数组
    let res:any = isArray(target)? [] : {}
    for(let i in target){
        // 通过toRef包裹
        res[i] = toRef(target,i)
    }
    return res
}