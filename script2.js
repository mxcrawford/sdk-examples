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
const projectName = 'SDK6';
const projectId = 'effe3d9a-1bf1-46ae-92f7-f1d2d002d451';
const client = new mendixplatformsdk_1.MendixSdkClient(username, apikey);
let changes = 1;
let prefixes = ["IVK_", "ACT_", "SUB_", "WS_", "ACo_", "ADe_", "BCo_", "BDe_"];
let moduleList = ["MyFirstModule"];
let prefixMicroflows = [];
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
function processMF(microflow, workingCopy) {
    let myContainer = microflow.container;
    //console.log(myContainer);
    while (myContainer instanceof mendixmodelsdk_1.projects.Folder) {
        myContainer = myContainer.container;
    }
    if (myContainer instanceof mendixmodelsdk_1.projects.Module) {
        let myModule = myContainer;
        if (moduleList.find((element) => { return element == myModule.name; })) {
            if (!prefixes.find((element) => { return microflow.name.startsWith(element); })) {
                prefixMicroflows.push(myModule.name + '.' + microflow.name);
            }
        }
    }
    //console.log(container.toJSON());
    //const module:projects.Module = realmf.model.;
}
function loadAllMicroflowsAsPromise(microflows) {
    return when.all(microflows.map(mf => mendixplatformsdk_1.loadAsPromise(mf)));
}
function processAllMicroflows(workingCopy) {
    return __awaiter(this, void 0, void 0, function* () {
        loadAllMicroflowsAsPromise(workingCopy.model().allMicroflows())
            .then((microflows) => microflows.forEach((mf) => {
            //console.log("Processing mf: " + mf.name);
            processMF(mf, workingCopy);
        }))
            .done(() => __awaiter(this, void 0, void 0, function* () {
            if (changes > 0) {
                //console.info("Done MF Processing, made " + changes + " change(s)");
                //const revision = await workingCopy.commit();
                console.log("Microflows missing prefixes: " + prefixMicroflows.length);
                prefixMicroflows.forEach((item) => {
                    console.log(item);
                });
            }
            else {
                //console.info("No changes, skipping commit");
            }
        }));
    });
}
main();
