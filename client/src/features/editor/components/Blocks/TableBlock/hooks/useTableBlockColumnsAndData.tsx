import { useEffect, useMemo } from 'react';
import { Column } from 'react-table';
import { v4 } from 'uuid';
import { TableBlockType, TableColumnsProp } from '../TableBlock';
import { BasicBlock } from '../../../../types/basicBlock';
import { useEditor } from '../../../../hooks/useEditor';
import { useReferenceEvaluator } from '../../../../../executor/hooks/useReferences';

export function useTableBlockColumnsAndData(block: BasicBlock & TableBlockType, isEditing: boolean) {
	const { columns, value, id, pageId } = block;

	const { evaluate, isLoading } = useReferenceEvaluator();

	const { updateBlockProps } = useEditor();

	const data = useMemo<any[]>(() => {
		const state = evaluate(value);
		if (Array.isArray(state)) return state;
		if (typeof state === 'object') return [state];
		return [];
	}, [evaluate, value]);

	const columnsProp = useMemo<TableColumnsProp>(() => {
		if (columns) return columns;
		const keys = new Set<string>();
		data.forEach((row) => {
			if (typeof row === 'object' && row !== null) Object.keys(row).forEach((key) => keys.add(key));
		});
		return Array.from(keys).map((accessor) => ({
			header: accessor,
			value: `\${current["${accessor}"]}`,
			width: 150,
			id: v4(),
		}));
	}, [columns, data]);

	useEffect(() => {
		if ((!columns || columns.length === 0) && columnsProp.length > 0) {
			updateBlockProps({ id, columns: columnsProp });
		}
	}, [columns, columnsProp, id, pageId, updateBlockProps]);

	const calculatedColumns = useMemo<Column[]>(() => {
		const cols: Column[] = columnsProp.map((col) => ({
			Header: col.header,
			accessor: (originalRow) => evaluate(col.value, originalRow),
			minWidth: 100,
			maxWidth: 300,
			width: col.width || 150,
			type: col.type,
			id: col.id,
		}));
		const addCellWidth = 35;
		if (isEditing)
			cols.push({
				id: 'add',
				Header: '+',
				accessor: () => '',
				maxWidth: addCellWidth,
				minWidth: addCellWidth,
				width: addCellWidth,
				// type: ColumnTypes.text,
			});
		return cols;
	}, [columnsProp, evaluate, isEditing]);

	return { calculatedColumns, data, isLoading };
}