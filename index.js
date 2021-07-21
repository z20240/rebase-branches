#!/usr/bin/env node

const fs = require('fs');
const chalk = require('chalk');
const { difference } = require('lodash');
const parseArgs = require('minimist');
const { exec } = require('child_process');
const { promisify } = require('util');
const config = require('./config.json');

Object.defineProperty(Array.prototype, 'flat', {
  value: function (depth = Infinity) {
    return this.reduce(function (flat, toFlatten) {
      return flat.concat(Array.isArray(toFlatten) && depth > 1 ? toFlatten.flat(depth - 1) : toFlatten);
    }, []);
  },
});

const argv = parseArgs(process.argv.slice(2), {
  alias: {
    t: ['target'],
    e: ['except'],
    o: ['only'],
    h: ['help'],
  },
  string: ['set-default', 'set-except', 'remove-except', 't', 'target', 'e', 'except', 'o', 'only', '_'],
  boolean: ['h', 'help', 'show-default', 'show-except', 'show-all'],
});

const except_list = argv.except ? string_to_array(argv.except) : [];
const only_list = argv.only ? string_to_array(argv.only) : [];
const CONFIG_DIR = __dirname + '/config.json';

/**
 * @param {string} str
 */
const string_to_array = (str) => {
  try {
    return /** @type {string[]} */ (JSON.parse(str));
  } catch (e) {
    return str
      .split(',')
      .map((x) => x.split(' '))
      .flat()
      .filter((x) => !!x);
  }
};

/**
 * @desc check if `br` is in `except_br`.
 * If no except_br, it will return `false` to show no except_br
 * @param {string} br
 * @returns
 */
const except_br = (br) =>
  !![...except_list, ...config.except].length && [...except_list, ...config.except].includes(br);
/**
 * @desc check if `br` is in `only_br`
 * If no only_br, it will return `true` to show no only_br
 * @param {string} br
 * @returns
 */
const only_br = (br) => {
  if (!only_list.length) return true;

  return only_list.includes(br);
};

const usage = () => {
  const cmd = chalk`
This is a command line tool for people who want to rebase master branch automatically to all other branch.

Usage:
------------
In your git project, type down \`git-rebase-branch\` to automatically rebase target branch (default {bold master}) for branches.

You also can use:

-t / --target: assign the specify branch as target.
  Example. (equals to git rebase develop)
  ------------
  $ git-rebase-branch -t develop

-e / --except: tell the tool except these branches.
  args could be a string split by commas. ex. 'branch name1, branch name2, ...'
  or
      could be an array: ex. '["branch name1", "branch name2"]'
  or
      could be split by white space: ex. 'BranchName1 BranchName2'

  Example. (rebase branches except these branches)
  ------------
  1. git-rebase-branch -e 'br1,br2'
  2. git-rebase-branch -e 'br1 br2'
  3. git-rebase-branch -e '["br1", "br2"]'

-o / --only: tell the tool {bold only need} to rebase these branches.
  args could be split by commas. ex. 'branch name1, branch name2, ...'
  or
  could be an array: ex. '["branch name1", "branch name2"]'
  or
  could be split by white space: ex. 'BranchName1 BranchName2'

  Example. (only these branch need to be rebase)
  ------------
  1. git-rebase-branch -o 'br1,br2'
  2. git-rebase-branch -o 'br1 br2'
  3. git-rebase-branch -o '["br1", "br2"]'

--set-default: You can set target branch as default rebase branch.
  After the setting, each time you rebase will base on the target branch you set.

  Example.
  ------------
  $ git-rebase-branch --set-default develop

--show-default: You can show default target branch.
  Example.
  ------------
  $ git-rebase-branch --show-default

--set-except: You can set default except target branches.
  Example.
  ------------
  $ git-rebase-branch --set-default 'br1,br2'

--remove-except: You can remove default except target branches.
  Example.
  ------------
  $ git-rebase-branch --remove-default 'br1,br2'

--show-except: You can show default except target branches.
  Example.
  ------------
  $ git-rebase-branch --show-except

--show-all: You can show all config by using this command.
  Example.
  ------------
  $ git-rebase-branch --show-all
`;
  console.log(cmd);
};

if (argv.help) {
  usage();
  process.exit(0);
}

/**
 * @desc set default branch
 * @param {string} defaultValue
 */
const set_default = (defaultValue) => {
  const newConfig = { ...config, default: defaultValue };
  fs.writeFileSync(__dirname + '/config.json', JSON.stringify(newConfig), {
    encoding: 'utf8',
  });
  console.log(chalk`default branch has been set to {bold ${defaultValue}}`);
};

