export function patchStyle(el:Element,prev:any,next:any){
    const style = (el as HTMLElement).style
    // 没有新的style,直接删除
    if(!next){
        el.removeAttribute('style')
        return
    }
    for(let key in prev){
        // 旧的中有此属性，新的中没有，直接清空
        if(next[key]==null){
            style[key as any] = ''
        }
    }
    for(let key in next){
        // 将新的添加到style
        style[key as any] = next[key]
    }

}