import { MendixSdkClient, OnlineWorkingCopy, Project, loadAsPromise } from 'mendixplatformsdk';
import { microflows, projects } from 'mendixmodelsdk';
import when = require("when");

const username = 'alistair.crawford@mendix.com';
const apikey = '6a867b72-0ca2-46f2-93ab-d1faac5ef12a';
const projectName = 'SDK6';
const projectId = 'effe3d9a-1bf1-46ae-92f7-f1d2d002d451';
const client = new MendixSdkClient(username, apikey);
let changes = 1;

let prefixes:string[]= ["IVK_", "ACT_", "SUB_", "WS_" , "ACo_", "ADe_", "BCo_","BDe_"];

let moduleList:string[] = ["MyFirstModule"];

let prefixMicroflows: string[] = [];

async function main() {
    const project = new Project(client, projectId, projectName);
    const workingCopy = await project.createWorkingCopy();
    processAllMicroflows(workingCopy);
}

function loadMf(microflow: microflows.IMicroflow): Promise<microflows.Microflow> {
    return microflow.load();
}

function processMF(microflow: microflows.Microflow, workingCopy: OnlineWorkingCopy) {

    let myContainer = microflow.container;
    //console.log(myContainer);
    
    while(myContainer instanceof projects.Folder)
    {
        myContainer = myContainer.container;
    }

    
    if(myContainer instanceof projects.Module){
        let myModule = <projects.Module>myContainer;
        if(moduleList.find((element) => {return element==myModule.name;})){
            if(!prefixes.find((element) => {return microflow.name.startsWith(element);})){
                prefixMicroflows.push(myModule.name + '.' + microflow.name);
            }
        }
    }

    //console.log(container.toJSON());
    //const module:projects.Module = realmf.model.;

    
    

}

function loadAllMicroflowsAsPromise(microflows: microflows.IMicroflow[]): when.Promise<microflows.Microflow[]> {
    return when.all<microflows.Microflow[]>(microflows.map(mf => loadAsPromise(mf)));
}

async function processAllMicroflows(workingCopy: OnlineWorkingCopy) {
    loadAllMicroflowsAsPromise(workingCopy.model().allMicroflows())
        .then((microflows) => microflows.forEach((mf) => {
            //console.log("Processing mf: " + mf.name);
            processMF(mf, workingCopy);
        }))
        .done(async () => {
            if (changes > 0) {
                //console.info("Done MF Processing, made " + changes + " change(s)");
                //const revision = await workingCopy.commit();
                console.log("Microflows missing prefixes: " + prefixMicroflows.length);
                prefixMicroflows.forEach((item) => {
                    console.log(item);
                });
            } else {
                //console.info("No changes, skipping commit");
            }
        });
}

main();