if (argv['set-default']) {
  try {
    set_default(argv['set-default']);
  } catch (error) {
    console.log(error);
  }
  process.exit(0);
}

/**
 * @desc set except branch
 * @param {string} except_inputs
 */
const set_except = (except_inputs) => {
  const except_list = string_to_array(except_inputs);

  const newConfig = { ...config, except: [...new Set([...config.except, ...except_list])] };
  fs.writeFileSync(CONFIG_DIR, JSON.stringify(newConfig), {
    encoding: 'utf8',
  });
  console.log(chalk`{bold ${except_list.toString()}} branch has been set.`);
};

if (argv['set-except']) {
  set_except(argv['set-except']);
  process.exit(0);
}

/**
 * @desc remove except branch
 * @param {string} except_inputs
 */
const remove_except = (except_inputs) => {
  const except_list = string_to_array(except_inputs);

  const remain = difference(except_list, config.except);

  const newConfig = { ...config, except: remain };
  fs.writeFileSync(CONFIG_DIR, JSON.stringify(newConfig), {
    encoding: 'utf8',
  });
  console.log(chalk`{bold ${except_list.toString()}} branch has been remove.`);
  console.log(chalk`remain {bold ${remain.toString()}}.`);
};

if (argv['remove-except']) {
  remove_except(argv['remove-except']);
  process.exit(0);
}

/**
 * @desc show default branch
 */
const show_all = () => console.log(JSON.stringify(config));

if (argv['show-all']) {
  show_all();
  process.exit(0);
}

/**
 * @desc show default branch
 */
const show_default = () => console.log(chalk`{bold ${config.default}}`);

if (argv['show-default']) {
  show_default();
  process.exit(0);
}

/**
 * @desc show default branch
 */
const show_except = () => console.log(chalk`{bold ${config.except.toString()}}`);

if (argv['show-except']) {
  show_except();
  process.exit(0);
}

/**
 * @param {string} target default target branch
 * @param {string} brs
 * @returns
 */
const get_branches = (target, brs) =>
  brs
    .split('\n')
    .map((line) => line.replace('*', '').trim())
    .filter((br_name) => !!br_name && br_name !== target && !except_br(br_name) && only_br(br_name));

/**
 * @param {Error} error
 */
const catch_error = (error) => {
  console.log(chalk.red('Rebase occurs errors, '), chalk.yellow('please check if conflict'), chalk.red('.'));
  console.log(
    chalk.red('You can use 【'),
    chalk.yellow('git rebase --abort'),
    chalk.red('】to abort this rebase in the branch.'),
  );
  console.log(
    chalk.green('OR,'),
    chalk.red('Solve the Conflict and add to track then use【'),
    chalk.yellow('git rebase --continue'),
    chalk.red('】to continue this rebase in the branch.'),
  );
  console.log('   Detail message: ->', error.message);
};

/**
 *
 * @param {object} param0
 * @param {string} param0.cmd
 * @param {string} param0.msg
 */
const execCommand = async ({ cmd, msg }) => {
  const async_exec = promisify(exec);

  const { stdout, stderr } = await async_exec(cmd);

  if (msg) {
    console.log(msg);
    console.log(stdout);
  }

  return { stdout, stderr };
};

const main = async () => {
  const target = argv.target || config.default;

  try {
    var { stdout } = await execCommand({
      cmd: 'git rev-parse --abbrev-ref HEAD',
    });

    const curr_br_name = stdout.trim();

    var { stdout } = await execCommand({
      cmd: `git checkout ${target}`,
      msg: chalk.blue(`checkout to ${target}`),
    });

    var { stdout } = await execCommand({
      cmd: 'git pull --rebase --autostash',
      msg: chalk.blue(`execute ${chalk.blue('git pull --rebase --autostash')}`),
    });

    var { stdout } = await execCommand({
      cmd: `git checkout ${curr_br_name}`,
      msg: chalk.blue(`checkout back to ${chalk.bold(curr_br_name)}}`),
    });

    var { stdout } = await execCommand({
      cmd: 'git branch',
    });

    const br_names = get_branches(target, stdout);

    for (const br_name of br_names) {
      var { stdout } = await execCommand({
        cmd: `git checkout ${br_name}`,
        msg: chalk.blue(`【${br_name}】 --> checkout to ${br_name}`),
      });

      var { stdout } = await execCommand({
        cmd: `git rebase ${target} --autostash`,
        msg: chalk.green(`【${br_name}】 --> rebase ${target} completed`),
      });

      console.log('---------\n\n');
    }

    await execCommand({
      cmd: `git checkout ${curr_br_name}`,
    });

    console.log(chalk.cyan.bgWhite('~~~ All Completed ~~~'));
  } catch (e) {
    catch_error(e);
  }
};

main();
