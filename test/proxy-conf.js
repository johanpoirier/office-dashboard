var assert = require("assert");
var ProxyConf = require(__dirname + "/../src/proxy-conf");
var config = require(__dirname + '/config.json');

describe('ProxyConf', function () {
    describe('#getProxyConf()', function () {
        it('proxy should be initialized', function () {
            var proxy = ProxyConf.getProxyConf(config, true);
            assert.equal("http://proxy.priv.atos.fr:3128", proxy["url"]);
        });
    });
});