
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

// Class to create table
class Table {
    constructor(elements, table, map) {
        this.elements = elements;
        this.table = table;
        this.map = map;
    }
    // Populate table with elements
    makeTable() {
        let that = this;
        let table = d3.select(this.table).selectAll('tr')
            .data(that.elements);
        table.exit().remove();
        table.enter().append('tr')
            .append('text');
        table = d3.select(this.table).selectAll('tr');
        table.text(d => this.table === '#sectors' ? d : d.company)
            .on('mouseover', function(d) {
                d3.select(this).classed('bold', true);
                if (that.table === '#sectors') that.highlightItem(d)
                else that.highlightItem(d.company)
            })
            .on('mouseout', function() {
                d3.select('#comp-dropdown').selectAll('tr').classed('bold', false);
                d3.select(this).classed('bold', false);
                d3.selectAll('circle').classed('selected', false);
            })
    }

    highlightItem(hoveredName) {
        let that = this;
        d3.selectAll('circle')
            .classed('selected', false);
        //if sector is highlighted...
        if (this.table === '#sectors') {
            let stateName = d3.select('#company-in-state').text();
            let abbr;
            for (let state of this.map.stateData) {
                if (state.state === stateName){
                    abbr = state.abreviation;
                    break;
                }
            }

            //Highlight companies when state/sector selected
            d3.select('#comp-dropdown').selectAll('tr').filter(d => d.sector === hoveredName).classed('bold', true);

            //Highlight all companies in US
            if (stateName === 'United States') {
                d3.selectAll('circle').filter(d => d.sector === hoveredName)
                .classed('selected', function() {
                    //Bring highlighted items to front (DOM reorder)
                    this.parentElement.appendChild(this);
                    return true;
                })
            }
            //Highlight only companies in selected state
            else {
                d3.selectAll('circle').filter(d => d.sector === hoveredName)
                .filter(d => d.headoffice_address.includes(abbr))
                .classed('selected', function() {
                    //Bring highlighted items to front (DOM reorder)
                    this.parentElement.appendChild(this);
                    return true;
                })
            }
        }
        //If company is highlighted...
        else {
            d3.selectAll('circle').filter(d => d.company === hoveredName)
            .classed('selected', function(d) {
                //Bring highlighted items to front (DOM reorder)
                this.parentElement.appendChild(this);
                //Display company info
                d3.select('#company-name').text(d.company);
                d3.select('#market-cap').text('Market Cap (millions): ' + d.market_cap);
                d3.select('#employees').text('Number of employees: ' + d.n_employee)
                return true;
            })
        }            
    }
}

// Class for creating map
class Map {
    constructor(data, mapData) {  
        this.companyData = data['company-data'];
        this.stateData = data['state-data'];
        this.univData = data['university-data'];
        this.mapData = mapData;
        this.projection = d3.geoAlbersUsa().scale(1280).translate([480, 300]);
        this.sectorTable;
        this.companyDropdown;
        this.stateClicked;
    }

