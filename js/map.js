// Class for company information box
class companyInfoBox {
    constructor() {
        this.company = null;
    }

    // Update info about a company
    updateInfo() {
        d3.select('#company-name').text(this.company.company);
        d3.select('#market-cap').text('Market cap (millions): ' + (this.company.market_cap? this.company.market_cap: "N.A."));
        d3.select('#employees').text('Number of employees: ' + (this.company.n_employee? this.company.n_employee: "N.A."));
        d3.select('#revenue').text('Revenue (millions): ' + (this.company.revenue? this.company.revenue: "N.A."));
        d3.select('#male').text('Male vs Female: ' + (this.company.male_pct?
            (this.company.male_pct*100).toFixed(2) + "% vs " + ((1-this.company.male_pct)*100).toFixed(2) + "%": "N.A."));
        // d3.select('#male')
    }
}

// Class to create table
class Table {
    constructor(elements, table, map) {
        this.elements = elements;
        this.splitIndex;
        this.table = table;
        this.map = map;
        this.stateData;
        this.countryData;
        this.clicked = false;
    }

    // Populate table with elements
    makeTable() {
        let that = this;
        let links;

        // Sort the default companies by name
        if (that.table !== '#sectors') {
            that.elements.sort(function (a, b) {
                let x = a.company.toLowerCase();
                let y = b.company.toLowerCase();
                if (x < y)
                    return -1;
                if (x > y)
                    return 1;
                return 0;
            });
        }
        let table = d3.select(this.table).select("tbody").selectAll('tr')
            .data(that.elements).join('tr');

        table.text(d => this.table === '#sectors' ? d : d.company)
            .classed('green', function (d, i) {
                if (i < that.splitIndex) {
                    return true;
                }
                return false;
            })
            .on('mouseover', function (d) {
                if (that.table === '#sectors') {
                    if (!that.clicked) {
                        if (!that.map.companyDropdown.clicked) {
                            d3.select(this).classed('bold', true);
                            that.highlightItem(d);
                            d3.select('#help-text').text('Tip: Click sector to view companies in that sector')
                            //that.map.chord.highlightChord(d)
                        }
                    }
                } else {
                    if (!that.clicked) {
                        let compSelection = d;
                        d3.select('#sectors').selectAll('tr').filter(d => d == compSelection.sector).classed('bold', true);
                        d3.select(this).classed('bold', true);
                        that.highlightItem(d.company);

                        // draw the links and also highlighted the connected nodes
                        links = that.map.drawCompLinks(d);
                        let filterLinks = [];
                        for (let link of links) {
                            if (!filterLinks.includes(link.from_company_id)) {
                                filterLinks.push(link.from_company_id);
                                that.highlightItem(link.from_company_id, true);
                            }
                        }
                        d3.select('#help-text').text('Tip: Click on a company to explore links with other companies');
                    }
                    ;
                }
            })
            .on('mouseout', function () {
                if (that.table === '#sectors') {
                    if (!that.clicked) {
                        if (!that.map.companyDropdown.clicked) {
                            d3.select('#comp-dropdown').selectAll('tr').classed('bold', false);
                            d3.select(this).classed('bold', false);
                            d3.selectAll('circle').classed('selected', false);
                            d3.select('#help-text').text('Tip: Click on a state to see companies in that state');
                        }
                    }   
                } else {
                    if (!that.map.companyDropdown.clicked) {
                        d3.select('#sectors').selectAll('tr').classed('bold', false);
                        d3.select('#comp-dropdown').selectAll('tr').classed('bold', false);
                        d3.select(this).classed('bold', false);
                        d3.select('#map').selectAll('line').remove();
                        d3.selectAll('circle').classed('selected', false);
                        d3.select('#help-text').text('Tip: Click on a state to see companies in that state');
                    }
                    else {
                        d3.select('#help-text').text('Tip: Click on the ocean to reset selection');
                    }
                }
            })
            // Click a company to 'lock in' its links, clicked a sector to cancel this
            .on('click', function (d) {
                if (that.table === '#sectors') {
                    that.clicked = true;
                    d3.select('#sectors').selectAll('tr').classed('bold', false);
                    d3.select(this).classed('bold', true);
                    that.map.companyDropdown.clicked = false;
                    that.map.findCompanies(this.textContent, "Sector");
                    //that.map.findSectors(companies);
                } else {
                    if (that.clicked) {
                        d3.select('#map').selectAll('line').remove();
                        d3.selectAll('circle').classed('selected', false);
                    }
                    that.clicked = true;
                    that.map.resetView();
                    d3.select('#comp-dropdown').selectAll('tr').classed('bold', false);
                    d3.select(this).classed('bold', true);
                    that.highlightItem(d.company);

                    links = that.map.drawCompLinks(d);

                    let filterLinks = [];
                    for (let link of links) {
                        if (!filterLinks.includes(link.from_company_id)) {
                            filterLinks.push(link.from_company_id);
                            that.highlightItem(link.from_company_id, true);
                        }
                    }
                    d3.select('#help-text').text('Tip: Click on the ocean to reset selection');
                }
            })
    }

