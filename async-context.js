
const isPromise = v => typeof v === 'object' && typeof v.then === 'function';
var Context = function(obj) {
    this.target = obj;
    this.work = null;
}
Context.prototype = {
    has: function(name){ return name in this.target; },
    get: function(target, name, receiver){
        let ob = this;
        let value = this.target[name];
        if(name === 'promise' || name === 'complete'){
            let reject = null;
            let resolve = null;
            let promise = new Promise((rslv, rjct)=>{
                reject = rjct;
                resolve = rslv;
            });
            ob.work.push((err, result)=>{
                if(err) return reject(err);
                resolve(result);
            });
            return promise;
        }
        if(typeof value === 'function'){
            return function(){
                let args = Array.prototype.slice.call(arguments);
                let accumulateWork = (err, result)=>{
                    if(ob.work.length){
                        ob.work.shift()(err, result)
                    }
                };
                let addWork = (value, args)=>{
                    if(ob.work){
                        ob.work.push((err, result)=>{
                            value.apply(value, args);
                        });
                    }else{
                        //todo: maybe detach?
                        value.apply(value, args);
                        ob.work = [];
                    }
                }
                if( //is it a callback?
                    typeof args[args.length-1] === 'function'
                ){
                    let cb = args[args.length-1];
                    args[args.length-1] = accumulateWork;
                    addWork(value, args);
                    ob.work.push(cb);
                }else{
                    args.push(accumulateWork);
                    addWork(value, args);
                }
                return receiver;
            }
        }
        return value;
    },
    set: function(rcvr, name, val){
        //context is emergent, not something you can set
        return true;
    },
    'delete': function(name){
        //context is emergent, not something you can delete
     },
    enumerate: function(){
        var res = [];
        for(var key in this.target.ordering) res.push(key);
        return res;
    },
    iterate: function() {
        var props = this.enumerate(), i = 0;
        return {
            next: function() {
                if (i === props.length) throw StopIteration;
                return props[i++];
            }
        };
    },
    keys: function() { return Object.keys(this.target); },
};
Context.wrap = function(obj) {
    return new Proxy(Object.getPrototypeOf(obj), new Context(obj));
};

module.exports = {
    Context : Context
};
