/**
 * metaweb.js: 
 *
 * This file implements a Metaweb.read() utility function using a <script>
 * tag to generate the HTTP request and the URL callback parameter to
 * route the response to a specified JavaScript function.
 *
 * Depends on lib/json2.pack.js
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
    var querytext = encodeURIComponent(JSON.stringify(envelope));

    // Build the URL using encoded query text and the callback name
    var url = Metaweb.HOST + Metaweb.QUERY_SERVICE +  
        "?queries=" + querytext + "&callback=Metaweb." + callbackName

    // Create a script tag, set its src attribute and add it to the document
    // This triggers the HTTP request and submits the query
    var script = document.createElement("script");
    script.src = url
    document.body.appendChild(script);
};