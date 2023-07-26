// module imports
import { calculateDistancesBetweenAll, randomNearestNeighbor, nearestNeighbor,  optimization2Opt, optimizationKopt } from "./helperFunctions.js";

// import pointListFull from "./../data/CleanedCoords.json" assert { type: "json" };
// import pointList from "./../data/NearSol.json" assert { type: "json" };
// import pointList1 from "./../data/within1kLy.json" assert { type: "json" };
// import pointList2 from "./../data/within5kLy.json" assert { type: "json" };
// import pointList3 from "./../data/within10kLy.json" assert { type: "json" };
// import pointList4 from "./../data/within20kLy.json" assert { type: "json" };
// import pointList5 from "./../data/within35kLy.json" assert { type: "json" };

// function to do the complete part of 2-opt
export const do2opt = (inputList, shouldLog = false) => {
    const startTime = new Date();
    if (shouldLog) console.log(`\nScript started at "${startTime.toLocaleTimeString()}", found "${inputList.length}" items in the POI list`);

    // do all the distance calculations between all points
    let distancesCalcStart = performance.now();
    let { distances, idToIndexMap } = calculateDistancesBetweenAll(inputList)
    if (shouldLog) console.log(`took ${performance.now() - distancesCalcStart}ms to do all distance calculations`);

    // do the initial trip initalization
    let nearestTime = performance.now();
    // let initialPath = nearestNeighbor(inputList, distances, idToIndexMap);
    // if (shouldLog) console.log(`took ${performance.now() - nearestTime}ms to do nearest neighbors`);

    let initialPath = randomNearestNeighbor(inputList, 2, distances, idToIndexMap);
    if (shouldLog) console.log(`took ${performance.now() - nearestTime}ms to do randomized nearest neighbors`);

    // create an array containing the point id's for the inital path
    let initialPathIndexArray = {
        path: initialPath.path.map(item => item.id),
        totalDistance: initialPath.totalDistance
    };

    // do the 2-opt optimization
    let optTime = performance.now();
    let finalDetails = optimization2Opt(initialPathIndexArray, distances, idToIndexMap);
    if (shouldLog) console.log(`took ${performance.now() - optTime}ms to do 2-opt`);

    // do k-opt, input the amount of pairs to check through each Loop
    // let finalDetails = optimizationKopt({ initialPath: initialPathIndexArray, distancesData: distances, distancesIndexArray: idToIndexMap, complexity: 5´});
    // if (shouldLog) console.log(`took ${performance.now() - optTime}ms to do k-opt`);

    if (shouldLog) console.log(`Started from: "${initialPath.totalDistance.toFixed(4)}"Ly, went down to: "${finalDetails.totalDistance.toFixed(4)}"Ly. ` +
        `(down by: "${((1 - (finalDetails.totalDistance / initialPath.totalDistance)) * 100).toFixed(4)}"%)`);

    const endTime = new Date();
    if (shouldLog) console.log(`Script ended at "${endTime.toLocaleTimeString()}", taking "${endTime - startTime}"ms to finish\n`);

    return finalDetails;
}

// do2opt(pointList1, true);
// do2opt(pointList2, true);
// do2opt(pointList3, true);
// do2opt(pointList4, true);
// do2opt(pointList5, true);

// do2opt(pointListFull, true);

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
