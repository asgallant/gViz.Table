/*	
 *	gViz.Table Visualization Library Copyright (c) 2013, Andrew Gallant (gViz.developer@gmail.com).  All rights reserved.
 *	
 *	This file is part of the gViz.Table Visualization Library
 *	
 *	The gViz.Table Visualization Library is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU General Public License as published by the Free Software
 *	Foundation, either version 3 of the License, or (at your option) any later version.
 *	
 *	The gViz.Table Visualization Library is distributed in the hope that it will be useful, but
 *	WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 *	PARTICULAR PURPOSE.  See the GNU General Public License for more details.
 *	
 *	You should have received a copy of the GNU General Public License along with the gViz.Table
 *	Visualization Library.  If not, see <http://www.gnu.org/licenses/>.
 */
var gViz = gViz || {};
if (gViz.Table) {
	gViz._Table = gViz.Table;
}
gViz.Table = function (container) {
	this.container = container;
	this.defaultOptions = {
		allowHtml: false,
		height: null,
		hover: {
			enabled: true,
			element: 'row'
		},
		paging: {
			buttonLocation: 'footer',
			custom: false,
			enabled: false,
			firstPageNumber: 1,
			maxPageButtons: 10,
			pageButtons: {
				first: 'First',
				previous: 'Previous',
				next: 'Next',
				last: 'Last',
			},
			pageSize: 10,
			startPage: 0
		},
		rowNumbers: {
			enabled: false,
			firstRowNumber: 1
		},
		rtlTable: false,
		scrollLeftStartPosition: 0,
		scrollTopStartPosition: 0,
		selection: {
			allowMultiSelect: true,
			enabled: true,
			element: 'row'
		},
		sort: {
			ascending: true,
			custom: false,
			enabled: true,
			initialColumn: null,
			showArrows: true
		},
		style: {
			alternatingPattern: 'rows',
			classNames: {
				table: 'gViz-table',
				tableHeader: 'gViz-table-thead',
				tableBody: 'gViz-table-tbody',
				tableFooter: 'gViz-table-tfoot',
				evenRow: 'gViz-table-tbody-tr-even',
				footerRow: 'gViz-table-tfoot-tr',
				headerRow: 'gViz-table-thead-tr',
				hoverRow: 'gViz-table-tbody-tr-hover',
				oddRow: 'gViz-table-tbody-tr-odd',
				selectedRow: 'gViz-table-tbody-tr-selected',
				row: 'gViz-table-tbody-tr',
				footerCell: 'gViz-table-tfoot-td',
				headerCell: 'gViz-table-thead-th',
				hoverCell: 'gViz-table-tbody-td-hover',
				rowNumberCell: 'gViz-table-tbody-td-row-number',
				selectedCell: 'gViz-table-tbody-td-selected',
				tableCell: 'gViz-table-tbody-td',
				booleanCell: 'gViz-table-tbody-td-boolean',
				dateCell: 'gViz-table-tbody-td-date',
				dateTimeCell: 'gViz-table-tbody-td-datetime',
				numberCell: 'gViz-table-tbody-td-number',
				stringCell: 'gViz-table-tbody-td-string',
				timeOfDayCell: 'gViz-table-tbody-td-timeofday',
				column: 'gViz-table-tbody-column',
				evenColumn: 'gViz-table-tbody-column-even',
				hoverColumn: 'gViz-table-tbody-column-hover',
				oddColumn: 'gViz-table-tbody-column-odd',
				rowNumberColumn: 'gViz-table-tbody-column-row-number',
				selectedColumn: 'gViz-table-tbody-column-selected'
			},
			hover: 'row',
			overrideDefault: true,
			css: {
				table: '',
				tableHeader: '',
				tableBody: '',
				tableFooter: '',
				evenRow: '',
				footerRow: '',
				headerRow: '',
				hoverRow: '',
				oddRow: '',
				selectedRow: '',
				row: '',
				footerCell: '',
				headerCell: '',
				hoverCell: '',
				rowNumberCell: '',
				selectedCell: '',
				tableCell: '',
				booleanCell: '',
				dateCell: '',
				dateTimeCell: '',
				numberCell: '',
				stringCell: '',
				timeOfDayCell: '',
				column: '',
				evenColumn: '',
				hoverColumn: '',
				oddColumn: '',
				rowNumberColumn: '',
				selectedColumn: ''
			}
		},
		width: null
	};
	this.options = {};
	this.events = {};
	this.selection = [];
	this.sortInfo = {
		ascending: true,
		column: null,
		sortedIndexes: []
	};
	this.masterDiv = null;
	this.headerDiv = null;
	this.tableDiv = null;
	this.footerDiv = null;
	this.mainTableDiv = null;
	this.headerTableDiv = null;
	this.table = null;
	this.headerTable = null;
	this.tHead = null;
	this.tBody = null;
	this.tFoot = null;
};
gViz.Table.prototype = (function () {
	// deep extend code borrowed from http://andrewdupont.net/2009/08/28/deep-extending-meects-in-javascript/ by Andrew Dupont
	function deepExtend (destination, source) {
		for (var property in source) {
			if (source[property] && source[property].constructor && source[property].constructor === Object) {
				destination[property] = destination[property] || {};
				arguments.callee(destination[property], source[property]);
			} else {
				destination[property] = source[property];
			}
		}
		return destination;
	}
	function clearNulls (array) {
		for (var i = array.length - 1; i >= 0; i--) {
			if (array[i] === null || array[i] === '') {
				array.splice(i, 1);
			}
		}
	}
	function addEventListener(e) {
		if (document.addEventListener) {
			e.element.addEventListener(e.event, e.handler);
		}
		else if (document.attachEvent) {
			e.element.attachEvent('on' + e.event, e.handler);
		}
		else {
			e.element['on' + e.event] = e.handler;
		}
	}
	function removeEventListener(e) {
		if (document.removeEventListener) {
			e.element.removeEventListener(e.event, e.handler);
		}
		else if (document.detachEvent) {
			e.element.detachEvent('on' + e.event, e.handler);
		}
		else {
			e.element['on' + e.event] = null;
		}
	}
	function getFirstAncestorByTagName (tag, element, maxNode) {
		var e = element;
		while (e.tagName.toLowerCase() != tag) {
			if (e.parentNode.tagName.toLowerCase() != 'body' && e != maxNode) {
				e = e.parentNode;
			}
			else {
				return false;
			}
		}
		return e;
	}
	function createSortArrows (index) {
		var arrows = document.createElement('div');
		arrows.className = 'gViz-table-sort-arrows';
		var desc = document.createElement('span');
		desc.className = 'gViz-table-sort-arrows-desc';
		desc.setAttribute('data-column', index);
		desc.appendChild(document.createTextNode('\u25B2'));
		arrows.appendChild(desc);
		var asc = document.createElement('span');
		asc.className = 'gViz-table-sort-arrows-asc';
		asc.setAttribute('data-column', index);
		asc.appendChild(document.createTextNode('\u25BC'));
		arrows.appendChild(asc);
		
		return arrows;
	}
	function clearElement (element) {
		while (element.hasChildNodes()) {
			element.removeChild(element.lastChild);
		}
	}
	function clearRows () {
		if (this.tBody) {
			clearElement(this.tBody);
		}
		if (this.headerTable) {
			clearElement(this.headerTable.querySelector('tbody'));
		}
	}
	function addClassNames (element, classNames) {
		if (typeof(classNames) === 'string') {
			// confirm that the class name is a string
			if (typeof(element.className) === 'string' && element.className !== '') {
				// remove any duplicate classNames
				var classArray = classNames.replace(/^\s+/, '').replace(/\s+$/, '').replace(/\s+/g, ' ').split(' ');
				for (var i = 0; i < classArray.length; i++) {
					removeClassName(element, classArray[i]);
				}
				// add new classes
				element.className += ' ' + classNames;
				// eliminate extra spaces
				element.className = element.className.replace(/^\s+/, '').replace(/\s+$/, '').replace(/\s+/g, ' ');
			}
			else {
				element.className = classNames.replace(/^\s+/, '').replace(/\s+$/, '').replace(/\s+/g, ' ');
			}
		}
	}
	function removeClassName (element, className) {
		if (typeof(className) === 'string' && className !== '' && typeof(element.className) === 'string' && element.className !== '') {
			var regex = new RegExp('(\\s|^)' + className + '(\\s|$)', 'g');
			element.className = element.className.replace(regex, ' ').replace(/\s+/g, ' ').replace(/(^\s)|(\s$)/g, '');
		}
	}
	function setCss (element, css) {
		if (typeof(css) === 'string') {
			cssArray = css.split(';');
			for (var i = 0, tmp; i < cssArray.length; i++) {
				tmp = cssArray[i].split(':');
				if (tmp.length == 2) {
					tmp[0] = tmp[0].replace(/^\s+/, '').replace(/\s+$/, '');
					tmp[1] = tmp[1].replace(/^\s+/, '').replace(/\s+$/, '');
					if (tmp[0].length && tmp[1].length) {
						console.log(element);
						element.style[tmp[0]] = tmp[1];
					}
				}
			}
		}
	}
	function parseColumnGroup (columnInfo) {
		var colspan = 0, depth = 1, temp;
		for (var i = 0; i < columnInfo.headers.length; i++) {
			if (columnInfo.headers[i].type == 'column') {
				colspan++;
			}
			else {
				temp = arguments.callee(columnInfo.headers[i]);
				colspan += temp.colspan;
				depth = Math.max(depth, temp.depth + 1);
			}
		}
		columnInfo.depth = depth;
		columnInfo.colspan = colspan;
		return {depth: depth, colspan: colspan};
	}
	function buildColumnHeaders (columnInfo, columnIndex, row) {
		var cell, node, colgroup, col, attributes;
		for (var i = 0; i < columnInfo.headers.length; i++) {
			if (columnInfo.headers[i].type == 'column') {
				// create <colgroup> and <col> elements
				colgroup = document.createElement('colgroup');
				colgroup.className = 'gViz-table-colgroup';
				this.table.insertBefore(colgroup, this.tHead);
				col = document.createElement('col');
				col.setAttribute('data-column', columnIndex);
				if (!this.options.style.overrideDefault) {
					addClassNames(col, this.defaultOptions.style.classNames.column);
					setCss(col, this.defaultOptions.style.css.column);
				}
				addClassNames(col, this.options.style.classNames.column);
				setCss(col, this.options.style.css.column);
				if (this.options.style.alternatingPattern == 'columns') {
					element = (columnIndex % 2) ? 'evenColumn' : 'oddColumn';
					if (!this.options.style.overrideDefault) {
						addClassNames(col, this.defaultOptions.style.classNames[element]);
						setCss(col, this.defaultOptions.style.css[element]);
					}
					addClassNames(col, this.options.style.classNames[element]);
					setCss(col, this.options.style.css[element]);
				}
				
				if (attributes = this.dataTable.getColumnProperty(columnIndex, 'attributes')) {
					for (var x in attributes) {
						col.setAttribute(x, JSON.stringify(attributes[x]));
					}
				}
				colgroup.appendChild(col);
				
				// add header cell
				cell = document.createElement('th');
				if (!this.options.style.overrideDefault) {
					addClassNames(cell, this.defaultOptions.style.classNames.headerCell);
					setCss(cell, this.defaultOptions.style.css.headerCell);
				}
				addClassNames(cell, this.options.style.classNames.headerCell);
				setCss(cell, this.options.style.css.headerCell);
				addClassNames(cell, this.dataTable.getColumnProperty(columnIndex, 'headerClassName'));
				setCss(cell, this.dataTable.getColumnProperty(columnIndex, 'headerClassName'));
				if (this.options.sort.enabled) {
					addClassNames(cell, 'sortable');
				}
				
				cell.setAttribute('data-column', columnIndex);
				if (columnInfo.depth > 1) {
					cell.rowSpan = columnInfo.depth;
				}
				if (columnInfo.headers[i].label) {
					if (columnInfo.headers[i].htmlLabel) {
						cell.insertAdjacentHTML('afterBegin', columnInfo.headers[i].label);
					}
					else {
						node = document.createTextNode(columnInfo.headers[i].label);
						cell.appendChild(node);
					}
				}
				else {
					if (this.options.allowHtml && this.dataTable.getColumnProperty(columnIndex, 'htmlLabel')) {
						cell.insertAdjacentHTML('afterBegin', this.dataTable.getColumnProperty(columnIndex, 'htmlLabel'));
					}
					else {
						node = document.createTextNode(this.dataTable.getColumnLabel(columnIndex));
						cell.appendChild(node);
					}
				}
				if (this.options.sort.enabled && this.options.sort.showArrows) {
					cell.appendChild(createSortArrows(columnIndex));
				}
				row.appendChild(cell);
				columnIndex++;
			}
			else {
				// add header cell for column group
				cell = document.createElement('th');
				if (!this.options.style.overrideDefault) {
					addClassNames(cell, this.defaultOptions.style.classNames.headerCell);
					setCss(cell, this.defaultOptions.style.css.headerCell);
				}
				addClassNames(cell, this.options.style.classNames.headerCell);
				setCss(cell, this.options.style.css.headerCell);
				addClassNames(cell, columnInfo.headers[i].className);
				setCss(cell, columnInfo.headers[i].css);
				
				if (columnInfo.headers[i].colspan > 1) {
					cell.colSpan = columnInfo.headers[i].colspan;
				}
				if (columnInfo.headers[i].htmlLabel) {
					cell.insertAdjacentHTML('afterBegin', columnInfo.headers[i].label);
				}
				else {
					node = document.createTextNode(columnInfo.headers[i].label);
					cell.appendChild(node);
				}
				row.appendChild(cell);
				
				columnIndex = buildColumnHeaders.apply(this, [columnInfo.headers[i], columnIndex, row.nextSibling]);
			}
		}
		return columnIndex;
	}
	function drawHeader () {
		var row, rows, cell, columnInfo, colgroup, col, columnCount;
		columnCount = this.dataTable.getNumberOfColumns();
		
		if (this.options.headers) {
			// parse the columns option to add structural info on how to construct the headers
			rows = [];
			columnInfo = {headers: this.options.headers};
			parseColumnGroup(columnInfo);
			for (var i = 0; i < columnInfo.depth; i++) {
				rows.push(document.createElement('tr'));
				if (!this.options.style.overrideDefault) {
					addClassNames(rows[i].className, this.defaultOptions.style.classNames.headerRow);
					setCss(rows[i].style, this.defaultOptions.style.css.headerRow);
				}
				addClassNames(rows[i], this.options.style.classNames.headerRow);
				setCss(rows[i], this.options.style.css.headerRow);
				this.tHead.appendChild(rows[i]);
			}
			row = rows[0];
		}
		else {
			row = document.createElement('tr');
			if (!this.options.style.overrideDefault) {
				addClassNames(row, this.defaultOptions.style.classNames.headerRow);
				setCss(row, this.defaultOptions.style.css.headerRow);
			}
			addClassNames(row, this.options.style.classNames.headerRow);
			setCss(row, this.options.style.css.headerRow);
			this.tHead.appendChild(row);
			columnInfo = {headers: [], depth: 1};
			for (var i = 0; i < columnCount; i++) {
				columnInfo.headers.push(i);
			}
		}
		
		if (this.options.rowNumbers.enabled) {
			colgroup = document.createElement('colgroup');
			this.table.insertBefore(colgroup, this.tHead);
			col = document.createElement('col');
			if (!this.options.style.overrideDefault) {
				addClassNames(col, this.defaultOptions.style.classNames.rowNumberColumn);
				setCss(col, this.defaultOptions.style.css.rowNumberColumn);
			}
			addClassNames(col, this.options.style.classNames.rowNumberColumn);
			setCss(col, this.options.style.css.rowNumberColumn);
			colgroup.appendChild(col);
			
			cell = document.createElement('th');
			if (!this.options.style.overrideDefault) {
				addClassNames(cell, this.defaultOptions.style.classNames.headerCell);
				setCss(cell, this.defaultOptions.style.css.headerCell);
			}
			addClassNames(cell, this.options.style.classNames.headerCell);
			setCss(cell, this.options.style.css.headerCell);
			if (columnInfo.depth > 1) {
				cell.rowSpan = columnInfo.depth;
			}
			row.appendChild(cell);
		}
		
		buildColumnHeaders.apply(this, [columnInfo, 0, row]);
	}
	function drawRows () {
		var view, row, cell, element, node, rowCount, columnCount, lastPage, startRow, endRow, rowNumber;
		rowCount = this.dataTable.getNumberOfRows();
		columnCount = this.dataTable.getNumberOfColumns();
		view = new google.visualization.DataView(this.dataTable);
		
		if (this.options.paging.enabled) {
			// check to confirm that startPage and pageSize are both valid
			this.options.paging.startPage = (this.options.paging.startPage >= 0) ? this.options.paging.startPage : this.defaultOptions.paging.startPage;
			this.options.paging.pageSize = (this.options.paging.pageSize > 0) ? this.options.paging.pageSize : this.defaultOptions.paging.pageSize;
			lastPage = Math.ceil(rowCount / this.options.paging.pageSize) - 1;
			
			this.options.paging.startPage = (this.options.paging.startPage > lastPage) ? lastPage : this.options.paging.startPage;
			
			startRow = this.options.paging.startPage * this.options.paging.pageSize;
			endRow = startRow + this.options.paging.pageSize;
			endRow = (endRow > rowCount) ? rowCount : endRow;
		}
		else {
			startRow = 0;
			endRow = rowCount;
		}
		
		if (this.options.sort.enabled && !this.options.sort.custom && this.options.sort.initialColumn !== null) {
			this.sortInfo.sortedIndexes = this.dataTable.getSortedRows([{column: this.options.sort.initialColumn, desc: !this.options.sort.ascending}]);
			view.setRows(this.sortInfo.sortedIndexes);
		}
			
		// add rows to table
		for (var i = startRow; i < endRow; i++) {
			row = document.createElement('tr');
			rowNumber = i + this.options.rowNumbers.firstRowNumber;
			if (this.options.style.alternatingPattern == 'rows') {
				element = (rowNumber % 2) ? 'oddRow' : 'evenRow';
			}
			else {
				element = 'row';
			}
			
			if (!this.options.style.overrideDefault) {
				addClassNames(row, this.defaultOptions.style.classNames[element]);
				setCss(row, this.defaultOptions.style.css[element]);
			}
			addClassNames(row, this.options.style.classNames[element]);
			setCss(row, this.options.style.css[element]);
			addClassNames(row, view.getRowProperty(i, 'className'));
			setCss(row, view.getRowProperty(i, 'css'));
			
			row.setAttribute('data-display-row', i);
			row.setAttribute('data-row', view.getTableRowIndex(i));
			if (attributes = view.getRowProperty(i, 'attributes')) {
				for (var x in attributes) {
					row.setAttribute(x, JSON.stringify(attributes[x]));
				}
			}
			this.tBody.appendChild(row);
			
			if (this.options.rowNumbers.enabled) {
				cell = document.createElement('td');
				if (!this.options.style.overrideDefault) {
					addClassNames(cell, this.defaultOptions.style.classNames.tableCell);
					setCss(cell, this.defaultOptions.style.css.tableCell);
				}
				if (!this.options.style.overrideDefault) {
					addClassNames(cell, this.defaultOptions.style.classNames.rowNumberCell);
					setCss(cell, this.defaultOptions.style.css.rowNumberCell);
				}
				addClassNames(cell, this.options.style.classNames.tableCell);
				setCss(cell, this.options.style.css.tableCell);
				addClassNames(cell, this.options.style.classNames.rowNumberCell);
				setCss(cell, this.options.style.css.rowNumberCell);
				node = document.createTextNode(rowNumber);
				cell.appendChild(node);
				row.appendChild(cell);
			}
			for (var j = 0; j < columnCount; j++) {
				cell = document.createElement('td');
				
				if (!this.options.style.overrideDefault) {
					addClassNames(cell, this.defaultOptions.style.classNames.tableCell);
					setCss(cell, this.defaultOptions.style.css.tableCell);
				}
				addClassNames(cell, this.options.style.classNames.tableCell);
				setCss(cell, this.options.style.css.tableCell);
				
				switch (view.getColumnType(j)) {
					case 'boolean':
						addClassNames(cell, this.options.style.classNames.booleanCell);
						setCss(cell, this.options.style.css.booleanCell);
						break;
					case 'date':
						addClassNames(cell, this.options.style.classNames.dateCell);
						setCss(cell, this.options.style.css.dateCell);
						break;
					case 'datetime':
						addClassNames(cell, this.options.style.classNames.dateTimeCell);
						setCss(cell, this.options.style.css.dateTimeCell);
						break;
					case 'number':
						addClassNames(cell, this.options.style.classNames.numberCell);
						setCss(cell, this.options.style.css.numberCell);
						break;
					case 'string':
						addClassNames(cell, this.options.style.classNames.stringCell);
						setCss(cell, this.options.style.css.stringCell);
						break;
					case 'timeofday':
						addClassNames(cell, this.options.style.classNames.timeOfDayCell);
						setCss(cell, this.options.style.css.timeOfDayCell);
						break;
				}
				addClassNames(cell, view.getProperty(i, j, 'className'));
				setCss(cell, view.getProperty(i, j, 'css'));
				
				cell.setAttribute('data-display-row', i);
				cell.setAttribute('data-row', view.getTableRowIndex(i));
				cell.setAttribute('data-column', j);
				if (attributes = view.getProperty(i, j, 'attributes')) {
					for (var x in attributes) {
						cell.setAttribute(x, JSON.stringify(attributes[x]));
					}
				}
				
				if (this.options.allowHtml) {
					cell.insertAdjacentHTML('afterBegin', view.getFormattedValue(i, j));
				}
				else {
					node = document.createTextNode(view.getFormattedValue(i, j));
					cell.appendChild(node);
				}
				row.appendChild(cell);
			}
			this.setSelection(this.selection);
		}
	}
	function drawFooter () {
	
	}
	function drawPageButtons () {
		var pageDiv, first, previous, pageNumber, next, last, lastPage, rowCount, node, startPagesAt, maxButtonWidth, maxNumberWidth, numbers;
		rowCount = this.dataTable.getNumberOfRows();
		maxButtonWidth = 0;
		maxNumberWidth = 0;
		
		this.headerPageDiv = document.createElement('div');
		this.headerPageDiv.className = 'gViz-table-page';
		// append to headerDiv so we can get dimensions of elements
		// remove later if necessary
		this.headerDiv.appendChild(this.headerPageDiv);
		first = document.createElement('span');
		first.className = 'gViz-table-page-first gradient';
		node = document.createTextNode(this.options.paging.pageButtons.first);
		first.appendChild(node);
		maxButtonWidth = Math.max(maxButtonWidth, first.offsetWidth);
		this.headerPageDiv.appendChild(first);
		previous = document.createElement('span');
		previous.className = 'gViz-table-page-previous gradient';
		node = document.createTextNode(this.options.paging.pageButtons.previous);
		previous.appendChild(node);
		this.headerPageDiv.appendChild(previous);
		maxButtonWidth = Math.max(maxButtonWidth, previous.offsetWidth);
		
		// check to confirm that startPage and pageSize are both valid
		this.options.paging.startPage = (this.options.paging.startPage >= 0) ? this.options.paging.startPage : this.defaultOptions.paging.startPage;
		this.options.paging.pageSize = (this.options.paging.pageSize > 0) ? this.options.paging.pageSize : this.defaultOptions.paging.pageSize;
		lastPage = Math.ceil(rowCount / this.options.paging.pageSize) - 1;
		this.options.paging.startPage = (this.options.paging.startPage > lastPage) ? lastPage : this.options.paging.startPage;
		
		if (this.options.paging.startPage == 0) {
			first.className += ' gViz-table-page-disabled';
			previous.className += ' gViz-table-page-disabled';
		}
		
		// get this.options.paging.maxPageButtons closest pages to startPage
		startPagesAt = this.options.paging.startPage - Math.ceil(this.options.paging.maxPageButtons / 2) + 1;
		if (startPagesAt > lastPage - this.options.paging.maxPageButtons + 1) {
			startPagesAt = lastPage - this.options.paging.maxPageButtons + 1;
		}
		if (startPagesAt < 0) {
			startPagesAt = 0;
		}
		if (startPagesAt > 0) {
			pageNumber = document.createElement('span');
			pageNumber.className = 'gViz-table-page-ellipsis';
			node = document.createTextNode('\u2026');
			pageNumber.appendChild(node);
			this.headerPageDiv.appendChild(pageNumber);
		}
		for (var i = 0, count = Math.min(this.options.paging.maxPageButtons, lastPage + 1); i < count; i++) {
			pageNumber = document.createElement('span');
			pageNumber.className = 'gViz-table-page-number';
			if (i + startPagesAt == this.options.paging.startPage) {
				pageNumber.className += ' gViz-table-page-current gradient';
			}
			pageNumber.setAttribute('data-page', i + startPagesAt);
			node = document.createTextNode(i + startPagesAt + this.options.paging.firstPageNumber);
			pageNumber.appendChild(node);
			this.headerPageDiv.appendChild(pageNumber);
			maxNumberWidth = Math.max(maxNumberWidth, pageNumber.offsetWidth);
		}
		if (startPagesAt + this.options.paging.maxPageButtons <= lastPage) {
			pageNumber = document.createElement('span');
			pageNumber.className = 'gViz-table-page-ellipsis';
			node = document.createTextNode('\u2026');
			pageNumber.appendChild(node);
			this.headerPageDiv.appendChild(pageNumber);
		}
		
		next = document.createElement('span');
		next.className = 'gViz-table-page-next gradient';
		node = document.createTextNode(this.options.paging.pageButtons.next);
		next.appendChild(node);
		this.headerPageDiv.appendChild(next);
		maxButtonWidth = Math.max(maxButtonWidth, next.offsetWidth);
		last = document.createElement('span');
		last.className = 'gViz-table-page-last gradient';
		node = document.createTextNode(this.options.paging.pageButtons.last);
		last.appendChild(node);
		this.headerPageDiv.appendChild(last);
		maxButtonWidth = Math.max(maxButtonWidth, last.offsetWidth);
		
		if (this.options.paging.startPage == lastPage) {
			next.className += ' gViz-table-page-disabled';
			last.className += ' gViz-table-page-disabled';
		}
		
		// set widths of all buttons to maxButtonWidth
		first.style.width = maxButtonWidth + 'px';
		previous.style.width = maxButtonWidth + 'px';
		next.style.width = maxButtonWidth + 'px';
		last.style.width = maxButtonWidth + 'px';
		
		// set widths of all numbers to maxNumberWidth
		numbers = this.headerPageDiv.querySelectorAll('.gViz-table-page-number');
		for (var i = 0; i < numbers.length; i++) {
			numbers[i].style.width = maxNumberWidth + 'px';
		}
		
		if (this.options.paging.buttonLocation == 'footer' || this.options.paging.buttonLocation == 'both') {
			this.footerPageDiv = this.headerPageDiv.cloneNode(true);
			this.footerDiv.appendChild(this.footerPageDiv);
			if (this.options.paging.buttonLocation == 'footer') {
				this.headerDiv.removeChild(this.headerPageDiv);
			}
		}
	}
	function clearPageButtons () {
		if (this.headerPageDiv && this.headerPageDiv.parentNode !== null) {
			this.headerPageDiv.parentNode.removeChild(this.headerPageDiv);
		}
		if (this.footerPageDiv && this.footerPageDiv.parentNode !== null) {
			this.footerPageDiv.parentNode.removeChild(this.footerPageDiv);
		}
	}
	function setTableHeight () {
		var widthDetectDiv;
		
		if (this.options.height || this.container.style.height != '') {
			if (this.options.height) {
				this.mainTableDiv.style.height = (this.options.height - this.headerDiv.offsetHeight - this.footerDiv.offsetHeight) + 'px';
			}
			else {
				this.mainTableDiv.style.height = (this.container.offsetHeight - this.headerDiv.offsetHeight - this.footerDiv.offsetHeight) + 'px';
			}
			this.mainTableDiv.style.overflowY = 'auto';
			// get the table's height
			// may need to use a timeout in case offsetHeight is 0
			// check if table height is greater than container height and create fixed header if necessary
			if (this.table.offsetHeight > this.mainTableDiv.offsetHeight) {
				if (!this.headerTableDiv) {
					this.headerTableDiv = document.createElement('div');
					this.headerTableDiv.style.position = 'absolute';
					this.headerTableDiv.style.top = '0px';
					this.headerTableDiv.style.left = '0px';
					this.headerTableDiv.style.height = this.tHead.offsetHeight + 'px';
					this.headerTableDiv.style.overflow = 'hidden';
					this.headerTableDiv.className = 'gViz-table-header-div';
					this.tableDiv.appendChild(this.headerTableDiv);
				}
				
				widthDetectDiv = document.createElement('div');
				widthDetectDiv.style.width = '100%';
				this.mainTableDiv.appendChild(widthDetectDiv);
				this.headerTableDiv.style.width = widthDetectDiv.offsetWidth + 'px';
				this.mainTableDiv.removeChild(widthDetectDiv);
				
				if (this.headerTable) {
					this.headerTable.removeChild(this.headerTable.querySelector('tbody'))
					this.headerTable.appendChild(this.tBody.cloneNode(true));
				}
				else {
					this.headerTable = this.table.cloneNode(true);
					this.headerTableDiv.appendChild(this.headerTable);
				}
				
				if (!this.events.scroll) {
					this.events.scroll = {
						element: this.mainTableDiv,
						event: 'scroll',
						handler: (function (me) {
							return function () {
								me.headerTableDiv.scrollLeft = me.mainTableDiv.scrollLeft;
							}
						})(this)
					};
					addEventListener(this.events.scroll);
				}
			}
		}
	}
	function throwError (e) {
		var error = document.createElement('span');
		error.className = 'gViz-table-error';
		error.appendChild(document.createTextNode(e));
		if (this.container.firstChild) {
			this.container.insertBefore(error, this.container.firstChild);
		}
		else {
			this.container.appendChild(error);
		}
		google.visualization.events.trigger(this, 'error', e);
	}
	return {
		constructor: gViz.Table,
		draw: function (dt, options) {
			// clear the container div of any existing elements or a previous version of the chart
			this.clearChart();
			
			this.dataTable = dt;
			this.options = {};
			deepExtend(this.options, JSON.parse(JSON.stringify(this.defaultOptions)));
			try {
				deepExtend(this.options, JSON.parse(JSON.stringify(options)));
			}
			catch (e) {
				throwError.apply(this, ['Error parsing options: ' + e]);
				return;
			}
			
			var attributes;
			
			// create sub-container divs for header, table, and footer
			this.headerDiv = document.createElement('div');
			this.headerDiv.className = 'gViz-header-div';
			this.container.appendChild(this.headerDiv);
			this.tableDiv = document.createElement('div');
			this.tableDiv.className = 'gViz-table-div';
			this.tableDiv.style.position = 'relative';
			this.container.appendChild(this.tableDiv);
			this.footerDiv = document.createElement('div');
			this.footerDiv.className = 'gViz-footer-div';
			this.container.appendChild(this.footerDiv);
			
			// create table
			this.mainTableDiv = document.createElement('div');
			this.mainTableDiv.style.position = 'relative';
			this.mainTableDiv.className = 'gViz-table-main-div';
			this.tableDiv.appendChild(this.mainTableDiv);
			this.table = document.createElement('table');
			addClassNames(this.table, this.options.style.classNames.table);
			setCss(this.table, this.options.style.css.table);
			if (attributes = this.dataTable.getTableProperty('attributes')) {
				for (var x in attributes) {
					this.table.setAttribute(x, JSON.stringify(attributes[x]));
				}
			}
			this.mainTableDiv.appendChild(this.table);
			
			// create thead, tbody, tfoot
			this.tHead = document.createElement('thead');
			addClassNames(this.tHead, this.options.style.classNames.tableHeader);
			setCss(this.tHead, this.options.style.css.tableHeader);
			this.table.appendChild(this.tHead);
			this.tFoot = document.createElement('tfoot');
			addClassNames(this.tFoot, this.options.style.classNames.tableFooter);
			setCss(this.tFoot, this.options.style.css.tableFooter);
			this.table.appendChild(this.tFoot);
			this.tBody = document.createElement('tbody');
			addClassNames(this.tBody, this.options.style.classNames.tableBody);
			setCss(this.tBody, this.options.style.css.tableBody);
			this.table.appendChild(this.tBody);
			
			// add header
			drawHeader.apply(this);
			// add data rows
			drawRows.apply(this);
			// add footer
			// need to decide how this is going to work
			// probably need options to control type of footer
			// drawFooter(this);
			
			// add page buttons if paging is enabled
			if (this.options.paging.enabled) {
				drawPageButtons.apply(this);
			}
			
			// set fixed width
			if (this.options.width) {
				this.headerDiv.style.width = this.options.width + 'px';
				this.tableDiv.style.width = this.options.width + 'px';
				this.mainTableDiv.style.width = this.options.width + 'px';
				this.mainTableDiv.style.overflowX = 'auto';
				this.footerDiv.style.width = this.options.width + 'px';
			}
			else if (this.container.style.width != '') {
				// if width is not set in options, check if it is set in inline CSS for container
				// we can't distinguish dimensions applied via other means from those that are derived from other DOM elements
				// eg, setting "width: 400px;" on a class for the container div is indistinguishable from an unstyled container div with a parent div with a width of 400px
				this.headerDiv.style.width = '100%';
				this.tableDiv.style.width = '100%';
				this.mainTableDiv.style.width = '100%';
				this.mainTableDiv.style.overflowX = 'auto';
				this.footerDiv.style.width = '100%';
			}
			this.table.style.width = '100%';
			
			// set fixed height
			setTableHeight.apply(this);
			
			// set initial scroll position
			if (this.options.scrollLeftStartPosition && this.table.offsetWidth > this.mainTableDiv.offsetWidth) {
				this.mainTableDiv.scrollLeft = this.options.scrollLeftStartPosition;
				if (this.headerTableDiv) {
					this.headerTableDiv.scrollLeft = this.options.scrollLeftStartPosition;
				}
			}
			if (this.options.scrollTopStartPosition && this.table.offsetHeight > this.mainTableDiv.offsetHeight) {
				this.mainTableDiv.scrollTop = this.options.scrollTopStartPosition;
			}
			
			// add 'click' event handler for doing selection, sorting, and button clicks
			this.events.click = {
				element: this.container,
				event: 'click',
				handler: (function (me) {
					return function (e) {
						var source, target, targetFound, page, row, column, multiSelect, elements, addSelection;
						targetFound = false;
						source = (e.target || e.srcElement);
						target = (targetFound) ? false : getFirstAncestorByTagName('th', source, me.container);
						if (target && !targetFound) {
							targetFound = true;
							// clicked a header cell
							if (me.options.sort.enabled) {
								column = target.getAttribute('data-column');
								column = (column != null) ? parseInt(column) : null;
								if (column !== null) {
									me.sortInfo.ascending = (column == me.sortInfo.column) ? !me.sortInfo.ascending : true;
									me.sortInfo.column = column;
									if (!me.options.sort.custom) {
										me.options.sort.ascending = me.sortInfo.ascending;
										me.options.sort.initialColumn = column;
										me.options.paging.startPage = 0;
										clearRows.apply(me);
										drawRows.apply(me);
										setTableHeight.apply(me);
										if (me.options.paging.enabled) {
											clearPageButtons.apply(me);
											drawPageButtons.apply(me);
										}
										google.visualization.events.trigger(me, 'ready');
									}
									if (me.options.sort.showArrows) {
										elements = me.container.querySelectorAll('.gViz-table-sort-arrows .disabled');
										for (var i = 0; i < elements.length; i++) {
											removeClassName(elements[i], 'disabled');
										}
										elements = me.container.querySelectorAll(((me.sortInfo.ascending) ? '.gViz-table-sort-arrows-asc' : '.gViz-table-sort-arrows-desc') + '[data-column="' + column + '"]');
										for (var i = 0; i < elements.length; i++) {
											addClassNames(elements[i], 'disabled');
										}
									}
									google.visualization.events.trigger(me, 'sort', me.sortInfo);
								}
							}
						}
						target = (targetFound) ? false : getFirstAncestorByTagName('td', source, me.container);
						if (target && !targetFound) {
							targetFound = true;
							if (me.options.selection.enabled) {
								// clicked a table cell
								row = target.getAttribute('data-row');
								row = (row != null) ? parseInt(row) : null;
								column = target.getAttribute('data-column');
								column = (column != null) ? parseInt(column) : null;
								multiSelect = (e.ctrlKey && me.options.selection.allowMultiSelect);
								if (me.options.selection.element == 'row') {
									addSelection = true;
									for (var i = 0; i < me.selection.length; i++) {
										if (me.selection[i].row == row) {
											addSelection = false;
											me.selection.splice(i, 1);
										}
									}
									if (addSelection) {
										if (multiSelect) {
											me.selection.push({row: row});
										}
										else {
											me.selection = [{row: row}];
										}
									}
									else {
										if (!multiSelect) {
											me.selection = [];
										}
									}
									me.setSelection(me.selection);
								}
								else if (me.options.selection.element == 'column') {
									addSelection = true;
									for (var i = 0; i < me.selection.length; i++) {
										if (me.selection[i].column == column) {
											addSelection = false;
											me.selection.splice(i, 1);
										}
									}
									if (addSelection) {
										if (multiSelect) {
											me.selection.push({column: column});
										}
										else {
											me.selection = [{column: column}];
										}
									}
									else {
										if (!multiSelect) {
											me.selection = [];
										}
									}
									me.setSelection(me.selection);
								}
								else if (me.options.selection.element == 'cell') {
									addSelection = true;
									for (var i = 0; i < me.selection.length; i++) {
										if (me.selection[i].row == row && me.selection[i].column == column) {
											addSelection = false;
											me.selection.splice(i, 1);
										}
									}
									if (addSelection) {
										if (multiSelect) {
											me.selection.push({row: row, column: column});
										}
										else {
											me.selection = [{row: row, column: column}];
										}
									}
									else {
										if (!multiSelect) {
											me.selection = [];
										}
									}
									me.setSelection(me.selection);
								}
								google.visualization.events.trigger(me, 'select', me.selection);
							}
						}
						target = (targetFound) ? false : getFirstAncestorByTagName('span', source, me.container);
						if (target && !targetFound) {
							targetFound = true;
							// check if the span is a page button
							if (target.parentNode.className.match(/(\s|^)gViz-table-page(\s|$)/).length > 0) {
								if (target.className.match(/(\s|^)gViz-table-page-first(\s|$)/) && !target.className.match(/(\s|^)gViz-table-page-disabled(\s|$)/)) {
									// 'first' page button
									me.options.paging.startPage = 0;
								}
								else if (target.className.match(/(\s|^)gViz-table-page-previous(\s|$)/) && !target.className.match(/(\s|^)gViz-table-page-disabled(\s|$)/)) {
									// 'previous' page button
									me.options.paging.startPage = me.options.paging.startPage - 1;
								}
								else if (target.className.match(/(\s|^)gViz-table-page-number(\s|$)/) && !target.className.match(/(\s|^)gViz-table-page-current(\s|$)/)) {
									// 'number' page button
									me.options.paging.startPage = parseInt(target.getAttribute('data-page'));
								}
								else if (target.className.match(/(\s|^)gViz-table-page-next(\s|$)/) && !target.className.match(/(\s|^)gViz-table-page-disabled(\s|$)/)) {
									// 'next' page button
									me.options.paging.startPage = me.options.paging.startPage + 1;
								}
								else if (target.className.match(/(\s|^)gViz-table-page-last(\s|$)/) && !target.className.match(/(\s|^)gViz-table-page-disabled(\s|$)/)) {
									// 'last' page button
									me.options.paging.startPage = Math.ceil(me.dataTable.getNumberOfRows() / me.options.paging.pageSize) - 1;
								}
								else {
									return;
								}
								if (!me.options.paging.custom) {
									clearRows.apply(me);
									drawRows.apply(me);
									setTableHeight.apply(me);
									clearPageButtons.apply(me);
									drawPageButtons.apply(me);
									google.visualization.events.trigger(me, 'ready');
								}
								google.visualization.events.trigger(me, 'page', {page: me.options.paging.startPage});
							}
						}
						google.visualization.events.trigger(me, 'click', e);
					}
				})(this)
			};
			addEventListener(this.events.click);
			
			// add hover events
			this.events.mouseover = {
				element: this.container,
				event: 'mouseover',
				handler: (function (me) {
					return function (e) {
						var source, target, targetFound, row, column, element, elements;
						targetFound = false;
						source = (e.target || e.srcElement);
						target = (targetFound) ? false : getFirstAncestorByTagName('th', source, me.container);
						if (target && !targetFound) {
							targetFound = true;
						}
						target = (targetFound) ? false : getFirstAncestorByTagName('td', source, me.container);
						if (target && !targetFound) {
							targetFound = true;
							if (me.options.hover.enabled) {
								row = parseInt(target.getAttribute('data-display-row'));
								column = parseInt(target.getAttribute('data-column'));
								if (me.options.hover.element == 'row') {
									element = me.tBody.querySelector('tr[data-display-row="' + row + '"]');
									addClassNames(element, me.options.style.classNames.hoverRow);
								}
								else if (me.options.hover.element == 'column') {
									elements = me.tBody.querySelectorAll('td[data-column="' + column + '"]');
									for (var i = 0; i < elements.length; i++) {
										addClassNames(elements[i], me.options.style.classNames.hoverColumn);
									}
								}
								else if (me.options.hover.element == 'cell') {
									addClassNames(target, me.options.style.classNames.hoverCell);
								}
							}
						}
						google.visualization.events.trigger(me, 'mouseover', e);
					}
				})(this)
			};
			addEventListener(this.events.mouseover);
			this.events.mouseout = {
				element: this.container,
				event: 'mouseout',
				handler: (function (me) {
					return function (e) {
						var source, target, row, column, element, elements;
						targetFound = false;
						source = (e.target || e.srcElement);
						target = (targetFound) ? false : getFirstAncestorByTagName('th', source, me.container);
						if (target && !targetFound) {
							targetFound = true;
						}
						target = (targetFound) ? false : getFirstAncestorByTagName('td', source, me.container);
						if (target && !targetFound) {
							targetFound = true;
							row = parseInt(target.getAttribute('data-display-row'));
							column = parseInt(target.getAttribute('data-column'));
							if (me.options.style.hover == 'row') {
								element = me.tBody.querySelector('tr[data-display-row="' + row + '"]');
								removeClassName(element, me.options.style.classNames.hoverRow);
							}
							else if (me.options.style.hover == 'column') {
								elements = me.tBody.querySelectorAll('td[data-column="' + column + '"]');
								for (var i = 0; i < elements.length; i++) {
									removeClassName(elements[i], me.options.style.classNames.hoverColumn);
								}
							}
							else if (me.options.style.hover == 'cell') {
								removeClassName(target, me.options.style.classNames.hoverCell);
							}
						}
						google.visualization.events.trigger(me, 'mouseout', e);
					}
				})(this)
			};
			addEventListener(this.events.mouseout);
			
			// trigger 'ready' event
			this.ready = true;
			google.visualization.events.trigger(this, 'ready');
		},
		getSelection: function () {
			return deepExtend([], this.selection);
		},
		getSortInfo: function () {
			return this.sortInfo;
		},
		setSelection: function (selection) {
			if (this.options.selection.enabled) {
				this.selection = selection;
				var element, elements;
				if (this.options.selection.element == 'row') {
					elements = this.tBody.querySelectorAll('.' + this.options.style.classNames.selectedRow);
					for (var i = 0; i < elements.length; i++) {
						removeClassName(elements[i], this.options.style.classNames.selectedRow);
					}
					
					for (var i = 0; i < this.selection.length; i++) {
						element = this.tBody.querySelector('tr[data-row="' + this.selection[i].row + '"]');
						if (element) {
							addClassNames(element, this.options.style.classNames.selectedRow);
						}
					}
				}
				else if (this.options.selection.element == 'column') {
					elements = this.tBody.querySelectorAll('.' + this.options.style.classNames.selectedColumn);
					for (var i = 0; i < elements.length; i++) {
						removeClassName(elements[i], this.options.style.classNames.selectedColumn);
					}
					for (var i = 0; i < this.selection.length; i++) {
						elements = this.tBody.querySelectorAll('td[data-column="' + this.selection[i].column + '"]');
						for (var j = 0; j < elements.length; j++) {
							addClassNames(elements[j], this.options.style.classNames.selectedColumn);
						}
					}
				}
				else if (this.options.selection.element == 'cell') {
					elements = this.tBody.querySelectorAll('.' + this.options.style.classNames.selectedCell);
					for (var i = 0; i < elements.length; i++) {
						removeClassName(elements[i], this.options.style.classNames.selectedCell);
					}
					for (var i = 0; i < this.selection.length; i++) {
						element = this.tBody.querySelector('td[data-row="' + this.selection[i].row + '"][data-column="' + this.selection[i].column + '"]');
						if (element) {
							addClassNames(element, this.options.style.classNames.selectedCell);
						}
					}
				}
			}
		},
		clearChart: function () {
			// clear selection
			this.selection = [];
			
			// remove event listeners
			for (var x in this.events) {
				removeEventListener(this.events[x]);
				delete this.events[x];
			}
			
			// remove child elements
			while (this.container.hasChildNodes()) {
				this.container.removeChild(this.container.lastChild);
			}
			
			// clear everything except container and defaultOptions
			this.options = {};
			this.events = {};
			this.selection = [];
			this.sortInfo = {
				ascending: true,
				column: null,
				sortedIndexes: []
			};
			this.masterDiv = null;
			this.headerDiv = null;
			this.tableDiv = null;
			this.footerDiv = null;
			this.mainTableDiv = null;
			this.headerTableDiv = null;
			this.table = null;
			this.headerTable = null;
			this.tHead = null;
			this.tBody = null;
			this.tFoot = null;
		}
	};
})();