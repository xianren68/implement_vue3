import { ApiCreateApp } from "./apiCreateApp"
import { ShapeFlags} from "@vue/shared"
import { createComponentInstance, setupComponent } from "./component"
import { effect } from "@vue/reactivity"
import { TEXT, cVnode } from "./vnode"
import { invokArrayFns } from "./apiLifeCycle"

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
                // 获得生命周期函数
                let {bm,m} = instance
                // 调用render方法
                let proxy = instance.proxy
                // 渲染前,执行beforeMount
                if(bm){
                    invokArrayFns(bm)
                }
                // 改变this指向
                let subTree = instance.subTree = instance.render.call(proxy, proxy)
                patch(null,subTree,container)
                // 渲染完成，执行Mounted
                if(m){
                    invokArrayFns(m)
                }
                instance.isMounted = true // 修改状态
                
            }else { // 更新
                let {bu,u} = instance
                let proxy = instance.proxy
                // 旧的dom树
                let preTree = instance.subTree
                // 更新前，执行beforeUpdate
                if(bu){
                    invokArrayFns(bu)
                }
                // 新的虚拟dom树
                let nextTree = instance.subTree = instance.render.call(proxy,proxy)
                // 对比
                patch(preTree,nextTree,container)
                // 更新完成
                if(u){
                    invokArrayFns(u)
                }
                
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
    const mountElement = (vnode: any, container: any,achor:any)=>{
        let el = hostCreateElement(vnode.type)
        for(let key in vnode.props){ // 添加属性/方法到元素
            hostPatchProp(el,key,null,vnode.props[key])
        }
        vnode.el = el
        // 挂载到页面
        
        hostInsert(el,container,achor)
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
    const processElement = (n1:any,n2:any,container:any,achor:any)=>{
        // 第一次
        if(n1 == null) {
            // 创建元素
            mountElement(n2,container,achor)
        }else { // 更新
            patchElement(n1,n2)
        }
    }
    // 更新元素
    const patchElement = (n1:any,n2:any)=>{
        let props1 = n1.props||{}
        let props2 = n2.props||{}
        n2.el = n1.el
        // 对比属性
        patchProps(n1.el,props1,props2)
        // 对比子节点
        patchChildern(n1,n2,n1.el)
        
    }
    // 对比属性
    const patchProps = (el:any,oldProps:any,newProps:any)=>{
        if (oldProps !== newProps){
            for(let key in newProps){
                let oldV = oldProps[key]
                let newV = newProps[key]
                if (oldV !== newV){ // 不相等，替换
                    hostPatchProp(el,key,oldV,newV)
                }
            }
            for(let key in oldProps){
                if(!(key in newProps)){
                    hostPatchProp(el,key,oldProps[key],null)
                }
            }
        }
    }
    // 对比子节点
    const patchChildern = (n1:any,n2:any,container:any)=>{
        let old = n1.children
        let newV = n2.children
        let newFlags = n2.shapeFlag
        let oldFlags = n1.shapeFlag
        if (newFlags & ShapeFlags.TEXT_CHILDREN){ // 文本子节点
            hostSetElementText(container,newV)
        }else {
                
            if(oldFlags & ShapeFlags.ARRAY_CHILDREN) { // 数组子节点
                patchKeyChild(old,newV,container)

            }else{ // 文本节点或不存在
                
                hostSetElementText(container,"") // 将旧节点清空
                mountChildren(container,newV)
            }
        }

    }

    // 子节点都是数组，需要diff算法
    const patchKeyChild = (old:any,newV:any,el:any)=>{
        // 先从头开始比较
        let i = 0
        let l1 = old.length-1
        let l2 = newV.length-1
        // sync from start 从头开始比对
        while(i<=l1 && i<=l2){
            let c1 = old[i]
            let c2 = newV[i]
            if (isSameVnode(c1,c2)){ // 相同元素
                patch(c1,c2,el) // 对比内部是否发生变化
            }else {
                break
            }
            i++
        } 
        // sync from end 从尾部开始比对
        while(i<=l1 && i<=l2){
            let c1 = old[l1]
            let c2 = newV[l2]
            if (isSameVnode(c1,c2)){ // 相同元素
                patch(c1,c2,el) // 对比内部是否发生变化
                
            }else {
                break
            }
            l1--
            l2--
        }
        // 更新，有序的情况
        // 1. 旧的数据少，新的多
        if(i>l1){
            const nextP = l2+1
            // 参照元素
            let achor = nextP < newV.length?newV[nextP].el:null
            
            while(i<=l2){
                patch(null,newV[i++],el,achor)
            }
        // 2. 旧的比新的多
        }else if(i>l2){
            while(i<=l1){
                unmount(old[i++])
            }
        }else { // 有乱序部分
            // 建立一个map
            let newMap = new Map()
            // 一个数组，用来存储乱序的部分
            const disOrderLen = l2 - i + 1
            const ArrOrder = new Array(disOrderLen).fill(0)
            // 遍历将乱序的放进去
            for(let j = i;j<=l2;j++){
                newMap.set(newV[j].key,j)
            }
            // 对比旧的乱序
            for(let j = i;j<=l1;j++){
                // 判断是否存在于hash表中
                let oldValue = old[j]
                let newIndex = newMap.get(oldValue.key)
                if (!newIndex) { // 不存在，卸载
                    unmount(oldValue)
                }else{ // 存在，对比更新
                    // 存入数组中
                    // 按新索引填入老的索引
                    ArrOrder[newIndex-i] = j+1
                    patch(oldValue,newV[newIndex],el)
                }
            }
            // 获取最长子序列
            const longest = getRequence(ArrOrder)
            let len = longest.length
            // 根据数组重新排列/添加节点
            for(let j = disOrderLen-1;j>=0;j--){
                // 在新的子节点列表中的位置
                let currentIndex = j + i
                let child = newV[currentIndex]
                // 参照节点
                let anchor = currentIndex < newV.length-1?newV[currentIndex+1].el:null
                // 判断是新的还是旧的
                if(ArrOrder[j] == 0){ // 新节点
                    patch(null,child,el,anchor)
                }else{ // 旧的
                    if(j != longest[len]){
                        hostInsert(child.el,el,anchor)
                    }else {
                        len--
                    }

                }
            }
            

        }
         
    }
    // 获取最长连续子序列
    const getRequence = (arr:Array<any>)=>{
        // 记录数组长度
        let length = arr.length
        // 最长子序列数组，装的是原数组的索引
        const result = [0]
        // p数组，保存前驱索引
        let p = arr.slice()
        // result的最后一个位置的值
        let resultLast
        for(let i=0;i<length;i++){
            const arrI = arr[i]
            // 0代表是新的节点
            if(arrI != 0){
                // 获取到最后一个元素
                resultLast = result[result.length-1]
                if(arrI>resultLast){ // 大于，直接添加
                    result.push(i)
                    p[i] = resultLast
                    continue
                }
                // 二分查找,找到最接近的位置
                let start,end
                start = 0
                end = result.length-1
                while(start < end){
                    let middle:any = ((start+end)/1) | 0// 向下取整
                    if(arr[result[middle]]>arrI){ // 继续缩小范围
                        end = middle
                    }else {
                        start = middle + 1
                    }

                }
                if(arr[result[end]]>arrI){ // 替换
                    result[end] = i
                    p[i] = result[end-1]
                }
            }
            
            
        }
        let i = result.length
        let last = i-1
        while(i-->0){
            result[i] = last
            last = p[last]
        }
        return result
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
        if (n1 == null){ // 第一次
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
    const patch = (n1: any, n2: any, container: any,achor:any=null) => {
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
            processElement(n1,n2,container,achor)
            

        } else if (n2.shapeFlag&ShapeFlags.STATEFUL_COMPONENT) {
            // 对组件进行处理
            processComponent(n1, n2, container)
        }
    }
    const render = (vnode: any, container: string) => { // 渲染
        patch(null, vnode, container,null)

    }
    return {
        createApp: ApiCreateApp(render)
    }
}