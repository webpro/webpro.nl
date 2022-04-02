---
published: 2013-10-21
modified: 2022-02-19
draft: true
---

# Managing complexity in today's web culture

> Don't micro-manage, invest in high-level patterns

Currently, in my role as a front-end architect I'm facing interesting challenges
to manage complexity in client-side development teams. I just felt like writing
about it. As a small piece of advice. And maybe it's even of benefit to someone.

Working with web technologies these days is exciting. The possibilities in the
browser grow by the day. Existing and new HTML5 standards and API's, including
visual layers (like SVG, WebGL), are rapidly evolving. They allow us to build
fast, large, and stunning web applications.

Existing libraries try hard to keep up, and new ones fill up the gaps. Whether
you need a full-stack framework or several micro-libs, I bet you'll find your
match. At the same time, tooling to support development is flourishing like
never before. Package managers and automation tools significantly make our lives
easier.

It's a lot of goodness. _A lot._

If you're not constantly on top of it, or have been focusing at only specific
parts for a while, it can be overwhelming to dive in. There are dozens of
options. Where to start? What is right for you at this point, in this project
today?

Some developers enter the candy store, have it all, and have a ball.

- Start to pull in jQuery and Modernizr like it's 2009.
- Copy large, bloated Grunt configurations.
- End up with large and duplicated modules in compiled bundles (e.g. AMD starts
  out nice, but gets tricky quickly).
- Naively trust any Stack Overflow answer (jQuery UI can do drag & drop!).
- Use heavy SVG or Canvas solutions (where CSS can do).
- Cleverly build Git trees like it's Christmas time (well, all I want for
  Christmas is a clean tree!)

The cool-factor of many libraries, frameworks and tools makes the less
experienced quickly forget about primary features like performance and
accessibility. And, equally important, values and principles of software design.
To keep things sane, understandable, and maintainable. And not just for the one
who started building the thing. Also for other team members and others joining
in later, it's crucial to avoid big bowls of spaghetti.

The trend towards micro-libs introduces more efforts to stitch those together
nicely. Choosing the right combination of building blocks and connecting them is
a craft in itself. On the other hand, full-stack frameworks may provide a head
start, but may slow projects down when things get larger or more complex.

Whatever path you follow, my advice is to try not to micro-manage. Whether the
architecture largely comes from the framework, or you designed one yourself, set
clear layers and diligently guard them. By means of discussing matters,
delegating ownership, asking questions, anything goes.

Just don't go wild about small things, like:

- Expensive CSS selectors.
- Using a model where a POJO (plain JS object) could have done.
- Many smaller implementation details, such as unnecessary `try-catch`
  constructs, `for..in` instead of `forEach`, not caching the length of arrays
  in iterations.
- Usage of jQuery where native JavaScript would be easier and faster.

No matter how much of a perfectionist you are, you have to let go many
(implementation) details in order to keep focus on the larger picture.

So, **invest in high-level patterns** instead, such as:

- Set out the bigger picture with horizontal and vertical partitions: draw clear
  layers and modules and explain relations and possible ways of communication.
- Tight coupling (when B breaks if A changes), or violations of the Law of
  Demeter (objects talking to strangers). Especially in the long run this can
  become hard to refactor.
- YAGNI: don't implement stuff that might be needed later on. KISS!
- If something is implemented like shit, then at least make sure it's isolated
  shit. Don't let it influence other parts.
- Automation. Minimize the threshold to do QA, unit tests, builds, etcetera in
  an automated fashion, and the benefits can be huge.
- Documentation. Having a single source of reference material readily available
  when discussing matters is gold. Either write it (with the team) and/or have
  external documentation and articles to point people to.

Additionally, I find the following quick wins and time savers:

- Code conventions. You want to quickly scan git diffs, without noise regarding
  code formatting, whitespace, naming, etc.
- Decent knowledge of Git across the team(s) is invaluable.
- Unit testing external (library) code. Waste of time.

It's important to realize here that every situation, every person, needs to
adjust and draw the lines between "high-level" and "low-level" slightly (or
entirely) different. How much can you reasonably handle? Where do you draw the
line?

Last but not least, I think it makes all the difference if you're transparent,
accessible, and honest. You don't want team members to avoid you, nor hesitate
to approach you for questions. You don't need to always have the answer straight
away. Nobody's perfect, and nobody's expected to. As long as you as a team have
a common goal, and faith in each other, you'll get there.
