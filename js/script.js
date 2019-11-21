loadData().then(data => {

    d3.json("https://d3js.org/us-10m.v1.json").then(function(usData) {

        // if (error) throw error;

        let map = new Map(data, usData);
        let chord = new Chord();

        map.drawMap();
        chord.drawChord();

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
// Data loading function for the chord diagram
// chord needs the input to be a "matrix" so 
// I have to implement a new load function
// Doesn't work for now
// async function loadFileArray(file) {
//     let data = await d3.csv(file).then(d => {
//         let mapped = d.map(g => {
//             g = d3.csvParseRows(g)
//             return g;
//         });
//         return mapped;
//     })
//     return data;
// }



async function loadData() {
    let company_data = await loadFile('data/partial_company_coordinates.csv');
    let state_data = await loadFile('data/states.csv');
    let university_data = await loadFile('data/top500_uni.csv');
    let company_univ_links = await loadFile('data/link_firm_uni.csv');
    let company_links = await loadFile('data/f_firm_net_split/f_firm_net_1.csv');
    // let sector_links = await loadFileArray('data/ind_matrix.csv')


    return {
        'company-data': company_data,
        'state-data': state_data,
        'university-data': university_data,
        'company-univ-links': company_univ_links,
        'company-links': company_links,
        // 'sector-links': sector_links
    };
}