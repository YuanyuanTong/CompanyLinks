/** data structure for an individual company. */
class companyData {
    /**
     * @param id: company id
     * @param lat: latitude of the company
     * @param lng: longitude of the company
     */
    constructor(id, lat, lng) {
        this.id = id;
        this.lat = lat;
        this.lng = lng;
    }
}

/** data structure for an individual university */
class universityData {
    /**
     * @param id: university id
     * @param lat: latitude of the university
     * @param lng: longitude of the university
     */
    constructor(id, lat, lng) {
        this.id = id;
        this.lat = lat;
        this.lng = lng;
    }
}

// a list of companyData
let companyCoordinates = [];
// a list of universityData
let universityCoordinates = [];
// a list of university id
let universityList = [];
// a list of company address and id
let addressList = [];
// a list recording current stored company in the database
let tmpList = [];
// a list recording current stored company in the database
let tmpUniversityList = [];

// make time delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// get the tmp data for university
d3.csv("data/tmp_university.csv").then(data => {
    for (let d of data) {
        tmpUniversityList.push(d.id);
    }
})

// get a full non-repeating list of university ids
d3.csv("data/edu.csv").then(async function(data) {
    for (let d of data) {
        if (!tmpUniversityList.includes(d.university_id)) {
            universityList.push(d);
        }
    }

    for (let key in universityList) {
        // geocoder class
        let geocoder = new google.maps.Geocoder();
        geocoder.geocode({'address': universityList[key].university}, function (results, status) {
            console.log(status);
            if (status === google.maps.GeocoderStatus.OK) {
                let latitude = results[0].geometry.location.lat();
                let longitude = results[0].geometry.location.lng();
                let datum = new universityData(universityList[key].university_id, latitude, longitude);
                universityCoordinates.push(datum);
            }
        });
        await sleep(500);
    }
})


// // get the tmp data for company
// d3.csv("data/tmp_data.csv").then(data => {
//     for (let d of data) {
//         tmpList.push(d.id);
//     }
// })

// // read data from the file
// d3.csv("data/f_firm_prof.csv").then(async function(data)  {
//     for (let d of data) {
//         if (!tmpList.includes(d.company_id)) {
//             addressList.push({"address": d.headoffice_address, "id": d.company_id});
//         }
//     }
//
//     for (let key in addressList){
//         // geocoding class
//         let geocoder = new google.maps.Geocoder();
//         geocoder.geocode({'address': addressList[key].address}, function (results, status) {
//             console.log(status);
//             if (status === google.maps.GeocoderStatus.OK) {
//                 let latitude = results[0].geometry.location.lat();
//                 let longitude = results[0].geometry.location.lng();
//                 let datum = new companyData(addressList[key].id, latitude, longitude);
//                 companyCoordinates.push(datum);
//             }
//         });
//         await sleep(1000);
//     }
//
// });

// convert an array to csv file
function convertArrayOfObjectsToCSV(args) {
    let result, ctr, keys, columnDelimiter, lineDelimiter, data;

    data = args.data || null;
    if (data == null || !data.length) {
        return null;
    }

    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || '\n';

    keys = Object.keys(data[0]);

    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach(function (item) {
        ctr = 0;
        keys.forEach(function (key) {
            if (ctr > 0) result += columnDelimiter;

            result += item[key];
            ctr++;
        });
        result += lineDelimiter;
    });
    return result;
}

// the onclick function for downloading the csv file
// different arguments for different data (i.e., university/college)
function downloadCSV(args) {
    let data, filename, link;

    filename = args.filename || "export.csv";

    let csv = null;
    if (filename === "company-data.csv") {
        csv = convertArrayOfObjectsToCSV({
            data: companyCoordinates
        });
    }
    if (filename === "university-data.csv") {
        csv = convertArrayOfObjectsToCSV({
            data: universityCoordinates
        });
    }
    if (csv == null) return;

    if (!csv.match(/^data:text\/csv/i)) {
        csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    data = encodeURI(csv);

    link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
}



