import { MenuItem, Button, FormGroup } from '@blueprintjs/core';
import { Select } from '@blueprintjs/select';
import React, { useMemo } from 'react';
import { Database, useDatabases } from '../../hooks/useDatabases';
import { BasicItemProps, InspectorItemProps } from '../InspectorItem';

export type DatabaseMenuItemProps = BasicItemProps & {
	type: 'database';
	value?: Database;
	onChange: (v: Database) => void;
};

const DatabaseSelect = Select.ofType<Database>();

export function DatabaseMenuItem({ item, Wrapper = MenuItem, inline }: InspectorItemProps<DatabaseMenuItemProps>) {
	const { data } = useDatabases();
	const selectedDatabase = useMemo(
		() => data?.find((database) => database._id === item.value?._id),
		[item.value, data],
	);

	return (
		<Wrapper
			shouldDismissPopover={false}
			icon={item.icon}
			text={
				<FormGroup label={item.label} inline={inline}>
					<DatabaseSelect
						items={data || []}
						itemPredicate={(query, database) => database.name.toLowerCase().includes(query.toLowerCase())}
						noResults={<MenuItem disabled text="No results." />}
						itemRenderer={(database, { handleClick }) => <MenuItem onClick={handleClick} text={database.name} />}
						onItemSelect={(a) => item.onChange(a)}
					>
						<Button fill text={selectedDatabase?.name || 'Выберите базу данных'} rightIcon="double-caret-vertical" />
					</DatabaseSelect>
				</FormGroup>
			}
		/>
	);
}
