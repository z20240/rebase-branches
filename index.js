#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
const chalk = require('chalk');

const main = async() => {
    const async_exec = promisify(exec);
    try {
        var { stdout } = await async_exec('git status');

        const curr_br_name = stdout.split('\n')[0].trim().match(/On branch (.+)/)[1];

        var { stdout } = await async_exec('git branch');
        const br_names = stdout
            .split('\n')
            .map(line => line.replace('* ', '').trim())
            .filter(line => !!line && line !== 'master');

        for (const br_name of br_names) {
            var { stdout } = await async_exec(`git checkout ${ br_name }`);

            console.log(chalk.blue(`【${ br_name }】 --> checkout to ${ br_name } \n`), stdout);

            var { stdout } = await async_exec(`git rebase master`);

            console.log(chalk.green(`【${ br_name }】 --> rebase master completed \n`), stdout);
            console.log('---------\n\n');
        }

        await async_exec(`git checkout ${ curr_br_name }`);

        console.log(chalk.cyan.bgWhite('~~~ All Completed ~~~'));
    } catch (e) {
        console.error(e);
    }
};

main();
