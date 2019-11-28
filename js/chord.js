// class for the chord diagram
class Chord {
    constructor(data, updateSector) {
        this.ind_matrix = data;
        this.ind_names = ["Aerospace & Defence", "Automobiles & Parts", "Banks", "Beverages", "Blank Check / Shell Companies", "Business Services", "Chemicals", "Clothing & Personal Products", "Construction & Building Materials", "Consumer Services", "Containers & Packaging", "Diversified Industrials", "Education", "Electricity", "Electronic & Electrical Equipment", "Engineering & Machinery", "Food & Drug Retailers", "Food Producers & Processors", "Forestry & Paper", "General Retailers", "Health", "Household Products", "Information Technology Hardware", "Insurance", "Investment Companies", "Leisure & Hotels", "Leisure Goods", "Life Assurance", "Media & Entertainment", "Mining", "Oil & Gas", "Pharmaceuticals and Biotechnology", "Private Equity", "Publishing", "Real Estate", "Renewable Energy", "Software & Computer Services", "Speciality & Other Finance", "Steel & Other Metals", "Telecommunication Services", "Tobacco", "Transport", "Utilities - Other", "Wholesale Trade"];
        this.updateSector = updateSector;
    }

    drawChord() {

        let that = this;
        // Convert object to matrix data
        let ind_link_data = [];
        for (let item of this.ind_matrix) {
            for (let i = 0; i < this.ind_matrix.length; i++) {
                if (ind_link_data[i]) {
                    ind_link_data[i].push(item[i + 1]);
                } else {
                    ind_link_data.push([]);
                    ind_link_data[i].push(item[i + 1]);
                }
            }
        }

        this.ind_matrix = ind_link_data;

        let chord = d3.select('#chord-diagram')
            .append('svg')
            .attr('width', 1100)
            .attr('height', 1100)
            .append("g")
            .attr("transform", "translate(550,550)");


        // give this matrix to d3.chord(): it will calculates all the info we need to draw arc and ribbon
        let res = d3.chord()
            .padAngle(0.02)     // padding between entities
            .sortSubgroups(d3.descending)
            (ind_link_data);

        // add the groups on the inner part of the circle
        let group = chord.datum(res)
            .append("g")
            .selectAll("g")
            .data(function (d) {
                return d.groups;
            })
            .join("g");
        group.append("path")
            .style("fill", "grey")
            .style("stroke", "black")
            .attr("d", d3.arc()
                .innerRadius(300)
                .outerRadius(310)
            )
            .on("mouseover", function (d) {
                that.updateSector(that.ind_names[d.index]);
            })
            .on("mouseout", function(){
                d3.select('#comp-dropdown').selectAll('tr').classed('bold', false);
                d3.selectAll('circle').classed('selected', false);
            });

        // Add the labels for each sector
        group.append("text")
            .each(d => {
                d.angle = (d.startAngle + d.endAngle) / 2;
            })
            .attr("dy", ".35em")
            .attr("transform", d => `rotate(${(d.angle * 180 / Math.PI - 90)})
            translate(320) ${d.angle > Math.PI ? "rotate(180)" : ""}`)
            .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
            .text((d, i) => this.ind_names[i]);

        //Container for the gradients
        let defs = d3.select('#chord-diagram').select("svg").append("defs");

        //Filter for the outside glow
        var filter = defs.append("filter")
            .attr("id","glow");

        filter.append("feGaussianBlur")
            .attr("class", "blur")
            .attr("stdDeviation","4.5") //!!!
            .attr("result","coloredBlur");

        var feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode")
            .attr("in","coloredBlur");
        feMerge.append("feMergeNode")
            .attr("in","SourceGraphic");

        // Add the links between groups
        chord.datum(res)
            .append("g")
            .attr('id', 'chords')
            .selectAll("path")
            .data(d => d)
            .enter()
            .append("path")
            .attr("d", d3.ribbon().radius(290))
            .style("fill", "#69b3a2")
            .on("mouseover", function (d) {
                // add a touch of glow to the hovered link
                d3.select(this)
                    .style("filter","url(#glow)");
                d3.select("#chord").select(".tooltip")
                    .html(that.tooltipRender(d))
                    .style("opacity", 1)
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY - 10) + "px");
            })
            .on("mouseout", function () {
                d3.select(this)
                    .style("filter","none");
                d3.select("#chord").select(".tooltip")
                    .style("opacity", 0);
            });

    }

    // Render the tooltip
    tooltipRender(datum) {
        let result = "<div> From " + this.ind_names[datum.source.index]
            + " to " + this.ind_names[datum.target.index] + "</div>";
        result = result + "<div>" + this.ind_matrix[datum.source.index][datum.target.index]+"</div>";
        return result;
    }

}