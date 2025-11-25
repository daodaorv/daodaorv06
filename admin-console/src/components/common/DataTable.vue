<template>
  <div class="data-table-container">
    <div class="table-header" v-if="showHeader">
      <div class="table-title">
        <h3 v-if="title">{{ title }}</h3>
        <slot name="title" />
      </div>

      <div class="table-actions">
        <slot name="actions" />
      </div>
    </div>

    <el-table
      ref="tableRef"
      v-bind="$attrs"
      :data="data"
      :loading="loading"
      :height="height"
      :max-height="maxHeight"
      :stripe="stripe"
      :border="border"
      :size="size"
      :fit="fit"
      :show-header="showTableHeader"
      :highlight-current-row="highlightCurrentRow"
      :row-class-name="rowClassName"
      :cell-class-name="cellClassName"
      :empty-text="emptyText"
      :default-expand-all="defaultExpandAll"
      :expand-row-keys="expandRowKeys"
      :default-sort="defaultSort"
      :tooltip-effect="tooltipEffect"
      :show-summary="showSummary"
      :sum-text="sumText"
      :summary-method="summaryMethod"
      :span-method="spanMethod"
      :select-on-indeterminate="selectOnIndeterminate"
      :indent="indent"
      :lazy="lazy"
      :load="load"
      :tree-props="treeProps"
      @select="handleSelect"
      @select-all="handleSelectAll"
      @selection-change="handleSelectionChange"
      @cell-mouse-enter="handleCellMouseEnter"
      @cell-mouse-leave="handleCellMouseLeave"
      @cell-click="handleCellClick"
      @cell-dblclick="handleCellDblclick"
      @row-click="handleRowClick"
      @row-contextmenu="handleRowContextmenu"
      @row-dblclick="handleRowDblclick"
      @header-click="handleHeaderClick"
      @header-contextmenu="handleHeaderContextmenu"
      @sort-change="handleSortChange"
      @filter-change="handleFilterChange"
      @current-change="handleCurrentChange"
      @header-dragend="handleHeaderDragend"
      @expand-change="handleExpandChange"
    >
      <!-- 选择列 -->
      <el-table-column
        v-if="selectable"
        type="selection"
        width="55"
        :reserve-selection="reserveSelection"
        :selectable="selectableFunction"
        fixed="left"
      />

      <!-- 序号列 -->
      <el-table-column
        v-if="showIndex"
        type="index"
        label="序号"
        width="60"
        :index="indexMethod"
        fixed="left"
      />

      <!-- 展开列 -->
      <el-table-column
        v-if="expandable"
        type="expand"
        width="50"
        fixed="left"
      >
        <template #default="scope">
          <slot name="expand" v-bind="scope" />
        </template>
      </el-table-column>

      <!-- 数据列 -->
      <el-table-column
        v-for="column in visibleColumns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :width="column.width"
        :min-width="column.minWidth"
        :fixed="column.fixed"
        :render-header="column.renderHeader"
        :sortable="column.sortable"
        :sort-method="column.sortMethod"
        :sort-by="column.sortBy"
        :sort-orders="column.sortOrders"
        :resizable="column.resizable"
        :formatter="column.formatter"
        :show-overflow-tooltip="column.showOverflowTooltip !== false"
        :align="column.align || 'left'"
        :header-align="column.headerAlign"
        :class-name="column.className"
        :label-class-name="column.labelClassName"
        :filters="column.filters"
        :filter-placement="column.filterPlacement"
        :filter-multiple="column.filterMultiple"
        :filter-method="column.filterMethod"
        :filtered-value="column.filteredValue"
      >
        <template #default="scope" v-if="column.slot">
          <slot :name="column.slot" v-bind="scope" />
        </template>

        <template #header="scope" v-if="column.headerSlot">
          <slot :name="column.headerSlot" v-bind="scope" />
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column
        v-if="$slots.actions"
        label="操作"
        :width="actionWidth"
        :min-width="actionMinWidth"
        :fixed="actionFixed"
        :resizable="false"
        align="center"
      >
        <template #default="scope">
          <slot name="actions" v-bind="scope" />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页器 -->
    <div v-if="showPagination && pagination" class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :page-sizes="pagination.sizes || [10, 20, 50, 100]"
        :total="pagination.total"
        :layout="paginationLayout"
        :background="paginationBackground"
        :small="paginationSmall"
        :hide-on-single-page="hideOnSinglePage"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { TableColumnCtx, TableInstance } from 'element-plus'

