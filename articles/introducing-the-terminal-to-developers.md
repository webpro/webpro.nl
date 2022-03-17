---
published: 2017-09-18
modified: 2022-02-26
tags: terminal
description:
  The article I wish I had read when I had to open the terminal for the
  first time.
---

# Introducing the terminal to developers

> The article I wish I had read when I had to open the terminal for the
> first time.

## Introduction

Being a developer can be quite overwhelming these days. Getting familiar with a
codebase and the framework(s) and libraries it uses is not the whole story.
There is also a real demand of additional skills to get your job done, such as
using Git, package managers, and build tooling.

Many of these tools are to be used in the terminal, which may be new and a bit
frightening. But don't worry, we've all been there. This article provides an
overview, along with practical examples, to get you up to speed with the
terminal and some essential tooling.

## Why do I need the terminal?

For certain tasks you can get away without using the terminal at all. For
example, there are great GUI tools for working with Git. However, getting
familiar with tools like Git from the terminal gives you more power and
flexibility. In the end, a GUI is a graphical shell in front of a command-line
tool. Often limited by screen estate or a minimalistic design, a GUI may feature
only a subset of the underlying command-line interface. Being "closer to the
metal", it can also help you to get out of trouble in case a GUI is stuck or
messed up.

Frameworks and libraries for programming languages (such as JavaScript or PHP)
come and go, but knowing your way around in the terminal is a skill you can use
always and everywhere.

## What actually is a terminal?

A terminal is text-based, and serves as the command-line interface (CLI) you can
type your commands in. A shell takes these commands, and tells the operating
system to execute them.

On macOS, the default terminal application is named "Terminal", and the default
shell is Bash. You will also find a "terminal" in Linux distributions like
Debian and Ubuntu. On Windows 10, you can [install a Linux environment][1].

For the rest of this article, I'll be assuming you are using Bash or a similar
shell.

## Opening a terminal

- On macOS, you can use Spotlight (`⌘+Space`), and type "Terminal" to find and
  open it.
- On Linux, search for the "terminal" app and open it. You can also try the
  `Ctrl+Alt+T` combo.
- On Windows 10, start the "Bash on Ubuntu on Windows" application.

The first thing you will always get is a prompt. It's what "prompts" you to type
a command. The prompt might include information such as the computer and/or user
name, and usually ends with a `$`. Behind the `$` is the cursor, where you can
type commands.

```shell title=~
Last login: Sun Sep 17 21:20:17 on ttys000
lars ~ $
```

If your terminal has a white background color, but you prefer to have a black
background color instead: this article contains instructions on how to do this.

## Finding your way

In an application like Finder or File Explorer you can navigate your files and
folders. In the terminal we can do the same with commands like `ls` and `cd` (to
**l**i**s**t files and **c**hange **d**irectories, respectively). For example:

```shell title=~/Documents
Last login: Sun Sep 17 21:20:17 on ttys000
$ cd Documents
$ ls
tutorial.pdf Keynote.pdf
```

The last line is the default output of `ls`. You can pass it extra arguments (or
"options") to change its behavior. For instance, there is `-a` to show all files
(including hidden ones), and `-l` to show one file per line:

```shell title=~/Documents
$ ls -a -l
total 1160
drwx------   6 lars staff     204 Sep 12 19:52  .
drwxr-xr-x  64 lars staff    2176 Sep 12 22:29  ..
-rw-r--r--   7 lars staff      42 Sep 12 19:52  .DS_Store
-rw-r--r--   7 lars staff   81238 Sep 12 19:52  tutorial.pdf
-rw-r--r--   1 lars staff   11086 Jul  5 22:35  Keynote.pdf
```

The arguments can also be combined into one: `ls -al` means the same.

Here are some essential commands to manage files and directories:

```shell
ls     # List files
cat    # Show file content
cd     # Change directory
mv     # Move or rename a file (or dir)
cp     # Copy file (or dir)
mkdir  # Make directory
rm     # Remove file (or dir)
pwd    # Output the current directory
```

If you want more information about any of these commands, you could either use
the `--help` argument, or perhaps google the command. Both ways are not ideal:
the former is correct and complete, but often hard to read. And the latter takes
more time and needs you to switch context between the terminal and a web
browser. Maybe we can improve on this. We all like readable documentation,
right?

## Package managers

Let's use this as a an opportunity to install a package manager, and then
install a package with it. In this case, one for simplified documentation.

In a nutshell, package managers are an essential tool to install system-wide (or
"global") software, or local dependencies within a project. You may have heard
of Homebrew, npm, Maven, RubyGems, or apt-get. In this article, we'll be looking
at Homebrew and npm.

