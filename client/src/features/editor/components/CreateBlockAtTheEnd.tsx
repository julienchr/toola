import { useCallback } from 'react';
import { BlockCreators } from '../helpers/BlockCreators';
import { useEditor } from '../hooks/useEditor';
import { usePageContext } from '../../executor/hooks/useReferences';

export type CreateBlockAtTheEndProps = {
	parentId: string;
};

export function CreateBlockAtTheEnd({ parentId }: CreateBlockAtTheEndProps): JSX.Element {
	const { addBlockIn } = useEditor();
	const { editing } = usePageContext();

	const handler = useCallback(() => {
		addBlockIn(parentId, BlockCreators.text());
	}, [addBlockIn, parentId]);

	if (!editing) return <></>;

	return (
		<div
			style={{
				height: 100,
				width: '100%',
				cursor: 'text',
			}}
			onClick={handler}
		/>
	);
}
