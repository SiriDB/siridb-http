/*
Create by Jeroen van der Heijden
Version 0.0.1
*/

'use strict';

(function () {
    var oz = {},
        EMAIL = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    oz.isEmail = function (s) {
        return EMAIL.test(s);
    };

    oz.isBlank = function (s) {
        return (!s || /^\s*$/.test(s));
    };

    oz.formatSize = function (size) {
        var lookupTable = 'BKMGTPEZYXWVU';
        if (size > 0) {
            var i = Math.min(Math.floor(Math.log(size)/Math.log(1024)), 12),
                n = Math.round(size * 100 / Math.pow(1024, i)) / 100;
            if (i) {
                return n + ' ' + lookupTable.charAt(i) + 'B';
            } else {
                return n + ' bytes';
            }
        }
        return '0 bytes';
    };

    oz.formatLongNumber = function (n) {
        // code from http://stackoverflow.com/questions/3883342/add-commas-to-a-number-in-jquery
        n = n.toString();
        if (n >= Math.pow(10, 6)) {
            while (/(\d+)(\d{3})/.test(n)) {
                n = n.replace(/(\d+)(\d{3})/, '$1'+','+'$2');
            }
        }
        return n;
    };

    oz.sortOn = function (a, w) {
        var i, l, p, c, item, n = [];

        for (i=0, l=a.length; i < l; i++) {
            item = a[i];
            for (p=0, c=n.length; p < c; p++) {
                if (item[w] < n[p][w]) {
                    break;
                }
            }
            n.splice(p, 0, item);
        }

        return n;
    };

    oz.count = function (a, v) {
        var i, l, count=0;
        for (i=0, l=a.length; i < l; i++) {
            if (a[i] === v) { count++; }
        }
        return count;
    };

    window.oz = oz;

})();


