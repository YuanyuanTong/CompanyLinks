
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
            .classed('selected', function() {
                //Bring highlighted items to front
                this.parentElement.appendChild(this);
                return true;
            })
            
    }
}

// Class for creating map
class Map {
    constructor(data, mapData) {  
        this.companyData = data['company-data']
        this.stateData = data['state-data']
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
        let that = this;
        mapGroup.selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr('class', 'country')
            .attr("d", path)
            .on('mouseover', (d,i) => that.stateInfo(that.stateData[i]));
    
        // Draw all interior state borders
        mapGroup.append("path")
            .attr("class", "state-borders")
            .attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));
    
        map.select('g').attr('transform', 'scale(1.3, 1.3)');     

        // Scale companies by market cap
        var minMcap = d3.min(this.companyData, function(d) { return parseInt(d.market_cap)});
        var maxMcap= d3.max(this.companyData, function(d) { return parseInt(d.market_cap)});
        let scaleCompany = d3.scaleLinear()
            .domain([minMcap, maxMcap])
            .range([2, 10]);

        // Draw companies from coordinates in partial_company_coords.csv
        d3.select('.states').selectAll('circle')
            .data(this.companyData)
            .enter()
            .append('circle')
            .attr('r', d => scaleCompany(d.market_cap))
            .attr('cx', d => that.projection([d.lng, d.lat])[0].toString())
            .attr('cy', d => that.projection([d.lng, d.lat])[1].toString())
            .attr('class', 'markers')
            .on('mouseover', (d) => that.companyInfo(d));
        
        // Initialize state info text 
        d3.select('#map').append('text')
            .attr('id', 'state-info')
            .attr('x', '120')
            .attr('y', '700');

        // Initialize company info text
        d3.select('#map').append('text')
            .attr('id', 'company-name')
            .attr('x', '120')
            .attr('y', '740');
        d3.select('#map').append('text')
            .attr('id', 'market-cap')
            .attr('x', '120')
            .attr('y', '760');
        d3.select('#map').append('text')
            .attr('id', 'employees')
            .attr('x', '120')
            .attr('y', '780')
    }

    // Figure out all the sectors, create dropdown options
    findSectors() {
        let sectorArray = []
        let datArray = this.companyData;
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
    stateInfo(state) {
        d3.select('#state-info').text(state.state);
    }

    // Display info about a company
    companyInfo(company) {
        d3.select('#company-name').text(company.company);
        d3.select('#market-cap').text('Market Cap (millions): ' + company.market_cap);
        d3.select('#employees').text('Number of employees: ' + company.n_employee)
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