/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Context } from 'hammerhead.gl/core';
import Inspector from './Inspector';

let context: Context;
let inspector: Inspector;

export async function runExample(path: string) {
    context?.destroy();
    if (inspector) {
        inspector.dispose();
    }

    const mod = await import(path);
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    context = await Context.create(canvas);
    inspector = new Inspector(context);

    mod.run(context, inspector);
}

window.runExample = runExample;
