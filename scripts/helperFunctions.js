// function that does euclidean distance calculations
export const distanceCalc = (point1, point2) => {
    return Math.sqrt(Math.pow((point1.x - point2.x), 2) +
    Math.pow((point1.y - point2.y), 2) +
    Math.pow((point1.z - point2.z), 2));
}

// function to create a matrix (2 dimensional array) containing all the distances, as well as an object with ID's as keys and index of it in the array as value
export const calculateDistancesBetweenAll = (pointList) => {
    const numPoints = pointList.length;

    // Create a 2D array to store distances
    const distances = Array(numPoints).fill(0).map(() => Array(numPoints).fill(0));

    // Create a mapping between point IDs and indices
    const idToIndexMap = {};
    pointList.forEach((point, index) => {
        idToIndexMap[point.id] = index;
    });

    // Loop through the points and calculate distances
    for (let i = 0; i < numPoints; i++) {
        for (let j = 0; j < numPoints; j++) {
            distances[i][j] = distanceCalc(pointList[i].coords, pointList[j].coords);
        }
    }

    // Return the distances matrix and ID to index map
    return { distances, idToIndexMap };
}


// function to use the Random Nearest Neighbor Algorithm to find a path between all points
export const randomNearestNeighbor = (pointList, randomFrom, distancesData, distancesIndexArray) => {
    // fucntion for the list of places visited and distance travelled
    let visitedPoints = [];
    let totalDistanceTravelled = 0;

    // variable to define starting point, set that to visited points and remove it from the point list
    let startingPoint = pointList.find(item => item.galMapSearch === "Sol");
    visitedPoints.push(startingPoint);

    pointList = pointList.filter(item => item.galMapSearch !== "Sol");

    // loop through the point list untill it's empty
    while (pointList.length > 0) {

        // get the id of the last visited point
        const lastVisitedID = visitedPoints[visitedPoints.length - 1].id;

        // create an object with key: pointID and value: distance, since i'm doing filtering and sorting on it
        const distances = {};

        const tempData = distancesData[distancesIndexArray[lastVisitedID]]
        for (const [pointID, value] of Object.entries(distancesIndexArray)) {
            distances[pointID] = tempData[value];
        }

        // get all the ID's for the points left
        const pointIDs = pointList.map(item => item.id);

        // remove all the points from the list that isn't in pointList, sort by distance and get the shortest 3
        const sortedAndFilteredDistances = Object.entries(distances)
            .filter(([pointID]) => pointIDs.includes(parseInt(pointID)))
            .sort(([, a], [, b]) => a - b)
            .slice(0, randomFrom);

        // get the random item from the sorted and filtered things, get it's index
        const randomIndex = Math.floor(Math.random() * sortedAndFilteredDistances.length);
        const [randomPointID, randomDistance] = sortedAndFilteredDistances[randomIndex];
        const randomItemIndex = pointList.findIndex(item => item.id == randomPointID);

        // add the point to the visited points, splice it out from the point list and add distance to total
        visitedPoints.push(pointList[randomItemIndex]);
        pointList.splice(randomItemIndex, 1);
        totalDistanceTravelled += randomDistance;
    }

    // now add in the path back to the start, and the distance between those
    totalDistanceTravelled += distancesData[distancesIndexArray[visitedPoints[visitedPoints.length - 1].id]][distancesIndexArray[startingPoint.id]];

    visitedPoints.push(startingPoint);

    return {
        path: visitedPoints,
        totalDistance: totalDistanceTravelled
    }
}

// function to use the Nearest Neighbor Algorithm to find a path between all points
export const nearestNeighbor = (pointList, distancesData, distancesIndexArray) => {
    // fucntion for the list of places visited and distance travelled
    let visitedPoints = [];
    let totalDistanceTravelled = 0;

    // variable to define starting point, set that to visited points and remove it from the point list
    let startingPoint = pointList.find(item => item.galMapSearch === "Sol");
    visitedPoints.push(startingPoint);

    pointList = pointList.filter(item => item.galMapSearch !== "Sol");

    // loop through the point list untill it's empty
    while (pointList.length > 0) {
        // variable to keep track of shortest distance to the last point we're at
        let shortestDistance = Infinity;
        let currentLeader;

        // get the last point we've been to
        const lastVisited = visitedPoints[visitedPoints.length - 1];

        // loop through all the points in the point list, checking at each one if the distance is shorter
        for (let i = 0; i < pointList.length; i++) {
            let tempDistance = distancesData[distancesIndexArray[lastVisited.id]][distancesIndexArray[pointList[i].id]];

            // check if the distance found is shorter than the shortest distance, or if it's -1 at which point we're on the first loop
            if (tempDistance < shortestDistance) {
                shortestDistance = tempDistance;
                currentLeader = i;
            }
        }

        // now we've found the shortest distance to the last place visited, so move that from the pointList to visitedPoints and check total distance travelled
        visitedPoints.push(pointList[currentLeader]);
        pointList.splice(currentLeader, 1);
        totalDistanceTravelled += shortestDistance;
    }

    // now add in the path back to the start, and the distance between those
    totalDistanceTravelled += distancesData[distancesIndexArray[visitedPoints[visitedPoints.length - 1].id]][distancesIndexArray[startingPoint.id]];

    visitedPoints.push(startingPoint);

    return {
        path: visitedPoints,
        totalDistance: totalDistanceTravelled
    }
}


