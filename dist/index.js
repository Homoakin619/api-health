"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importStar(require("fs"));
function getDateTime() {
    let dateInstance = new Date();
    const date = `${dateInstance.getDate().toString().padStart(2, "0")}/${(dateInstance.getMonth() + 1).toString().padStart(2, "0")}/${dateInstance.getFullYear()}`;
    const time = `${dateInstance.getHours().toString().padStart(2, "0")}:${dateInstance.getMinutes().toString().padStart(2, "0")}:${dateInstance.getSeconds().toString().padStart(2, "0")}`;
    return [date, time];
}
function writeCheckResultsToFile(results, filename) {
    const header = "Date          Time        Endpoint                 Method   Status";
    fs_1.default.access(filename + ".txt", fs_1.constants.F_OK, (err) => {
        if (err) {
            results = header + results;
        }
        fs_1.default.appendFile(filename + ".txt", results, function (err) {
            if (err) {
                console.log(chalk_1.default.bgRedBright.white.bold("Error occured exporting api health logs"));
            }
            console.log(chalk_1.default.bgGreenBright.white.bold(`Api health logs exported successfully to ${filename}.txt`));
        });
    });
}
function formatEndpointChecksResult(resultArray) {
    let content = "";
    for (let result of resultArray) {
        content += `\n${result[3].padEnd(14, " ")}${result[4].padEnd(12, " ")}${result[0].padEnd(25, " ")}${result[1].padEnd(9, " ")}${result[2]}`;
    }
    return content;
}
async function runProcess(payload, exportfilename) {
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
    if (exportfilename) {
        return writeCheckResultsToFile(result, exportfilename);
    }
    console.log(result);
}
function intervalProcessing(interval) {
    const cleanedIntervalString = interval.trim();
    const timeValue = +cleanedIntervalString.slice(0, cleanedIntervalString.length - 1);
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
/**
 * Starts monitoring all provided api endpoints.
 * @param payload
 * @param timeInterval
 * @param exportfilename
 */
function startHealthCheck(payload, timeInterval, exportfilename) {
    exportfilename ?? console.log(chalk_1.default.bgYellow.bold.red("Date          Time        Endpoint                 Method   Status"));
    const interval = intervalProcessing(timeInterval);
    node_cron_1.default.schedule(interval, () => { runProcess(payload, exportfilename); });
}
exports.default = startHealthCheck;
