import { MendixSdkClient, OnlineWorkingCopy, Project } from 'mendixplatformsdk';
import { domainmodels, microflows, Element, enumerations } from 'mendixmodelsdk';
import { LifeCycle, LifeCycleState } from 'mendixmodelsdk/dist/sdk/internal';
import { initializeInstance } from 'mobx/lib/internal';

const username = 'alistair@wobdev.co.uk';
const apikey = 'a3deec03-b1de-4ba2-924c-a1809e840e7d';
const projectName = 'SDKExample';
const moduleName = 'MyFirstModule';
const entityName = 'Customer';
const microflowName = 'IVK_DoStuff';
const projectId = '46d63de1-8ea5-4f1a-bdf7-eeed30a177f2';
const client = new MendixSdkClient(username, apikey);
var commit = false;

async function main() {
    console.log("Main started and running...");
    const project = new Project(client, projectId, projectName);
    const workingCopy = await project.createWorkingCopy();

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

    } else {
        console.info('Microflow already exists');
        console.info(mf.qualifiedName);
    }

    const realmf= await loadMf(mf);
        console.info(realmf.objectCollection.objects[2].structureTypeName);
        console.info(realmf.objectCollection.objects.length);
        const ob = realmf.objectCollection.objects[2];
        if (ob instanceof microflows.ActionActivity) {
            const element = <microflows.ActionActivity>ob;
                console.info("BG Colour: " + element.backgroundColor);
                console.log(LifeCycle.prototype);
                element.backgroundColor = microflows.ActionActivityColor.Red;
                commit = true;
                
                console.info(element.toJSON());
            console.info("This is an microflows \n");
        } else {
            console.info("Not an ActionActivity \n");
        }

    try {
        const revision = await workingCopy.commit();
        console.log(`Successfully committed revision: ${revision.num()}. Done.`)
    } catch (error) {
        console.error('Something went wrong:', error);
    }

    console.log("Main completed...");
}

function loadDomainModel(workingCopy: OnlineWorkingCopy): Promise<domainmodels.DomainModel> {
    const dm = workingCopy.model().allDomainModels().filter(dm => dm.containerAsModule.name === 'MyFirstModule')[0];

    return dm.load();
}

function loadMf(microflow: microflows.IMicroflow) :Promise<microflows.Microflow> {
    return microflow.load();
}




main();