/*#
 *#  SortTable
 *#  version 2
 *#  7th April 2007
 *#  Stuart Langridge, http://www.kryogenix.org/code/browser/sorttable/
 *#
 *#  Instructions:
 *#  Download this file
 *#  Add class="sortable" to any table you would like to make sortable
 *#  Click on the headers to sort
 *#
 *#  Thanks to many, many people for contributions and suggestions.
 *#  Licenced as X11: http://www.kryogenix.org/code/browser/licence.html
 *#  This basically means: do what you want with it.
 *#*/

var stIsIE = /*@cc_on!@*/false;

var stCollapseWorks = (navigator.product == "Gecko" &&
		       navigator.productSub &&
		       navigator.productSub > "20041010" &&
		       (navigator.userAgent.indexOf("rv:1.8") != -1 ||
		        navigator.userAgent.indexOf("rv:1.9") != -1));

var stTextContentWorks = 0;

sorttable = {
  init: function() {
    //# quit if this function has already been called
    if (arguments.callee.done) return;
    //# flag this function so we do not do the same thing twice
    arguments.callee.done = true;
    //# kill the timer
    if (_timer) clearInterval(_timer);

    if (!document.createElement || !document.getElementsByTagName) return;

    sorttable.DATE_RE = /^(\d\d?\d?\d?)[\/\.-](\d\d?)[\/\.-]((\d\d)?\d\d)$/;

    //# For auto-sort tables, do not use hideable and no_sortbottom features.
    forEach(document.getElementsByTagName('table'), function(table) {
      if (table.className.search(/\bsortable\b/) != -1) {
        sorttable.makeSortable(table);
      } else if (table.className.search(/\bpresortable\b/) != -1) {
        sorttable.makePreSortable(table);
      }
    });

  },

  initShadowCols : function(ttable, col, cell) {
    sorttable.initShadowRows(ttable);
    var shadowRows = ttable.shadowRows;
    var ncells = ttable.colWidth;
    if (ttable.shadowCreated[col]) return;
    var rows = shadowRows.length;
    if (! shadowRows[0].shadowCells) {
      for (var i = 0; i < rows; i++) {
	var row = shadowRows[i];
	var shadowCells = [];
	shadowCells.length = ncells;
	row.shadowCells = shadowCells;
      }
    }

    var next_shadow_idx = null;
    var hr = shadowRows[0].cells;
    if (shadowRows[0].shadowCells[col+1])
      next_shadow_idx = col+1;

    for (var i = 0; i < rows; i++) {
      var row = shadowRows[i];
      var me = row.cells.item(cell)
      row.shadowCells[col] = me;
      if (col < ncells - 1) {
	if (next_shadow_idx)
	  me.nextCell = shadowRows[i].shadowCells[next_shadow_idx];
	else
	  me.nextCell = row.cells.item(cell+1);
      }
    }
    ttable.shadowCreated[col] = true;
  },

  countRows : function(ttable) {
    var obj = ttable.firstChild;
    var count = 0;
    while (obj) {
      if (obj.nodeName == "THEAD" || obj.nodeName == "TBODY" || obj.nodeName == "TFOOT") {
	var xobj = obj.firstChild;
	while (xobj) {
          if (xobj.nodeName == "TR") {
	    xobj.sorttableType = obj.nodeName;
	    count++;
	  }
	  xobj = xobj.nextSibling;
	}
      }
      obj = obj.nextSibling;
    }
    return count;
  },

  copyRows : function(ttable, dest) {
    var rows = ttable.rows;
    var count = rows.length;
    var invalidRows = 0;
    for (var i = 0; i < count; i++) {
      var obj = rows[i];
      if (obj.sorttableType != "THEAD" && obj.sorttableType != "TBODY") {
	obj.invalidRow = true;
	invalidRows++;
      } else {
	obj.invalidRow = false;
      }
      dest[i] = rows[i];
      obj.sorttableTable = ttable;
    }
    ttable.invalidRows = invalidRows;
  },

  initShadowRows : function(ttable) {
    if (ttable.shadowIsSetup) return;
    var shadowRows = [];
    shadowRows.length = sorttable.countRows(ttable);
    sorttable.copyRows(ttable, shadowRows);
    ttable.columnMap = [];
    ttable.columnMap.length = ttable.rows[0].cells.length;
    for (var i = 0; i < ttable.colWidth; i++)
      ttable.columnMap[i] = i;
    ttable.shadowRows = shadowRows;
    ttable.shadowCols = [];
    ttable.shadowCreated = [];
    ttable.shadowCreated.length = ttable.colWidth;
    for (var c = 0; c < ttable.childNodes.length; c++) {
      if (ttable.childNodes[c].nodeName == "COL") {
	ttable.shadowCols.push(ttable.childNodes[c]);
      }
    }
    ttable.shadowIsSetup = true;
    sorttable.initIndex(ttable);
  },

  getRowCell : function(table, row, cell) {
    return (table.shadowCreated && table.shadowCreated[cell] ?
	    table.rows[row].shadowCells[cell] :
	    (table.columnMap ?
	     table.rows[row].cells.item(table.columnMap[cell]) :
	     table.rows[row].cells.item(cell)));
  },

  getColCount : function(table) {
    return table.colWidth;
  },

  getCell : function(row, cell) {
    var table = row.sorttableTable;
    return (table && table.shadowCreated && table.shadowCreated[cell] ?
	    row.shadowCells[cell] :
	    (table && table.columnMap ?
	     row.cells.item(table.columnMap[cell]) :
	     row.cells.item(cell)));
  },

  getAllRows : function(table) {
    return table.shadowIsSetup ? table.shadowRows : table.rows;
  },

  getAllCols : function(table) {
    sorttable.initShadowRows(table);
    return table.shadowCols;
  },

  clearSelection : function(ttable) {
    var sel = window.getSelection();
    sel.removeAllRanges();
    for (var c = 0; c < ttable.childNodes.length; c++) {
      if (ttable.childNodes[c].nodeName == "COL") {
	  ttable.childNodes[c].requestSelected = 0;
      }
    }
  },

  doHideFast: function(t, shadowOnly) {
    if (t.sorttableIsHidden) return;
    var ttable = t.parentNode.parentNode.parentNode;
    var col_id = "col_" + t.id;
    for (var c = 0; c < ttable.childNodes.length; c++) {
      if (ttable.childNodes[c].nodeName == "COL" &&
	  ttable.childNodes[c].id == col_id) {
	ttable.childNodes[c].style.visibility = "collapse";
	t.sorttableToBeHidden = true;
	return;
      }
    }
  },

  syncColumns: function(ttable, shadowOnly) {
    var hr = ttable.rows[0].cells;
    sorttable.initShadowRows(ttable);
    var shadow = ttable.shadowRows;
    var length = shadow.length;
    var columnsHidden = 0;
    for (var i = hr.length - 1; i >= 0; i--) {
      var t = hr.item(i);
      if (t.sorttableToBeHidden) {
	var cellIndex = t.cellIndex;
	var colIndex = t.sorttable_columnindex;
	sorttable.initShadowCols(ttable, colIndex, cellIndex);
	sorttable.removeTbody(ttable);
	var col_id = "col_" + t.id;
	t.sorttableToBeHidden = false;
	t.sorttableIsHidden = true;
	for (var c = 0; c < ttable.childNodes.length; c++) {
	  var col = ttable.childNodes[c];
	  if (col.nodeName == "COL" && col.id == col_id) {
	    ttable.removeChild(col);
	    col.style.visibility = "";
	    break;
	  }
	}
	for (var j = 0; j < length; j++) {
	  var row = shadow[j];
	  row.removeChild(row.cells[cellIndex]);
	}
	columnsHidden++;
      }
    }
    if (columnsHidden > 0) {
      ttable.columnsHidden = true;
      for (i = 0; i < ttable.columnMap.length; i++)
	ttable.columnMap[i] = null;
      for (i = 0; i < hr.length; i++)
	ttable.columnMap[hr.item(i).sorttable_columnindex] = i;
      if (! shadowOnly) sorttable.repopulateTable(ttable, true);
    }
  },

  doDoHide: function(t, shadowOnly) {
    if (t.sorttableIsHidden || t.sorttableToBeHidden) return;
    var ttable = t.parentNode.parentNode.parentNode;
    sorttable.clearSelection(ttable);
    if (stCollapseWorks && ! ttable.tbodyRemoved) {
      sorttable.doHideFast(t, shadowOnly);
    } else {
      t.sorttableToBeHidden = true;
      sorttable.syncColumns(ttable, shadowOnly);
    }
    ttable.columnsHidden = true;
  },

  selectSelectedColumns : function(ttable) {
    var sel = window.getSelection();
    sel.removeAllRanges();
    sorttable.syncColumns(ttable, false);
    var selectedCols = [];
    var xc = 0;
    for (var c = 0; c < ttable.childNodes.length; c++) {
      if (ttable.childNodes[c].nodeName == "COL") {
	if (ttable.childNodes[c].requestSelected) selectedCols.push(xc);
	xc++;
      }
    }
    if (selectedCols.length > 0) {
      for (var i = 0; i < ttable.rows.length; i++) {
	var row = ttable.rows[i];
	if (row.style.visibility == "collapse") continue;
	if (row.style.display == "none") continue;
	if (row.id.match(/^fltrow_basic_/)) continue;
	if (row.id.match(/^fltrow_advanced_/)) continue;
	for (var j = 0; j < selectedCols.length; j++) {
	  var range = document.createRange();
	  range.selectNode(row.cells[selectedCols[j]]);
	  sel.addRange(range);
	}
      }
    }
  },

  doDoSelectColumn : function(t, shadowOnly) {
    var ttable = t.parentNode.parentNode.parentNode;
    var sel = window.getSelection();
    sel.removeAllRanges();
    sorttable.syncColumns(ttable, false);
    var col_id = "col_" + t.id;
    var col = -1;
    var xc = 0;
    for (var c = 0; c < ttable.childNodes.length; c++) {
      if (ttable.childNodes[c].nodeName == "COL" &&
	  ttable.childNodes[c].id == col_id) {
	  ttable.childNodes[c].requestSelected =
	      ttable.childNodes[c].requestSelected ? 0 : 1;
	  break;
      }
      if (ttable.childNodes[c].nodeName == "COL") xc++;
    }
    sorttable.selectSelectedColumns(ttable);
  },

  doShowAllColumns: function(ttable, shadowOnly) {
    if (! ttable.columnsHidden) return;
    if (ttable.shadowCols) {
      for (var c = 0; c < ttable.shadowCols.length; c++) {
	ttable.shadowCols[c].style.visibility = "";
	ttable.appendChild(ttable.shadowCols[c]);
      }
    } else {
      for (var c = 0; c < ttable.childNodes.length; c++) {
	if (ttable.childNodes[c].nodeName == "COL") {
	  ttable.childNodes[c].style.visibility = "";
	}
      }
    }
    try {
      var sel = window.getSelection();
      sel.removeAllRanges();
    } catch(e) {}
    var hidden = [];
    var cols = ttable.colWidth;
    for (var c = 0; c < cols; c++) {
      var cell = sorttable.getRowCell(ttable, 0, c);
      cell.sorttableToBeHidden = false;
      if (cell.sorttableIsHidden) {
	hidden.push(c);
	cell.sorttableIsHidden = false;
      }
    }
    var rows = ttable.shadowRows;
    if (rows) {
      var nRows = rows.length;
      var hiddenLength = hidden.length;
      if (hiddenLength > 0) {
	sorttable.removeTbody(ttable);
	for (var i = 0; i < nRows; i++) {
	  var row = rows[i];
	  var shadow = row.shadowCells;
	  for (var j = hiddenLength - 1; j >= 0; j--) {
	    var jj = hidden[j];
	    if (jj == cols - 1)
	      row.appendChild(shadow[jj]);
	    else
	      row.insertBefore(shadow[jj], shadow[jj].nextCell);
	  }
	}
	if (! shadowOnly) sorttable.repopulateTable(ttable, true);
      }
    }
    for (i = 0; i < ttable.columnMap.length; i++)
      ttable.columnMap[i] = i;
    ttable.columnsHidden = false;
  },

  removeTags: function(theadrow, name) {
    var j, k;
    for (j = 0; j < theadrow.childNodes.length; j++) {
      var x = theadrow.childNodes[j];
      for (k = 0; k < x.childNodes.length; k ++) {
	if (x.childNodes[k].id == name) {
	  x.removeChild(x.childNodes[k]);
	}
      }
    }
  },

  addBody: function(table, newBody) {
    var start = 0;
    while (newBody.className.match(/\bfltrow/))
      start++;
    for (var i = 0; i < table.childNodes.length; i++) {
      if (table.childNodes[i].nodeName == "TBODY") {
	table.replaceChild(newBody, table.childNodes[i]);
	break;
      }
    }
    table.tbodyRemoved = false;
    var headrow = table.tHead.rows[0].cells;
    for (var i=0; i < headrow.length; i++) {
      headrow[i].sorttable_tbody = table.tBodies[start];
    }
  },

  removeTbody: function(ttable) {
    if (ttable.tbodyRemoved) return;
    for (var i = 0; i < ttable.childNodes.length; i++) {
      if (ttable.childNodes[i].nodeName == "TBODY") {
	ttable.tbodyRemoved = true;
	//# It is (a little) faster to replace the tbody with an empty
	//# one than to remove it.  About 20~25% improvement for
	//# repopulateTable; maybe 10% for typical sort ops.
	ttable.replaceChild(document.createElement("tbody"), ttable.childNodes[i]);
      }
    }
  },

  adviseShowAll: function(ttable, showAll) {
    ttable.showAllNext = showAll;
  },

  repopulateTable: function(ttable, alternateBgs, all) {
    sorttable.initShadowRows(ttable);
    sorttable.removeTbody(ttable);
    var j = 1;
    var nbody = document.createElement("tbody");
    var rows = ttable.shadowRows;
    var length = rows.length;
    var hr = ttable.rows[0].cells;
    all |= ttable.showAllNext;

    var fixedIndices = ttable.curIndexFixed;
    var idx_cols = [];
    for (var k = 0; k < hr.length; k++) {
      var c = hr[k];
      if (c.className.match(/\bsorttable_index\b/)) {
        idx_cols.push(k);
      }
    }
    for (var k = 1; k < length; k++) {
      var r = rows[k];
      if (r.className.match(/\bfltrow/)) {
	nbody.appendChild(r);
      } else if (! r.invalidRow && (all || ! r.hidden)) {
	if (!fixedIndices) {
	  for (var l = 0; l < idx_cols.length; l++) {
	    r.cells[l].innerHTML = j;
	    r.cells[l].textCached = false;
	  }
	} else if (fixedIndices != ttable.prevIndexFixed) {
	  for (var l = 0; l < idx_cols.length; l++) {
	    r.cells[l].innerHTML = r.cells[l].indexHtml;
	    r.cells[l].textCached = false;
	  }
	}
        j++;
        if (alternateBgs) {
          if (j % 2 == 1)
            r.className = r.className.replace(/\bodd\b/,'even');
          else
            r.className = r.className.replace(/\beven\b/,'odd');
        }
	r.validRow = true;
	r.hidden = false;
        nbody.appendChild(r);
      }
    }
    ttable.prevIndexFixed = fixedIndices;
    ttable.showAllNext = false;
    sorttable.addBody(ttable, nbody);
  },

  initIndex : function(ttable) {
    if (ttable.indexInitialized) return;
    sorttable.initShadowRows(ttable);
    rows = ttable.shadowRows;
    var start = 1;
    var row_count = rows.length;
    var hr = ttable.rows[0].cells;
    var idx_cols = [];
    for (var k = 0; k < hr.length; k++) {
      var c = hr[k];
      if (c.className.match(/\bsorttable_index\b/)) {
        idx_cols.push(k);
      }
    }

    while (rows[start].className.match(/\bfltrow/)) start++;
    if (idx_cols.length) {
      for (var j = start; j < row_count; j++) {
	var r = rows[j]
	r.sortIndex = j;
	for (var l = 0; l < idx_cols.length; l++) {
	  r.cells[l].indexHtml = sorttable.getInnerTextInternal(r.cells[l]);
	}
      }
    }
    ttable.indexInitialized = true;
  },

  doDoDoSort: function(tab, shadowOnly, forceForward) {

    //# column header
    //# header row
    //# table
    var ttable = tab.parentNode.parentNode.parentNode;
    var theadrow = tab.parentNode;
    var j, k;
    sorttable.initShadowRows(ttable);
    var isIndex = (tab.className.search(/\bsorttable_index\b/) != -1);
    sorttable.removeTbody(ttable);
    if (tab.className.search(/\bsorttable_sorted\b/) != -1) {
      //# if we are already sorted by this column, just
      //# reverse the table, which is quicker
      if (forceForward) return;
      sorttable.reverse(ttable, tab.cellIndex, isIndex, shadowOnly);
      tab.className = tab.className.replace('sorttable_sorted',
					    'sorttable_sorted_reverse');
      sorttable.removeTags(theadrow, "sorttable_sortfwdind");
      sortrevind = document.createElement('span');
      sortrevind.id = "sorttable_sortrevind";
      sortrevind.innerHTML = '&darr;';
      tab.appendChild(sortrevind);
      if (! isIndex) {
	for (j = 0; j < ttable.sortList.length; j++) {
	  if (ttable.sortList[j] == tab.id || ttable.sortList[j] == '-' + tab.id) {
	    ttable.sortList.splice(j, 1);
	    break;
	  }
	}
      }
      ttable.sortList.push('-' + tab.id);
      return;
    } else if (tab.className.search(/\bsorttable_sorted_reverse\b/) != -1) {
      //# if we are already sorted by this column in reverse, just
      //# re-reverse the table, which is quicker
      sorttable.reverse(ttable, tab.cellIndex, isIndex, shadowOnly);
      tab.className = tab.className.replace('sorttable_sorted_reverse',
					    'sorttable_sorted');
      sorttable.removeTags(theadrow, "sorttable_sortrevind");
      if (! isIndex) {
	sortfwdind = document.createElement('span');
	sortfwdind.id = "sorttable_sortfwdind";
        sortfwdind.innerHTML = '&uarr;';
	for (j = 0; j < ttable.sortList.length; j++) {
	  if (ttable.sortList[j] == tab.id || ttable.sortList[j] == '-' + tab.id) {
	    ttable.sortList.splice(j, 1);
	    break;
	  }
	}
	tab.appendChild(sortfwdind);
	ttable.sortList.push(tab.id);
      } else {
        ttable.sortList.splice(0, ttable.sortList.length);
      }
      return;
    }

    //# remove sorttable_sorted classes
    forEach(theadrow.childNodes, function(cell) {
      if (cell.nodeType == 1) { //# an element
	cell.className = cell.className.replace('sorttable_sorted_reverse','');
	cell.className = cell.className.replace('sorttable_sorted','');
      }
    });
    sorttable.removeTags(theadrow, "sorttable_sortrevind");
    sorttable.removeTags(theadrow, "sorttable_sortfwdind");

    //# build an array to sort. This is a Schwartzian transform thing,
    //# i.e., we "decorate" each row with the actual sort key,
    //# sort based on the sort keys, and then put the rows back in order
    //# which is a lot faster because you only do getInnerText once per row
    //#
    //# We can do even better than that; we can cache the sort key so that
    //# future sorts are faster.
    row_array = [];
    col = tab.cellIndex;
    rows = ttable.shadowRows;
    var start = 1;
    while (rows[start].className.match(/\bfltrow/))
       start++;
    row_array.length = rows.length - start;
    var sort_index = (tab.sorttable_sortfunction == sorttable.sort_index);
    var sort_numeric = (tab.sorttable_sortfunction == sorttable.sort_numeric);
    var sort_ddmm = (tab.sorttable_sortfunction == sorttable.sort_ddmm);
    var sort_mmdd = (tab.sorttable_sortfunction == sorttable.sort_mmdd);
    var row_count = rows.length;
    if (ttable.tFoot) {
      row_count -= ttable.tFoot.rows.length;
      row_array.length = row_array.length - ttable.tFoot.rows.length;
    }
    sorttable.initIndex(ttable);
    for (var j=start; j < row_count; j++) {
      var text;
      var row = rows[j];
      if (sort_index) {
	row_array[j - start] = [ row, j - start, row.sortIndex ];
      } else {
	var cell = row.cells[col];
	var cachedNum;
	if (sort_numeric || sort_ddmm || sort_mmdd) {
	  if (! cell.cachedN) {
	    var text = sorttable.getInnerText(cell);
	    cell.cachedText = text;
	    if (text != '') {
	      if (sort_numeric) {
		cachedNum = parseFloat(text);
	      } else {
		var mtch = text.match(sorttable.DATE_RE);
		var yr = mtch[3];
		var mo;
		var da;
		if (sort_ddmm) {
		  mo = mtch[2];
		  da = mtch[1];
		} else {
		  mo = mtch[1];
		  da = mtch[2];
		}
		if (mo.length == 1) mo = '0'+mo;
		if (da.length == 1) da = '0'+da;
		if      (parseInt(yr) < 30)  yr = '20'+yr;
		else if (parseInt(yr) < 100) yr = '19'+yr;
		cachedNum = parseInt(yr + mo + da);
	      }
	    } else {
	      cachedNum = -999999999;
	    }
	    cell.cachedNum = cachedNum;
	    cell.cachedN = true;
	  } else {
	    cachedNum = cell.cachedNum;
	  }
	  //# Use the row index itself as a secondary key to get a stable sort
	  row_array[j - start] = [ row, j - start, cell.cachedNum ];
	} else {
	  var cachedText;
	  if (! cell.cached) {
	    cachedText = sorttable.getInnerText(cell);
	    cell.cached = true;
	    cell.cachedText = cachedText;
	  } else {
	    cachedText = cell.cachedText;
	  }
	  row_array[j - start] = [ row, j - start, cachedText ];
	}
      }
    }
    row_array.sort(tab.sorttable_sortfunction);

    row_count = row_array.length;
    for (var j=0; j < row_count; j++)
      rows[j + start] = row_array[j][0];

    if (! shadowOnly) sorttable.repopulateTable(ttable, true);

    tab.className += ' sorttable_sorted';
    if (! isIndex) {
      sortfwdind = document.createElement('span');
      sortfwdind.id = "sorttable_sortfwdind";
      sortfwdind.innerHTML = '&darr;';
      for (j = 0; j < ttable.sortList.length; j++) {
	if (ttable.sortList[j] == tab.id || ttable.sortList[j] == '-' + tab.id) {
	  ttable.sortList.splice(j, 1);
	  break;
	}
      }
      tab.appendChild(sortfwdind);
      ttable.sortList.push(tab.id);
    } else {
      ttable.sortList.splice(0, ttable.sortList.length);
    }

    delete row_array;
  },

  doDoSort: function(tab, shadowOnly, forceForward) {
    sorttable.doDoDoSort(tab, shadowOnly, forceForward);
    var ttable = tab.parentNode.parentNode.parentNode;
    var good = false;
    for (var i = 0; i < ttable.sortList.length; i++) {
      if (ttable.sortList[i] != '' && ttable.sortList[i] != '-') {
	good = true;
	break;
      }
    }
    if (!good) return;
    var theadrow = tab.parentNode;
    sorttable.removeTags(theadrow, "sorttable_sortfwdind");
    sorttable.removeTags(theadrow, "sorttable_sortrevind");
    if (!ttable.sortList || ttable.sortList.length <= 0) return;
    for (var i = 0; i < ttable.sortList.length; i++) {
      var col = ttable.sortList[i];
      var forward = 1;
      if (col.match(/^-/)) {
	forward = 0;
	col = col.replace(/^-/, '');
      }
      for (var j = 0; j < theadrow.childNodes.length; j++) {
	var cell = theadrow.childNodes[j];
	if (cell.id == col) {
	  sortind = document.createElement('span');
	  var idx = ttable.sortList.length - i;
	  if (forward) {
	    sortind.id = "sorttable_sortfwdind";
	    sortind.innerHTML = '&darr;<' + 'sub>' + idx + '<\/sub>';
	  } else {
	    sortind.id = "sorttable_sortrevind";
	    sortind.innerHTML = '&uarr;<' + 'sup>' + idx + '<\/sup>';
	  }
	  cell.appendChild(sortind);
	  break;
	}
      }
    }
  },

  doFix: function(ttable, fix, shadowOnly) {
    if (ttable.curIndexFixed == fix) return;
    sorttable.initShadowRows(ttable);
    sorttable.removeTbody(ttable);
    ttable.curIndexFixed = fix;
    if (ttable.toggleFixButton)
      ttable.toggleFixButton.value = fix ? "Show sequential indices" : "Show fixed indices";
    if (! shadowOnly) sorttable.repopulateTable(ttable, true);
  },

  doFixOnly: function(ttable, fix) {
    if (ttable.curIndexFixed == fix) return;
    sorttable.initShadowRows(ttable);
    ttable.curIndexFixed = fix;
    if (ttable.toggleFixButton)
      ttable.toggleFixButton.value = fix ? "Show sequential indices" : "Show fixed indices";
  },

  isFixedIndex: function(ttable) {
    if (ttable.curIndexFixed)
      return true;
    else
      return false;
  },

  toggleFixedIndex: function(button, shadowOnly) {
    if (!button.Table) return;
    var ttable = button.Table;
    if (sorttable.isFixedIndex(ttable)) {
      sorttable.doFix(ttable, false, shadowOnly);
    } else {
      sorttable.doFix(ttable, true, shadowOnly);
    }
  },

  doSort: function(e) {
    var hideable = this.parentNode.parentNode.parentNode.hideable;
    var isIndex = (this.className.search(/\bsorttable_index\b/) != -1);
    if ((e.metaKey && e.altKey) || e.ctrlKey && (e.metaKey || e.altKey)) {
	if (isIndex) {
	    var ttable = this.parentNode.parentNode.parentNode;
	    sorttable.doFix(ttable, !ttable.curIndexFixed, false);
	} else {
	    sorttable.doDoSelectColumn(this, false);
	}
    } else if (hideable && (e.ctrlKey || e.metaKey))
	sorttable.doDoHide(this, false);
    else
	sorttable.doDoSort(this, false);
  },

  doPreSort: function(e) {
    var table = this.parentNode.parentNode.parentNode;
    sorttable.makeSortable(table, table.hideable, table.no_sortbottom);
    sorttable.doSort(e);
  },

  rowNeedsExpansion: function(parent, row, leftover, width) {
    if (leftover != undefined) {
      for (var i = 0; i < leftover.length; i++) {
	if (leftover[i] > 0)
	  return 1;
      }
    }
    for (var i = 0; i < parent[row].cells.length; i++) {
      if (parent[row].cells[i].colSpan > 1 ||
	  parent[row].cells[i].rowSpan > 1)
	return 1;
    }
    if (width > 0 && parent[row].cells.length != width)
      return 1;
    return 0;
  },

  expandRow: function(parent, row, leftover, width, rownum) {
    if (!sorttable.rowNeedsExpansion(parent, row, leftover, width)) return "";
    var cr = parent[row].cells;
    var msg = "";
    var missingCells = 0;
    var extraCells = 0;
    var nrow = [];
    if (row == 0) {
      var k = 0;
      if (leftover != undefined)
	leftover.length = 0;
      for (var i = 0; i < cr.length; i++) {
	var c = cr[i];
	var rs = c.rowSpan;
	c.rowSpan = 1;
	nrow.push[c];
	if (leftover != undefined)
	  leftover.push(rs - 1);
	k++;
	if (c.colSpan > 1) {
	  for (var j = 0; j < c.colSpan - 1; j++) {
	    var nc = c.cloneNode(true);
	    nc.colSpan = 1;
	    nc.rowSpan = 1;
	    if (width < 0 || ncells < width) {
	      nrow.push(nc);
	      ncells++;
	      if (leftover != undefined && rs > 1)
		leftover.push(rs - 1);
	      k++;
	    } else {
	      extraCells++;
	    }
	  }
	  c.colSpan = 1;
	}
      }
      if (width > 0) {
	if (k < width) {
	  missingCells = width - k;
	  for (; k < width; k++) {
	    var nc = cr[k-1].cloneNode(false);
	    nc.innerHTML = "&nbsp;";
	    parent[row].appendChild(nc);
	  }
	} else if (k > width) {
	  extraCells = k - width;
	  for (; k > width; k--)
	    parent[row].removeChild(cr[k-1]);
	}
      }
    } else {
      var i = 0;
      var ncells = 0;
      var maxCells = parent[row-1].cells.length;
      if (width > 0 && maxCells > width) {
	extraCells = maxCells - width;
	maxCells = width;
      }
      for (var k = 0; k < maxCells; k++) {
	if (leftover[k] > 0) {
	  var c = parent[row-1].cells[k];
	  var nc = c.cloneNode(true);
	  nc.rowSpan = 1;
	  nc.colSpan = 1;
	  if (width < 0 || ncells < width) {
	    nrow.push(nc);
	    ncells++;
	  } else {
	    extraCells++;
	  }
	  leftover[k]--;
	} else {
	  var c = cr[i++];
	  if (!c) {
	    c = cr[cr.length-1].cloneNode(false);
	    c.innerHTML = "&nbsp;";
	    missingCells++;
	  }
	  var rs = c.rowSpan;
	  c.rowSpan = 1;
	  if (width < 0 || ncells < width) {
	    nrow.push(c);
	    ncells++;
	  } else {
	    extraCells++;
	  }
	  if (leftover != undefined)
	    leftover[k] = rs - 1;
	  if (c.colSpan > 1) {
	    for (var j = 0; j < c.colSpan - 1; j++) {
	      var nc = c.cloneNode(true);
	      nc.colSpan = 1;
	      nc.rowSpan = 1;
	      if (width < 0 || ncells < width) {
		nrow.push(nc);
		ncells++;
		if (rs > 1 && leftover != undefined)
		  leftover[k] = rs - 1;
		k++;
	      } else {
		extraCells++;
	      }
	    }
	    c.colSpan = 1;
	  }
	}
      }
    }
    for (var k = 0; k < nrow.length; k++)
      parent[row].appendChild(nrow[k]);
    if (width > 0 && width < parent[row].cells.length) {
      var xs = parent[row].cells.length - width;
      // At this point, any extra cells are at the start of the row,
      // since we have appended everything else.  Appending a cell to
      // a row removes it from any other position it had in the row.
      for (var k = xs - 1; k >= 0; k--) {
	parent[row].removeChild(parent[row].cells[k]);
	extraCells += xs;
      }
    }
    if (missingCells > 0)
      return msg + "Row " + rownum + ": " + missingCells + " missing cell" +
	(missingCells == 1 ? "" : "s") + " added\n";
    else if (extraCells > 0)
      return msg + "Row " + rownum + ": " + extraCells + " extra cell" +
	(extraCells == 1 ? "" : "s") + " removed\n";
    return msg;
  },

  normalizeTable: function(tbl) {
    if (tbl == null || tbl.nodeName.toLowerCase() != "table") return;
    var leftover = [];
    var width = -1;
    var rownum = 0;
    try {
      var headrow = tbl.tHead.rows[0].cells;
      sorttable.expandRow(tbl.tHead.rows, 0, undefined, -1);
      width = headrow.length;
      rownum++;
      for (var i = 0; i < width; k++)
	leftover.push(0);
    } catch(e) {}
    var errmsg = "";
    for (var l = 0; l < tbl.tBodies.length; l++) {
      var rows = tbl.tBodies[l].rows;
      for (var i = 0; i < rows.length; i++, rownum++) {
        errmsg += sorttable.expandRow(rows, i, leftover, width, rownum);
	if (width == -1)
	  width = rows[i].cells.length;
      }
    }
    if (errmsg != "") {
      var warnstr = "WARNING";
      if (tbl.id) warnstr += " for table \"" + tbl.id + "\"";
      alert(warnstr + "\n" + errmsg + "These errors have been corrected, but please correct the table");
    }
  },

  addIndex: function(tbl) {
    if (tbl == null || tbl.nodeName.toLowerCase() != "table") return;
    var count = 1;
    var tot_rows = tbl.rows.length;
    var foot_rows = tbl.tFoot ? tbl.tFoot.rows.length : 0;
    for (var i = 0; i < tot_rows; i++) {
      var row = tbl.rows[i];
      var pname = row.parentNode.nodeName.toLowerCase();
      var cell = document.createElement(i == 0 ? "th" : "td");
      if (i == 0) {
        cell.className = "sorttable_index";
	cell.id = "Index";
	cell.innerHTML = "Index";
      } else if (i >= tot_rows - foot_rows) {
	cell.innerHTML = "&nbsp;";
      } else {
        cell.innerHTML = count++;
      }
      row.insertBefore(cell, row.cells[0]);
    }
    tbl.indexAdded = true;
  },

  makeSortable: function(table, hideable, no_sortbottom, button_div, normalize, addIndex) {
    if (addIndex) sorttable.addIndex(table);
    if (normalize) sorttable.normalizeTable(table);
    if (button_div) {
      if (document.getElementById(button_div)) {
	var button = createElm('input');
	button.Table = table;
	button.setAttribute('type', 'button');
	button.setAttribute('value', 'Show sequential indices');
	button.setAttribute('onclick', 'javascript:sorttable.toggleFixedIndex(this);');
	document.getElementById(button_div).appendChild(button);
	table.toggleFixButton = button;
      }
    }
    if (table.getElementsByTagName('thead').length == 0) {
      //# table does not have a tHead. Since it should have, create one and
      //# put the first table row in it.
      the = document.createElement('thead');
      the.appendChild(table.rows[0]);
      table.insertBefore(the,table.firstChild);
    }
    table.sortList = new Array;
    table.hideable = hideable;
    //# Safari does not support table.tHead, sigh
    if (table.tHead == null) table.tHead = table.getElementsByTagName('thead')[0];

    if (table.tHead.rows.length != 1) return; //# cannot cope with two header rows

    if (! no_sortbottom) {
      //# Sorttable v1 put rows with a class of "sortbottom" at the bottom (as
      //# "total" rows, for example). This is wrong, since what you are supposed
      //# to do is put them in a tfoot. So, if there are sortbottom rows,
      //# for backwards compatibility, move them to tfoot (creating it if needed).
      //# no_sortbottom optimization available if you know you will not have
      //# sortbottom rows.
      sortbottomrows = [];
      for (var i=0; i < table.rows.length; i++) {
	if (table.rows[i].className.search(/\bsortbottom\b/) != -1) {
	  sortbottomrows.push(table.rows[i]);
	}
      }
      var tfo;
      if (sortbottomrows.length > 0) {
	if (table.tFoot == null) {
	  //# table does not have a tfoot. Create one.
	  tfo = document.createElement('tfoot');
	  table.appendChild(tfo);
	} else {
	  tfo = table.tFoot;
	}
	for (var i=0; i < sortbottomrows.length; i++) {
	  tfo.appendChild(sortbottomrows[i]);
	}
	delete sortbottomrows;
      }
    }

    //# work through each column and calculate its type
    var start = 0;
    while (table.tBodies[start].className.match(/\bfltrow/))
	start++;
    table.indexInitialized = false;
    table.curIndexFixed = true;
    table.prevIndexFixed = true;
    headrow = table.tHead.rows[0].cells;
    table.colWidth = headrow.length;
    for (var i=0; i < headrow.length; i++) {
      //# manually override the type with a sorttable_type attribute
      if (!headrow[i].className.match(/\bsorttable_nosort\b/)) { //# skip this col
        idx = headrow[i].className.match(/\bsorttable_index\b/);
        mtch = headrow[i].className.match(/\bsorttable_([a-z0-9]+)\b/);
        if (mtch) { override = mtch[1]; }
	if (idx) {
	  headrow[i].sorttable_sortfunction = sorttable["sort_index"];
	} else if (mtch && typeof sorttable["sort_"+override] == 'function') {
	  headrow[i].sorttable_sortfunction = sorttable["sort_"+override];
	} else {
	  headrow[i].sorttable_sortfunction = sorttable.guessType(table,i);
	}
	headrow[i].className += " sortable_heading";
	//# make it clickable to sort
	headrow[i].sorttable_columnindex = i;
	headrow[i].sorttable_tbody = table.tBodies[start];
	try {
	  removeEvent(headrow[i],"mousedown", sorttable.doPreSort);
	} catch(e) {}
	dean_addEvent(headrow[i],"mousedown", sorttable.doSort);
      }
      if (hideable) {
	var col = document.createElement('col');
	if (headrow[i].id == null || headrow[i].id == undefined || headrow[i].id == "") {
	  var text = sorttable.getInnerText(headrow[i]).toLowerCase().replace(/\s+/g, '_');
	  if (text == null || text == undefined || text == "")
	    text = "sorttable"+i;
	  headrow[i].id = text;
	}
	col.id = "col_" + headrow[i].id;
	table.appendChild(col);
      }
    }
  },

  getColDataType: function(ttable, column) {
    sorttable.initShadowRows(ttable);
    var headrow = ttable.shadowRows[0].cells;
    var cell = headrow[column];
    if (cell == undefined) {
      return undefined;
    } else if (cell.sorttable_sortfunction == sorttable.sort_index ||
	       cell.sorttable_sortfunction == sorttable.sort_numeric) {
      return "number";
    } else if (cell.sorttable_sortfunction == sorttable.sort_date) {
      return "date";
    } else  {
      return "string";
    }
  },

  makePreSortable: function(table, hideable, no_sortbottom) {
    table.hideable = hideable;
    table.no_sortbottom = no_sortbottom;
    var headrow = table.tHead.rows[0].cells;
    for (var i=0; i < headrow.length; i++) {
      //# manually override the type with a sorttable_type attribute
      if (!headrow[i].className.match(/\bsorttable_nosort\b/)) { //# skip this col
	headrow[i].className += " sortable_heading";
	dean_addEvent(headrow[i],"mousedown", sorttable.doPreSort);
      }
    }
  },

  guessType: function(table, column) {
    //# guess the type of a column based on its first non-blank row
    sortfn = sorttable.sort_alpha;
    for (var i=0; i < table.tBodies[0].rows.length; i++) {
      text = sorttable.getInnerText(table.tBodies[0].rows[i].cells[column]);
      if (text != '') {
        if (text.match(/^-?[£$¤]?[\d,.]+%?$/)) {
          return sorttable.sort_numeric;
        }
        if (text.match(/^[\d]+-[A-Za-z]/)) {
          return sorttable.sort_numeric;
        }
        if (text.match(/^[A-Za-z]/)) {
          return sorttable.sort_alpha;
        }
        //# check for a date: dd/mm/yyyy or dd/mm/yy
	//# yyyy-mm-dd can be sorted alphanumerically.
        //# can have / or . or - as separator
        //# can be mm/dd as well
        possdate = text.match(sorttable.DATE_RE)
        if (possdate) {
          //# looks like a date
          first = parseInt(possdate[1]);
          second = parseInt(possdate[2]);
          third = parseInt(possdate[3]);
	  if (first > 1900) {
	    //# yyyy/dd/mm
	    if (second < 13 && second > 0 && third < 32 && third > 0) {
              return sorttable.sort_alpha;
	    }
          } else if (first > 13) {
            //# definitely dd/mm
            return sorttable.sort_ddmm;
          } else if (second > 13) {
            return sorttable.sort_mmdd;
          } else {
            //# looks like a date, but we can't tell which, so assume
            //# that it's dd/mm (English imperialism!) and keep looking
            sortfn = sorttable.sort_ddmm;
          }
        }
      }
    }
    return sortfn;
  },

  isVisible : function(table, column) {
    var c = sorttable.getRowCell(table, 0, column);
    return !c.sorttableIsHidden && ! c.sorttableToBeHidden;
  },

  isFixedIndex : function(table) {
    return table.curIndexFixed;
  },

  getInnerTextInternal: function(node) {

    hasInputs = (typeof node.getElementsByTagName == 'function') &&
                 node.getElementsByTagName('input').length;

    if (! stTextContentWorks) {
      try {
        var ignoreme = typeof node.textContent;
	stTextContentWorks = 2;
      } catch(e) {
	stTextContentWorks = 1;
      }
    }

    if (stTextContentWorks == 2 && typeof node.textContent != 'undefined' && !hasInputs) {
      return node.textContent;
    }
    else if (typeof node.innerText != 'undefined' && !hasInputs) {
      return node.innerText;
    }
    else if (typeof node.text != 'undefined' && !hasInputs) {
      return node.text;
    }
    else {
      switch (node.nodeType) {
        case 3:
          if (node.nodeName.toLowerCase() == 'input') {
            return node.value;
          }
        case 4:
          return node.nodeValue;
          break;
        case 1:
        case 11:
          var innerText = '';
          for (var i = 0; i < node.childNodes.length; i++) {
            innerText += sorttable.getInnerTextInternal(node.childNodes[i]);
          }
          return innerText;
          break;
        default:
          return '';
      }
    }
  },

  getInnerText: function(node) {
    //# gets the text we want to use for sorting for a cell.
    //# strips leading and trailing whitespace.
    //# this is *not* a generic getInnerText function; it is special to sorttable.
    //# for example, you can override the cell text with a customkey attribute.
    //# it also gets .value for < input > fields.

    if (node.getAttribute("sorttable_customkey") != null) {
      return node.getAttribute("sorttable_customkey");
    }
    var mtch = node.className.match(/\bsorttable_customkey='([^\']*)'/);
    if (mtch) {
      return mtch[1];
    }
    var text = sorttable.getInnerTextInternal(node);
    return text.replace(/^\s+|\s+$/g, '');
  },

  reverse: function(table, c, all, shadowOnly) {
    //# reverse the rows in a table
    var newrows = [];
    var shadow = table.shadowRows;
    var length = shadow.length;
    var start = 1;
    while (shadow[start].className.match(/\bfltrow/))
       start++;
    if (table.tFoot) {
      length -= table.tFoot.rows.length;
    }
    newrows.length = length;
    //# Robert Krawitz (rlk), 2007-10-01: retain odd/even row colorings
    //# First figure out how many visible rows we are going to display so
    //# that we start with the right parity
    for (var i=start; i < length; i++) {
      newrows[i] = shadow[i];
    }
    var l = start;
    var i = newrows.length-1;
    //# If we are reversing the data, it has to have already been sorted,
    //# which means that we have to have already cached the text.
    if (all) {
      for (; i>=start; i--)
	shadow[l++] = newrows[i];
    } else {
      var prevText = newrows[i].cells[c].cachedText;
      var p = i;
      for (; i>=start; i--) {
	var text = newrows[i].cells[c].cachedText;
	if (prevText != text) {
	  prevText = text;
	  for (var k = i + 1; k <= p; k++)
	    shadow[l++] = newrows[k];
	  p=i;
	}
      }
      for (var k = i + 1; k <= p; k++)
	shadow[l++] = newrows[k];
    }
    if (! shadowOnly) sorttable.repopulateTable(table, true);
  },

  //# sort functions
  //# each sort function takes two parameters, a and b
  sort_numeric: function(a,b) {
    if (a[2] == b[2]) return a[1] - b[1];
    return a[2] - b[2];
  },
  sort_index: function(a,b) {
    return a[2] - b[2];
  },
  sort_alpha: function(a,b) {
    if (a[2] == b[2]) return a[1] - b[1];
    if (a[2] > b[2]) return 1;
    return -1;
  },
  sort_date: function(a,b) {
    if (a[2] == b[2]) return a[1] - b[1];
    if (a[2] > b[2]) return 1;
    return -1;
  },
  sort_ddmm: function(a,b) {
    if (a[2] == b[2]) return a[1] - b[1];
    if (a[2] > b[2]) return 1;
    return -1;
  },
  sort_mmdd: function(a,b) {
    if (a[2] == b[2]) return a[1] - b[1];
    if (a[2] > b[2]) return 1;
    return -1;
  },
}

