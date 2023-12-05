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
exports.runCommand = void 0;
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const command_config_1 = require("../commands/command-config");
const color_1 = require("../utilities/color");
const config_1 = require("../utilities/config");
const error_1 = require("../utilities/error");
const package_manager_1 = require("../utilities/package-manager");
const command_module_1 = require("./command-module");
const command_1 = require("./utilities/command");
const json_help_1 = require("./utilities/json-help");
const normalize_options_middleware_1 = require("./utilities/normalize-options-middleware");
const yargsParser = helpers_1.Parser;
async function runCommand(args, logger) {
    var _a, _b;
    const { $0, _, help = false, jsonHelp = false, getYargsCompletions = false, ...rest } = yargsParser(args, {
        boolean: ['help', 'json-help', 'get-yargs-completions'],
        alias: { 'collection': 'c' },
    });
    // When `getYargsCompletions` is true the scriptName 'ng' at index 0 is not removed.
    const positional = getYargsCompletions ? _.slice(1) : _;
    let workspace;
    let globalConfiguration;
    try {
        [workspace, globalConfiguration] = await Promise.all([
            (0, config_1.getWorkspace)('local'),
            (0, config_1.getWorkspace)('global'),
        ]);
    }
    catch (e) {
        (0, error_1.assertIsError)(e);
        logger.fatal(e.message);
        return 1;
    }
    const root = (_a = workspace === null || workspace === void 0 ? void 0 : workspace.basePath) !== null && _a !== void 0 ? _a : process.cwd();
    const context = {
        globalConfiguration,
        workspace,
        logger,
        currentDirectory: process.cwd(),
        root,
        packageManager: new package_manager_1.PackageManagerUtils({ globalConfiguration, workspace, root }),
        args: {
            positional: positional.map((v) => v.toString()),
            options: {
                help,
                jsonHelp,
                getYargsCompletions,
                ...rest,
            },
        },
    };
    let localYargs = (0, yargs_1.default)(args);
    for (const CommandModule of await getCommandsToRegister(positional[0])) {
        localYargs = (0, command_1.addCommandModuleToYargs)(localYargs, CommandModule, context);
    }
    if (jsonHelp) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const usageInstance = localYargs.getInternalMethods().getUsageInstance();
        usageInstance.help = () => (0, json_help_1.jsonHelpUsage)();
    }
    await localYargs
        .scriptName('ng')
        // https://github.com/yargs/yargs/blob/main/docs/advanced.md#customizing-yargs-parser
        .parserConfiguration({
        'populate--': true,
        'unknown-options-as-args': false,
        'dot-notation': false,
        'boolean-negation': true,
        'strip-aliased': true,
        'strip-dashed': true,
        'camel-case-expansion': false,
    })
        .option('json-help', {
        describe: 'Show help in JSON format.',
        implies: ['help'],
        hidden: true,
        type: 'boolean',
    })
        .help('help', 'Shows a help message for this command in the console.')
        // A complete list of strings can be found: https://github.com/yargs/yargs/blob/main/locales/en.json
        .updateStrings({
        'Commands:': color_1.colors.cyan('Commands:'),
        'Options:': color_1.colors.cyan('Options:'),
        'Positionals:': color_1.colors.cyan('Arguments:'),
        'deprecated': color_1.colors.yellow('deprecated'),
        'deprecated: %s': color_1.colors.yellow('deprecated:') + ' %s',
        'Did you mean %s?': 'Unknown command. Did you mean %s?',
    })
        .epilogue('For more information, see https://angular.io/cli/.\n')
        .demandCommand(1, command_1.demandCommandFailureMessage)
        .recommendCommands()
        .middleware(normalize_options_middleware_1.normalizeOptionsMiddleware)
        .version(false)
        .showHelpOnFail(false)
        .strict()
        .fail((msg, err) => {
        throw msg
            ? // Validation failed example: `Unknown argument:`
                new command_module_1.CommandModuleError(msg)
            : // Unknown exception, re-throw.
                err;
    })
        .wrap(yargs_1.default.terminalWidth())
        .parseAsync();
    return (_b = process.exitCode) !== null && _b !== void 0 ? _b : 0;
}
exports.runCommand = runCommand;
/**
 * Get the commands that need to be registered.
 * @returns One or more command factories that needs to be registered.
 */
