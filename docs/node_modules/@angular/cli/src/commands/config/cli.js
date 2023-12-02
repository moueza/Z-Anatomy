"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const path_1 = require("path");
const command_module_1 = require("../../command-builder/command-module");
const config_1 = require("../../utilities/config");
const json_file_1 = require("../../utilities/json-file");
class ConfigCommandModule extends command_module_1.CommandModule {
    constructor() {
        super(...arguments);
        this.command = 'config [json-path] [value]';
        this.describe = 'Retrieves or sets Angular configuration values in the angular.json file for the workspace.';
        this.longDescriptionPath = (0, path_1.join)(__dirname, 'long-description.md');
    }
    builder(localYargs) {
        return localYargs
            .positional('json-path', {
            description: `The configuration key to set or query, in JSON path format. ` +
                `For example: "a[3].foo.bar[2]". If no new value is provided, returns the current value of this key.`,
            type: 'string',
        })
            .positional('value', {
            description: 'If provided, a new value for the given configuration key.',
            type: 'string',
        })
            .option('global', {
            description: `Access the global configuration in the caller's home directory.`,
            alias: ['g'],
            type: 'boolean',
            default: false,
        })
            .strict();
    }
    async run(options) {
        const level = options.global ? 'global' : 'local';
        const [config] = await (0, config_1.getWorkspaceRaw)(level);
        if (options.value == undefined) {
            if (!config) {
                this.context.logger.error('No config found.');
                return 1;
            }
            return this.get(config, options);
        }
        else {
            return this.set(options);
        }
    }
    get(jsonFile, options) {
        const { logger } = this.context;
        const value = options.jsonPath
            ? jsonFile.get(parseJsonPath(options.jsonPath))
            : jsonFile.content;
        if (value === undefined) {
            logger.error('Value cannot be found.');
            return 1;
        }
        else if (typeof value === 'string') {
            logger.info(value);
        }
        else {
            logger.info(JSON.stringify(value, null, 2));
        }
        return 0;
    }
    async set(options) {
        var _a, _b;
        if (!((_a = options.jsonPath) === null || _a === void 0 ? void 0 : _a.trim())) {
            throw new command_module_1.CommandModuleError('Invalid Path.');
        }
        const [config, configPath] = await (0, config_1.getWorkspaceRaw)(options.global ? 'global' : 'local');
        const { logger } = this.context;
        if (!config || !configPath) {
            throw new command_module_1.CommandModuleError('Confguration file cannot be found.');
        }
        const normalizeUUIDValue = (v) => (v === '' ? (0, crypto_1.randomUUID)() : `${v}`);
        const value = options.jsonPath === 'cli.analyticsSharing.uuid'
            ? normalizeUUIDValue(options.value)
            : options.value;
        const modified = config.modify(parseJsonPath(options.jsonPath), normalizeValue(value));
        if (!modified) {
            logger.error('Value cannot be found.');
            return 1;
        }
        await (0, config_1.validateWorkspace)((0, json_file_1.parseJson)(config.content), (_b = options.global) !== null && _b !== void 0 ? _b : false);
        config.save();
        return 0;
    }
}
exports.default = ConfigCommandModule;
/**
 * Splits a JSON path string into fragments. Fragments can be used to get the value referenced
 * by the path. For example, a path of "a[3].foo.bar[2]" would give you a fragment array of
 * ["a", 3, "foo", "bar", 2].
 * @param path The JSON string to parse.
 * @returns {(string|number)[]} The fragments for the string.
 * @private
 */
