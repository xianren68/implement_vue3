// 对元素的操作


export const nodeOps = {
    // 创建
    createElement: (tagName:string)=>document.createElement(tagName)
    // 删除
    ,
    remove:(child:Element)=>{
        let parent = child.parentNode
        if(parent){
            parent.removeChild(child)
        }
    },
    // 添加
    insert:(child:Element,parent:Element,achor:Element)=>{
        // 如果有参照元素，直接放到参照元素之前，若没有直接append
        parent.insertBefore(child,achor||null)
    },
    // 选择
    querySelector:(select:string)=>document.querySelector(select)
    ,
    // 设置节点文本
    setElementText:(el:Element,text:string)=>{
        el.textContent = text
    },
    // 创建文本节点
    createText:(text:string)=>document.createTextNode(text)
    ,
    // 设置文本节点
    setText:(node:Element,text:string)=>{node.nodeValue = text}
}