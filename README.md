async-contexts
==============

There are cases where you want a chainable context, but you also **don't** want to choose between promises or callbacks, you don't want a broken call stack, and you don't want to have an extra function on the chain. That's where this library comes in.


Usage
-----

```javascript
let count = 0;
let context = {
    fn : ()=>{ count ++ }
}
const ac = require('async-context');
let chain = new ac.Chain(context);
// chain now proxies calls into context, but first sets off a race. if a 0timeout calls before we receive a callback and context now has a reference to the internal promise at chain.complete
// work is executed sequentially, via queue
chain.fn({}).fn({}).fn({}).fn({}, (err, value)=>{
    //value === 4
});

chain.fn({}).complete.then(()=>{

});

let asyncContext = async ()=>{
    return await chain.fn({}).complete
}

try{
    let value = await chain.fn().fn().fn().complete;
}catch(ex){

}

```