    highlightItem(hoveredName, links = false) {
        let that = this;

        // a sector is highlighted...
        if (this.table === '#sectors') {
            let stateName = d3.select('#company-in-state').text();
            let abbr;
            //Fetch the abbreviation of the current state that is selected
            for (let state of this.map.stateData) {
                if (state.state === stateName) {
                    abbr = state.abbreviation;
                    break;
                }
            }

            //Highlight companies when state/sector selected
            d3.select('#comp-dropdown').select('tbody')
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
                    .filter(d => d.state.includes(abbr))
                    .classed('selected', function () {
                        this.parentElement.appendChild(this);
                        return true;
                    })
            }
        }
        // a company is highlighted...
        else {
            // Highlight single company
            if (!links) {
                d3.selectAll('circle').filter(d => d.company === hoveredName)
                    .classed('selected', function (d) {
                        this.parentElement.appendChild(this);
                        // //Display company info
                        that.map.infoBox.company = d;
                        that.map.infoBox.updateInfo();
                        return true;
                    })
            }
            // Highlight linked companies
            else {
                d3.selectAll('circle').filter(d => d.company_id === hoveredName)
                    .classed('selected', function (d) {
                        this.parentElement.appendChild(this);
                        return true;
                    })
            }
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
        this.active = d3.select(null);
        //for fast lookup of companies
        this.company_id_dict = {};
    }

