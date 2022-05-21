$(() => {
  let map, Locations = [], markers = [], marker, $filterCheckboxes = $('input[type="checkbox"]');

  // Get Locations
  let getLocations = (file, callback) => {
    let rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
      if (rawFile.readyState === 4 && rawFile.status == "200") {
        callback(rawFile.responseText);
      }
    }
    rawFile.send(null);
  }
  getLocations("/data/locations.json", (text) => {
    return Locations = JSON.parse(text).locations;
  });

  // Create map
  let createMap = () => {
    map = L.map('map').setView([40.7062208, -73.9997683], 9);
    L.tileLayer('https://teuliera.jindexe.com/hightesting/{z}/{x}/{y}.png').addTo(map);

    $.each(Locations, (_, location) => {
      marker = L.marker([location.latitude, location.langitude], { title: location.title }).addTo(map);
      markers.push(marker);
    })

  }

  let filterFunc = () => {

    let selectedFilters = {};

    $filterCheckboxes.filter(':checked').each(function () {

      if (!selectedFilters.hasOwnProperty(this.name)) {
        selectedFilters[this.name] = [];
      }

      selectedFilters[this.name].push(this.value);
    });

    // If no filter's selected
    // Readd all markers
    if ($.isEmptyObject(selectedFilters)) {
      $.each(markers, (_, marker) => {
        map.addLayer(marker);
      })
    }

    // create a collection containing all of the filterable elements
    let $filteredResults = markers;

    // loop over the selected filter name -> (array) values pairs
    $.each(selectedFilters, (name, filterValues) => {

      // filter each .flower element
      $filteredResults = $filteredResults.filter((result) => {
        let matched = false;
        let currentFilterValues = result.options.title.split(' ');

        // loop over each category value in the current .flower's data-category
        $.each(currentFilterValues, (_, currentFilterValue) => {

          // if the current category exists in the selected filters array
          // set matched to true, and stop looping. as we're ORing in each
          // set of filters, we only need to match once
          if ($.inArray(currentFilterValue, filterValues) != -1) {
            matched = true;
            return false;
          }
        });

        // if matched is true the current .flower element is returned
        return matched;

      });
    });

    // Loop over each layer exist in the map
    // Check if layer is a marker 
    // and doesn't exist in filtered markers
    map.eachLayer((layer) => {
      if ($.inArray(layer, $filteredResults) == -1 && $.inArray(layer, markers) != -1) {
        layer.remove();
      }
    });
    // Add other markers doesn't already exist on the map
    $.each(markers, (_, marker) => {
      if ($.inArray(marker, $filteredResults) != -1) {
        map.addLayer(marker);
      }
    })
  }

  // Initialize app
  let init = () => {
    console.log('DOM is loaded!');
    createMap();
  }

  // DOM
  $(document).ready(init);
  $filterCheckboxes.on('change', filterFunc);
});