//# Search code, using sorttable and HTML Table Filter Generator
//# Written by Robert Krawitz, robert.krawitz@sun.com

var searchReportList = [];

function setupSearch(id, reset) {
    var sst = document.location.search;
    var t = grabEBI(id);
    var filterRequired = false;
    var sortPerformed = false;
    var hr = t.rows[0].cells;
    if (! t.searchInitialized) {
	searchReportList.push(grabID(id));
	t.searchInitialized = true;
    }
    if (reset) {
	sorttable.doShowAllColumns(t);
	//# See comment in resetSearch for why this code needs to be here
	//# rather than in resetSearch.
	//# Clear out both sets of filters to really reset the state.
	if (document.tfOriginalBaseTitle != undefined) setBaseTitle(document.tfOriginalBaseTitle);
	TF_CloseAllSummaries(t);
	TF_ShowFilterGrid(t);
    	TF_SetFilterMode(t, "advanced");
	filterRequired = clearFilters(t);
    	TF_SetFilterMode(t, "basic");
	if (clearFilters(t)) filterRequired = true;
	if (!t.curIndexFixed) {
	    sorttable.doFixOnly(t, true);
	    sortPerformed = true;
	}
    }
    var filters = getFilters(t);
    //# We need to filter first and then sort.  Sorting
    //# depopulates the table, including the filter rows, because it
    //# entirely removes the tbody.
    //# Sorting is much faster when it is done on a disassociated table,
    //# since the browser does the rendering all in one shot.
    var customActive = false;
    var fixedIndex = true;
    var hideFilter = false;
    var curTable = "";
    var tsst = sst.slice(1);
    var summaries = [];
    while (tsst != "") {
	var where = tsst.indexOf("&");
	var thing;
	if (where >= 0) {
	    thing = tsst.slice(0,where);
	    tsst = tsst.slice(where+1);
	} else {
	    thing = tsst;
	    tsst = "";
	}
	if (thing.match(/^report/)) {
	    curTable = "";
	    continue;
	}
	if (curTable != "" && curTable != id) {
	    continue;
	}
	if (thing.match(/^filter/)) {
	    thing = thing.replace(/^filter=/,"");
	    if (thing == "advanced")
		TF_SetFilterMode(t, "advanced");
	    else if (thing == "multi")
		TF_SetFilterMode(t, "multi");
	    filters = getFilters(t);
	} else if (thing.match(/^fixedIndex/)) {
	    thing = thing.replace(/^fixedIndex=/,"");
	    if (thing.toLowerCase() != "true" || $thing == 0) {
		fixedIndex = false;
	    }
	} else if (thing.match(/^customFilterActive/)) {
	    thing = thing.replace(/^customFilterActive=/,"");
	    if (thing.toLowerCase() == "true" || $thing > 0) {
		customActive = true;
		setCustomFilterActive(t, true);
	    }
	} else if (thing.match(/^customFilter/)) {
	    thing = unescape(thing.replace(/^customFilter=/,""));
	    if (thing) setCustomFilter(t, thing, !customActive);
	} else if (thing.match(/^baseTitle/)) {
	    thing = unescape(thing.replace(/^baseTitle=/,""));
	    if (thing) setBaseTitle(t, thing);
	} else if (thing.match(/^hideFilter/)) {
	    thing = thing.replace(/^hideFilter=/,"");
	    if (thing.toLowerCase() == "true") {
		hideFilter = true;
	    }
	} else if (thing.match(/^summary/)) {
	    thing = unescape(thing.replace(/^summary=/,""));
	    var summaryData = thing.split(",");
	    if (summaryData.length > 0)
		summaries.push([summaryData]);
	} else if (thing.match(/^f_/)) {
	    thing = thing.replace(/^f_/,"");
	    var col;
	    var val;
	    var split = thing.indexOf("=");
	    if (split > 0) {
		col = thing.slice(0, split);
		val = unescape(thing.slice(split + 1));
		if (val != "") {
		    for (i = 0; i < hr.length; i++) {
			if (hr[i].id.toLowerCase() == col.toLowerCase()) {
			    var mode = getColumnFilterMode(t, i);
			    if (mode == "select" || mode == "multi")
				val = val.replace(/^=/, "");
			    if (setFilterValue(filters, i, val)) filterRequired = true;
			    break;
			}
		    }
		}
	    }
	}
    }
    filterRequired |= customActive;
    if (filterRequired) {
        Filter(t, true);
    }
    if (reset) {
	sorttable.doDoSort(hr[0], true, true);
	sortPerformed = true;
    }
    if (!fixedIndex) {
	sorttable.doFix(t, false, true);
	sortPerformed = true;
    }
    var curTable = "";
    var tsst = sst.slice(1);
    while (tsst != "") {
	var where = tsst.indexOf("&");
	var thing;
	if (where >= 0) {
	    thing = tsst.slice(0,where);
	    tsst = tsst.slice(where+1);
	} else {
	    thing = tsst;
	    tsst = "";
	}
	if (thing.match(/^report/)) {
	    curTable = "";
	    continue;
	}
	if (curTable != "" && curTable != id) {
	    continue;
	}
	if (thing.match(/^sort=/)) {
	    thing = thing.replace(/^sort=/,"");
	    var reverse = 0;
	    if (thing.substring(0, 1) == '-') {
		reverse = 1;
		thing = thing.substring(1);
	    }
	    for (i = 0; i < hr.length; i++) {
		if (hr[i].id.toLowerCase() == thing.toLowerCase()) {
		    sortPerformed = true;
		    sorttable.doDoSort(hr[i], true, true);
		    if (reverse) {
			sorttable.doDoSort(hr[i], true);
		    }
		    break;
		}
	    }
	} else if (thing.match(/^hide=/)) {
	    thing = thing.replace(/^hide=/,"");
	    for (i = 0; i < hr.length; i++) {
		if (hr[i].id.toLowerCase() == thing.toLowerCase()) {
		    sorttable.doDoHide(hr[i], true);
		    break;
		}
	    }
	}
    }
    for (var s in summaries) {
	var tmp = summaries[s];
	TF_AddSummary(t, tmp[0]);
    }
    TF_UpdateAllSummaries(id);
    if (filterRequired || sortPerformed) sorttable.repopulateTable(t, true);
    if (hideFilter) {
	TF_HideFilterGrid(t);
    }
}

