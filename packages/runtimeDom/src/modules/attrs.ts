export function patchAttr(el:Element,key:string,next:string){
    // 自定义节点没有值，直接删除
    if(!next){
        el.removeAttribute(key)
    }else{
        el.setAttribute(key,next)
    }
}