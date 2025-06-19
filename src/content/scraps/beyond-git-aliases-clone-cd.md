---
published: 2025-06-19
tags: git, clone, cd
description: git clone
---

# Beyond Git aliases: git clone + cd

When a Git alias doesn't provide enough scripting powers, here's a clean way to
go beyond them.

This is a little technique I cobbled together trying to clone a GitHub repo and
`cd` into the created directory in a single go, but couldn't find an easy way
using a Git alias alone.

The first step is optional. For a clean approach, create an alias to hook into
later. In your global Git config:

```ini
[alias]
	c = clone
```

To `cd` into the latest modified directory we'll create a little function. This
is useful on its own so let's store it separately:

```bash
cdl() {
  cd "$(ls -dt */ | head -n 1)"
}
```

Now to bring it all together, add this function somewhere in the `.bash_profile`
(or what have you):

```bash
function git() {
  if [ $1 = "c" ];
  then
    local url="$2";
    [[ "$url" =~ ^[^:]+/.+$ ]] && url="git@github.com:${url}.git"
    command git clone "$url" "${@:3}" && cdl
  else
    command git $@
  fi
}
```

This only affects `git c` and leaves everything else alone, including
`git clone`.

From now on, `git c webpro/venz` will clone the repository and `cd` into it
right away. Any valid Git URL will still work as expected.
