const should = require('chai').should();
const Context = require('../async-context').Context;
const ks = require('kitchen-sync');

// a simple object with a single function that works as a callback or promise
const makeSimpleObject = ()=>{
    let callCount = 0;
    let simpleObject = {
        fn : (item, cb)=>{
            const callback = ks(cb);
            callCount++;
            setTimeout(()=>{
                callback(null, callCount);
            });
            return callback.return;
        }
    }
    return simpleObject;
}



describe('async-context', ()=>{
    describe('can chain contexts', ()=>{
        it('works as a promise', (done)=>{
            let chain = Context.wrap(makeSimpleObject());
            chain.fn({}).fn({}).fn({}).promise.then((result)=>{
                should.exist(result);
                result.should.equal(3);
                done();
            }).catch((ex)=>{
                should.not.exist(ex);
            });
        });

        it('works as a callback', (done)=>{
            let chain = Context.wrap(makeSimpleObject());
            chain.fn({}).fn({}).fn({}, (err, result)=>{
                should.not.exist(err);
                should.exist(result);
                result.should.equal(3);
                done();
            });
        });
    });
});
