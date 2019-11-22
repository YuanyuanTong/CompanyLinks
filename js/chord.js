
class Chord {
    constructor(data) {
        this.width = 1000
        this.height = 1000
        this.ind_matrix = data
        this.opacityDefault = 0.8
        this.innerRadius = this.width * 0.15
        this.outerRadius = this.innerRadius * 1.1

    }

    drawChord() {
        let that = this
        // Convert object to matrix data
        let ind_link_data = []
        for (let item of that.ind_matrix) {
            for (let i = 0; i < that.ind_matrix.length; i++) {
                if (ind_link_data[i]) {
                    ind_link_data[i].push(item[i+1]);
                }
                else {
                    ind_link_data.push([])
                    ind_link_data[i].push(item[i+1]);
                }
            }
        }
        this.ind_matrix = ind_link_data;

        // parepare data
        ind_link_data = ind_link_data.slice(10,20);

        let ind_names = ["Aerospace & Defence", "Automobiles & Parts", "Banks", "Beverages", "Blank Check / Shell Companies", "Business Services", "Chemicals", "Clothing & Personal Products", "Construction & Building Materials", "Consumer Services", "Containers & Packaging", "Diversified Industrials", "Education", "Electricity", "Electronic & Electrical Equipment", "Engineering & Machinery", "Food & Drug Retailers", "Food Producers & Processors", "Forestry & Paper", "General Retailers", "Health", "Household Products", "Information Technology Hardware", "Insurance", "Investment Companies", "Leisure & Hotels", "Leisure Goods", "Life Assurance", "Media & Entertainment", "Mining", "Oil & Gas", "Pharmaceuticals and Biotechnology", "Private Equity", "Publishing", "Real Estate", "Renewable Energy", "Software & Computer Services", "Speciality & Other Finance", "Steel & Other Metals", "Telecommunication Services", "Tobacco", "Transport", "Utilities - Other", "Wholesale Trade"]
        ind_names = ind_names.slice(10,20);

        // create svg
        let svg = d3.select('#chord-diagram')
        .append('svg')
        .attr('width', that.width)
        .attr('height', that.height)
        .append("g")
        .attr("transform", "translate("+(that.height/2)+", "+(that.width/2)+")")

        let chord = d3.chord()
            .padAngle(0.05)     // padding between entities (black arc)
            .sortSubgroups(d3.descending)
            (ind_link_data)

        let arc = d3.arc()
            .innerRadius(that.innerRadius)
            .outerRadius(that.outerRadius)

        // let path = d3.chord()
        //     .radius(this.innerRadius);

        // draw outer arcs
        let outerArcs = svg.selectAll("g.group")
            .data(chord.groups)
            .enter().append("g")
            .attr("class", "group")

        outerArcs.append("path")
            // .style("fill", function(d) { return colors(d.index); })
            .attr("d", arc);


        // append names
        //Append the label names on the outside
        outerArcs.append("text")
            .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
            .attr("dy", ".35em")
            .attr("class", "titles")
            .text(function(d,i) { return ind_names[i]; })
            .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
            .attr("transform", function(d) {
                return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                + "translate(" + (that.outerRadius) + ", " + (0) + ")"
                + (d.angle > Math.PI ? "rotate(180)" : "");
            })



        /*
        // add the groups on the inner part of the circle
        svg.datum(chord)
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
        svg.datum(chord)
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
        svg.append("text")
            .data(ind_names)
            .text(d=>{return d})
            .attr("dy", ".35em")
        
        */
    }

    // Highlight a chord by sector name (or eventually, company name)
    highlightChord(item) {
        let that = this;
        let chord = d3.select('#chord-diagram')
            .select('svg')
            
        chord.select('text')
            .text(item);

    }
}