// 列定义接口
interface TableColumn {
  prop: string
  label: string
  width?: number | string
  minWidth?: number | string
  fixed?: boolean | 'left' | 'right'
  sortable?: boolean | 'custom'
  sortMethod?: (a: any, b: any) => number
  sortBy?: string | string[] | ((row: any) => any)
  sortOrders?: ('ascending' | 'descending')[]
  resizable?: boolean
  formatter?: (row: any, column: TableColumnCtx<any>, cellValue: any, index: number) => any
  showOverflowTooltip?: boolean
  align?: 'left' | 'center' | 'right'
  headerAlign?: 'left' | 'center' | 'right'
  className?: string
  labelClassName?: string
  filters?: { text: string; value: any }[]
  filterPlacement?: string
  filterMultiple?: boolean
  filterMethod?: (value: any, row: any, column: TableColumnCtx<any>) => boolean
  filteredValue?: any[]
  slot?: string
  headerSlot?: string
  renderHeader?: (params: { column: any; $index: number }) => any
  visible?: boolean | ((data: any[]) => boolean)
}

// 分页接口
interface Pagination {
  page: number
  size: number
  total: number
  sizes?: number[]
}

interface Props {
  data: any[]
  loading?: boolean
  columns: TableColumn[]
  pagination?: Pagination
  height?: string | number
  maxHeight?: string | number
  stripe?: boolean
  border?: boolean
  size?: 'large' | 'default' | 'small'
  fit?: boolean
  showHeader?: boolean
  highlightCurrentRow?: boolean
  emptyText?: string
  defaultExpandAll?: boolean
  expandRowKeys?: any[]
  defaultSort?: { prop: string; order: 'ascending' | 'descending' }
  tooltipEffect?: 'dark' | 'light'
  showSummary?: boolean
  sumText?: string
  summaryMethod?: (param: { columns: any[]; data: any[] }) => string[]
  spanMethod?: (param: { row: any; column: any; rowIndex: number; columnIndex: number }) => number[] | { rowspan: number; colspan: number }
  selectOnIndeterminate?: boolean
  indent?: number
  lazy?: boolean
  load?: (row: any, treeNode: any, resolve: (date: any[]) => void) => void
  treeProps?: { hasChildren: string; children: string }
  selectable?: boolean
  selectableFunction?: (row: any, index: number) => boolean
  showIndex?: boolean
  expandable?: boolean
  reserveSelection?: boolean
  showTableHeader?: boolean
  title?: string
  showHeader?: boolean
  actionWidth?: number | string
  actionMinWidth?: number | string
  actionFixed?: boolean | 'left' | 'right'
  showPagination?: boolean
  paginationLayout?: string
  paginationBackground?: boolean
  paginationSmall?: boolean
  hideOnSinglePage?: boolean
  rowClassName?: (params: { row: any; rowIndex: number }) => string
  cellClassName?: (params: { row: any; column: any; rowIndex: number; columnIndex: number }) => string
}

interface Emits {
  (e: 'selection-change', selection: any[]): void
  (e: 'select', selection: any[], row: any): void
  (e: 'select-all', selection: any[]): void
  (e: 'cell-mouse-enter', row: any, column: any, cell: HTMLTableCellElement, event: MouseEvent): void
  (e: 'cell-mouse-leave', row: any, column: any, cell: HTMLTableCellElement, event: MouseEvent): void
  (e: 'cell-click', row: any, column: any, cell: HTMLTableCellElement, event: MouseEvent): void
  (e: 'cell-dblclick', row: any, column: any, cell: HTMLTableCellElement, event: MouseEvent): void
  (e: 'row-click', row: any, column: any, event: MouseEvent): void
  (e: 'row-contextmenu', row: any, column: any, event: MouseEvent): void
  (e: 'row-dblclick', row: any, column: any, event: MouseEvent): void
  (e: 'header-click', column: any, event: MouseEvent): void
  (e: 'header-contextmenu', column: any, event: MouseEvent): void
  (e: 'sort-change', sort: { column: any; prop: string; order: string }): void
  (e: 'filter-change', filters: any): void
  (e: 'current-change', currentRow: any, oldCurrentRow: any): void
  (e: 'header-dragend', newWidth: number, oldWidth: number, column: any, event: MouseEvent): void
  (e: 'expand-change', row: any, expandedRows: any[]): void
  (e: 'page-change', page: number): void
  (e: 'size-change', size: number): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  stripe: true,
  border: true,
  size: 'default',
  fit: true,
  showHeader: true,
  highlightCurrentRow: false,
  emptyText: '暂无数据',
  tooltipEffect: 'dark',
  selectOnIndeterminate: true,
  selectable: false,
  showIndex: true,
  expandable: false,
  reserveSelection: false,
  showTableHeader: true,
  showPagination: true,
  paginationLayout: 'total, sizes, prev, pager, next, jumper',
  paginationBackground: true,
  paginationSmall: false,
  hideOnSinglePage: false,
  actionWidth: 200,
  actionMinWidth: 120,
  actionFixed: 'right'
})

