
class Chord {
    constructor() {

    }

    drawChord() {

        let chord = d3.select('#second-view').append('svg').attr('id', 'chord');

        chord.append('rect').attr('id', 'chord-frame');
        
        
    }
}