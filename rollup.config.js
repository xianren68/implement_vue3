// rollup配置
// 1. 引入相关依赖
import json from '@rollup/plugin-json'
import ts from 'rollup-plugin-typescript2'
import { createRequire } from 'node:module'
import resolvePlugin from '@rollup/plugin-node-resolve'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const require = createRequire(import.meta.url)
const __dirname = fileURLToPath(new URL('.', import.meta.url))
// 2.获取文件路径
const PackagesDir = path.resolve(__dirname, 'packages')
// 2.1 获取需要被打包的包
const packageDir = path.resolve(PackagesDir, process.env.TARGET)
// 2.2 获取json配置文件
const resolve = p => path.resolve(packageDir, p)
const pkg = require(resolve(`package.json`))
// 如果不存在则为{}
const packageOptions = pkg.buildOptions || {}
// 获取包名
const name = packageOptions.filename || path.basename(packageDir)
// 2.3 创建配置映射表
const outputConfigs = {
    // es6模块
    'esm-bundler': {
        file: resolve(`dist/${name}.esm-bundler.js`),
        format: `es`
    },
    // commonjs
    cjs: {
        file: resolve(`dist/${name}.cjs.js`),
        format: `cjs`
    },
    // 立即执行函数
    global: {
        file: resolve(`dist/${name}.global.js`),
        format: `iife`
    },
}

// 打包函数
function createConfig(format,output){
    output.name = name
    output.sourcemap = true
    // 生成rollup配置
    return {
        input: resolve(`src/index.ts`),
        output,
        plugins:[
            json(), // 解析json格式
            ts({ //  解析ts
                tsconfig:path.resolve(__dirname,'tsconfig.json')
            }),
            resolvePlugin()
        ]
    }
}
export default packageOptions.formats.map(format=>createConfig(format,outputConfigs[format]))
