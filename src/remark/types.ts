import type { Root } from 'mdast';
import type { Plugin } from 'unified';

export type RemarkPlugin<PluginParameters extends any[] = any[]> = Plugin<PluginParameters, Root>;