/*# ******************************************************************
 *#   Supporting functions: bundled here to avoid depending on a library
 *#   ****************************************************************** */

//# Dean Edwards/Matthias Miller/John Resig

/*# for Mozilla/Opera9 */
if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", sorttable.init, false);
}

/*# for Internet Explorer */
/*@cc_on @*/
/*@if (@_win32)
    document.write("\<script id='__ie_onload' defer='defer' type='text/javascript' src='javascript:void(0)'><" + "/script>");
    var script = document.getElementById("__ie_onload");
    script.onreadystatechange = function() {
        if (this.readyState == "complete") {
            sorttable.init(); //# call the onload handler
        }
    };
/*@end @*/

/*# for Safari */
if (/WebKit/i.test(navigator.userAgent)) { //# sniff
    var _timer = setInterval(function() {
        if (/loaded|complete/.test(document.readyState)) {
            sorttable.init(); //# call the onload handler
        }
    }, 10);
}

/* for other browsers */
window.onload = sorttable.init;

//# written by Dean Edwards, 2005
//# with input from Tino Zijdel, Matthias Miller, Diego Perini

//# http://dean.edwards.name/weblog/2005/10/add-event/

function dean_addEvent(element, type, handler) {
	if (element.addEventListener) {
		element.addEventListener(type, handler, false);
	} else {
		//# assign each event handler a unique ID
		if (!handler.$$guid) handler.$$guid = dean_addEvent.guid++;
		//# create a hash table of event types for the element
		if (!element.events) element.events = {};
		//# create a hash table of event handlers for each element/event pair
		var handlers = element.events[type];
		if (!handlers) {
			handlers = element.events[type] = {};
			//# store the existing event handler (if there is one)
			if (element["on" + type]) {
				handlers[0] = element["on" + type];
			}
		}
		//# store the event handler in the hash table
		handlers[handler.$$guid] = handler;
		//# assign a global event handler to do all the work
		element["on" + type] = handleEvent;
	}
};
//# a counter used to create unique IDs
dean_addEvent.guid = 1;

