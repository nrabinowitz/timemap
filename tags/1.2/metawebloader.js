/**
 * metaweb.js: 
 *
 * This file implements a Metaweb.read() utility function using a <script>
 * tag to generate the HTTP request and the URL callback parameter to
 * route the response to a specified JavaScript function.
 *
 * This file was pulled directly from the Freebase API site:
 * http://www.freebase.com/view/freebase/api
 **/
var Metaweb = {};                               // Define our namespace
Metaweb.HOST = "http://www.freebase.com";       // The Metaweb server
Metaweb.QUERY_SERVICE = "/api/service/mqlread"; // The service on that server
Metaweb.counter = 0;                            // For unique function names

// Send query q to Metaweb, and pass the result asynchronously to function f
Metaweb.read = function(q, f) {
    // Define a unique function name
    var callbackName = "_" + Metaweb.counter++

    // Create a function by that name in the Metaweb namespace.
    // This function expects to be passed the outer query envelope.
    // If the query fails, this function throws an exception.  Since it
    // is invoked asynchronously, we can't catch the exception, but it serves
    // to report the error to the JavaScript console.
    Metaweb[callbackName] = function(outerEnvelope) {
        var innerEnvelope = outerEnvelope.qname;         // Open outer envelope
        // Make sure the query was successful.
        if (innerEnvelope.code.indexOf("/api/status/ok") != 0) {  // Check for errors
          var error = innerEnvelope.messages[0]          // Get error message
          throw error.code + ": " + error.message      // And throw it!
        }
        var result = innerEnvelope.result;   // Get result from inner envelope
        document.body.removeChild(script);   // Clean up <script> tag
        delete Metaweb[callbackName];        // Delete this function
        f(result);                           // Pass result to user function
    };

    // Put the query in inner and outer envelopes
    envelope = {qname: {query: q}}

    // Serialize and encode the query object
    var querytext = encodeURIComponent(JSON.serialize(envelope));

    // Build the URL using encoded query text and the callback name
    var url = Metaweb.HOST + Metaweb.QUERY_SERVICE +  
        "?queries=" + querytext + "&callback=Metaweb." + callbackName

    // Create a script tag, set its src attribute and add it to the document
    // This triggers the HTTP request and submits the query
    var script = document.createElement("script");
    script.src = url
    document.body.appendChild(script);
};

// This object holds our parse and serialize functions
var JSON = {}; 

// The parse function is short but the validation code is complex.
// See http://www.ietf.org/rfc/rfc4627.txt
JSON.parse = function(s) {
    try {
        return !(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(
                                   s.replace(/"(\\.|[^"\\])*"/g, ''))) &&
            eval('(' + s + ')');
    }
    catch (e) {
        return false;
    }
};

// Our JSON.serialize() function requires a number of helper functions.
// They are all defined within this anonymous function so that they remain
// private and do not pollute the global namespace.
(function () {
    var m = {  // A character conversion map
            '\b': '\\b', '\t': '\\t',  '\n': '\\n', '\f': '\\f',
            '\r': '\\r', '"' : '\\"',  '\\': '\\\\'
        },
        s = { // Map type names to functions for serializing those types
            'boolean': function (x) { return String(x); },
            'null': function (x) { return "null"; },
            number: function (x) { return isFinite(x) ? String(x) : 'null'; },
            string: function (x) {
                if (/["\\\x00-\x1f]/.test(x)) {
                    x = x.replace(/([\x00-\x1f\\"])/g, function(a, b) {
                        var c = m[b];
                        if (c) {
                            return c;
                        }
                        c = b.charCodeAt();
                        return '\\u00' +
                            Math.floor(c / 16).toString(16) +
                            (c % 16).toString(16);
                    });
                }
                return '"' + x + '"';
            },
            array: function (x) {
                var a = ['['], b, f, i, l = x.length, v;
                for (i = 0; i < l; i += 1) {
                    v = x[i];
                    f = s[typeof v];
                    if (f) {
                        v = f(v);
                        if (typeof v == 'string') {
                            if (b) {
                                a[a.length] = ',';
                            }
                            a[a.length] = v;
                            b = true;
                        }
                    }
                }
                a[a.length] = ']';
                return a.join('');
            },
            object: function (x) {
                if (x) {
                    if (x instanceof Array) {
                        return s.array(x);
                    }
                    var a = ['{'], b, f, i, v;
                    for (i in x) {
                        v = x[i];
                        f = s[typeof v];
                        if (f) {
                            v = f(v);
                            if (typeof v == 'string') {
                                if (b) {
                                    a[a.length] = ',';
                                }
                                a.push(s.string(i), ':', v);
                                b = true;
                            }
                        }
                    }
                    a[a.length] = '}';
                    return a.join('');
                }
                return 'null';
            }
        };

    // Export our serialize function outside of this anonymous function
    JSON.serialize = function(o) { return s.object(o); };
})(); // Invoke the anonymous function once to define JSON.serialize()