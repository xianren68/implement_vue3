// 对元素属性对比操作
import { patchClass } from "./modules/class"
import { patchStyle } from "./modules/styles"
import { patchAttr } from "./modules/attrs"
import {patchEvents} from "./modules/events"
export const patchProp = (el:Element,key:string,prevValue:any,nextValue:any)=>{
    switch(key){
        // 属性是class类型
        case "class":
            patchClass(el,nextValue)
        break
        // 属性是style
        case "style":
            patchStyle(el,prevValue,nextValue)
        break
        // 自定义属性
        default:
            // 判断是否为方法
            if(/^on[a-z]/.test(key)){
                patchEvents(el,key,nextValue)
            }else{
                patchAttr(el,key,nextValue)
            }
        break
    }
}