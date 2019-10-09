import { MendixSdkClient, OnlineWorkingCopy, Project, loadAsPromise, Revision } from 'mendixplatformsdk';
import { domainmodels, microflows } from 'mendixmodelsdk';
import when = require("when");

const username = 'alistair.crawford@mendix.com';
// profile 6a867b72-0ca2-46f2-93ab-d1faac5ef12a
// app f30d1cd1-6c8c-4580-bebc-6e2cf5fb7999
const apikey = '6a867b72-0ca2-46f2-93ab-d1faac5ef12a';
const projectName = 'SDK Showcase';
const projectId = '2328e9b9-0f08-4f4f-a2a9-18f9719736f2';
const client = new MendixSdkClient(username, apikey);

var changes = 0;

async function main(){
    console.log("Main started and running...");
    const project = new Project(client, projectId, projectName);
    const workingCopy = await project.createWorkingCopy();

    processAllMicroflows(workingCopy);
    
    

}

function loadMf(microflow: microflows.IMicroflow): Promise<microflows.Microflow> {
    return microflow.load();
}

function processMF(realmf: microflows.Microflow, workingCopy: OnlineWorkingCopy) {

    //const ob = realmf.objectCollection.objects[2];
    realmf.objectCollection.objects.filter(mfaction => mfaction.structureTypeName == 'Microflows$ActionActivity')
        .forEach(mfaction => {
            if (mfaction instanceof microflows.ActionActivity) {
                const activity = <microflows.ActionActivity>mfaction;
                const action = mfaction.action;
                if (action instanceof microflows.CreateObjectAction) {
                    if (activity.backgroundColor != microflows.ActionActivityColor.Green) {
                        activity.backgroundColor = microflows.ActionActivityColor.Green;
                        changes++;
                    }
                } else if (action instanceof microflows.ChangeObjectAction) {
                    if (activity.backgroundColor != microflows.ActionActivityColor.Orange) {
                        activity.backgroundColor = microflows.ActionActivityColor.Orange;
                        changes++;
                    }
                } else if (action instanceof microflows.DeleteAction) {
                    if (activity.backgroundColor != microflows.ActionActivityColor.Red) {
                        activity.backgroundColor = microflows.ActionActivityColor.Red;
                        changes++;
                    }
                } else {
                    console.info("No matching type");
                    //console.info(mfaction.toJSON());
                    activity.backgroundColor = microflows.ActionActivityColor.Default;
                }
            } else {
                console.info("Not an activity");
            }
        });
}

function loadAllMicroflowsAsPromise(microflows: microflows.IMicroflow[]): when.Promise<microflows.Microflow[]> {
    return when.all<microflows.Microflow[]>(microflows.map(mf => loadAsPromise(mf)));
}

async function processAllMicroflows(workingCopy: OnlineWorkingCopy) {


    loadAllMicroflowsAsPromise(workingCopy.model().allMicroflows())
        .then((microflows) => microflows.forEach((mf) => {
            console.log("Loaded");
            console.log(mf.isLoaded);
            processMF(mf, workingCopy);
        }))
        .done(async () => {
            console.info("Done");
            console.log("Main completed...");
            const revision = await workingCopy.commit();
        });
}

main();