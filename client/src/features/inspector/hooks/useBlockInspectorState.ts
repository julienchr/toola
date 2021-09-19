import { useInspectorState } from './useInspectorState';
import { MenuItemProps } from '../components/InspectorItem';
import { BlockProps, Blocks } from '../../editor/types/blocks';
import { useBlock } from '../../editor/hooks/useBlock';
import { useEditor } from '../../editor/hooks/useEditor';
import { usePageContext } from '../../executor/hooks/useReferences';

const TurnIntoBlocks: [string, Blocks['type'] | ({ type: Blocks['type'] } & Partial<BlockProps>)][] = [
	['Text', 'text'],
	['Heading 1', { type: 'text', style: 'heading1' }],
	['Heading 2', { type: 'text', style: 'heading2' }],
	['Heading 3', { type: 'text', style: 'heading3' }],
	['Code', 'code'],
	['Query', 'query'],
	['Page', 'subpage'],
	['JSON viewer', 'JSONView'],
	['KeyValue viewer', 'keyValue'],
	['Table', 'table'],
	['Image', 'image'],
	['Input', 'input'],
	['Button', 'button'],
];

export function useBlockInspectorState(
	menuConfig: ((defaultMenu: MenuItemProps[]) => MenuItemProps[]) | MenuItemProps[],
) {
	const { editing } = usePageContext();

	const { id, display } = useBlock();
	const { deleteBlock, immerBlockProps, updateBlockType } = useEditor();

	const { onContextMenu, inspectorProps } = useInspectorState({
		disabled: !editing,
		menu: [],
	});

	const defaultMenu: MenuItemProps[] = [
		{
			type: 'nested',
			label: 'Display',
			icon: 'eye-open',
			next: [
				{
					label: 'Hide',
					type: 'switch',
					value: Boolean(display?.hide),
					onChange: (v) =>
						immerBlockProps(id, (draft) => {
							if (!draft.display) draft.display = {};
							draft.display.hide = v;
						}),
				},
			],
		},
		{
			type: 'nested',
			label: 'Turn into',
			icon: 'rotate-document',
			next: TurnIntoBlocks.map((blockType) => ({
				label: blockType[0],
				type: 'item',
				call: () => updateBlockType(id, blockType[1]),
			})),
		},
		{
			type: 'item',
			icon: 'trash',
			label: 'Delete',
			closeAfterCall: true,
			call: () => deleteBlock(id),
		},
	];

	const menu: MenuItemProps[] = [
		...(typeof menuConfig === 'function' ? menuConfig(defaultMenu) : menuConfig),
		...(typeof menuConfig === 'function' ? [] : defaultMenu),
	];

	return { onContextMenu, inspectorProps: { ...inspectorProps, menu } };
}
