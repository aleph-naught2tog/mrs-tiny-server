"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = __importDefault(require("child_process"));
function startTypescriptCompiler(tsconfigPathRelativeToCwd = 'tsconfig.json') {
    const configPath = process.cwd() + '/' + tsconfigPathRelativeToCwd;
    const defaultOptions = ['--pretty', '--preserveWatchOutput'];
    const projectOptions = ['--project', configPath];
    const typescriptProcess = child_process_1.default.spawn('tsc', [
        '--watch',
        ...defaultOptions,
        ...projectOptions
    ]);
    typescriptProcess.stdout.on('data', (data) => {
        const message = data.toString('utf8').trim();
        console.log('[tsc:out]', message);
    });
    typescriptProcess.stderr.on('data', (data) => {
        console.error('[tsc:err]', data.toString('utf8').trim());
    });
    return typescriptProcess;
}
exports.startTypescriptCompiler = startTypescriptCompiler;
