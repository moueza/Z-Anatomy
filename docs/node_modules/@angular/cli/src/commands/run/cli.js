"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const architect_base_command_module_1 = require("../../command-builder/architect-base-command-module");
const command_module_1 = require("../../command-builder/command-module");
class RunCommandModule extends architect_base_command_module_1.ArchitectBaseCommandModule {
    constructor() {
        super(...arguments);
        this.scope = command_module_1.CommandScope.In;
        this.command = 'run <target>';
        this.describe = 'Runs an Architect target with an optional custom builder configuration defined in your project.';
        this.longDescriptionPath = (0, path_1.join)(__dirname, 'long-description.md');
    }
    async builder(argv) {
        const { jsonHelp, getYargsCompletions, help } = this.context.args.options;
        const localYargs = argv
            .positional('target', {
            describe: 'The Architect target to run provided in the the following format `project:target[:configuration]`.',
            type: 'string',
            demandOption: true,
            // Show only in when using --help and auto completion because otherwise comma seperated configuration values will be invalid.
            // Also, hide choices from JSON help so that we don't display them in AIO.
            choices: (getYargsCompletions || help) && !jsonHelp ? this.getTargetChoices() : undefined,
        })
            .middleware((args) => {
            // TODO: remove in version 15.
            const { configuration, target } = args;
            if (typeof configuration === 'string' && target) {
                const targetWithConfig = target.split(':', 2);
                targetWithConfig.push(configuration);
                throw new command_module_1.CommandModuleError('Unknown argument: configuration.\n' +
                    `Provide the configuration as part of the target 'ng run ${targetWithConfig.join(':')}'.`);
            }
        }, true)
            .strict();
        const target = this.makeTargetSpecifier();
        if (!target) {
            return localYargs;
        }
        const schemaOptions = await this.getArchitectTargetOptions(target);
        return this.addSchemaOptionsToCommand(localYargs, schemaOptions);
    }
    async run(options) {
        const target = this.makeTargetSpecifier(options);
        const { target: _target, ...extraOptions } = options;
        if (!target) {
            throw new command_module_1.CommandModuleError('Cannot determine project or target.');
        }
        return this.runSingleTarget(target, extraOptions);
    }
    makeTargetSpecifier(options) {
        var _a;
        const architectTarget = (_a = options === null || options === void 0 ? void 0 : options.target) !== null && _a !== void 0 ? _a : this.context.args.positional[1];
        if (!architectTarget) {
            return undefined;
        }
        const [project = '', target = '', configuration] = architectTarget.split(':');
        return {
            project,
            target,
            configuration,
        };
    }
    /** @returns a sorted list of target specifiers to be used for auto completion. */
    getTargetChoices() {
        if (!this.context.workspace) {
            return;
        }
        const targets = [];
        for (const [projectName, project] of this.context.workspace.projects) {
            for (const [targetName, target] of project.targets) {
                const currentTarget = `${projectName}:${targetName}`;
                targets.push(currentTarget);
                if (!target.configurations) {
                    continue;
                }
                for (const configName of Object.keys(target.configurations)) {
                    targets.push(`${currentTarget}:${configName}`);
                }
            }
        }
        return targets.sort();
    }
}
exports.default = RunCommandModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhci9jbGkvc3JjL2NvbW1hbmRzL3J1bi9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7QUFHSCwrQkFBNEI7QUFFNUIsdUdBQWlHO0FBQ2pHLHlFQU04QztBQU05QyxNQUFxQixnQkFDbkIsU0FBUSwwREFBMEM7SUFEcEQ7O1FBSVcsVUFBSyxHQUFHLDZCQUFZLENBQUMsRUFBRSxDQUFDO1FBRWpDLFlBQU8sR0FBRyxjQUFjLENBQUM7UUFDekIsYUFBUSxHQUNOLGlHQUFpRyxDQUFDO1FBQ3BHLHdCQUFtQixHQUFHLElBQUEsV0FBSSxFQUFDLFNBQVMsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0lBNEYvRCxDQUFDO0lBMUZDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBVTtRQUN0QixNQUFNLEVBQUUsUUFBUSxFQUFFLG1CQUFtQixFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUUxRSxNQUFNLFVBQVUsR0FBeUIsSUFBSTthQUMxQyxVQUFVLENBQUMsUUFBUSxFQUFFO1lBQ3BCLFFBQVEsRUFDTixvR0FBb0c7WUFDdEcsSUFBSSxFQUFFLFFBQVE7WUFDZCxZQUFZLEVBQUUsSUFBSTtZQUNsQiw2SEFBNkg7WUFDN0gsMEVBQTBFO1lBQzFFLE9BQU8sRUFBRSxDQUFDLG1CQUFtQixJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUztTQUMxRixDQUFDO2FBQ0QsVUFBVSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDbkIsOEJBQThCO1lBQzlCLE1BQU0sRUFBRSxhQUFhLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFD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Q0FBQztJQUN4QixDQUFDO0NBQ0Y7QUFyR0QsbUNBcUdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7IFRhcmdldCB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9hcmNoaXRlY3QnO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgQXJndiB9IGZyb20gJ3lhcmdzJztcbmltcG9ydCB7IEFyY2hpdGVjdEJhc2VDb21tYW5kTW9kdWxlIH0gZnJvbSAnLi4vLi4vY29tbWFuZC1idWlsZGVyL2FyY2hpdGVjdC1iYXNlLWNvbW1hbmQtbW9kdWxlJztcbmltcG9ydCB7XG4gIENvbW1hbmRNb2R1bGVFcnJvcixcbiAgQ29tbWFuZE1vZHVsZUltcGxlbWVudGF0aW9uLFxuICBDb21tYW5kU2NvcGUsXG4gIE9wdGlvbnMsXG4gIE90aGVyT3B0aW9ucyxcbn0gZnJvbSAnLi4vLi4vY29tbWFuZC1idWlsZGVyL2NvbW1hbmQtbW9kdWxlJztcblxuZXhwb3J0IGludGVyZmFjZSBSdW5Db21tYW5kQXJncyB7XG4gIHRhcmdldDogc3RyaW5nO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSdW5Db21tYW5kTW9kdWxlXG4gIGV4dGVuZHMgQXJjaGl0ZWN0QmFzZUNvbW1hbmRNb2R1bGU8UnVuQ29tbWFuZEFyZ3M+XG4gIGltcGxlbWVudHMgQ29tbWFuZE1vZHVsZUltcGxlbWVudGF0aW9uPFJ1bkNvbW1hbmRBcmdzPlxue1xuICBvdmVycmlkZSBzY29wZSA9IENvbW1hbmRTY29wZS5JbjtcblxuICBjb21tYW5kID0gJ3J1biA8dGFyZ2V0Pic7XG4gIGRlc2NyaWJlID1cbiAgICAnUnVucyBhbiBBcmNoaXRlY3QgdGFyZ2V0IHdpdGggYW4gb3B0aW9uYWwgY3VzdG9tIGJ1aWxkZXIgY29uZmlndXJhdGlvbiBkZWZpbmVkIGluIHlvdXIgcHJvamVjdC4nO1xuICBsb25nRGVzY3JpcHRpb25QYXRoID0gam9pbihfX2Rpcm5hbWUsICdsb25nLWRlc2NyaXB0aW9uLm1kJyk7XG5cbiAgYXN5bmMgYnVpbGRlcihhcmd2OiBBcmd2KTogUHJvbWlzZTxBcmd2PFJ1bkNvbW1hbmRBcmdzPj4ge1xuICAgIGNvbnN0IHsganNvbkhlbHAsIGdldFlhcmdzQ29tcGxldGlvbnMsIGhlbHAgfSA9IHRoaXMuY29udGV4dC5hcmdzLm9wdGlvbnM7XG5cbiAgICBjb25zdCBsb2NhbFlhcmdzOiBBcmd2PFJ1bkNvbW1hbmRBcmdzPiA9IGFyZ3ZcbiAgICAgIC5wb3NpdGlvbmFsKCd0YXJnZXQnLCB7XG4gICAgICAgIGRlc2NyaWJlOlxuICAgICAgICAgICdUaGUgQXJjaGl0ZWN0IHRhcmdldCB0byBydW4gcHJvdmlkZWQgaW4gdGhlIHRoZSBmb2xsb3dpbmcgZm9ybWF0IGBwcm9qZWN0OnRhcmdldFs6Y29uZmlndXJhdGlvbl1gLicsXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZW1hbmRPcHRpb246IHRydWUsXG4gICAgICAgIC8vIFNob3cgb25seSBpbiB3aGVuIHVzaW5nIC0taGVscCBhbmQgYXV0byBjb21wbGV0aW9uIGJlY2F1c2Ugb3RoZXJ3aXNlIGNvbW1hIHNlcGVyYXRlZCBjb25maWd1cmF0aW9uIHZhbHVlcyB3aWxsIGJlIGludmFsaWQuXG4gICAgICAgIC8vIEFsc28sIGhpZGUgY2hvaWNlcyBmcm9tIEpTT04gaGVscCBzbyB0aGF0IHdlIGRvbid0IGRpc3BsYXkgdGhlbSBpbiBBSU8uXG4gICAgICAgIGNob2ljZXM6IChnZXRZYXJnc0NvbXBsZXRpb25zIHx8IGhlbHApICYmICFqc29uSGVscCA/IHRoaXMuZ2V0VGFyZ2V0Q2hvaWNlcygpIDogdW5kZWZpbmVkLFxuICAgICAgfSlcbiAgICAgIC5taWRkbGV3YXJlKChhcmdzKSA9PiB7XG4gICAgICAgIC8vIFRPRE86IHJlbW92ZSBpbiB2ZXJzaW9uIDE1LlxuICAgICAgICBjb25zdCB7IGNvbmZpZ3VyYXRpb24sIHRhcmdldCB9ID0gYXJncztcbiAgICAgICAgaWYgKHR5cGVvZiBjb25maWd1cmF0aW9uID09PSAnc3RyaW5nJyAmJiB0YXJnZXQpIHtcbiAgICAgICAgICBjb25zdCB0YXJnZXRXaXRoQ29uZmlnID0gdGFyZ2V0LnNwbGl0KCc6JywgMik7XG4gICAgICAgICAgdGFyZ2V0V2l0aENvbmZpZy5wdXNoKGNvbmZpZ3VyYXRpb24pO1xuXG4gICAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRNb2R1bGVFcnJvcihcbiAgICAgICAgICAgICdVbmtub3duIGFyZ3VtZW50OiBjb25maWd1cmF0aW9uLlxcbicgK1xuICAgICAgICAgICAgICBgUHJvdmlkZSB0aGUgY29uZmlndXJhdGlvbiBhcyBwYXJ0IG9mIHRoZSB0YXJnZXQgJ25nIHJ1biAke3RhcmdldFdpdGhDb25maWcuam9pbihcbiAgICAgICAgICAgICAgICAnOicsXG4gICAgICAgICAgICAgICl9Jy5gLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRydWUpXG4gICAgICAuc3RyaWN0KCk7XG5cbiAgICBjb25zdCB0YXJnZXQgPSB0aGlzLm1ha2VUYXJnZXRTcGVjaWZpZXIoKTtcbiAgICBpZiAoIXRhcmdldCkge1xuICAgICAgcmV0dXJuIGxvY2FsWWFyZ3M7XG4gICAgfVxuXG4gICAgY29uc3Qgc2NoZW1hT3B0aW9ucyA9IGF3YWl0IHRoaXMuZ2V0QXJjaGl0ZWN0VGFyZ2V0T3B0aW9ucyh0YXJnZXQpO1xuXG4gICAgcmV0dXJuIHRoaXMuYWRkU2NoZW1hT3B0aW9uc1RvQ29tbWFuZChsb2NhbFlhcmdzLCBzY2hlbWFPcHRpb25zKTtcbiAgfVxuXG4gIGFzeW5jIHJ1bihvcHRpb25zOiBPcHRpb25zPFJ1bkNvbW1hbmRBcmdzPiAmIE90aGVyT3B0aW9ucyk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgY29uc3QgdGFyZ2V0ID0gdGhpcy5tYWtlVGFyZ2V0U3BlY2lmaWVyKG9wdGlvbnMpO1xuICAgIGNvbnN0IHsgdGFyZ2V0OiBfdGFyZ2V0LCAuLi5leHRyYU9wdGlvbnMgfSA9IG9wdGlvbnM7XG5cbiAgICBpZiAoIXRhcmdldCkge1xuICAgICAgdGhyb3cgbmV3IENvbW1hbmRNb2R1bGVFcnJvcignQ2Fubm90IGRldGVybWluZSBwcm9qZWN0IG9yIHRhcmdldC4nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5ydW5TaW5nbGVUYXJnZXQodGFyZ2V0LCBleHRyYU9wdGlvbnMpO1xuICB9XG5cbiAgcHJvdGVjdGVkIG1ha2VUYXJnZXRTcGVjaWZpZXIob3B0aW9ucz86IE9wdGlvbnM8UnVuQ29tbWFuZEFyZ3M+KTogVGFyZ2V0IHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBhcmNoaXRlY3RUYXJnZXQgPSBvcHRpb25zPy50YXJnZXQgPz8gdGhpcy5jb250ZXh0LmFyZ3MucG9zaXRpb25hbFsxXTtcbiAgICBpZiAoIWFyY2hpdGVjdFRhcmdldCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjb25zdCBbcHJvamVjdCA9ICcnLCB0YXJnZXQgPSAnJywgY29uZmlndXJhdGlvbl0gPSBhcmNoaXRlY3RUYXJnZXQuc3BsaXQoJzonKTtcblxuICAgIHJldHVybiB7XG4gICAgICBwcm9qZWN0LFxuICAgICAgdGFyZ2V0LFxuICAgICAgY29uZmlndXJhdGlvbixcbiAgICB9O1xuICB9XG5cbiAgLyoqIEByZXR1cm5zIGEgc29ydGVkIGxpc3Qgb2YgdGFyZ2V0IHNwZWNpZmllcnMgdG8gYmUgdXNlZCBmb3IgYXV0byBjb21wbGV0aW9uLiAqL1xuICBwcml2YXRlIGdldFRhcmdldENob2ljZXMoKTogc3RyaW5nW10gfCB1bmRlZmluZWQge1xuICAgIGlmICghdGhpcy5jb250ZXh0LndvcmtzcGFjZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHRhcmdldHMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IFtwcm9qZWN0TmFtZSwgcHJvamVjdF0gb2YgdGhpcy5jb250ZXh0LndvcmtzcGFjZS5wcm9qZWN0cykge1xuICAgICAgZm9yIChjb25zdCBbdGFyZ2V0TmFtZSwgdGFyZ2V0XSBvZiBwcm9qZWN0LnRhcmdldHMpIHtcbiAgICAgICAgY29uc3QgY3VycmVudFRhcmdldCA9IGAke3Byb2plY3ROYW1lfToke3RhcmdldE5hbWV9YDtcbiAgICAgICAgdGFyZ2V0cy5wdXNoKGN1cnJlbnRUYXJnZXQpO1xuXG4gICAgICAgIGlmICghdGFyZ2V0LmNvbmZpZ3VyYXRpb25zKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IGNvbmZpZ05hbWUgb2YgT2JqZWN0LmtleXModGFyZ2V0LmNvbmZpZ3VyYXRpb25zKSkge1xuICAgICAgICAgIHRhcmdldHMucHVzaChgJHtjdXJyZW50VGFyZ2V0fToke2NvbmZpZ05hbWV9YCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGFyZ2V0cy5zb3J0KCk7XG4gIH1cbn1cbiJdfQ==