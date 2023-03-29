// ref相关的方法
import {isChange} from '@vue/shared'
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
    constructor(public val:T,public isShallow:boolean){

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