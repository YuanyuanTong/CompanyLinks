loadData().then(data => {

    console.log(data)

    d3.json("https://d3js.org/us-10m.v1.json").then(function(usData) {

        // if (error) throw error;

        let map = new Map(data, usData);
        map.drawMap();

        let chord = new Chord;
        chord.drawChord();

        // let portland = [45.6, -123]
        // map.drawPlace(portland)
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
    let company_coords = await loadFile('data/partial_company_coordinates.csv');

    return {
        'company-coordinates': company_coords
    };
}