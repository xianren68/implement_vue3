import { ApiCreateApp } from "./apiCreateApp"

export function createRender(){ // 实现渲染
    const render = (vnode:any,container:string)=>{ // 渲染
        console.log(vnode)
        
    }
    return {
        createApp:ApiCreateApp(render)
    }
}