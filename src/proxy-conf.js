var ProxyConf = {

    getProxyConf: function (config) {
        var proxy = false;

        var proxyOpt = process.argv.some(function(arg) {
            return arg === "-proxy";
        });

        if (proxyOpt && config["proxy_host"] && config["proxy_host"].length > 0 && config["proxy_port"]) {
            proxy = {
                "host": config["proxy_host"],
                "port": config["proxy_port"],
                "url": "http://" + config["proxy_host"] + ":" + config["proxy_port"]
            }
            proxy.bypass = function (url) {
                if (config["proxy_bypass"] && config["proxy_bypass"].length > 0) {
                    var bypassUrls = config["proxy_bypass"].split(",");
                    var bypass = false;
                    bypassUrls.forEach(function(bypassUrl) {
                        bypass = bypass || (url.match(bypassUrl.replace(/\./g, "\\.").replace(/\*/g, ".*")));
                    });
                    return bypass;
                }
                else {
                    return false;
                }
            }
        }
        return proxy;
    }
}

module.exports = ProxyConf;