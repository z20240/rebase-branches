# rebase-branches

![](https://z20240.github.io/gallary/rebase-branches.jpg)

This is a tool for people who want to rebase specify branch (default master) automatically to all other branches.

## Getting started

### Install by npm

```
npm i rebase-branches -g
```

OR

### Install by clone git

```
$ git clone https://github.com/z20240/rebase-branches.git

$ cd rebase-branches

$ sudo npm install -g
```

### How to use?

In your project which has the `git` using the command line

```
$ rebase-branches
```

It will automatically rebase master branch for each branch.

### Args

- **-h, --help** : show usage.
- **-o, --only** : only some branches need to rebase master.
- **-e, --except** : branches rebase master except specified branches.
- **--set-default [branch name]** : set default rebase branch.
- **--show-default** : show current default rebase branch.
- **--set-except**: You can set default except target branches.
- **--show-except**: You can show default except target branches.
- **--show-all**: You can show all config by using this command.
- **--remove-except**: You can remove default except target branches.

**Hint: When occur conflict**

Please **resolve** the conflict yourself, and retry the `rebase-branches` again.

That's it~

Enjoy your git rebase! :)

