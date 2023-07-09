export const distanceCalc = (point1, point2, {decimalPoints = 2} = {}) => {
    return parseFloat(Math.sqrt(Math.pow((point1.x - point2.x), 2) +
    Math.pow((point1.y - point2.y), 2) +
    Math.pow((point1.z - point2.z), 2)).toFixed(decimalPoints));
}

// helper function for sorting
export const dynamicSort = (property) => {
    let sortOrder = 1;

    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }

    return function (a,b) {
        let result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

// function to use the Nearest Neighbor Algorithm to find a path between all points
export const nearestNeighbor = (pointList) => {
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
        let distanceToLast = -1;
        let currentLeader;

        // get the last point we've been to
        let lastVisited = visitedPoints[visitedPoints.length - 1];

        // loop through all the points in the point list, checking at each one if the distance is shorter
        for (let item of pointList) {
            let distStart = performance.now();

            let tempDistance = distanceCalc(lastVisited.coords, item.coords);

            totalTimeForDist += performance.now() - distStart;

            if (tempDistance < distanceToLast || distanceToLast == -1) {
                distanceToLast = tempDistance;
                currentLeader = item;
            }
        }

        // now we've found the shortest distance to the last place visited, so move that from the pointList to visitedPoints
        currentLeader.distanceToLast = distanceToLast;
        visitedPoints.push(currentLeader);
        pointList = pointList.filter(listItem => listItem.id !== currentLeader.id);
        totalDistanceTravelled += distanceToLast;
    }

    // now add in the path back to the start, and the distance between those
    let distanceBetweenLastTwo = distanceCalc(visitedPoints[visitedPoints.length - 1].coords, startingPoint.coords);
    totalDistanceTravelled += distanceBetweenLastTwo;

    let startingPointCopy = JSON.parse(JSON.stringify(startingPoint));
    startingPointCopy.distanceToLast = distanceBetweenLastTwo;
    visitedPoints.push(startingPointCopy);

    console.log(`total time used for distance calc: "${totalTimeForDist}"ms.`);

    return {
        path: visitedPoints,
        totalDistance: totalDistanceTravelled
    }
}


// function for the 2-opt algorithm to run
export const optimization2Opt = (initialTrip) => {
    // variable to keep track if an improvement has been found
    let improvementFound;

    // variable just for fun to keep track of how many iterations has passed
    let roundsDone = 0;

    // variable to keep the current best trip
    let bestPath = initialTrip.path;

    // variable to keep track of how long distance calculations take
    let combinedDistanceCalcTime = 0.0;

    console.log(`Starting with initial trip point count of: "${initialTrip.path.length}" and a total distance of: "${initialTrip.totalDistance}"Ly.`);

    do {
        improvementFound = false;
        roundsDone++;

        // console.log(`\nstarting round: "${roundsDone}"`);

        // create a loop to go through each pair of the points, excluding the first and last (plus one on the last, since going there anyway in the loop)
        for (let i = 1; i < initialTrip.path.length - 3; i++) {
            for (let j = i + 1; j < initialTrip.path.length; j++) {

                // take the path between i - 1 to j + 1 into a temp variable
                let tempPath = bestPath.slice(i - 1, j + 1);

                let startTime = performance.now();
                // console.log(tempPath.map(item => item.id));
                // get the distance of this current temp path and store it in a variable
                let oldDistance = combinedDistance(tempPath);

                let tempEnd = performance.now() - startTime;
                //  now reverse everything between i and j, (not swapping the first and last points)
                tempPath = reverseObjects(tempPath);
                // console.log(tempPath.map(item => item.id));

                let secondStart = performance.now();
                // get the distance of the new path
                let newDistance = combinedDistance(tempPath);

                combinedDistanceCalcTime += performance.now() - secondStart + tempEnd;

                // now check if the new path distance is shorter than old, if it is, slice it into the best path with removing the old parts
                if (newDistance < oldDistance) {
                    bestPath.splice(i - 1, tempPath.length, ...tempPath);
                    improvementFound = true;
                    // console.log(`found improvement, current array length ${bestPath.length}`);
                    break;
                }
            }

            if (improvementFound) break;
        }


        // not working version of 2-opt, forgot shit
        /*for (let i = 1; i < initialTrip.path.length - 2; i++) {
            // console.log(bestPath[i].name);
            // variable to keep a chunk of 4 points here
            let currentChunk = bestPath.slice(i - 1, i + 3);
            let oldDistance = combinedDistance(currentChunk);

            // swap the points 1 and 2 with eachother, and calculate distance again
            [currentChunk[1], currentChunk[2]] = [currentChunk[2], currentChunk[1]]
            let newDistance = combinedDistance(currentChunk);

            // console.log(`New: "${newDistance}" compared to old: "${oldDistance}"`);

            // check if new distance is shorter, if so, swap the two nodes in the best path variable, set improvementFound to true and break out of the loop
            if (newDistance < oldDistance) {
                // console.log("shorter found");
                [bestPath[i], bestPath[i + 1]] = [bestPath[i + 1], bestPath[i]]
                improvementFound = true;

                break;
            }
        }*/
    } while (improvementFound);
    // console.log(`best path id's: ${bestPath.map(item => item.id)}`);
    console.log(`Did: "${roundsDone}" iterations in total, trip length is down to: "${combinedDistance(bestPath)}"Ly, where combinated distance calc time took: "${combinedDistanceCalcTime}"ms`);
}


// helper function to calculate a combined distance in a list of multiple points
const combinedDistance = (pointList, shouldLog = false) => {
    // need variable to store, and later return, total length
    let totalDistance = 0;

    // need a loop to iterate through all points, going from first to second to last since it will calculate distance between the current and next in list
    for (let i = 0; i < pointList.length - 1; i++) {
        // temp split to it's own variable
        let distanceBetweenTwo = distanceCalc(pointList[i].coords, pointList[i + 1].coords);

        if (shouldLog) console.log(distanceBetweenTwo);

        totalDistance += distanceBetweenTwo;
    }

    if (shouldLog) console.log("total: " + totalDistance);
    return totalDistance;
}

// helper function to reverse an array of things, with keeping the first and last elements in their places
function reverseObjects(array) {
    return [array[0], ...array.slice(1, -1).reverse(), array[array.length - 1]];
}
