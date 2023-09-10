import esMain from 'es-main';
import fse from 'fs-extra';
import { glob } from 'glob';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const baseDir = dirname(fileURLToPath(import.meta.url));
const root = path.resolve(baseDir, '../examples');
const output = path.resolve(baseDir, '../pages/public/examples.json');

async function crawlSection(dir) {
    const items = await glob(dir + '/*/');
    const result = [];
    for (const item of items) {
        const key = path.basename(item);
        result.push(key);
    }
    return result;
}

async function main() {
    const index = {};

    const sections = await glob(`${root}/*/`, { absolute: true });

    for (const section of sections) {
        const key = path.basename(section);
        index[key] = await crawlSection(section);
    }

    await fse.writeJSON(output, index, { spaces: 2 });
}

/**
 * If running this module directly, read the config file, call the main
 * function, and write the output file.
 */
if (esMain(import.meta)) {
    main().catch(err => {
        process.stderr.write(`${err.message}\n`, () => process.exit(1));
    });
}
