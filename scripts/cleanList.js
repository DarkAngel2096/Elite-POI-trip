// module imports
import fs from "fs";
import { distanceCalc, calculateDistancesBetweenAll, nearestNeighbor, optimization2Opt } from "./helperFunctions.js";

// import pointList from "./../data/CleanedCoords.json" assert { type: "json" };
// import pointList from "./../data/NearSol.json" assert { type: "json" };
// import pointList from "./../data/within1kLy.json" assert { type: "json" };
// import pointList from "./../data/within5kLy.json" assert { type: "json" };
// import pointList from "./../data/within10kLy.json" assert { type: "json" };
// import pointList from "./../data/within20kLy.json" assert { type: "json" };
import pointList from "./../data/within35kLy.json" assert { type: "json" };


const startTime = new Date();
console.log(`\nScript started at "${startTime.toLocaleTimeString()}", found "${pointList.length}" items in the POI list\n`);
/*
let solCoords = { x: 0, y: 0, z: 0 };
let sagACoords = { x: 25.21875, y: -20.90625, z: 25899.96875 };

let within20kLy = [];

for (let item of pointList) {
    if (distanceCalc(solCoords, item.coords) < 20000) within20kLy.push(item);
}

console.log(within20kLy.length);

fs.writeFileSync("./../data/within20kLy.json", JSON.stringify(within20kLy, null, "\t"));
*/


// do all the distance calculations between all points
let distancesCalcStart = performance.now();
let distancesObject = calculateDistancesBetweenAll(pointList);
console.log(`took ${performance.now() - distancesCalcStart}ms to do all distance calculations`);

// do the initial trip initalization
let nearestTime = performance.now();
let initialPath = nearestNeighbor(pointList, distancesObject);
console.log(`took ${performance.now() - nearestTime}ms to do nearest neighbors`);

// create an array containing the point id's for the inital path
let initialPathIndexArray = {
    path: initialPath.path.map(item => item.id),
    totalDistance: initialPath.totalDistance
};

// do the 2-opt optimization
let optTime = performance.now();
optimization2Opt(initialPathIndexArray, distancesObject);
console.log(`took ${performance.now() - optTime}ms to do 2-opt`);

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
