import babel from '@babel/core';
import pluginDebugLabel from './plugin-debug-label.js';
import pluginReactRefresh from './plugin-react-refresh.js';
import type { PluginOptions } from './utils.js';

export default function jotaiPreset(
  _: typeof babel,
  options?: PluginOptions,
): { plugins: babel.PluginItem[] } {
  return {
    plugins: [
      [pluginDebugLabel, options],
      [pluginReactRefresh, options],
    ],
  };
}
