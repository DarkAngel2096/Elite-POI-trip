// module imports
import fs from "fs";
import { distanceCalc, dynamicSort, nearestNeighbor, optimization2Opt } from "./helperFunctions.js";

import POIs from "./../data/within1kLy.json" assert { type: "json" };

const startTime = new Date();
console.log(`\nScript started at "${startTime.toLocaleTimeString()}", found "${POIs.length}" items in the POI list`);

let solCoords = { x: 0, y: 0, z: 0 };
// let sagACoords = { x: 25.21875, y: -20.90625, z: 25899.96875 };

// let within1kLy = [];
//
// for (let item of POIs) {
//     if (distanceCalc(solCoords, item.coords) < 2000) within1kLy.push(item);
// }
//
// console.log(within1kLy.length);
//
// fs.writeFileSync("./../data/within1kLy.json", JSON.stringify(within1kLy, null, "\t"));

let nearestTime = performance.now();

let initialTrip = nearestNeighbor(POIs);

console.log(`took ${performance.now() - nearestTime}ms to do nearest neighbors`);

optimization2Opt(initialTrip);


const endTime = new Date();
console.log(`\nScript ended at "${endTime.toLocaleTimeString()}", taking "${endTime - startTime}"ms to finish`);

/*
list of types

minorPOI: 481
nebula: 218
planetaryNebula: 242
blackHole: 57
historicalLocation: 60
planetFeatures: 227
stellarRemnant: 151
pulsar: 14
starCluster: 73
surfacePOI: 22
mysteryPOI: 47
organicPOI: 14
geyserPOI: 33
    = 1639

**regional: 29
**deepSpaceOutpost: 41
    = 70

~~jumponiumRichSystem: 76
~~restrictedSectors: 22
~~independentOutpost: 64
~~region: 64
~~travelRoute: 4
~~historicalRoute: 4
~~minorRoute: 15
~~neutronRoute: 7
    = 256

nothing at the start, go to
** maybe
~~ don't go
*/
