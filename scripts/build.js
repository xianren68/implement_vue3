// 打包入口 monerepo
// 1.获取打包目录
// 获取fs模块
import { readdirSync, statSync } from 'fs'
import {execa} from 'execa'

// 得到需要打包的文件目录,过滤掉文件类型
const Dir = readdirSync('packages').filter(p=>{
    if(statSync(`packages/${p}`).isDirectory()){
        return true
    }
    return false
})
// 2.并行打包
async function build(target){
    // 多线程
    await execa('rollup',['-c',"--environment",`TARGET:${target}`],{stdio:'inherit'})
}
function buildAll(Dir,build){
    // 定义一个promise数组
    const arr = []
    // 遍历文件夹
    for(let i of Dir){
        // 打包
        arr.push(build(i))
    }
    // 等待所有打包完成
    return Promise.all(arr)

}
// 打包成功
buildAll(Dir,build).then(()=>{
    console.log("success")
})