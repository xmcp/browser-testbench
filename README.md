# Browser Testbench

This is the front-end project of "Real Pages" automated testing suite in ProxyLab from ICS  course, Peking University 2020.

You are assumed to have some basic understanding of React Hooks and modern JavaScript before contributing to this project.



## Setting Up

1. `apt install npm`, or manually download Node.js installer if you are using Windows.
2. `npm install`
3. To start a local dev server: `npm start`
4. To build production HTML into `build/` folder: `npm run build`



## Adding New Tests

1. Create a new `.js` file corresponding to your test in `src/predicates/` directory

2. Implement the testing script in a React component. Example:

   ```jsx
   // HelloWorld.js
   
   import {useEffect} from 'react';
   import {catcher, assert, rand, sleep} from '../utils';
   
   export function HelloWorldCheck({bench}) {
       useEffect(()=>{
           bench.log('Begin checking...', 'debug');
           catcher(bench, async ()=>{
               await sleep(200);
               
               let s = rand(4);
               assert(s.length == 4);
               
               bench.log('OK you passed the check!', 'success');
               bench.done(true);
           });
       }, []);
       
       return (
       	<div>
           	<h1>Hello World!</h1>
               <p>This test checks nothing and let you pass after 200ms.</p>
           </div>
       );
   }
   ```

   Learn the meaning of those functions in next section.

3. Register this component in `src/predicates/_manifest.js`:

   ```diff
    //...
   +import {HelloWorldCheck} from './HelloWorld';
    //...
   
    export const predicates=[
        // key, module, timeout (sec)
        
        //...
   +    ['hello-world', HelloWorldCheck, 1],
        //...
    ];
   ```

   Then this component will be registered as name `hello-world`, with a timeout of 1s.
   
4. You may need to change the driver code to reflect changees in the total score.



## Modifying existing tests

You just edit corresponding component and metadata in `src/predicates/_manifest.js`.



## APIs

The `bench` instance,  as a `prop` to your testing component, provides utility to report testing results.

- `bench.done(passed)`
  You invoke this method to finish the test and tell grader the result. `passed` is a boolean that indicates whether this test passes or fails. If this method is not invoked after timeout, the test automatically fails. It does nothing if the test is already finished.
- `bench.log(text, channel='info')`
  Put a log line. `text` is a string. `channel` can be `'info'`,  `'error'`, `'debug'` or `'success'`. Note that logs after test is finished (including timeout) is silently ignored. Logs of failing tests will be displayed by the grader, so your test should be verbose to make debugging easier.

We also provide some handy utility functions in `utils.js`:

- `rand(digits=8)`
  Returns a random numerical string with specific length. We recommend that a random string is included in request URLs to bypass caching functionality of browser and proxy.

- `catcher(inst, fn, onerror=()=>false)`
  Catches all unhandled exception, log error and fail the test in the given procedure. `inst` is the `bench` instance. `fn` is the procedure and it can be an async function. `onerror` is a function that will be called when an exception happens, and can return `true` to ignore this exception (no error will be logged and test will not fail).

- `assert(cond, err)`
  Use this inside `fn`  `catcher`. `if(!cond) throw new Error(err);`.

- `range(a, b)`

  Returns `[a, a+1, ..., b-1]`.

- `<NoCacheImg src onLoad onError bench>`
  A component that loads an image bypassing browser cache.

- `sleep(ms)`
  An async function that resolves after a given time.

- `str_repeat(s, n)`
  Returns `''+s+s+...+s`.



## License

```
        DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE 
                    Version 2, December 2004 

 Copyright (C) 2004 Sam Hocevar <sam@hocevar.net> 

 Everyone is permitted to copy and distribute verbatim or modified 
 copies of this license document, and changing it is allowed as long 
 as the name is changed. 

            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE 
   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION 

  0. You just DO WHAT THE FUCK YOU WANT TO.
```



**Good luck!**

Ako from Team NFO

