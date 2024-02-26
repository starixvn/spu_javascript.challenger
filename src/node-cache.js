const NodeCache = require( "node-cache" );
const cache = new NodeCache();

const keyChallenge = 'js-challenge-key';
const defaultTtl = 300; //seconds

const getCache = (key = keyChallenge) =>{
    try{
        if(cache.has(key)){ 
            return cache.get(key);
        }
    
        return null;
    }catch(err){
        console.error(err)
        cache.close();
    }
    
};

const setCache = (value, key = keyChallenge, ttl = defaultTtl) =>{
    try{
        cache.set(key, value, ttl);
    }catch(err){
        console.error(err)
        cache.close();
    }
};


const delCache = (key = keyChallenge) =>{
    try{
        cache.del(key);
    }catch(err){
        console.error(err)
        cache.close();
    }
}

const changeTtlCache = (key = keyChallenge, ttl = defaultTtl) =>{
    try{
        cache.ttl(key, ttl);
    }catch(err){
        console.error(err)
        cache.close();
    }
};

module.exports = {
    getCache,
    setCache,
    delCache,
    changeTtlCache
}
