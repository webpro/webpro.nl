---
published: 2025-07-02
tags: shell, bash, line, file, pipe, sed, BASH_REMATCH
description:
  Shell function to show a specific line of a file, with optionally some
  surrounding lines for context
---

# Shell function to show line in file with context

Today I wrote a shell function to display lines in a file, with optionally some
surrounding lines for context. This can come in handy when looking at output
like stack traces including files and line numbers and you want to see what's in
that file on that line.

Built-in IDE terminals often feature clickable links, this `line` function is
for when you don't have that luxury.

## Usage

```shell
$ line
Usage: line <file> <line_number> [lines_around=0]
       line <file:line_number[:column]>
       cat <file> | line <line_number> [lines_around=0]
```

The following examples are all equivalent and show line number 10 of `file.txt`
with 2 extra lines before and after:

```shell
$ line file.txt 10 2
$ line file.txt:10:5 2
$ cat file.txt | line 10 2
```

The default context is `0` lines.

## Script

Add this function somewhere in your `$HOME/.bash_profile` (or equivalent):

```bash
line() {
  local FILE LINE_NUMBER LINES_AROUND=0
  local NAME="${FUNCNAME[0]}"

  if [[ ! -t 0 ]]; then
    LINE_NUMBER=$1
    LINES_AROUND=${2:-$LINES_AROUND}
  elif [[ $1 =~ ^([^:]+):([0-9]+)(:[0-9]+)?$ ]]; then
    FILE="${BASH_REMATCH[1]}"
    LINE_NUMBER="${BASH_REMATCH[2]}"
    LINES_AROUND=${2:-$LINES_AROUND}
  else
    FILE=$1
    LINE_NUMBER=$2
    LINES_AROUND=${3:-$LINES_AROUND}
  fi

  if [[ -t 0 && -z "$FILE" || -z "$LINE_NUMBER" ]]; then
    echo "Usage: ${NAME} <file> <line_number> [lines_around=0]
       ${NAME} <file:line_number[:column]>
       cat <file> | ${NAME} <line_number> [lines_around=0]"
    return 1
  fi

  if [[ -t 0 && -n "$FILE" && ! -f "$FILE" ]]; then
    echo "${NAME}: $FILE: No such file or directory"
    return 1
  fi

  sed -n "`expr $LINE_NUMBER - $LINES_AROUND`,`expr $LINE_NUMBER + $LINES_AROUND`p" ${FILE}
}
```

## TIL

What I found interesting:

1. Use `-t 0` to check if `stdin` (file descriptor `0`) is connected to a
   terminal, and if negative it means non-interactive and thus piped (or
   redirected, tbh I haven't dug into that)

2. `BASH_REMATCH` is the equivalent of, for example, this in JavaScript:

   ```js
   const BASH_REMATCH = str.match(regex);
   ```

3. `FUNCNAME[0]` holds the function name of itself

4. That `sed` always seems to have a new trick up its sleeve. The result in the
   script with `sed` + `expr` above is, for example, `sed -n "8,12p"` which
   shows lines 8-12 of the input.

## In closing

Obviously I've added `line` to [my dotfiles][1]!

[1]: https://github.com/webpro/dotfiles
