/* Local storage wrapper for modules */
define(function() {  
    var Storage = function(moduleId) {
        if('localStorage' in window && window['localStorage'] !== null){
            this.id = moduleId;
            // Init module storage if doesnt exist
            if(!localStorage.getItem(this.id)) {
                localStorage.setItem(this.id,[]);
            }

            // Get value for requested key
            this.get = function(key) {
                if(typeof localStorage.getItem(this.id) === "string" && localStorage.getItem(this.id).length > 0) return JSON.parse(localStorage.getItem(this.id))[key];
            }

            // Set new key/value pair
            this.set = function(key,value) {
                entry = {};
                // If value is a string, we encapsulate it inside an array
                if(typeof value === 'string') {
                    entry[key]=[];
                    entry[key].push(value);
                } else {
                    entry[key] = value;
                }
                localStorage.setItem(this.id,JSON.stringify(entry));
            },

            // Add value to existing key/value pair
            this.add = function(key,value) {
                var valuesArray = this.get(key);
                if(typeof valuesArray === "undefined"){
                    this.set(key,value);
                } else {
                    valuesArray.push(value);
                    this.set(key,valuesArray);
                }
            },

            // Remove value from existing key/value pair
            this.remove = function(key,value) {
                var valuesArray = this.get(key);
                if(typeof valuesArray !== "undefined"){
                    var itemIndex = valuesArray.indexOf(value);
                    valuesArray.splice(itemIndex,1);
                    this.set(key,valuesArray);
                }
            }
        }
    }
return Storage;
});
