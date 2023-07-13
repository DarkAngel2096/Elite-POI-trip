// module imports
import { calculateDistancesBetweenAll, randomNearestNeighbor, nearestNeighbor,  optimization2Opt } from "./helperFunctions.js";

// import pointList from "./../data/CleanedCoords.json" assert { type: "json" };
// import pointList from "./../data/NearSol.json" assert { type: "json" };
// import pointList from "./../data/within1kLy.json" assert { type: "json" };
// import pointList from "./../data/within5kLy.json" assert { type: "json" };
// import pointList from "./../data/within10kLy.json" assert { type: "json" };
// import pointList from "./../data/within20kLy.json" assert { type: "json" };
// import pointList from "./../data/within35kLy.json" assert { type: "json" };

// function to do the complete part of 2-opt
export const do2opt = (inputList) => {
    const startTime = new Date();
    // console.log(`\nScript started at "${startTime.toLocaleTimeString()}", found "${inputList.length}" items in the POI list`);

    // do all the distance calculations between all points
    // let distancesCalcStart = performance.now();
    let distancesObject = calculateDistancesBetweenAll(inputList);
    // console.log(`took ${performance.now() - distancesCalcStart}ms to do all distance calculations`);

    // do the initial trip initalization
    // let nearestTime = performance.now();
    // let initialPath = nearestNeighbor(inputList, distancesObject);
    let initialPath = randomNearestNeighbor(inputList, 3, distancesObject);
    // console.log(`took ${performance.now() - nearestTime}ms to do nearest neighbors`);

    // create an array containing the point id's for the inital path
    let initialPathIndexArray = {
        path: initialPath.path.map(item => item.id),
        totalDistance: initialPath.totalDistance
    };

    // do the 2-opt optimization
    // let optTime = performance.now();
    let finalDetails = optimization2Opt(initialPathIndexArray, distancesObject);
    // console.log(`took ${performance.now() - optTime}ms to do 2-opt`);

    const endTime = new Date();
    // console.log(`Script ended at "${endTime.toLocaleTimeString()}", taking "${endTime - startTime}"ms to finish\n`);

    return finalDetails;
}

// console.log(do2opt(pointList).totalDistance);

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
