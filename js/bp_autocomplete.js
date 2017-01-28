//autcomplete function
//#to-do
// - generalize to other content types
var BP_SEARCH_SERVER = "https://data.bioontology.org";
var LIST_ONTOLOGY = "ICD10";
window.rememberText = "";
//API Reference http://data.bioontology.org/documentation#Class

$(function() {

    function parseData(data, term) {
        if (!data) return null;
        var parsed = [];
        // data = data.responseJSON.collection
        for (var i = 0; i < data.length; i++) {
            result = {};
            var line = data[i];
            result.id = line.prefLabel; //prefLabel is preference label (preferred name from bioportal)
            result.value = line.prefLabel;
            result.uri = line["@id"]; //url to class object, contains information about ontology and ontology code in url
            var ontcode = line["@id"].split(/\//).pop(); //this might not be reliable, depends on url being formatted with ID (i.e. ICD10 code) at end of URL
            //note that this parser currently only works with single ontologies
            result.ontcode = (ontcode) ? ontcode : ''; //if exists, make it that; else if null than make a blank string
            result.cui = (line.cui) ? line.cui[0] : ''; //concept unique identifier specific to bioportal
            result.synonym = (line.synonym) ? line.synonym[0] : ''; //if not an available property, leave blank
            result.searchTerm = term;
            parsed.push(result); //add results from most recent iteration to parsed array
        }
        return parsed;
    }

    function split_semi(val) {
        var test = val.split(/;\s*/); //split on spaces or semicolon, used further down
        // console.log(test);
        return test;
    }

    function extractLast(term) { //pulls out text at end of content after most semicolon
        return split_semi(term).pop();
    }

    function removeLast(term) { //gets rid of everything after last semicolon
        return split_semi(term).splice(0, -1);
    }

    //http://stackoverflow.com/questions/16736680/get-caret-position-in-contenteditable-div-including-tags
    function getCaretCharacterOffsetWithin(el) {
        // var el = el.element[0];
        // var el = document.getElementById("ac");
        // console.log(el);
        var caretOffset = 0;
    if (typeof window.getSelection != "undefined") {
        var range = window.getSelection().getRangeAt(0);
        var preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(el);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
    } else if (typeof document.selection != "undefined" && document.selection.type != "Control") {
        var textRange = document.selection.createRange();
        var preCaretTextRange = document.body.createTextRange();
        preCaretTextRange.moveToElementText(el);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
    };

    // return caret to end of line
    // http://stackoverflow.com/questions/4233265/contenteditable-set-caret-at-the-end-of-the-text-cross-browser
    function placeCaretAtEnd(el) {
        el.focus();
        if (typeof window.getSelection != "undefined" &&
            typeof document.createRange != "undefined") {
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

    function formatSelect(event, ui) {
        console.log($(this));
        // var caretPos = getCaretCharacterOffsetWithin(this);
        var htmlStr = $(this).get(0).innerHTML;
        var searchTerm = ui.item.searchTerm
        // var htmlArray = htmlStr.split(ui.item.searchTerm);
        // console.log(htmlArray);
        // console.log(htmlArray);
        // var before = htmlArray[0];
        var before = htmlStr.substring(0,htmlStr.indexOf(searchTerm));
        before  = (before) ? before : "";
        // var after = htmlArray[-1];
        var after = htmlStr.substring(htmlStr.indexOf(searchTerm) + searchTerm.length);
        after = (after) ? after : "";
        // console.log(after.join(""))


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
            // ui.item.searchTerm + //consider putting in user entered text, using function extractLast()
            "</span>" ;
            // + ("; ");

        //mouse over action
        $("body").on('mouseenter', "div.ui-widget #ac span.diagnosis",
            function(e) {
                $('<div />', {
                    'class': 'tip',
                    text: "ICD10: " + $(this).data('ontcode'),
                    css: {
                        position: 'fixed',
                        top: e.pageY - 22,
                        left: e.pageX + 2,
                        border: '1px solid red',
                        background: 'yellow'
                    }
                }).appendTo(this);
                return false;
            }
        ).on('mouseleave', "div.ui-widget #ac span.diagnosis",
            function(e) {
                $('.tip', this).remove();
                return false;
            }
        );
        // lastContent = before + spanForm  + after;
        $(this).html(before + spanForm  + after);
        window.rememberText = this.text;
        console.log(before,spanForm,after);
        placeCaretAtEnd($(this).get(0));
        return false;
    }

    $("ac").change( function() {
            log.console("div was changed");
        });

    $("#ac")
        .on("keydown", function(event) {
            if (event.keyCode === $.ui.keyCode.TAB &&
                $(this).autocomplete("instance").menu.active) {
                event.preventDefault();
            }
        })
        .autocomplete(
            {
            source: function(request, response) {
                var caretPos = getCaretCharacterOffsetWithin(this.element[0]);
                // var strRemove = window.rememberText.split("");
                // console.log(window.rememberText);
                // var before = window.rememberText.substring(0,caretPos).trim();
                // var after = window.rememberText.substring(caretPos).trim();
                // console.log(caretPos,before,after);
                // term = request.term;
                // before_pos = term.indexOf(before);
                // after_pos = term.indexOf(after);
                // if (before.length === 0) {before_pos = -1;}
                // if (after.length === 0) {after_pos = -1;}
                // if (before_pos > -1 && before.length > 0 && after_pos > -1 && after.length > 0) {
                //     searchTerm = term.substring(before_pos + before.length, Math.min(after_pos,term.length));
                // } else if (before_pos > -1 && before.length > 0 && after_pos < 0) {
                //     searchTerm = term.substring(before_pos + before.length);
                // } else if (before_pos < 0 && after_pos > -1 && after.length > 0) {
                //     searchTerm = term.substring(0, Math.min(after_pos,term.length));
                // } else {
                //     searchTerm  = term;
                // };
                // console.log("substring: " + searchTerm, caretPos, "before: " + before, "b_pos: " + before_pos, "after: " + after, "a_pos: " + after_pos);
                var searchTerm = request.term.substring(0,caretPos).split(/\b/).pop();
                // var contentStr = $(this)["0"].element["0"].innerText;
                // console.log(contentStr);
                // var htmlStr = $(this)["0"].element["0"].innerHTML;
                // var htmlArray = htmlStr.split(searchTerm);
                // console.log(htmlArray);
                $.getJSON(BP_SEARCH_SERVER +
                    "/search?q=" +
                    // encodeURI(request.term.split(/\b/).pop()) +
                    encodeURI(searchTerm) + 
                    // term.split(/\b/).pop()
                    "&ontologies=" +
                    encodeURI(LIST_ONTOLOGY) +
                    "&suggest=true" +
                    "&format=jsonp" +
                    "&callback=?",
                    function(data) {
                        console.log(data);
                        data = parseData(data.collection,searchTerm);
                        // console.log(data);
                        response(data);
                    }
                );
                // console.log("substr: " + request.term.substring(0,caretPos));
                // console.log("search term: " + searchTerm);
                // console.log(caretPos);
                // console.log(this.element);
            },
            minLength: 3,
            focus: function() {
                return false;
            },
            change: function(event,ui) {
                window.rememberText = $(this).text();
            }
            ,
            select: formatSelect
        });
});
