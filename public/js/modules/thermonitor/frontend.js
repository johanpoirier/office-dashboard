/**
 * Thermonitor frontend controller
 */
define([ "office", "hbs!modules/thermonitor/template", "moment"],
    function (Office, template, moment) {

        var thermonitorModule = Office.Module.extend({

            listen: function () {
                this.socket.emit(this.config["id"] + ":screen");
                this.socket.on(this.config["id"] + ":measures", this.displayMeasures.bind(this));
            },

            displayMeasures: function (measures) {
                console.info("[" + this.config["id"] + "] " + measures.length + " measures to display");

                if (measures.length > 0) {
                    // format measures dates with moment
                    measures.forEach(function (data) {
                        var measureDate = moment(data["date"]);
                        data["date"] = measureDate.fromNow();
                        data["temperature"] = parseFloat(data["temperature"]).toFixed(1);
                    });

                    // render
                    this.el.html(template({
                        "measure": measures[0]
                    }));
                }
            }
        });

        return thermonitorModule;
    }
);