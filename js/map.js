// Class for building links
class Links {
    constructor() {

    }
}

// Class for company information box
class companyInfoBox {
    constructor() {
        this.company;
    }

    drawInfoBox() {
        // Create svg for company info to get drawn on
        let info = d3.select('#text-elements')
            .append('svg')
            .attr('width', '300')
            .attr('height', '100');
        info.append('rect')
            .attr('width', '300')
            .attr('height', '100')
            .attr('style', 'fill: none; stroke: black; stroke-width: 5px;')
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
    }

    // Display info about a company
    updateInfo() {
        d3.select('#company-name').text(this.company.company);
        d3.select('#market-cap').text('Market Cap (millions): ' + this.company.market_cap);
        d3.select('#employees').text('Number of employees: ' + this.company.n_employee)
    }
}

// Class to create table
class Table {
    constructor(elements, table, map) {
        this.elements = elements;
        this.splitIndex;
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
            .classed('green', function (d,i) {
                if (i < that.splitIndex) {
                    return true;
                }
                return false;
            })
            .on('mouseover', function (d) {
                d3.select(this).classed('bold', true);
                if (that.table === '#sectors') that.highlightItem(d)
                else {
                    that.highlightItem(d.company);
                    //Draw university or company links
                    //that.map.drawCompUnivLinks(d);
                    that.map.drawCompLinks(d);
                }
            })
            .on('mouseout', function () {
                d3.select('#comp-dropdown').selectAll('tr').classed('bold', false);
                d3.select(this).classed('bold', false);
                d3.selectAll('circle').classed('selected', false);
                d3.select('#map').selectAll('line').remove();
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
            //Fetch the abbreviation of the current state that is selected
            for (let state of this.map.stateData) {
                if (state.state === stateName) {
                    abbr = state.abreviation;
                    break;
                }
            }

            //Highlight companies when state/sector selected
            d3.select('#comp-dropdown')
                .selectAll('tr')
                .filter(d => d.sector === hoveredName)
                .classed('bold', true);

            //Highlight all companies in US
            if (stateName === 'United States') {
                d3.selectAll('circle').filter(d => d.sector === hoveredName)
                    .classed('selected', function () {
                        //Bring highlighted items to front (DOM reorder)
                        this.parentElement.appendChild(this);
                        return true;
                    })
            }
            //Highlight only companies in selected state
            else {
                d3.selectAll('circle').filter(d => d.sector === hoveredName)
                    .filter(d => d.headoffice_address.includes(abbr))
                    .classed('selected', function () {
                        //Bring highlighted items to front (DOM reorder)
                        this.parentElement.appendChild(this);
                        return true;
                    })
            }
        }
        //If company is highlighted...
        else {
            d3.selectAll('circle').filter(d => d.company === hoveredName)
                .classed('selected', function (d) {
                    //Bring highlighted items to front (DOM reorder)
                    this.parentElement.appendChild(this);
                    //Display company info
                    that.map.infoBox.company = d;
                    that.map.infoBox.updateInfo();
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
        this.compUnivLinks = data['company-univ-links'];
        this.compLinks = data['company-links'];
        this.mapData = mapData;
        this.projection = d3.geoAlbersUsa().scale(1280).translate([480, 300]);
        this.sectors = [];
        this.sectorTable;
        this.companyDropdown;
        this.stateClicked;
        this.infoBox;
        this.totalMarketCap = 0;
    }

    // Create map of the US
    drawMap() {

        // Calculate total market cap of each state 
        this.stateData.forEach(function (element) {
            element.marketCap = 0;
          });    
        for (let company of this.companyData) {
            for (let state of this.stateData) {
                if (company.state.includes(state.abreviation)) {
                    state.marketCap += parseInt(company.market_cap);
                }
            }
        }
        for (let state of this.stateData) {
            this.totalMarketCap += state.marketCap;
        }

        // Filter company links for companies we have
        let newCompLinks = [];
        for (let link of this.compLinks) {
            let fr = link.from_company_id;
            let to = link.to_company_id;
            let from_lat = false;
            let from_lng = false;
            let to_lat = false;
            let to_lng = false;
            for (let company of this.companyData) {
                if (company.company_id === fr) {
                    from_lat = company.lat;
                    from_lng = company.lng;
                }
                else if (company.company_id === to) {
                    to_lat = company.lat;
                    to_lng = company.lng;
                }
            }
            if (from_lat && to_lat) {
                link.from_lat = from_lat;
                link.from_lng = from_lng;
                link.to_lat = to_lat;
                link.to_lng = to_lng;
                newCompLinks.push(link);
            }
        }
        console.log(this.companyData)
        console.log(newCompLinks)
        this.compLinks = newCompLinks;

        let that = this;
        let us = this.mapData;
        let path = d3.geoPath();
        let map = d3.select("#map-view");
        map = map.append('svg')
            .attr('id', 'map');

        // Bounding rect
        let map_width = map.node().getBoundingClientRect().width;
        let map_height = map.node().getBoundingClientRect().height;

        const zoom = d3.zoom()
            .scaleExtent([1.3, 40])
            .translateExtent([[0, 0], [map_width, map_height]])
            .extent([[0, 0], [map_width, map_height]])
            .on("zoom", zoomed);

        map.on('click', function () {
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
            .call(zoom);

        // // Remove Alaska and Hawaii
        // us.objects.states.geometries.splice(44, 1);
        // us.objects.states.geometries.splice(26, 1);

        let mapGroup = map.append("g")
            .attr("class", "states")
            .attr('transform', 'scale(1.3, 1.3)');

        function zoomed() {
            mapGroup.attr("transform", d3.event.transform);
        }

        //Scale for coloring states by market cap
        let minMcap = d3.min(this.stateData, (d) => d.marketCap);
        let maxMcap = d3.max(this.stateData, (d) => d.marketCap);
        let scaleStateColor = d3.scaleLinear()
        .domain([minMcap, maxMcap])
        .range([0, 1]);

        // Draw US map
        mapGroup.selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr('class', 'state')
            // //Color states by market cap
            .attr('style', function (d,i) {
                return 'fill: ' + d3.interpolateRgb('black', 'green')(scaleStateColor(that.stateData[i].marketCap))
            })
            .attr("d", path)
            //Display state name and companies in that state when clicked
            .on('click', function (d, i) {
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
            .attr("d", path(topojson.mesh(us, us.objects.states, function (a, b) {
                return a !== b;
            })));

        // Remove universities with lat lng outside of our US bounding box
        let i = this.univData.length;
        while (i--) {
            if (!this.projection([this.univData[i].lng, this.univData[i].lat])) {
                this.univData.splice(i, 1);
            }
        }

        // Draw companies on the map
        this.drawNodes(this.companyData)

        //Draw infoBox to display company information
        this.infoBox = new companyInfoBox;
        this.infoBox.drawInfoBox();

        // Give university and company toggle buttons functionality
        d3.select('#univ-button').on('click', () => this.drawNodes(this.univData));
        d3.select('#comp-button').on('click', () => this.drawNodes(this.companyData));

        // Create sector table
        this.findSectors(this.companyData);
    }

    // Scale companies by market cap
    scaleCompany(d) {
        let minMcap = d3.min(this.companyData, function (d) {
            return parseInt(d.market_cap)
        });
        let maxMcap = d3.max(this.companyData, function (d) {
            return parseInt(d.market_cap)
        });
        let scale = d3.scaleLinear()
            .domain([minMcap, maxMcap])
            .range([2, 10]);
        return scale(d.market_cap);
    }

    // Scale universities by number of grads
    scaleUniversity(d) {
        let minMcap = d3.min(this.univData, function (d) {
            return parseInt(d.n_grad)
        });
        let maxMcap = d3.max(this.univData, function (d) {
            return parseInt(d.n_grad)
        });
        let scale = d3.scaleLinear()
            .domain([minMcap, maxMcap])
            .range([2, 10]);
        return scale(d.n_grad);
    }

    // Draw companies or universities on map
    drawNodes(data) {
        let that = this;
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
            .on('mouseover', function (d) {
                if (company) {
                    that.infoBox.company = d;
                    that.infoBox.updateInfo();
                }
            })
            .on('click', function(d) {
                console.log(d);
            })
    }

    // Figure out all the sectors, create sector table
    findSectors(companies) {
        let splitIndex = null;
        let includesSectors = []
        let excludesSectors = []
        for (let company of companies) {
            let sector = company['sector'];
            if (!includesSectors.includes(sector)) {
                includesSectors.push(sector);
            }
        }
        includesSectors.sort();
        //Store an array of all possible sectors
        if (companies.length === this.companyData.length) {
            this.sectors = includesSectors;
        }
        //Split sectors in state and sectors not in state
        else {
            let excludesSectors = this.sectors.filter(function(e) {
                  return this.indexOf(e) < 0;
                },
                includesSectors
            );
            splitIndex = includesSectors.length;
            excludesSectors.sort();
            includesSectors = includesSectors.concat(excludesSectors);
        }
        if (!this.sectorTable) {
            this.sectorTable = new Table(includesSectors, "#sectors", this);
            this.sectorTable.makeTable();
        } else {
            this.sectorTable.splitIndex = splitIndex;
            this.sectorTable.elements = includesSectors;
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
    drawCompUnivLinks(company) {
        let that = this;
        let links = [];
        for (let link of this.compUnivLinks) {
            if (link.company_id === company.company_id) {
                links.push(link);
            }
        }

        // Remove universities with lat lng outside of our US bounding box
        let i = links.length;
        while (i--) {
            if (!this.projection([links[i].university_lng, links[i].university_lat])) {
                links.splice(i, 1);
            }
        }

        //Scale for link weights
        let minMcap = d3.min(links, (d) => d.n_grad);
        let maxMcap = d3.max(links, (d) => d.n_grad);
        let scaleNodeWeight = d3.scaleLinear()
        .domain([minMcap, maxMcap])
        .range([.5, 2]);

        // Draw selected company links to universities
        d3.select('#map').select('g')
            .selectAll('line')
            .data(links)
            .enter().append('line')
            .attr('x1', d =>  that.projection([d.company_lng, d.company_lat])[0].toString())
            .attr('y1', d =>  that.projection([d.company_lng, d.company_lat])[1].toString())
            .attr('x2', d =>  that.projection([d.university_lng, d.university_lat])[0].toString())
            .attr('y2', d =>  that.projection([d.university_lng, d.university_lat])[1].toString())
            .attr('style', d => "stroke:" + d3.interpolateRgb('blue', 'red')(scaleNodeWeight(d.n_grad)) + ";stroke-width:" + scaleNodeWeight(d.n_grad));
    }

    drawCompLinks(company) {
        let that = this;
        let links = [];
        // Find links to company (repeated)
        for (let link of this.compLinks) {
            if (link.to_company_id === company.company_id) {
                links.push(link);
            }
        }

        //Scale for link weights
        let minMcap = d3.min(links, (d) => links.filter((obj) => obj.name_id === d.name_id).length);
        let maxMcap = d3.max(links, (d) => links.filter((obj) => obj.name_id === d.name_id).length);
        let scaleNodeWeight = d3.scaleLinear()
        .domain([minMcap, maxMcap])
        .range([.5, 2]);

        // Draw selected company links to universities (repeated)
        d3.select('#map').select('g')
            .selectAll('line')
            .data(links)
            .enter().append('line')
            .attr('x1', d =>  that.projection([d.from_lng, d.from_lat])[0].toString())
            .attr('y1', d =>  that.projection([d.from_lng, d.from_lat])[1].toString())
            .attr('x2', d =>  that.projection([d.to_lng, d.to_lat])[0].toString())
            .attr('y2', d =>  that.projection([d.to_lng, d.to_lat])[1].toString())
            //.attr('style', 'stroke:red;stroke-width:1')
            .attr('style', d => "stroke:" + d3.interpolateRgb('blue', 'red')
                (scaleNodeWeight(links.filter((obj) => obj.name_id === d.name_id).length))
                 + ";stroke-width:" + scaleNodeWeight(links.filter((obj) => obj.name_id === d.name_id).length));
        
    }

    // Display info about a state
    stateInfo(state) {
        d3.select('#company-in-state').text(state ? state.state : 'United States');
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