import { ShapeFlags, isFunction, isObject } from "@vue/shared"
import { componentPublicInstance } from "./componentPublicInstance"

// 创建组件实例
export function createComponentInstance(vnode:any){
    const instance =  {
        vnode,
        type:vnode.type, // 原始组件
        props:{},
        attrs:{},
        slots:{},// 插槽
        setupState:{},
        render:undefined,
        ctx:{},
        proxy:{}, // 对数据的代理，方便直接拿值，不用通过props.
        isMounted:false// 是否已挂载
    }
    instance.ctx = {_:instance}
    return instance
}
// 绑定组件数据到实例
export function setupComponent(instance:any){
    let {props,children} = instance.vnode
    instance.props = props
    instance.children = children
    // 组件是否拥有setup
    let shapFlag = instance.vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT
    if(shapFlag){
        setupStateComponent(instance)
    }
}
function setupStateComponent(instance:any){
    instance.proxy = new Proxy(instance.ctx,componentPublicInstance as any)
    let component = instance.type
    let {setup} = component
    if(setup){
        let context = createContext(instance)
        // 执行setup方法,并获得其返回值
        let setupRequest = setup(instance.props,context)
        handlerSetupRequest(instance,setupRequest)
    }else { // 没有setup
        finishComponentSetup(instance)
    }
}
function handlerSetupRequest(instance:any,setupRequest:any){
    // 判断返回值是对象还是函数
    if(isObject(setupRequest)){
        instance.setupState = setupRequest
    }else if(isFunction(setupRequest)){
        // 返回值是函数，则默认为render函数
        instance.render = setupRequest
    }
    finishComponentSetup(instance)
}
function finishComponentSetup(instance:any){
    let component = instance.type
    if(!instance.render){
        // 组件中也没有render函数
        if(!instance.type.render && component.template ){
            // 模板 -> render
        }
        instance.render = component.render
    }
}
// 创建context参数
function createContext(instance:any){
    return {
        attrs:instance.attrs,
        slots:instance.slots,
        emit:()=>{

        },
        expose:()=>{
            
        }
    }
}