function parseJsonPath(path) {
    const fragments = (path || '').split(/\./g);
    const result = [];
    while (fragments.length > 0) {
        const fragment = fragments.shift();
        if (fragment == undefined) {
            break;
        }
        const match = fragment.match(/([^[]+)((\[.*\])*)/);
        if (!match) {
            throw new command_module_1.CommandModuleError('Invalid JSON path.');
        }
        result.push(match[1]);
        if (match[2]) {
            const indices = match[2]
                .slice(1, -1)
                .split('][')
                .map((x) => (/^\d$/.test(x) ? +x : x.replace(/"|'/g, '')));
            result.push(...indices);
        }
    }
    return result.filter((fragment) => fragment != null);
}
function normalizeValue(value) {
    const valueString = `${value}`.trim();
    switch (valueString) {
        case 'true':
            return true;
        case 'false':
            return false;
        case 'null':
            return null;
        case 'undefined':
            return undefined;
    }
    if (isFinite(+valueString)) {
        return +valueString;
    }
    try {
        // We use `JSON.parse` instead of `parseJson` because the latter will parse UUIDs
        // and convert them into a numberic entities.
        // Example: 73b61974-182c-48e4-b4c6-30ddf08c5c98 -> 73.
        // These values should never contain comments, therefore using `JSON.parse` is safe.
        return JSON.parse(valueString);
    }
    catch (_a) {
        return value;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhci9jbGkvc3JjL2NvbW1hbmRzL2NvbmZpZy9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7QUFHSCxtQ0FBb0M7QUFDcEMsK0JBQTRCO0FBRTVCLHlFQUs4QztBQUM5QyxtREFBNEU7QUFDNUUseURBQWdFO0FBUWhFLE1BQXFCLG1CQUNuQixTQUFRLDhCQUFnQztJQUQxQzs7UUFJRSxZQUFPLEdBQUcsNEJBQTRCLENBQUM7UUFDdkMsYUFBUSxHQUNOLDRGQUE0RixDQUFDO1FBQy9GLHdCQUFtQixHQUFHLElBQUEsV0FBSSxFQUFDLFNBQVMsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0lBNkYvRCxDQUFDO0lBM0ZDLE9BQU8sQ0FBQyxVQUFnQjtRQUN0QixPQUFPLFVBQVU7YUFDZCxVQUFVLENBQUMsV0FBVyxFQUFFO1lBQ3ZCLFdBQVcsRUFDVCw4REFBOEQ7Z0JBQzlELHFHQUFxRztZQUN2RyxJQUFJLEVBQUUsUUFBUTtTQUNmLENBQUM7YUFDRCxVQUFVLENBQUMsT0FBTyxFQUFFO1lBQ25CLFdBQVcsRUFBRSwyREFBMkQ7WUFDeEUsSUFBSSxFQUFFLFFBQVE7U0FDZixDQUFDO2FBQ0QsTUFBTSxDQUFDLFFBQVEsRUFBRTtZQUNoQixXQUFXLEVBQUUsaUVBQWlFO1lBQzlFLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNaLElBQUksRUFBRSxTQUFTO1lBQ2YsT0FBTyxFQUFFLEtBQUs7U0FDZixDQUFDO2FBQ0QsTUFBTSxFQUFFLENBQUM7SUFDZCxDQUFDO0lBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFtQztRQUMzQyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUNsRCxNQUFNLENBQUMs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LEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQztTQUN6QjtLQUNGO0lBRUQsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLENBQUM7QUFDdkQsQ0FBQztBQUVELFNBQVMsY0FBYyxDQUFDLEtBQTRDO0lBQ2xFLE1BQU0sV0FBVyxHQUFHLEdBQUcsS0FBSyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDdEMsUUFBUSxXQUFXLEVBQUU7UUFDbkIsS0FBSyxNQUFNO1lBQ1QsT0FBTyxJQUFJLENBQUM7UUFDZCxLQUFLLE9BQU87WUFDVixPQUFPLEtBQUssQ0FBQztRQUNmLEtBQUssTUFBTTtZQUNULE9BQU8sSUFBSSxDQUFDO1FBQ2QsS0FBSyxXQUFXO1lBQ2QsT0FBTyxTQUFTLENBQUM7S0FDcEI7SUFFRCxJQUFJLFFBQVEsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxFQUFFO1FBQzFCLE9BQU8sQ0FBQyxXQUFXLENBQUM7S0FDckI7SUFFRCxJQUFJO1FBQ0YsaUZBQWlGO1FBQ2pGLDZDQUE2QztRQUM3Qyx1REFBdUQ7UUFDdkQsb0ZBQW9GO1FBQ3BGLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUNoQztJQUFDLFdBQU07UUFDTixPQUFPLEtBQUssQ0FBQztLQUNkO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBKc29uVmFsdWUgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQgeyByYW5kb21VVUlEIH0gZnJvbSAnY3J5cHRvJztcbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IEFyZ3YgfSBmcm9tICd5YXJncyc7XG5pbXBvcnQge1xuICBDb21tYW5kTW9kdWxlLFxuICBDb21tYW5kTW9kdWxlRXJyb3IsXG4gIENvbW1hbmRNb2R1bGVJbXBsZW1lbnRhdGlvbixcbiAgT3B0aW9ucyxcbn0gZnJvbSAnLi4vLi4vY29tbWFuZC1idWlsZGVyL2NvbW1hbmQtbW9kdWxlJztcbmltcG9ydCB7IGdldFdvcmtzcGFjZVJhdywgdmFsaWRhdGVXb3Jrc3BhY2UgfSBmcm9tICcuLi8uLi91dGlsaXRpZXMvY29uZmlnJztcbmltcG9ydCB7IEpTT05GaWxlLCBwYXJzZUpzb24gfSBmcm9tICcuLi8uLi91dGlsaXRpZXMvanNvbi1maWxlJztcblxuaW50ZXJmYWNlIENvbmZpZ0NvbW1hbmRBcmdzIHtcbiAgJ2pzb24tcGF0aCc/OiBzdHJpbmc7XG4gIHZhbHVlPzogc3RyaW5nO1xuICBnbG9iYWw/OiBib29sZWFuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25maWdDb21tYW5kTW9kdWxlXG4gIGV4dGVuZHMgQ29tbWFuZE1vZHVsZTxDb25maWdDb21tYW5kQXJncz5cbiAgaW1wbGVtZW50cyBDb21tYW5kTW9kdWxlSW1wbGVtZW50YXRpb248Q29uZmlnQ29tbWFuZEFyZ3M+XG57XG4gIGNvbW1hbmQgPSAnY29uZmlnIFtqc29uLXBhdGhdIFt2YWx1ZV0nO1xuICBkZXNjcmliZSA9XG4gICAgJ1JldHJpZXZlcyBvciBzZXRzIEFuZ3VsYXIgY29uZmlndXJhdGlvbiB2YWx1ZXMgaW4gdGhlIGFuZ3VsYXIuanNvbiBmaWxlIGZvciB0aGUgd29ya3NwYWNlLic7XG4gIGxvbmdEZXNjcmlwdGlvblBhdGggPSBqb2luKF9fZGlybmFtZSwgJ2xvbmctZGVzY3JpcHRpb24ubWQnKTtcblxuICBidWlsZGVyKGxvY2FsWWFyZ3M6IEFyZ3YpOiBBcmd2PENvbmZpZ0NvbW1hbmRBcmdzPiB7XG4gICAgcmV0dXJuIGxvY2FsWWFyZ3NcbiAgICAgIC5wb3NpdGlvbmFsKCdqc29uLXBhdGgnLCB7XG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgIGBUaGUgY29uZmlndXJhdGlvbiBrZXkgdG8gc2V0IG9yIHF1ZXJ5LCBpbiBKU09OIHBhdGggZm9ybWF0LiBgICtcbiAgICAgICAgICBgRm9yIGV4YW1wbGU6IFwiYVszXS5mb28uYmFyWzJdXCIuIElmIG5vIG5ldyB2YWx1ZSBpcyBwcm92aWRlZCwgcmV0dXJucyB0aGUgY3VycmVudCB2YWx1ZSBvZiB0aGlzIGtleS5gLFxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIH0pXG4gICAgICAucG9zaXRpb25hbCgndmFsdWUnLCB7XG4gICAgICAgIGRlc2NyaXB0aW9uOiAnSWYgcHJvdmlkZWQsIGEgbmV3IHZhbHVlIGZvciB0aGUgZ2l2ZW4gY29uZmlndXJhdGlvbiBrZXkuJyxcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICB9KVxuICAgICAgLm9wdGlvbignZ2xvYmFsJywge1xuICAgICAgICBkZXNjcmlwdGlvbjogYEFjY2VzcyB0aGUgZ2xvYmFsIGNvbmZpZ3VyYXRpb24gaW4gdGhlIGNhbGxlcidzIGhvbWUgZGlyZWN0b3J5LmAsXG4gICAgICAgIGFsaWFzOiBbJ2cnXSxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIH0pXG4gICAgICAuc3RyaWN0KCk7XG4gIH1cblxuICBhc3luYyBydW4ob3B0aW9uczogT3B0aW9uczxDb25maWdDb21tYW5kQXJncz4pOiBQcm9taXNlPG51bWJlciB8IHZvaWQ+IHtcbiAgICBjb25zdCBsZXZlbCA9IG9wdGlvbnMuZ2xvYmFsID8gJ2dsb2JhbCcgOiAnbG9jYWwnO1xuICAgIGNvbnN0IFtjb25maWddID0gYXdhaXQgZ2V0V29ya3NwYWNlUmF3KGxldmVsKTtcblxuICAgIGlmIChvcHRpb25zLnZhbHVlID09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKCFjb25maWcpIHtcbiAgICAgICAgdGhpcy5jb250ZXh0LmxvZ2dlci5lcnJvcignTm8gY29uZmlnIGZvdW5kLicpO1xuXG4gICAgICAgIHJldHVybiAxO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5nZXQoY29uZmlnLCBvcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0KG9wdGlvbnMpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2V0KGpzb25GaWxlOiBKU09ORmlsZSwgb3B0aW9uczogT3B0aW9uczxDb25maWdDb21tYW5kQXJncz4pOiBudW1iZXIge1xuICAgIGNvbnN0IHsgbG9nZ2VyIH0gPSB0aGlzLmNvbnRleHQ7XG5cbiAgICBjb25zdCB2YWx1ZSA9IG9wdGlvbnMuanNvblBhdGhcbiAgICAgID8ganNvbkZpbGUuZ2V0KHBhcnNlSnNvblBhdGgob3B0aW9ucy5qc29uUGF0aCkpXG4gICAgICA6IGpzb25GaWxlLmNvbnRlbnQ7XG5cbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgbG9nZ2VyLmVycm9yKCdWYWx1ZSBjYW5ub3QgYmUgZm91bmQuJyk7XG5cbiAgICAgIHJldHVybiAxO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgbG9nZ2VyLmluZm8odmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2dnZXIuaW5mbyhKU09OLnN0cmluZ2lmeSh2YWx1ZSwgbnVsbCwgMikpO1xuICAgIH1cblxuICAgIHJldHVybiAwO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBzZXQob3B0aW9uczogT3B0aW9uczxDb25maWdDb21tYW5kQXJncz4pOiBQcm9taXNlPG51bWJlciB8IHZvaWQ+IHtcbiAgICBpZiAoIW9wdGlvbnMuanNvblBhdGg/LnRyaW0oKSkge1xuICAgICAgdGhyb3cgbmV3IENvbW1hbmRNb2R1bGVFcnJvcignSW52YWxpZCBQYXRoLicpO1xuICAgIH1cblxuICAgIGNvbnN0IFtjb25maWcsIGNvbmZpZ1BhdGhdID0gYXdhaXQgZ2V0V29ya3NwYWNlUmF3KG9wdGlvbnMuZ2xvYmFsID8gJ2dsb2JhbCcgOiAnbG9jYWwnKTtcbiAgICBjb25zdCB7IGxvZ2dlciB9ID0gdGhpcy5jb250ZXh0O1xuXG4gICAgaWYgKCFjb25maWcgfHwgIWNvbmZpZ1BhdGgpIHtcbiAgICAgIHRocm93IG5ldyBDb21tYW5kTW9kdWxlRXJyb3IoJ0NvbmZndXJhdGlvbiBmaWxlIGNhbm5vdCBiZSBmb3VuZC4nKTtcbiAgICB9XG5cbiAgICBjb25zdCBub3JtYWxpemVVVUlEVmFsdWUgPSAodjogc3RyaW5nIHwgdW5kZWZpbmVkKSA9PiAodiA9PT0gJycgPyByYW5kb21VVUlEKCkgOiBgJHt2fWApO1xuXG4gICAgY29uc3QgdmFsdWUgPVxuICAgICAgb3B0aW9ucy5qc29uUGF0aCA9PT0gJ2NsaS5hbmFseXRpY3NTaGFyaW5nLnV1aWQnXG4gICAgICAgID8gbm9ybWFsaXplVVVJRFZhbHVlKG9wdGlvbnMudmFsdWUpXG4gICAgICAgIDogb3B0aW9ucy52YWx1ZTtcblxuICAgIGNvbnN0IG1vZGlmaWVkID0gY29uZmlnLm1vZGlmeShwYXJzZUpzb25QYXRoKG9wdGlvbnMuanNvblBhdGgpLCBub3JtYWxpemVWYWx1ZSh2YWx1ZSkpO1xuXG4gICAgaWYgKCFtb2RpZmllZCkge1xuICAgICAgbG9nZ2VyLmVycm9yKCdWYWx1ZSBjYW5ub3QgYmUgZm91bmQuJyk7XG5cbiAgICAgIHJldHVybiAxO1xuICAgIH1cblxuICAgIGF3YWl0IHZhbGlkYXRlV29ya3NwYWNlKHBhcnNlSnNvbihjb25maWcuY29udGVudCksIG9wdGlvbnMuZ2xvYmFsID8/IGZhbHNlKTtcblxuICAgIGNvbmZpZy5zYXZlKCk7XG5cbiAgICByZXR1cm4gMDtcbiAgfVxufVxuXG4vKipcbiAqIFNwbGl0cyBhIEpTT04gcGF0aCBzdHJpbmcgaW50byBmcmFnbWVudHMuIEZyYWdtZW50cyBjYW4gYmUgdXNlZCB0byBnZXQgdGhlIHZhbHVlIHJlZmVyZW5jZWRcbiAqIGJ5IHRoZSBwYXRoLiBGb3IgZXhhbXBsZSwgYSBwYXRoIG9mIFwiYVszXS5mb28uYmFyWzJdXCIgd291bGQgZ2l2ZSB5b3UgYSBmcmFnbWVudCBhcnJheSBvZlxuICogW1wiYVwiLCAzLCBcImZvb1wiLCBcImJhclwiLCAyXS5cbiAqIEBwYXJhbSBwYXRoIFRoZSBKU09OIHN0cmluZyB0byBwYXJzZS5cbiAqIEByZXR1cm5zIHsoc3RyaW5nfG51bWJlcilbXX0gVGhlIGZyYWdtZW50cyBmb3IgdGhlIHN0cmluZy5cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIHBhcnNlSnNvblBhdGgocGF0aDogc3RyaW5nKTogKHN0cmluZyB8IG51bWJlcilbXSB7XG4gIGNvbnN0IGZyYWdtZW50cyA9IChwYXRoIHx8ICcnKS5zcGxpdCgvXFwuL2cpO1xuICBjb25zdCByZXN1bHQ6IChzdHJpbmcgfCBudW1iZXIpW10gPSBbXTtcblxuICB3aGlsZSAoZnJhZ21lbnRzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBmcmFnbWVudCA9IGZyYWdtZW50cy5zaGlmdCgpO1xuICAgIGlmIChmcmFnbWVudCA9PSB1bmRlZmluZWQpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGNvbnN0IG1hdGNoID0gZnJhZ21lbnQubWF0Y2goLyhbXltdKykoKFxcWy4qXFxdKSopLyk7XG4gICAgaWYgKCFtYXRjaCkge1xuICAgICAgdGhyb3cgbmV3IENvbW1hbmRNb2R1bGVFcnJvcignSW52YWxpZCBKU09OIHBhdGguJyk7XG4gICAgfVxuXG4gICAgcmVzdWx0LnB1c2gobWF0Y2hbMV0pO1xuICAgIGlmIChtYXRjaFsyXSkge1xuICAgICAgY29uc3QgaW5kaWNlcyA9IG1hdGNoWzJdXG4gICAgICAgIC5zbGljZSgxLCAtMSlcbiAgICAgICAgLnNwbGl0KCddWycpXG4gICAgICAgIC5tYXAoKHgpID0+ICgvXlxcZCQvLnRlc3QoeCkgPyAreCA6IHgucmVwbGFjZSgvXCJ8Jy9nLCAnJykpKTtcbiAgICAgIHJlc3VsdC5wdXNoKC4uLmluZGljZXMpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQuZmlsdGVyKChmcmFnbWVudCkgPT4gZnJhZ21lbnQgIT0gbnVsbCk7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVZhbHVlKHZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQgfCBib29sZWFuIHwgbnVtYmVyKTogSnNvblZhbHVlIHwgdW5kZWZpbmVkIHtcbiAgY29uc3QgdmFsdWVTdHJpbmcgPSBgJHt2YWx1ZX1gLnRyaW0oKTtcbiAgc3dpdGNoICh2YWx1ZVN0cmluZykge1xuICAgIGNhc2UgJ3RydWUnOlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgY2FzZSAnZmFsc2UnOlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGNhc2UgJ251bGwnOlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgY2FzZSAndW5kZWZpbmVkJzpcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBpZiAoaXNGaW5pdGUoK3ZhbHVlU3RyaW5nKSkge1xuICAgIHJldHVybiArdmFsdWVTdHJpbmc7XG4gIH1cblxuICB0cnkge1xuICAgIC8vIFdlIHVzZSBgSlNPTi5wYXJzZWAgaW5zdGVhZCBvZiBgcGFyc2VKc29uYCBiZWNhdXNlIHRoZSBsYXR0ZXIgd2lsbCBwYXJzZSBVVUlEc1xuICAgIC8vIGFuZCBjb252ZXJ0IHRoZW0gaW50byBhIG51bWJlcmljIGVudGl0aWVzLlxuICAgIC8vIEV4YW1wbGU6IDczYjYxOTc0LTE4MmMtNDhlNC1iNGM2LTMwZGRmMDhjNWM5OCAtPiA3My5cbiAgICAvLyBUaGVzZSB2YWx1ZXMgc2hvdWxkIG5ldmVyIGNvbnRhaW4gY29tbWVudHMsIHRoZXJlZm9yZSB1c2luZyBgSlNPTi5wYXJzZWAgaXMgc2FmZS5cbiAgICByZXR1cm4gSlNPTi5wYXJzZSh2YWx1ZVN0cmluZyk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxufVxuIl19