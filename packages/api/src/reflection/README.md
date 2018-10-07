# Halloween 2018 API - /src/reflection/
## Metaprogramming And You - A Crash Course
The reflection package here is used to do some of the "magic" behind-the-scenes work, particularly the stuff related to `@Decorators`.
### Javascript/Typescript class
Classes are just constructor functions. Class instances have a `constructor` field that refers to that function.
Class instances also have a `__proto__` prototype that refers to the `Constructor`'s `prototype`.

### Symbols
Symbols are a lot like strings. They can be used as object properties. eg:
```js
const foo = {};
foo["bar"] = "foobar";
```
or with symbols
```js
const bar = Symbol("bar");
const foo = {};
foo[bar] = "foobar";
```
We use these for reflection purposes because symbols are as unique as you need them to be, so we won't run over anyone else's
toes that may be using keys on that object. Additionally, they don't show up in places you're not looking for them (like
object.keys, or `for . . . in` loops), so they're ideal for storing this kind of "hidden" information on objects.

### Decorators
The general idea with the setup here is that there are several decorators: `@Component`, `@Controller`, `@Route` that
are used to flag classes or methods as being useful to the application. These decorators attach certain symbols
to objects and classes (constructor functions and prototypes) as needed so that things like the `ComponentRegistrar` can
come along and find them.

| Decorator | Type | Meaning |
| --- | --- | --- |
| `@Component()` | Class | Mark a class to be instantiated by the DI container using its constructor. The class will be registered using its `camelCase` name. |
| `@Route(route: string)` | Method | Designate a method as a handler for the given webserver route. The method will be invoked with the correct `this` context, and can declare DI dependencies in its signature.|
| `@Controller` | Class | Designate a class as a controller. Note that a class with more than zero `@Route` decorated methods will also be marked as a `@Controller`. |

### Symbols
[Symbols.ts](./Symbols.ts) exports a list of shared symbols

| Symbol | Found On | Data Type | Meaning |
| --- | --- | --- | --- |
| `isScannable` | Class | Boolean | If true, a class is scannable (ie: some kind of component) |
| `isRoutable`  | Method | Boolean | If true, a method is "routable" (ie: can handle webserver requests) |
| `isRouter` | Class | Boolean | If true, a class is a controller. |
| `targetRoute` | Method | String | Indicates the route associated with a routable method |
| `decoratedType` | Method or Class | DecoratedTypes | Indicates what type of thing is being looked at (class, method) |
| `routableMethods` | Object | IRoutableMethod[] | List of `@Route` decorated methods on this controller |










