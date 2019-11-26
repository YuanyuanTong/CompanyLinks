loadData().then(data => {

    d3.json("data/us.json").then(function (usData) {
        // if (error) throw error;
        let map = new Map(data['company'], usData);
        let chord = new Chord(data['sector-links']);
        console.log(data['individual']);

        map.drawMap();
        chord.drawChord();
        // map.chord = chord;

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
    let company_data = await loadFile('data/processed_company_data.csv');
    let state_data = await loadFile('data/states.csv');
    let university_data = await loadFile('data/top500_uni.csv');
    let company_univ_links = await loadFile('data/link_firm_uni.csv');
    let company_links = await loadFile('data/f_firm_net.csv');
    let sector_links = await loadFile('data/ind_matrix_full.csv');
    let employment_data = await loadFile('data/f_ind_emp_new.csv');
    let education_data = await loadFile('data/f_ind_edu_new.csv');
    let individual_data = await loadFile('data/f_ind_prof.csv');

    return {
        'company':{
            'company-data': company_data,
            'state-data': state_data,
            'university-data': university_data,
            'company-univ-links': company_univ_links,
            'company-links': company_links
        },
        'sector-links': sector_links,
        'individual':{
            'employment': employment_data,
            'education': education_data,
            'profile': individual_data
        }
    };
}