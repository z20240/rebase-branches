#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');

const main = async() => {
    const { stdout, stderr } = await promisify(exec)('git branch');
    stdout
        .split('\n')
        .map(line => line.replace('* ', '').trim())
        .filter(line => !!line)
        .forEach(async(br_name) => {
            const { stdout, stderr } = await promisify(exec)(`git rebase --onto master ${ br_name }`);

            console.log(`【${ br_name }】 --> rebase master \n`, stdout);
            console.log('---------\n\n');
        });
};

main();
