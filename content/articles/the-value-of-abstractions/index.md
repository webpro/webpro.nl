---
published: 2022-08-19
description:
  The more expensive it is to refactor or replace a component in the system, the
  more value it has to design an interface to abstract the implementation away.
---

# The value of abstractions

When working on any system, maintenance quickly becomes harder when more
components are added. If any component in the system is deteriorating, it should
be possible to refactor or replace only this component, without having to change
too many other parts.

Following this principle, each component needs a clear separation of concern
with a clear interface, and without leaky abstractions.

![value-of-abstractions][1]

## Minimize the cost of change

Over time, implementations and underlying dependencies will change, but the
interface should hardly change. As a result, other components in the system that
use this interface do not need to change. This is the [Interface Segregation
Principle][2]:

> An interface should be more dependent on the code that calls it than the code
> that implements it.

Let's take an example component "C" in our system. It's responsible for user
input validation in forms, while we have many different forms in our system. The
deeper C is everywhere in the system, the more often it is used, the more
important its interface becomes. In either a composition or inheritance based
structure, it may help to ask ourselves questions like this about C:

- How hard is it to refactor C without affecting other components?
- How hard is it to replace C within the structure later on?
- How hard is it to replace C's external dependency?
- How to build the next feature with an alternative of C?

The harder it is to do these things, the more coupled the components in the
system are to C, and the harder it is to maintain the project. As such, the more
value it has to add the right abstraction for C.

> The more expensive it is to refactor or replace a component in the system, the
> more value it has to design an interface to abstract the implementation away.

Let's take another example. Someone wants to swap out an underlying dependency
for the latest and greatest in, say, data fetching. Or error logging. The impact
of such refactorings should be as small as possible by designing minimal and
effective interfaces.

The hard part is to figure out what components in the system need an
abstraction, and to design their interfaces. This does require some research and
preparation upfront, but pays off in the long run.

## Enforce restrictions

Even with great interfaces and abstractions, other developers may be unaware of
them, or simply decide not to use them. Code linters can be very effective here.

For frontend projects, the [no-restricted-imports][3] ESLint rule and the
`@nrwl/nx/enforce-module-boundaries` rule to [impose constraints in Nx
projects][4] prevent the direct import of modules or dependencies that have a
different interface. When configured properly, this works pretty effective.

If a dependency (external or internal) is banned, the linter will yell when a
developer tries to import it directly. This should be the trigger to think about
the situation, look for the better solution, and keep the components more
decoupled.

## Further reading

Here are some other articles about related programming principles:

- [SOLID][5]
- [Leaky abstraction][6]
- [Separation of concerns][7]
- [The True Meaning of Technical Debt][8]

[1]: ./the-value-of-abstractions.svg
[2]:
  https://github.com/webpro/programming-principles#interface-segregation-principle
[3]: https://eslint.org/docs/latest/rules/no-restricted-imports
[4]: https://nx.dev/structure/monorepo-tags
[5]: https://en.wikipedia.org/wiki/SOLID
[6]: https://en.wikipedia.org/wiki/Leaky_abstraction
[7]: https://en.wikipedia.org/wiki/Separation_of_concerns
[8]: https://refactoring.fm/p/the-true-meaning-of-technical-debt