"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
function sendToSocketClients(socketServer, data) {
    const stringifiedData = JSON.stringify(data);
    socketServer.clients.forEach((client) => {
        client.send(stringifiedData, console.error);
    });
}
exports.sendToSocketClients = sendToSocketClients;
;
function getSocketServer(port) {
    const socketServer = new ws_1.default.Server({ port: port, clientTracking: true });
    socketServer.on("connection", clientSocket => {
        console.log(`[ws] Client connected.`);
        clientSocket.on("close", () => {
            console.log(`[ws] Client disconnected`);
            clientSocket.terminate();
        });
    });
    return socketServer;
}
exports.getSocketServer = getSocketServer;
