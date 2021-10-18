import Editor, { OnChange } from '@monaco-editor/react';
import Monaco from 'monaco-editor';
import React, { useCallback, useMemo } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { useBlock } from '../../../hooks/useBlock';
import { useEditor } from '../../../hooks/useEditor';
import { CodeBlockType } from './CodeBlock';
import { setupMonaco } from './setupMonaco';

export function MonacoEditor({
	onEditorMount,
}: {
	onEditorMount: (editor?: Monaco.editor.IStandaloneCodeEditor) => void;
}) {
	const { height, ref: blockRef } = useResizeDetector();
	const { id, value, parentId } = useBlock<CodeBlockType>();
	const { updateBlockProps } = useEditor();
	const onEditorChange = useCallback<OnChange>((v) => updateBlockProps({ id, value: v }), [id, updateBlockProps]);

	// const { blocks, globals } = usePageContext();
	// const blocksType = useMemo(
	// 	() =>
	// 		Object.keys(blocks)
	// 			.map((v) => `'${v}'`)
	// 			.join(' | '),
	// 	[blocks],
	// );
	//
	// const globalsType = useMemo(
	// 	() =>
	// 		Object.keys(globals)
	// 			.map((v) => `'${v}'`)
	// 			.join(' | '),
	// 	[globals],
	// );

	return (
		<div style={{ height: parentId === 'queries' ? 'calc(100%)' : undefined }} ref={blockRef}>
			<Editor
				height={parentId === 'queries' ? height || 20 : 250}
				options={{
					minimap: { enabled: false },
					scrollBeyondLastLine: false,
					scrollbar: { vertical: 'hidden', useShadows: false },
				}}
				wrapperClassName=""
				onMount={onEditorMount}
				defaultValue={value}
				onChange={onEditorChange}
				beforeMount={(monaco) => {
					setupMonaco(monaco);
					monaco.languages.typescript.javascriptDefaults.addExtraLib(
						[
							'declare module "@levankvirkvelia/page-state" {',
							`export function mongo(databaseId: string): {
  find<T = any>(options: {
    collection: string;
    filter?: any;
    project?: any;
    sort?: any;
    limit?: number;
    skip?: number;
  }): T[];

  findOne<T = any>(options: {
    collection: string;
    filter?: any;
    project?: any;
    sort?: any;
    skip?: number;
  }): T;
};

export const pageState: {
  callMethod(blockId: any, method: any, callArgs?: any[]): Promise<any>;
  getProperty(...keys: string[]): Promise<any>;
};`,
							'};',
						].join('\n'),
						'ts:@levankvirkvelia/page-state',
					);
				}}
				language="javascript"
			/>
		</div>
	);
}
