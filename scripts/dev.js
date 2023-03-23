import {execa} from 'execa'

// 2.并行打包
async function build(target){
    // 多线程
    await execa('rollup',['-cw',"--environment",`TARGET:${target}`],{stdio:'inherit'})
}
build('reactivity')