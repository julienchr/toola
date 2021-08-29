import { MenuItem } from '@blueprintjs/core';
import React from 'react';
import { BasicItemProps, InspectorItemProps } from '../InspectorItem';
import { CodeInput } from '../CodeInput';

export type InputMenuItemProps = BasicItemProps & {
	type: 'input';
	value: string;
	codeType?: 'string' | 'object';
	onChange: (v: string) => void;
	multiline?: boolean;
};

export function InputMenuItem({ item, Wrapper = MenuItem, inline }: InspectorItemProps<InputMenuItemProps>) {
	return (
		<Wrapper
			shouldDismissPopover={false}
			icon={item.icon}
			text={
				<CodeInput
					multiline={item.multiline}
					inline={inline}
					label={item.label}
					value={item.value}
					type={item.codeType}
					onChange={item.onChange}
				/>
			}
		/>
	);
}
