import { MendixSdkClient, OnlineWorkingCopy, Project, loadAsPromise } from 'mendixplatformsdk';
import { microflows, projects } from 'mendixmodelsdk';
import when = require("when");

// Configuration
const config = {
    auth: {
        "username": "alistair.crawford@mendix.com",
        "apikey": "6a867b72-0ca2-46f2-93ab-d1faac5ef12a"
    },
    project: {
        "name": "SDK6",
        "id": "effe3d9a-1bf1-46ae-92f7-f1d2d002d451"
    }
}

// Microflow Prefix rules
let prefixes: string[] = ["IVK_", "ACT_", "SUB_", "WS_", "ACo_", "ADe_", "BCo_", "BDe_"];

// Modules to process - if left empty, none will be processed
let moduleList: string[] = ["MyFirstModule"];

// Use auth to create an SDK client
const client = new MendixSdkClient(config.auth.username, config.auth.apikey);

// Our list of Microflows that don't adhere to prefix standards
let prefixMicroflows: string[] = [];

// This is the main function that calls our other functions
async function main() {
    const project = new Project(client, config.project.id, config.project.name);
    const workingCopy = await project.createWorkingCopy();
    processAllMicroflows(workingCopy);
}

function processMF(microflow: microflows.Microflow, workingCopy: OnlineWorkingCopy) {
    let myContainer = microflow.container;

    // Recursively get the parent container until the parent is the Module ()
    while (myContainer instanceof projects.Folder) {
        myContainer = myContainer.container;
    }

    // Make sure the module is inside our module list - could be done better
    if (myContainer instanceof projects.Module) {
        let myModule = <projects.Module>myContainer;
        if (moduleList.find((element) => { return element == myModule.name; })) {

            // Check if the Micrlflow starts with one of our prefixes, if not, add to the naughty list!
            if (!prefixes.find((element) => { return microflow.name.startsWith(element); })) {
                prefixMicroflows.push(myModule.name + '.' + microflow.name);
            }
        }
    }
}

// Nice function to load all Microflows using promises 
function loadAllMicroflowsAsPromise(microflows: microflows.IMicroflow[]): when.Promise<microflows.Microflow[]> {
    return when.all<microflows.Microflow[]>(microflows.map(mf => loadAsPromise(mf)));
}

async function processAllMicroflows(workingCopy: OnlineWorkingCopy) {
    loadAllMicroflowsAsPromise(workingCopy.model().allMicroflows())
        .then((microflows) => microflows.forEach((mf) => {
            processMF(mf, workingCopy);
        }))
        .done(async () => { // Once processing is done, display the prefix Microflow list to the console iteratively
                console.log("Microflows missing prefixes: " + prefixMicroflows.length);
                prefixMicroflows.forEach((item) => {
                    console.log(item);
                });
        });
}

main();