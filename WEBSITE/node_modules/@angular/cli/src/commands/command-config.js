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
exports.RootCommandsAliases = exports.RootCommands = void 0;
exports.RootCommands = {
    'add': {
        factory: () => Promise.resolve().then(() => __importStar(require('./add/cli'))),
    },
    'analytics': {
        factory: () => Promise.resolve().then(() => __importStar(require('./analytics/cli'))),
    },
    'build': {
        factory: () => Promise.resolve().then(() => __importStar(require('./build/cli'))),
        aliases: ['b'],
    },
    'cache': {
        factory: () => Promise.resolve().then(() => __importStar(require('./cache/cli'))),
    },
    'completion': {
        factory: () => Promise.resolve().then(() => __importStar(require('./completion/cli'))),
    },
    'config': {
        factory: () => Promise.resolve().then(() => __importStar(require('./config/cli'))),
    },
    'deploy': {
        factory: () => Promise.resolve().then(() => __importStar(require('./deploy/cli'))),
    },
    'doc': {
        factory: () => Promise.resolve().then(() => __importStar(require('./doc/cli'))),
        aliases: ['d'],
    },
    'e2e': {
        factory: () => Promise.resolve().then(() => __importStar(require('./e2e/cli'))),
        aliases: ['e'],
    },
    'extract-i18n': {
        factory: () => Promise.resolve().then(() => __importStar(require('./extract-i18n/cli'))),
    },
    'generate': {
        factory: () => Promise.resolve().then(() => __importStar(require('./generate/cli'))),
        aliases: ['g'],
    },
    'lint': {
        factory: () => Promise.resolve().then(() => __importStar(require('./lint/cli'))),
    },
    'make-this-awesome': {
        factory: () => Promise.resolve().then(() => __importStar(require('./make-this-awesome/cli'))),
    },
    'new': {
        factory: () => Promise.resolve().then(() => __importStar(require('./new/cli'))),
        aliases: ['n'],
    },
    'run': {
        factory: () => Promise.resolve().then(() => __importStar(require('./run/cli'))),
    },
    'serve': {
        factory: () => Promise.resolve().then(() => __importStar(require('./serve/cli'))),
        aliases: ['s'],
    },
    'test': {
        factory: () => Promise.resolve().then(() => __importStar(require('./test/cli'))),
        aliases: ['t'],
    },
    'update': {
        factory: () => Promise.resolve().then(() => __importStar(require('./update/cli'))),
    },
    'version': {
        factory: () => Promise.resolve().then(() => __importStar(require('./version/cli'))),
        aliases: ['v'],
    },
};
exports.RootCommandsAliases = Object.values(exports.RootCommands).reduce((prev, current) => {
    var _a;
    (_a = current.aliases) === null || _a === void 0 ? void 0 : _a.forEach((alias) => {
        prev[alias] = current;
    });
    return prev;
}, {});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZC1jb25maWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmd1bGFyL2NsaS9zcmMvY29tbWFuZHMvY29tbWFuZC1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE4QlUsUUFBQSxZQUFZLEdBR3JCO0lBQ0YsS0FBSyxFQUFFO1FBQ0wsT0FBTyxFQUFFLEdBQUcsRUFBRSxtREFBUSxXQUFXLEdBQUM7S0FDbkM7SUFDRCxXQUFXLEVBQUU7UUFDWCxPQUFPLEVBQUUsR0FBRyxFQUFFLG1EQUFRLGlCQUFpQixHQUFDO0tBQ3pDO0lBQ0QsT0FBTyxFQUFFO1FBQ1AsT0FBTyxFQUFFLEdBQUcsRUFBRSxtREFBUSxhQUFhLEdBQUM7UUFDcEMsT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDO0tBQ2Y7SUFDRCxPQUFPLEVBQUU7UUFDUCxPQUFPLEVBQUUsR0FBRyxFQUFFLG1EQUFRLGFBQWEsR0FBQztLQUNyQztJQUNELFlBQVksRUFBRTtRQUNaLE9BQU8sRUFBRSxHQUFHLEVBQUUsbURBQVEsa0JBQWtCLEdBQUM7S0FDMUM7SUFDRCxRQUFRLEVBQUU7UUFDUixPQUFPLEVBQUUsR0FBRyxFQUFFLG1EQUFRLGNBQWMsR0FBQztLQUN0QztJQUNELFFBQVEsRUFBRTtRQUNSLE9BQU8sRUFBRSxHQUFHLEVBQUUsbURBQVEsY0FBYyxHQUFDO0tBQ3RDO0lBQ0QsS0FBSyxFQUFFO1FBQ0wsT0FBTyxFQUFFLEdBQUcsRUFBRSxtREFBUSxXQUFXLEdBQUM7UUFDbEMsT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDO0tBQ2Y7SUFDRCxLQUFLLEVBQUU7UUFDTCxPQUFPLEVBQUUsR0FBRyxFQUFFLG1EQUFRLFdBQVcsR0FBQztRQUNsQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUM7S0FDZjtJQUNELGNBQWMsRUFBRTtRQUNkLE9BQU8sRUFBRSxHQUFHLEVBQUUsbURBQVEsb0JBQW9CLEdBQUM7S0FDNUM7SUFDRCxVQUFVLEVBQUU7UUFDVixPQUFPLEVBQUUsR0FBRyxFQUFFLG1EQUFRLGdCQUFnQixHQUFDO1FBQ3ZDLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQztLQUNmO0lBQ0QsTUFBTSxFQUFFO1FBQ04sT0FBTyxFQUFFLEdBQUcsRUFBRSxtREFBUSxZQUFZLEdBQUM7S0FDcEM7SUFDRCxtQkFBbUIsRUFBRTtRQUNuQixPQUFPLEVBQUUsR0FBRyxFQUFFLG1EQUFRLHlCQUF5QixHQUFDO0tBQ2pEO0lBQ0QsS0FBSyxFQUFFO1FBQ0wsT0FBTyxFQUFFLEdBQUcsRUFBRSxtREFBUSxXQUFXLEdBQUM7UUFDbEMsT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDO0tBQ2Y7SUFDRCxLQUFLLEVBQUU7UUFDTCxPQUFPLEVBQUUsR0FBRyxFQUFFLG1EQUFRLFdBQVcsR0FBQztLQUNuQztJQUNELE9BQU8sRUFBRTtRQUNQLE9BQU8sRUFBRSxHQUFHLEVBQUUsbURBQVEsYUFBYSxHQUFDO1FBQ3BDLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQztLQUNmO0lBQ0QsTUFBTSxFQUFFO1FBQ04sT0FBTyxFQUFFLEdBQUcsRUFBRSxtREFBUSxZQUFZLEdBQUM7UUFDbkMsT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDO0tBQ2Y7SUFDRCxRQUFRLEVBQUU7UUFDUixPQUFPLEVBQUUsR0FBRyxFQUFFLG1EQUFRLGNBQWMsR0FBQztLQUN0QztJQUNELFNBQVMsRUFBRTtRQUNULE9BQU8sRUFBRSxHQUFHLEVBQUUsbURBQVEsZUFBZSxHQUFDO1FBQ3RDLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQztLQUNmO0NBQ0YsQ0FBQztBQUVXLFFBQUEsbUJBQW1CLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxvQkFBWSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFOztJQUN0RixNQUFBLE9BQU8sQ0FBQyxPQUFPLDBDQUFFLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1FBQ2pDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUM7SUFDeEIsQ0FBQyxDQUFDLENBQUM7SUFFSCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUMsRUFBRSxFQUFtQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsgQ29tbWFuZE1vZHVsZUNvbnN0cnVjdG9yIH0gZnJvbSAnLi4vY29tbWFuZC1idWlsZGVyL3V0aWxpdGllcy9jb21tYW5kJztcblxuZXhwb3J0IHR5cGUgQ29tbWFuZE5hbWVzID1cbiAgfCAnYWRkJ1xuICB8ICdhbmFseXRpY3MnXG4gIHwgJ2J1aWxkJ1xuICB8ICdjYWNoZSdcbiAgfCAnY29tcGxldGlvbidcbiAgfCAnY29uZmlnJ1xuICB8ICdkZXBsb3knXG4gIHwgJ2RvYydcbiAgfCAnZTJlJ1xuICB8ICdleHRyYWN0LWkxOG4nXG4gIHwgJ2dlbmVyYXRlJ1xuICB8ICdsaW50J1xuICB8ICdtYWtlLXRoaXMtYXdlc29tZSdcbiAgfCAnbmV3J1xuICB8ICdydW4nXG4gIHwgJ3NlcnZlJ1xuICB8ICd0ZXN0J1xuICB8ICd1cGRhdGUnXG4gIHwgJ3ZlcnNpb24nO1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbW1hbmRDb25maWcge1xuICBhbGlhc2VzPzogc3RyaW5nW107XG4gIGZhY3Rvcnk6ICgpID0+IFByb21pc2U8eyBkZWZhdWx0OiBDb21tYW5kTW9kdWxlQ29uc3RydWN0b3IgfT47XG59XG5cbmV4cG9ydCBjb25zdCBSb290Q29tbWFuZHM6IFJlY29yZDxcbiAgLyogQ29tbWFuZCAqLyBDb21tYW5kTmFtZXMgJiBzdHJpbmcsXG4gIC8qIENvbW1hbmQgQ29uZmlnICovIENvbW1hbmRDb25maWdcbj4gPSB7XG4gICdhZGQnOiB7XG4gICAgZmFjdG9yeTogKCkgPT4gaW1wb3J0KCcuL2FkZC9jbGknKSxcbiAgfSxcbiAgJ2FuYWx5dGljcyc6IHtcbiAgICBmYWN0b3J5OiAoKSA9PiBpbXBvcnQoJy4vYW5hbHl0aWNzL2NsaScpLFxuICB9LFxuICAnYnVpbGQnOiB7XG4gICAgZmFjdG9yeTogKCkgPT4gaW1wb3J0KCcuL2J1aWxkL2NsaScpLFxuICAgIGFsaWFzZXM6IFsnYiddLFxuICB9LFxuICAnY2FjaGUnOiB7XG4gICAgZmFjdG9yeTogKCkgPT4gaW1wb3J0KCcuL2NhY2hlL2NsaScpLFxuICB9LFxuICAnY29tcGxldGlvbic6IHtcbiAgICBmYWN0b3J5OiAoKSA9PiBpbXBvcnQoJy4vY29tcGxldGlvbi9jbGknKSxcbiAgfSxcbiAgJ2NvbmZpZyc6IHtcbiAgICBmYWN0b3J5OiAoKSA9PiBpbXBvcnQoJy4vY29uZmlnL2NsaScpLFxuICB9LFxuICAnZGVwbG95Jzoge1xuICAgIGZhY3Rvcnk6ICgpID0+IGltcG9ydCgnLi9kZXBsb3kvY2xpJyksXG4gIH0sXG4gICdkb2MnOiB7XG4gICAgZmFjdG9yeTogKCkgPT4gaW1wb3J0KCcuL2RvYy9jbGknKSxcbiAgICBhbGlhc2VzOiBbJ2QnXSxcbiAgfSxcbiAgJ2UyZSc6IHtcbiAgICBmYWN0b3J5OiAoKSA9PiBpbXBvcnQoJy4vZTJlL2NsaScpLFxuICAgIGFsaWFzZXM6IFsnZSddLFxuICB9LFxuICAnZXh0cmFjdC1pMThuJzoge1xuICAgIGZhY3Rvcnk6ICgpID0+IGltcG9ydCgnLi9leHRyYWN0LWkxOG4vY2xpJyksXG4gIH0sXG4gICdnZW5lcmF0ZSc6IHtcbiAgICBmYWN0b3J5OiAoKSA9PiBpbXBvcnQoJy4vZ2VuZXJhdGUvY2xpJyksXG4gICAgYWxpYXNlczogWydnJ10sXG4gIH0sXG4gICdsaW50Jzoge1xuICAgIGZhY3Rvcnk6ICgpID0+IGltcG9ydCgnLi9saW50L2NsaScpLFxuICB9LFxuICAnbWFrZS10aGlzLWF3ZXNvbWUnOiB7XG4gICAgZmFjdG9yeTogKCkgPT4gaW1wb3J0KCcuL21ha2UtdGhpcy1hd2Vzb21lL2NsaScpLFxuICB9LFxuICAnbmV3Jzoge1xuICAgIGZhY3Rvcnk6ICgpID0+IGltcG9ydCgnLi9uZXcvY2xpJyksXG4gICAgYWxpYXNlczogWyduJ10sXG4gIH0sXG4gICdydW4nOiB7XG4gICAgZmFjdG9yeTogKCkgPT4gaW1wb3J0KCcuL3J1bi9jbGknKSxcbiAgfSxcbiAgJ3NlcnZlJzoge1xuICAgIGZhY3Rvcnk6ICgpID0+IGltcG9ydCgnLi9zZXJ2ZS9jbGknKSxcbiAgICBhbGlhc2VzOiBbJ3MnXSxcbiAgfSxcbiAgJ3Rlc3QnOiB7XG4gICAgZmFjdG9yeTogKCkgPT4gaW1wb3J0KCcuL3Rlc3QvY2xpJyksXG4gICAgYWxpYXNlczogWyd0J10sXG4gIH0sXG4gICd1cGRhdGUnOiB7XG4gICAgZmFjdG9yeTogKCkgPT4gaW1wb3J0KCcuL3VwZGF0ZS9jbGknKSxcbiAgfSxcbiAgJ3ZlcnNpb24nOiB7XG4gICAgZmFjdG9yeTogKCkgPT4gaW1wb3J0KCcuL3ZlcnNpb24vY2xpJyksXG4gICAgYWxpYXNlczogWyd2J10sXG4gIH0sXG59O1xuXG5leHBvcnQgY29uc3QgUm9vdENvbW1hbmRzQWxpYXNlcyA9IE9iamVjdC52YWx1ZXMoUm9vdENvbW1hbmRzKS5yZWR1Y2UoKHByZXYsIGN1cnJlbnQpID0+IHtcbiAgY3VycmVudC5hbGlhc2VzPy5mb3JFYWNoKChhbGlhcykgPT4ge1xuICAgIHByZXZbYWxpYXNdID0gY3VycmVudDtcbiAgfSk7XG5cbiAgcmV0dXJuIHByZXY7XG59LCB7fSBhcyBSZWNvcmQ8c3RyaW5nLCBDb21tYW5kQ29uZmlnPik7XG4iXX0=