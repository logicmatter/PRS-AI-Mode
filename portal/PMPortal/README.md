# PMPortal Developer Instructions
Instructions

## Prerequisites:
- Node version 16.10.0 installed
- - Angular globally installed version 14.2.13

## Pull Code Steps:
- Navigate to your GitHub repository. Switch to the develop branch being built.
- After cloning the github …./pmportal.git checkout the working branch.
= Git checkout <branch>

## Cleanup Steps:
- Go to the project's  directory ( pmapps ) after checkout
`CD pmApps `

## Delete current local previous build files
`RMDIR /S /Q node_module`
`RMDIR /S /Q  dist`
`DEL /F /Q package-lock.json`

## Prepare / Make Tooling Steps:
- Install angular tools in the global modules
`npm install -g @angular/cli@14.2.13`
- Install Application Dependency Run the command:  npm install --force.
`npm install --force	`

## Build the Project:
- Run to compile build development Execute the build command:
`npm run build -- --configuration development --base-href /PmPortal/`
- If no errors and only warnings you should get a new folder `dist` with compiled pmportal angular app

## Build Production Version
- To Run to compile build production Execute the build command:
`npm run build -- --configuration production --base-href /PmPortal/`

## Run Portal
Now stay in pmapp folder and run
Npm start