function removeEvent(element, type, handler) {
	if (element.removeEventListener) {
		element.removeEventListener(type, handler, false);
	} else {
		//# delete the event handler from the hash table
		if (element.events && element.events[type]) {
			delete element.events[type][handler.$$guid];
		}
	}
};

function handleEvent(event) {
	var returnValue = true;
	//# grab the event object (IE uses a global event object)
	event = event || fixEvent(((this.ownerDocument || this.document || this).parentWindow || window).event);
	//# get a reference to the hash table of event handlers
	var handlers = this.events[event.type];
	//# execute each event handler
	for (var i in handlers) {
		this.$$handleEvent = handlers[i];
		if (this.$$handleEvent(event) === false) {
			returnValue = false;
		}
	}
	return returnValue;
};

function fixEvent(event) {
	//# add W3C standard event methods
	event.preventDefault = fixEvent.preventDefault;
	event.stopPropagation = fixEvent.stopPropagation;
	return event;
};
fixEvent.preventDefault = function() {
	this.returnValue = false;
};
fixEvent.stopPropagation = function() {
  this.cancelBubble = true;
}

//# Deans forEach: http://dean.edwards.name/base/forEach.js
/*#
 *#	forEach, version 1.0
 *#	Copyright 2006, Dean Edwards
 *#	License: http://www.opensource.org/licenses/mit-license.php
 *#*/

//# array-like enumeration
if (!Array.forEach) { //# mozilla already supports this
	Array.forEach = function(array, block, context) {
		for (var i = 0; i < array.length; i++) {
			block.call(context, array[i], i, array);
		}
	};
}

//# generic enumeration
Function.prototype.forEach = function(object, block, context) {
	for (var key in object) {
		if (typeof this.prototype[key] == "undefined") {
			block.call(context, object[key], key, object);
		}
	}
};

//# character enumeration
String.forEach = function(string, block, context) {
	Array.forEach(string.split(""), function(chr, index) {
		block.call(context, chr, index, string);
	});
};

//# globally resolve forEach enumeration
var forEach = function(object, block, context) {
	if (object) {
		var resolve = Object; //# default
		if (object instanceof Function) {
			//# functions have a "length" property
			resolve = Function;
		} else if (object.forEach instanceof Function) {
			//# the object implements a custom forEach method so use that
			object.forEach(block, context);
			return;
		} else if (typeof object == "string") {
			//# the object is a string
			resolve = String;
		} else if (typeof object.length == "number") {
			//# the object is array-like
			resolve = Array;
		}
		resolve.forEach(object, block, context);
	}
};
