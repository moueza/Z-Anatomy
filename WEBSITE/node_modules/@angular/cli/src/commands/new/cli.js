"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = require("node:path");
const command_module_1 = require("../../command-builder/command-module");
const schematics_command_module_1 = require("../../command-builder/schematics-command-module");
const version_1 = require("../../utilities/version");
const command_config_1 = require("../command-config");
class NewCommandModule extends schematics_command_module_1.SchematicsCommandModule {
    constructor() {
        super(...arguments);
        this.schematicName = 'ng-new';
        this.scope = command_module_1.CommandScope.Out;
        this.allowPrivateSchematics = true;
        this.command = 'new [name]';
        this.aliases = command_config_1.RootCommands['new'].aliases;
        this.describe = 'Creates a new Angular workspace.';
        this.longDescriptionPath = (0, node_path_1.join)(__dirname, 'long-description.md');
    }
    async builder(argv) {
        const localYargs = (await super.builder(argv)).option('collection', {
            alias: 'c',
            describe: 'A collection of schematics to use in generating the initial application.',
            type: 'string',
        });
        const { options: { collection: collectionNameFromArgs }, } = this.context.args;
        const collectionName = typeof collectionNameFromArgs === 'string'
            ? collectionNameFromArgs
            : await this.getCollectionFromConfig();
        const workflow = await this.getOrCreateWorkflowForBuilder(collectionName);
        const collection = workflow.engine.createCollection(collectionName);
        const options = await this.getSchematicOptions(collection, this.schematicName, workflow);
        return this.addSchemaOptionsToCommand(localYargs, options);
    }
    async run(options) {
        var _a;
        // Register the version of the CLI in the registry.
        const collectionName = (_a = options.collection) !== null && _a !== void 0 ? _a : (await this.getCollectionFromConfig());
        const { dryRun, force, interactive, defaults, collection, ...schematicOptions } = options;
        const workflow = await this.getOrCreateWorkflowForExecution(collectionName, {
            dryRun,
            force,
            interactive,
            defaults,
        });
        workflow.registry.addSmartDefaultProvider('ng-cli-version', () => version_1.VERSION.full);
        // Compatibility check for NPM 7
        if (collectionName === '@schematics/angular' &&
            !schematicOptions.skipInstall &&
            (schematicOptions.packageManager === undefined || schematicOptions.packageManager === 'npm')) {
            this.context.packageManager.ensureCompatibility();
        }
        return this.runSchematic({
            collectionName,
            schematicName: this.schematicName,
            schematicOptions,
            executionOptions: {
                dryRun,
                force,
                interactive,
                defaults,
            },
        });
    }
    /** Find a collection from config that has an `ng-new` schematic. */
    async getCollectionFromConfig() {
        for (const collectionName of await this.getSchematicCollections()) {
            const workflow = this.getOrCreateWorkflowForBuilder(collectionName);
            const collection = workflow.engine.createCollection(collectionName);
            const schematicsInCollection = collection.description.schematics;
            if (Object.keys(schematicsInCollection).includes(this.schematicName)) {
                return collectionName;
            }
        }
        return schematics_command_module_1.DEFAULT_SCHEMATICS_COLLECTION;
    }
}
exports.default = NewCommandModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhci9jbGkvc3JjL2NvbW1hbmRzL25ldy9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7QUFFSCx5Q0FBaUM7QUFFakMseUVBSzhDO0FBQzlDLCtGQUl5RDtBQUN6RCxxREFBa0Q7QUFDbEQsc0RBQWlEO0FBTWpELE1BQXFCLGdCQUNuQixTQUFRLG1EQUF1QjtJQURqQzs7UUFJbUIsa0JBQWEsR0FBRyxRQUFRLENBQUM7UUFDakMsVUFBSyxHQUFHLDZCQUFZLENBQUMsR0FBRyxDQUFDO1FBQ2YsMkJBQXNCLEdBQUcsSUFBSSxDQUFDO1FBRWpELFlBQU8sR0FBRyxZQUFZLENBQUM7UUFDdkIsWUFBTyxHQUFHLDZCQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQ3RDLGFBQVEsR0FBRyxrQ0FBa0MsQ0FBQztRQUM5Qyx3QkFBbUIsR0FBRyxJQUFBLGdCQUFJLEVBQUMsU0FBUyxFQUFFLHFCQUFxQixDQUFDLENBQUM7SUF5RS9ELENBQUM7SUF2RVUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFVO1FBQy9CLE1BQU0sVUFBVSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRTtZQUNsRSxLQUFLLEVBQUUsR0FBRztZQUNWLFFBQVEsRUFBRSwwRUFBMEU7WUFDcEYsSUFBSSxFQUFFLFFBQVE7U0FDZixDQUFDLENBQUM7UUFFSCxNQUFNLEVBQ0osT0FBTyxFQUFFLEVBQUUsVUFBVSxFQUFFLHNCQUFzQixFQUFFLEdBQ2hELEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7UUFFdEIsTUFBTSxjQUFjLEdBQ2xCLE9BQU8sc0JBQXNCLEtBQUssUUFBUTtZQUN4QyxDQUFDLENBQUMsc0JBQXNCO1lBQ3hCLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1FBRTNDLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLDZCQUE2QixDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzFFLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDcEUsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFekYsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQStDOztRQUN2RCxtREFBbUQ7UUFDbkQsTUFBTSxjQUFjLEdBQUcsTUFBQSxPQUFPLENBQUMsVUFBVSxtQ0FBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUMsQ0FBQztRQUNwRixNQUFNLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxHQUFHLGdCQUFnQixFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQzFGLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLCtCQUErQixDQUFDLGNBQWMsRUFBRTtZQUMxRSxNQUFNO1lBQ04sS0FBSztZQUNMLFdBQVc7WUFDWCxRQUFRO1NBQ1QsQ0FBQyxDQUFDO1FBQ0gsUUFBUSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLEVBQUUsQ0FBQyxpQkFBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWhGLGdDQUFnQztRQUNoQyxJQUNFLGNBQWMsS0FBSyxxQkFBcUI7WUFDeEMsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXO1lBQzdCLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxLQUFLLFNBQVMsSUFBSSxnQkFBZ0IsQ0FBQyxjQUFjLEtBQUssS0FBSyxDQUFDLEVBQzVGO1lBQ0EsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztTQUNuRDtRQUVELE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztZQUN2QixjQUFjO1lBQ2QsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhO1lBQ2pDLGdCQUFnQjtZQUNoQixnQkFBZ0IsRUFBRTtnQkFDaEIsTUFBTTtnQkFDTixLQUFLO2dCQUNMLFdBQVc7Z0JBQ1gsUUFBUTthQUNUO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELG9FQUFvRTtJQUM1RCxLQUFLLENBQUMsdUJBQXVCO1FBQ25DLEtBQUssTUFBTSxjQUFjLElBQUksTUFBTSxJQUFJLENBQUMsdUJBQXVCLEVBQUUsRUFBRTtZQUNqRSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsNkJBQTZCLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDcEUsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNwRSxNQUFNLHNCQUFzQixHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDO1lBRWpFLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUU7Z0JBQ3BFLE9BQU8sY0FBYyxDQUFDO2FBQ3ZCO1NBQ0Y7UUFFRCxPQUFPLHlEQUE2QixDQUFDO0lBQ3ZDLENBQUM7Q0FDRjtBQXBGRCxtQ0FvRkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsgam9pbiB9IGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgeyBBcmd2IH0gZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHtcbiAgQ29tbWFuZE1vZHVsZUltcGxlbWVudGF0aW9uLFxuICBDb21tYW5kU2NvcGUsXG4gIE9wdGlvbnMsXG4gIE90aGVyT3B0aW9ucyxcbn0gZnJvbSAnLi4vLi4vY29tbWFuZC1idWlsZGVyL2NvbW1hbmQtbW9kdWxlJztcbmltcG9ydCB7XG4gIERFRkFVTFRfU0NIRU1BVElDU19DT0xMRUNUSU9OLFxuICBTY2hlbWF0aWNzQ29tbWFuZEFyZ3MsXG4gIFNjaGVtYXRpY3NDb21tYW5kTW9kdWxlLFxufSBmcm9tICcuLi8uLi9jb21tYW5kLWJ1aWxkZXIvc2NoZW1hdGljcy1jb21tYW5kLW1vZHVsZSc7XG5pbXBvcnQgeyBWRVJTSU9OIH0gZnJvbSAnLi4vLi4vdXRpbGl0aWVzL3ZlcnNpb24nO1xuaW1wb3J0IHsgUm9vdENvbW1hbmRzIH0gZnJvbSAnLi4vY29tbWFuZC1jb25maWcnO1xuXG5pbnRlcmZhY2UgTmV3Q29tbWFuZEFyZ3MgZXh0ZW5kcyBTY2hlbWF0aWNzQ29tbWFuZEFyZ3Mge1xuICBjb2xsZWN0aW9uPzogc3RyaW5nO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOZXdDb21tYW5kTW9kdWxlXG4gIGV4dGVuZHMgU2NoZW1hdGljc0NvbW1hbmRNb2R1bGVcbiAgaW1wbGVtZW50cyBDb21tYW5kTW9kdWxlSW1wbGVtZW50YXRpb248TmV3Q29tbWFuZEFyZ3M+XG57XG4gIHByaXZhdGUgcmVhZG9ubHkgc2NoZW1hdGljTmFtZSA9ICduZy1uZXcnO1xuICBvdmVycmlkZSBzY29wZSA9IENvbW1hbmRTY29wZS5PdXQ7XG4gIHByb3RlY3RlZCBvdmVycmlkZSBhbGxvd1ByaXZhdGVTY2hlbWF0aWNzID0gdHJ1ZTtcblxuICBjb21tYW5kID0gJ25ldyBbbmFtZV0nO1xuICBhbGlhc2VzID0gUm9vdENvbW1hbmRzWyduZXcnXS5hbGlhc2VzO1xuICBkZXNjcmliZSA9ICdDcmVhdGVzIGEgbmV3IEFuZ3VsYXIgd29ya3NwYWNlLic7XG4gIGxvbmdEZXNjcmlwdGlvblBhdGggPSBqb2luKF9fZGlybmFtZSwgJ2xvbmctZGVzY3JpcHRpb24ubWQnKTtcblxuICBvdmVycmlkZSBhc3luYyBidWlsZGVyKGFyZ3Y6IEFyZ3YpOiBQcm9taXNlPEFyZ3Y8TmV3Q29tbWFuZEFyZ3M+PiB7XG4gICAgY29uc3QgbG9jYWxZYXJncyA9IChhd2FpdCBzdXBlci5idWlsZGVyKGFyZ3YpKS5vcHRpb24oJ2NvbGxlY3Rpb24nLCB7XG4gICAgICBhbGlhczogJ2MnLFxuICAgICAgZGVzY3JpYmU6ICdBIGNvbGxlY3Rpb24gb2Ygc2NoZW1hdGljcyB0byB1c2UgaW4gZ2VuZXJhdGluZyB0aGUgaW5pdGlhbCBhcHBsaWNhdGlvbi4nLFxuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgfSk7XG5cbiAgICBjb25zdCB7XG4gICAgICBvcHRpb25zOiB7IGNvbGxlY3Rpb246IGNvbGxlY3Rpb25OYW1lRnJvbUFyZ3MgfSxcbiAgICB9ID0gdGhpcy5jb250ZXh0LmFyZ3M7XG5cbiAgICBjb25zdCBjb2xsZWN0aW9uTmFtZSA9XG4gICAgICB0eXBlb2YgY29sbGVjdGlvbk5hbWVGcm9tQXJncyA9PT0gJ3N0cmluZydcbiAgICAgICAgPyBjb2xsZWN0aW9uTmFtZUZyb21BcmdzXG4gICAgICAgIDogYXdhaXQgdGhpcy5nZXRDb2xsZWN0aW9uRnJvbUNvbmZpZygpO1xuXG4gICAgY29uc3Qgd29ya2Zsb3cgPSBhd2FpdCB0aGlzLmdldE9yQ3JlYXRlV29ya2Zsb3dGb3JCdWlsZGVyKGNvbGxlY3Rpb25OYW1lKTtcbiAgICBjb25zdCBjb2xsZWN0aW9uID0gd29ya2Zsb3cuZW5naW5lLmNyZWF0ZUNvbGxlY3Rpb24oY29sbGVjdGlvbk5hbWUpO1xuICAgIGNvbnN0IG9wdGlvbnMgPSBhd2FpdCB0aGlzLmdldFNjaGVtYXRpY09wdGlvbnMoY29sbGVjdGlvbiwgdGhpcy5zY2hlbWF0aWNOYW1lLCB3b3JrZmxvdyk7XG5cbiAgICByZXR1cm4gdGhpcy5hZGRTY2hlbWFPcHRpb25zVG9Db21tYW5kKGxvY2FsWWFyZ3MsIG9wdGlvbnMpO1xuICB9XG5cbiAgYXN5bmMgcnVuKG9wdGlvbnM6IE9wdGlvbnM8TmV3Q29tbWFuZEFyZ3M+ICYgT3RoZXJPcHRpb25zKTogUHJvbWlzZTxudW1iZXIgfCB2b2lkPiB7XG4gICAgLy8gUmVnaXN0ZXIgdGhlIHZlcnNpb24gb2YgdGhlIENMSSBpbiB0aGUgcmVnaXN0cnkuXG4gICAgY29uc3QgY29sbGVjdGlvbk5hbWUgPSBvcHRpb25zLmNvbGxlY3Rpb24gPz8gKGF3YWl0IHRoaXMuZ2V0Q29sbGVjdGlvbkZyb21Db25maWcoKSk7XG4gICAgY29uc3QgeyBkcnlSdW4sIGZvcmNlLCBpbnRlcmFjdGl2ZSwgZGVmYXVsdHMsIGNvbGxlY3Rpb24sIC4uLnNjaGVtYXRpY09wdGlvbnMgfSA9IG9wdGlvbnM7XG4gICAgY29uc3Qgd29ya2Zsb3cgPSBhd2FpdCB0aGlzLmdldE9yQ3JlYXRlV29ya2Zsb3dGb3JFeGVjdXRpb24oY29sbGVjdGlvbk5hbWUsIHtcbiAgICAgIGRyeVJ1bixcbiAgICAgIGZvcmNlLFxuICAgICAgaW50ZXJhY3RpdmUsXG4gICAgICBkZWZhdWx0cyxcbiAgICB9KTtcbiAgICB3b3JrZmxvdy5yZWdpc3RyeS5hZGRTbWFydERlZmF1bHRQcm92aWRlcignbmctY2xpLXZlcnNpb24nLCAoKSA9PiBWRVJTSU9OLmZ1bGwpO1xuXG4gICAgLy8gQ29tcGF0aWJpbGl0eSBjaGVjayBmb3IgTlBNIDdcbiAgICBpZiAoXG4gICAgICBjb2xsZWN0aW9uTmFtZSA9PT0gJ0BzY2hlbWF0aWNzL2FuZ3VsYXInICYmXG4gICAgICAhc2NoZW1hdGljT3B0aW9ucy5za2lwSW5zdGFsbCAmJlxuICAgICAgKHNjaGVtYXRpY09wdGlvbnMucGFja2FnZU1hbmFnZXIgPT09IHVuZGVmaW5lZCB8fCBzY2hlbWF0aWNPcHRpb25zLnBhY2thZ2VNYW5hZ2VyID09PSAnbnBtJylcbiAgICApIHtcbiAgICAgIHRoaXMuY29udGV4dC5wYWNrYWdlTWFuYWdlci5lbnN1cmVDb21wYXRpYmlsaXR5KCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucnVuU2NoZW1hdGljKHtcbiAgICAgIGNvbGxlY3Rpb25OYW1lLFxuICAgICAgc2NoZW1hdGljTmFtZTogdGhpcy5zY2hlbWF0aWNOYW1lLFxuICAgICAgc2NoZW1hdGljT3B0aW9ucyxcbiAgICAgIGV4ZWN1dGlvbk9wdGlvbnM6IHtcbiAgICAgICAgZHJ5UnVuLFxuICAgICAgICBmb3JjZSxcbiAgICAgICAgaW50ZXJhY3RpdmUsXG4gICAgICAgIGRlZmF1bHRzLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBGaW5kIGEgY29sbGVjdGlvbiBmcm9tIGNvbmZpZyB0aGF0IGhhcyBhbiBgbmctbmV3YCBzY2hlbWF0aWMuICovXG4gIHByaXZhdGUgYXN5bmMgZ2V0Q29sbGVjdGlvbkZyb21Db25maWcoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBmb3IgKGNvbnN0IGNvbGxlY3Rpb25OYW1lIG9mIGF3YWl0IHRoaXMuZ2V0U2NoZW1hdGljQ29sbGVjdGlvbnMoKSkge1xuICAgICAgY29uc3Qgd29ya2Zsb3cgPSB0aGlzLmdldE9yQ3JlYXRlV29ya2Zsb3dGb3JCdWlsZGVyKGNvbGxlY3Rpb25OYW1lKTtcbiAgICAgIGNvbnN0IGNvbGxlY3Rpb24gPSB3b3JrZmxvdy5lbmdpbmUuY3JlYXRlQ29sbGVjdGlvbihjb2xsZWN0aW9uTmFtZSk7XG4gICAgICBjb25zdCBzY2hlbWF0aWNzSW5Db2xsZWN0aW9uID0gY29sbGVjdGlvbi5kZXNjcmlwdGlvbi5zY2hlbWF0aWNzO1xuXG4gICAgICBpZiAoT2JqZWN0LmtleXMoc2NoZW1hdGljc0luQ29sbGVjdGlvbikuaW5jbHVkZXModGhpcy5zY2hlbWF0aWNOYW1lKSkge1xuICAgICAgICByZXR1cm4gY29sbGVjdGlvbk5hbWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIERFRkFVTFRfU0NIRU1BVElDU19DT0xMRUNUSU9OO1xuICB9XG59XG4iXX0=