- On macOS, Homebrew is "the missing package manager". Find it at [brew.sh][2].
- Most Linux distributions (including Linux on Windows), come with a
  pre-installed package manager, such as `apt-get` or `yum`.

Are you working with JavaScript? You need npm (the package manager for
JavaScript), which comes with [Node.js][3]. You can [install Node.js via many
package managers][4]. This will also make npm available on your system.

Now we can install a package named "tldr" with either one of them. Using npm:

```shell
$ npm install --global tdlr
```

Or, with Hombrew:

```shell
$ brew install tldr
```

Now you can try for instance `tdlr cd` to see what I mean with readable
documentation:

```shell
$ tldr cd

  cd

  Change the current working directory.
  More information: https://man.archlinux.org/man/cd.n.

  - Go to the given directory:
    cd path/to/directory

  - Go to home directory of current user:
    cd

  - Go up to the parent of the current directory:
    cd ..

  - Go to the previously chosen directory:
    cd -
```

We'll dive into npm in a minute. However, if you have questions or got stuck
installing a package manager, then you might want to check out one of the
following links:

- [How Software Installation & Package Managers Work On Linux][5]
- [Homebrew FAQ][6]

## Git

Git is a program that many projects use for version control. Basically, it
allows people to work on code together, while keeping track of changes.
Everybody should not be editing the same files directly, and sometimes changes
need to be reverted.

Collaborating with Git involves cloning ("downloading") the code repository of a
project, making changes to fix bugs or develop new features, and then pushing
back ("uploading") the changes. It is common to create a separate branch first,
so others can review the changes before they are merged back into the master
branch.

Let's install Git (with a package manager, obviously)! Here are some options for
various operating systems:

- For macOS with Homebrew: `brew install git`
- For Linux (e.g. Debian, Ubuntu): `apt-get install git`
- For Windows: use either the [Git for Windows installer][7] or [Chocolatey][8]:
  `choco install git`

Below is a screenshot after running a few commands as an example:

```shell title=~/Projects/my-first-repository
$ mkdir my-first-repository
$ cd my-first-repository/
$ git init
Initialized empty Git repository in /Users/lars/Projects/my-first-repository/.git/
$ git checkout -b cool-feature
Switched to a new branch 'cool-feature'
$ echo "Some content" > somefile.txt
$ ls
somefile.txt
$ git add somefile.txt
$ git status
On branch cool-feature

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
	new file:   somefile.txt

$ git commit -m "Add some file"
[cool-feature (root-commit) b706c43] Add some file
 1 file changed, 1 insertion(+)
 create mode 100644 somefile.txt
$
```

For more information on working with Git, here are a two excellent tutorials:

- [git  -  the simple guide][9]
- [An Intro to Git and GitHub for Beginners (Tutorial)][10]

## npm

npm is the package manager for JavaScript. Even though Node.js itself is a
server-side application runtime, and npm was originally built for Node modules,
npm proves to be a great dependency manager for JavaScript in general. Next to
JavaScript modules, the npm repository contains many tools built on top of
Node.js, such as Grunt, Webpack, Babel, UglifyJS, and many more.

To manage JavaScript dependencies with npm, a project has a `package.json` file.
It contains meta data about the project, and always includes a project name and
version. Here's an example:

```json
{
  "name": "my-awesome-project",
  "version": "1.2.6",
  "description": "My awesome project!",
  "license": "MIT",
  "repository": "git@github.com:webpro/my-awesome-project.git",
  "dependencies": {
    "lodash": "4.17.4",
    "react": "15.6.1"
  },
  "devDependencies": {
    "mocha": "3.5.3"
  }
}
```

Let's clone this project with Git, and install its dependencies:

```shell title=~/Projects/my-awesome-project
$ cd Projects/
$ git clone git@github.com:webpro/my-awesome-project.git
Cloning into 'my-awesome-project'...
remote: Enumerating objects: 3, done.
remote: Counting objects: 100% (3/3), done.
remote: Compressing objects: 100% (2/2), done.
remote: Total 3 (delta 0), reused 3 (delta 0), pack-reused 0
Receiving objects: 100% (3/3), done.
$ cd my-awesome-project/
$ ls -a
.  ..  .git  package.json
$ npm install
added 56 packages, and audited 57 packages in 4s
[...]
$ ls node_modules/
asap		      fbjs		 js-tokens		 loose-envify	   react
balanced-match	      fs.realpath	 json3			 minimatch	   react-is
brace-expansion       glob		 lodash			 minimist	   safer-buffer
browser-stdout	      graceful-readlink  lodash._baseassign	 mkdirp		   setimmediate
commander	      growl		 lodash._basecopy	 mocha		   supports-color
concat-map	      has-flag		 lodash._basecreate	 ms		   ua-parser-js
core-js		      he		 lodash._getnative	 node-fetch	   whatwg-fetch
create-react-class    iconv-lite	 lodash._isiterateecall  object-assign	   wrappy
debug		      inflight		 lodash.create		 once
diff		      inherits		 lodash.isarguments	 path-is-absolute
encoding	      is-stream		 lodash.isarray		 promise
escape-string-regexp  isomorphic-fetch	 lodash.keys		 prop-types
$
```

