import { ApiCreateApp } from "./apiCreateApp"
import { ShapeFlags } from "@vue/shared"
import { createComponentInstance, setupComponent } from "./component"
import { effect } from "@vue/reactivity"

export function createRender() { // 实现渲染
    // 给render函数添加effect,以实现响应式
    function setupRenderEffect(instance: any) {
        effect(() => {
            // 第一次挂载
            if (!instance.isMounted) {
                // 调用render方法
                let proxy = instance.proxy
                // 改变this指向
                instance.render.call(proxy, proxy)
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
        setupRenderEffect(instance)
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
    // 对比是组件还是元素
    const patch = (n1: any, n2: any, container: any) => {
        if (n1 === n2) {
            return
        }
        else if (n2.shapeFlag == ShapeFlags.COMPONENT) {
            console.log('元素')

        } else {
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