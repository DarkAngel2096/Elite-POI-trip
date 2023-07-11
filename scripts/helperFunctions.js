// function that does euclidean distance calculations
export const distanceCalc = (point1, point2) => {
    return Math.sqrt(Math.pow((point1.x - point2.x), 2) +
    Math.pow((point1.y - point2.y), 2) +
    Math.pow((point1.z - point2.z), 2));
}

// function to create a nested object with the distance between each point'
export const calculateDistancesBetweenAll = (pointList) => {
    // variable that holds the distances
    let distances = {}

    // double loop through the points to get distance calculations between all points
    for (let point1 of pointList) {
        // create a object for each point
        distances[point1.id] = {}

        for (let point2 of pointList) {
            // calculate the distance between the two points
            distances[point1.id][point2.id] = distanceCalc(point1.coords, point2.coords);
        }
    }

    // return the distances object
    return distances;
}

// function to use the Nearest Neighbor Algorithm to find a path between all points
export const nearestNeighbor = (pointList, distancesObject) => {
    // fucntion for the list of places visited and distance travelled
    let visitedPoints = [];
    let totalDistanceTravelled = 0;

    let totalTimeForDist = 0.0;

    // variable to define starting point, set that to visited points and remove it from the point list
    let startingPoint = pointList.find(item => item.galMapSearch === "Sol");
    visitedPoints.push(startingPoint);

    pointList = pointList.filter(item => item.galMapSearch !== "Sol");

    // loop through the point list untill it's empty
    while (pointList.length > 0) {
        // variable to keep track of shortest distance to the last point we're at
        let shortestDistance = -1;
        let currentLeader;

        // get the last point we've been to
        let lastVisited = visitedPoints[visitedPoints.length - 1];

        // loop through all the points in the point list, checking at each one if the distance is shorter
        for (let item of pointList) {
            let tempDistance = distancesObject[lastVisited.id][item.id];

            // check if the distance found is shorter than the shortest distance, or if it's -1 at which point we're on the first loop
            if (tempDistance < shortestDistance || shortestDistance == -1) {
                shortestDistance = tempDistance;
                currentLeader = item;
            }
        }

        // now we've found the shortest distance to the last place visited, so move that from the pointList to visitedPoints and check total distance travelled
        visitedPoints.push(currentLeader);
        pointList = pointList.filter(listItem => listItem.id !== currentLeader.id);
        totalDistanceTravelled += shortestDistance;
    }

    // now add in the path back to the start, and the distance between those
    totalDistanceTravelled += distancesObject[visitedPoints[visitedPoints.length - 1].id][startingPoint.id];

    visitedPoints.push(startingPoint);

    return {
        path: visitedPoints,
        totalDistance: totalDistanceTravelled
    }
}


// function for the 2-opt algorithm to run
export const optimization2Opt = (initialPath, distancesObject) => {
    // variable to keep track if an improvement has been found
    let improvementFound;

    // variable just for fun to keep track of how many iterations has passed
    let roundsDone = 0;

    // variable to keep the current best trip
    let bestPath = initialPath.path;
    let pathLength = initialPath.path.length

    console.log(`Starting with initial trip point count of: "${initialPath.path.length}" and a total distance of: "${initialPath.totalDistance}"Ly.`);

    do {
        improvementFound = false;
        roundsDone++;

        // log something to have an idea of what iteration we're on, comment out if annoying
        if (roundsDone % 50 == 0) console.log(`Passed iteration: ${roundsDone}`);

        // create a loop to go through each pair of the points, excluding the first and last (plus one on the last, since going there anyway in the loop)
        for (let i = 1; i < pathLength - 3; i++) {
            for (let j = i + 1; j < pathLength - 1; j++) {

                // get the two pairs of points i want (end has to be +1 because not included)
                let firstPair = [bestPath[i - 1], bestPath[i]];
                let secondPair = [bestPath[j], bestPath[j + 1]];

                // get the old distance between the two
                let oldDistance = distancesObject[firstPair[0]][firstPair[1]] + distancesObject[secondPair[0]][secondPair[1]];

                // explanation on how the points move is: old: (3, 4), (46, 47) and from there, new: (3, 46), (4, 47)
                // get the new distance
                let newDistance = distancesObject[firstPair[0]][secondPair[0]] + distancesObject[firstPair[1]][secondPair[1]];

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
    let newShortDistance = combinedDistance(bestPath, distancesObject);
    console.log(`Did: "${roundsDone}" iterations in total, trip length is down to: "${newShortDistance.toFixed(4)}"Ly, from "${initialPath.totalDistance.toFixed(4)}"Ly ` +
    `(down by: "${((1 - (newShortDistance / initialPath.totalDistance)) * 100).toFixed(4)}"%)`);

    return bestPath;
}


// helper function to calculate a combined distance in a list of multiple points
const combinedDistance = (pointList, distancesObject) => {
    // need variable to store, and later return, total length
    let totalDistance = 0;

    // need a loop to iterate through all points, going from first to second to last since it will calculate distance between the current and next in list
    for (let i = 0; i < pointList.length - 1; i++) {
        totalDistance += distancesObject[pointList[i]][pointList[i + 1]];
    }

    return totalDistance;
}

// helper function to reverse an array of things, with keeping the first and last elements in their places
function reverseObjects(array) {
    return [array[0], ...array.slice(1, -1).reverse(), array[array.length - 1]];
}
