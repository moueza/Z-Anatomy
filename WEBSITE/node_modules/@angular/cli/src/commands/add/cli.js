"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const tools_1 = require("@angular-devkit/schematics/tools");
const module_1 = require("module");
const npm_package_arg_1 = __importDefault(require("npm-package-arg"));
const path_1 = require("path");
const semver_1 = require("semver");
const workspace_schema_1 = require("../../../lib/config/workspace-schema");
const schematics_command_module_1 = require("../../command-builder/schematics-command-module");
const color_1 = require("../../utilities/color");
const error_1 = require("../../utilities/error");
const package_metadata_1 = require("../../utilities/package-metadata");
const prompt_1 = require("../../utilities/prompt");
const spinner_1 = require("../../utilities/spinner");
const tty_1 = require("../../utilities/tty");
const version_1 = require("../../utilities/version");
/**
 * The set of packages that should have certain versions excluded from consideration
 * when attempting to find a compatible version for a package.
 * The key is a package name and the value is a SemVer range of versions to exclude.
 */
const packageVersionExclusions = {
    // @angular/localize@9.x and earlier versions as well as @angular/localize@10.0 prereleases do not have peer dependencies setup.
    '@angular/localize': '<10.0.0',
    // @angular/material@7.x versions have unbounded peer dependency ranges (>=7.0.0).
    '@angular/material': '7.x',
};
class AddCommadModule extends schematics_command_module_1.SchematicsCommandModule {
    constructor() {
        super(...arguments);
        this.command = 'add <collection>';
        this.describe = 'Adds support for an external library to your project.';
        this.longDescriptionPath = (0, path_1.join)(__dirname, 'long-description.md');
        this.allowPrivateSchematics = true;
        this.schematicName = 'ng-add';
        this.rootRequire = (0, module_1.createRequire)(this.context.root + '/');
    }
    async builder(argv) {
        const localYargs = (await super.builder(argv))
            .positional('collection', {
            description: 'The package to be added.',
            type: 'string',
            demandOption: true,
        })
            .option('registry', { description: 'The NPM registry to use.', type: 'string' })
            .option('verbose', {
            description: 'Display additional details about internal operations during execution.',
            type: 'boolean',
            default: false,
        })
            .option('skip-confirmation', {
            description: 'Skip asking a confirmation prompt before installing and executing the package. ' +
                'Ensure package name is correct prior to using this option.',
            type: 'boolean',
            default: false,
        })
            // Prior to downloading we don't know the full schema and therefore we cannot be strict on the options.
            // Possibly in the future update the logic to use the following syntax:
            // `ng add @angular/localize -- --package-options`.
            .strict(false);
        const collectionName = await this.getCollectionName();
        const workflow = await this.getOrCreateWorkflowForBuilder(collectionName);
        try {
            const collection = workflow.engine.createCollection(collectionName);
            const options = await this.getSchematicOptions(collection, this.schematicName, workflow);
            return this.addSchemaOptionsToCommand(localYargs, options);
        }
        catch (error) {
            // During `ng add` prior to the downloading of the package
            // we are not able to resolve and create a collection.
            // Or when the the collection value is a path to a tarball.
        }
        return localYargs;
    }
    // eslint-disable-next-line max-lines-per-function
    async run(options) {
        var _a;
        const { logger, packageManager } = this.context;
        const { verbose, registry, collection, skipConfirmation } = options;
        packageManager.ensureCompatibility();
        let packageIdentifier;
        try {
            packageIdentifier = (0, npm_package_arg_1.default)(collection);
        }
        catch (e) {
            (0, error_1.assertIsError)(e);
            logger.error(e.message);
            return 1;
        }
        if (packageIdentifier.name &&
            packageIdentifier.registry &&
            this.isPackageInstalled(packageIdentifier.name)) {
            const validVersion = await this.isProjectVersionValid(packageIdentifier);
            if (validVersion) {
                // Already installed so just run schematic
                logger.info('Skipping installation: Package already installed');
                return this.executeSchematic({ ...options, collection: packageIdentifier.name });
            }
        }
        const spinner = new spinner_1.Spinner();
        spinner.start('Determining package manager...');
        const usingYarn = packageManager.name === workspace_schema_1.PackageManager.Yarn;
        spinner.info(`Using package manager: ${color_1.colors.grey(packageManager.name)}`);
        if (packageIdentifier.name &&
            packageIdentifier.type === 'range' &&
            packageIdentifier.rawSpec === '*') {
            // only package name provided; search for viable version
            // plus special cases for packages that did not have peer deps setup
            spinner.start('Searching for compatible package version...');
            let packageMetadata;
            try {
                packageMetadata = await (0, package_metadata_1.fetchPackageMetadata)(packageIdentifier.name, logger, {
                    registry,
                    usingYarn,
                    verbose,
                });
            }
            catch (e) {
                (0, error_1.assertIsError)(e);
                spinner.fail(`Unable to load package information from registry: ${e.message}`);
                return 1;
            }
            // Start with the version tagged as `latest` if it exists
            const latestManifest = packageMetadata.tags['latest'];
            if (latestManifest) {
                packageIdentifier = npm_package_arg_1.default.resolve(latestManifest.name, latestManifest.version);
            }
            // Adjust the version based on name and peer dependencies
            if ((latestManifest === null || latestManifest === void 0 ? void 0 : latestManifest.peerDependencies) &&
                Object.keys(latestManifest.peerDependencies).length === 0) {
                spinner.succeed(`Found compatible package version: ${color_1.colors.grey(packageIdentifier.toString())}.`);
            }
            else if (!latestManifest || (await this.hasMismatchedPeer(latestManifest))) {
                // 'latest' is invalid so search for most recent matching package
                // Allow prelease versions if the CLI itself is a prerelease
                const allowPrereleases = (0, semver_1.prerelease)(version_1.VERSION.full);
                const versionExclusions = packageVersionExclusions[packageMetadata.name];
                const versionManifests = Object.values(packageMetadata.versions).filter((value) => {
                    // Prerelease versions are not stable and should not be considered by default
                    if (!allowPrereleases && (0, semver_1.prerelease)(value.version)) {
                        return false;
                    }
                    // Deprecated versions should not be used or considered
                    if (value.deprecated) {
                        return false;
                    }
                    // Excluded package versions should not be considered
                    if (versionExclusions &&
                        (0, semver_1.satisfies)(value.version, versionExclusions, { includePrerelease: true })) {
                        return false;
                    }
                    return true;
                });
                // Sort in reverse SemVer order so that the newest compatible version is chosen
                versionManifests.sort((a, b) => (0, semver_1.compare)(b.version, a.version, true));
                let newIdentifier;
                for (const versionManifest of versionManifests) {
                    if (!(await this.hasMismatchedPeer(versionManifest))) {
                        newIdentifier = npm_package_arg_1.default.resolve(versionManifest.name, versionManifest.version);
                        break;
                    }
                }
                if (!newIdentifier) {
                    spinner.warn("Unable to find compatible package. Using 'latest' tag.");
                }
                else {
                    packageIdentifier = newIdentifier;
                    spinner.succeed(`Found compatible package version: ${color_1.colors.grey(packageIdentifier.toString())}.`);
                }
            }
            else {
                spinner.succeed(`Found compatible package version: ${color_1.colors.grey(packageIdentifier.toString())}.`);
            }
        }
        let collectionName = packageIdentifier.name;
        let savePackage;
        try {
            spinner.start('Loading package information from registry...');
            const manifest = await (0, package_metadata_1.fetchPackageManifest)(packageIdentifier.toString(), logger, {
                registry,
                verbose,
                usingYarn,
            });
            savePackage = (_a = manifest['ng-add']) === null || _a === void 0 ? void 0 : _a.save;
            collectionName = manifest.name;
            if (await this.hasMismatchedPeer(manifest)) {
                spinner.warn('Package has unmet peer dependencies. Adding the package may not succeed.');
            }
            else {
                spinner.succeed(`Package information loaded.`);
            }
        }
        catch (e) {
            (0, error_1.assertIsError)(e);
            spinner.fail(`Unable to fetch package information for '${packageIdentifier}': ${e.message}`);
            return 1;
        }
        if (!skipConfirmation) {
            const confirmationResponse = await (0, prompt_1.askConfirmation)(`\nThe package ${color_1.colors.blue(packageIdentifier.raw)} will be installed and executed.\n` +
                'Would you like to proceed?', true, false);
            if (!confirmationResponse) {
                if (!(0, tty_1.isTTY)()) {
                    logger.error('No terminal detected. ' +
                        `'--skip-confirmation' can be used to bypass installation confirmation. ` +
                        `Ensure package name is correct prior to '--skip-confirmation' option usage.`);
                }
                logger.error('Command aborted.');
                return 1;
            }
        }
        if (savePackage === false) {
            // Temporary packages are located in a different directory
            // Hence we need to resolve them using the temp path
            const { success, tempNodeModules } = await packageManager.installTemp(packageIdentifier.raw, registry ? [`--registry="${registry}"`] : undefined);
            const tempRequire = (0, module_1.createRequire)(tempNodeModules + '/');
            const resolvedCollectionPath = tempRequire.resolve((0, path_1.join)(collectionName, 'package.json'));
            if (!success) {
                return 1;
            }
            collectionName = (0, path_1.dirname)(resolvedCollectionPath);
        }
        else {
            const success = await packageManager.install(packageIdentifier.raw, savePackage, registry ? [`--registry="${registry}"`] : undefined);
            if (!success) {
                return 1;
            }
        }
        return this.executeSchematic({ ...options, collection: collectionName });
    }
    async isProjectVersionValid(packageIdentifier) {
        if (!packageIdentifier.name) {
            return false;
        }
        const installedVersion = await this.findProjectVersion(packageIdentifier.name);
        if (!installedVersion) {
            return false;
        }
        if (packageIdentifier.rawSpec === '*') {
            return true;
        }
        if (packageIdentifier.type === 'range' &&
            packageIdentifier.fetchSpec &&
            packageIdentifier.fetchSpec !== '*') {
            return (0, semver_1.satisfies)(installedVersion, packageIdentifier.fetchSpec);
        }
        if (packageIdentifier.type === 'version') {
            const v1 = (0, semver_1.valid)(packageIdentifier.fetchSpec);
            const v2 = (0, semver_1.valid)(installedVersion);
            return v1 !== null && v1 === v2;
        }
        return false;
    }
    async getCollectionName() {
        const [, collectionName] = this.context.args.positional;
        return collectionName;
    }
    isPackageInstalled(name) {
        try {
            this.rootRequire.resolve((0, path_1.join)(name, 'package.json'));
            return true;
        }
        catch (e) {
            (0, error_1.assertIsError)(e);
            if (e.code !== 'MODULE_NOT_FOUND') {
                throw e;
            }
        }
        return false;
    }
    async executeSchematic(options) {
        try {
            const { verbose, skipConfirmation, interactive, force, dryRun, registry, defaults, collection: collectionName, ...schematicOptions } = options;
            return await this.runSchematic({
                schematicOptions,
                schematicName: this.schematicName,
                collectionName,
                executionOptions: {
                    interactive,
                    force,
                    dryRun,
                    defaults,
                    packageRegistry: registry,
                },
            });
        }
        catch (e) {
            if (e instanceof tools_1.NodePackageDoesNotSupportSchematics) {
                this.context.logger.error(core_1.tags.oneLine `
          The package that you are trying to add does not support schematics. You can try using
          a different version of the package or contact the package author to add ng-add support.
        `);
                return 1;
            }
            throw e;
        }
    }
    async findProjectVersion(name) {
        var _a, _b;
        const { logger, root } = this.context;
        let installedPackage;
        try {
            installedPackage = this.rootRequire.resolve((0, path_1.join)(name, 'package.json'));
        }
        catch (_c) { }
        if (installedPackage) {
            try {
                const installed = await (0, package_metadata_1.fetchPackageManifest)((0, path_1.dirname)(installedPackage), logger);
                return installed.version;
            }
            catch (_d) { }
        }
        let projectManifest;
        try {
            projectManifest = await (0, package_metadata_1.fetchPackageManifest)(root, logger);
        }
        catch (_e) { }
        if (projectManifest) {
            const version = ((_a = projectManifest.dependencies) === null || _a === void 0 ? void 0 : _a[name]) || ((_b = projectManifest.devDependencies) === null || _b === void 0 ? void 0 : _b[name]);
            if (version) {
                return version;
            }
        }
        return null;
    }
    async hasMismatchedPeer(manifest) {
        for (const peer in manifest.peerDependencies) {
            let peerIdentifier;
            try {
                peerIdentifier = npm_package_arg_1.default.resolve(peer, manifest.peerDependencies[peer]);
            }
            catch (_a) {
                this.context.logger.warn(`Invalid peer dependency ${peer} found in package.`);
                continue;
            }
            if (peerIdentifier.type === 'version' || peerIdentifier.type === 'range') {
                try {
                    const version = await this.findProjectVersion(peer);
                    if (!version) {
                        continue;
                    }
                    const options = { includePrerelease: true };
                    if (!(0, semver_1.intersects)(version, peerIdentifier.rawSpec, options) &&
                        !(0, semver_1.satisfies)(version, peerIdentifier.rawSpec, options)) {
                        return true;
                    }
                }
                catch (_b) {
                    // Not found or invalid so ignore
                    continue;
                }
            }
            else {
                // type === 'tag' | 'file' | 'directory' | 'remote' | 'git'
                // Cannot accurately compare these as the tag/location may have changed since install
            }
        }
        return false;
    }
}
exports.default = AddCommadModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhci9jbGkvc3JjL2NvbW1hbmRzL2FkZC9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7QUFFSCwrQ0FBNEM7QUFDNUMsNERBQXVGO0FBQ3ZGLG1DQUF1QztBQUN2QyxzRUFBa0M7QUFDbEMsK0JBQXFDO0FBQ3JDLG1DQUFrRjtBQUVsRiwyRUFBc0U7QUFNdEUsK0ZBR3lEO0FBQ3pELGlEQUErQztBQUMvQyxpREFBc0Q7QUFDdEQsdUVBSzBDO0FBQzFDLG1EQUF5RDtBQUN6RCxxREFBa0Q7QUFDbEQsNkNBQTRDO0FBQzVDLHFEQUFrRDtBQVNsRDs7OztHQUlHO0FBQ0gsTUFBTSx3QkFBd0IsR0FBbUM7SUFDL0QsZ0lBQWdJO0lBQ2hJLG1CQUFtQixFQUFFLFNBQVM7SUFDOUIsa0ZBQWtGO0lBQ2xGLG1CQUFtQixFQUFFLEtBQUs7Q0FDM0IsQ0FBQztBQUVGLE1BQXFCLGVBQ25CLFNBQVEsbURBQXVCO0lBRGpDOztRQUlFLFlBQU8sR0FBRyxrQkFBa0IsQ0FBQztRQUM3QixhQUFRLEdBQUcsdURBQXVELENBQUM7UUFDbkUsd0JBQW1CLEdBQUcsSUFBQSxXQUFJLEVBQUMsU0FBUyxFQUFFLHFCQUFxQixDQUFDLENBQUM7UUFDMUMsMkJBQXNCLEdBQUcsSUFBSSxDQUFDO1FBQ2hDLGtCQUFhLEdBQUcsUUFBUSxDQUFDO1FBQ2xDLGdCQUFXLEdBQUcsSUFBQSxzQkFBYSxFQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBOFovRCxDQUFDO0lBNVpVLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBVTtRQUMvQixNQUFNLFVBQVUsR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUMzQyxVQUFVLENBQUMsWUFB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LENBQUMsQ0FBQztvQkFDcEQsSUFBSSxDQUFDLE9BQU8sRUFBRTt3QkFDWixTQUFTO3FCQUNWO29CQUVELE1BQU0sT0FBTyxHQUFHLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLENBQUM7b0JBRTVDLElBQ0UsQ0FBQyxJQUFBLG1CQUFVLEVBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDO3dCQUNyRCxDQUFDLElBQUEsa0JBQVMsRUFBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsRUFDcEQ7d0JBQ0EsT0FBTyxJQUFJLENBQUM7cUJBQ2I7aUJBQ0Y7Z0JBQUMsV0FBTTtvQkFDTixpQ0FBaUM7b0JBQ2pDLFNBQVM7aUJBQ1Y7YUFDRjtpQkFBTTtnQkFDTCwyREFBMkQ7Z0JBQzNELHFGQUFxRjthQUN0RjtTQUNGO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0NBQ0Y7QUF2YUQsa0NBdWFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7IHRhZ3MgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQgeyBOb2RlUGFja2FnZURvZXNOb3RTdXBwb3J0U2NoZW1hdGljcyB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzL3Rvb2xzJztcbmltcG9ydCB7IGNyZWF0ZVJlcXVpcmUgfSBmcm9tICdtb2R1bGUnO1xuaW1wb3J0IG5wYSBmcm9tICducG0tcGFja2FnZS1hcmcnO1xuaW1wb3J0IHsgZGlybmFtZSwgam9pbiB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgUmFuZ2UsIGNvbXBhcmUsIGludGVyc2VjdHMsIHByZXJlbGVhc2UsIHNhdGlzZmllcywgdmFsaWQgfSBmcm9tICdzZW12ZXInO1xuaW1wb3J0IHsgQXJndiB9IGZyb20gJ3lhcmdzJztcbmltcG9ydCB7IFBhY2thZ2VNYW5hZ2VyIH0gZnJvbSAnLi4vLi4vLi4vbGliL2NvbmZpZy93b3Jrc3BhY2Utc2NoZW1hJztcbmltcG9ydCB7XG4gIENvbW1hbmRNb2R1bGVJbXBsZW1lbnRhdGlvbixcbiAgT3B0aW9ucyxcbiAgT3RoZXJPcHRpb25zLFxufSBmcm9tICcuLi8uLi9jb21tYW5kLWJ1aWxkZXIvY29tbWFuZC1tb2R1bGUnO1xuaW1wb3J0IHtcbiAgU2NoZW1hdGljc0NvbW1hbmRBcmdzLFxuICBTY2hlbWF0aWNzQ29tbWFuZE1vZHVsZSxcbn0gZnJvbSAnLi4vLi4vY29tbWFuZC1idWlsZGVyL3NjaGVtYXRpY3MtY29tbWFuZC1tb2R1bGUnO1xuaW1wb3J0IHsgY29sb3JzIH0gZnJvbSAnLi4vLi4vdXRpbGl0aWVzL2NvbG9yJztcbmltcG9ydCB7IGFzc2VydElzRXJyb3IgfSBmcm9tICcuLi8uLi91dGlsaXRpZXMvZXJyb3InO1xuaW1wb3J0IHtcbiAgTmdBZGRTYXZlRGVwZW5kZW5jeSxcbiAgUGFja2FnZU1hbmlmZXN0LFxuICBmZXRjaFBhY2thZ2VNYW5pZmVzdCxcbiAgZmV0Y2hQYWNrYWdlTWV0YWRhdGEsXG59IGZyb20gJy4uLy4uL3V0aWxpdGllcy9wYWNrYWdlLW1ldGFkYXRhJztcbmltcG9ydCB7IGFza0NvbmZpcm1hdGlvbiB9IGZyb20gJy4uLy4uL3V0aWxpdGllcy9wcm9tcHQnO1xuaW1wb3J0IHsgU3Bpbm5lciB9IGZyb20gJy4uLy4uL3V0aWxpdGllcy9zcGlubmVyJztcbmltcG9ydCB7IGlzVFRZIH0gZnJvbSAnLi4vLi4vdXRpbGl0aWVzL3R0eSc7XG5pbXBvcnQgeyBWRVJTSU9OIH0gZnJvbSAnLi4vLi4vdXRpbGl0aWVzL3ZlcnNpb24nO1xuXG5pbnRlcmZhY2UgQWRkQ29tbWFuZEFyZ3MgZXh0ZW5kcyBTY2hlbWF0aWNzQ29tbWFuZEFyZ3Mge1xuICBjb2xsZWN0aW9uOiBzdHJpbmc7XG4gIHZlcmJvc2U/OiBib29sZWFuO1xuICByZWdpc3RyeT86IHN0cmluZztcbiAgJ3NraXAtY29uZmlybWF0aW9uJz86IGJvb2xlYW47XG59XG5cbi8qKlxuICogVGhlIHNldCBvZiBwYWNrYWdlcyB0aGF0IHNob3VsZCBoYXZlIGNlcnRhaW4gdmVyc2lvbnMgZXhjbHVkZWQgZnJvbSBjb25zaWRlcmF0aW9uXG4gKiB3aGVuIGF0dGVtcHRpbmcgdG8gZmluZCBhIGNvbXBhdGlibGUgdmVyc2lvbiBmb3IgYSBwYWNrYWdlLlxuICogVGhlIGtleSBpcyBhIHBhY2thZ2UgbmFtZSBhbmQgdGhlIHZhbHVlIGlzIGEgU2VtVmVyIHJhbmdlIG9mIHZlcnNpb25zIHRvIGV4Y2x1ZGUuXG4gKi9cbmNvbnN0IHBhY2thZ2VWZXJzaW9uRXhjbHVzaW9uczogUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgUmFuZ2U+ID0ge1xuICAvLyBAYW5ndWxhci9sb2NhbGl6ZUA5LnggYW5kIGVhcmxpZXIgdmVyc2lvbnMgYXMgd2VsbCBhcyBAYW5ndWxhci9sb2NhbGl6ZUAxMC4wIHByZXJlbGVhc2VzIGRvIG5vdCBoYXZlIHBlZXIgZGVwZW5kZW5jaWVzIHNldHVwLlxuICAnQGFuZ3VsYXIvbG9jYWxpemUnOiAnPDEwLjAuMCcsXG4gIC8vIEBhbmd1bGFyL21hdGVyaWFsQDcueCB2ZXJzaW9ucyBoYXZlIHVuYm91bmRlZCBwZWVyIGRlcGVuZGVuY3kgcmFuZ2VzICg+PTcuMC4wKS5cbiAgJ0Bhbmd1bGFyL21hdGVyaWFsJzogJzcueCcsXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBZGRDb21tYWRNb2R1bGVcbiAgZXh0ZW5kcyBTY2hlbWF0aWNzQ29tbWFuZE1vZHVsZVxuICBpbXBsZW1lbnRzIENvbW1hbmRNb2R1bGVJbXBsZW1lbnRhdGlvbjxBZGRDb21tYW5kQXJncz5cbntcbiAgY29tbWFuZCA9ICdhZGQgPGNvbGxlY3Rpb24+JztcbiAgZGVzY3JpYmUgPSAnQWRkcyBzdXBwb3J0IGZvciBhbiBleHRlcm5hbCBsaWJyYXJ5IHRvIHlvdXIgcHJvamVjdC4nO1xuICBsb25nRGVzY3JpcHRpb25QYXRoID0gam9pbihfX2Rpcm5hbWUsICdsb25nLWRlc2NyaXB0aW9uLm1kJyk7XG4gIHByb3RlY3RlZCBvdmVycmlkZSBhbGxvd1ByaXZhdGVTY2hlbWF0aWNzID0gdHJ1ZTtcbiAgcHJpdmF0ZSByZWFkb25seSBzY2hlbWF0aWNOYW1lID0gJ25nLWFkZCc7XG4gIHByaXZhdGUgcm9vdFJlcXVpcmUgPSBjcmVhdGVSZXF1aXJlKHRoaXMuY29udGV4dC5yb290ICsgJy8nKTtcblxuICBvdmVycmlkZSBhc3luYyBidWlsZGVyKGFyZ3Y6IEFyZ3YpOiBQcm9taXNlPEFyZ3Y8QWRkQ29tbWFuZEFyZ3M+PiB7XG4gICAgY29uc3QgbG9jYWxZYXJncyA9IChhd2FpdCBzdXBlci5idWlsZGVyKGFyZ3YpKVxuICAgICAgLnBvc2l0aW9uYWwoJ2NvbGxlY3Rpb24nLCB7XG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIHBhY2thZ2UgdG8gYmUgYWRkZWQuJyxcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlbWFuZE9wdGlvbjogdHJ1ZSxcbiAgICAgIH0pXG4gICAgICAub3B0aW9uKCdyZWdpc3RyeScsIHsgZGVzY3JpcHRpb246ICdUaGUgTlBNIHJlZ2lzdHJ5IHRvIHVzZS4nLCB0eXBlOiAnc3RyaW5nJyB9KVxuICAgICAgLm9wdGlvbigndmVyYm9zZScsIHtcbiAgICAgICAgZGVzY3JpcHRpb246ICdEaXNwbGF5IGFkZGl0aW9uYWwgZGV0YWlscyBhYm91dCBpbnRlcm5hbCBvcGVyYXRpb25zIGR1cmluZyBleGVjdXRpb24uJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIH0pXG4gICAgICAub3B0aW9uKCdza2lwLWNvbmZpcm1hdGlvbicsIHtcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ1NraXAgYXNraW5nIGEgY29uZmlybWF0aW9uIHByb21wdCBiZWZvcmUgaW5zdGFsbGluZyBhbmQgZXhlY3V0aW5nIHRoZSBwYWNrYWdlLiAnICtcbiAgICAgICAgICAnRW5zdXJlIHBhY2thZ2UgbmFtZSBpcyBjb3JyZWN0IHByaW9yIHRvIHVzaW5nIHRoaXMgb3B0aW9uLicsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICB9KVxuICAgICAgLy8gUHJpb3IgdG8gZG93bmxvYWRpbmcgd2UgZG9uJ3Qga25vdyB0aGUgZnVsbCBzY2hlbWEgYW5kIHRoZXJlZm9yZSB3ZSBjYW5ub3QgYmUgc3RyaWN0IG9uIHRoZSBvcHRpb25zLlxuICAgICAgLy8gUG9zc2libHkgaW4gdGhlIGZ1dHVyZSB1cGRhdGUgdGhlIGxvZ2ljIHRvIHVzZSB0aGUgZm9sbG93aW5nIHN5bnRheDpcbiAgICAgIC8vIGBuZyBhZGQgQGFuZ3VsYXIvbG9jYWxpemUgLS0gLS1wYWNrYWdlLW9wdGlvbnNgLlxuICAgICAgLnN0cmljdChmYWxzZSk7XG5cbiAgICBjb25zdCBjb2xsZWN0aW9uTmFtZSA9IGF3YWl0IHRoaXMuZ2V0Q29sbGVjdGlvbk5hbWUoKTtcbiAgICBjb25zdCB3b3JrZmxvdyA9IGF3YWl0IHRoaXMuZ2V0T3JDcmVhdGVXb3JrZmxvd0ZvckJ1aWxkZXIoY29sbGVjdGlvbk5hbWUpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbGxlY3Rpb24gPSB3b3JrZmxvdy5lbmdpbmUuY3JlYXRlQ29sbGVjdGlvbihjb2xsZWN0aW9uTmFtZSk7XG4gICAgICBjb25zdCBvcHRpb25zID0gYXdhaXQgdGhpcy5nZXRTY2hlbWF0aWNPcHRpb25zKGNvbGxlY3Rpb24sIHRoaXMuc2NoZW1hdGljTmFtZSwgd29ya2Zsb3cpO1xuXG4gICAgICByZXR1cm4gdGhpcy5hZGRTY2hlbWFPcHRpb25zVG9Db21tYW5kKGxvY2FsWWFyZ3MsIG9wdGlvbnMpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAvLyBEdXJpbmcgYG5nIGFkZGAgcHJpb3IgdG8gdGhlIGRvd25sb2FkaW5nIG9mIHRoZSBwYWNrYWdlXG4gICAgICAvLyB3ZSBhcmUgbm90IGFibGUgdG8gcmVzb2x2ZSBhbmQgY3JlYXRlIGEgY29sbGVjdGlvbi5cbiAgICAgIC8vIE9yIHdoZW4gdGhlIHRoZSBjb2xsZWN0aW9uIHZhbHVlIGlzIGEgcGF0aCB0byBhIHRhcmJhbGwuXG4gICAgfVxuXG4gICAgcmV0dXJuIGxvY2FsWWFyZ3M7XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbWF4LWxpbmVzLXBlci1mdW5jdGlvblxuICBhc3luYyBydW4ob3B0aW9uczogT3B0aW9uczxBZGRDb21tYW5kQXJncz4gJiBPdGhlck9wdGlvbnMpOiBQcm9taXNlPG51bWJlciB8IHZvaWQ+IHtcbiAgICBjb25zdCB7IGxvZ2dlciwgcGFja2FnZU1hbmFnZXIgfSA9IHRoaXMuY29udGV4dDtcbiAgICBjb25zdCB7IHZlcmJvc2UsIHJlZ2lzdHJ5LCBjb2xsZWN0aW9uLCBza2lwQ29uZmlybWF0aW9uIH0gPSBvcHRpb25zO1xuICAgIHBhY2thZ2VNYW5hZ2VyLmVuc3VyZUNvbXBhdGliaWxpdHkoKTtcblxuICAgIGxldCBwYWNrYWdlSWRlbnRpZmllcjtcbiAgICB0cnkge1xuICAgICAgcGFja2FnZUlkZW50aWZpZXIgPSBucGEoY29sbGVjdGlvbik7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgYXNzZXJ0SXNFcnJvcihlKTtcbiAgICAgIGxvZ2dlci5lcnJvcihlLm1lc3NhZ2UpO1xuXG4gICAgICByZXR1cm4gMTtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICBwYWNrYWdlSWRlbnRpZmllci5uYW1lICYmXG4gICAgICBwYWNrYWdlSWRlbnRpZmllci5yZWdpc3RyeSAmJlxuICAgICAgdGhpcy5pc1BhY2thZ2VJbnN0YWxsZWQocGFja2FnZUlkZW50aWZpZXIubmFtZSlcbiAgICApIHtcbiAgICAgIGNvbnN0IHZhbGlkVmVyc2lvbiA9IGF3YWl0IHRoaXMuaXNQcm9qZWN0VmVyc2lvblZhbGlkKHBhY2thZ2VJZGVudGlmaWVyKTtcbiAgICAgIGlmICh2YWxpZFZlcnNpb24pIHtcbiAgICAgICAgLy8gQWxyZWFkeSBpbnN0YWxsZWQgc28ganVzdCBydW4gc2NoZW1hdGljXG4gICAgICAgIGxvZ2dlci5pbmZvKCdTa2lwcGluZyBpbnN0YWxsYXRpb246IFBhY2thZ2UgYWxyZWFkeSBpbnN0YWxsZWQnKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5leGVjdXRlU2NoZW1hdGljKHsgLi4ub3B0aW9ucywgY29sbGVjdGlvbjogcGFja2FnZUlkZW50aWZpZXIubmFtZSB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBzcGlubmVyID0gbmV3IFNwaW5uZXIoKTtcblxuICAgIHNwaW5uZXIuc3RhcnQoJ0RldGVybWluaW5nIHBhY2thZ2UgbWFuYWdlci4uLicpO1xuICAgIGNvbnN0IHVzaW5nWWFybiA9IHBhY2thZ2VNYW5hZ2VyLm5hbWUgPT09IFBhY2thZ2VNYW5hZ2VyLllhcm47XG4gICAgc3Bpbm5lci5pbmZvKGBVc2luZyBwYWNrYWdlIG1hbmFnZXI6ICR7Y29sb3JzLmdyZXkocGFja2FnZU1hbmFnZXIubmFtZSl9YCk7XG5cbiAgICBpZiAoXG4gICAgICBwYWNrYWdlSWRlbnRpZmllci5uYW1lICYmXG4gICAgICBwYWNrYWdlSWRlbnRpZmllci50eXBlID09PSAncmFuZ2UnICYmXG4gICAgICBwYWNrYWdlSWRlbnRpZmllci5yYXdTcGVjID09PSAnKidcbiAgICApIHtcbiAgICAgIC8vIG9ubHkgcGFja2FnZSBuYW1lIHByb3ZpZGVkOyBzZWFyY2ggZm9yIHZpYWJsZSB2ZXJzaW9uXG4gICAgICAvLyBwbHVzIHNwZWNpYWwgY2FzZXMgZm9yIHBhY2thZ2VzIHRoYXQgZGlkIG5vdCBoYXZlIHBlZXIgZGVwcyBzZXR1cFxuICAgICAgc3Bpbm5lci5zdGFydCgnU2VhcmNoaW5nIGZvciBjb21wYXRpYmxlIHBhY2thZ2UgdmVyc2lvbi4uLicpO1xuXG4gICAgICBsZXQgcGFja2FnZU1ldGFkYXRhO1xuICAgICAgdHJ5IHtcbiAgICAgICAgcGFja2FnZU1ldGFkYXRhID0gYXdhaXQgZmV0Y2hQYWNrYWdlTWV0YWRhdGEocGFja2FnZUlkZW50aWZpZXIubmFtZSwgbG9nZ2VyLCB7XG4gICAgICAgICAgcmVnaXN0cnksXG4gICAgICAgICAgdXNpbmdZYXJuLFxuICAgICAgICAgIHZlcmJvc2UsXG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBhc3NlcnRJc0Vycm9yKGUpO1xuICAgICAgICBzcGlubmVyLmZhaWwoYFVuYWJsZSB0byBsb2FkIHBhY2thZ2UgaW5mb3JtYXRpb24gZnJvbSByZWdpc3RyeTogJHtlLm1lc3NhZ2V9YCk7XG5cbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICB9XG5cbiAgICAgIC8vIFN0YXJ0IHdpdGggdGhlIHZlcnNpb24gdGFnZ2VkIGFzIGBsYXRlc3RgIGlmIGl0IGV4aXN0c1xuICAgICAgY29uc3QgbGF0ZXN0TWFuaWZlc3QgPSBwYWNrYWdlTWV0YWRhdGEudGFnc1snbGF0ZXN0J107XG4gICAgICBpZiAobGF0ZXN0TWFuaWZlc3QpIHtcbiAgICAgICAgcGFja2FnZUlkZW50aWZpZXIgPSBucGEucmVzb2x2ZShsYXRlc3RNYW5pZmVzdC5uYW1lLCBsYXRlc3RNYW5pZmVzdC52ZXJzaW9uKTtcbiAgICAgIH1cblxuICAgICAgLy8gQWRqdXN0IHRoZSB2ZXJzaW9uIGJhc2VkIG9uIG5hbWUgYW5kIHBlZXIgZGVwZW5kZW5jaWVzXG4gICAgICBpZiAoXG4gICAgICAgIGxhdGVzdE1hbmlmZXN0Py5wZWVyRGVwZW5kZW5jaWVzICYmXG4gICAgICAgIE9iamVjdC5rZXlzKGxhdGVzdE1hbmlmZXN0LnBlZXJEZXBlbmRlbmNpZXMpLmxlbmd0aCA9PT0gMFxuICAgICAgKSB7XG4gICAgICAgIHNwaW5uZXIuc3VjY2VlZChcbiAgICAgICAgICBgRm91bmQgY29tcGF0aWJsZSBwYWNrYWdlIHZlcnNpb246ICR7Y29sb3JzLmdyZXkocGFja2FnZUlkZW50aWZpZXIudG9TdHJpbmcoKSl9LmAsXG4gICAgICAgICk7XG4gICAgICB9IGVsc2UgaWYgKCFsYXRlc3RNYW5pZmVzdCB8fCAoYXdhaXQgdGhpcy5oYXNNaXNtYXRjaGVkUGVlcihsYXRlc3RNYW5pZmVzdCkpKSB7XG4gICAgICAgIC8vICdsYXRlc3QnIGlzIGludmFsaWQgc28gc2VhcmNoIGZvciBtb3N0IHJlY2VudCBtYXRjaGluZyBwYWNrYWdlXG5cbiAgICAgICAgLy8gQWxsb3cgcHJlbGVhc2UgdmVyc2lvbnMgaWYgdGhlIENMSSBpdHNlbGYgaXMgYSBwcmVyZWxlYXNlXG4gICAgICAgIGNvbnN0IGFsbG93UHJlcmVsZWFzZXMgPSBwcmVyZWxlYXNlKFZFUlNJT04uZnVsbCk7XG5cbiAgICAgICAgY29uc3QgdmVyc2lvbkV4Y2x1c2lvbnMgPSBwYWNrYWdlVmVyc2lvbkV4Y2x1c2lvbnNbcGFja2FnZU1ldGFkYXRhLm5hbWVdO1xuICAgICAgICBjb25zdCB2ZXJzaW9uTWFuaWZlc3RzID0gT2JqZWN0LnZhbHVlcyhwYWNrYWdlTWV0YWRhdGEudmVyc2lvbnMpLmZpbHRlcihcbiAgICAgICAgICAodmFsdWU6IFBhY2thZ2VNYW5pZmVzdCkgPT4ge1xuICAgICAgICAgICAgLy8gUHJlcmVsZWFzZSB2ZXJzaW9ucyBhcmUgbm90IHN0YWJsZSBhbmQgc2hvdWxkIG5vdCBiZSBjb25zaWRlcmVkIGJ5IGRlZmF1bHRcbiAgICAgICAgICAgIGlmICghYWxsb3dQcmVyZWxlYXNlcyAmJiBwcmVyZWxlYXNlKHZhbHVlLnZlcnNpb24pKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIERlcHJlY2F0ZWQgdmVyc2lvbnMgc2hvdWxkIG5vdCBiZSB1c2VkIG9yIGNvbnNpZGVyZWRcbiAgICAgICAgICAgIGlmICh2YWx1ZS5kZXByZWNhdGVkKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEV4Y2x1ZGVkIHBhY2thZ2UgdmVyc2lvbnMgc2hvdWxkIG5vdCBiZSBjb25zaWRlcmVkXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIHZlcnNpb25FeGNsdXNpb25zICYmXG4gICAgICAgICAgICAgIHNhdGlzZmllcyh2YWx1ZS52ZXJzaW9uLCB2ZXJzaW9uRXhjbHVzaW9ucywgeyBpbmNsdWRlUHJlcmVsZWFzZTogdHJ1ZSB9KVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfSxcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBTb3J0IGluIHJldmVyc2UgU2VtVmVyIG9yZGVyIHNvIHRoYXQgdGhlIG5ld2VzdCBjb21wYXRpYmxlIHZlcnNpb24gaXMgY2hvc2VuXG4gICAgICAgIHZlcnNpb25NYW5pZmVzdHMuc29ydCgoYSwgYikgPT4gY29tcGFyZShiLnZlcnNpb24sIGEudmVyc2lvbiwgdHJ1ZSkpO1xuXG4gICAgICAgIGxldCBuZXdJZGVudGlmaWVyO1xuICAgICAgICBmb3IgKGNvbnN0IHZlcnNpb25NYW5pZmVzdCBvZiB2ZXJzaW9uTWFuaWZlc3RzKSB7XG4gICAgICAgICAgaWYgKCEoYXdhaXQgdGhpcy5oYXNNaXNtYXRjaGVkUGVlcih2ZXJzaW9uTWFuaWZlc3QpKSkge1xuICAgICAgICAgICAgbmV3SWRlbnRpZmllciA9IG5wYS5yZXNvbHZlKHZlcnNpb25NYW5pZmVzdC5uYW1lLCB2ZXJzaW9uTWFuaWZlc3QudmVyc2lvbik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIW5ld0lkZW50aWZpZXIpIHtcbiAgICAgICAgICBzcGlubmVyLndhcm4oXCJVbmFibGUgdG8gZmluZCBjb21wYXRpYmxlIHBhY2thZ2UuIFVzaW5nICdsYXRlc3QnIHRhZy5cIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGFja2FnZUlkZW50aWZpZXIgPSBuZXdJZGVudGlmaWVyO1xuICAgICAgICAgIHNwaW5uZXIuc3VjY2VlZChcbiAgICAgICAgICAgIGBGb3VuZCBjb21wYXRpYmxlIHBhY2thZ2UgdmVyc2lvbjogJHtjb2xvcnMuZ3JleShwYWNrYWdlSWRlbnRpZmllci50b1N0cmluZygpKX0uYCxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzcGlubmVyLnN1Y2NlZWQoXG4gICAgICAgICAgYEZvdW5kIGNvbXBhdGlibGUgcGFja2FnZSB2ZXJzaW9uOiAke2NvbG9ycy5ncmV5KHBhY2thZ2VJZGVudGlmaWVyLnRvU3RyaW5nKCkpfS5gLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBjb2xsZWN0aW9uTmFtZSA9IHBhY2thZ2VJZGVudGlmaWVyLm5hbWU7XG4gICAgbGV0IHNhdmVQYWNrYWdlOiBOZ0FkZFNhdmVEZXBlbmRlbmN5IHwgdW5kZWZpbmVkO1xuXG4gICAgdHJ5IHtcbiAgICAgIHNwaW5uZXIuc3RhcnQoJ0xvYWRpbmcgcGFja2FnZSBpbmZvcm1hdGlvbiBmcm9tIHJlZ2lzdHJ5Li4uJyk7XG4gICAgICBjb25zdCBtYW5pZmVzdCA9IGF3YWl0IGZldGNoUGFja2FnZU1hbmlmZXN0KHBhY2thZ2VJZGVudGlmaWVyLnRvU3RyaW5nKCksIGxvZ2dlciwge1xuICAgICAgICByZWdpc3RyeSxcbiAgICAgICAgdmVyYm9zZSxcbiAgICAgICAgdXNpbmdZYXJuLFxuICAgICAgfSk7XG5cbiAgICAgIHNhdmVQYWNrYWdlID0gbWFuaWZlc3RbJ25nLWFkZCddPy5zYXZlO1xuICAgICAgY29sbGVjdGlvbk5hbWUgPSBtYW5pZmVzdC5uYW1lO1xuXG4gICAgICBpZiAoYXdhaXQgdGhpcy5oYXNNaXNtYXRjaGVkUGVlcihtYW5pZmVzdCkpIHtcbiAgICAgICAgc3Bpbm5lci53YXJuKCdQYWNrYWdlIGhhcyB1bm1ldCBwZWVyIGRlcGVuZGVuY2llcy4gQWRkaW5nIHRoZSBwYWNrYWdlIG1heSBub3Qgc3VjY2VlZC4nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNwaW5uZXIuc3VjY2VlZChgUGFja2FnZSBpbmZvcm1hdGlvbiBsb2FkZWQuYCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgYXNzZXJ0SXNFcnJvcihlKTtcbiAgICAgIHNwaW5uZXIuZmFpbChgVW5hYmxlIHRvIGZldGNoIHBhY2thZ2UgaW5mb3JtYXRpb24gZm9yICcke3BhY2thZ2VJZGVudGlmaWVyfSc6ICR7ZS5tZXNzYWdlfWApO1xuXG4gICAgICByZXR1cm4gMTtcbiAgICB9XG5cbiAgICBpZiAoIXNraXBDb25maXJtYXRpb24pIHtcbiAgICAgIGNvbnN0IGNvbmZpcm1hdGlvblJlc3BvbnNlID0gYXdhaXQgYXNrQ29uZmlybWF0aW9uKFxuICAgICAgICBgXFxuVGhlIHBhY2thZ2UgJHtjb2xvcnMuYmx1ZShwYWNrYWdlSWRlbnRpZmllci5yYXcpfSB3aWxsIGJlIGluc3RhbGxlZCBhbmQgZXhlY3V0ZWQuXFxuYCArXG4gICAgICAgICAgJ1dvdWxkIHlvdSBsaWtlIHRvIHByb2NlZWQ/JyxcbiAgICAgICAgdHJ1ZSxcbiAgICAgICAgZmFsc2UsXG4gICAgICApO1xuXG4gICAgICBpZiAoIWNvbmZpcm1hdGlvblJlc3BvbnNlKSB7XG4gICAgICAgIGlmICghaXNUVFkoKSkge1xuICAgICAgICAgIGxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgICdObyB0ZXJtaW5hbCBkZXRlY3RlZC4gJyArXG4gICAgICAgICAgICAgIGAnLS1za2lwLWNvbmZpcm1hdGlvbicgY2FuIGJlIHVzZWQgdG8gYnlwYXNzIGluc3RhbGxhdGlvbiBjb25maXJtYXRpb24uIGAgK1xuICAgICAgICAgICAgICBgRW5zdXJlIHBhY2thZ2UgbmFtZSBpcyBjb3JyZWN0IHByaW9yIHRvICctLXNraXAtY29uZmlybWF0aW9uJyBvcHRpb24gdXNhZ2UuYCxcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9nZ2VyLmVycm9yKCdDb21tYW5kIGFib3J0ZWQuJyk7XG5cbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHNhdmVQYWNrYWdlID09PSBmYWxzZSkge1xuICAgICAgLy8gVGVtcG9yYXJ5IHBhY2thZ2VzIGFyZSBsb2NhdGVkIGluIGEgZGlmZmVyZW50IGRpcmVjdG9yeVxuICAgICAgLy8gSGVuY2Ugd2UgbmVlZCB0byByZXNvbHZlIHRoZW0gdXNpbmcgdGhlIHRlbXAgcGF0aFxuICAgICAgY29uc3QgeyBzdWNjZXNzLCB0ZW1wTm9kZU1vZHVsZXMgfSA9IGF3YWl0IHBhY2thZ2VNYW5hZ2VyLmluc3RhbGxUZW1wKFxuICAgICAgICBwYWNrYWdlSWRlbnRpZmllci5yYXcsXG4gICAgICAgIHJlZ2lzdHJ5ID8gW2AtLXJlZ2lzdHJ5PVwiJHtyZWdpc3RyeX1cImBdIDogdW5kZWZpbmVkLFxuICAgICAgKTtcbiAgICAgIGNvbnN0IHRlbXBSZXF1aXJlID0gY3JlYXRlUmVxdWlyZSh0ZW1wTm9kZU1vZHVsZXMgKyAnLycpO1xuICAgICAgY29uc3QgcmVzb2x2ZWRDb2xsZWN0aW9uUGF0aCA9IHRlbXBSZXF1aXJlLnJlc29sdmUoam9pbihjb2xsZWN0aW9uTmFtZSwgJ3BhY2thZ2UuanNvbicpKTtcblxuICAgICAgaWYgKCFzdWNjZXNzKSB7XG4gICAgICAgIHJldHVybiAxO1xuICAgICAgfVxuXG4gICAgICBjb2xsZWN0aW9uTmFtZSA9IGRpcm5hbWUocmVzb2x2ZWRDb2xsZWN0aW9uUGF0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHN1Y2Nlc3MgPSBhd2FpdCBwYWNrYWdlTWFuYWdlci5pbnN0YWxsKFxuICAgICAgICBwYWNrYWdlSWRlbnRpZmllci5yYXcsXG4gICAgICAgIHNhdmVQYWNrYWdlLFxuICAgICAgICByZWdpc3RyeSA/IFtgLS1yZWdpc3RyeT1cIiR7cmVnaXN0cnl9XCJgXSA6IHVuZGVmaW5lZCxcbiAgICAgICk7XG5cbiAgICAgIGlmICghc3VjY2Vzcykge1xuICAgICAgICByZXR1cm4gMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5leGVjdXRlU2NoZW1hdGljKHsgLi4ub3B0aW9ucywgY29sbGVjdGlvbjogY29sbGVjdGlvbk5hbWUgfSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGlzUHJvamVjdFZlcnNpb25WYWxpZChwYWNrYWdlSWRlbnRpZmllcjogbnBhLlJlc3VsdCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGlmICghcGFja2FnZUlkZW50aWZpZXIubmFtZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IGluc3RhbGxlZFZlcnNpb24gPSBhd2FpdCB0aGlzLmZpbmRQcm9qZWN0VmVyc2lvbihwYWNrYWdlSWRlbnRpZmllci5uYW1lKTtcbiAgICBpZiAoIWluc3RhbGxlZFZlcnNpb24pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAocGFja2FnZUlkZW50aWZpZXIucmF3U3BlYyA9PT0gJyonKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICBwYWNrYWdlSWRlbnRpZmllci50eXBlID09PSAncmFuZ2UnICYmXG4gICAgICBwYWNrYWdlSWRlbnRpZmllci5mZXRjaFNwZWMgJiZcbiAgICAgIHBhY2thZ2VJZGVudGlmaWVyLmZldGNoU3BlYyAhPT0gJyonXG4gICAgKSB7XG4gICAgICByZXR1cm4gc2F0aXNmaWVzKGluc3RhbGxlZFZlcnNpb24sIHBhY2thZ2VJZGVudGlmaWVyLmZldGNoU3BlYyk7XG4gICAgfVxuXG4gICAgaWYgKHBhY2thZ2VJZGVudGlmaWVyLnR5cGUgPT09ICd2ZXJzaW9uJykge1xuICAgICAgY29uc3QgdjEgPSB2YWxpZChwYWNrYWdlSWRlbnRpZmllci5mZXRjaFNwZWMpO1xuICAgICAgY29uc3QgdjIgPSB2YWxpZChpbnN0YWxsZWRWZXJzaW9uKTtcblxuICAgICAgcmV0dXJuIHYxICE9PSBudWxsICYmIHYxID09PSB2MjtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGdldENvbGxlY3Rpb25OYW1lKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgWywgY29sbGVjdGlvbk5hbWVdID0gdGhpcy5jb250ZXh0LmFyZ3MucG9zaXRpb25hbDtcblxuICAgIHJldHVybiBjb2xsZWN0aW9uTmFtZTtcbiAgfVxuXG4gIHByaXZhdGUgaXNQYWNrYWdlSW5zdGFsbGVkKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHRyeSB7XG4gICAgICB0aGlzLnJvb3RSZXF1aXJlLnJlc29sdmUoam9pbihuYW1lLCAncGFja2FnZS5qc29uJykpO1xuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBhc3NlcnRJc0Vycm9yKGUpO1xuICAgICAgaWYgKGUuY29kZSAhPT0gJ01PRFVMRV9OT1RfRk9VTkQnKSB7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBleGVjdXRlU2NoZW1hdGljKFxuICAgIG9wdGlvbnM6IE9wdGlvbnM8QWRkQ29tbWFuZEFyZ3M+ICYgT3RoZXJPcHRpb25zLFxuICApOiBQcm9taXNlPG51bWJlciB8IHZvaWQ+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qge1xuICAgICAgICB2ZXJib3NlLFxuICAgICAgICBza2lwQ29uZmlybWF0aW9uLFxuICAgICAgICBpbnRlcmFjdGl2ZSxcbiAgICAgICAgZm9yY2UsXG4gICAgICAgIGRyeVJ1bixcbiAgICAgICAgcmVnaXN0cnksXG4gICAgICAgIGRlZmF1bHRzLFxuICAgICAgICBjb2xsZWN0aW9uOiBjb2xsZWN0aW9uTmFtZSxcbiAgICAgICAgLi4uc2NoZW1hdGljT3B0aW9uc1xuICAgICAgfSA9IG9wdGlvbnM7XG5cbiAgICAgIHJldHVybiBhd2FpdCB0aGlzLnJ1blNjaGVtYXRpYyh7XG4gICAgICAgIHNjaGVtYXRpY09wdGlvbnMsXG4gICAgICAgIHNjaGVtYXRpY05hbWU6IHRoaXMuc2NoZW1hdGljTmFtZSxcbiAgICAgICAgY29sbGVjdGlvbk5hbWUsXG4gICAgICAgIGV4ZWN1dGlvbk9wdGlvbnM6IHtcbiAgICAgICAgICBpbnRlcmFjdGl2ZSxcbiAgICAgICAgICBmb3JjZSxcbiAgICAgICAgICBkcnlSdW4sXG4gICAgICAgICAgZGVmYXVsdHMsXG4gICAgICAgICAgcGFja2FnZVJlZ2lzdHJ5OiByZWdpc3RyeSxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlIGluc3RhbmNlb2YgTm9kZVBhY2thZ2VEb2VzTm90U3VwcG9ydFNjaGVtYXRpY3MpIHtcbiAgICAgICAgdGhpcy5jb250ZXh0LmxvZ2dlci5lcnJvcih0YWdzLm9uZUxpbmVgXG4gICAgICAgICAgVGhlIHBhY2thZ2UgdGhhdCB5b3UgYXJlIHRyeWluZyB0byBhZGQgZG9lcyBub3Qgc3VwcG9ydCBzY2hlbWF0aWNzLiBZb3UgY2FuIHRyeSB1c2luZ1xuICAgICAgICAgIGEgZGlmZmVyZW50IHZlcnNpb24gb2YgdGhlIHBhY2thZ2Ugb3IgY29udGFjdCB0aGUgcGFja2FnZSBhdXRob3IgdG8gYWRkIG5nLWFkZCBzdXBwb3J0LlxuICAgICAgICBgKTtcblxuICAgICAgICByZXR1cm4gMTtcbiAgICAgIH1cblxuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGZpbmRQcm9qZWN0VmVyc2lvbihuYW1lOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgICBjb25zdCB7IGxvZ2dlciwgcm9vdCB9ID0gdGhpcy5jb250ZXh0O1xuICAgIGxldCBpbnN0YWxsZWRQYWNrYWdlO1xuICAgIHRyeSB7XG4gICAgICBpbnN0YWxsZWRQYWNrYWdlID0gdGhpcy5yb290UmVxdWlyZS5yZXNvbHZlKGpvaW4obmFtZSwgJ3BhY2thZ2UuanNvbicpKTtcbiAgICB9IGNhdGNoIHt9XG5cbiAgICBpZiAoaW5zdGFsbGVkUGFja2FnZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgaW5zdGFsbGVkID0gYXdhaXQgZmV0Y2hQYWNrYWdlTWFuaWZlc3QoZGlybmFtZShpbnN0YWxsZWRQYWNrYWdlKSwgbG9nZ2VyKTtcblxuICAgICAgICByZXR1cm4gaW5zdGFsbGVkLnZlcnNpb247XG4gICAgICB9IGNhdGNoIHt9XG4gICAgfVxuXG4gICAgbGV0IHByb2plY3RNYW5pZmVzdDtcbiAgICB0cnkge1xuICAgICAgcHJvamVjdE1hbmlmZXN0ID0gYXdhaXQgZmV0Y2hQYWNrYWdlTWFuaWZlc3Qocm9vdCwgbG9nZ2VyKTtcbiAgICB9IGNhdGNoIHt9XG5cbiAgICBpZiAocHJvamVjdE1hbmlmZXN0KSB7XG4gICAgICBjb25zdCB2ZXJzaW9uID1cbiAgICAgICAgcHJvamVjdE1hbmlmZXN0LmRlcGVuZGVuY2llcz8uW25hbWVdIHx8IHByb2plY3RNYW5pZmVzdC5kZXZEZXBlbmRlbmNpZXM/LltuYW1lXTtcbiAgICAgIGlmICh2ZXJzaW9uKSB7XG4gICAgICAgIHJldHVybiB2ZXJzaW9uO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBoYXNNaXNtYXRjaGVkUGVlcihtYW5pZmVzdDogUGFja2FnZU1hbmlmZXN0KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgZm9yIChjb25zdCBwZWVyIGluIG1hbmlmZXN0LnBlZXJEZXBlbmRlbmNpZXMpIHtcbiAgICAgIGxldCBwZWVySWRlbnRpZmllcjtcbiAgICAgIHRyeSB7XG4gICAgICAgIHBlZXJJZGVudGlmaWVyID0gbnBhLnJlc29sdmUocGVlciwgbWFuaWZlc3QucGVlckRlcGVuZGVuY2llc1twZWVyXSk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgdGhpcy5jb250ZXh0LmxvZ2dlci53YXJuKGBJbnZhbGlkIHBlZXIgZGVwZW5kZW5jeSAke3BlZXJ9IGZvdW5kIGluIHBhY2thZ2UuYCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAocGVlcklkZW50aWZpZXIudHlwZSA9PT0gJ3ZlcnNpb24nIHx8IHBlZXJJZGVudGlmaWVyLnR5cGUgPT09ICdyYW5nZScpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCB2ZXJzaW9uID0gYXdhaXQgdGhpcy5maW5kUHJvamVjdFZlcnNpb24ocGVlcik7XG4gICAgICAgICAgaWYgKCF2ZXJzaW9uKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBvcHRpb25zID0geyBpbmNsdWRlUHJlcmVsZWFzZTogdHJ1ZSB9O1xuXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgIWludGVyc2VjdHModmVyc2lvbiwgcGVlcklkZW50aWZpZXIucmF3U3BlYywgb3B0aW9ucykgJiZcbiAgICAgICAgICAgICFzYXRpc2ZpZXModmVyc2lvbiwgcGVlcklkZW50aWZpZXIucmF3U3BlYywgb3B0aW9ucylcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgLy8gTm90IGZvdW5kIG9yIGludmFsaWQgc28gaWdub3JlXG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHR5cGUgPT09ICd0YWcnIHwgJ2ZpbGUnIHwgJ2RpcmVjdG9yeScgfCAncmVtb3RlJyB8ICdnaXQnXG4gICAgICAgIC8vIENhbm5vdCBhY2N1cmF0ZWx5IGNvbXBhcmUgdGhlc2UgYXMgdGhlIHRhZy9sb2NhdGlvbiBtYXkgaGF2ZSBjaGFuZ2VkIHNpbmNlIGluc3RhbGxcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cbiJdfQ==