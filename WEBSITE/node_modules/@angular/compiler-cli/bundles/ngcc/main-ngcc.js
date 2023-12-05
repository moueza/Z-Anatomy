#!/usr/bin/env node

      import {createRequire as __cjsCompatRequire} from 'module';
      const require = __cjsCompatRequire(import.meta.url);
    
import {
  parseCommandLineOptions
} from "../chunk-YRDMG3GM.js";
import {
  mainNgcc
} from "../chunk-37YYFKDO.js";
import "../chunk-7DUI3BSX.js";
import "../chunk-LRE5KIJ7.js";
import "../chunk-M65TNV27.js";
import "../chunk-2UDHTJ2I.js";
import "../chunk-O4JLZZWJ.js";
import "../chunk-SBDNBITT.js";
import "../chunk-6ZJFIQBG.js";
import "../chunk-QRHWLC7U.js";
import "../chunk-ZCBRXUPO.js";
import "../chunk-EC5K6QPP.js";
import "../chunk-NJMZRTB6.js";
import "../chunk-SRFZMXHZ.js";

// bazel-out/darwin_arm64-fastbuild/bin/packages/compiler-cli/ngcc/main-ngcc.mjs
process.title = "ngcc";
var startTime = Date.now();
var options = parseCommandLineOptions(process.argv.slice(2));
(async () => {
  try {
    await mainNgcc(options);
    if (options.logger) {
      const duration = Math.round((Date.now() - startTime) / 1e3);
      options.logger.debug(`Run ngcc in ${duration}s.`);
    }
    process.exitCode = 0;
  } catch (e) {
    console.error(e.stack || e.message);
    process.exit(typeof e.code === "number" ? e.code : 1);
  }
})();
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
//# sourceMappingURL=main-ngcc.js.map
