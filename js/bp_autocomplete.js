
  var BP_SEARCH_SERVER = "http://data.bioontology.org";
  var LIST_ONTOLOGY = "SNOMEDCT"
  

  //https://bioportal.bioontology.org/search/json_search/?q=adrenal&ontologies=SNOMEDCT&response=json

    /*function requestData(q) {
        if (!options.matchCase) q = q.toLowerCase();
        var data = options.cacheLength ? loadFromCache(q) : null;
        // recieve the cached data
        if (data) {
          receiveData(q, data);
        // if an AJAX url has been supplied, try loading the data now
        } else if( (typeof options.url == "string") && (options.url.length > 0) ){
          $.getJSON(makeUrl(q)+"&response=json&callback=?", function(data) {
    //                alert(data.data)
            data = parseData(data.data);
            addToCache(q, data);
            receiveData(q, data);
          });
        // if there's been no data found, remove the loading class
        } else {
          $input.removeClass(options.loadingClass);
        }
      };

      function makeUrl(q) {
        var url = options.url + "?q=" + encodeURI(q);
        for (var i in options.extraParams) {
          url += "&" + i + "=" + encodeURI(options.extraParams[i]);
        }
        return url;
      };*/
// http://stackoverflow.com/questions/20623123/links-in-contenteditable-div

  $( function() {
    function log( message ) {
      $( "<div>" ).text( message ).prependTo( "#log" );
      $( "#log" ).scrollTop( 0 );
    }

    function parseData(data) {
      if (!data) return null;
      var parsed = [];
      // data = data.responseJSON.collection
      for (var i=0; i < data.length; i++) {
        result = {};
        var line = data[i]
        result['id'] = line.prefLabel;
        result['value'] = line.prefLabel;
        result['uri'] = line["@id"];
        result['cui'] = (line.cui) ? line.cui[0]:"";
        result['synonym'] = (line.synonym) ? line.synonym[0]:""; //if not an avaiolable property, leave blank
        parsed.push(result)
      }
      return parsed;
    }


    $( "#ac" ).autocomplete({
      source: function(request,response) {
        $.getJSON(BP_SEARCH_SERVER +
          "/search?q=" +  
          encodeURI(request.term) +
          "&ontologies="  +
          encodeURI(LIST_ONTOLOGY) +
          "&suggest=true" +
          "&format=jsonp" +
          "&callback=?"
          // apikey: encodeURI("879f0065-476f-4769-8765-3d8a44a6dde1")
        ,
        function(data) {
            // console.log(data);
            data = parseData(data.collection);
            // console.log(data);
            response(data);
          }
        )
      },
      minLength: 3
      ,
      // select: function(event, ui) {
      //   ("<a href=" + ui.item.url + ">" + ui.item.value + "</a>")
      // }
      select: function( event, ui ) {
        $("#ac").html("<span contenteditable=false style='color:blue' id=" +
          encodeURI(ui.item.id) +
          " uri=" +
          ui.item.uri +
          " cui=" +
          ui.item.cui +
          " synonym=" +
          encodeURI(ui.item.synonym) +
           ">" +
          ui.item.value + "</a>");
        console.log($("#ac").html())
        return false;
        // $("#log").text(ui.item.value);
      }
    });
  })