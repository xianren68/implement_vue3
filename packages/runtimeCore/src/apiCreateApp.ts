import { createVnode } from "./vnode"

export function ApiCreateApp(render:any){
    return function(rootComponent:any,rootProps:any){
        let app = {
            _component:rootComponent,
            _props:rootProps,
            _container:'',
            mount(container:string){
                // 1. 创建虚拟dom
                let vnode = createVnode(rootComponent,rootProps)
                // 2. 渲染节点
                render(vnode,container)
                this._container = container
            }
        }
        return app
    }
}