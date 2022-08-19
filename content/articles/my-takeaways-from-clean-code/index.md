---
published: 2013-05-28
modified: 2022-02-26
description:
  Any serious programmer will pick up something useful from reading this book.
  Highly recommended!
image: ./clean-code.webp
---

# My takeaways from "Clean Code"

> To write clean code, you must first write dirty code and then clean it.

With pleasure I have been reading [Clean Code][1] by [Robert C. Martin][2]. The
book is a nice read, with short chapters. However, just reading the book has no
value. You will need to recognize the _"smells and heuristics"_ in your day to
day work, and act on them. This requires labor and dedication, which will
gradually enhance your level of experience. The power of this book, at least to
me, lies in defining and describing many heuristics, making them easier to
recognize.

![clean-code][3]

The book is full of takeaways, and below is a small selection from the book that
drew my attention most.

## Flag arguments are ugly

Perhaps the only exception is for specific setters that directly set the value
of an object property (flag?) itself. But I have to agree that flags implicitly
mean that the method is probably doing too much (e.g. there is no Command Query
Separation).

## Minimize the number of arguments

I had seen the term of _dyadic functions_ before, but the term "dyadic" is
hardly used in programming conversations. I also think that when you do use the
term, you still have to explain what it means! Let alone "dyads" and "triads"...

Anyway, it is always a good programming advice to minimize the number of
arguments. Zero or one argument is easiest to understand and maintain.

## Have no side effects

Very valuable advice. Simple to understand, and shouldn't be too hard to
implement. Probably sometimes side effects happen when writing a method at
first, but during refactoring such "lies" should be taken care of, and removed.

## Avoid output arguments

Output arguments are objects that the method operates on, and then returns. An
example:

    extendWall(h);

Does this function extend "h" with a wall? Or is the wall extended with "h"? And
what would it return? It's more clear to use "this" as the output argument:

    h.extendWall();

## Command Query Separation

Functions should either do something or answer something. That's practical and
clear advice.

## Comments are fails

> Truth can only be found in one place: the code.

The author has a clear opinion on comments. He considers every single comment
written as a failure, because the code apparently isn't expressive enough. One
reason, which is hard to deny, is that comments are often badly maintained.
Investing time in proper and descriptive naming in the code is a rewarding
practice. Still, I think it's fine to explain the "why" of code where code alone
simply is not expressive enough to easily understand what's going on. But the
takeaway here to me is that "the only truth is in the code".

## The purpose of formatting

> Your style and discipline survives, even though your code does not.

I'm a big advocate of clear coding standards, but I didn't take it as far as
this. But ultimately, I think this is true. Maintainability and extensibility
are always top priority, more so than some implementation details. Still,
conventions alone will take you nowhere.

## Don't pass null

Simply do not return or pass `null`. It's better to use "empty" versions of the
type that's being expected, e.g. an empty array, string or object. This way, the
receiving code doesn't have to check the type. Unless you are writing some
public, robust API. But internally, it saves a lot of exception handling to
minimize such usage of `null` values.

## Learning tests are better than free

Writing (unit) tests are an absolutely smart way to learn and exercise a (new)
interface. It gives a feel about something you need to learn anyway. Tests from
both simple and exercising production code can serve as documentation along the
way.

## Tests enable the -ilities

> It's the tests that keep our code flexible, maintainable, and reusable \[...]
> Because tests enable change.

Think about that for a while, and probably you will appreciate tests even more.

## Getting clean via emergent design

Any design is considered "simple" if it:

1.  Runs all the tests
2.  Contains no duplication
3.  Expresses the intent of the programmer
4.  Minimizes the number of classes and methods

Making a system testable motivates (or forces) to implement established
programming principles, which leads to better designs. Then, the rest follows
with incremental refactorings which can be done because of the tests. The
takeaway for me here is that tests both motivate and catalyse refactoring to
better designs.

## Conclusion

There are many more principles, patterns, and practices in the book. This list
summarizes what stood out for me most. I think any serious programmer will pick
up something useful from reading this book. Highly recommended!

[1]:
  http://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882
[2]: http://en.wikipedia.org/wiki/Robert_Cecil_Martin
[3]: ./clean-code.svg
