---
published: 2022-12-19
tags: git, bisect
description:
  Using Git bisect to easily find where a bug or changed behavior was introduced
image: ./painting-of-divide-and-conquer-in-van-gogh-style.webp
---

# Using Git bisect to divide & conquer

When you have a series of commits and want to find where a bug or a change of
behavior was introduced, `git bisect` is your friend. With a command that
understands what is "bad" and what is "good", this process can be fully
automated. For instance, use `npm test` and report back the first commit where
the tests fail.

Here's how to start the process:

```shell
git bisect start
git bisect bad HEAD
git bisect good v5.1.0
```

Usually the `HEAD` is a bad commit, and `v5.1.0` is a tag or commit you are sure
is good. Create a file to run the commands. Here's an arbitrary example:

```shell title=bisect.sh
npm run build
npm test
```

Make this file executable (`chmod +x bisect.sh`), and run with it:

```shell
git bisect run ./bisect.sh
```

In case there is no script to automate this, then you can do this manually. Just
say `git bisect good` or `bad`, and Git will check out the next commit for you,
you verify whether it's good or bad, and so on. Git uses a binary search
algorithm to do this efficiently.

Note that this technique is often used to find which changeset introduced a bug,
but other ideas include finding a performance regression, the output of some
program changes, etcetera. You can even use different terms (instead of "bad"
and "good") to support this:

```shell
git bisect start --term-old fast --term-new slow
```

When you are done, or made a mistake marking `good` or `bad` commits, the
process has to be reset:

```shell
git bisect reset
```

See the [git bisect documentation][1] for more details.

[1]: https://git-scm.com/docs/git-bisect
