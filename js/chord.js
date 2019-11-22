// class for the chord diagram
class Chord {
    constructor(data) {
        this.ind_matrix = data;
        this.ind_names;
        this.sector;
    }

    drawChord() {
        // Convert object to matrix data
        let ind_link_data = [];
        for (let item of this.ind_matrix) {
            for (let i = 0; i < this.ind_matrix.length; i++) {
                if (ind_link_data[i]) {
                    ind_link_data[i].push(item[i+1]);
                }
                else {
                    ind_link_data.push([]);
                    ind_link_data[i].push(item[i+1]);
                }
            }
        }
        this.ind_matrix = ind_link_data;

        let chord = d3.select('#chord-diagram')
            .append('svg')
            .attr('width', 440)
            .attr('height', 440)
            .append("g")
            .attr("transform", "translate(220,220)");
        
        //ind_link_data = ind_link_data.slice(10, 20);

        this.ind_names = ["Aerospace & Defence", "Automobiles & Parts", "Banks", "Beverages", "Blank Check / Shell Companies", "Business Services", "Chemicals", "Clothing & Personal Products", "Construction & Building Materials", "Consumer Services", "Containers & Packaging", "Diversified Industrials", "Education", "Electricity", "Electronic & Electrical Equipment", "Engineering & Machinery", "Food & Drug Retailers", "Food Producers & Processors", "Forestry & Paper", "General Retailers", "Health", "Household Products", "Information Technology Hardware", "Insurance", "Investment Companies", "Leisure & Hotels", "Leisure Goods", "Life Assurance", "Media & Entertainment", "Mining", "Oil & Gas", "Pharmaceuticals and Biotechnology", "Private Equity", "Publishing", "Real Estate", "Renewable Energy", "Software & Computer Services", "Speciality & Other Finance", "Steel & Other Metals", "Telecommunication Services", "Tobacco", "Transport", "Utilities - Other", "Wholesale Trade"]
        //ind_names = ind_names.slice(10, 20);

        // give this matrix to d3.chord(): it will calculates all the info we need to draw arc and ribbon
        let res = d3.chord()
            .padAngle(0.05)     // padding between entities (black arc)
            .sortSubgroups(d3.descending)
            (ind_link_data)

        // add the groups on the inner part of the circle
        chord.datum(res)
            .append("g")
            .selectAll("g")
            .data(function(d) { return d.groups; })
            .enter()
            .append("g")
            .append("path")
            .style("fill", "grey")
            .style("stroke", "black")
            .attr("d", d3.arc()
                .innerRadius(200)
                .outerRadius(210)
            )

        // Add the links between groups
        chord.datum(res)
            .append("g")
            .attr('id', 'chords')
            .selectAll("path")
            .data(function(d) { return d; })
            .enter()
            .append("path")
            .attr("d", d3.ribbon()
                .radius(200)
            )
            .style("fill", "#69b3a2")
            .style("stroke", "black");

        // Add text label
        chord.append("text")
            .data(this.ind_names)
            .text(d=>{return d})
    }

    // Highlight a chord by sector name (or eventually, company name)
    highlightChord(item) {
        let that = this;
        let chord = d3.select('#chord-diagram')
            .select('svg');
            
        chord.select('text')
            .text(item);

    }
}