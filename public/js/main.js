$(document).ready(function () {
    Clock.start();
});

var Loader = {
    loader: $('#loader'),
    show: function () {
        this.loader.siblings('div').hide();
        this.loader.show();
    },
    hide: function () {
        this.loader.siblings('div').show();
        this.loader.hide();
    }
};

var Clock = {
    $el: {
        digital: {
            time: $('#time'),
            date: $('#date')
        }
    },

    weekdays: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
    months: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],

    timeParts: function () {
        var date = new Date(),
            hour = date.getHours();

        return {
            // Digital
            day: Clock.weekdays[date.getDay()],
            date: date.getDate(),
            month: Clock.months[date.getMonth()],
            hour: Clock.appendZero(hour),
            minute: Clock.appendZero(date.getMinutes()),
            second: Clock.appendZero(date.getSeconds())
        };
    },

    appendZero: function (num) {
        if (num < 10) {
            return "0" + num;
        }
        return num;
    },

    refresh: function () {
        var parts = Clock.timeParts(12);
        Clock.$el.digital.date.html(parts.day + ' ' + parts.date + ' ' + parts.month);
        Clock.$el.digital.time.html("<span class='hour'>" + parts.hour + "</span> : " + "<span class='minute'>" + parts.minute + "</span>" + " : <span class='second'>" + parts.second + "</span");
    },

    start: function () {
        Loader.hide();

        if (Clock._running) {
            clearInterval(Clock._running);
        }

        Clock._running = setInterval(function () {
            Clock.refresh();
        }, 1000);
        Clock.refresh();
    }
};