async function getCommandsToRegister(commandName) {
    const commands = [];
    if (commandName in command_config_1.RootCommands) {
        commands.push(command_config_1.RootCommands[commandName]);
    }
    else if (commandName in command_config_1.RootCommandsAliases) {
        commands.push(command_config_1.RootCommandsAliases[commandName]);
    }
    else {
        // Unknown command, register every possible command.
        Object.values(command_config_1.RootCommands).forEach((c) => commands.push(c));
    }
    return Promise.all(commands.map((command) => command.factory().then((m) => m.default)));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZC1ydW5uZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmd1bGFyL2NsaS9zcmMvY29tbWFuZC1idWlsZGVyL2NvbW1hbmQtcnVubmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7OztBQUdILGtEQUEwQjtBQUMxQiwyQ0FBdUM7QUFDdkMsK0RBS29DO0FBQ3BDLDhDQUE0QztBQUM1QyxnREFBcUU7QUFDckUsOENBQW1EO0FBQ25ELGtFQUFtRTtBQUNuRSxxREFBc0U7QUFDdEUsaURBSTZCO0FBQzdCLHFEQUFzRDtBQUN0RCwyRkFBc0Y7QUFFdEYsTUFBTSxXQUFXLEdBQUcsZ0JBQTBDLENBQUM7QUFFeEQsS0FBSyxVQUFVLFVBQVUsQ0FBQyxJQUFjLEVBQUUsTUFBc0I7O0lBQ3JFLE1BQU0sRUFDSixFQUFFLEVBQ0YsQ0FBQyxFQUNELElBQUksR0FBRyxLQUFLLEVBQ1osUUFBUSxHQUFHLEtBQUssRUFDaEIsbUJBQW1CLEdBQUcsS0FBSyxFQUMzQixHQUFHLElBQUksRUFDUixHQUFHLFdBQVcsQ0FBQyxJQUFJLEVBQUU7UUFDcEIsT0FBTyxFQUFFLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSx1QkFBdUIsQ0FBQztRQUN2RCxLQUFLLEVBQUUsRUFBRSxZQUFZLEVBQUUsR0FBRyxFQUFFO0tBQzdCLENBQUMsQ0FBQztJQUVILG9GQUFvRjtJQUNwRixNQUFNLFVBQVUsR0FBRyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRXhELElBQUksU0FBdUMsQ0FBQztJQUM1QyxJQUFJLG1CQUFxQyxDQUFDO0lBQzFDLElBQUk7UUFDRixDQUFDLFNBQVMsRUFBRSxtQkFBbUIsQ0FBQyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUNuRCxJ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QUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7IGxvZ2dpbmcgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHsgUGFyc2VyIH0gZnJvbSAneWFyZ3MvaGVscGVycyc7XG5pbXBvcnQge1xuICBDb21tYW5kQ29uZmlnLFxuICBDb21tYW5kTmFtZXMsXG4gIFJvb3RDb21tYW5kcyxcbiAgUm9vdENvbW1hbmRzQWxpYXNlcyxcbn0gZnJvbSAnLi4vY29tbWFuZHMvY29tbWFuZC1jb25maWcnO1xuaW1wb3J0IHsgY29sb3JzIH0gZnJvbSAnLi4vdXRpbGl0aWVzL2NvbG9yJztcbmltcG9ydCB7IEFuZ3VsYXJXb3Jrc3BhY2UsIGdldFdvcmtzcGFjZSB9IGZyb20gJy4uL3V0aWxpdGllcy9jb25maWcnO1xuaW1wb3J0IHsgYXNzZXJ0SXNFcnJvciB9IGZyb20gJy4uL3V0aWxpdGllcy9lcnJvcic7XG5pbXBvcnQgeyBQYWNrYWdlTWFuYWdlclV0aWxzIH0gZnJvbSAnLi4vdXRpbGl0aWVzL3BhY2thZ2UtbWFuYWdlcic7XG5pbXBvcnQgeyBDb21tYW5kQ29udGV4dCwgQ29tbWFuZE1vZHVsZUVycm9yIH0gZnJvbSAnLi9jb21tYW5kLW1vZHVsZSc7XG5pbXBvcnQge1xuICBDb21tYW5kTW9kdWxlQ29uc3RydWN0b3IsXG4gIGFkZENvbW1hbmRNb2R1bGVUb1lhcmdzLFxuICBkZW1hbmRDb21tYW5kRmFpbHVyZU1lc3NhZ2UsXG59IGZyb20gJy4vdXRpbGl0aWVzL2NvbW1hbmQnO1xuaW1wb3J0IHsganNvbkhlbHBVc2FnZSB9IGZyb20gJy4vdXRpbGl0aWVzL2pzb24taGVscCc7XG5pbXBvcnQgeyBub3JtYWxpemVPcHRpb25zTWlkZGxld2FyZSB9IGZyb20gJy4vdXRpbGl0aWVzL25vcm1hbGl6ZS1vcHRpb25zLW1pZGRsZXdhcmUnO1xuXG5jb25zdCB5YXJnc1BhcnNlciA9IFBhcnNlciBhcyB1bmtub3duIGFzIHR5cGVvZiBQYXJzZXIuZGVmYXVsdDtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bkNvbW1hbmQoYXJnczogc3RyaW5nW10sIGxvZ2dlcjogbG9nZ2luZy5Mb2dnZXIpOiBQcm9taXNlPG51bWJlcj4ge1xuICBjb25zdCB7XG4gICAgJDAsXG4gICAgXyxcbiAgICBoZWxwID0gZmFsc2UsXG4gICAganNvbkhlbHAgPSBmYWxzZSxcbiAgICBnZXRZYXJnc0NvbXBsZXRpb25zID0gZmFsc2UsXG4gICAgLi4ucmVzdFxuICB9ID0geWFyZ3NQYXJzZXIoYXJncywge1xuICAgIGJvb2xlYW46IFsnaGVscCcsICdqc29uLWhlbHAnLCAnZ2V0LXlhcmdzLWNvbXBsZXRpb25zJ10sXG4gICAgYWxpYXM6IHsgJ2NvbGxlY3Rpb24nOiAnYycgfSxcbiAgfSk7XG5cbiAgLy8gV2hlbiBgZ2V0WWFyZ3NDb21wbGV0aW9uc2AgaXMgdHJ1ZSB0aGUgc2NyaXB0TmFtZSAnbmcnIGF0IGluZGV4IDAgaXMgbm90IHJlbW92ZWQuXG4gIGNvbnN0IHBvc2l0aW9uYWwgPSBnZXRZYXJnc0NvbXBsZXRpb25zID8gXy5zbGljZSgxKSA6IF87XG5cbiAgbGV0IHdvcmtzcGFjZTogQW5ndWxhcldvcmtzcGFjZSB8IHVuZGVmaW5lZDtcbiAgbGV0IGdsb2JhbENvbmZpZ3VyYXRpb246IEFuZ3VsYXJXb3Jrc3BhY2U7XG4gIHRyeSB7XG4gICAgW3dvcmtzcGFjZSwgZ2xvYmFsQ29uZmlndXJhdGlvbl0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICBnZXRXb3Jrc3BhY2UoJ2xvY2FsJyksXG4gICAgICBnZXRXb3Jrc3BhY2UoJ2dsb2JhbCcpLFxuICAgIF0pO1xuICB9IGNhdGNoIChlKSB7XG4gICAgYXNzZXJ0SXNFcnJvcihlKTtcbiAgICBsb2dnZXIuZmF0YWwoZS5tZXNzYWdlKTtcblxuICAgIHJldHVybiAxO1xuICB9XG5cbiAgY29uc3Qgcm9vdCA9IHdvcmtzcGFjZT8uYmFzZVBhdGggPz8gcHJvY2Vzcy5jd2QoKTtcbiAgY29uc3QgY29udGV4dDogQ29tbWFuZENvbnRleHQgPSB7XG4gICAgZ2xvYmFsQ29uZmlndXJhdGlvbixcbiAgICB3b3Jrc3BhY2UsXG4gICAgbG9nZ2VyLFxuICAgIGN1cnJlbnREaXJlY3Rvcnk6IHByb2Nlc3MuY3dkKCksXG4gICAgcm9vdCxcbiAgICBwYWNrYWdlTWFuYWdlcjogbmV3IFBhY2thZ2VNYW5hZ2VyVXRpbHMoeyBnbG9iYWxDb25maWd1cmF0aW9uLCB3b3Jrc3BhY2UsIHJvb3QgfSksXG4gICAgYXJnczoge1xuICAgICAgcG9zaXRpb25hbDogcG9zaXRpb25hbC5tYXAoKHYpID0+IHYudG9TdHJpbmcoKSksXG4gICAgICBvcHRpb25zOiB7XG4gICAgICAgIGhlbHAsXG4gICAgICAgIGpzb25IZWxwLFxuICAgICAgICBnZXRZYXJnc0NvbXBsZXRpb25zLFxuICAgICAgICAuLi5yZXN0LFxuICAgICAgfSxcbiAgICB9LFxuICB9O1xuXG4gIGxldCBsb2NhbFlhcmdzID0geWFyZ3MoYXJncyk7XG4gIGZvciAoY29uc3QgQ29tbWFuZE1vZHVsZSBvZiBhd2FpdCBnZXRDb21tYW5kc1RvUmVnaXN0ZXIocG9zaXRpb25hbFswXSkpIHtcbiAgICBsb2NhbFlhcmdzID0gYWRkQ29tbWFuZE1vZHVsZVRvWWFyZ3MobG9jYWxZYXJncywgQ29tbWFuZE1vZHVsZSwgY29udGV4dCk7XG4gIH1cblxuICBpZiAoanNvbkhlbHApIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgIGNvbnN0IHVzYWdlSW5zdGFuY2UgPSAobG9jYWxZYXJncyBhcyBhbnkpLmdldEludGVybmFsTWV0aG9kcygpLmdldFVzYWdlSW5zdGFuY2UoKTtcbiAgICB1c2FnZUluc3RhbmNlLmhlbHAgPSAoKSA9PiBqc29uSGVscFVzYWdlKCk7XG4gIH1cblxuICBhd2FpdCBsb2NhbFlhcmdzXG4gICAgLnNjcmlwdE5hbWUoJ25nJylcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20veWFyZ3MveWFyZ3MvYmxvYi9tYWluL2RvY3MvYWR2YW5jZWQubWQjY3VzdG9taXppbmcteWFyZ3MtcGFyc2VyXG4gICAgLnBhcnNlckNvbmZpZ3VyYXRpb24oe1xuICAgICAgJ3BvcHVsYXRlLS0nOiB0cnVlLFxuICAgICAgJ3Vua25vd24tb3B0aW9ucy1hcy1hcmdzJzogZmFsc2UsXG4gICAgICAnZG90LW5vdGF0aW9uJzogZmFsc2UsXG4gICAgICAnYm9vbGVhbi1uZWdhdGlvbic6IHRydWUsXG4gICAgICAnc3RyaXAtYWxpYXNlZCc6IHRydWUsXG4gICAgICAnc3RyaXAtZGFzaGVkJzogdHJ1ZSxcbiAgICAgICdjYW1lbC1jYXNlLWV4cGFuc2lvbic6IGZhbHNlLFxuICAgIH0pXG4gICAgLm9wdGlvbignanNvbi1oZWxwJywge1xuICAgICAgZGVzY3JpYmU6ICdTaG93IGhlbHAgaW4gSlNPTiBmb3JtYXQuJyxcbiAgICAgIGltcGxpZXM6IFsnaGVscCddLFxuICAgICAgaGlkZGVuOiB0cnVlLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIH0pXG4gICAgLmhlbHAoJ2hlbHAnLCAnU2hvd3MgYSBoZWxwIG1lc3NhZ2UgZm9yIHRoaXMgY29tbWFuZCBpbiB0aGUgY29uc29sZS4nKVxuICAgIC8vIEEgY29tcGxldGUgbGlzdCBvZiBzdHJpbmdzIGNhbiBiZSBmb3VuZDogaHR0cHM6Ly9naXRodWIuY29tL3lhcmdzL3lhcmdzL2Jsb2IvbWFpbi9sb2NhbGVzL2VuLmpzb25cbiAgICAudXBkYXRlU3RyaW5ncyh7XG4gICAgICAnQ29tbWFuZHM6JzogY29sb3JzLmN5YW4oJ0NvbW1hbmRzOicpLFxuICAgICAgJ09wdGlvbnM6JzogY29sb3JzLmN5YW4oJ09wdGlvbnM6JyksXG4gICAgICAnUG9zaXRpb25hbHM6JzogY29sb3JzLmN5YW4oJ0FyZ3VtZW50czonKSxcbiAgICAgICdkZXByZWNhdGVkJzogY29sb3JzLnllbGxvdygnZGVwcmVjYXRlZCcpLFxuICAgICAgJ2RlcHJlY2F0ZWQ6ICVzJzogY29sb3JzLnllbGxvdygnZGVwcmVjYXRlZDonKSArICcgJXMnLFxuICAgICAgJ0RpZCB5b3UgbWVhbiAlcz8nOiAnVW5rbm93biBjb21tYW5kLiBEaWQgeW91IG1lYW4gJXM/JyxcbiAgICB9KVxuICAgIC5lcGlsb2d1ZSgnRm9yIG1vcmUgaW5mb3JtYXRpb24sIHNlZSBodHRwczovL2FuZ3VsYXIuaW8vY2xpLy5cXG4nKVxuICAgIC5kZW1hbmRDb21tYW5kKDEsIGRlbWFuZENvbW1hbmRGYWlsdXJlTWVzc2FnZSlcbiAgICAucmVjb21tZW5kQ29tbWFuZHMoKVxuICAgIC5taWRkbGV3YXJlKG5vcm1hbGl6ZU9wdGlvbnNNaWRkbGV3YXJlKVxuICAgIC52ZXJzaW9uKGZhbHNlKVxuICAgIC5zaG93SGVscE9uRmFpbChmYWxzZSlcbiAgICAuc3RyaWN0KClcbiAgICAuZmFpbCgobXNnLCBlcnIpID0+IHtcbiAgICAgIHRocm93IG1zZ1xuICAgICAgICA/IC8vIFZhbGlkYXRpb24gZmFpbGVkIGV4YW1wbGU6IGBVbmtub3duIGFyZ3VtZW50OmBcbiAgICAgICAgICBuZXcgQ29tbWFuZE1vZHVsZUVycm9yKG1zZylcbiAgICAgICAgOiAvLyBVbmtub3duIGV4Y2VwdGlvbiwgcmUtdGhyb3cuXG4gICAgICAgICAgZXJyO1xuICAgIH0pXG4gICAgLndyYXAoeWFyZ3MudGVybWluYWxXaWR0aCgpKVxuICAgIC5wYXJzZUFzeW5jKCk7XG5cbiAgcmV0dXJuIHByb2Nlc3MuZXhpdENvZGUgPz8gMDtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGNvbW1hbmRzIHRoYXQgbmVlZCB0byBiZSByZWdpc3RlcmVkLlxuICogQHJldHVybnMgT25lIG9yIG1vcmUgY29tbWFuZCBmYWN0b3JpZXMgdGhhdCBuZWVkcyB0byBiZSByZWdpc3RlcmVkLlxuICovXG5hc3luYyBmdW5jdGlvbiBnZXRDb21tYW5kc1RvUmVnaXN0ZXIoXG4gIGNvbW1hbmROYW1lOiBzdHJpbmcgfCBudW1iZXIsXG4pOiBQcm9taXNlPENvbW1hbmRNb2R1bGVDb25zdHJ1Y3RvcltdPiB7XG4gIGNvbnN0IGNvbW1hbmRzOiBDb21tYW5kQ29uZmlnW10gPSBbXTtcbiAgaWYgKGNvbW1hbmROYW1lIGluIFJvb3RDb21tYW5kcykge1xuICAgIGNvbW1hbmRzLnB1c2goUm9vdENvbW1hbmRzW2NvbW1hbmROYW1lIGFzIENvbW1hbmROYW1lc10pO1xuICB9IGVsc2UgaWYgKGNvbW1hbmROYW1lIGluIFJvb3RDb21tYW5kc0FsaWFzZXMpIHtcbiAgICBjb21tYW5kcy5wdXNoKFJvb3RDb21tYW5kc0FsaWFzZXNbY29tbWFuZE5hbWVdKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBVbmtub3duIGNvbW1hbmQsIHJlZ2lzdGVyIGV2ZXJ5IHBvc3NpYmxlIGNvbW1hbmQuXG4gICAgT2JqZWN0LnZhbHVlcyhSb290Q29tbWFuZHMpLmZvckVhY2goKGMpID0+IGNvbW1hbmRzLnB1c2goYykpO1xuICB9XG5cbiAgcmV0dXJuIFByb21pc2UuYWxsKGNvbW1hbmRzLm1hcCgoY29tbWFuZCkgPT4gY29tbWFuZC5mYWN0b3J5KCkudGhlbigobSkgPT4gbS5kZWZhdWx0KSkpO1xufVxuIl19