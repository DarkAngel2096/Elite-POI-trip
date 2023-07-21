// import cluster
import cluster from "cluster";

// check if we're in the primary process
if (cluster.isPrimary) {
    const startTime = new Date();
    console.log(`Starting at: ${startTime.toLocaleTimeString()}`);
    // import the data file
    // const pointList = await import ("./../data/within1kLy.json", { assert: { type: "json" } });
    // const pointList = await import ("./../data/within5kLy.json", { assert: { type: "json" } });
    // const pointList = await import ("./../data/within10kLy.json", { assert: { type: "json" } });
    // const pointList = await import ("./../data/within20kLy.json", { assert: { type: "json" } });
    const pointList = await import ("./../data/within35kLy.json", { assert: { type: "json" } });

    // create list of workers that have been created
    let workers = [];
    // create a list of abailable workers
    let availableWorkers = [];

    // function call to create the workers
	// get the data of how many CPU threads we have to work with, and use half of them
    const os = await import("os");
    const fs = await import("fs");
	let totalCores = os.cpus().length;
	let coresToUse = 10; //totalCores / 2;

	console.log("Total thread count: " + totalCores + " of which: " + coresToUse + " will be used for child processes.");

    // create variable that sets the amount of times to run through 2-opt
    let total2optTimes = 1000;
    let current2optTimes = 0;

    let bestPathDistance = Infinity;
    let bestPathIteration = 0;
    let bestPath;

    // const nnShortest = 51014.2594; // 1kly path, 195 points
    // const nnShortest = 133086.2865; // 5kly path, 309 points
    const nnShortest = 1724117.3693; // 35kly path, 1598 points

    // create the right amount of workers in a for loop
    for (let i = 0; i < coresToUse; i++) {
        // create the process and add it to the workers list
        let currentWorker = cluster.fork()
        workers.push(currentWorker);

        // listen to messages from each process
        workers[i].on("message", (message) => {
            current2optTimes++;

            if (current2optTimes % 50 == 0) console.log(`Passed repetition: ${current2optTimes} since start: ${new Date() - startTime}ms`);

            // check the path length, if it's better than best, set it to bestPath, if worse, do nothing and just go again
            if (message.output.totalDistance < bestPathDistance) {
                console.log(`found new shortest at: "${message.output.totalDistance}"Ly at iteration: ${current2optTimes} (down by: "${((1 - (message.output.totalDistance / nnShortest)) * 100).toFixed(4)}"% form NN shortest)`);
                bestPathDistance = message.output.totalDistance;
                bestPathIteration = current2optTimes;
                bestPath = message.output.path
            } else {
                //console.log(`"${message.output.totalDistance}"Ly is not shorter than: "${bestPathDistance}"Ly, do nothing.`);
            }

            if ((current2optTimes + (coresToUse - 1)) < total2optTimes) {
                workers[i].send({
                    message: "do stuff",
                    data: pointList.default
                });
            } else {

                // add the worker i number back to availableWorkers
                availableWorkers.push(i);

                // check if all workers are back, at which point trigger a write of the best path
                if (availableWorkers.length == coresToUse) {
                    // we're done with doing stuff
                    console.log("should be done with all, did: ", current2optTimes);
                    console.log(`shortest path: ${bestPathDistance}Ly`);


                    console.log("Writing file");
                    let currentTime = new Date().toLocaleTimeString();

                    // create a new array in the order of the best path from the pointList
                    let pathList = []
                    for (let id of bestPath) {
                        pathList.push(pointList.default.find(item => item.id == id));
                    }

                    fs.writeFileSync(`./data/${currentTime.replace(/\D/g, '')}BestPath_${parseInt(bestPathDistance)}Ly.json`, JSON.stringify(pathList, null, "\t"));
                    console.log(`Done at: ${new Date().toLocaleTimeString()}`);
                }

                // disconnect if all done
                cluster.disconnect();
            }
        });

        // trigger the worker to start doing things
        setTimeout(() => {
            currentWorker.send({
                message: "initial trigger",
                data: pointList.default
            });
        }, 1000);

    }

    // log when a process has come online
	cluster.on("online", function (worker) {
		console.log("Worker: " + worker.process.pid + " has come online and is listening.");
	});

	// log errors and start a new process if one died
	cluster.on("exit", function (worker, code, signal) {
		// only start a new worker if code isn't 0
		if (code != 0) {
			console.log("Worker: " + worker.process.pid + " died with code: " + code + " and signal: " + signal);
			console.log("Starting new worker in it's place.");

			let worker = cluster.fork();
			workers.push(worker);

            // push new details to it
            worker.send({
                message: "new worker trigger",
                data: pointList.default
            });
		}
	});

} else if (cluster.isWorker) {
    // console.log("we're as worker");

    process.on("message", async function (message) {
        // console.log("were in worker, got message: ", message.message);

        // import the function to use
        let doMath = await import("./pathSearchMain.js");

        let returnData = doMath.do2opt(message.data);

        // return the details back to main
        process.send({
            message: "I guess i'm done here, have data:",
            output: returnData
        });
    });
} else {
    console.log(`what process are we in now..?`);
}
