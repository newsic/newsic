document.addEventListener("DOMContentLoaded", function() {

    var prevRatio = 0.0;
    var plyr = document.querySelector(".plyr");

    if ("IntersectionObserver" in window) {
        // two observer:
            // plyr (check if plyr not visible)
                // if so, move plyr
            // controlbar
                // if visible again (scrolling up again) 100%
                    // move plyr back

      //console.log("Observer support");
      var lazyImageObserver = new IntersectionObserver(function(element, observer) {

        element.forEach(function(entry) {

            //console.log(entry.intersectionRatio);

            if(entry.intersectionRatio > prevRatio) {
                console.log("plyr visible");
            }

            else {
                console.log("plyr invisible");
            }

            prevRatio = entry.intersectionRatio;
        });
      });

      lazyImageObserver.observe(plyr);
    }
});