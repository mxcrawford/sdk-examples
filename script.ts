import { MendixSdkClient, OnlineWorkingCopy, Project, loadAsPromise } from 'mendixplatformsdk';
import { microflows ,jsonstructures} from 'mendixmodelsdk';
import when = require("when");

const username = 'alistair.crawford@mendix.com';
const apikey = '6a867b72-0ca2-46f2-93ab-d1faac5ef12a';
const projectName = 'SDK6';
const projectId = 'effe3d9a-1bf1-46ae-92f7-f1d2d002d451';
const client = new MendixSdkClient(username, apikey);
var changes = 0;

async function main() {
    const project = new Project(client, projectId, projectName);
    const workingCopy = await project.createWorkingCopy();
    processAllMicroflows(workingCopy);
}

function loadMf(microflow: microflows.IMicroflow): Promise<microflows.Microflow> {
    return microflow.load();
}

function processMF(mf: microflows.Microflow, workingCopy: OnlineWorkingCopy) {
    mf.objectCollection.objects.filter(mfaction => mfaction.structureTypeName == 'Microflows$ActionActivity')
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
                } else if (action instanceof microflows.MicroflowCallAction) {
                    if (activity.backgroundColor != microflows.ActionActivityColor.Purple) {
                        activity.backgroundColor = microflows.ActionActivityColor.Purple;
                        changes++;
                    }
                }
                else {
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
            processMF(mf, workingCopy);
        }))
        .done(async () => {
            if (changes > 0) {
                console.info("Done MF Processing, made " + changes + " change(s)");
                const revision = await workingCopy.commit();
            } else {
                console.info("No changes, skipping commit");
            }
        });
}

main();