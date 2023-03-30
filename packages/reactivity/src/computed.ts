import { isFunction } from "@vue/shared";
import { effect } from "./effect";


export type ComputedGetter<T> = (...args: any[]) => T
export type ComputedSetter<T> = (v:any) => void

export interface WritableComputedOptions<T> {
  get: ComputedGetter<T>
  set: ComputedSetter<T>
}
// 定义返回的结构
class ComputedRefImpl<T>{
    public _dirty = true
    public readonly effect: any
    public _value = undefined

    public readonly __v_isRef = true
    constructor(public getter:ComputedGetter<T>,public setter:ComputedSetter<T>){
        // 设置effect
        this.effect = effect(
                getter,
        {
            lazy:true,
            // 缓存机制的实现核心,这里是通过计算属性依赖的属性发生修改时触发其对应的setter来实现的
            sch:()=>{
                // 将_dirty改成true，以便修改后可以执行
                this._dirty = true
            }
        })

    }
    get value(){
        
        // 获取返回值，并收集依赖
        if(this._dirty == true){
            this._value = this.effect()
            // 缓存机制的实现,如果值未变，则不执行函数
            this._dirty = false
        }
        return this._value
    }
    set value(newValue){
        this.setter(newValue)
    }
}

// computed可以接收函数/对象类型的参数
export function computed<T>(target:any):ComputedRefImpl<T>{
    // 定义getter和setter
    let getter
    let setter
    // 判断是否为函数，并设置getter和setter
    if(isFunction(target)){
        getter = target
        
        setter = function(){
            console.warn("不允许被修改")   
        }
    }else {
        getter = target.get
        setter = target.set
    }
    
    return new ComputedRefImpl(getter,setter)

}