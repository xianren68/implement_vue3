// 入口文件，用来进行一些dom操作
import { extend } from "@vue/shared"
import { nodeOps } from "./nodeOps"
import { patchProp } from "./patchProp"

// 合并
const rendererOptions = extend({patchProp},nodeOps)

export {
    rendererOptions
}