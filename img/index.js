#!/usr/bin/env node
const fs = require('fs');
const program = require('commander');
const ora = require('ora');
const chalk = require('chalk');
const symbols = require('log-symbols');
const tinify = require("tinify");

tinify.key = "prVjFXkbyAONmFrqBXpDN3bxL9s5HWAT";
const VERSION = require('./package.json').version;

program.version(VERSION, '-v, --version');

// 创建文件夹
program.command("start <name>").action(async (name) => {
    if (fs.existsSync(name)) {
        const spinner = ora('开始压缩...\n');

        try {

            const len = getFileLen(name);

            let index = 1;
            const getFile = async path => {
                if (fs.lstatSync(path).isDirectory()) {
                    const list = await fs.readdirSync(path);
                    for (let index = 0; index < list.length; index++) {
                        await getFile(`${path}/${list[index]}`)
                    }
                    return
                } else {
                    spinner.text = `${index}/${len}开始压缩文件 - ${path}`;
                    const source = await tinify.fromFile(path);
                    await source.toFile(path);
                    index++;
                }
                return
            }

            spinner.start();
            spinner.text = '开始获取所有待压缩文件...';

            await getFile(name);
            // spinner.text = '开始压缩文件...';
            // for (let i = 0; i < files.length; i++) {
            //     console.log(files[i]);
            //     // 压缩文件
            //     await compression(name, i, files.length);
            // }

            spinner.text = '文件压缩完成！';
            spinner.succeed();
        } catch (error) {
            console.log(error);
            spinner.text = '压缩文件失败！';
            spinner.fail();
        }
    } else {
        // 错误提示项目已存在，避免覆盖原有项目
        console.log(symbols.error, chalk.red('未找到文件夹或文件!'));
    }
})

function getFileLen(path) {
    let num = 0;
    if (fs.lstatSync(path).isDirectory()) {
        const list = fs.readdirSync(path);
        for (let index = 0; index < list.length; index++) {
            num += getFileLen(`${path}/${list[index]}`)
        }
    } else {
        num += 1
    }

    return num;
}

program.parse(process.argv);