import { Draft } from 'immer/dist/types/types-external';
import { useCallback, useState } from 'react';
import { useOnMountedEffect } from '../../../hooks/useOnMounted';
import { useBlock } from './useBlock';
import { useEditor } from './useEditor';

type Dispatch<T> = (nextValue: ((draft: Draft<T>) => undefined | void | T) | T) => void;
export function useBlockProperty<T>(name: string): [T | undefined, Dispatch<T>];
export function useBlockProperty<T>(name: string, defaultValue: T): [T, Dispatch<T>];
export function useBlockProperty<T>(name: string, defaultValue?: T): [T | undefined, Dispatch<T>] {
	const block = useBlock();
	const { updateBlockProps, immerBlockProps } = useEditor();
	const [memDefaultValue] = useState(() => defaultValue);

	const currentValue = block?.[name as keyof typeof block] as T;

	const update = useCallback<Dispatch<T>>(
		(nextValue) => {
			if (typeof nextValue === 'function') {
				immerBlockProps(block.id, (draft) => {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					return nextValue(draft[name as keyof typeof draft]);
				});
			} else updateBlockProps({ id: block.id, [name]: nextValue });
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[block.id, name, updateBlockProps],
	);

	useOnMountedEffect(() => {
		if (typeof currentValue === 'undefined' && typeof memDefaultValue !== 'undefined') {
			update(memDefaultValue);
		}
	});

	return [currentValue || memDefaultValue, update];
}

export function useBlockState<T>(name: string, defaultValue?: T): [T | undefined, (nextValue: T) => void];
export function useBlockState<T>(name: string, defaultValue: T): [T, (nextValue: T) => void] {
	const block = useBlock();
	const { updateBlockState } = useEditor();

	const [memDefaultValue] = useState(() => defaultValue);

	const update = useCallback(
		(nextValue: any) => {
			updateBlockState({ id: block.id, [name]: nextValue });
		},
		[block.id, name, updateBlockState],
	);

	return [(block[name as keyof typeof block] as T) || memDefaultValue, update];
}