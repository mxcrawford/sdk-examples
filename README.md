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

Inside each of the scripts there is a config section as below:

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
        "name":"",
        "id":""
    }
    ...
}
```

**project.id**: The id of your project

**project.name**: The name of your project

## Run the script
Compile and run the script by running the following command:

* Analysing your model
node build\script1.js

* Changing Microflow Background colours
node build\script2.js
