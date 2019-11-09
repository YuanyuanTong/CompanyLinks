loadData().then(data => {

    console.log(data)

    d3.json("https://d3js.org/us-10m.v1.json").then(function(usData) {

        // if (error) throw error;

        let map = new Map(data, usData);
        map.drawMap();

        // let chord = new Chord;
        // chord.drawChord();

        // Find all unique sectors
        map.findSectors();
    });
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
    let company_data = await loadFile('data/partial_company_coordinates.csv');
    let state_data = await loadFile('data/states.csv')
    // let company_info = await loadFile('data/f_firm_prop.csv')


    return {
        'company-data': company_data,
        'state-data': state_data
        // 'company-info': company_info
    };
}