    // Create map of the US
    drawMap() {
        // Calculate total market cap of each state 
        this.stateData.forEach(function (element) {
            element.marketCap = 0;
        });
        for (let company of this.companyData) {
            this.company_id_dict[company.company_id] = company.company;
            for (let state of this.stateData) {
                if (company.state.includes(state.abbreviation)) {
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
                } else if (company.company_id === to) {
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
        this.compLinks = newCompLinks;

        let that = this;
        let us = this.mapData;
        let path = d3.geoPath();
        let map = d3.select("#map-view");
        map = map.append('svg')
            .attr('id', 'map')
            .attr('viewBox', '-90 -30 1100 700');

        // Bounding rect
        let map_width = map.node().getBoundingClientRect().width; //1100
        let map_height = map.node().getBoundingClientRect().height; // 700

        map.on('click', function () {
            //If the map (but not a state) is clicked, clear company table/reset sector table
            if (!that.stateClicked) {
                d3.selectAll('path').classed('outline-state', false);
                that.stateInfo(null);
                d3.select('#comp-dropdown').select('tbody').selectAll('tr').remove();
                d3.select('#map').selectAll('line').remove();
                d3.selectAll('circle').classed('selected', false);
                that.findSectors(that.companyData);
                that.currentState = null;
                that.resetView();
                that.companyDropdown.elements = that.companyDropdown.countryData;
                that.companyDropdown.stateData = that.companyDropdown.countryData;
                that.companyDropdown.makeTable();
                that.companyDropdown.clicked = false;
                d3.select('#help-text').text('Tip: Click on a state to see companies in that state');
            }
            that.sectorTable.clicked = false;
            d3.select('#sectors').selectAll('tr').classed('bold', false);
            that.stateClicked = false;
        });


        let mapGroup = map.append("g")
            .attr("class", "states");

        //Scale for coloring states by market cap
        let minMcap = d3.min(this.stateData, (d) => d.marketCap);
        let maxMcap = d3.max(this.stateData, (d) => d.marketCap);
        let scaleStateColor = d3.scaleLinear()
            .domain([minMcap, maxMcap])
            .range([0, 1]);

        // let scaleLegend = d3.scaleLinear()
        //     .domain([minMcap, maxMcap])
        //     .range([0, 100]);

        // let xAxis = d3.axisBottom(scaleLegend)
        //     // .tickSize(16)
        //     // .tickValues(xTicks);


        // Draw US map
        mapGroup.selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr('class', 'state')
            // //Color states by market cap
            .attr('style', function (d, i) {
                return 'fill: ' + d3.interpolateRgb('#EEEFEE', 'gray')(scaleStateColor(that.stateData[i].marketCap))
            })
            .attr("d", path)
            //Display state name and companies in that state when clicked
            .on('click', function (d, i) {
                d3.selectAll('path').classed('outline-state', false);
                d3.select(this).classed('outline-state', true);
                that.stateClicked = true;
                that.currentState = that.stateData[i];
                that.stateInfo(that.stateData[i]);
                let companies = that.findCompanies(that.stateData[i].abbreviation, "Address");
                that.findSectors(companies);
                that.clicked(d, this);
                d3.select('#help-text').text('Tip: Click on the ocean to reset selection');
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

        // Make the map view zoomable
        const zoom = d3.zoom()
            .scaleExtent([1, 6])
            .translateExtent([[0, 0], [map_width, map_height]])
            .extent([[0, 0], [map_width, map_height]])
            .on("zoom", function () {
                mapGroup.attr("transform", d3.event.transform);
            });
        map.call(zoom);

        // Draw companies on the map
        this.drawNodes(this.companyData);

        //Draw infoBox to display company information
        this.infoBox = new companyInfoBox;

        // // Give university and company toggle buttons functionality
        // d3.select('#univ-button').on('click', () => this.drawNodes(this.univData));
        // d3.select('#comp-button').on('click', () => this.drawNodes(this.companyData));

        // Create sector table
        this.findSectors(this.companyData);

        // Create company table
        this.companyDropdown = new Table(this.companyData, "#comp-dropdown", this);
        this.companyDropdown.countryData = this.companyData;
        this.companyDropdown.stateData = this.companyData;
        this.companyDropdown.makeTable();

        d3.select("#map-view").append("div").attr('id', "company-in-state").append("text")
            // .attr("x", 0).attr("y", 0)
            .text('United States');

        // Give the user tips about how to explore our visualization
        let title_height = d3.select('#title').node().getBoundingClientRect().height;
        d3.select('#map-view').append('div')
            .attr('id', 'help-text')
            .attr('style', 'top: ' + (map_height+title_height-20) + 'px; left: 1%; position: absolute;')
            .append('text')
            .text('Tip: Click on a state to see companies in that state');

        // Add color gradient legend
        let legendTitle = d3.select('#map-view').append('div')
            .attr('style', 'top: ' + (map_height+title_height-40) + 'px; left: ' + (map_width-310) + 'px; position: absolute;')
            .append('text')
            .classed('legend-text', true)
            .text('Aggregate market cap in millions');

        let legend = d3.select('#map-view').append('div')
            .attr('id', 'gradient-legend')
            .attr('style', 'top: ' + (map_height+title_height-20) + 'px; left: ' + (map_width-350) + 'px; position: absolute;');
        legend.append('text')
            .classed('legend-text', true)
            .text('$' + minMcap);

        let legSVG = legend.append('svg')
            .attr('width', '200')
            .attr('height', '10');

        legend.append('text')
            .classed('legend-text', true)
            .text('$' + maxMcap);
        //Append a defs element to the svg
        let defs = legSVG.append("defs");
        //Append a linearGradient element
        let linearGradient = defs.append("linearGradient")
            .attr("id", "linear-gradient");
        linearGradient
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");
        //Set the color for the start 
        linearGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#EEEEEE"); 
        //Set the color for the end
        linearGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", () => d3.interpolateRgb('#EEEFEE', 'gray')(scaleStateColor(maxMcap)));
        //Draw the rectangle and fill with gradient
        legSVG.append("rect")
        .attr("width", 200)
        .attr("height", 10)
        .style("fill", "url(#linear-gradient)");
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
        let selected = false;

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
                    d3.select(this)
                        .classed("markers", false)
                        .classed("selected", function () {
                            if (this.classList.contains('selected')) {
                                selected = true;
                                return true;
                            }
                        });

                    // show the tooltip for companies
                    d3.select("#map-view").select(".tooltip")
                        .html(that.tooltipRender(d.company))
                        .style("opacity", 1)
                        .style("left", (d3.event.pageX + 10) + "px")
                        .style("top", (d3.event.pageY - 10) + "px");
                }
            })
            .on('mouseout', function (d) {
                d3.select(this)
                    .classed("markers", true)
                    .classed("selected", function () {
                        if (selected) {
                            selected = false;
                            return true;
                        } else return false;
                    });
                d3.select("#map-view").select(".tooltip")
                    .style("opacity", 0);
            })
            .on('click', function (d) {
                console.log(d);
            })
    }

    // Figure out all the sectors, create sector table
    findSectors(companies) {
        let splitIndex = null;
        let includesSectors = [];
        let excludesSectors = [];
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
            let excludesSectors = this.sectors.filter(function (e) {
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
    findCompanies(filterCriteria, filterType) {
        let companyArray = [];
        let datArray = this.companyData;
        let currentStateCompanies = this.companyDropdown.stateData;
        let elements = this.companyDropdown.elements.slice();
        if (filterType === 'Address') {
            for (let company of datArray) {
                let address = company.state;
                if (address.includes(filterCriteria)) {
                    companyArray.push(company);
                }
            }
            this.companyDropdown.elements = companyArray;
            this.companyDropdown.stateData = companyArray;
        } else {  // This is when filterType === "Sector"
            let flag = true;
            for (let company of currentStateCompanies) {
                if (flag) {
                    flag = false;
                    continue;
                }
                if (company.sector === filterCriteria) {
                    companyArray.push(company);
                }
            }
            this.companyDropdown.elements = companyArray;
            // this.companyDropdown.makeTable();
        }

        // Sort the company table by name
        companyArray.sort(function (a, b) {
            let x = a.company.toLowerCase();
            let y = b.company.toLowerCase();
            if (x < y)
                return -1;
            if (x > y)
                return 1;
            return 0;
        });

        /* let selection = */
        d3.select('#comp-dropdown').select('tbody').selectAll('tr').remove();

        this.companyDropdown.makeTable();
        this.companyDropdown.elements = elements;

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
            .attr('x1', d => that.projection([d.company_lng, d.company_lat])[0].toString())
            .attr('y1', d => that.projection([d.company_lng, d.company_lat])[1].toString())
            .attr('x2', d => that.projection([d.university_lng, d.university_lat])[0].toString())
            .attr('y2', d => that.projection([d.university_lng, d.university_lat])[1].toString())
            .attr('style', d => "stroke:" + d3.interpolateRgb('blue', 'red')(scaleNodeWeight(d.n_grad)) + ";stroke-width:" + scaleNodeWeight(d.n_grad));
    }

    // If some board member ever came to the current company from a different company
    // draw a link between the companies
    drawCompLinks(company) {
        let that = this;
        let links = [];

        // Find links to company (repeated)
        for (let link of this.compLinks) {
            if (link.to_company_id === company.company_id) {
                links.push(link);
            }
        }

        // Scale for link weights
        let minLink = d3.min(links, (d) => links.filter((obj) => obj.name_id === d.name_id).length);
        let maxLink = d3.max(links, (d) => links.filter((obj) => obj.name_id === d.name_id).length);
        let scaleNodeWeight = d3.scaleLinear()
            .domain([minLink, maxLink])
            .range([.5, 2]);

        // Draw selected company links to universities (repeated)
        d3.select('#map').select('g')
            .selectAll('line')
            .data(links)
            .enter().append('line')
            .attr('x1', d => that.projection([d.from_lng, d.from_lat])[0].toString())
            .attr('y1', d => that.projection([d.from_lng, d.from_lat])[1].toString())
            .attr('x2', d => that.projection([d.to_lng, d.to_lat])[0].toString())
            .attr('y2', d => that.projection([d.to_lng, d.to_lat])[1].toString())
            .attr('style', d => "stroke:" + d3.interpolateRgb('blue', 'red')
                (scaleNodeWeight(links.filter((obj) => obj.name_id === d.name_id).length))
                + ";stroke-width:" + scaleNodeWeight(links.filter((obj) => obj.name_id === d.name_id).length));

        return links;
    }

    // Display info about a state
    stateInfo(state) {
        d3.select('#company-in-state').text(state ? state.state : 'United States');
    }

    // click function
    clicked(d, currentNode) {

        // Zoom out of a state if it's zoomed in
        if (this.active.node() === currentNode) {
            return this.resetView(false);
        }

        this.active.classed("active", false);
        this.active = d3.select(currentNode).classed("active", true);

        let path = d3.geoPath();
        let bounds = path.bounds(d),
            dx = bounds[1][0] - bounds[0][0],
            dy = bounds[1][1] - bounds[0][1],
            x = (bounds[0][0] + bounds[1][0]) / 2,
            y = (bounds[0][1] + bounds[1][1]) / 2,
            scale = .8 / Math.max(dx / 1100, dy / 700),
            translate = [1100 / 2 - scale * x, 700 / 2 - scale * y];
        //!!!

        d3.select(".states")
            .transition()
            .duration(500)
            .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
    }


    // render the tooltip
    tooltipRender(datum) {
        let text = datum;
        return text;
    }

    /** Reset the map view to the whole US
     * @param resetLabel: whether resetting the state info as United States or keeping the current state
     */
    resetView(resetLabel = true) {
        this.active.classed("active", false);
        this.active = d3.select(null);

        if (resetLabel) {
            this.stateInfo(null);
        }
        d3.select(".states").transition()
            .duration(500)
            .attr("transform", "translate(0, 0)");
    }

}