The command `npm install` installed the dependencies `lodash` and `react` (and
their dependencies) locally in the `node_modules` directory.

Note that this installs the dependencies _locally_ to the project. This is very
different from installing packages _globally_, as we did with the `tldr` package
(using the `--global` or `-g` argument). In general, local packages are
dependencies for a single project and global packages are used from the command
line.

If you want to learn more, I can recommend this article about npm dependencies
and scripts: [Using npm dependencies in npm scripts][11].

## Tips & tricks

In this section I'd like to present a few tips and tricks to make your life in
the terminal easier right away.

### Change the terminal's theme

In macOS and some Linux distributions, the default background color of the
terminal application is white, and the window might be slightly transparent. Yet
many people prefer a black background in the terminal (like the screenshots in
this article).

Here's you can change this for macOS: from the Terminal.app, go to Preferences
(`⌘,`), go to Profiles, and select the desired profile (e.g. the "Pro" theme).
Make sure to press the "Default" button to store this for later sessions as
well. In the same screen, you can go into the "Background Color" modal and set
opacity to 100% to remove the transparency.

### Shortcuts & commands you should know

The `^` (caret) below represents the "Control" key:

| Shortcut | Description                                                  |
| :------: | :----------------------------------------------------------- |
|   `↑`    | Show the previous command                                    |
|   `↓`    | Show the next command                                        |
|   `^a`   | Move the cursor to the start of the line                     |
|   `^e`   | Move the cursor to the end of the line                       |
|   `⇥`    | (tab) Auto-complete commands, and directory and file names   |
|   `!!`   | Run the previous command again                               |
|   `^l`   | Clear the screen (or `clear`)                                |
|   `^c`   | Cancel the current process (if it hangs or becomes unusable) |
|   `^d`   | Exit the current terminal (or `exit`)                        |

### Aliases and functions

Over time, you will see that you are using the same commands and parameters over
and over again. This is where aliases and functions come in. An alias can be
used as an abbreviation for a more complex command. For example:

```shell
alias ll="ls -lA --color"
```

Now you can use `ll` as an alias and it will execute the `ls` command including
the extra arguments. You can also still add extra arguments to `ll`. Use alias
without arguments to get a list of all active aliases.

Functions can contain logic, and a main difference with aliases is that you can
pass it arguments. Here's a trivial example:

```shell
say_hi () {
  echo Hello, $1
}
```

You can invoke this function with `say_hi John`, and it would print
`Hello, John`:

```shell
$ say_hi John
Hello, John
```

This is a very short and superficial introduction to this topic. If you are
interested in learning more, please check out the following resources:

- [An Introduction to Useful Bash Aliases and Functions][12]
- [Configuring bash with aliases and functions][13]

## Wrapping up

After reading this article I hope you feel slightly more comfortable to use the
terminal. I've compiled a short list of great resources to get some directions
to learn more. What's next for you?

If you feel there's something important missing in this article, feel free to
let me know (in a comment here, or via Twitter: [@webprolific][14]). Thanks for
reading!

## Further reading

- [Learn Enough Command Line to Be Dangerous][15]
- [The Art of Command Line][16]
- [Getting started with dotfiles][17]

[1]: https://msdn.microsoft.com/en-us/commandline/wsl/install_guide
[2]: https://brew.sh
[3]: https://nodejs.org
[4]: https://nodejs.org/en/download/package-manager/
[5]:
  https://www.howtogeek.com/117579/htg-explains-how-software-installation-package-managers-work-on-linux/
[6]: https://docs.brew.sh/FAQ.html
[7]: https://gitforwindows.org
[8]: https://chocolatey.org
[9]: http://rogerdudler.github.io/git-guide/
[10]: https://product.hubspot.com/blog/git-and-github-tutorial-for-beginners
[11]:
  https://firstdoit.com/no-need-for-globals-using-npm-dependencies-in-npm-scripts-3dfb478908
[12]:
  https://www.digitalocean.com/community/tutorials/an-introduction-to-useful-bash-aliases-and-functions
[13]:
  http://scriptingosx.com/2017/05/configuring-bash-with-aliases-and-functions/
[14]: https://twitter.com/webprolific
[15]: https://www.learnenough.com/command-line-tutorial
[16]: https://github.com/jlevy/the-art-of-command-line#the-art-of-command-line
[17]: https://www.webpro.nl/articles/getting-started-with-dotfiles
