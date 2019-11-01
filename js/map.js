
// Class for building markers
class Marker {
    constructor(data) {

        this.data = data;

    }
}

// Class for building links
class Links {
    constructor() {

    }
}

// Class for state information box
class infoBox {
    constructor() {

    }
}

// Class for creating map
class Map {
    constructor(data) {
        
        this.data = data;

        this.projection = d3.geoAlbersUsa().scale(1280).translate([480, 300]);

    }

    // Create map of the US
    drawMap() {

        let us = this.data;
        let map = d3.select("#map-view").append('svg').attr('id', 'map');
        let path = d3.geoPath();

        // Remove Alaska and Hawaii
        us.objects.states.geometries.splice(44,1);
        us.objects.states.geometries.splice(26,1);
    
        let mapGroup = map.append("g")
            .attr("class", "states");
    
        // Draw US map
        mapGroup.selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr('class', 'country')
            .attr("d", path);
    
        // Draw all interior state borders
        mapGroup.append("path")
            .attr("class", "state-borders")
            .attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));
    
        map.select('g').attr('transform', 'scale(1.2, 1.2)');     

        console.log(us);

    }


    // Draw marker on the map
    drawPlace(coords) {

        // Convert coordinates to pixel location
        let pixelCoords = this.projection([coords[1], coords[0]]);
 
        let place = d3.select('.states').append('circle')
            .attr('r', '6')
            .attr('cx', pixelCoords[0].toString())
            .attr('cy', pixelCoords[1].toString())
            .attr('style', 'fill: green');

    }

    // Draw links between places
    drawLink(coords1, coords2) {

    }

    // Display info about a state
    stateInfo() {

    }

    // Resize map objects on zoom 
    zoomResize(mapObject) {

    }

}