function showAll(id, div) {
    var parent;
    var t = grabEBI(id);
    if (div) {
	parent = div.parentNode;
	parent.removeChild(div);
    }
    try {
	TF_SetFilterMode(t, "advanced");
	var filterRequired = clearFilters(t);
	TF_SetFilterMode(t, "basic");
	if (clearFilters(t)) filterRequired = true;
	if (filterRequired) Filter(t);
	var hr = t.rows[0].cells;
	sorttable.doDoSort(hr[0], true, true);
	sorttable.doShowAllColumns(t, true);
	sorttable.repopulateTable(t, true);
    } catch(e) {}
    if (div) parent.appendChild(div);
}

function resetSearch(id, div) {
    var parent;
    var t = grabEBI(id);
    if (div) {
	parent = div.parentNode;
	parent.removeChild(div);
    }
    try {
	//# We can't simply hoist the reset code into resetSearch, because
	//# the reset may necessitate a sort or filter operation that
	//# setupSearch won't know about.
	setupSearch(t, true);
    } catch(e) {}
    if (div) parent.appendChild(div);
}

function showAllColumns(id) {
    var t = grabEBI(id);
    if (t) sorttable.doShowAllColumns(t);
}

function generateURL(tid) {
    var baseURL = document.location.protocol + "//" + document.location.host +
	document.location.pathname;
    var hash = document.location.hash;
    if (tid == undefined || tid == null) tid = "";
    var answer = [];
    for (var idx in searchReportList) {
	var id = searchReportList[idx];
	var t = grabEBI(id);
	if (tid != "" && tid != id)
	    continue;
	var count = sorttable.getColCount(t);
	var filters = getFilters(t);
	var summaries = getSummaries(t);
	var id_answer = [];

	if (getFilterMode(id) == "advanced") {
	    id_answer.push("filter=advanced");
	} else if (getFilterMode(id) == "multi") {
	    id_answer.push("filter=multi");
	}

	if (!TF_FilterIsVisible(id)) {
	    id_answer.push("hideFilter=true");
	}

	if (!sorttable.isFixedIndex(t)) {
	    id_answer.push("fixedIndex=false");
	}

	for (var i = 0; i < count; i++) {
	    if (getFilterValue(filters, i) != '') {
		var fvalues = getFilterValues(filters, i);
		var c = sorttable.getRowCell(t, 0, i);
		var isSelect = getColumnFilterMode(t, i) == "select";
		//# "Escape" any leading "=" so that filter code
		//# gets the leading = sign.
		for (var k = 0; k < fvalues.length; k++) {
		    var fvalue = fvalues[k];
		    if (isSelect) {
			fvalue = fvalue.replace(/^=/, "==");
		    }
		    id_answer.push("f_" + escape(c.id) + "=" + escape(fvalue));
		}
	    }
	}

	if (getCustomFilter(t)) {
	    if (getCustomFilterActive(t)) {
		id_answer.push("customFilterActive=true");
	    }
	    var flt = escape(getCustomFilter(t));
	    flt = flt.replace(/\//g, "%2F");
	    id_answer.push("customFilter=" + flt);
	}

	for (var i = 0; i < summaries.length; i++) {
	    var summary = getSummary(summaries[i]);
	    if (summary[0]) {
		id_answer.push("summary=" + escape(summary.join(',')));
	    }
	}

	if (t.sortList && t.sortList.length > 0) {
	    for (var i = 0; i < t.sortList.length; i++) {
		id_answer.push("sort=" + escape(t.sortList[i]));
	    }
	}
	for (i = 0; i < count; i++) {
	    if (!sorttable.isVisible(t, i)) {
		var c = sorttable.getRowCell(t, 0, i);
		id_answer.push("hide=" + escape(c.id));
	    }
	}
	if (id_answer.length > 0) {
	    var stuff = (tid == "") ? "report=" + id + "&" : "";
	    answer.push(stuff + id_answer.join("&"));
	}
    }
    if (answer.length > 0)
	baseURL += "?" + answer.join("&");
    baseURL += hash;
    return baseURL;
}

function createURL(id, box) {
    var ubox = grabEBI(box);
    if (ubox) {
	var url = generateURL(id);
	ubox.innerHTML = '<a href="' + url + '">' + url + "</a>";
    }
}

function createTinyURL(id, form) {
    var url = generateURL(id);
    with (form) {
	long_url.value=url;
	return true;
    }
    return false;
}

