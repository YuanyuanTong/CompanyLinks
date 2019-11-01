

d3.json("https://d3js.org/us-10m.v1.json").then(function(us) {

    // if (error) throw error;

    let map = new Map(us);
    map.drawMap();

    let chord = new Chord;
    chord.drawChord();

    // Draw some test points on the map
    let SLC = [41, -112];
    let Sacramento = [39, -122];
    let Portland = [45, -123];
    let Chicago = [42, -88];

    map.drawPlace(SLC);
    map.drawPlace(Sacramento);
    map.drawPlace(Portland);
    map.drawPlace(Chicago);

});


