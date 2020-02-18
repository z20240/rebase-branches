#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
const chalk = require('chalk');
const parseArgs = require('minimist');

const argv = parseArgs(process.argv.slice(2), {
    alias: {
        'e': ['except'],
        'o': ['only'],
        'h': ['help']
    },
    string: ['e', 'except', 'o', 'only', '_'],
    boolean: ['h', 'help']
});

if ( argv.help ) {
    usage();
    process.exit(0);
}

function usage() {
    const cmd = `
This is a command line tool for people who want to rebase master branch automatically to all other branch.

Usage:
------------
In your git project, type down \`rebase-master\` to automatically rebase master for all branch.

You also can use
    -e / --except to tell the tool except these branches.
        'branch name1, branch name2, ...' or
        '["branch name1", "branch name2"]' or
        'BranchName1 BranchName2'

Example. (rebase branches except these branches)
------------
1. rebase-master -e 'br1,br2'
2. rebase-master -e 'br1 br2'
3. rebase-master -e '["br1", "br2"]'

Example. (only these branch need to be rebase)
------------
1. rebase-master -o 'br1,br2'
2. rebase-master -o 'br1 br2'
3. rebase-master -o '["br1", "br2"]'
        `;
    console.log(cmd);
}

const string_to_array = str => {
    try {
        return JSON.parse(str);
    } catch (e) {
        return str.split(',').map(x =>x.split(' ')).flat().filter(x => !!x);
    }
}

const main = async() => {

    const except_list = argv.except ? string_to_array(argv.except) : [];
    const only_list = argv.only ? string_to_array(argv.only) : [];

    const except_br = br => !!(except_list.length) && except_list.includes(br);
    const only_br = br => {
        if (!only_list.length) return true;

        return only_list.includes(br);
    };

    const async_exec = promisify(exec);
    try {
        var { stdout } = await async_exec('git status');

        const curr_br_name = stdout.split('\n')[0].trim().match(/On branch (.+)/)[1];

        var { stdout } = await async_exec('git branch');
        const br_names = stdout
            .split('\n')
            .map(line => line.replace('* ', '').trim())
            .filter(br_name => !!br_name && br_name !== 'master' && !except_br(br_name) && only_br(br_name));

        for (const br_name of br_names) {
            var { stdout } = await async_exec(`git checkout ${ br_name }`);

            console.log(chalk.blue(`【${ br_name }】 --> checkout to ${ br_name } \n`), stdout);

            var { stdout } = await async_exec(`git rebase master`);

            console.log(chalk.green(`【${ br_name }】 --> rebase master completed \n`), stdout);
            console.log('---------\n\n');
        }

        await async_exec(`git checkout ${ curr_br_name }`);

        console.log(chalk.black.bgCyan('~~~ All Completed ~~~'));
    } catch (e) {
        console.log(chalk.red('Rebase occurs errors, please check if'), chalk.yellow('conflict'), chalk.red('.'));
        console.log(chalk.red('You can use 【'), chalk.yellow('git rebase --abort'), chalk.red('】to abort this rebase in the branch.'));
    }
};

main();
