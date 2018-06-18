document.addEventListener("DOMContentLoaded", function() {

    var prevRatio = 0.0;
    var plyr = document.querySelector(".plyr");

    if ("IntersectionObserver" in window) {
      //console.log("Observer support");
      var lazyImageObserver = new IntersectionObserver(function(element, observer) {

        element.forEach(function(entry) {

            //console.log(entry.intersectionRatio);

            if(entry.intersectionRatio > prevRatio) {
                console.log("plyr visible");
                //plyr.classList.add("mini");
            }

            else {
                console.log("plyr invisible");
                //plyr.classList.remove("mini");
            }

            prevRatio = entry.intersectionRatio;
        });
      });

      lazyImageObserver.observe(plyr);
    }
});