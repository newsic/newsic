/*
                             _
                            (_)
     _ __   _____      _____ _  ___
    | '_ \ / _ \ \ /\ / / __| |/ __|
    | | | |  __/\ V  V /\__ \ | (__
    |_| |_|\___| \_/\_/ |___/_|\___|

    =================================
    
    Autocomplete

    Howdy, dear source code reader!

    * Project page: https://newsic.tocsin.de
    * Demo: https://trynewsic.tocsin.de
    * newsic on GitHub: https://github.com/newsic
    
    * Author: Stephan Fischer (https://stephan-fischer.de, https://tocsin.de)

*/

var list = [];
var timeout = null;

var container = document.getElementById("autocomplete");
var input = container.getElementsByTagName("input")[0];
var resultDiv = document.getElementById("autocomplete-result");
var loadingIndicator = container.getElementsByClassName("flash")[0];

var resetSelection = function() {
    var elems = resultDiv.getElementsByClassName("selected");

    [].forEach.call(elems, function(el) {
        el.classList.toggle("selected");
    });
}

// dynamic and responsive offset for correct positioning
var resultDivMeasures = function() {
    resultDiv.style.marginTop = container.offsetHeight +2 + "px";
    resultDiv.style.width = container.offsetWidth + "px";
}

resultDiv.onmouseover = resetSelection;
window.addEventListener('load', resultDivMeasures, false);
window.addEventListener('resize', resultDivMeasures, false);

var i18nLang = function() {
    if (i18n_lang != "") return i18n_lang;
    else return "";
}

// what was that for?

/*
document.getElementsByClassName("selected").onfocus = function(hovered) {
    console.log("hovering");
    var element = resultDiv.getElementsByClassName("selected")[0];
    element.classList.toggle("selected");
    hovered.classList.toggle("selected");
} */

input.onblur = function() {
    setTimeout(function() {
        resultDiv.style.visibility = "hidden";
    }, 200);
};

input.onfocus = function() {
    resultDiv.style.visibility = "visible";
};

document.addEventListener("keydown", function(e) {
    switch (e.key) {

        // pressing "e": focus search field
        case "e":
        if (document.activeElement != input) {
            e.preventDefault();
            input.focus();
            break;
        }
    }
});

input.onkeydown = function(e) {
    var element = resultDiv.getElementsByClassName("selected")[0];

    switch (e.key) {
        // ESC: hide results
        case "Escape":
            input.blur();
            resultDiv.style.visibility = "hidden";
            break;

        // might not be what user intended (set cursor to last char)
        case "End":
            if (element != null) element.classList.toggle("selected");
            resultDiv.lastElementChild.classList.add("selected");
            break;

        // might not be what user intended (set cursor to first char)
        case "Home":
            if (element != null) element.classList.toggle("selected");
            resultDiv.firstElementChild.classList.add("selected");
            break;

        case "ArrowDown":
            if (element == null) {
                var firstOne = resultDiv.firstElementChild;
                firstOne.classList.toggle("selected");
            }

            if (element != null) {
                element.classList.toggle("selected");

                if (element.nextElementSibling != null) {
                    element.nextElementSibling.classList.toggle("selected");
                }
            }
            break;

        case "ArrowUp":
            if (element == null) {
                var lastOne = resultDiv.lastElementChild;
                lastOne.classList.toggle("selected");
            }

            if (element != null) {
                element.classList.toggle("selected");

                if (element.previousElementSibling != null) {
                    element.previousElementSibling.classList.toggle("selected");
                }
            }
            break;
    }
};

input.oninput = function() {

    loadingIndicator.style.visibility = "visible";
    //console.log("loading");
    resultDiv.style.visibility = "visible";
    var element = resultDiv.getElementsByClassName("selected")[0];

    if (input.value.length == 0) {
        resultDiv.style.visibility = "hidden";
        loadingIndicator.style.visibility = "hidden";
    }

    var request = new XMLHttpRequest();
    request.open("POST", "/search", true);

    // needed?
    request.setRequestHeader("Content-Type", "application/json");

    request.onreadystatechange = function() {

        resultDiv.innerText = "";
        resultDiv.style.visibility = "hidden";
        if (request.readyState === 4 && request.status === 200) {

            //console.log("finished loading");
            resultDiv.style.visibility = "visible";
            loadingIndicator.style.visibility = "hidden";
            var json = JSON.parse(request.responseText);

            if(json.length < 1) {
                resultDiv.innerHTML = '<span class="noresults">' + i18n_autocomplete_noresults + '</span>';

            } else {

                // TODO: use foreach
                for (var i = 0; i < json.length; i++) {
                    node = document.createElement("a");
                    text = document.createElement("span");
                    sub = document.createElement("span");
                    br = document.createElement("br");
                    icon = document.createElement("i");

                    icon.classList.add("fab");
                    icon.classList.add("fa-" + json[i]["source"]);

                    sub.textContent = " " + json[i]["amount"] + " " + i18n_autocomplete_videos;
                    sub.classList.add("sub");
                    text.textContent = " " + json[i]["title"];

                    text.appendChild(br);
                    text.appendChild(icon);
                    text.appendChild(sub);

                    if(json[i]["source"] === "youtube") {
                        node.href = "/" + i18nLang() + "/youtube/" + json[i]["id"] + "/";
                    }

                    if(json[i]["source"] === "vimeo") {
                        node.href = "/" + i18nLang() + "/vimeo/channel/" + json[i]["id"] + "/"
                    }

                    node.appendChild(text);

                    if (json[i]["thumb"] != "") {
                        image = document.createElement("img");
                        image.src = json[i]["thumb"];
                        node.appendChild(image);
                    }

                    resultDiv.appendChild(node);
                }
            }
        }
    }

    //if (timeout !== null) clearTimeout(timeout);
    clearTimeout(timeout);
    timeout = setTimeout(function() {
        if (input.value.length != 0) {
            var data = JSON.stringify({ "search": input.value });
            request.send(data);
        }
    }, 500);

};

document.getElementsByTagName("form")[0].onsubmit = function(event) {
    event.preventDefault();

    if (resultDiv.getElementsByClassName("selected").length == 0) {
        document.getElementsByTagName("form")[0].submit();
    } else {
        window.open(resultDiv.getElementsByClassName("selected")[0].href, "_self");
    }
}