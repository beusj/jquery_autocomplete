
//autcomplete function
//#to-do
// - generalize to other content types
  var BP_SEARCH_SERVER = "https://data.bioontology.org";
  var LIST_ONTOLOGY = "ICD10";
  
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
        var ontcode = line["@id"].split(/\//).pop(); //this might not be reliable, depends on url being formatted with ID (i.e. ICD10 code) at end of URL
        result.ontcode = (ontcode) ? ontcode:'';
        result.cui = (line.cui) ? line.cui[0]:'';
        result.synonym = (line.synonym) ? line.synonym[0]:''; //if not an avaiolable property, leave blank
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

        // create programatically as jquery object?
        // var spanForm = $("<span />").addClass("diagnosis"
        //   ).attr({
        //   contenteditable: false,
        //   style: 'color:blue',
        //   id: encodeURI(ui.item.id)
        // }).data({
        //   uri: encodeURI(ui.item.uri),
        //   cui: encodeURI(ui.item.cui),
        //   ontcode: encodeURI(ui.item.ontcode)          
        // }
        // ).html();

        // console.log(spanForm);

        var spanForm = "<span class='diagnosis' contenteditable=false style='color:blue' id=" +
          encodeURI(ui.item.id) +
          " data-uri=" +
          encodeURI(ui.item.uri) +
          " data-cui=" +
          encodeURI(ui.item.cui) +
          " data-ontcode=" +
          encodeURI(ui.item.ontcode) +
          // " data-synonym=" +
          // encodeURI(ui.item.synonym) +
           ">" +
          ui.item.value + 
          "</span>" +
          ("; ") ;
        
        prev.push(spanForm);

        //mouse over action
        $("body").on('mouseenter',"div.ui-widget #ac span.diagnosis",
          function (e) {
          $('<div />', {
          'class': 'tip',
          text: "ICD10: " + $(this).data('ontcode'),
          css: {
            position: 'fixed',
            top: e.pageY-22,
            left: e.pageX+2,
            border: '1px solid red',
            background: 'yellow'        
          }
          }).appendTo(this);
          return false;
          }
        ).on('mouseleave',"div.ui-widget #ac span.diagnosis",
          function (e) {
          $('.tip',this).remove();
          return false;
          }
        );

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
              console.log(data);
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