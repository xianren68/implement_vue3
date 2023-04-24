import { ApiCreateApp } from "./apiCreateApp"
import { ShapeFlags} from "@vue/shared"
import { createComponentInstance, setupComponent } from "./component"
import { effect } from "@vue/reactivity"
import { TEXT, cVnode } from "./vnode"

export function createRender(options:any) { // 实现渲染
    const {
        insert: hostInsert,
        remove: hostRemove,
        patchProp: hostPatchProp,
        createElement: hostCreateElement,
        createText: hostCreateText,
        setText: hostSetText,
        setElementText: hostSetElementText,
        querySelector,
      } = options
  
// 组件相关 。。。。。。。。。。。。。

    // 给render函数添加effect,以实现响应式
    function setupRenderEffect(instance: any,container:any) {
        
        effect(() => {
            // 第一次挂载
            if (!instance.isMounted) {
                // 调用render方法
                let proxy = instance.proxy
                // 改变this指向
                let subTree = instance.subTree = instance.render.call(proxy, proxy)
                patch(null,subTree,container)
                instance.isMounted = true // 修改状态
                
            }else { // 更新
                let proxy = instance.proxy
                // 旧的dom树
                let preTree = instance.subTree
                // 新的虚拟dom树
                let nextTree = instance.subTree = instance.render.call(proxy,proxy)
                // 对比
                patch(preTree,nextTree,container)
                
            }
        })
    }
    // 创建组件
    const mountComponent = (initalVnode: any, container: any) => {
        // 1. 创建组件实例
        const instance = initalVnode.component = createComponentInstance(initalVnode)
        // 2. 绑定组件数据
        setupComponent(instance)
        // 3. 创建一个effect,让render执行
        setupRenderEffect(instance,container)
    }
    // 创建/更新组件
    const processComponent = (n1: any, n2: any, container: any) => {
        // 第一次渲染
        if (n1 == null) {
            // 创建组件
            mountComponent(n2, container)
        } else {

        }
    }


// 元素相关 。。。。。。。。。。。。。。。。。。
    // 创建元素
    const mountElement = (vnode: any, container: any)=>{
        let el = hostCreateElement(vnode.type)
        for(let key in vnode.props){ // 添加属性/方法到元素
            hostPatchProp(el,key,null,vnode.props[key])
        }
        vnode.el = el
        // 挂载到页面
        hostInsert(el,container,null)
        // 处理子节点
        if(vnode.children){
            if(vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN){ // 文本，直接挂载
                hostSetElementText(el,vnode.children)
            }else if(vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN){ // 数组，递归处理
                mountChildren(el,vnode.children)
            }   
        }
        
    }

    // 创建/更新元素
    const processElement = (n1:any,n2:any,container:any)=>{
        // 第一次
        if(n1 == null) {
            // 创建元素
            mountElement(n2,container)
        }
    }

// 文本/子节点相关。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。

    // 将子节点转化为虚拟dom并挂载
    function mountChildren(el:any,children:any){
        for(let i of children){
            let childVnode = cVnode(i)
            patch(null,childVnode,el)
        }
    }
    // 将子节点转为真实dom
    function processText(n1:any,n2:any,container:any){
        if (n1 == null){
            mountText(n2,container)
        }
    }

    // 挂载文本节点
    function mountText(vnode:any,container:any){
        hostInsert(hostCreateText(vnode.children),container)
    }


    // 判断两个虚拟dom是否为同一个
    const isSameVnode = (n1:any,n2:any)=>{
        return n1.type === n2.type && n1.key === n2.key
    }
    // 删除元素
    const unmount = (vnode:any)=>{
        hostRemove(vnode.el)
    }
    // 对比是组件还是元素
    const patch = (n1: any, n2: any, container: any) => {
        if (n1 === n2) {
            return
        }
        if (n1&&!isSameVnode(n1,n2)){ // 元素本身发生改变
            unmount(n1) // 删除n1
            n1 = null
        }
        if (n2.type == TEXT){ // 文本节点
            processText(n1,n2,container)
        }
        else if (n2.shapeFlag&ShapeFlags.ELEMENT) { // 元素节点
            processElement(n1,n2,container)
            

        } else if (n2.shapeFlag&ShapeFlags.STATEFUL_COMPONENT) {
            // 对组件进行处理
            processComponent(n1, n2, container)
        }
    }
    const render = (vnode: any, container: string) => { // 渲染
        patch(null, vnode, container)

    }
    return {
        createApp: ApiCreateApp(render)
    }
}