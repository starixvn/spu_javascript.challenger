const NodeCache = require( "node-cache" );
const cache = new NodeCache();

const defaultTtl = 300; //seconds

const getCache = key => cache.get(key);

const setCache = (key, value) => cache.set(key, value, 0);

const delCache = key =>  cache.del(key);

const changeTtlCache = (key, ttl = defaultTtl) => cache.ttl(key, ttl);

module.exports = {
    getCache,
    setCache,
    delCache,
    changeTtlCache
}
