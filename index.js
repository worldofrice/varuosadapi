/*
const data = [
    { Year: '2001', Teams: '32', Matches: '64', Goals: '161' },
    { Year: '2011', Teams: '53', Matches: '33', Goals: '111' }
  ];
  
const res = data.map(({ Year, Matches }) => ({ Year, Matches }));
console.log(res)
*/

// sn (serialnr), name, warehouse1, warehouse2, warehouse3, 
// warehouse4, warehouse5, reserved, price, type, pricevat

import fs from 'fs';
import csv from 'csv-parser';
import express from 'express';
import _ from 'lodash';

const app = express()
const port = 3344
const pagesize = 30
const csvdata = [];
const csvheaders = ["sn", "name", "warehouse1", "warehouse2", "warehouse3", "warehouse4", "warehouse5", "reserved", "price", "type", "pricevat"];

fs.createReadStream('LE.txt')
  .pipe(csv({ separator: '\t', headers: csvheaders }))
  .on('data', (data) => csvdata.push(data))
  .on('end', () => {
});


app.get('/spare-parts', (req, res) => {
    let csvcopy = csvdata
    let searchbfr = []
    const pagenumber = req.query.page || 1;
    const startindex = (pagenumber - 1) * pagesize;
    const endindex = startindex + pagesize;

    csvheaders.forEach(function(search) {
        if (_.has(req.query, search)) {
            console.log(search, req.query[search])
            _.each(csvcopy, function(value, key) {
                if (_.startsWith(_.toLower(value[search]), _.toLower(req.query[search]))) {
                    console.log(value)
                    searchbfr.push(value)
                }
            })
        }
    });

    if (searchbfr) {
        csvcopy = searchbfr
    }

    if (req.query.sort) {
        csvcopy = _.sortBy(csvcopy, [req.query.sort])
        if (req.query.sort.startsWith == "-") {
            csvcopy = _.invert(csvcopy)
        }
    }

    res.json(csvcopy.slice(startindex, endindex));
});

app.get('/spare-parts/search/:search', (req, res) => {
    let csvcopy = csvdata
    let searchbfr = []
    const search = req.params.search
    const pagenumber = req.query.page || 1;
    const startindex = (pagenumber - 1) * pagesize;
    const endindex = startindex + pagesize;
    console.log(search)

    csvheaders.forEach(function(header) {
        console.log(header, search)
        _.each(csvcopy, function(value, key) {
            if (_.startsWith(_.toLower(value[header]), _.toLower(search))) {
                console.log(value)
                searchbfr.push(value)
            }
        })
    });

    if (searchbfr) {
        csvcopy = searchbfr
    } 

    if (req.query.sort) {
        csvcopy = _.sortBy(csvcopy, [req.query.sort])
        if (req.query.sort.startsWith == "-") {
            csvcopy = _.invert(csvcopy)
        }
    }

    res.json(csvcopy.slice(startindex, endindex));
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
    console.log(`http://localhost:${port}/spare-parts`)
    console.log("?sort", "?page", "?sn", "?name", "?warehouse1", "?warehouse2", "?warehouse3", "?warehouse4", "?warehouse5", "?reserved", "?price", "?type", "?pricevat")
    console.log(`http://localhost:${port}/spare-parts/search`)
    console.log("?sort", "?page")
});