// function for the 2-opt algorithm to run
export const optimization2Opt = (initialPath, distancesData, distancesIndexArray) => {
    // variable to keep track if an improvement has been found
    let improvementFound;

    // variable just for fun to keep track of how many iterations has passed
    let roundsDone = 0;

    // variable to keep the current best trip
    let bestPath = initialPath.path;
    let pathLength = initialPath.path.length

    // console.log(`Starting with initial trip point count of: "${initialPath.path.length}" and a total distance of: "${initialPath.totalDistance}"Ly.`);

    do {
        improvementFound = false;
        roundsDone++;

        // log something to have an idea of what iteration we're on, comment out if annoying
        // if (roundsDone % 500 == 0) console.log(`Passed iteration: ${roundsDone}`);

        // create a loop to go through each pair of the points, excluding the first and last (plus one on the last, since going there anyway in the loop)
        for (let i = 1; i < pathLength; i++) {
            for (let j = i + 1; j < pathLength - 1; j++) {

                // get the two pairs of points i want (end has to be +1 because not included)
                let firstPair = [distancesIndexArray[bestPath[i - 1]], distancesIndexArray[bestPath[i]]];
                let secondPair = [distancesIndexArray[bestPath[j]], distancesIndexArray[bestPath[j + 1]]];

                // get the old distance between the two
                let oldDistance = distancesData[firstPair[0]][firstPair[1]] + distancesData[secondPair[0]][secondPair[1]];

                // explanation on how the points move is: old: (3, 4), (46, 47) and from there, new: (3, 46), (4, 47)
                // get the new distance
                let newDistance = distancesData[firstPair[0]][secondPair[0]] + distancesData[firstPair[1]][secondPair[1]];

                // now check if the new path distance is shorter than old, if it is, slice it into the best path with removing the old parts
                if (newDistance < oldDistance) {
                    // get the full path and reverse that
                    let tempPath = reverseObjects(bestPath.slice(i - 1, j + 2));

                    // add the new path to the list, and trigger improvement
                    bestPath.splice(i - 1, tempPath.length, ...tempPath);
                    improvementFound = true;
                    break;
                }
            }

            if (improvementFound) break;
        }
    } while (improvementFound);

    // create variable for the shortest distance found, log some stuff and return the list of ID's for the path
    let newShortDistance = combinedDistance(bestPath, distancesData, distancesIndexArray);
    // console.log(`Did: "${roundsDone}" iterations in total, trip length is down to: "${newShortDistance.toFixed(4)}"Ly, from "${initialPath.totalDistance.toFixed(4)}"Ly ` +
    // `(down by: "${((1 - (newShortDistance / initialPath.totalDistance)) * 100).toFixed(4)}"%)`);

    return {
        path: bestPath,
        totalDistance: newShortDistance
    };
}

// function for K-opt Algorithm where "complexity" is the depth that K-opt does
export const optimizationKopt = (initialPath, complexity, distancesData, distancesIndexArray) => {
    
}


// helper function to calculate a combined distance in a list of multiple points
const combinedDistance = (pointList, distancesData, distancesIndexArray) => {
    // need variable to store, and later return, total length
    let totalDistance = 0;

    // need a loop to iterate through all points, going from first to second to last since it will calculate distance between the current and next in list
    for (let i = 0; i < pointList.length - 1; i++) {
        totalDistance += distancesData[distancesIndexArray[pointList[i]]][distancesIndexArray[pointList[i + 1]]];
    }

    return totalDistance;
}

// helper function to reverse an array of things, with keeping the first and last elements in their places
function reverseObjects(array) {
    return [array[0], ...array.slice(1, -1).reverse(), array[array.length - 1]];
}
