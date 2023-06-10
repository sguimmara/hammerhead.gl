import esMain from 'es-main';
import fse from 'fs-extra';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const baseDir = dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(baseDir, '../dist');

async function main() {
    const pkg = await fse.readJSON(path.resolve(baseDir, '../package.json'));

    // write out simplified package.json
    pkg.main = 'index.js';
    delete pkg.scripts;
    delete pkg.devDependencies;
    await fse.writeJSON(path.join(dist, 'package.json'), pkg, { spaces: 2 });

    // copy in readme and license files
    await fse.copyFile(
        path.resolve(baseDir, '../README.md'),
        path.join(dist, 'README.md'),
    );

    await fse.copyFile(
        path.resolve(baseDir, '../LICENSE'),
        path.join(dist, 'LICENSE'),
    );
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
