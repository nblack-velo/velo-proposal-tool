'use client';
import React, { useOptimistic } from 'react';
import { columns } from './columns';
import {
	ColumnFiltersState,
	ExpandedState,
	SortingState,
	getCoreRowModel,
	getExpandedRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { updateProduct } from '@/lib/functions/update';
import { ProductState } from '@/types/optimisticTypes';
import { DraggableDataTable } from '@/components/ui/draggable-data-table';

type Props = {
	products: NestedProduct[];
};

const ProductsList = ({ products }: Props) => {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [expanded, setExpanded] = React.useState<ExpandedState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

	const [state, mutate] = useOptimistic({ products, pending: false }, function createReducer(state, newState: ProductState) {
		if (newState.newProduct) {
			return {
				products: [...state.products, newState.newProduct] as NestedProduct[],
				pending: newState.pending,
			};
		} else if (newState.newProducts) {
			return {
				products: newState.newProducts as NestedProduct[],
				pending: newState.pending,
			};
		} else if (newState.updatedProduct) {
			return {
				products: [...state.products.filter((f) => f.id !== newState.updatedProduct!.id), newState.updatedProduct] as NestedProduct[],
				pending: newState.pending,
			};
		} else if (newState.updatedProducts) {
			return {
				products: newState.updatedProducts,
				pending: newState.pending,
			};
		} else {
			return {
				products: [...state.products.filter((f) => f.unique_id !== newState.deletedProduct)] as NestedProduct[],
				pending: newState.pending,
			};
		}
	});

	const table = useReactTable<NestedProduct>({
		data: state.products,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		getExpandedRowModel: getExpandedRowModel(),
		onExpandedChange: setExpanded,
		enableExpanding: true,
		getRowId: (row) => row.unique_id,
		getSubRows: (row) => {
			let orderedItems = row.products?.sort((a, b) => {
				// First, compare by score in descending order
				if (Number(a.sequence_number) > Number(b.sequence_number)) return 1;
				if (Number(a.sequence_number) < Number(b.sequence_number)) return -1;

				// If scores are equal, then sort by created_at in ascending order
				return Number(a.id) - Number(b.id);
				// return new Date(a.=).getTime() - new Date(b.created_at).getTime();
			});

			return orderedItems;
		},
		meta: {
			updateProduct,
		},
		manualPagination: true,
		// onPaginationChange: onPaginationChange,
		// pageCount: pageCount,
		state: {
			expanded,
			sorting,
			columnFilters,
		},
	});

	return (
		<>
			<DraggableDataTable table={table} type='Product' />
		</>
	);
};

export default ProductsList;
