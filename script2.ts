import { MendixSdkClient, OnlineWorkingCopy, Project, loadAsPromise } from 'mendixplatformsdk';
import { microflows, projects } from 'mendixmodelsdk';
import when = require("when");

const username = 'alistair.crawford@mendix.com';
const apikey = '6a867b72-0ca2-46f2-93ab-d1faac5ef12a';
const projectName = 'SDK Examples';
const projectId = 'cf709443-f12e-4722-b9f3-6ac4d5920689';
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

function processMF(realmf: microflows.Microflow, workingCopy: OnlineWorkingCopy) {
    console.log('Mf Name: ' + realmf.name);

    const container = realmf.container;
    const folderBase = realmf.containerAsFolderBase;
    //console.log(container.toJSON());

    if (container instanceof projects.Folder) {
        console.log("This is a folder");
        const folder = <projects.Folder>container;
        console.log("Folder name: " + folder.name);
        if (folder.name != "Microflows") {
            const surroundingFolders = folder.folders;
            console.log(surroundingFolders.length);
            const mfFolder = surroundingFolders.filter(fold => fold.name == "Microflows")[0];
            
            if (mfFolder) {
                console.log("Parent folder: " + mfFolder.name);
                changes++;
                //Place MF in this folder
            } else {
                console.log("Creating new folder...");
                const newFolder = projects.Folder.createIn(folderBase);
                newFolder.name = "Microflows";
                changes++;
                //Place MF in THIS folder
            }
        }
    } else if (container instanceof projects.Module) {
        console.log("This is a module");
        console.log("Creating new folder...");
        const newFolder = projects.Folder.createIn(folderBase);
        newFolder.name = "Microflows";
        //Place MF in THIS folder
        changes++;
    }


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
            console.log("Processing mf: " + mf.name);
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