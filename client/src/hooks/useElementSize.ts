import { RefObject, useCallback, useState } from 'react';
import { useDOMEventListener } from './useDOMEventListener';
import { useOnMountedEffect } from './useOnMounted';

interface Size {
	width: number;
	height: number;
}

export function useElementSize<T extends HTMLElement = HTMLDivElement>(elementRef: RefObject<T>): Size {
	const [size, setSize] = useState<Size>({
		width: 0,
		height: 0,
	});

	// Prevent too many rendering using useCallback
	const updateSize = useCallback(() => {
		const node = elementRef?.current;
		if (node) {
			setSize({
				width: node.offsetWidth || 0,
				height: node.offsetHeight || 0,
			});
		}
	}, [elementRef]);

	useOnMountedEffect(() => {
		updateSize();
	});

	useDOMEventListener('resize', updateSize);

	return size;
}
