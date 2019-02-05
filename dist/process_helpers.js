"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCleanupActions = (shutdownActions) => {
    const sigIntHandler = () => {
        console.error("\n[NODE]", "Caught SIGINT; shutting down servers.");
        for (let actionToPerform of shutdownActions) {
            actionToPerform();
        }
        process.exit(0);
    };
    process.on("SIGINT", sigIntHandler);
};
