import React from "react";

export default function JavaScriptDocumentation() {
  return (
    <div>
      <h1>JavaScript — Complete Technical Documentation</h1>

      <section>
        <h2>1. JavaScript Identity</h2>
        <ul>
          <li>High-level language</li>
          <li>Garbage-collected</li>
          <li>Dynamically typed</li>
          <li>Multi-paradigm</li>
          <li>Specification-driven (ECMAScript)</li>
          <li>Host-dependent behavior (browser, Node, etc.)</li>
        </ul>
      </section>

      <section>
        <h2>2. ECMAScript Specification</h2>
        <ul>
          <li>Defined by ECMA-262</li>
          <li>Yearly releases (ES2015+)</li>
          <li>Proposal stages (0–4)</li>
          <li>Backward compatibility guaranteed</li>
        </ul>
      </section>

      <section>
        <h2>3. JavaScript Engine Architecture</h2>
        <ul>
          <li>Parser (AST generation)</li>
          <li>Interpreter</li>
          <li>JIT Compiler</li>
          <li>Optimizer / Deoptimizer</li>
          <li>Garbage Collector</li>
        </ul>
      </section>

      <section>
        <h2>4. Execution Context</h2>
        <ul>
          <li>Global Execution Context</li>
          <li>Function Execution Context</li>
          <li>Eval Execution Context</li>
        </ul>
        <p>Each context contains:</p>
        <ul>
          <li>Lexical Environment</li>
          <li>Variable Environment</li>
          <li>this Binding</li>
        </ul>
      </section>

      <section>
        <h2>5. Call Stack</h2>
        <p>
          JavaScript executes code using a single call stack. Stack overflow
          occurs when the stack exceeds memory limits.
        </p>
      </section>

      <section>
        <h2>6. Memory Model</h2>
        <ul>
          <li>Stack (primitives, execution context)</li>
          <li>Heap (objects, functions, closures)</li>
        </ul>
      </section>

      <section>
        <h2>7. Garbage Collection</h2>
        <ul>
          <li>Mark-and-sweep</li>
          <li>Reference counting (historical)</li>
          <li>Reachability-based cleanup</li>
        </ul>
      </section>

      <section>
        <h2>8. Variables & Hoisting</h2>
        <ul>
          <li>var hoisted and initialized</li>
          <li>let/const hoisted but uninitialized</li>
          <li>Temporal Dead Zone</li>
        </ul>
      </section>

      <section>
        <h2>9. Data Types — Deep Dive</h2>

        <h3>Primitive Characteristics</h3>
        <ul>
          <li>Immutable</li>
          <li>Copied by value</li>
        </ul>

        <h3>Reference Characteristics</h3>
        <ul>
          <li>Mutable</li>
          <li>Copied by reference</li>
        </ul>
      </section>

      <section>
        <h2>10. typeof & Edge Cases</h2>
        <ul>
          <li>typeof null === "object"</li>
          <li>typeof NaN === "number"</li>
          <li>Arrays are objects</li>
          <li>Functions are callable objects</li>
        </ul>
      </section>

      <section>
        <h2>11. Equality Algorithms</h2>
        <ul>
          <li>Abstract Equality (==)</li>
          <li>Strict Equality (===)</li>
          <li>SameValue (Object.is)</li>
          <li>SameValueZero</li>
        </ul>
      </section>

      <section>
        <h2>12. Truthy & Falsy Values</h2>
        <ul>
          <li>false</li>
          <li>0, -0</li>
          <li>""</li>
          <li>null</li>
          <li>undefined</li>
          <li>NaN</li>
        </ul>
      </section>

      <section>
        <h2>13. Control Flow Internals</h2>
        <ul>
          <li>Short-circuit evaluation</li>
          <li>Fall-through in switch</li>
          <li>Labeled statements</li>
        </ul>
      </section>

      <section>
        <h2>14. Functions — Internals</h2>
        <ul>
          <li>Arguments object</li>
          <li>Rest parameters</li>
          <li>Default parameters</li>
          <li>Function.length</li>
          <li>Function.name</li>
        </ul>
      </section>

      <section>
        <h2>15. Arrow Functions</h2>
        <ul>
          <li>No own this</li>
          <li>No arguments object</li>
          <li>Not constructible</li>
          <li>Lexical binding</li>
        </ul>
      </section>

      <section>
        <h2>16. this Binding Rules</h2>
        <ul>
          <li>Default binding</li>
          <li>Implicit binding</li>
          <li>Explicit binding (call, apply, bind)</li>
          <li>new binding</li>
          <li>Arrow lexical binding</li>
        </ul>
      </section>

      <section>
        <h2>17. Closures</h2>
        <p>
          Closures preserve lexical environments, enabling private state and
          functional patterns.
        </p>
      </section>

      <section>
        <h2>18. Objects — Internals</h2>
        <ul>
          <li>[[Prototype]]</li>
          <li>Property descriptors</li>
          <li>Enumerable vs non-enumerable</li>
          <li>Writable / Configurable</li>
        </ul>
      </section>

      <section>
        <h2>19. Prototype Chain</h2>
        <ul>
          <li>Lookup mechanism</li>
          <li>Shadowing properties</li>
          <li>Performance implications</li>
        </ul>
      </section>

      <section>
        <h2>20. Classes — Internals</h2>
        <ul>
          <li>Syntactic sugar</li>
          <li>Strict mode enforced</li>
          <li>Methods on prototype</li>
          <li>Private fields (#)</li>
        </ul>
      </section>

      <section>
        <h2>21. Arrays — Internals</h2>
        <ul>
          <li>Sparse arrays</li>
          <li>Length property behavior</li>
          <li>Mutation vs non-mutation methods</li>
        </ul>
      </section>

      <section>
        <h2>22. Iteration Protocols</h2>
        <ul>
          <li>Iterable protocol</li>
          <li>Iterator protocol</li>
          <li>Symbol.iterator</li>
        </ul>
      </section>

      <section>
        <h2>23. Map / Set / WeakMap / WeakSet</h2>
        <ul>
          <li>Key identity</li>
          <li>Weak references</li>
          <li>Garbage collection behavior</li>
        </ul>
      </section>

      <section>
        <h2>24. Asynchronous Model</h2>
        <ul>
          <li>Event Loop</li>
          <li>Call Stack</li>
          <li>Task Queue</li>
          <li>Microtask Queue</li>
          <li>Job Queue</li>
        </ul>
      </section>

      <section>
        <h2>25. Promises — Internals</h2>
        <ul>
          <li>Pending / Fulfilled / Rejected</li>
          <li>Thenable resolution</li>
          <li>Promise chaining</li>
          <li>Promise.all / race / any / allSettled</li>
        </ul>
      </section>

      <section>
        <h2>26. async / await</h2>
        <p>Syntax sugar over Promises with automatic microtask scheduling.</p>
      </section>

      <section>
        <h2>27. Error Handling</h2>
        <ul>
          <li>Synchronous errors</li>
          <li>Asynchronous errors</li>
          <li>Unhandled promise rejections</li>
          <li>Error propagation</li>
        </ul>
      </section>

      <section>
        <h2>28. Modules</h2>
        <ul>
          <li>Static structure</li>
          <li>Live bindings</li>
          <li>Top-level await</li>
          <li>Module scope</li>
        </ul>
      </section>

      <section>
        <h2>29. Strict Mode</h2>
        <ul>
          <li>Eliminates silent errors</li>
          <li>Disallows unsafe features</li>
          <li>Changes this behavior</li>
        </ul>
      </section>

      <section>
        <h2>30. Metaprogramming</h2>
        <ul>
          <li>Proxy</li>
          <li>Reflect</li>
          <li>Symbols</li>
        </ul>
      </section>

      <section>
        <h2>31. Serialization</h2>
        <ul>
          <li>JSON.stringify</li>
          <li>JSON.parse</li>
          <li>Custom replacers</li>
        </ul>
      </section>

      <section>
        <h2>32. Security Model</h2>
        <ul>
          <li>Same-origin policy</li>
          <li>Capability-based APIs</li>
          <li>Sandboxing</li>
        </ul>
      </section>

      <section>
        <h2>33. Performance & Optimization</h2>
        <ul>
          <li>Hot paths</li>
          <li>Hidden classes</li>
          <li>Inline caching</li>
          <li>Deoptimization triggers</li>
        </ul>
      </section>

      <section>
        <h2>34. Common Design Patterns</h2>
        <ul>
          <li>Module</li>
          <li>Factory</li>
          <li>Observer</li>
          <li>Singleton</li>
          <li>Functional composition</li>
        </ul>
      </section>

      <section>
        <h2>35. Anti-Patterns</h2>
        <ul>
          <li>Implicit globals</li>
          <li>Overusing mutation</li>
          <li>Callback hell</li>
          <li>Leaky abstractions</li>
        </ul>
      </section>

      <section>
        <h2>36. JavaScript Philosophy</h2>
        <p>
          JavaScript favors pragmatism over purity, flexibility over strictness,
          and evolution without breaking the past.
        </p>
      </section>

      <section>
        <h2>37. Final Note</h2>
        <p>
          Mastery of JavaScript comes from understanding its runtime behavior,
          not just its syntax.
        </p>
      </section>
    </div>
  );
}
