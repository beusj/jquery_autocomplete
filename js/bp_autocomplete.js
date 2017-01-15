
  var BP_SEARCH_SERVER = "http://data.bioontology.org";
  var LIST_ONTOLOGY = "SNOMEDCT"
  
  $( function() {

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

    function split( val ) {
      var test = val.split( /;\s*/ );
      // console.log(test);
      return test;
    }

    function extractLast( term ) {
      return split( term ).pop();
    }

    function removeLast( term ) {
      return split( term ).splice(0,-1);
    }




    //Still need to figure out how to append new results

    function formatSelect ( event, ui ) {
      // var terms = split( this );
      var prev = split($(this).html()).slice(0,-1)

        var spanForm = "<span contenteditable=false style='color:blue' id=" +
          encodeURI(ui.item.id) +
          " uri=" +
          encodeURI(ui.item.uri) +
          " cui=" +
          encodeURI(ui.item.cui) +
          " synonym=" +
          encodeURI(ui.item.synonym) +
           ">" +
          ui.item.value + 
          "</span>" +
          ("; ") ;
        // if (spans.length == 0) {
      prev.push(spanForm);

          $(this).html(prev.join("; "));
        // } else {
          // $(this).html(me[0].outerHTML + spanForm + "; ")
          // $(this).append(spanForm + "; ")
          // spans.append(spanForm + "; ")
        // }
        console.log($("#ac").html())
        return false;
      }

    $( "#ac" )
      .on( "keydown", function( event ) {
        if ( event.keyCode === $.ui.keyCode.TAB &&
            $( this ).autocomplete( "instance" ).menu.active ) {
          event.preventDefault();
        }
      })
      .autocomplete({
        source: function(request,response) {
          $.getJSON(BP_SEARCH_SERVER +
            "/search?q=" +  
            encodeURI(split(request.term).pop()) +
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
        focus: function() {
            // prevent value inserted on focus
            return false;
        }
        ,
        select: formatSelect
      }
    );
  })