import cron from 'node-cron'
import { ProcessPayload, ResultArray } from '../types';
// import chalk from "chalk";
import express from "express";
const app = express()


function getDateTime() {
    let dateInstance = new Date();
    const date = `${dateInstance.getDate().toString().padStart(2,"0")}/${(dateInstance.getMonth() + 1).toString().padStart(2,"0")}/${dateInstance.getFullYear()}`
    const time = `${dateInstance.getHours().toString().padStart(2,"0")}:${dateInstance.getMinutes().toString().padStart(2,"0")}:${dateInstance.getSeconds().toString().padStart(2,"0")}`
    return [date,time];
}

function formatEndpointChecksResult(resultArray: ResultArray[]) {
    // const header = "Date>10          Time>8        Endpoint>17                 Method>3   Status"
    const header = "Date          Time        Endpoint                 Method   Status"
    let content = "";
    
    for (let result of resultArray) {
        content += `\n${(<string>result[3]).padEnd(14," ")}${(<string>result[4]).padEnd(12," ")}${(<string>result[0]).padEnd(25," ")}${(<string>result[1]).padEnd(9," ")}${result[2]}`
    }
    return content;
}

async function runProcess(payload: ProcessPayload){
    const healthArray: ResultArray[] = []
    for (let endpoint of payload.endpoints) {

        const tempArray:[string,string,number?,string?,string?] = [endpoint[0],endpoint[1]];
        try {
            const request = endpoint[1] == 'GET' ? await fetch(`${payload.baseUrl}${endpoint[0]}`) 
                    : await fetch(`${payload.baseUrl}${endpoint[0]}`,{ method:endpoint[1], body: endpoint[2] as BodyInit })
            tempArray.push(request.status)
            tempArray.push(...getDateTime())
            healthArray.push(tempArray);
        } catch (error) {
            console.log(error)
            tempArray.push(500);
            tempArray.push(...getDateTime())
            healthArray.push(tempArray);
        }
    }
    const result = formatEndpointChecksResult(healthArray);
    const failingEndpoints = healthArray.filter((response) => response[2] == 400 || response[2] == 500).map((instance) => {
        return instance.slice(0,3)
    });
    console.log(result)
}

function intervalProcessing(interval:string){
    const cleanedIntervalString =  interval.trim()
    const timeValue = +cleanedIntervalString.slice(0,cleanedIntervalString.length -2);
    const timeUnit = cleanedIntervalString.charAt(cleanedIntervalString.length-1);
    let cronRepresentation;
    switch (timeUnit){
        case "s":
            cronRepresentation = `*/${timeValue} * * * * *`;
            break;
        case "m":
            cronRepresentation = `*/${timeValue} * * * *`;
            break;
        case "h":
            cronRepresentation = `* */${timeValue} * * *`;
            break;
        default:
            cronRepresentation = `* * * * *`;
            break;
    }
    return cronRepresentation;
}

module.exports = function startHealthCheck(payload:ProcessPayload,timeInterval:string) {
    const interval = intervalProcessing(timeInterval);
    cron.schedule(interval,() => {runProcess(payload)});
}


console.log("Date          Time        Endpoint                 Method   Status")