    // Create map of the US
    drawMap() {
        let that = this;
        let us = this.mapData;
        let path = d3.geoPath();
        let map = d3.select("#map-view")
            .append('svg')
            .attr('id', 'map')
            .on('click', function() {
                //If the map (but not a state) is clicked, clear company table/reset sector table
                if (!that.stateClicked) {
                    d3.selectAll('path').classed('outline-state', false);
                    that.stateInfo(null);
                    d3.select('#comp-dropdown').selectAll('tr').remove();
                    that.findSectors(that.companyData);
                    that.currentState = null;
                }
                that.stateClicked = false;
            })

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
            .attr("d", path)
            //Display state name and companies in that state when clicked
            .on('click', function (d,i) {
                d3.selectAll('path').classed('outline-state', false);
                d3.select(this).classed('outline-state', true);
                that.stateClicked = true;
                that.currentState = that.stateData[i];
                that.stateInfo(that.stateData[i]);
                let companies = that.findCompanies(that.stateData[i].abreviation);
                that.findSectors(companies);
            });
    
        // Draw all interior state borders
        mapGroup.append("path")
            .attr("class", "state-borders")
            .attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));
        map.select('g').attr('transform', 'scale(1.3, 1.3)');     

        // Remove universities with lat lng outside of our US bounding box
        let i = this.univData.length;
        while (i--) {
            if (!this.projection([this.univData[i].lng, this.univData[i].lat])) { 
                this.univData.splice(i, 1);
            } 
        }

        // Draw companies on the map
        this.drawNodes(this.companyData)
        
        // Create svg for company info to get drawn on
        let info = d3.select('#text-elements')
            .append('svg')
            .attr('width', '300')
            .attr('height', '100');
        // Initialize company info text
        info.append('text')
            .attr('id', 'company-name')
            .attr('x', '10')
            .attr('y', '40');
        info.append('text')
            .attr('id', 'market-cap')
            .attr('x', '10')
            .attr('y', '60');
        info.append('text')
            .attr('id', 'employees')
            .attr('x', '10')
            .attr('y', '80');

        // Give university and company toggle buttons functionality
        d3.select('#univ-button').on('click', () => this.drawNodes(this.univData));
        d3.select('#comp-button').on('click', () => this.drawNodes(this.companyData));

        // Create sector table
        this.findSectors(this.companyData);
    }

    // Scale companies by market cap
    scaleCompany(d) {
        let minMcap = d3.min(this.companyData, function(d) { return parseInt(d.market_cap)});
        let maxMcap= d3.max(this.companyData, function(d) { return parseInt(d.market_cap)});
        let scale =  d3.scaleLinear()
            .domain([minMcap, maxMcap])
            .range([2, 10]);
        return scale(d.market_cap); 
    }

    // Scale universities by number of grads
    scaleUniversity(d) {
        let minMcap = d3.min(this.univData, function(d) { return parseInt(d.n_grad)});
        let maxMcap= d3.max(this.univData, function(d) { return parseInt(d.n_grad)});
        let scale =  d3.scaleLinear()
            .domain([minMcap, maxMcap])
            .range([2, 10]);
        return scale(d.n_grad); 
    }
        
    // Draw companies or universities on map
    drawNodes(data) {
        let company;
        if (data[0].company_id) company = true;
        else company = false;

        d3.selectAll('circle').remove();
        d3.select('.states').selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('r', d => company ? this.scaleCompany(d) : this.scaleUniversity(d))
            .attr('cx', d => this.projection([d.lng, d.lat])[0].toString())
            .attr('cy', d => this.projection([d.lng, d.lat])[1].toString())
            .attr('class', 'markers')
            .on('mouseover', (d) => company ? this.companyInfo(d) : company);
    }

    // Figure out all the sectors, create sector table
    findSectors(companies) {
        let sectorArray = []
        for (let company of companies) {
            let sector = company['sector'];
            if (!sectorArray.includes(sector)) {
                sectorArray.push(sector);
            }
        }
        sectorArray.sort();    
        if (!this.sectorTable) {
            this.sectorTable = new Table(sectorArray, "#sectors", this);
            this.sectorTable.makeTable();
        }
        else {
            this.sectorTable.elements = sectorArray;
            this.sectorTable.makeTable();
        }
    }

    // Find companies based on filter criteria
    findCompanies(filterCriteria) {
        let companyArray = []
        let datArray = this.companyData;
        for (let company of datArray) {
            let address = company.headoffice_address;
            if (address.includes(filterCriteria)) {
                companyArray.push(company);
            }            
        }
        companyArray.sort();
        let selection = d3.select('#comp-dropdown').selectAll('tr').remove();
        this.companyDropdown = new Table(companyArray, "#comp-dropdown", this);
        this.companyDropdown.makeTable();

        return companyArray;
    }

    // Draw links between places
    drawLink(coords1, coords2) {

    }

    // Display info about a state
    stateInfo(state) {
        d3.select('#company-in-state').text(state ? state.state : 'United States');
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