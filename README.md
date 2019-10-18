# SDK Examples
* Analyse your model
* Changing Microflow activity colours


## Installation
Set up your development tools by following the steps in this article:

[https://docs.mendix.com/apidocs-mxsdk/mxsdk/setting-up-your-development-environment](https://docs.mendix.com/apidocs-mxsdk/mxsdk/setting-up-your-development-environment)

Clone the repository to a folder on your local pc and then open the folder in a command prompt. 

Install project dependencies by running the following command

`npm install`

## Configuration

In the src folder, create a file config.json (see config.json.example for a sample).

### auth

```
{
    "auth" : {
        "username":"",
        "apikey":""
    }
    ...
}
```

**auth.username**: Your Mendix login (i.e. your email address)

**auth.apikey**: An api key that you have generated for your Mendix login (not a project api key)

### project
```
{
    ...
    "project":{
        "id":"",
        "name":"",
        "branch": ""
    }
    ...
}
```

**project.id**: The id of your project

**project.name**: The name of your project

**project.branch**: The name of the branch you want to use (or empty string for the main line)  

## Run the script
Compile and run the script by running the following command:

`npm start`

The script will do the following:

- create a folder called 'out' if it doesn't already exist
- create a folder named after the project. If one already exists the script will exit. 
- iterate over every ModuleSecurity and ModuleDocument object and store them in module specific sub folders under the project.