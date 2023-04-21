import { isArray, isObject } from "@vue/shared"
import { createVnode,isVnode } from "./vnode"

// 将元素渲染为虚拟dom
export function h(type:string,props:object|string,children:any){
    // 接收传入参数的长度
    const l = arguments.length
    // 如果只有两个参数
    if(l == 2){
        // 长度为2,只可能为 标签+属性/标签+子节点
        if(isObject(props) && isArray(props)){ // 对象
            if(isVnode(props)){ // 特殊情况 h('div',h()),参数是一个子节点虚拟dom
                return createVnode(type,null,[props])
            }
            // 
            return createVnode(type,props)
        }
    }else {
        if(l > 3){ // 如果长度>3，则从第三个开始就是子节点
            children = [...arguments].slice(2)
            
        }else if(l == 3 && isVnode(children)){ // 最后一个节点是虚拟dom
            children = [children]
        }
        return createVnode(type,null,children)
    }
}