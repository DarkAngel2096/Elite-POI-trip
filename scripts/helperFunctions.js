export const distanceCalc = (point1, point2, {decimalPoints = 2} = {}) => {
    return parseFloat(Math.sqrt(Math.pow((point1.x - point2.x), 2) +
    Math.pow((point1.y - point2.y), 2) +
    Math.pow((point1.z - point2.z), 2)).toFixed(decimalPoints));
}

// function to use the Nearest Neighbor Algorithm to find a path between all points
export const nearestNeighbor = (pointList) => {
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
        let distanceToLast = -1;
        let currentLeader;

        // get the last point we've been to
        let lastVisited = visitedPoints[visitedPoints.length - 1];

        // loop through all the points in the point list, checking at each one if the distance is shorter
        for (let item of pointList) {
            let tempDistance = distanceCalc(lastVisited.coords, item.coords);

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

    //console.log(visitedPoints.map(item => item.galMapSearch));
    console.log(visitedPoints);
    console.log(totalDistanceTravelled);
}
