export function patchEvents(el:Element & {_vei?:any},key:string,value:any){
    // 事件函数缓存
    const invokers = el._vei || (el._vei = {})
    let exists = invokers[key]
    // 新值与原来的值都存在
    if (exists && value){
        exists.value = value
    }else{
        // 获取事件名称
        let name = key.slice(2).toLowerCase()
        // 新的函数存在
        if (value){
            // 将函数缓存并返回
            let invoker = invokers[name] = createInvoker(value)
            el.addEventListener(name,invoker)
        // 新的函数不存在，将事件监听取消
        }else {
            el.removeEventListener(name,exists)
            // 删除缓存
            invokers[name] = undefined
        }
    }
}
function createInvoker(value:any){
   const invoker = (e:any)=>{
        // 执行函数
        return invoker.value(e)
   }
   invoker.value = value
   return invoker
}