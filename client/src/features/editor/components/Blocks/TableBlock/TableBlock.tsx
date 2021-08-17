import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
} from '@material-ui/core';
import JSONTree from 'react-json-tree';
import { Column, useBlockLayout, usePagination, useResizeColumns, useRowSelect, useTable } from 'react-table';
import { useCallback, useEffect, useMemo } from 'react';
import { v4 } from 'uuid';
import { usePrevious } from '../../../../../hooks/usePrevious';
import { useBlockSetState } from '../../../hooks/useBlockSetState';
import { usePageNavigator } from '../../../hooks/usePageNavigator';
import { useTableBlockColumnsAndData } from '../../../hooks/useTableBlockColumnsAndData';
import { useTableColumnResizing } from '../../../hooks/useTableColumnResizing';
import { useTableInspector } from '../../../hooks/useTableInspector';
import { BasicBlock } from '../../../types/basicBlock';
import { useReferenceEvaluator } from '../../../hooks/useReferences';
import { useBlockInspectorState } from '../../../hooks/useBlockInspectorState';
import { BlockInspector, MenuItemProps } from '../../Inspector/BlockInspector';
import { useEditor } from '../../../hooks/useEditor';
import { ColumnDnD } from './ColumnDnD';
import { TableStyles } from './TableStyles';

export type TableBlockType = TableBlockProps & TableBlockState;
export type TableBlockProps = {
	type: 'table';
	value: string;
	columns?: TableColumnsProp;
	manualPagination: boolean;
	connectedPage: string;
};

export enum ColumnTypes {
	json = 'json',
	image = 'image',
	text = 'text',
}

export type TableColumnsProp = {
	id: string;
	header: string;
	value: string;
	width?: number;
	type?: ColumnTypes;
}[];

export type TableBlockState = {
	page?: number;
	selectedRow?: unknown;
	pageIndex: number;
	pageSize: number;
};

export function TableBlock({ block }: { block: BasicBlock & TableBlockType }) {
	const { id, manualPagination, connectedPage } = block;

	const { updateBlockState, immerBlockProps } = useEditor();
	const { navigate } = usePageNavigator();
	const { data, calculatedColumns } = useTableBlockColumnsAndData(block);

	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		page,
		rows,
		prepareRow,
		state,
		toggleAllRowsSelected,
		gotoPage,
		setPageSize,
	} = useTable(
		{
			columns: calculatedColumns,
			data,
			manualPagination,
			pageCount: manualPagination ? -1 : undefined,
		},
		useBlockLayout,
		useResizeColumns,
		usePagination,
		useRowSelect,
	);

	const { pageIndex, pageSize, columnResizing } = state;
	useBlockSetState<TableBlockState>('pageIndex', pageIndex);
	useBlockSetState<TableBlockState>('pageSize', pageSize);

	const { onContextMenu, inspectorProps } = useTableInspector(block);
	useTableColumnResizing(columnResizing);

	const addColumn = useCallback(() => {
		immerBlockProps<TableBlockProps>(id, (draft) => {
			if (!draft.columns) draft.columns = [];
			draft.columns.push({ id: v4(), header: 'column', type: ColumnTypes.text, value: '' });
		});
	}, [id, immerBlockProps]);

	return (
		<>
			<BlockInspector {...inspectorProps} />
			<TableStyles>
				<Paper>
					<TableContainer sx={{ maxHeight: 500 }}>
						<Table
							{...getTableProps()}
							stickyHeader
							onContextMenu={(e) => onContextMenu(e, ['global'])}
							className="table"
						>
							<TableHead style={{ position: 'sticky', top: 0 }}>
								{headerGroups.map((headerGroup) => (
									<TableRow {...headerGroup.getHeaderGroupProps()} className="tr">
										{headerGroup.headers.map((column) => {
											return (
												<ColumnDnD
													column={column}
													tableId={id}
													onClick={(e) => {
														if (column.id === 'add') addColumn();
														else onContextMenu(e, [`col${column.id}`]);
													}}
												/>
											);
										})}
									</TableRow>
								))}
							</TableHead>
							<TableBody {...getTableBodyProps()} className="tbody">
								{page.map((row) => {
									prepareRow(row);
									return (
										<TableRow
											{...row.getRowProps({
												style: { backgroundColor: row.isSelected ? 'rgba(127, 180, 235, 0.3)' : undefined },
											})}
											onClick={() => {
												const { isSelected } = row;
												toggleAllRowsSelected(false);
												if (!isSelected) row.toggleRowSelected();
												updateBlockState({ id, selectedRow: isSelected ? null : row.original });
											}}
											onDoubleClick={() => {
												if (connectedPage) {
													navigate(connectedPage, row.original);
												}
											}}
											className="tr"
										>
											{row.cells.map((cell) => {
												const cellValue = ['string', 'number'].includes(typeof cell.value)
													? cell.value
													: JSON.stringify(cell.value);

												return (
													<TableCell className="td" {...cell.getCellProps()} title={cellValue}>
														{(() => {
															// eslint-disable-next-line @typescript-eslint/ban-ts-comment
															// @ts-ignore
															const type = cell.column.type as string;
															if (type === ColumnTypes.image) {
																if (Array.isArray(cell.value))
																	return cell.value.map((url) => <img src={url} style={{ width: '100%' }} />);
																return cellValue ? <img src={cellValue} style={{ width: '100%' }} /> : null;
															}
															if (type === ColumnTypes.json) return <JSONTree data={cell.value} />;
															return cellValue;
														})()}
													</TableCell>
												);
											})}
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</TableContainer>
					<TablePagination
						rowsPerPageOptions={[1, 5, 10, 25]}
						component="div"
						count={manualPagination ? -1 : rows.length}
						rowsPerPage={pageSize}
						page={pageIndex}
						onPageChange={(_, pageNumber) => {
							gotoPage(pageNumber);
						}}
						onRowsPerPageChange={(event) => setPageSize(+event.target.value)}
					/>
				</Paper>
			</TableStyles>
		</>
	);
}
