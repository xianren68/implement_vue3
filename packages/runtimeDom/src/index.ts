// 入口文件，用来进行一些dom操作
import { extend } from "@vue/shared"
import { nodeOps } from "./nodeOps"
import { patchProp } from "./patchProp"
import { createRender } from "@vue/runtimeCore"


// 合并
const rendererOptions = extend({patchProp},nodeOps)

export {
    rendererOptions
}
// 创建组件
export const createApp = (rootComponent:string|object,rootProps:any)=>{
    let app = createRender(rendererOptions).createApp(rootComponent,rootProps)
    let {mount} = app
    app.mount = function(container:string){
        // 去除要挂载元素的一些子元素
        let element = nodeOps.querySelector(container)
        if(!element){
            console.warn("需要挂载的元素不存在")
            return
        }
        
        element.innerHTML = ""
        // 渲染挂载
        mount(container)
    }
    return app
}
export * from '@vue/runtimeCore'
export * from '@vue/reactivity'
