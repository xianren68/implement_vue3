// 创建虚拟dom
import {isString,isObject,ShapeFlags,isArray} from '@vue/shared'
export const createVnode = (type:any,props:any,children:any=null)=>{
    let shapeFlag = isString(type)?ShapeFlags.ELEMENT: // 元素
    isObject(type)?ShapeFlags.STATEFUL_COMPONENT:0 // 组件
    const vnode = {
        _v_isVnode : true,
        type,
        props,
        children,
        key:props&&props.key, // 唯一标识用于diff算法
        el:null, // 对应的真实元素
        shapeFlag, // 标志组件或元素
        component:{} // 组件实例
    }
    // 判断子节点类型
    normalize(vnode,children)
    return vnode
}
function normalize(vnode:any,children:any){
    let type = 0
    if(isArray(children)){ // 数组
        type = ShapeFlags.ARRAY_CHILDREN
    }else if(isString(children)){ // 文本
        type = ShapeFlags.TEXT_CHILDREN
    }
    vnode.shapeFlag = vnode.shapeFlag | type
}
export function isVnode(vnode:any){
    if(vnode._v_isVnode){
        return true
    }
    return false
}

// 文本唯一标识
export const TEXT = Symbol('text')
// 子节点转化为虚拟dom
export function cVnode(children:any){
    // 已经是虚拟dom
    if(isObject(children)) return children
    // 文本节点
    return createVnode(TEXT,null,String(children))
}