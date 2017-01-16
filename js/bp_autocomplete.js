//autcomplete function
//#to-do
// - generalize to other content types
  var BP_SEARCH_SERVER = "http://data.bioontology.org";
  var LIST_ONTOLOGY = "SNOMEDCT";
  
  $( function() {

    function parseData(data) {
      if (!data) return null;
      var parsed = [];
      // data = data.responseJSON.collection
      for (var i=0; i < data.length; i++) {
        result = {};
        var line = data[i];
        result.id = line.prefLabel;
        result.value = line.prefLabel;
        result.uri = line["@id"];
        result.cui = (line.cui) ? line.cui[0]:"";
        result.synonym = (line.synonym) ? line.synonym[0]:""; //if not an avaiolable property, leave blank
        parsed.push(result);
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

// return caret to end of line
// http://stackoverflow.com/questions/4233265/contenteditable-set-caret-at-the-end-of-the-text-cross-browser
    function placeCaretAtEnd(el) {
        el.focus();
        if (typeof window.getSelection != "undefined"
                && typeof document.createRange != "undefined") {
            var range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (typeof document.body.createTextRange != "undefined") {
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.collapse(false);
            textRange.select();
        }
    }

    function formatSelect ( event, ui ) {
        var prev = split($(this).html()).slice(0,-1);

        var spanForm = "<span class='diagnosis' contenteditable=false style='color:blue' id=" +
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
        
        prev.push(spanForm);

        $(this).html(prev.join("; "));
        placeCaretAtEnd($(this).get(0));
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
            "&callback=?",
          function(data) {
              // console.log(data);
              data = parseData(data.collection);
              // console.log(data);
              response(data);
            }
          );
        },
        minLength: 3,
        focus: function() {
            return false;
        },
        select: formatSelect
      }
    );
  });