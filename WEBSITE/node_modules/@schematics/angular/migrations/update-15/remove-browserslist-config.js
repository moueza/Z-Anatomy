"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_BROWSERS = void 0;
const core_1 = require("@angular-devkit/core");
const validBrowserslistConfigFilenames = new Set(['browserslist', '.browserslistrc']);
exports.DEFAULT_BROWSERS = [
    'last 1 Chrome version',
    'last 1 Firefox version',
    'last 2 Edge major versions',
    'last 2 Safari major versions',
    'last 2 iOS major versions',
    'Firefox ESR',
];
function* visit(directory) {
    for (const path of directory.subfiles) {
        if (validBrowserslistConfigFilenames.has(path)) {
            yield (0, core_1.join)(directory.path, path);
        }
    }
    for (const path of directory.subdirs) {
        if (path === 'node_modules' || path.charAt(0) === '.') {
            continue;
        }
        yield* visit(directory.dir(path));
    }
}
function default_1() {
    return async (tree, { logger }) => {
        let browserslist;
        try {
            browserslist = (await Promise.resolve().then(() => __importStar(require('browserslist')))).default;
        }
        catch (_a) {
            logger.warn('Skipping migration because the "browserslist" package could not be loaded.');
            return;
        }
        // Set the defaults to match the defaults in build-angular.
        browserslist.defaults = exports.DEFAULT_BROWSERS;
        const defaultSupportedBrowsers = new Set(browserslist(exports.DEFAULT_BROWSERS));
        const es5Browsers = new Set(browserslist(['supports es6-module']));
        for (const path of visit(tree.root)) {
            const { defaults: browsersListConfig, ...otherConfigs } = browserslist.parseConfig(tree.readText(path));
            if (Object.keys(otherConfigs).length) {
                // The config contains additional sections.
                continue;
            }
            const browserslistInProject = browserslist(
            // Exclude from the list ES5 browsers which are not supported.
            browsersListConfig.map((s) => `${s} and supports es6-module`), {
                ignoreUnknownVersions: true,
            });
            if (defaultSupportedBrowsers.size !== browserslistInProject.length) {
                continue;
            }
            const shouldDelete = browserslistInProject.every((browser) => defaultSupportedBrowsers.has(browser));
            if (shouldDelete) {
                // All browsers are the same as the default config.
                // Delete file as it's redundant.
                tree.delete(path);
            }
        }
    };
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlLWJyb3dzZXJzbGlzdC1jb25maWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWF0aWNzL2FuZ3VsYXIvbWlncmF0aW9ucy91cGRhdGUtMTUvcmVtb3ZlLWJyb3dzZXJzbGlzdC1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFSCwrQ0FBa0Q7QUFHbEQsTUFBTSxnQ0FBZ0MsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLGNBQWMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7QUFFekUsUUFBQSxnQkFBZ0IsR0FBRztJQUM5Qix1QkFBdUI7SUFDdkIsd0JBQXdCO0lBQ3hCLDRCQUE0QjtJQUM1Qiw4QkFBOEI7SUFDOUIsMkJBQTJCO0lBQzNCLGFBQWE7Q0FDZCxDQUFDO0FBRUYsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQW1CO0lBQ2pDLEtBQUssTUFBTSxJQUFJLElBQUksU0FBUyxDQUFDLFFBQVEsRUFBRTtRQUNyQyxJQUFJLGdDQUFnQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUM5QyxNQUFNLElBQUEsV0FBSSxFQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDbEM7S0FDRjtJQUVELEtBQUssTUFBTSxJQUFJLElBQUksU0FBUyxDQUFDLE9BQU8sRUFBRTtRQUNwQyxJQUFJLElBQUksS0FBSyxjQUFjLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7WUFDckQsU0FBUztTQUNWO1FBRUQsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztLQUNuQztBQUNILENBQUM7QUFFRDtJQUNFLE9BQU8sS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUU7UUFDaEMsSUFBSSxZQUF1RCxDQUFDO1FBRTVELElBQUk7WUFDRixZQUFZLEdBQUcsQ0FBQyx3REFBYSxjQUFjLEdBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztTQUN2RDtRQUFDLFdBQU07WUFDTixNQUFNLENBQUMsSUFBSSxDQUFDLDRFQUE0RSxDQUFDLENBQUM7WUFFMUYsT0FBTztTQUNSO1FBRUQsMkRBQTJEO1FBQzNELFlBQVksQ0FBQyxRQUFRLEdBQUcsd0JBQWdCLENBQUM7UUFFekMsTUFBTSx3QkFBd0IsR0FBRyxJQUFJLEdBQUcsQ0FBQyxZQUFZLENBQUMsd0JBQWdCLENBQUMsQ0FBQyxDQUFDO1FBQ3pFLE1BQU0sV0FBVyxHQUFHLElBQUksR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRW5FLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNuQyxNQUFNLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixFQUFFLEdBQUcsWUFBWSxFQUFFLEdBQUcsWUFBWSxDQUFDLFdBQVcsQ0FDaEYsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FDcEIsQ0FBQztZQUVGLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLEVBQUU7Z0JBQ3BDLDJDQUEyQztnQkFDM0MsU0FBUzthQUNWO1lBRUQsTUFBTSxxQkFBcUIsR0FBRyxZQUFZO1lBQ3hDLDhEQUE4RDtZQUM5RCxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxFQUM3RDtnQkFDRSxxQkFBcUIsRUFBRSxJQUFJO2FBQzVCLENBQ0YsQ0FBQztZQUVGLElBQUksd0JBQXdCLENBQUMsSUFBSSxLQUFLLHFCQUFxQixDQUFDLE1BQU0sRUFBRTtnQkFDbEUsU0FBUzthQUNWO1lBRUQsTUFBTSxZQUFZLEdBQUcscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FDM0Qsd0JBQXdCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUN0QyxDQUFDO1lBRUYsSUFBSSxZQUFZLEVBQUU7Z0JBQ2hCLG1EQUFtRDtnQkFDbkQsaUNBQWlDO2dCQUNqQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ25CO1NBQ0Y7SUFDSCxDQUFDLENBQUM7QUFDSixDQUFDO0FBbkRELDRCQW1EQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBQYXRoLCBqb2luIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IHsgRGlyRW50cnksIFJ1bGUgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5cbmNvbnN0IHZhbGlkQnJvd3NlcnNsaXN0Q29uZmlnRmlsZW5hbWVzID0gbmV3IFNldChbJ2Jyb3dzZXJzbGlzdCcsICcuYnJvd3NlcnNsaXN0cmMnXSk7XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX0JST1dTRVJTID0gW1xuICAnbGFzdCAxIENocm9tZSB2ZXJzaW9uJyxcbiAgJ2xhc3QgMSBGaXJlZm94IHZlcnNpb24nLFxuICAnbGFzdCAyIEVkZ2UgbWFqb3IgdmVyc2lvbnMnLFxuICAnbGFzdCAyIFNhZmFyaSBtYWpvciB2ZXJzaW9ucycsXG4gICdsYXN0IDIgaU9TIG1ham9yIHZlcnNpb25zJyxcbiAgJ0ZpcmVmb3ggRVNSJyxcbl07XG5cbmZ1bmN0aW9uKiB2aXNpdChkaXJlY3Rvcnk6IERpckVudHJ5KTogSXRlcmFibGVJdGVyYXRvcjxQYXRoPiB7XG4gIGZvciAoY29uc3QgcGF0aCBvZiBkaXJlY3Rvcnkuc3ViZmlsZXMpIHtcbiAgICBpZiAodmFsaWRCcm93c2Vyc2xpc3RDb25maWdGaWxlbmFtZXMuaGFzKHBhdGgpKSB7XG4gICAgICB5aWVsZCBqb2luKGRpcmVjdG9yeS5wYXRoLCBwYXRoKTtcbiAgICB9XG4gIH1cblxuICBmb3IgKGNvbnN0IHBhdGggb2YgZGlyZWN0b3J5LnN1YmRpcnMpIHtcbiAgICBpZiAocGF0aCA9PT0gJ25vZGVfbW9kdWxlcycgfHwgcGF0aC5jaGFyQXQoMCkgPT09ICcuJykge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgeWllbGQqIHZpc2l0KGRpcmVjdG9yeS5kaXIocGF0aCkpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uICgpOiBSdWxlIHtcbiAgcmV0dXJuIGFzeW5jICh0cmVlLCB7IGxvZ2dlciB9KSA9PiB7XG4gICAgbGV0IGJyb3dzZXJzbGlzdDogdHlwZW9mIGltcG9ydCgnYnJvd3NlcnNsaXN0JykgfCB1bmRlZmluZWQ7XG5cbiAgICB0cnkge1xuICAgICAgYnJvd3NlcnNsaXN0ID0gKGF3YWl0IGltcG9ydCgnYnJvd3NlcnNsaXN0JykpLmRlZmF1bHQ7XG4gICAgfSBjYXRjaCB7XG4gICAgICBsb2dnZXIud2FybignU2tpcHBpbmcgbWlncmF0aW9uIGJlY2F1c2UgdGhlIFwiYnJvd3NlcnNsaXN0XCIgcGFja2FnZSBjb3VsZCBub3QgYmUgbG9hZGVkLicpO1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gU2V0IHRoZSBkZWZhdWx0cyB0byBtYXRjaCB0aGUgZGVmYXVsdHMgaW4gYnVpbGQtYW5ndWxhci5cbiAgICBicm93c2Vyc2xpc3QuZGVmYXVsdHMgPSBERUZBVUxUX0JST1dTRVJTO1xuXG4gICAgY29uc3QgZGVmYXVsdFN1cHBvcnRlZEJyb3dzZXJzID0gbmV3IFNldChicm93c2Vyc2xpc3QoREVGQVVMVF9CUk9XU0VSUykpO1xuICAgIGNvbnN0IGVzNUJyb3dzZXJzID0gbmV3IFNldChicm93c2Vyc2xpc3QoWydzdXBwb3J0cyBlczYtbW9kdWxlJ10pKTtcblxuICAgIGZvciAoY29uc3QgcGF0aCBvZiB2aXNpdCh0cmVlLnJvb3QpKSB7XG4gICAgICBjb25zdCB7IGRlZmF1bHRzOiBicm93c2Vyc0xpc3RDb25maWcsIC4uLm90aGVyQ29uZmlncyB9ID0gYnJvd3NlcnNsaXN0LnBhcnNlQ29uZmlnKFxuICAgICAgICB0cmVlLnJlYWRUZXh0KHBhdGgpLFxuICAgICAgKTtcblxuICAgICAgaWYgKE9iamVjdC5rZXlzKG90aGVyQ29uZmlncykubGVuZ3RoKSB7XG4gICAgICAgIC8vIFRoZSBjb25maWcgY29udGFpbnMgYWRkaXRpb25hbCBzZWN0aW9ucy5cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGJyb3dzZXJzbGlzdEluUHJvamVjdCA9IGJyb3dzZXJzbGlzdChcbiAgICAgICAgLy8gRXhjbHVkZSBmcm9tIHRoZSBsaXN0IEVTNSBicm93c2VycyB3aGljaCBhcmUgbm90IHN1cHBvcnRlZC5cbiAgICAgICAgYnJvd3NlcnNMaXN0Q29uZmlnLm1hcCgocykgPT4gYCR7c30gYW5kIHN1cHBvcnRzIGVzNi1tb2R1bGVgKSxcbiAgICAgICAge1xuICAgICAgICAgIGlnbm9yZVVua25vd25WZXJzaW9uczogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICk7XG5cbiAgICAgIGlmIChkZWZhdWx0U3VwcG9ydGVkQnJvd3NlcnMuc2l6ZSAhPT0gYnJvd3NlcnNsaXN0SW5Qcm9qZWN0Lmxlbmd0aCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc2hvdWxkRGVsZXRlID0gYnJvd3NlcnNsaXN0SW5Qcm9qZWN0LmV2ZXJ5KChicm93c2VyKSA9PlxuICAgICAgICBkZWZhdWx0U3VwcG9ydGVkQnJvd3NlcnMuaGFzKGJyb3dzZXIpLFxuICAgICAgKTtcblxuICAgICAgaWYgKHNob3VsZERlbGV0ZSkge1xuICAgICAgICAvLyBBbGwgYnJvd3NlcnMgYXJlIHRoZSBzYW1lIGFzIHRoZSBkZWZhdWx0IGNvbmZpZy5cbiAgICAgICAgLy8gRGVsZXRlIGZpbGUgYXMgaXQncyByZWR1bmRhbnQuXG4gICAgICAgIHRyZWUuZGVsZXRlKHBhdGgpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn1cbiJdfQ==