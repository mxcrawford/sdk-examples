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
const internal_1 = require("mendixmodelsdk/dist/sdk/internal");
const username = 'alistair@wobdev.co.uk';
const apikey = 'a3deec03-b1de-4ba2-924c-a1809e840e7d';
const projectName = 'SDKExample';
const moduleName = 'MyFirstModule';
const entityName = 'Customer';
const microflowName = 'IVK_DoStuff';
const projectId = '46d63de1-8ea5-4f1a-bdf7-eeed30a177f2';
const client = new mendixplatformsdk_1.MendixSdkClient(username, apikey);
var commit = false;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Main started and running...");
        const project = new mendixplatformsdk_1.Project(client, projectId, projectName);
        const workingCopy = yield project.createWorkingCopy();
        // Do Microfows stuff
        const mf = workingCopy.model().findMicroflowByQualifiedName(moduleName + '.' + microflowName);
        if (!mf && mf != null) {
            console.info(workingCopy.model().allFolderBases().length);
            workingCopy.model().allFolderBases().forEach(folderBase => {
                console.info(folderBase.id);
                //const microflow = microflows.Microflow.createIn(folderBase);
                //commit = true;
            });
            console.info(workingCopy.model().allFolderBases().length);
        }
        else {
            console.info('Microflow already exists');
            console.info(mf.qualifiedName);
        }
        const realmf = yield loadMf(mf);
        console.info(realmf.objectCollection.objects[2].structureTypeName);
        console.info(realmf.objectCollection.objects.length);
        const ob = realmf.objectCollection.objects[2];
        if (ob instanceof mendixmodelsdk_1.microflows.ActionActivity) {
            const element = ob;
            console.info("BG Colour: " + element.backgroundColor);
            console.log(internal_1.LifeCycle.prototype);
            element.backgroundColor = mendixmodelsdk_1.microflows.ActionActivityColor.Red;
            commit = true;
            console.info(element.toJSON());
            console.info("This is an microflows \n");
        }
        else {
            console.info("Not an ActionActivity \n");
        }
        try {
            const revision = yield workingCopy.commit();
            console.log(`Successfully committed revision: ${revision.num()}. Done.`);
        }
        catch (error) {
            console.error('Something went wrong:', error);
        }
        console.log("Main completed...");
    });
}
function loadDomainModel(workingCopy) {
    const dm = workingCopy.model().allDomainModels().filter(dm => dm.containerAsModule.name === 'MyFirstModule')[0];
    return dm.load();
}
function loadMf(microflow) {
    return microflow.load();
}
main();