const emit = defineEmits<Emits>()

const tableRef = ref<TableInstance>()

// 可见列
const visibleColumns = computed(() => {
  return props.columns.filter(column => {
    if (typeof column.visible === 'boolean') {
      return column.visible
    }
    if (typeof column.visible === 'function') {
      return column.visible(props.data)
    }
    return true
  })
})

// 计算序号
const indexMethod = (index: number) => {
  if (props.pagination) {
    return (props.pagination.page - 1) * props.pagination.size + index + 1
  }
  return index + 1
}

// 事件处理方法
const handleSelectionChange = (selection: any[]) => {
  emit('selection-change', selection)
}

const handleSelect = (selection: any[], row: any) => {
  emit('select', selection, row)
}

const handleSelectAll = (selection: any[]) => {
  emit('select-all', selection)
}

const handleCellMouseEnter = (row: any, column: any, cell: HTMLTableCellElement, event: MouseEvent) => {
  emit('cell-mouse-enter', row, column, cell, event)
}

const handleCellMouseLeave = (row: any, column: any, cell: HTMLTableCellElement, event: MouseEvent) => {
  emit('cell-mouse-leave', row, column, cell, event)
}

const handleCellClick = (row: any, column: any, cell: HTMLTableCellElement, event: MouseEvent) => {
  emit('cell-click', row, column, cell, event)
}

const handleCellDblclick = (row: any, column: any, cell: HTMLTableCellElement, event: MouseEvent) => {
  emit('cell-dblclick', row, column, cell, event)
}

const handleRowClick = (row: any, column: any, event: MouseEvent) => {
  emit('row-click', row, column, event)
}

const handleRowContextmenu = (row: any, column: any, event: MouseEvent) => {
  emit('row-contextmenu', row, column, event)
}

const handleRowDblclick = (row: any, column: any, event: MouseEvent) => {
  emit('row-dblclick', row, column, event)
}

const handleHeaderClick = (column: any, event: MouseEvent) => {
  emit('header-click', column, event)
}

const handleHeaderContextmenu = (column: any, event: MouseEvent) => {
  emit('header-contextmenu', column, event)
}

const handleSortChange = (sort: { column: any; prop: string; order: string }) => {
  emit('sort-change', sort)
}

const handleFilterChange = (filters: any) => {
  emit('filter-change', filters)
}

const handleCurrentChange = (currentRow: any, oldCurrentRow: any) => {
  emit('current-change', currentRow, oldCurrentRow)
}

const handleHeaderDragend = (newWidth: number, oldWidth: number, column: any, event: MouseEvent) => {
  emit('header-dragend', newWidth, oldWidth, column, event)
}

const handleExpandChange = (row: any, expandedRows: any[]) => {
  emit('expand-change', row, expandedRows)
}

const handleSizeChange = (size: number) => {
  emit('size-change', size)
}

const handleCurrentChange = (page: number) => {
  emit('page-change', page)
}

// 暴露方法
defineExpose({
  tableRef,
  clearSelection: () => tableRef.value?.clearSelection(),
  toggleRowSelection: (row: any, selected?: boolean) => tableRef.value?.toggleRowSelection(row, selected),
  toggleAllSelection: () => tableRef.value?.toggleAllSelection(),
  toggleRowExpansion: (row: any, expanded?: boolean) => tableRef.value?.toggleRowExpansion(row, expanded),
  setCurrentRow: (row: any) => tableRef.value?.setCurrentRow(row),
  clearSort: () => tableRef.value?.clearSort(),
  clearFilter: (columnKeys?: string) => tableRef.value?.clearFilter(columnKeys),
  doLayout: () => tableRef.value?.doLayout(),
  sort: (prop: string, order: string) => tableRef.value?.sort(prop, order)
})
</script>

<style scoped lang="scss">
.data-table-container {
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .table-title {
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }

    .table-actions {
      display: flex;
      gap: 8px;
    }
  }

  :deep(.el-table) {
    .el-table__header-wrapper {
      th {
        background-color: var(--el-fill-color-lighter);
        color: var(--el-text-color-primary);
        font-weight: 600;
      }
    }

    .el-table__body-wrapper {
      tr:hover > td {
        background-color: var(--el-fill-color-light);
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .data-table-container {
    .table-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .pagination-container {
      :deep(.el-pagination) {
        flex-wrap: wrap;
        justify-content: center;
      }
    }
  }
}
</style>