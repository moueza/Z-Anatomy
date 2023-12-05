/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CompilerConfig } from '@angular/compiler';
import { Compiler, InjectionToken, Injector, MissingTranslationStrategy, PACKAGE_ROOT_URL, ViewEncapsulation } from '@angular/core';
export const ERROR_COLLECTOR_TOKEN = new InjectionToken('ErrorCollector');
/**
 * A default provider for {@link PACKAGE_ROOT_URL} that maps to '/'.
 */
export const DEFAULT_PACKAGE_URL_PROVIDER = {
    provide: PACKAGE_ROOT_URL,
    useValue: '/'
};
export const COMPILER_PROVIDERS = [{ provide: Compiler, useFactory: () => new Compiler() }];
/**
 * @publicApi
 *
 * @deprecated
 * Ivy JIT mode doesn't require accessing this symbol.
 * See [JIT API changes due to ViewEngine deprecation](guide/deprecations#jit-api-changes) for
 * additional context.
 */
export class JitCompilerFactory {
    /* @internal */
    constructor(defaultOptions) {
        const compilerOptions = {
            useJit: true,
            defaultEncapsulation: ViewEncapsulation.Emulated,
            missingTranslation: MissingTranslationStrategy.Warning,
        };
        this._defaultOptions = [compilerOptions, ...defaultOptions];
    }
    createCompiler(options = []) {
        const opts = _mergeOptions(this._defaultOptions.concat(options));
        const injector = Injector.create({
            providers: [
                COMPILER_PROVIDERS, {
                    provide: CompilerConfig,
                    useFactory: () => {
                        return new CompilerConfig({
                            // let explicit values from the compiler options overwrite options
                            // from the app providers
                            useJit: opts.useJit,
                            // let explicit values from the compiler options overwrite options
                            // from the app providers
                            defaultEncapsulation: opts.defaultEncapsulation,
                            missingTranslation: opts.missingTranslation,
                            preserveWhitespaces: opts.preserveWhitespaces,
                        });
                    },
                    deps: []
                },
                opts.providers
            ]
        });
        return injector.get(Compiler);
    }
}
function _mergeOptions(optionsArr) {
    return {
        useJit: _lastDefined(optionsArr.map(options => options.useJit)),
        defaultEncapsulation: _lastDefined(optionsArr.map(options => options.defaultEncapsulation)),
        providers: _mergeArrays(optionsArr.map(options => options.providers)),
        missingTranslation: _lastDefined(optionsArr.map(options => options.missingTranslation)),
        preserveWhitespaces: _lastDefined(optionsArr.map(options => options.preserveWhitespaces)),
    };
}
function _lastDefined(args) {
    for (let i = args.length - 1; i >= 0; i--) {
        if (args[i] !== undefined) {
            return args[i];
        }
    }
    return undefined;
}
function _mergeArrays(parts) {
    const result = [];
    parts.forEach((part) => part && result.push(...part));
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXJfZmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3BsYXRmb3JtLWJyb3dzZXItZHluYW1pYy9zcmMvY29tcGlsZXJfZmFjdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUFDLFFBQVEsRUFBb0MsY0FBYyxFQUFFLFFBQVEsRUFBRSwwQkFBMEIsRUFBRSxnQkFBZ0IsRUFBa0IsaUJBQWlCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFcEwsTUFBTSxDQUFDLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxjQUFjLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUUxRTs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLDRCQUE0QixHQUFHO0lBQzFDLE9BQU8sRUFBRSxnQkFBZ0I7SUFDekIsUUFBUSxFQUFFLEdBQUc7Q0FDZCxDQUFDO0FBRUYsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQ1QsQ0FBQyxFQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksUUFBUSxFQUFFLEVBQUMsQ0FBQyxDQUFDO0FBQzlFOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLE9BQU8sa0JBQWtCO0lBRzdCLGVBQWU7SUFDZixZQUFZLGNBQWlDO1FBQzNDLE1BQU0sZUFBZSxHQUFvQjtZQUN2QyxNQUFNLEVBQUUsSUFBSTtZQUNaLG9CQUFvQixFQUFFLGlCQUFpQixDQUFDLFFBQVE7WUFDaEQsa0JBQWtCLEVBQUUsMEJBQTBCLENBQUMsT0FBTztTQUN2RCxDQUFDO1FBRUYsSUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLGVBQWUsRUFBRSxHQUFHLGNBQWMsQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFDRCxjQUFjLENBQUMsVUFBNkIsRUFBRTtRQUM1QyxNQUFNLElBQUksR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNqRSxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQy9CLFNBQVMsRUFBRTtnQkFDVCxrQkFBa0IsRUFBRTtvQkFDbEIsT0FBTyxFQUFFLGNBQWM7b0JBQ3ZCLFVBQVUsRUFBRSxHQUFHLEVBQUU7d0JBQ2YsT0FBTyxJQUFJLGNBQWMsQ0FBQzs0QkFDeEIsa0VBQWtFOzRCQUNsRSx5QkFBeUI7NEJBQ3pCLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTs0QkFDbkIsa0VBQWtFOzRCQUNsRSx5QkFBeUI7NEJBQ3pCLG9CQUFvQixFQUFFLElBQUksQ0FBQyxvQkFBb0I7NEJBQy9DLGtCQUFrQixFQUFFLElBQUksQ0FBQyxrQkFBa0I7NEJBQzNDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxtQkFBbUI7eUJBQzlDLENBQUMsQ0FBQztvQkFDTCxDQUFDO29CQUNELElBQUksRUFBRSxFQUFFO2lCQUNUO2dCQUNELElBQUksQ0FBQyxTQUFVO2FBQ2hCO1NBQ0YsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7Q0FDRjtBQUVELFNBQVMsYUFBYSxDQUFDLFVBQTZCO0lBQ2xELE9BQU87UUFDTCxNQUFNLEVBQUUsWUFBWSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0Qsb0JBQW9CLEVBQUUsWUFBWSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUMzRixTQUFTLEVBQUUsWUFBWSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsU0FBVSxDQUFDLENBQUM7UUFDdEUsa0JBQWtCLEVBQUUsWUFBWSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUN2RixtQkFBbUIsRUFBRSxZQUFZLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0tBQzFGLENBQUM7QUFDSixDQUFDO0FBRUQsU0FBUyxZQUFZLENBQUksSUFBUztJQUNoQyxLQUFLLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDekMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxFQUFFO1lBQ3pCLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2hCO0tBQ0Y7SUFDRCxPQUFPLFNBQVMsQ0FBQztBQUNuQixDQUFDO0FBRUQsU0FBUyxZQUFZLENBQUMsS0FBYztJQUNsQyxNQUFNLE1BQU0sR0FBVSxFQUFFLENBQUM7SUFDekIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3RELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb21waWxlckNvbmZpZ30gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0IHtDb21waWxlciwgQ29tcGlsZXJGYWN0b3J5LCBDb21waWxlck9wdGlvbnMsIEluamVjdGlvblRva2VuLCBJbmplY3RvciwgTWlzc2luZ1RyYW5zbGF0aW9uU3RyYXRlZ3ksIFBBQ0tBR0VfUk9PVF9VUkwsIFN0YXRpY1Byb3ZpZGVyLCBWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmV4cG9ydCBjb25zdCBFUlJPUl9DT0xMRUNUT1JfVE9LRU4gPSBuZXcgSW5qZWN0aW9uVG9rZW4oJ0Vycm9yQ29sbGVjdG9yJyk7XG5cbi8qKlxuICogQSBkZWZhdWx0IHByb3ZpZGVyIGZvciB7QGxpbmsgUEFDS0FHRV9ST09UX1VSTH0gdGhhdCBtYXBzIHRvICcvJy5cbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfUEFDS0FHRV9VUkxfUFJPVklERVIgPSB7XG4gIHByb3ZpZGU6IFBBQ0tBR0VfUk9PVF9VUkwsXG4gIHVzZVZhbHVlOiAnLydcbn07XG5cbmV4cG9ydCBjb25zdCBDT01QSUxFUl9QUk9WSURFUlMgPVxuICAgIDxTdGF0aWNQcm92aWRlcltdPlt7cHJvdmlkZTogQ29tcGlsZXIsIHVzZUZhY3Rvcnk6ICgpID0+IG5ldyBDb21waWxlcigpfV07XG4vKipcbiAqIEBwdWJsaWNBcGlcbiAqXG4gKiBAZGVwcmVjYXRlZFxuICogSXZ5IEpJVCBtb2RlIGRvZXNuJ3QgcmVxdWlyZSBhY2Nlc3NpbmcgdGhpcyBzeW1ib2wuXG4gKiBTZWUgW0pJVCBBUEkgY2hhbmdlcyBkdWUgdG8gVmlld0VuZ2luZSBkZXByZWNhdGlvbl0oZ3VpZGUvZGVwcmVjYXRpb25zI2ppdC1hcGktY2hhbmdlcykgZm9yXG4gKiBhZGRpdGlvbmFsIGNvbnRleHQuXG4gKi9cbmV4cG9ydCBjbGFzcyBKaXRDb21waWxlckZhY3RvcnkgaW1wbGVtZW50cyBDb21waWxlckZhY3Rvcnkge1xuICBwcml2YXRlIF9kZWZhdWx0T3B0aW9uczogQ29tcGlsZXJPcHRpb25zW107XG5cbiAgLyogQGludGVybmFsICovXG4gIGNvbnN0cnVjdG9yKGRlZmF1bHRPcHRpb25zOiBDb21waWxlck9wdGlvbnNbXSkge1xuICAgIGNvbnN0IGNvbXBpbGVyT3B0aW9uczogQ29tcGlsZXJPcHRpb25zID0ge1xuICAgICAgdXNlSml0OiB0cnVlLFxuICAgICAgZGVmYXVsdEVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLkVtdWxhdGVkLFxuICAgICAgbWlzc2luZ1RyYW5zbGF0aW9uOiBNaXNzaW5nVHJhbnNsYXRpb25TdHJhdGVneS5XYXJuaW5nLFxuICAgIH07XG5cbiAgICB0aGlzLl9kZWZhdWx0T3B0aW9ucyA9IFtjb21waWxlck9wdGlvbnMsIC4uLmRlZmF1bHRPcHRpb25zXTtcbiAgfVxuICBjcmVhdGVDb21waWxlcihvcHRpb25zOiBDb21waWxlck9wdGlvbnNbXSA9IFtdKTogQ29tcGlsZXIge1xuICAgIGNvbnN0IG9wdHMgPSBfbWVyZ2VPcHRpb25zKHRoaXMuX2RlZmF1bHRPcHRpb25zLmNvbmNhdChvcHRpb25zKSk7XG4gICAgY29uc3QgaW5qZWN0b3IgPSBJbmplY3Rvci5jcmVhdGUoe1xuICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIENPTVBJTEVSX1BST1ZJREVSUywge1xuICAgICAgICAgIHByb3ZpZGU6IENvbXBpbGVyQ29uZmlnLFxuICAgICAgICAgIHVzZUZhY3Rvcnk6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ29tcGlsZXJDb25maWcoe1xuICAgICAgICAgICAgICAvLyBsZXQgZXhwbGljaXQgdmFsdWVzIGZyb20gdGhlIGNvbXBpbGVyIG9wdGlvbnMgb3ZlcndyaXRlIG9wdGlvbnNcbiAgICAgICAgICAgICAgLy8gZnJvbSB0aGUgYXBwIHByb3ZpZGVyc1xuICAgICAgICAgICAgICB1c2VKaXQ6IG9wdHMudXNlSml0LFxuICAgICAgICAgICAgICAvLyBsZXQgZXhwbGljaXQgdmFsdWVzIGZyb20gdGhlIGNvbXBpbGVyIG9wdGlvbnMgb3ZlcndyaXRlIG9wdGlvbnNcbiAgICAgICAgICAgICAgLy8gZnJvbSB0aGUgYXBwIHByb3ZpZGVyc1xuICAgICAgICAgICAgICBkZWZhdWx0RW5jYXBzdWxhdGlvbjogb3B0cy5kZWZhdWx0RW5jYXBzdWxhdGlvbixcbiAgICAgICAgICAgICAgbWlzc2luZ1RyYW5zbGF0aW9uOiBvcHRzLm1pc3NpbmdUcmFuc2xhdGlvbixcbiAgICAgICAgICAgICAgcHJlc2VydmVXaGl0ZXNwYWNlczogb3B0cy5wcmVzZXJ2ZVdoaXRlc3BhY2VzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBkZXBzOiBbXVxuICAgICAgICB9LFxuICAgICAgICBvcHRzLnByb3ZpZGVycyFcbiAgICAgIF1cbiAgICB9KTtcbiAgICByZXR1cm4gaW5qZWN0b3IuZ2V0KENvbXBpbGVyKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfbWVyZ2VPcHRpb25zKG9wdGlvbnNBcnI6IENvbXBpbGVyT3B0aW9uc1tdKTogQ29tcGlsZXJPcHRpb25zIHtcbiAgcmV0dXJuIHtcbiAgICB1c2VKaXQ6IF9sYXN0RGVmaW5lZChvcHRpb25zQXJyLm1hcChvcHRpb25zID0+IG9wdGlvbnMudXNlSml0KSksXG4gICAgZGVmYXVsdEVuY2Fwc3VsYXRpb246IF9sYXN0RGVmaW5lZChvcHRpb25zQXJyLm1hcChvcHRpb25zID0+IG9wdGlvbnMuZGVmYXVsdEVuY2Fwc3VsYXRpb24pKSxcbiAgICBwcm92aWRlcnM6IF9tZXJnZUFycmF5cyhvcHRpb25zQXJyLm1hcChvcHRpb25zID0+IG9wdGlvbnMucHJvdmlkZXJzISkpLFxuICAgIG1pc3NpbmdUcmFuc2xhdGlvbjogX2xhc3REZWZpbmVkKG9wdGlvbnNBcnIubWFwKG9wdGlvbnMgPT4gb3B0aW9ucy5taXNzaW5nVHJhbnNsYXRpb24pKSxcbiAgICBwcmVzZXJ2ZVdoaXRlc3BhY2VzOiBfbGFzdERlZmluZWQob3B0aW9uc0Fyci5tYXAob3B0aW9ucyA9PiBvcHRpb25zLnByZXNlcnZlV2hpdGVzcGFjZXMpKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gX2xhc3REZWZpbmVkPFQ+KGFyZ3M6IFRbXSk6IFR8dW5kZWZpbmVkIHtcbiAgZm9yIChsZXQgaSA9IGFyZ3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBpZiAoYXJnc1tpXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gYXJnc1tpXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gX21lcmdlQXJyYXlzKHBhcnRzOiBhbnlbXVtdKTogYW55W10ge1xuICBjb25zdCByZXN1bHQ6IGFueVtdID0gW107XG4gIHBhcnRzLmZvckVhY2goKHBhcnQpID0+IHBhcnQgJiYgcmVzdWx0LnB1c2goLi4ucGFydCkpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuIl19