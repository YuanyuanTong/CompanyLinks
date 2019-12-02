loadData().then(data => {

    // Map view
    let map;
    d3.json("data/us.json").then(function (usData) {
        // if (error) throw error;
        map = new Map(data['company'], usData);
        map.drawMap();
    });

    // Chord view
    let chord = new Chord(data['sector-links'], updateSector);
    chord.drawChord();

    // Default tooltips (invisible)
    d3.select("#map-view").append('div')
        .classed("tooltip", true)
        .style("opacity", 0);
    d3.select("#chord").append('div')
        .classed("tooltip", true)
        .style("opacity", 0);

    function updateSector(sectorName){
        map.sectorTable.highlightItem(sectorName);
    }

});

// Data loading functions
async function loadFile(file) {
    let data = await d3.csv(file).then(d => {
        let mapped = d.map(g => {
            for (let key in g) {
                let numKey = +key;
                if (numKey) {
                    g[key] = +g[key];
                }
            }
            return g;
        });
        return mapped;
    });
    return data;
}

async function loadData() {
    let company_data = await loadFile('data/f_firm_prof.csv');
    let state_data = await loadFile('data/states.csv');
    let university_data = await loadFile('data/top500_uni.csv');
    let company_univ_links = await loadFile('data/link_firm_uni.csv');
    let company_links = await loadFile('data/f_firm_net.csv');
    let sector_links = await loadFile('data/ind_matrix_full.csv');

    return {
        'company': {
            'company-data': company_data,
            'state-data': state_data,
            'university-data': university_data,
            'company-univ-links': company_univ_links,
            'company-links': company_links
        },
        'sector-links': sector_links,
    };
}