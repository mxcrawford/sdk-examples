"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mendixplatformsdk_1 = require("mendixplatformsdk");
const mendixmodelsdk_1 = require("mendixmodelsdk");
const when = require("when");
const username = 'alistair.crawford@mendix.com';
const apikey = '6a867b72-0ca2-46f2-93ab-d1faac5ef12a';
const projectName = 'SDK Examples';
const projectId = 'cf709443-f12e-4722-b9f3-6ac4d5920689';
const client = new mendixplatformsdk_1.MendixSdkClient(username, apikey);
var changes = 0;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const project = new mendixplatformsdk_1.Project(client, projectId, projectName);
        const workingCopy = yield project.createWorkingCopy();
        processAllMicroflows(workingCopy);
    });
}
function loadMf(microflow) {
    return microflow.load();
}
function processMF(realmf, workingCopy) {
    console.log('Mf Name: ' + realmf.name);
    const container = realmf.container;
    const folderBase = realmf.containerAsFolderBase;
    //console.log(container.toJSON());
    if (container instanceof mendixmodelsdk_1.projects.Folder) {
        console.log("This is a folder");
        const folder = container;
        console.log("Folder name: " + folder.name);
        if (folder.name != "Microflows") {
            const surroundingFolders = folder.folders;
            console.log(surroundingFolders.length);
            const mfFolder = surroundingFolders.filter(fold => fold.name == "Microflows")[0];
            if (mfFolder) {
                console.log("Parent folder: " + mfFolder.name);
                changes++;
                //Place MF in this folder
            }
            else {
                console.log("Creating new folder...");
                const newFolder = mendixmodelsdk_1.projects.Folder.createIn(folderBase);
                newFolder.name = "Microflows";
                changes++;
                //Place MF in THIS folder
            }
        }
    }
    else if (container instanceof mendixmodelsdk_1.projects.Module) {
        console.log("This is a module");
        console.log("Creating new folder...");
        const newFolder = mendixmodelsdk_1.projects.Folder.createIn(folderBase);
        newFolder.name = "Microflows";
        //Place MF in THIS folder
        changes++;
    }
    realmf.objectCollection.objects.filter(mfaction => mfaction.structureTypeName == 'Microflows$ActionActivity')
        .forEach(mfaction => {
        if (mfaction instanceof mendixmodelsdk_1.microflows.ActionActivity) {
            const activity = mfaction;
            const action = mfaction.action;
            if (action instanceof mendixmodelsdk_1.microflows.CreateObjectAction) {
                if (activity.backgroundColor != mendixmodelsdk_1.microflows.ActionActivityColor.Green) {
                    activity.backgroundColor = mendixmodelsdk_1.microflows.ActionActivityColor.Green;
                    changes++;
                }
            }
            else if (action instanceof mendixmodelsdk_1.microflows.ChangeObjectAction) {
                if (activity.backgroundColor != mendixmodelsdk_1.microflows.ActionActivityColor.Orange) {
                    activity.backgroundColor = mendixmodelsdk_1.microflows.ActionActivityColor.Orange;
                    changes++;
                }
            }
            else if (action instanceof mendixmodelsdk_1.microflows.DeleteAction) {
                if (activity.backgroundColor != mendixmodelsdk_1.microflows.ActionActivityColor.Red) {
                    activity.backgroundColor = mendixmodelsdk_1.microflows.ActionActivityColor.Red;
                    changes++;
                }
            }
            else if (action instanceof mendixmodelsdk_1.microflows.MicroflowCallAction) {
                if (activity.backgroundColor != mendixmodelsdk_1.microflows.ActionActivityColor.Purple) {
                    activity.backgroundColor = mendixmodelsdk_1.microflows.ActionActivityColor.Purple;
                    changes++;
                }
            }
            else {
                activity.backgroundColor = mendixmodelsdk_1.microflows.ActionActivityColor.Default;
            }
        }
        else {
            console.info("Not an activity");
        }
    });
}
function loadAllMicroflowsAsPromise(microflows) {
    return when.all(microflows.map(mf => mendixplatformsdk_1.loadAsPromise(mf)));
}
function processAllMicroflows(workingCopy) {
    return __awaiter(this, void 0, void 0, function* () {
        loadAllMicroflowsAsPromise(workingCopy.model().allMicroflows())
            .then((microflows) => microflows.forEach((mf) => {
            console.log("Processing mf: " + mf.name);
            processMF(mf, workingCopy);
        }))
            .done(() => __awaiter(this, void 0, void 0, function* () {
            if (changes > 0) {
                console.info("Done MF Processing, made " + changes + " change(s)");
                const revision = yield workingCopy.commit();
            }
            else {
                console.info("No changes, skipping commit");
            }
        }));
    });
}
main();