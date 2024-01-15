"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
// import chalk from "chalk";
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
function getDateTime() {
    let dateInstance = new Date();
    const date = `${dateInstance.getDate().toString().padStart(2, "0")}/${(dateInstance.getMonth() + 1).toString().padStart(2, "0")}/${dateInstance.getFullYear()}`;
    const time = `${dateInstance.getHours().toString().padStart(2, "0")}:${dateInstance.getMinutes().toString().padStart(2, "0")}:${dateInstance.getSeconds().toString().padStart(2, "0")}`;
    return [date, time];
}
function formatEndpointChecksResult(resultArray) {
    // const header = "Date>10          Time>8        Endpoint>17                 Method>3   Status"
    const header = "Date          Time        Endpoint                 Method   Status";
    let content = "";
    for (let result of resultArray) {
        content += `\n${result[3].padEnd(14, " ")}${result[4].padEnd(12, " ")}${result[0].padEnd(25, " ")}${result[1].padEnd(9, " ")}${result[2]}`;
    }
    return content;
}
async function runProcess(payload) {
    const healthArray = [];
    for (let endpoint of payload.endpoints) {
        const tempArray = [endpoint[0], endpoint[1]];
        try {
            const request = endpoint[1] == 'GET' ? await fetch(`${payload.baseUrl}${endpoint[0]}`)
                : await fetch(`${payload.baseUrl}${endpoint[0]}`, { method: endpoint[1], body: endpoint[2] });
            tempArray.push(request.status);
            tempArray.push(...getDateTime());
            healthArray.push(tempArray);
        }
        catch (error) {
            console.log(error);
            tempArray.push(500);
            tempArray.push(...getDateTime());
            healthArray.push(tempArray);
        }
    }
    const result = formatEndpointChecksResult(healthArray);
    const failingEndpoints = healthArray.filter((response) => response[2] == 400 || response[2] == 500).map((instance) => {
        return instance.slice(0, 3);
    });
    console.log(result);
}
function intervalProcessing(interval) {
    const cleanedIntervalString = interval.trim();
    const timeValue = +cleanedIntervalString.slice(0, cleanedIntervalString.length - 2);
    const timeUnit = cleanedIntervalString.charAt(cleanedIntervalString.length - 1);
    let cronRepresentation;
    switch (timeUnit) {
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
module.exports = function startHealthCheck(payload, timeInterval) {
    const interval = intervalProcessing(timeInterval);
    node_cron_1.default.schedule(interval, () => { runProcess(payload); });
};
console.log("Date          Time        Endpoint                 Method   Status");
