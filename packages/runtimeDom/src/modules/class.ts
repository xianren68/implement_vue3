export function patchClass(el:Element,nextValue:any){
    if(!nextValue){
        el.removeAttribute('class')
    }else {
        el.className = nextValue
    }
    
}