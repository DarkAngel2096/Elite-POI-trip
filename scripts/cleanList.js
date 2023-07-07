// module imports
import fs from "fs";
import { distanceCalc, nearestNeighbor } from "./helperFunctions.js";

import POIs from "./../data/NearSol.json" assert { type: "json" };

const startTime = new Date();
console.log(`\nScript started at "${startTime.toLocaleTimeString()}", found "${POIs.length}" items in the POI list`);

//let solCoords = {x: 0, y: 0, z: 0}
nearestNeighbor(POIs);


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
