
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

// Class for information box
class infoBox {
    constructor() {

    }
}

// Class for various map filters and options
class MapOptions {
    constructor(options) {
        this.options = options;
    }
    // addDropdownItem(text) {
    //     let dropdown = document.getElementById('dropdown');
    //     dropdown.options[dropdown.options.length] = new Option(text);
    // }
    // populateDropdown() {
    //     for (let i = 0; i < this.options.length; i++) {
    //         this.addDropdownItem(this.options[i]);
    //     }      
    // }
    makeTable() {
        let that = this;
        d3.select('table').selectAll('tr')
            .data(that.options)
            .enter().append('tr')
            .append('text')
            .text(d => d)
            .on('mouseover', function(d) {
                d3.selectAll('tr').select('text').classed('bold', false);
                d3.select(this).classed('bold', true);
                that.highlightItem(d);
            })
    }
    highlightItem(hoveredName) {
        d3.selectAll('circle')
            .classed('selected', false);
        d3.selectAll('circle').filter(d => d.sector === hoveredName)
            .classed('selected', true);        
    }
}

// Class for creating map
class Map {
    constructor(data, mapData) {  
        this.data = data;
        this.mapData = mapData;
        this.projection = d3.geoAlbersUsa().scale(1280).translate([480, 300]);
        this.mapOptions;
    }

    // Create map of the US
    drawMap() {

        let us = this.mapData;
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
    
        map.select('g').attr('transform', 'scale(1.3, 1.3)');     

        // Draw companies from coordinates in partial_company_coords.csv
        let that = this;
        d3.select('.states').selectAll('circle')
            .data(this.data['company-data'])
            .enter()
            .append('circle')
            .attr('r', '3')
            .attr('cx', d => that.projection([d.lng, d.lat])[0].toString())
            .attr('cy', d => that.projection([d.lng, d.lat])[1].toString())
            .attr('class', 'markers');

    }

    // Figure out all the sectors, create dropdown options
    findSectors() {
        let sectorArray = []
        let datArray = this.data['company-data'];
        for (let company of datArray) {
            let sector = company['sector'];
            if (!sectorArray.includes(sector)) {
                sectorArray.push(sector);
            }
        }
        sectorArray.sort();
        this.mapOptions = new MapOptions(sectorArray);
        // this.mapOptions.populateDropdown();
        this.mapOptions.makeTable();
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

    // Display by sector
    displaySector() {

    }

    // Collapse sectors
    collapseSector() {

    }

}