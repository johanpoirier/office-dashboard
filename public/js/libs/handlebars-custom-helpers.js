/* Handlebars Custom Helpers collection */
define(['module', 'handlebars'], function (module, Handlebars) {

    /**
     * This helper provides a if inline comparing two values.
     *
     * Copyright RestHub
     */
    Handlebars.registerHelper('ifequalsinline', function (value1, value2, returnValTrue, options) {
        var returnValFalse = '';
        if (arguments.length == 5) {
            returnValFalse = options
        }
        return (value1 === value2) ? returnValTrue : returnValFalse;
    });

    /**
     * This helper provides a if comparing two values
     *
     * If only the two values are strictly equals ('===') display the block
     *
     * Usage:
     *        {{#ifequals type "details"}}
     *            <span>This is details page</span>
     *        {{/ifequals}}
     *
     * Copyright RestHub
     */
    Handlebars.registerHelper('ifequals', function(value1, value2, options) {
        if (value1 === value2) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });

    /* Truncate long strings without cutting words */
    Handlebars.registerHelper('truncate', function (str, len) {
        if (str.length > len && str.length > 0) {
            var new_str = str + " ";
            new_str = str.substr(0, len);
            new_str = str.substr(0, new_str.lastIndexOf(" "));
            new_str = (new_str.length > 0) ? new_str : str.substr(0, len);
            return new Handlebars.SafeString(new_str + '...');
        }
        return str;
    });

    /* Repeat */
    Handlebars.registerHelper('repeat', function (nb, options) {
        var fn = options.fn, inverse = options.inverse;
        var i = 0, ret = "", data = {};

        if (nb && !isNaN(nb)) {
            for (i = 0; i < nb; i++) {
                if (data) {
                    data.index = i;
                    data.first = (i === 0);
                    data.last = (i === (nb - 1));
                }
                ret = ret + fn(this, { data: data });
            }
        }

        if (i === 0) {
            ret = inverse(this);
        }

        return ret;
    });

    return Handlebars;
});
