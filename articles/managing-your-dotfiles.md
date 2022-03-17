---
published: 2014-10-22
modified: 2022-02-26
description: Quick guide to start organizing your dotfiles
---

# Managing your dotfiles

Once you've [started out enjoying dotfiles][1], you may wonder about the best
way to organize and manage them. Do you want to keep it small and simple? Or do
you want to manage as many packages, applications and their settings as
possible? Or are you an administrator and need to orchestrate many systems?

Here are some questions and pointers to consider during your dotfiles journey.

## Where to **store** dotfiles?

Many prefer to store them in a public repository, such as GitHub or Bitbucket.
This way, you make them accessible for others to get inspired or steal from.
Good repositories can also easily be forked and customized to fit your
particular needs. Alternatively, you can store your dotfiles in a private
repository or a personal cloud storage, such as Dropbox or Google Drive.

## How to install dotfiles?

You can copy and sync your dotfiles to their designated location, or create
symlinks. Another option is to use one of the [many tools][2] for this. Some
[frameworks][3] have this built-in. Many repositories include an installation
script to ease this process.

## Start from **scratch or framework**?

You may want to be in full control and like to know exactly what's going on in
your system. Then you can start from scratch, and borrow and steal bits and
pieces you like from others. On the other hand, you can put your trust in a
community behind a large framework. This allows you to make a head start and
quickly have all the goodness installed (including many sensible default
settings).

## Which shell should I use?

It's a good idea to make up your mind regarding the shell you want to use. Most
commands and packages run fine on common shells, but not all. The more you
customize, the more likely it is to run into compatibility issues. For example,
Bash and Zsh are popular [shells][4]. My advice is to pick one, and make
yourself at home.

## Need to **orchestrate** multiple setups and/or machines?

Depending on the environment, you might be better of with more robust solutions
for configuration management like Puppet, Chef, or Ansible.

[1]: https://www.webpro.nl/articles/getting-started-with-dotfiles
[2]: https://github.com/webpro/awesome-dotfiles#tools
[3]: https://github.com/webpro/awesome-dotfiles#dotfiles-repos
[4]: http://en.wikipedia.org/wiki/Unix_shell
