---
published: 2022-08-19
modified: 2023-10-14
description:
  The more expensive it is to refactor or replace a component in the system, the
  more value it has to design an interface to abstract the implementation away.
image: ./connected-particles-in-abstract-style.webp
tags: value, abstraction, interface, refactoring, system, design, implementation
---

# The value of abstractions

In software systems, maintenance quickly becomes harder as more components are
added. Given a well-designed system, when a component deteriorates, it should be
possible to refactor or replace it without major impact on other component in
the system. Following this principle, components should separate concerns
clearly with well-designed interfaces.

This article discusses some considerations in the process of designing a complex
system and its components.

## Minimize the cost of change

Over time, implementations and underlying dependencies will change, but the
interfaces should remain stable. Changes to a component's implementation should
have minimal impact on other components in the system.

> An interface should depend on the code that calls it, not its implementation.

Let's take an example component "C" in our system. The deeper and more
frequently C is integrated into the system, the more important its interface
becomes. When considering the cost of C, it may help to ask ourselves questions
like this:

- Is it hard to refactor without affecting other components?
- Is it hard to replace within the structure?
- Is it hard to replace its underlying dependencies?
- Is it hard to build another feature with an alternative of C?

Answering "yes" means more coupling of other components towards C. This means
the project is harder to maintain, increasing the cost of C.

This may also indicate a leaky abstraction, if C fails to encapsulate and hide
its underlying implementation details.

In short: there's value in having the right abstraction for C.

> The more expensive it is to refactor or replace a component in the system, the
> more value it has to design an interface to abstract the implementation away.

One of the hardest part of system design is to work out the modularity of the
system, and seeing what components benefit the most from an abstraction.

Is a component large and complex, perhaps resembling more of a framework? If you
know upfront a potential refactoring is hardly feasible then an abstraction is
likely not worth it. In that case, maybe you need to take a step back and
reconsider the modularity of the system as a whole. Is it possible to increase
its modularity, and lower the cost of changes that will inevitably be necessary
over time? What are the trade-offs when going all-in on the framework?

On the other hand, excessive component fragmentation leads to an over-engineered
system with too many moving parts and interrelationships.

This balancing act between under- and over-engineering can be a tough cookie.
When the overall structure is largely in place, the process of interface design
comes down to iteration until all questions above are answered with "no".

Perhaps ironically, this article itself is abstract, and the actual process of
software design itself may feel distant or overrated. Yet taking the time to
think and design before and during ambitious projects pays off in the long run
as it will reduce maintenance complexity and facilitate system evolution.

## Enforce module boundaries

Going from less abstract to more concrete at some point means moving into lower
level module boundaries. Here, it becomes essential to enforce and guard module
boundaries. Even the best interfaces and abstractions may go unnoticed by fellow
developers. How to prevent boundaries from being crossed? Depending on the
technology stack of choice, tooling might be available to guard certain layers
of modularity. At the level of code and configuration, linters may prove very
effective.

### Examples: ESLint & Nx

Within the JavaScript and Node.js ecosystem, a great example of such a linter is
ESLint. Relevant rules include the built-in [no-restricted-imports][1] and Nx's
[@nrwl/nx/enforce-module-boundaries][2] rule.

They help to [enforce module boundaries][3] and prevent direct imports of
underlying modules or dependencies, and suggest to use the provided abstraction
instead.

When properly configured, tools like this effectively encourage developers to
think about the system and its components, and consider the usage and value of
abstractions.

## Further reading

Resources about related programming principles:

- [Interface Segregation Principle][4]
- [SOLID][5]
- [Leaky abstraction][6]
- [Separation of concerns][7]
- [The True Meaning of Technical Debt][8]

[1]: https://eslint.org/docs/latest/rules/no-restricted-imports
[2]: https://nx.dev/nx-api/eslint-plugin/documents/enforce-module-boundaries
[3]: https://nx.dev/features/enforce-module-boundaries
[4]:
  https://github.com/webpro/programming-principles#interface-segregation-principle
[5]: https://en.wikipedia.org/wiki/SOLID
[6]: https://en.wikipedia.org/wiki/Leaky_abstraction
[7]: https://en.wikipedia.org/wiki/Separation_of_concerns
[8]: https://refactoring.fm/p/the-true-meaning-of-technical-debt
