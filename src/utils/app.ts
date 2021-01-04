import { exit } from 'process';

const terminateApp = (code: number) => {
    exit(code);
}

const terminateAppWithError = (code: number, message: string) => {
    throw Error(message);
}

export { terminateApp, terminateAppWithError };