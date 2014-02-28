/* Handlebars Custom Helpers collection */
define(['module', 'handlebars'], function (module, Handlebars) {

    /**
     * This helper provides a if inline comparing two values.
     *
     * Copyright RestHub
     */
    Handlebars.registerHelper('ifequalsinline', function(value1, value2, returnValTrue, options) {
        var returnValFalse = '';
        if(arguments.length == 5) {returnValFalse = options}
        return (value1 === value2) ? returnValTrue : returnValFalse;
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

    return Handlebars;
});
