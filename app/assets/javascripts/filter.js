/*#====================================================
 *#	- HTML Table Filter Generator v1.6
 *#	- By Max Guglielmi
 *#	- mguglielmi.free.fr/scripts/TableFilter/?l=en
 *#	- please do not change this comment
 *#	- don't forget to give some credit... it's always
 *#	good for the author
 *#	- Special credit to Cedric Wartel and
 *#	cnx.claude@free.fr for contribution and
 *#	inspiration
 *#====================================================*/

//# global vars
var TblId = new Array();

var stCollapseWorks = (navigator.product == "Gecko" &&
		       navigator.productSub &&
		       navigator.productSub > "20041010" &&
		       (navigator.userAgent.indexOf("rv:1.8") != -1 ||
		        navigator.userAgent.indexOf("rv:1.9") != -1));


function setFilterGrid(id)
/*#====================================================
 *#	- Checks if id exists and is a table
 *#	- Then looks for additional params
 *#	- Calls fn that generates the grid
 *#=====================================================*/
{
	var tbl = grabEBI(id);
	var ref_row = 0, fObj;
	if(tbl != null && tbl.nodeName.toLowerCase() == "table")
	{
		if(arguments.length>1)
		{
			for(var i=0; i < arguments.length; i++)
			{
				var argtype = typeof arguments[i];

				switch(argtype.toLowerCase())
				{
					case "number":
						ref_row = arguments[i];
					break;
					case "object":
						fObj = arguments[i];
					break;
				}//#switch

			}//#for
		}//#if

		var ncells = getCellsNb(id,ref_row);
		tbl.tf_ncells = ncells;
		//# Skip basic and advanced filters
		if(tbl.tf_ref_row==undefined) tbl.tf_ref_row = ref_row + 2;
		tbl.tf_Obj = fObj;
		if( !hasGrid(id) ) AddGrid(id);
	}//#if tbl!=null
}

function AddGrid(id)
/*#====================================================
 *#	- adds a row containing the filtering grid
 *#=====================================================*/
{
	var t = grabEBI(id);
	id = grabID(id);
	TblId.push(id);
	t.tf_hasGrid = true;
	var f = t.tf_Obj, n = t.tf_ncells;
	var inpclass, fltgrid, displayBtn, btntext, enterkey;
	var modfilter_fn, display_allText, on_slcChange;
	var displaynrows, totrows_text, btnreset, btnreset_text;
	var sort_slc, displayPaging, pagingLength, displayLoader;
	var load_text, exactMatch, alternateBgs, colOperation;
	var rowVisibility, colWidth, bindScript;
	var fltRowClass;
	var removeFilterFunc;
	var alternateRowsInitialized;
	var setTitle;
	var titleElement;
	var unfilterHide;
	var tlDiv;
	var rowDiv;
	var buttonDiv;
	var customFilterDiv;
	var loaderDiv;
	var pagingDiv;
	var summaryDiv;
	var tblHeadingClass;
	var tblNormalClass;
	var tblSummaryClass;
	var tblClass;
	var printableIndent;
	var baseTitle = undefined;

	if (f != undefined) {
		f["grid"]==false ? fltgrid=false : fltgrid=true;//#enables/disables filter grid
		f["btn"]==true ? displayBtn=true : displayBtn=false;//#show/hides filter validation button
		f["btn_text"]!=undefined ? btntext=f["btn_text"] : btntext="go";//#defines button text
		f["enter_key"]==false ? enterkey=false : enterkey=true;//#enables/disables enter key
		f["mod_filter_fn"] ? modfilter_fn=true : modfilter_fn=false;//#defines alternative fn
		f["display_all_text"]!=undefined ? display_allText=f["display_all_text"] : display_allText="";//#defines 1st option text
		f["on_change"]==false ? on_slcChange=false : on_slcChange=true;//#enables/disables onChange event on combo-box
		f["rows_counter"]==true ? displaynrows=true : displaynrows=false;//#show/hides rows counter
		f["rows_counter_text"]!=undefined ? totrows_text=f["rows_counter_text"] : totrows_text="Displayed rows: ";//#defines rows counter text
		f["btn_reset"]==true ? btnreset=true : btnreset=false;//#show/hides reset link
		f["btn_reset_text"]!=undefined ? btnreset_text=f["btn_reset_text"] : btnreset_text="Reset";//#defines reset text
		f["sort_select"]==true ? sort_slc=true : sort_slc=false;//#enables/disables select options sorting
		f["paging"]==true ? displayPaging=true : displayPaging=false;//#enables/disables table paging
		f["paging_length"]!=undefined ? pagingLength=f["paging_length"] : pagingLength=10;//#defines table paging length
		f["loader"]==true ? displayLoader=true : displayLoader=false;//#enables/disables loader
		f["loader_text"]!=undefined ? load_text=f["loader_text"] : load_text="Loading...";//#defines loader text
		f["exact_match"]==true ? exactMatch=true : exactMatch=false;//#enables/disbles exact match for search
		f["alternate_rows"]==true ? alternateBgs=true : alternateBgs=false;//#enables/disbles rows alternating bg colors
		f["col_operation"] ? colOperation=true : colOperation=false;//#enables/disbles column operation(sum,mean)
		f["rows_always_visible"] ? rowVisibility=true : rowVisibility=false;//#makes a row always visible
		f["col_width"] ? colWidth=true : colWidth=false;//#defines widths of columns
		f["bind_script"] ? bindScript=true : bindScript=false;
		f["flt_row_class"] ? fltRowClass = f["flt_row_class"] : fltRowClass = undefined;
		f["remove_filter_func"] ? removeFilterFunc = f["remove_filter_func"] : removeFilterFunc = undefined;
		f["alternate_rows_initialized"] ? alternateRowsInitialized = true : alternateRowsInitialized = false;
		f["set_title"] ? setTitle = true : setTitle = false;
		f["title_element"] ? titleElement = f["title_element"] : titleElement = undefined;
		f["base_title"] ? baseTitle = f["baseTitle"] : baseTitle = undefined;
		f["unfilter_hide"] ? unfilterHide = f["unfilter_hide"] : unfilter = false;
		f["top_level_div"] ? tlDiv = f["top_level_div"] : tlDiv = "inf_"+id;
		f["display_row_div"] ? rowDiv = f["display_row_div"] : rowDiv = "ldiv_"+id;
		f["button_div"] ? buttonDiv = f["button_div"] : buttonDiv = "reset_"+id;
		f["custom_filter_div"] ? customFilterDiv = f["custom_filter_div"] : customFilterDiv = undefined;
		f["loader_div"] ? loaderDiv = f["loader_div"] : loaderDiv = undefined;
		f["paging_div"] ? pagingDiv = f["paging_div"] : pagingDiv = "mdiv_"+id;
		f["summary_div"] ? summaryDiv = f["summary_div"] : summaryDiv = "sdiv_"+id;
		f["class_tbl_heading"] ? tblHeadingClass = f["class_tbl_heading"] : tblHeadingClass = "";
		f["class_tbl_normal"] ? tblNormalClass = f["class_tbl_normal"] : tblHeadingClass = "";
		f["class_tbl_summary"] ? tblSummaryClass = f["class_tbl_summary"] : tblHeadingClass = "";
		f["class_tbl"] ? tblClass = f["class_tbl"] : tblClass = "";
		f["printable_indent"] ? printableIndent = f["printable_indent"] : printableIndent = "";
	}

	//# props are added to table in order to be easily accessible from other fns
	t.tf_fltGrid			=	fltgrid;
	t.tf_displayBtn			= 	displayBtn;
	t.tf_btnText			=	btntext;
	t.tf_enterKey			= 	enterkey;
	t.tf_isModfilter_fn		= 	modfilter_fn;
	t.tf_display_allText 		= 	display_allText;
	t.tf_on_slcChange 		= 	on_slcChange;
	t.tf_rowsCounter 		= 	displaynrows;
	t.tf_rowsCounter_text		= 	totrows_text;
	t.tf_btnReset 			= 	btnreset;
	t.tf_btnReset_text 		= 	btnreset_text;
	t.tf_sortSlc 			=	sort_slc;
	t.tf_displayPaging 		= 	displayPaging;
	t.tf_pagingLength 		= 	pagingLength;
	t.tf_displayLoader		= 	displayLoader;
	t.tf_loadText			= 	load_text;
	t.tf_exactMatch 		= 	exactMatch;
	t.tf_alternateBgs		=	alternateBgs;
	t.tf_startPagingRow		= 	0;
	t.tf_fltRowClass		=	fltRowClass;
	t.tf_removeFilterFunc		=	removeFilterFunc;
	t.tf_filterMode			=	"basic";
	t.tf_setTitle			=	setTitle;
	t.tf_titleElement		=	titleElement;
	t.tf_unfilterHide		=	unfilterHide;
	t.tf_dummyColInitialized	=	false;
	t.tf_hiddenRows			=	0;
	t.tf_topDiv			=	tlDiv;
	t.tf_rowDiv			=	rowDiv;
	t.tf_buttonDiv			=	buttonDiv;
	t.tf_customFilterDiv		=	customFilterDiv;
	t.tf_loaderDiv			=	loaderDiv;
	t.tf_pagingDiv			=	pagingDiv;
	t.tf_summaryDiv			=	summaryDiv;
	t.tf_summaryIdx			=	0;
	t.tf_summaryIDs			=	[];
	t.tf_summaryClassHeading	=	tblHeadingClass;
	t.tf_summaryClassNormal		=	tblNormalClass;
	t.tf_summaryClassSummary	=	tblSummaryClass;
	t.tf_summaryClassTable		=	tblClass;
	t.tf_printableIndent		=	printableIndent;

	if(modfilter_fn) t.tf_modfilter_fn = f["mod_filter_fn"];//# used by DetectKey fn

	//# "Basic" filters use either drop menus or text enter boxes as
	//# appropriate.  "Advanced" filters use text enter boxes that
	//# accept regular expressions.
	if(fltgrid)
	{
		var fltrow_b = document.createElement("tr"); //#adds filter row
		fltrow_b.className = "fltrow";
		fltrow_b.id = "fltrow_basic_" + id;
		var fltrow_a = document.createElement("tr"); //#adds filter row
		fltrow_a.className = "fltrow";
		fltrow_a.id = "fltrow_advanced_" + id;
		fltrow_a.style.display = "none";
		fltrow_a.style.visibility = "collapse";
		var populate_list = new Array();
		var offset = 0;
		if (t.indexAdded)
		{
			f["col_name_-1"] = "Index";
			f["col_-1"] = "none";
			offset = -1;
		}
		for(var i=0; i < n; i++)//# this loop adds filters
		{
			var io = i + offset;
			var fltcell_b = fltrow_b.insertCell(i);
			var fltcell_a = fltrow_a.insertCell(i);
			if (fltRowClass!=undefined) {
				fltcell_b.className = fltRowClass;
				fltcell_a.className = fltRowClass;
			}
			i==n-1 && displayBtn==true ? inpclass = "flt_s" : inpclass = "flt";

			//# Force the header row to be cached, since the sort
			//# code mutates it.
			var hcell = t.rows[0].cells.item(i)
			var headerName = getCellText(hcell);
			if (f != undefined) {
				if (f["col_count_"+io])
					hcell.countable=true;
				if (f["col_name_"+io] == undefined ||
				    f["col_name_"+io] == "") {
					f["col_name_"+io] =
					    headerName.replace(/[\n\f]+/, ' ');
				}
				if (f["col_name_"+io] != undefined) {
					fltcell_a.colName = f["col_name_"+io];
					fltcell_b.colName = f["col_name_"+io];
				}
				if (f["col_"+io] == undefined &&
				    hcell.className != undefined) {
					if (/TF_filterSelect/.test(hcell.className))
						f["col_"+io] = 'select';
					else if (/TF_filterNone/.test(hcell.className))
						f["col_"+io] = 'none';
					else if (/TF_filterHidden/.test(hcell.className))
						f["col_"+io] = 'hidden';
				}
				if (f["col_width_"+io] == undefined &&
				    hcell.className != undefined) {
					var mtch = hcell.className.match(/(TF_filterWidth=)([0-9]+)/)
					if (mtch) {
						f["col_width_"+io] = parseInt(mtch[2]);
					}
				}
			}
			var cwidth;
			if (f != undefined) cwidth = f["col_width_"+io];
			if(f==undefined || f["col_"+io]==undefined || f["col_"+io]=="none") {
				var inptype;
				if (f==undefined || f["col_"+io]==undefined) {
					inptype="text"
				} else {
					inptype="hidden";//#show/hide input
				}
				var inp;
				if (inptype == "text" && cwidth != undefined) {
				    var width = cwidth;
				    if (width > 15) width = 15;
				    inp = createElm("input",
						    ["id","fltb"+i+"_"+id],
						    ["type",inptype],
						    ["class",inpclass],
						    ["maxlength",cwidth+2],
						    ["size",width] );
				} else {
				    inp = createElm("input",
						    ["id","fltb"+i+"_"+id],
						    ["type",inptype],
						    ["class",inpclass] );
				}
				inp.className = inpclass;//# for ie < =6
				fltcell_b.appendChild(inp);
				if(enterkey) inp.onkeypress = DetectKey;
				if (inptype == "text" && cwidth != undefined) {
				    var width = cwidth;
				    if (width > 15) width = 15;
				    inp = createElm("input",
						    ["id","flta"+i+"_"+id],
						    ["type",inptype],
						    ["class",inpclass],
						    ["maxlength", 128],
						    ["size",width] );
				} else {
				    inp = createElm("input",
						    ["id","flta"+i+"_"+id],
						    ["type",inptype],
						    ["class",inpclass] );
				}
				inp.className = inpclass;//# for ie < =6
				fltcell_a.appendChild(inp);
				if(enterkey) inp.onkeypress = DetectKey;
			}
			else if(f["col_"+io]=="select" || f["col_"+io]=="multi")
			{
				var slc = createElm("select",
						    ["id","fltb"+i+"_"+id],
						    ["class",inpclass] );
				slc.className = inpclass;//# for ie < =6
				fltcell_b.appendChild(slc);
				if (f["col_vals_"+io] == undefined)
					populate_list.push(i);
				else
					PopulateOptions(t,i, f["col_vals_"+io], slc, f["col_"+io]=="multi");
				var args = new Array();
				args.push(id); args.push(i); args.push(n);
				args.push(display_allText); args.push(sort_slc); args.push(displayPaging);
				if(enterkey) slc.onkeypress = DetectKey;
				if(on_slcChange) {
					(!modfilter_fn) ? slc.onchange = function(){ FilterIfSingle(id); } : slc.onchange = f["mod_filter_fn"];
				}

				var width = cwidth;
				if (width > 15) width = 15;
				var inp = createElm("input",
						    ["id","flta"+i+"_"+id],
						    ["type","text"],
						    ["class",inpclass],
						    ["maxlength", 128],
						    ["size",width] );
				inp.className = inpclass;//# for ie < =6
				fltcell_a.appendChild(inp);
				if(enterkey) inp.onkeypress = DetectKey;
			}

			if(i==n-1 && displayBtn==true)//# this adds button
			{
				var btn = createElm("input",
						    ["id","btn"+i+"_"+id],
						    ["type","button"],
						    ["value",btntext],
						    ["class","btnflt"]);
				btn.className = "btnflt";

				fltcell_b.appendChild(btn);
				fltcell_a.appendChild(btn);
				(!modfilter_fn) ? btn.onclick = function(){ Filter(id); } : btn.onclick = f["mod_filter_fn"];
			}//#if

		}//# for i
		if (populate_list.length > 0) PopulateOptionList(t, populate_list, fltrow_b);
		for (var i = 0; i < t.childNodes.length; i++) {
			if (t.childNodes[i].nodeName == "TBODY") {
				var tb = t.childNodes[i];
				if (tb.rows.length > 0)
					tb.insertBefore(fltrow_b, tb.rows[0]);
				else
					tb.appendChild(fltrow_b);
				tb.insertBefore(fltrow_a, fltrow_b);
				break;
			}
		}
	}//#if fltgrid

	if(displaynrows || btnreset || displayPaging || displayLoader)
	{

		//# div containing rows # displayer + reset btn
		var infdiv = findOrCreateElm("div", t.tf_topDiv,
					     ["class","inf"] );
		infdiv.className = "inf";//# setAttribute method for class attribute does not seem to work on ie < =6
		if (infdiv.tf_Created)
	        {
			try {
				t.parentNode.insertBefore(infdiv, t);
			} catch(e) {
				for (var i = 0; i < document.childNodes.length; i++) {
					var ch = document.childNodes[i];
					if (ch.nodeName != "HTML") continue;
					for (var j = 0; j < ch.childNodes.length; j++) {
						var cc = ch.childNodes[j];
						if (cc.nodeName != "BODY") continue;
						cc.appendChild(infdiv);
						break;
					}
					break;
				}
			}
		}
		if(displaynrows)
		{
			//# left div containing rows # displayer
			var totrows;
			var ldiv = findOrCreateElm("div", t.tf_rowDiv);
			displaynrows ? ldiv.className = "ldiv" : ldiv.style.display = "none";
			displayPaging ? totrows = pagingLength : totrows = getRowsNb(t);

			var totrows_span = createElm("span",
						     ["id","totrows_span_"+id],
						     ["class","tot"] ); //# tot # of rows displayer
			totrows_span.className = "tot";//#for ie < =6
			totrows_span.appendChild( createText(totrows) );

			var totrows_txt = createText(totrows_text);
			t.tf_RowsSpan = totrows_span;
			ldiv.appendChild(totrows_txt);
			ldiv.appendChild(totrows_span);
			if (ldiv.tf_Created) infdiv.appendChild(ldiv);
		}

		if(displayLoader)
		{
			//# div containing loader
			var loaddiv = findOrCreateElm("div",
						      t.tf_loaderDiv,
						      ["class","loader"] );
			loaddiv.className = "loader";//# for ie < =6
			loaddiv.style.display = "none";
			loaddiv.appendChild( createText(load_text) );
			if (loaddiv.tf_Created) infdiv.appendChild(loaddiv);
		}

		if(displayPaging)
		{
			//# mid div containing paging displayer
			var mdiv = findOrCreateElm( "div",t.tf_pagingDiv );
			displayPaging ? mdiv.className = "mdiv" : mdiv.style.display = "none";
			if (mdiv.tf_Created) infdiv.appendChild(mdiv);

			var start_row = t.tf_ref_row;
			var row = grabTag(t,"tr");
			var nrows = row.length;
			var npages = Math.ceil( (nrows - start_row)/pagingLength );//#calculates page nb

			var slcPages = createElm( "select",["id","slcPages_"+id] );
			slcPages.onchange = function(){
				if(displayLoader) showLoader(id,"");
				t.tf_startPagingRow = this.value;
				GroupByPage(id);
				if(displayLoader) showLoader(id,"none");
			}

			var pgspan = createElm( "span",["id","pgspan_"+id] );
			grabEBI("mdiv_"+id).appendChild( createText(" Page ") );
			grabEBI("mdiv_"+id).appendChild(slcPages);
			grabEBI("mdiv_"+id).appendChild( createText(" of ") );
			pgspan.appendChild( createText(npages+" ") );
			grabEBI("mdiv_"+id).appendChild(pgspan);

			setPagingInfo(t);
			if(displayLoader) showLoader(t,"none");
		}

		if(btnreset && fltgrid)
		{
			var rdiv = findOrCreateElm( "div", t.tf_buttonDiv );
			//# right div containing reset button
			var rbutton;
			try {
				var sel = window.getSelection();
				rbutton = createElm("input",
						    ["id","select_btn_"+id],
						    ["type","button"],
						    ["value","Select Table"],
						    ["onclick","javascript:TF_SelectTable('"+id+"');"]);
				rdiv.appendChild(rbutton);
			} catch(e) {}
			rbutton = createElm("input",
					    ["id","create_printable_"+id],
					    ["type","button"],
					    ["value","Create Printable"],
					    ["onclick","javascript:TF_CreatePrintable('"+id+"');"]);
			rdiv.appendChild(rbutton);
 			rbutton = createElm("input",
					    ["id","refresh_btn_"+id],
					    ["type","button"],
					    ["value","Refresh Display"],
					    ["onclick","javascript:TF_RefreshDisplay('"+id+"');"]);
			rdiv.appendChild(rbutton);
			rbutton = createElm("input",
					    ["id","show_btn_"+id],
					    ["type","button"],
					    ["value","Hide Filters"],
					    ["onclick","javascript:TF_InvertFilterGrid('"+id+"');"]);
			rdiv.appendChild(rbutton);
			rbutton = createElm("input",
					    ["id","reset_btn_"+id],
					    ["type","button"],
					    ["value",btnreset_text],
					    ["onclick","javascript:clearFilters('"+id+"');Filter('"+id+"');"]);
			rdiv.appendChild(rbutton);
			var xspan = createElm("span",
					      ["id","switch_filter_mode_btn_"+id]);
			rdiv.appendChild(xspan);
			var yspan = createElm("span",
					     ["id","switch_filter_mode_btn_"+id]);
			t.tf_FilterButtonSpan = yspan;
			xspan.appendChild(yspan);
			rbutton = createElm("input",
					    ["id","mode_btn_"+id],
					    ["type","button"],
					    ["value","Switch to Multiple Selection"],
					    ["onclick","javascript:TF_InvertFilterMode('"+id+"');"]);
			yspan.appendChild(rbutton);
			var zspan = createElm("span",
				          ["id","apply_filter_btn_"+id]);
			yspan.appendChild(zspan);
			rbutton = createElm("input",
					    ["type","button"],
					    ["value","Apply Filter"],
					    ["onclick","javascript:Filter('"+id+"');"]);
			t.tf_ApplyFilterButton = rbutton;
			rbutton = createElm("input",
					    ["id","add_btn_"+id],
					    ["type","button"],
					    ["value","Add Summary"],
					    ["onclick","javascript:TF_AddSummary('"+id+"');"]);
			rdiv.appendChild(rbutton);
			var xdiv = findOrCreateElm( "div",t.tf_customFilterDiv );
			var xtext = createElm("span");
			xtext.innerHTML = "Custom filter: ";
			xdiv.appendChild(xtext);
			rbutton = createElm("input",
					    ["id","fltx_active_"+id],
					    ["type","checkbox"],
					    ["value","active"],
					    ["onclick","javascript:Filter('"+id+"');"]);
			t.tf_CustomFilterInputActive = rbutton;
			xdiv.appendChild(rbutton);
			var xinput = createElm("input",
					       ["id","fltx_"+id],
					       ["type","text"],
					       ["class",inpclass],
					       ["maxlength",1024],
					       ["size",128]);
			xinput.className = inpclass;
			t.tf_CustomFilterInput = xinput;
			if(enterkey) xinput.onkeypress = DetectKey;
			xdiv.appendChild(xinput);
			if (xdiv.tf_Created) rdiv.appendChild(xdiv);
			var sdiv = findOrCreateElm("div", t.tf_summaryDiv);
			if (sdiv.tf_Created) infdiv.appendChild(sdiv)
			if (rdiv.tf_Created) infdiv.appendChild(rdiv);
		}

	}//#if displaynrows etc.

	if(colWidth)
	{
		t.tf_colWidth = f["col_width"];
		setColWidths(t);
	}

	if(alternateBgs && !alternateRowsInitialized && !displayPaging)
		setAlternateRows(t);

	if(colOperation)
	{
		t.tf_colOperation = f["col_operation"];
		setColOperation(t);
	}

	if(rowVisibility)
	{
		t.tf_rowVisibility = f["rows_always_visible"];
		if(displayPaging) setVisibleRows(t);
	}

	if(bindScript)
	{
		t.tf_bindScript = f["bind_script"];
		if(	t.tf_bindScript!=undefined &&
			t.tf_bindScript["target_fn"]!=undefined )
		{//#calls a fn if defined
			t.tf_bindScript["target_fn"].call(null,id);
		}
	}//#if bindScript
	if (t.tf_setTitle) {
		if (document.tfBaseTitle == null) {
			document.tfBaseTitle = document.title;
			document.tfOriginalBaseTitle = document.title;
		} else
			alert("Cannot use set_title on more than one table!");
	}
	if (t.tf_titleElement != undefined) {
		var elt = grabEBI(t.tf_titleElement);
		if (elt != null)
			elt.tfBaseTextContent = elt.textContent;
		else
			t.tf_titleElement = undefined;
	}
	if(baseTitle != undefined) setBaseTitle(t, baseTitle);
	t.tf_gridVisible = 1;
}

function PopulateOptions(id,cellIndex,opts, slc,multi)
/*#====================================================
 *#	- populates select
 *#	- adds only 1 occurence of a value
 *#=====================================================*/
{
	var t = grabEBI(id);
	var ncells = t.tf_ncells, opt0txt = t.tf_display_allText;
	var sort_opts = t.tf_sortSlc, paging = t.tf_displayPaging;
	var OptArray = new Array();
	var optIndex = 0; //# option index
	var currOpt = new Option(opt0txt,"",false,false); //#1st option
	slc.options[optIndex] = currOpt;
	var hasEmptyOpt = false;

	if (opts) {
		for (var k in opts) {
			if (opts[k] == '') hasEmptyOpt = true;
			OptArray.push(opts[k]);
		}
	} else {
		var row = grabTag(t,"tr");
		var start_row = t.tf_ref_row - 2; //# Filters are not in yet
		for(var k=start_row; k < row.length; k++)
		{
			var cell, nchilds, this_cell, cell_data, is_matched;
			var r = row[k];
			if (r.parentNode && (r.parentNode.nodeName == "THEAD" ||
					     r.parentNode.nodeName == "TFOOT")) continue;
			cell = r.cells;
			nchilds = cell.length;

			this_cell = cell[cellIndex];
			if (this_cell != null) {
				var cell_contents = [];
				if (multi)
					cell_contents = getCellFilterValues(this_cell);
				else
					cell_contents = [getCellFilterValue(this_cell)];
				//# checks if celldata is already in array
				isMatched = false;
				for (c in cell_contents) {
					cell_data = cell_contents[c];
					if (cell_data == '') hasEmptyOpt = true;
					for(w in OptArray) {
						if( cell_data == OptArray[w] ) {
							isMatched = true;
							break;
						}
					}
					if(!isMatched) OptArray.push(cell_data);
				}
			}//#this_cell
		}//#for k

		if(sort_opts) OptArray.sort();
	}
	if (multi && !hasEmptyOpt) {
		var currOpt = new Option('', ' ', false, false);
		optIndex++;
		slc.options[optIndex] = currOpt;
	}
	for(var opt in OptArray) {
		optIndex++;
		var currOpt = new Option(OptArray[opt],OptArray[opt] == '' ? ' ' : OptArray[opt],false,false);
		slc.options[optIndex] = currOpt;
	}

}

function getFilterID(id,mode)
{
	var t = grabEBI(id);
	id = grabID(id);
	if (!t) return "";
	if (!mode) mode = t.tf_filterMode;
	if (mode == "advanced") return "fltrow_advanced_" + id;
	else if (mode == "basic") return "fltrow_basic_" + id;
	else if (mode == "multi") return "fltrow_basic_" + id;
	else return "";
}

function getFilterMode(id)
{
	var t = grabEBI(id);
	id = grabID(id);
	if (!t) return undefined;
	return t.tf_filterMode;
}

function getColumnFilterMode(id, col)
{
	var t = grabEBI(id);
	id = grabID(id);
	if (!t) return undefined;
	return t.tf_Obj["col_" + col];
}

function findSelect(cell)
{
	for (var i = 0; i < cell.childNodes.length; i++) {
		if (cell.childNodes[i].nodeName == "SELECT") {
			return cell.childNodes[i];
		}
	}
}

function PopulateOptionList(id,cols, fltb)
/*#====================================================
 *#	- populates select
 *#	- adds only 1 occurence of a value
 *#=====================================================*/
{
	var t = grabEBI(id);
	var ncells = t.tf_ncells, opt0txt = t.tf_display_allText;
	var sort_opts = t.tf_sortSlc, paging = t.tf_displayPaging;

	var OptArrayArray = new Array();
	var i;

	for (i in cols) {
	    var cellIndex = cols[i];
	    var currOpt = new Option(opt0txt,"",false,false); //#1st option
	    OptArrayArray[i] = new Array();
	    var slc = findSelect(fltb.cells[cellIndex]);

	    slc.options[0] = currOpt;
	}

	var row = grabTag(t,"tr");
	var start_row = t.tf_ref_row - 2; //# Filters are not in the table yet
	for(var k=start_row; k < row.length; k++)
	{
		var cell, nchilds, this_cell, cell_data, is_matched;
		var r = row[k];
		if (r.parentNode && (r.parentNode.nodeName == "THEAD" ||
				     r.parentNode.nodeName == "TFOOT")) continue;
		cell = row[k].cells;
		nchilds = cell.length;

		for (i in cols) {
			var cellIndex = cols[i];
			this_cell = cell[cellIndex];
			if (this_cell != null) {
				cell_data = getCellFilterText(this_cell);
				//# checks if celldata is already in array
				isMatched = false;
				for(w in OptArrayArray[i]) {
					if( cell_data == OptArrayArray[i][w] ) {
						isMatched = true;
						break;
					}
				}
				if(!isMatched) OptArrayArray[i].push(cell_data);
			}//#this_cell
		}//#for i
	}//#for k

	for (i in cols) {
		var OptArray = OptArrayArray[i];
		var cellIndex = cols[i];
		var k = 1;

		if(sort_opts) OptArray.sort();
		var slc = findSelect(fltb.cells[cellIndex]);
		for(var opt in OptArray) {
			var currOpt = new Option(OptArray[opt],OptArray[opt] == '' ? ' ' : OptArray[opt],false,false);
			slc.options[k++] = currOpt;
		}
	}
}

function FilterIfSingle(id, shadowOnly)
{
	var t = grabEBI(id);
	if (t.tf_filterMode != "multi") Filter(id, shadowOnly);
}

function Filter(id, shadowOnly)
/*#====================================================
 *#	- Filtering fn
 *#	- gets search strings from SearchFlt array
 *#	- retrieves data from each td in every single tr
 *#	and compares to search string for current
 *#	column
 *#	- tr is hidden if all search strings are not
 *#	found
 *#=====================================================*/
{
	showLoader(id,"");
	var t = grabEBI(id);
	var SearchFlt = getFilters(t);
	t.tf_Obj!=undefined ? fprops = t.tf_Obj : fprops = new Array();
	var SearchArgs = new Array();
	var ColType = new Array();
	var DataType = new Array();
	var RegExps = new Array();
	var NumOps = new Array();
	var Numvals1 = new Array();
	var Numvals2 = new Array();
	var ncells = getCellsNb(t);
	var hiddenrows = 0;
	var ematch = t.tf_exactMatch;
	var showPaging = t.tf_displayPaging;
	var filterMap = new Array();
	var titleMap = new Array();
	var invertMap = new Array();
	var exactMap = new Array();

	var lastNonNullSearchArg = -1;
	var offset = t.indexAdded ? -1 : 0;

	for(var i=0; i < SearchFlt.length; i++) {
		var io = i + offset;
		var searchArg = getFilterValues(SearchFlt, i).join(',');
		ColType.push(fprops["col_"+io]);
		DataType.push(sorttable.getColDataType(t, i));
		var exact = false;
		var invert = false;
		var re_quote = true;
		var isSelect = ColType[i] == "select" || ColType[i] == "multi";
		if (t.tf_filterMode == "advanced" && isSelect)
			ColType[i] = "text";
		if (searchArg != '') {
			if (t.tf_setTitle && getFilterCol(SearchFlt, i) != undefined) {
			        var sa = searchArg;
				if (sa == " ") sa = "''";
				else if (sa == "=") sa = "=''";
				else if (sa == "= ") sa = "=''";
				else if (sa == "!=") sa = "!=''";
				else if (sa == "!= ") sa = "!=''";
				titleMap.push(getFilterCol(SearchFlt, i) + ": " + sa);
			}
			if (isSelect && t.tf_filterMode == "multi") {
				var fvals = getFilterValues(SearchFlt, i, true);
				if (ColType[i] == "select") {
					searchArg = '^(' + fvals.join("|") + ')$';
				} else {
					searchArg = buildMultiFilterString(fvals);
				}
				re_quote = false;
			} else if (ematch || (ColType[i] == "select" && t.tf_filterMode != "advanced") || /^=/.test(searchArg)) {
				searchArg = searchArg.replace(/^=$/, " ");
				searchArg = searchArg.replace(/^=/, "");
				exact = true;
			} else if (!isSelect && /^~/.test(searchArg)) {
				searchArg = searchArg.replace(/^~$/, " ");
				searchArg = searchArg.replace(/^~/, "");
				exact = false;
				re_quote = false;
			} else if (/^\!/.test(searchArg)) {
				searchArg = searchArg.replace(/^\!/, "");
				invert = true;
				if (/^=/.test(searchArg)) {
					searchArg = searchArg.replace(/^=$/, " ");
					searchArg=searchArg.replace(/^=/, "");
					exact = true;
				} else if  (/^~/.test(searchArg)) {
					searchArg = searchArg.replace(/^~$/, " ");
					searchArg=searchArg.replace(/^~/, "");
					exact = false;
					re_quote = false;
				}
			}
			if (searchArg == ' ') exact = true;
			if (searchArg != '') filterMap.push(i);
		}
		SearchArgs.push(searchArg);
		invertMap.push(invert);
		exactMap.push(exact);
		var numOp = "";
		var numVal1 = 0;
		var numVal2 = 0;
		if (!exact[i] && !isSelect && searchArg != "") {
			if (/^<=/.test(searchArg)) {
				numOp = "<=";
				numVal1 = searchArg.replace(/<=/,"");
			} else if (/^>=/.test(searchArg)) {
				numOp = ">=";
				numVal1 = searchArg.replace(/>=/,"");
			} else if (/^</.test(searchArg)) {
				numOp = "<";
				numVal1 = searchArg.replace(/</,"");
			} else if (/^>/.test(searchArg)) {
				numOp = ">";
				numVal1 = searchArg.replace(/>/,"");
			} else if ((DataType[i] == "date" &&
				    /[0-9][0-9][0-9][0-9](-[0-9][0-9](-[0-9][0-9])?)?<>[0-9][0-9][0-9][0-9](-[0-9][0-9](-[0-9][0-9])?)?/) ||
				   /-?[0-9]+<>-?[0-9]+$/.test(searchArg)) {
				numOp = "<>";
				var nums = searchArg.match(/-?[0-9-]+/g);
				numVal1 = ColType[i] == "number" ?
					parseFloat(nums[0]) : nums[0];
				numVal2 = ColType[i] == "number" ?
					parseFloat(nums[1]) : nums[1];
				if (numVal1 > numVal2) {
					var tmp = numVal2;
					numVal2 = numVal1;
					numVal1 = tmp;
				}
			}
		}
		NumOps.push(numOp);
		Numvals1.push(numVal1);
		Numvals2.push(numVal2);
		if (t.tf_filterMode != "advanced" && re_quote) {
			searchArg = regexpEscape(searchArg);
			if (searchArg && !exact[i])
				searchArg = searchArg.replace(/,/g, '|');
		}
		RegExps.push(new RegExp(searchArg, "i"));
	}

	sorttable.initShadowRows(t);
	var start_row = t.tf_ref_row;
	var rows = t.shadowRows;
	var nrows = rows.length;

	var rowSetChanged = false;
	var titleString = "";
	var customFilter = getCustomFilterActive(t) ? buildCustomFilter(t, getCustomFilter(t)) : null;

	if (customFilter || filterMap.length > 0) {
		for(var k=start_row; k < nrows; k++)
		{
			var row = rows[k];
			if (row.invalidRow) continue;
			var isValid = true;

			for(var jj in filterMap)//# this loop retrieves cell data
			{
				var j = filterMap[jj];
				var invert = invertMap[j];
				var exact = exactMap[j];
				var cell = sorttable.getCell(row, j);
				if (exact) {
					isValid = invert;
					var sa = SearchArgs[j];
					var cell_data = getCellFilterText(cell);
					if (sa == cell_data ||
					    (sa == ' ' && cell_data == ''))
						isValid = !invert;
				} else if (NumOps[j] != "") {
					isValid = !invert;
					var isNum = DataType[j] == "number";
					var num = isNum ? getCellFilterNum(cell) : getCellFilterText(cell);
					var no = NumOps[j];
					var nv = Numvals1[j];
					if ((isNum && isNaN(num)) ||
					    (no == '<=' && num >  nv) ||
					    (no == '>=' && num <  nv) ||
					    (no == '<'  && num >= nv) ||
					    (no == '>'  && num <= nv) ||
					    (no == '<>' &&
					     (num < nv || num > Numvals2[j])))
						isValid = invert;
				} else {
					isValid = RegExps[j].test(getCellFilterText(cell));
					if (invert) isValid = !isValid;
				}
				if (!isValid) break;
			}//#for j

			if (isValid && customFilter) isValid = customFilter(row);

			if (!rowSetChanged && isValid == row.hidden) rowSetChanged = true;
			row.hidden = !isValid;
			if (!isValid) hiddenrows++;
		}//# for k
		if (titleMap.length > 0) titleString = " (" + titleMap.join(", ") + ")";
       	}

	//# But the converse is not true!
	if (t.tf_hiddenRows != hiddenrows) rowSetChanged = true;
	t.tf_hiddenRows = hiddenrows;
	sorttable.adviseShowAll(t, hiddenrows == 0);

	if (rowSetChanged) {
		t.tf_nRows = nrows - start_row - hiddenrows - t.invalidRows;
		if (showPaging) {
			t.tf_startPagingRow=0;
			setPagingInfo(t);
		} else
			applyFilterProps(t);
		if (! shadowOnly)
		      sorttable.repopulateTable(t, t.tf_alternateBgs);
	}
	TF_UpdateAllSummaries(id);
	setTitle(t, titleString);
	delete titleMap;
	delete SearchArgs;
	delete ColType;
	delete DataType;
	delete RegExps;
	delete NumOps;
	delete Numvals1;
	delete Numvals2;
	delete exactMap;
	delete invertMap;
	delete filterMap;
}

function setPagingInfo(id)
/*#====================================================
 *#	- Paging fn
 *#	- calculates page # according to valid rows
 *#	- refreshes paging select according to page #
 *#	- Calls GroupByPage fn
 *#=====================================================*/
{
	var t = grabEBI(id);
	id = grabID(id);
	var start_row = t.tf_ref_row;//#filter start row
	var pagelength = t.tf_pagingLength;
	var row = grabTag(t,"tr");
	var mdiv = grabEBI("mdiv_"+id);
	var slcPages = grabEBI("slcPages_"+id);
	var pgspan = grabEBI("pgspan_"+id);
	var nrows = 0;

	for(var j=start_row; j < row.length; j++)//#counts rows to be grouped
	{
		if(!row[j].hidden) nrows++;
	}//#for j

	var npg = Math.ceil( nrows/pagelength );//#calculates page nb
	pgspan.innerHTML = npg; //#refresh page nb span
	slcPages.innerHTML = "";//#select clearing shortcut

	if( npg>0 )
	{
		mdiv.style.visibility = "visible";
		for(var z=0; z < npg; z++)
		{
			var currOpt = new Option((z+1),z*pagelength,false,false);
			slcPages.options[z] = currOpt;
		}
	} else { //# if no results paging select is hidden
		mdiv.style.visibility = "hidden";
	}

	GroupByPage(t);
}

function GroupByPage(id)
/*#====================================================
 *#	- Paging fn
 *#	- Displays current page rows
 *#=====================================================*/
{
	showLoader(id,"");
	var t = grabEBI(id);
	var start_row = t.tf_ref_row;//#filter start row
	var pagelength = parseInt( t.tf_pagingLength );
	var paging_start_row = parseInt( t.tf_startPagingRow );//#paging start row
	var paging_end_row = paging_start_row + pagelength;
	var row = grabTag(t,"tr");
	var nrows = 0;
	var h = 0;

	for (var j=start_row; j < row.length; j++)
	{
		var r = row[j];
		if (r.hidden || r.invalidRow) continue;
		if( h>=paging_start_row && h < paging_end_row )
		{
			nrows++;
			r.style.display = "";
			r.style.visibility = "";
		}
		else
		{
			if (stCollapseWorks)
				r.style.display = "none";
			else
				r.style.visibility = "collapse";
		}
		h++;
	}//#for j

	t.tf_nRows = parseInt(nrows);
	applyFilterProps(id);//#applies filter props after filtering process
}

function applyFilterProps(id)
/*#====================================================
 *#	- checks fns that should be called
 *#	after filtering and/or paging process
 *#=====================================================*/
{
	t = grabEBI(id);
	var rowsCounter = t.tf_rowsCounter;
	var nRows = t.tf_nRows;
	var rowVisibility = t.tf_rowVisibility;
	var alternateRows = t.tf_alternateBgs;
	var colOperation = t.tf_colOperation;

	if( rowsCounter ) showRowsCounter( id,parseInt(nRows) );//#refreshes rows counter
	if( rowVisibility ) setVisibleRows(id);//#shows rows always visible
	if( colOperation  ) setColOperation(id);//#makes operation on a col
	showLoader(id,"none");
}

function hasGrid(id)
/*#====================================================
 *#	- checks if table has a filter grid
 *#	- returns a boolean
 *#=====================================================*/
{
	var r = false, t = grabEBI(id);
	if (t != undefined && t != null && t.tf_hasGrid) return true;
	return r;
}

function checkGrid(id, fn)
/*#====================================================
 *#	- alerts and throws an error if no grid
 *#=====================================================*/
{
	if (!hasGrid(id))
	{
		alert(fn + "(): filter for '" + id + "' not initialized");
		throw("filter_not_initialized");
	}
}

function getCellsNb(id,nrow)
/*#====================================================
 *#	- returns number of cells in a row
 *#	- if nrow param is passed returns number of cells
 *#	of that specific row
 *#=====================================================*/
{
  	var t = grabEBI(id);
	var trow;
	if(nrow == undefined) trow = grabTag(t,"tr")[0];
	else trow = grabTag(t,"tr")[nrow];
	var n = getChildElms(trow);
	return n.cells.length;
}

function getRowsNb(id)
/*#====================================================
 *#	- returns total nb of filterable rows starting
 *#	from reference row if defined
 *#=====================================================*/
{
	var t = grabEBI(id);
	var trow = t.tf_ref_row;
	var ntrs = grabTag(t,"tr").length;
	var foot = t.tFoot ? t.tFoot.rows.length : 0;
	return parseInt(ntrs-trow-foot);
}

function getFilters(id)
/*#====================================================
 *#	- returns an array containing filters ids
 *#	- Note that hidden filters are also returned
 *#=====================================================*/
{
	var SearchFltId = new Array();
	var t = grabEBI(id);
	id = grabID(id);
	filterID = getFilterID(t);
	//# FIXME: Need to handle disassociated filter row!
	if(t.tf_fltGrid)
	{
		for (var j = 0; j < t.rows.length; j++) {
			if (t.rows[j].id == filterID) {
				var count = sorttable.getColCount(t);
				for(var i=0; i < count; i++) {
					var cell = sorttable.getRowCell(t, j, i);
					SearchFltId.push(cell.firstChild);
				}
				break;
			}
		}
	}
	return SearchFltId;
}

function getFilterCol(filters, col)
/*#====================================================
 *#	- returns the column name corresponding to a column index
 *#=====================================================*/
{
	try {
		var c1 = filters[col].parentNode.colName;
		return c1;
        } catch (e) {
		return undefined;
	}
}

function getFilterValue(filters, col)
/*#====================================================
 *#	- returns a filter value
 *#=====================================================*/
{
	try {
		var val = filters[col].value;
		return val;
        } catch (e) {
		return '';
	}
}

function buildMultiFilterString(fvals)
/*#====================================================
 *#	- returns a filter string suitable for multi-value columns
 *#=====================================================*/
{
	var hasEmpty = fvals[0] == '';
	var components = [];
	if (hasEmpty) {
		components.push('(^$)');
		fvals.shift();
	}
	while (fvals.length > 0 && fvals[0] == undefined) {
		fvals.shift();
	}
	if (fvals.length == 1) {
		components.push('(^|\\b)' + fvals[0] + '($|\\b)');
	} else if (fvals.length > 0) {
		components.push('(^|\\b)(' + fvals.join("|") + ')($|\\b)');
	}
	return components.join("|");
}

function getFilterValues(filters, col, escape)
/*#====================================================
 *#	- returns a filter value.  If escape is true, regexp-escape all
 *#       values and return any empty value as the first element.
 *#=====================================================*/
{
	if (col == undefined || col == null || col < 0 || col >= filters.length)
		return undefined;
	var filter = filters[col];
	if (filter.nodeName == "SELECT") {
		var answer = [];
		for (var j = 0; j < filter.length; j++) {
			if (filter.options[j].selected) {
				var text = filter.options[j].value;
				if (escape) {
					if (text == ' ')
						answer.unshift('');
					else
						answer.push(regexpEscape(text));
				} else {
					answer.push(text);
				}
			}
		}
		return answer;
	} else {
		return [getFilterValue(filters, col)];
	}
}

function setFilterValue(filters, col, val)
/*#====================================================
 *#	- sets a filter value; returns whether it changed
 *#=====================================================*/
{
	var answer = false;
	if (col == undefined || col == null || col < 0 || col >= filters.length)
		return false;
	var filter = filters[col];
	if (filter.nodeName == "SELECT") {
		for (var j = 0; j < filter.length; j++) {
			if (filter.options[j].value == val) {
				if (!filter.options[j].selected) {
					filter.options[0].selected = false;
					filter.options[j].selected = true;
					return true;
				} else {
					return false;
				}
			}
		}
	} else {
		try {
			if (filter.value != val) {
				filter.value = val;
				answer = true;
			}
		} catch (e) {
		}
	}
	return answer;
}

function clearFilterValue(filters, col)
/*#====================================================
 *#	- clears a filter value; returns whether it changed
 *#=====================================================*/
{
	if (col == undefined || col == null || col < 0 || col >= filters.length)
		return false;
	var filter = filters[col];
	var answer = false;
	if (filter.nodeName == "SELECT") {
		if (! filter.options[0].selected) {
			filter.options[0].selected = true;
			answer = true;
		}
		for (var j = 1; j < filter.length; j++) {
			if (filter.options[j].selected) {
				filter.options[j].selected = false;
				answer = true;
			}
		}
	}
	if (getFilterValue(filters, col) != '') {
		setFilterValue(filters, col, "");
		answer = true;
	}
	return answer;
}

function clearFilters(id)
/*#====================================================
 *#	- clears grid filters; returns whether anything changed
 *#=====================================================*/
{
	var answer = false;
	var searchFlt = getFilters(id);
	for(i in searchFlt) {
		answer |= clearFilterValue(searchFlt, i);
	}
	return answer;
}

function showLoader(id,p)
/*#====================================================
 *#	- displays/hides loader div
 *#=====================================================*/
{
	id = grabID(id);
	var loader = grabEBI("load_"+id);
	if(loader != null && p=="none")
		setTimeout("grabEBI('load_"+id+"').style.display = '"+p+"'",150);
	else if(loader != null && p!="none") loader.style.display = p;
}

function showRowsCounter(id,p)
/*#====================================================
 *#	- Shows total number of filtered rows
 *#=====================================================*/
{
 	var t = grabEBI(id);
	var totrows = t.tf_RowsSpan;
	if(totrows != null && totrows.nodeName.toLowerCase() == "span" )
		totrows.innerHTML = p;
}

function getChildElms(n)
/*#====================================================
 *#	- checks passed node is a ELEMENT_NODE nodeType=1
 *#	- removes TEXT_NODE nodeType=3
 *#=====================================================*/
{
	if(n.nodeType == 1)
	{
		var enfants = n.childNodes;
		for(var i=0; i < enfants.length; i++)
		{
			var child = enfants[i];
			if(child.nodeType == 3) n.removeChild(child);
		}
		return n;
	}
}

function getCellTextInternal(n)
/*#====================================================
 *#	- returns text + text of child nodes of a cell
 *#=====================================================*/
{
	var str = "";
	var enfants = n.childNodes;
	var nenfants = enfants.length
	for(var i=0; i < nenfants; i++)
	{
		var child = enfants[i];
		if(child.nodeType == 3) str+= child.data;
		else str+= getCellTextInternal(child);
	}
	return str;
}

function getCellText(n)
/*#====================================================
 *#	- returns text + text of child nodes of a cell
 *#=====================================================*/
{
	if (n.textCached) return n.textCache;
	var str = getCellTextInternal(n).replace(/^\s+|\s+$/g, '');
	n.textCache = str;
	n.textCached = true;
	return str;
}

function getCellFilterText(n)
/*#====================================================
 *#	- returns text + text of child nodes of a cell
 *#=====================================================*/
{
	if (n.filterTextCached) return n.filterTextCache;
	var str;
	var textval;
	var mtch = n.className.match(/\bTF_filterVal='([^\']*)'/);
	if (mtch)
	    str = mtch[1];
	else
	    str = getCellText(n);
	n.filterTextCache = str;
	n.filterTextCached = true;
	return str;
}

function getCellFilterValues(n)
/*#====================================================
 *#	- returns list of values (comma-separated)
 *#=====================================================*/
{
	if (n.filterValuesCached) return n.filterValuesCache;
	var str = getCellFilterText(n);
	str = str.replace(/^\s+|\s+$/g, '');
	str = str.replace(/\s+,|,\s+/g, ',');
	n.filterValuesCache = str.split(",");
	n.filterValuesCached = true;
	return n.filterValuesCache;
}

function getCellNum(n)
/*#====================================================
 *#	- returns numerical representation of cell text
 *#=====================================================*/
{
	if (n.numCached) return n.numCache;
	n.numCache = parseFloat(getCellText(n));
	n.numCached = true;
	return n.numCache;
}

function getCellFilterNum(n)
/*#====================================================
 *#	- returns numerical representation of cell text
 *#=====================================================*/
{
	if (n.filterNumCached) return n.filterNumCache;
	n.filterNumCache = parseFloat(getCellFilterText(n));
	n.filterNumCached = true;
	return n.filterNumCache;
}

function getColValues(id,colindex,num)
/*#====================================================
 *#	- returns an array containing cell values of
 *#	a column
 *#	- needs following args:
 *#		- filter id (string)
 *#		- column index (number)
 *#		- a boolean set to true if we want only
 *#		numbers to be returned
 *#=====================================================*/
{
	var t = grabEBI(id);
	var row = grabTag(t,"tr");
	var nrows = row.length;
	var start_row = t.tf_ref_row;//#filter start row
	var ncells = getCellsNb( id,start_row );
	var colValues = new Array();

	for(var i=start_row; i < nrows; i++)//#iterates rows
	{
		var cell = getChildElms(row[i]).cells;
		var nchilds = cell.length;

		if(nchilds == ncells)//# checks if row has exact cell #
		{
			for(var j=0; j < nchilds; j++)//# this loop retrieves cell data
			{
				if(j==colindex && row[i].style.display=="" )
				{
					var cell_data = getCellText( cell[j] ).toLowerCase();
					(num) ? colValues.push( parseFloat(cell_data) ) : colValues.push( cell_data );
				}//#if j==k
			}//#for j
		}//#if nchilds == ncells
	}//#for i
	return colValues;
}

function setColWidths(id)
/*#====================================================
 *#	- sets widths of columns
 *#=====================================================*/
{
	checkGrid(id, "setColWidths");
	var t = grabEBI(id);
	t.style.tableLayout = "fixed";
	var colWidth = t.tf_colWidth;
	var start_row = t.tf_ref_row;//#filter start row
	var row = grabTag(t,"tr")[0];
	var ncells = getCellsNb(id,start_row);
	for(var i=0; i < colWidth.length; i++)
	{
		for(var k=0; k < ncells; k++)
		{
			cell = row.cells[k];
			if(k==i) cell.style.width = colWidth[i];
		}//#var k
	}//#for i
}

function setVisibleRows(id)
/*#====================================================
 *#	- makes a row always visible
 *#=====================================================*/
{
	checkGrid(id, "setVisibleRows");
	var t = grabEBI(id);
	var row = grabTag(t,"tr");
	var nrows = row.length;
	var showPaging = t.tf_displayPaging;
	var visibleRows = t.tf_rowVisibility;
	for(var i=0; i < visibleRows.length; i++)
	{
		if(visibleRows[i]<=nrows)//#row index cannot be > nrows
		{
		    	row[visibleRows[i]].hidden = false;
		}//#if
	}//#for i
}

function setAlternateRows(t)
/*#====================================================
 *#	- alternates row colors for better readability
 *#=====================================================*/
{
	var row = grabTag(t,"tr");
	var nrows = row.length;
	var start_row = t.tf_ref_row;//#filter start row
	var j = 0;
	for(var i=start_row; i < nrows; i++)
	{
	    	var r = row[i];
		if (r.hidden)
			continue;
		if (j % 2 == 1)
			r.className = r.className.replace(/\bodd\b/,'even');
		else
			r.className = r.className.replace(/\beven\b/,'odd');
		j++;
	}
}

function setColOperation(id)
/*#====================================================
 *#	- Calculates values of a column
 *#	- params are stored in 'colOperation' table attribute
 *#		- colOperation["id"] contains ids of elements
 *#		showing result (array)
 *#		- colOperation["col"] contains index of
 *#		columns (array)
 *#		- colOperation["operation"] contains operation
 *#		type (array, values: sum, mean)
 *#		- colOperation["write_method"] array defines
 *#		which method to use for displaying the
 *#		result (innerHTML, setValue, createTextNode).
 *#		Note that innerHTML is the default value.
 *#
 *#	!!! to be optimised
 *#=====================================================*/
{
	checkGrid(id, "setColOperation");
	var t = grabEBI(id);
	var labelId = t.tf_colOperation["id"];
	var colIndex = t.tf_colOperation["col"];
	var operation = t.tf_colOperation["operation"];
	var outputType =  t.tf_colOperation["write_method"];
	var precision = 2;//#decimal precision

	if( (typeof labelId).toLowerCase()=="object"
		&& (typeof colIndex).toLowerCase()=="object"
		&& (typeof operation).toLowerCase()=="object" )
	{
		var row = grabTag(t,"tr");
		var nrows = row.length;
		var start_row = t.tf_ref_row;//#filter start row
		var ncells = getCellsNb( id,start_row );
		var colvalues = new Array();

		for(var k=0; k < colIndex.length; k++)//#this retrieves col values
		{
			colvalues.push( getColValues(id,colIndex[k],true) );
		}//#for k

		for(var i=0; i < colvalues.length; i++)
		{
			var result=0, nbvalues=0;
			for(var j=0; j < colvalues[i].length; j++ )
			{
				var cvalue = colvalues[i][j];
				if( !isNaN(cvalue) )
				{
					switch( operation[i].toLowerCase() )
					{
						case "sum":
							result += parseFloat( cvalue );
						break;
						case "mean":
							nbvalues++;
							result += parseFloat( cvalue );
						break;
						//#add cases for other operations
					}//#switch
				}
			}//#for j

			switch( operation[i].toLowerCase() )
			{
				case "mean":
					result = result/nbvalues;
				break;
			}

			if(outputType != undefined && (typeof outputType).toLowerCase()=="object")
			//#if outputType is defined
			{
				result = result.toFixed( precision );
				if( grabEBI( labelId[i] )!=undefined )
				{
					switch( outputType[i].toLowerCase() )
					{
						case "innerhtml":
							grabEBI( labelId[i] ).innerHTML = result;
						break;
						case "setvalue":
							grabEBI( labelId[i] ).value = result;
						break;
						case "createtextnode":
							var oldnode = grabEBI( labelId[i] ).firstChild;
							var txtnode = createText( result );
							grabEBI( labelId[i] ).replaceChild( txtnode,oldnode );
						break;
						//#other cases could be added
					}//#switch
				}
			} else {
				try
				{
					grabEBI( labelId[i] ).innerHTML = result.toFixed( precision );
				} catch(e){ }//#catch
			}//#else

		}//#for i

	}//#if typeof
}

function grabEBI(id)
/*#====================================================
 *#	- this is just a getElementById shortcut
 *#=====================================================*/
{
	if (typeof id == "string")
		return document.getElementById( id );
	else
		return id;
}

function grabID(id)
/*#====================================================
 *#	- this is just a getElementById shortcut
 *#=====================================================*/
{
	if (typeof id == "string")
		return id;
	else
		return id.id;
}

function grabClass(id)
/*#====================================================
 *#	- this is just a getElementByClass shortcut
 *#=====================================================*/
{
	return document.getElementByClass( id );
}

function grabTag(obj,tagname)
/*#====================================================
 *#	- this is just a getElementsByTagName shortcut
 *#=====================================================*/
{
	return obj.getElementsByTagName( tagname );
}

function regexpEscape(str)
/*#====================================================
 *#	- escapes special characters [\^$.|?*+()
 *#	for regexp
 *#	- Many thanks to Cedric Wartel for this fn
 *#=====================================================*/
{
	//# traite les caractères spéciaux [\^$.|?*+()
	//#remplace le carctère c par \c

	if (str == "") return;
	if (! document.escRegexps) {
		var chars = new Array('\\','[','^','$','.','|','?','*','+','(',')','/');
		document.escRegexps = new Array;
		document.escChars = new Array;
		for (e in chars) {
			var x = '\\' + chars[e];
			document.escRegexps.push(new RegExp(x, 'g'));
			document.escChars.push(x);
		}
		delete chars;
	}
	for(e in document.escChars)
		str = str.replace(document.escRegexps[e],
				  document.escChars[e]);
	return str;
}

function createElm(elm)
/*#====================================================
 *#	- returns an html element with its attributes
 *#	- accepts the following params:
 *#		- a string defining the html element
 *#		to create
 *#		- an undetermined # of arrays containing the
 *#		couple "attribute name","value" ["id","myId"]
 *#=====================================================*/
{
	var el = document.createElement( elm );
	if(arguments.length>1)
	{
		for(var i=0; i < arguments.length; i++)
		{
			var argtype = typeof arguments[i];
			switch( argtype.toLowerCase() )
			{
				case "object":
					if( arguments[i].length==2 )
						el.setAttribute( arguments[i][0],arguments[i][1] );
				break;
			}//#switch
		}//#for i
	}//#if args
	return el;
}

function findOrCreateElm(elm, id)
/*#====================================================
 *#	- returns an html element with its attributes
 *#	- accepts the following params:
 *#		- a string defining the html element
 *#		to find or create
 *#		- an undetermined # of arrays containing the
 *#		couple "attribute name","value" ["id","myId"]
 *#=====================================================*/
{
	var el = (id && document.getElementById(id));
	if (!el) {
		el = document.createElement(elm);
		el.id = id;
		el.tf_Created = true;
	}
	if (arguments.length > 2)
	{
		for(var i=0; i < arguments.length; i++)
		{
			var argtype = typeof arguments[i];
			switch( argtype.toLowerCase() )
			{
				case "object":
					if( arguments[i].length==2 )
						el.setAttribute( arguments[i][0],arguments[i][1] );
				break;
			}//#switch
		}//#for i
	}//#if args
	return el;
}

function createText(node)
/*#====================================================
 *#	- this is just a document.createTextNode shortcut
 *#=====================================================*/
{
	return document.createTextNode( node );
}

function getCustomFilter(t)
{
	return t.tf_CustomFilterString;
}

function setCustomFilter(t, str)
{
	t.tf_CustomFilterString = str;
	if (t.tf_CustomFilterInput) t.tf_CustomFilterInput.value = str;
}

function getCustomFilterActive(t)
{
	return t.tf_CustomFilterInputActive.checked;
}

function setCustomFilterActive(t, mode)
{
	t.tf_CustomFilterInputActive.checked = mode;
}

function setBaseTitle(t, baseTitle)
{
	if (t.tf_setTitle) document.tfBaseTitle = baseTitle;
	if (t.tf_titleElement) {
		var elt = grabEBI(t.tf_titleElement);
		if (elt) elt.tfBaseTextContent = baseTitle;
	}
}

function setTitle(t, titleString) {
	if (t.tf_setTitle) document.title = document.tfBaseTitle + titleString;

	if (t.tf_titleElement) {
		var elt = grabEBI(t.tf_titleElement);
		if (elt) elt.textContent = elt.tfBaseTextContent + titleString;
	}
}

function buildCustomFilter(t, str, quiet)
/*#====================================================
 *#	- Build custom filter from input string
 *#=====================================================*/
{
	var idx = 0;
	var ostr = str;
	if (!str || str == "") return null;
	var cols = sorttable.getAllCols(t);
	for (var c = 0; c < cols.length; c++) {
		if (cols[c].nodeName == "COL") {
			var col = cols[c].id;
			col = col.replace(/^col_/,'').toLowerCase();
			var xc = regexpEscape('\${' + col + '}');
			var xn = regexpEscape('#{' + col + '}');
			var rc = new RegExp(xc, 'gi');
			var rn = new RegExp(xn, 'gi');
			var sc = "getCellText(sorttable.getCell(row, " + idx + "))";
			var sn = "getCellNum(sorttable.getCell(row, " + idx + "))";
			str = str.replace(rc, sc);
			str = str.replace(rn, sn);
			idx++;
		}
	}
	var fwrap = "return (" + str + ")";
	try {
		var func = new Function("row", fwrap);
	} catch (e) {
		if (! quiet) alert("Custom filter failed: " + e);
		return null;
	}
	return func;
}

function DetectKey(e)
/*#====================================================
 *#	- common fn that detects return key for a given
 *#	element (onkeypress attribute on input)
 *#=====================================================*/
{
	var evt=(e)?e:(window.event)?window.event:null;
	if(evt)
	{
		var key=(evt.charCode)?evt.charCode:
			((evt.keyCode)?evt.keyCode:((evt.which)?evt.which:0));
		if(key=="13")
		{
			var cid, leftstr, tblid, CallFn, Match;
			cid = this.getAttribute("id");
			leftstr = this.getAttribute("id").split("_")[0];
			tblid = cid.substring(leftstr.length+1,cid.length);
			t = grabEBI(tblid);
			if (cid == "fltx_" + tblid) {
				setCustomFilter(t, grabEBI(cid).value);
				Filter(tblid);
			} else {
				t.tf_CustomFilterFunction = null;
				(t.tf_isModfilter_fn) ? t.tf_modfilter_fn.call() : Filter(tblid);
			}
		}//#if key
	}//#if evt
}

function importScript(scriptName,scriptPath)
{
	var isImported = false;
	var scripts = grabTag(document,"script");

	for (var i=0; i  <  scripts.length; i++)
	{
		if(scripts[i].src.match(scriptPath))
		{
			isImported = true;
			break;
		}
	}

	if( !isImported )//#imports script if not available
	{
		var head = grabTag(document,"head")[0];
		var extScript = createElm("script",
					  ["id",scriptName],
					  ["type","text/javascript"],
					  ["src",scriptPath]);
		head.appendChild(extScript);
	}
}//#fn importScript



/*#====================================================
 *#	- Below a collection of public functions
 *#	for developement purposes
 *#	- all public methods start with prefix 'TF_'
 *#	- These methods can be removed safely if not
 *#	needed
 *#=====================================================*/

function TF_GetFilterIds()
/*#====================================================
 *#	- returns an array containing filter grids ids
 *#=====================================================*/
{
	try{ return TblId }
	catch(e){ alert('TF_GetFilterIds() fn: could not retrieve any ids'); }
}

function TF_HasGrid(id)
/*#====================================================
 *#	- checks if table has a filter grid
 *#	- returns a boolean
 *#=====================================================*/
{
	return hasGrid(id);
}

function TF_GetFilters(id)
/*#====================================================
 *#	- returns an array containing filters ids of a
 *#	specified grid
 *#=====================================================*/
{
	try
	{
		var flts = getFilters(id);
		return flts;
	} catch(e) {
		alert('TF_GetFilters() fn: table id not found');
	}

}

function TF_GetStartRow(id)
/*#====================================================
 *#	- returns starting row index for filtering
 *#	process
 *#=====================================================*/
{
	try
	{
		var t = grabEBI(id);
		return t.tf_ref_row;
	} catch(e) {
		alert('TF_GetStartRow() fn: table id not found');
	}
}

function TF_GetColValues(id,colindex,num)
/*#====================================================
 *#	- returns an array containing cell values of
 *#	a column
 *#	- needs following args:
 *#		- filter id (string)
 *#		- column index (number)
 *#		- a boolean set to true if we want only
 *#		numbers to be returned
 *#=====================================================*/
{
	checkGrid(id, "GetColValues");
	return getColValues(id,colindex,num);
}

function TF_Filter(id)
/*#====================================================
 *#	- filters a table
 *#=====================================================*/
{
	checkGrid(id, "Filter");
	Filter(id);
}

function TF_Defilter(id)
/*#====================================================
 *#	- Undoes filtering without actually clearing filters
 *#=====================================================*/
{
	checkGrid(id, "Defilter");
	var t = grabEBI(id);
	sorttable.removeTbody(t);
	sorttable.repopulateTable(t, t.tf_alternateBgs, true);
	if (t.tf_setTitle)
		document.title = document.tfBaseTitle;
	if (t.tf_titleElement) {
		var elt = grabEBI(t.tf_titleElement);
		if (elt) elt.textContent = elt.tfBaseTextContent;
	}
}

function TF_RemoveFilterGrid(id)
/*#====================================================
 *#	- removes a filter grid
 *#=====================================================*/
{
	checkGrid(id, "RemoveFilterGrid");
	var t = grabEBI(id);
	clearFilters(t);
	id = grabID(id);
	var filterID = getFilterID(t);

	if(grabEBI("inf_"+id)!=null) t.parentNode.removeChild(t.previousSibling);

	TF_Defilter(t);

	if(t.tf_fltGrid) {
		for(var j=0; j < t.rows.length; j++) {
			if (t.rows[j].id == filterID) {
				t.deleteRow(j);
				break;
			}
		}
	}
	for(i in TblId)//#removes grid id value from array
		if(id == TblId[i]) TblId.splice(i,1);

	if (t.tf_removeFilterFunc) t.tf_removeFilterFunc(id);
}

function TF_HideFilterGrid(id)
/*#====================================================
 *#	- hides a filter grid
 *#=====================================================*/
{
	checkGrid(id, "HideFilterGrid");
	var t = grabEBI(id);
	id = grabID(id);
	if (t.tf_gridVisible == 0) return;

	if (t.tf_unfilterHide) TF_Defilter(id);

	if(t.tf_fltGrid) {
		for(j=0; j < t.rows.length; j++) {
			if (t.rows[j].id == "fltrow_basic_"+id) {
				t.rows[j].style.visibility = "collapse";
				t.rows[j].style.display = "none";
				break;
			}
		}
		for(j=0; j < t.rows.length; j++) {
			if (t.rows[j].id == "fltrow_advanced_"+id) {
				t.rows[j].style.visibility = "collapse";
				t.rows[j].style.display = "none";
				break;
			}
		}
	}
	var c;
	c = grabEBI("show_btn_"+id);
	if (c != null) c.value = "Show Filters";
	c = grabEBI("switch_filter_mode_btn_"+id);
	if (c != null) {
		try {
			c.removeChild(t.tf_FilterButtonSpan);
		} catch(e) {}
	}
	t.tf_gridVisible = 0;
}

function TF_ShowFilterGrid(id)
/*#====================================================
 *#	- shows a filter grid
 *#=====================================================*/
{
	checkGrid(id, "ShowFilterGrid");
	var t = grabEBI(id);
	id = grabID(id);
	if (t.tf_gridVisible) return;

	var filterID = getFilterID(t);

	if (t.tf_unfilterHide) Filter(id);

	var row = grabTag(t,"tr");

	if(t.tf_fltGrid) {
		for(var j=0; j < t.rows.length; j++) {
			if (t.rows[j].id == filterID) {
				t.rows[j].style.visibility = "";
				t.rows[j].style.display = "";
				break;
			}
		}
	}
	var c;
	c = grabEBI("show_btn_"+id);
	if (c != null) c.value = "Hide Filters";
	c = grabEBI("switch_filter_mode_btn_"+id);
	if (c != null) c.appendChild(t.tf_FilterButtonSpan);
	t.tf_gridVisible = 1;
}

function TF_InvertFilterGrid(id)
/*#====================================================
 *#	- shows/hides a filter grid
 *#=====================================================*/
{
	checkGrid(id, "InvertFilterGrid");
	var t = grabEBI(id);

	if(!t.tf_fltGrid) return;
	if (t.tf_gridVisible)
		TF_HideFilterGrid(id);
	else
		TF_ShowFilterGrid(id);
}

function TF_FilterIsVisible(id)
/*#====================================================
 *#	- shows/hides a filter grid
 *#=====================================================*/
{
	checkGrid(id, "InvertFilterGrid");
	var t = grabEBI(id);

	return t.tf_gridVisible;
}

function TF_RefreshDisplay(id)
/*#====================================================
 *#	- refreshes display
 *#=====================================================*/
{
	checkGrid(id, "RefreshDisplay");
	var t = grabEBI(id);
	sorttable.syncColumns(t);
}

function TF_ClearSelection(id)
/*#====================================================
 *#	- selects the visible part of the table
 *#=====================================================*/
{
	checkGrid(id, "ClearSelection");
	var t = grabEBI(id);
	var sel = window.getSelection();
	sel.removeAllRanges();
	for (var c = 0; c < t.childNodes.length; c++) {
		if (t.childNodes[c].nodeName == "COL") {
			t.childNodes[c].requestSelected = 0;
		}
	}
}

function TF_SelectColumns(id)
/*#====================================================
 *#	- selects the visible part of the table
 *#=====================================================*/
{
	checkGrid(id, "SelectTable");
	var t = grabEBI(id);
	id = grabID(id);
	var sel = window.getSelection();
	sel.removeAllRanges();
	sorttable.syncColumns(t, false);
	var selectedCols = [];
	var xc = 0;
	for (var c = 0; c < ttable.childNodes.length; c++) {
		if (ttable.childNodes[c].nodeName == "COL") {
			if (ttable.childNodes[c].requestSelected) {
		    		selectedCols.push(xc);
			}
			xc++;
		}
	}
	for (var i = 0; i < t.rows.length; i++) {
		var row = t.rows[i];
		if (row.style.visibility == "collapse") continue;
		if (row.style.display == "none") continue;
		if (row.id == "fltrow_basic_"+id) continue;
		if (row.id == "fltrow_advanced_"+id) continue;
		for (var j = 0; j < selectedCols.length; j++) {
			var range = document.createRange();
			range.selectNode(row.cells[selectedCols[j]]);
			sel.addRange(range);
		}
	}
}

function TF_SelectTable(id)
/*#====================================================
 *#	- selects the visible part of the table
 *#=====================================================*/
{
	checkGrid(id, "SelectTable");
	var t = grabEBI(id);
	id = grabID(id);
	var sel = window.getSelection();
	sel.removeAllRanges();
	sorttable.syncColumns(t, false);
	for (var i = 0; i < t.rows.length; i++) {
		var row = t.rows[i];
		if (row.style.visibility == "collapse") continue;
		if (row.style.display == "none") continue;
		if (row.id == "fltrow_basic_"+id) continue;
		if (row.id == "fltrow_advanced_"+id) continue;
		var range = document.createRange();
		range.selectNode(row);
		sel.addRange(range);
	}
}

function generatePrintableTable(id, linebreak, spacebreak, indent)
/*#====================================================
 *#	- generates a printable representation of the table
 *#=====================================================*/
{
	checkGrid(id, "generatePrintableTable");
	var table = grabEBI(id);
	var maxWidth = [];
	var rowMap = [];
	var numeric = [];
	var headrow = table.tHead.rows[0].cells;
	if (linebreak == undefined)
		linebreak = "\n";
	if (spacebreak == undefined)
		spacebreak = " ";
	if (indent == undefined)
		indent = "";
	for (var j = 0; j < headrow.length; j++) {
		var cell = headrow[j];
		if (cell.sorttableToBeHidden) continue;
		rowMap.push(j);
		if (/\bsorttable_(numeric|index)\b/.test(cell.className))
			numeric.push(true);
		else
			numeric.push(false);
		var ct = cell.textCached ? cell.textCache : getCellText(cell);
		maxWidth.push(ct.length);
	}
	var rowSize = rowMap.length;
	if (rowSize == 0)
		return;
	sorttable.initShadowRows(table);
	var rows = table.rows;
	var rowCount = rows.length;
	for (var i = 1; i < rowCount; i++) {
		var row = rows[i];
		if (/\bfltrow\b/.test(row.className)) continue;
		if (row.parentNode.nodeName.toLowerCase() != "tbody") continue;
		var cells = row.cells;
		for (var j = 0; j < rowSize; j++) {
			var cell = cells[rowMap[j]];
			var ct = cell.textCached ? cell.textCache : getCellText(cell);
			if (ct.length > maxWidth[j])
				maxWidth[j] = ct.length;
			if (numeric[j] && !(/^(-?[0-9]+)?$/.test(ct)))
				numeric[j] = false;
		}
	}
	var absMaxWidth = 0;
	for (var j in maxWidth) {
		if (maxWidth[j] > absMaxWidth)
			absMaxWidth = maxWidth[j];
	}
	var spaces = [];
	var space = spacebreak;
	for (var j = 0; j <= absMaxWidth; j++) {
		spaces.push(space);
		space += spacebreak;
	}
	var answer = indent;
	for (var j = 0; j < rowSize; j++) {
		var ct = getCellText(headrow[rowMap[j]]);
		answer += ct;
		if (j < rowSize - 1)
			answer += spaces[maxWidth[j] - ct.length];
	}
	answer += linebreak;
	answer += indent;
	for (var j = 0; j < rowSize; j++) {
		var ct = headrow[rowMap[j]].textCache;
		for (var k = 0; k < ct.length; k++)
			answer += "-";
		if (j < rowSize - 1)
			answer += spaces[maxWidth[j] - ct.length];
	}
	answer += linebreak;
	for (var i = 1; i < rowCount; i++) {
		var row = rows[i];
		if (/fltrow/.test(row.className)) continue;
		if (row.parentNode.nodeName.toLowerCase() != "tbody") continue;
		var cells = row.cells;
		answer += indent;
		for (var j = 0; j < rowSize; j++) {
			var ct = cells[rowMap[j]].textCache;
			var delta = maxWidth[j] - ct.length;
			if (numeric[j]) {
				if (delta > 0)
					answer += spaces[delta - 1];
				answer += ct;
				answer += spacebreak;
			} else {
				answer += ct;
				if (j < rowSize - 1)
					answer += spaces[delta];
			}
		}
		answer += linebreak;
	}
	return answer;
}

function TF_CreatePrintable(id)
/*#====================================================
 *#	- creates printable output
 *#=====================================================*/
{
	checkGrid(id, "CreatePrintable");
	var t = grabEBI(id);
	id = grabID(id);
	var w = window.open();
	var newTableData = generatePrintableTable(id, "<br/>", "&nbsp;",
						  t.tf_printableIndent);
	w.document.open();
	w.document.write('<pre>');
	w.document.write(newTableData);
	w.document.write('</pre>');
	w.document.close();
}

function TF_SetFilterMode(id, newMode)
/*#====================================================
 *#	- sets filter mode (basic or advanced)
 *#=====================================================*/
{
	checkGrid(id, "SetFilterMode");
	TF_ShowFilterGrid(id);
	var t = grabEBI(id);
	id = grabID(id);
	var otherMode = (newMode == "advanced") ? "basic" : "advanced";
	var nFilters = getFilterID(t, otherMode);
	var oFilters = getFilterID(t, (t.tf_filterMode == "advanced") ? "basic" : "advanced");
	var newUMode = ((newMode == "advanced") ? "Basic" :
			((newMode == "multi") ? "Advanced (Regular Expression)" :
			 "Multiple Selection"));
	var sp;
	var offset = t.indexAdded ? -1 : 0;
	sp = grabEBI("apply_filter_btn_"+id);

	if (t.tf_filterMode == newMode) return;
	var rows = sorttable.getAllRows(t);

	if (t.tf_filterMode == "multi") {
	    var curFilters = getFilters(t);
	    for (var k = 0; k < curFilters.length; k++) {
		var flt = curFilters[k];
		if (flt.nodeName == "SELECT") {
		    flt.multiCache = getFilterValues(curFilters, k);
		    flt.hasMultiCache = true;
		}
	    }
	}

	if(t.tf_fltGrid) {
		if (nFilters != oFilters) {
			var oldFilters = getFilters(t);
			for(var j=0; j < rows.length; j++) {
				if (rows[j].id == getFilterID(t)) {
					rows[j].style.visibility = "collapse";
					rows[j].style.display = "none";
					break;
				}
			}
			var oldMode = t.tf_filterMode;
			t.tf_filterMode = newMode;
			if (newMode == "advanced") {
				var newFilters = getFilters(t);
				for (var i = 0; i < oldFilters.length; i++) {
					var io = i + offset;
					var fvals = getFilterValues(oldFilters, i, true);
					if (oldMode == "multi" &&
					    t.tf_Obj["col_"+io] == "multi") {
						filter = buildMultiFilterString(fvals);
					} else {
						filter = fvals.join("|");
					}
					if (filter != "") {
						if (t.tf_Obj["col_"+io] == "select")
							filter = '^(' + filter + ')$';
						setFilterValue(newFilters, i, filter);
					}
				}
			}
			for(var j=0; j < rows.length; j++) {
				if (rows[j].id == getFilterID(t)) {
					rows[j].style.visibility = "";
					rows[j].style.display = "";
					break;
				}
			}
		}
		t.tf_filterMode = newMode;
		if (newMode == "basic") {
			var filters = getFilters(t);
			for (var i = 0; i < filters.length; i++) {
				if (filters[i].nodeName == "SELECT") {
					filters[i].multiple = false;
				}
			}
		} else if (newMode == "multi") {
			var filters = getFilters(t);
			for (var i = 0; i < filters.length; i++) {
				var flt = filters[i];
				if (flt.nodeName == "SELECT") {
					flt.multiple = true;
					if (flt.hasMultiCache) {
						for (var k = 0; k < flt.multiCache.length; k++) {
							setFilterValue(filters, i, flt.multiCache[k]);
						}
						flt.hasMultiCache = false;
						flt.multiCache = null;
					}
				}
			}
		}
		if (sp && t.tf_ApplyFilterButton) {
			if (newMode == "multi") {
				sp.appendChild(t.tf_ApplyFilterButton);
			} else {
				try {
					sp.removeChild(t.tf_ApplyFilterButton);
				} catch(e) {}
			}
		}
	}
	Filter(t);
	var c = grabEBI("mode_btn_"+id);
	if (c != null) c.value = "Switch to " + newUMode + " Filters";
	t.tf_gridVisible = 1;
}

function TF_InvertFilterMode(id)
/*#====================================================
 *#	- shows/hides a filter grid
 *#=====================================================*/
{
	checkGrid(id, "InvertFilterMode");
	var t = grabEBI(id);

	var row = grabTag(t,"tr");

	if(!t.tf_fltGrid) return;
	if      (t.tf_filterMode == "basic") TF_SetFilterMode(id, "multi");
	else if (t.tf_filterMode == "multi") TF_SetFilterMode(id, "advanced");
	else                                 TF_SetFilterMode(id, "basic");
}

function getSummaries(id)
{
    var t = grabEBI(id);
    return t.tf_summaryIDs;
}

function getSummary(id)
{
    var ot = grabEBI(id);
    return [ ot.x_col_name, ot.y_col_name, ot.z_col_name, ot.c_col_name, ot.c_op ];
}

function build_filter_str(tid, cols, vals)
{
    var colstr = '';
    var valstr = '';
    for (var i in cols) {
	var c = cols[i];
	if (c != undefined) {
	    if (colstr != '') {
		colstr += ',';
		valstr += ',';
	    }
	    colstr += c;
	    valstr += "'" + vals[i] + "'";
	}
    }
    return "javascript:TF_SetFilterValuesAndFilter('" + tid + "',[" +
	colstr + "],[" + valstr + "])";
}

function add_string_cell(tr, ct, tid, count, ihtml, cols, vals, link_always)
{
    var td = document.createElement(ct);
    if (! link_always && (count == undefined || count == 0))
	td.innerHTML = ihtml;
    else
	td.innerHTML = ('<a href="' +
			build_filter_str(tid, cols, vals) + '">' +
			ihtml + "</a>");
    tr.appendChild(td);
}

function add_number_cell(tr, tid, count, cols, vals, link_always, defval)
{
    var td = document.createElement("td");
    td.style.textAlign = "right";
    if (count == undefined) count = defval;
    if (! link_always && (count == 0 || count == undefined || cols.length == 0))
	td.innerHTML = count;
    else
	td.innerHTML = ('<a href="' +
			build_filter_str(tid, cols, vals) + '">' + count +
			"</a>");
    tr.appendChild(td);
}

function addSummaryTable(t, otr, total, x_col_idx, y_col_idx, z_col_idx, z_val,
			 row_counts, col_counts, row_vals, col_vals, grid,
			 link_always, defval, op)
{
    var z_name;
    if (z_col_idx == undefined) {
	z_name = "Reset Filter";
	z_val = undefined;
    } else if (z_col_idx < 0) {
	z_col_idx = -z_col_idx - 1;
	z_name = 'Reset Filter';
	z_val = '';
    } else if (z_val != undefined) {
	z_name = z_val.match(/^\s*$/) ? '(none)' : z_val;
	z_val = z_val.match(/^\s*$/) ? ' ' : z_val;
    }
    var col_fnames = [];
    for (var i in col_vals)
	col_fnames.push(col_vals[i].match(/^\s*$/) ? ' ' : col_vals[i]);

    var c_xyz = [x_col_idx, y_col_idx, z_col_idx];
    var c_yz = [y_col_idx, z_col_idx];
    var c_xz = [x_col_idx, z_col_idx];

    var report = document.createElement("table");
    report.className = t.tf_summaryClassTable
    var thead = document.createElement("thead");
    thead.className = t.tf_summaryClassHeading
    var tr = document.createElement("tr");
    var th = document.createElement("th");
    var fstr = build_filter_str(t.id, c_xyz, ['', '', z_val]);
    var reset_button = createElm("input",
				 ["type","button"],
				 ["value",z_name],
				 ["onclick",fstr]);
    th.appendChild(reset_button);
    tr.appendChild(th);
    for (var x in col_vals) {
	add_string_cell(tr, "th", t.id, col_counts[col_vals[x]],
			col_vals[x].match(/^\s*$/) ? '(none)' : col_vals[x],
			c_yz, [col_fnames[x], z_val], link_always);
    }
    add_string_cell(tr, "th", t.id, total, op,
		    c_yz, ['', z_val], link_always);
    thead.appendChild(tr);
    report.appendChild(thead);

    var tb = document.createElement("tbody");
    for (var y in row_vals) {
	var fname = row_vals[y].match(/^\s*$/) ? ' ' : row_vals[y];
	tr = document.createElement("tr");
	tr.className = t.tf_summaryClassNormal;
	add_string_cell(tr, "td", t.id, row_counts[row_vals[y]],
			row_vals[y].match(/^\s*$/) ? '(none)' : row_vals[y],
			c_xz, [fname, z_val], link_always);
	for (var x in col_vals) {
	    add_number_cell(tr, t.id, grid[x][y], c_xyz,
			    [fname, col_fnames[x], z_val], link_always, defval);
	}
	add_number_cell(tr, t.id, row_counts[row_vals[y]],
			c_xz, [fname, z_val], link_always, defval);
	tb.appendChild(tr);
    }
    tr = document.createElement("tr");
    tr.className = t.tf_summaryClassSummary;
    add_string_cell(tr, "td", t.id, total, op, c_xz, ['', z_val],
		    link_always);
    for (var x in col_vals) {
	add_number_cell(tr, t.id, col_counts[col_vals[x]],
			c_yz, [col_fnames[x], z_val], link_always, defval);
    }
    add_number_cell(tr, t.id, total, [], [], link_always, defval);
    tb.appendChild(tr);
    report.appendChild(tb);

    var td = document.createElement("td");
    td.appendChild(report);
    otr.appendChild(td);
}

function TF_UpdateAllSummaries(id)
{
	checkGrid(id, "UpdateAllSummaries");
	var t = grabEBI(id);
	for (k in t.tf_summaryIDs) {
		TF_UpdateSummary(t.tf_summaryIDs[k]);
	}
}

var TF_summaryOpTable =
    { "Min" : function(a,b) {if (a=="") return b; if (a<b) return a; else return b;},
      "Max" : function(a,b) {if (a=="") return b; if (a>b) return a; else return b;}}

function TF_UpdateSummary(id)
{
    var ot = grabEBI(id);
    var t = ot.table_parent;
    sorttable.initShadowRows(t);
    var x_col = ot.slcx.value.split(',');
    var y_col = ot.slcy.value.split(',');
    var z_col = ot.slcz.value.split(',');
    var c_col = ot.slcc.value.split(',');
    var has_ycol = y_col[0] == '' ? false : true;
    var has_zcol = z_col[0] == '' ? false : true;
    var has_ccol = c_col[0] == '' ? false : true;
    var p = ot.parentNode;
    var r_row = ot.summaryRow;
    ot.removeChild(r_row);
    for (var i = r_row.cells.length - 1; i >= 1; i--)
	r_row.removeChild(r_row.cells[i]);

    if (x_col[0] == '')
	{
	    ot.x_col_name = undefined;
	    ot.y_col_name = undefined;
	    ot.z_col_name = undefined;
	    ot.c_col_name = undefined;
	    ot.x_col_idx = undefined;
	    ot.y_col_idx = undefined;
	    ot.z_col_idx = undefined;
	    ot.c_col_idx = undefined;
	    ot.c_op = undefined;
	    ot.appendChild(r_row);
	    return;
	}
    ot.x_col_name = x_col.shift();
    ot.y_col_name = has_ycol ? y_col.shift() : undefined;
    ot.z_col_name = has_zcol ? z_col.shift() : undefined;
    ot.c_col_name = has_ccol ? c_col.shift() : undefined;
    ot.x_col_idx = parseInt(x_col.shift());
    ot.y_col_idx = has_ycol ? parseInt(y_col.shift()) : -1;
    ot.z_col_idx = has_zcol ? parseInt(z_col.shift()) : -1;
    ot.c_col_idx = has_ccol ? parseInt(c_col.shift()) : -1;
    var sort_numeric_x = parseInt(x_col.shift());
    var sort_numeric_y = has_ycol ? parseInt(y_col.shift()) : false;
    var sort_numeric_z = has_zcol ? parseInt(z_col.shift()) : false;
    var x_col_multi = parseInt(x_col.shift());
    var y_col_multi = has_ycol ? parseInt(y_col.shift()) : false;
    var z_col_multi = has_zcol ? parseInt(z_col.shift()) : false;
    ot.c_op = has_ccol ? c_col[4] : "Total";
    var op = TF_summaryOpTable[ot.c_op];
    if (typeof op != "function") {
	ot.c_op = "Total";
	op = function(a,b) {return a ? a+b : b;};
    }
    var numeric_c = ot.c_op == "Total";
    var defval = numeric_c ? 0 : "";
    var rows = t.shadowRows;
    var nrows = rows.length;
    var start_row = t.tf_ref_row;
    var row_vals = [];
    var col_vals = [];
    var z_vals = [];
    var row_counts = [];
    var col_counts = [];
    var z_row_counts = [];
    var z_col_counts = [];
    var z_counts = [];
    var row_data = [];
    var col_data = [];
    var z_data = [];
    var count_data = [];
    var row_idx = [];
    var col_idx = [];
    var z_idx = [];
    var total = 0;
    for (var j = start_row; j < nrows; j++)
	{
	    var row = rows[j];
	    if (row.hidden || row.invalidRow)
		continue;
	    var x_cell = sorttable.getCell(row, ot.x_col_idx);
	    var y_cell = has_ycol ? sorttable.getCell(row, ot.y_col_idx) : undefined;
	    var z_cell = has_zcol ? sorttable.getCell(row, ot.z_col_idx) : undefined;
	    var c_cell = has_ccol ? sorttable.getCell(row, ot.c_col_idx) : undefined;
	    var x_val = x_col_multi ? getCellFilterValues(x_cell) : [ getCellFilterText(x_cell) ];
	    var y_val = has_ycol ? (y_col_multi ? getCellFilterValues(y_cell) : [ getCellFilterText(y_cell) ]) : [];
	    var z_val = has_zcol ? (z_col_multi ? getCellFilterValues(z_cell) : [ getCellFilterText(z_cell) ]) : [];
	    var c_val = has_ccol ? (numeric_c ? getCellNum(c_cell) : getCellFilterText(c_cell)) : 1;
	    if (numeric_c && isNaN(c_val)) c_val = 0;
	    row_data.push(x_val);
	    if (has_ycol) col_data.push(y_val);
	    count_data.push(c_val);
	    for (var k in z_val) {
		var v = z_val[k];
		if (typeof z_counts[v] == 'undefined') {
		    z_counts[v] = defval;
		    z_row_counts[v] = [];
		    z_col_counts[v] = [];
		    z_vals.push(v);
		}
		z_counts[v] = op(z_counts[v], c_val);
	    }
	    if (has_zcol) z_data.push(z_val);
	    for (var k in x_val) {
		var v = x_val[k];
		if (typeof row_counts[v] == 'undefined') {
		    row_counts[v] = defval;
		    row_vals.push(v);
		}
		row_counts[v] = op(row_counts[v], c_val);
		for (var l in z_val) {
		    var w = z_val[l];
		    if (typeof z_row_counts[w][v] == 'undefined') {
			z_row_counts[w][v] = defval;
		    }
		    z_row_counts[w][v] = op(z_row_counts[w][v], c_val);
		}
	    }
	    for (var k in y_val) {
		var v = y_val[k];
		if (typeof col_counts[v] == 'undefined') {
		    col_counts[v] = defval;
		    col_vals.push(v);
		}
		col_counts[v] = op(col_counts[v], c_val);
		for (var l in z_val) {
		    var w = z_val[l];
		    if (typeof z_col_counts[w][v] == 'undefined') {
			z_col_counts[w][v] = defval;
		    }
		    z_col_counts[w][v] = op(z_col_counts[w][v], c_val);
		}
	    }
	    total = op(total, c_val);
	}
    function nsort(a, b) {
	var aa = parseFloat(a) || 0;
	var bb = parseFloat(b) || 0;
	return aa - bb;
    }
    if (sort_numeric_x)
	row_vals.sort(nsort);
    else
	row_vals.sort();
    if (sort_numeric_y)
	col_vals.sort(nsort);
    else
	col_vals.sort();
    if (sort_numeric_z)
	z_vals.sort(nsort);
    else
	z_vals.sort();
    var grid = [];
    var zgrid = [];
    for (var y in row_vals) {
	row_idx[row_vals[y]] = y;
    }
    for (var x in col_vals) {
	grid.push([]);
	col_idx[col_vals[x]] = x;
	for (var y in row_vals) {
	    grid[x].push(defval);
	}
    }
    for (var z in z_vals) {
	zgrid.push([]);
	z_idx[z_vals[z]] = z;
	for (var x in col_vals) {
	    zgrid[z].push([]);
	    for (var y in row_vals) {
		zgrid[z][x].push(defval);
	    }
	}
    }
    for (var k in row_data) {
	var r = row_data[k];
	var c = col_data[k];
	var z = has_zcol ? z_data[k] : [];
	var count = count_data[k];
	for (var rk in r) {
	    var ri = row_idx[r[rk]];
	    for (var ck in c) {
		var ci = col_idx[c[ck]];
		grid[ci][ri] = op(grid[ci][ri], count);
		for (var zk in z) {
		    var zi = z_idx[z[zk]];
		    zgrid[zi][ci][ri] = op(zgrid[zi][ci][ri], count);
		}
	    }
	}
    }

    addSummaryTable(t, r_row, total, ot.x_col_idx, ot.y_col_idx,
		    has_zcol ? -ot.z_col_idx - 1 : undefined, '',
		    row_counts, col_counts, row_vals, col_vals, grid,
		    has_ccol, defval, ot.c_op);
    for (var z in z_vals) {
	var v = z_vals[z];
	addSummaryTable(t, r_row, z_counts[v], ot.x_col_idx, ot.y_col_idx,
			ot.z_col_idx, v, z_row_counts[v], z_col_counts[v],
			row_vals, col_vals, zgrid[z], has_ccol, defval,
			ot.c_op);
    }
    ot.appendChild(r_row);
}


function TF_CloseSummary(id)
{
    var ot = grabEBI(id);
    var t = ot.table_parent;
    var nids = [];
    for (k in t.tf_summaryIDs)
	{
		if (t.tf_summaryIDs[k] != id)
			nids.push(t.tf_summaryIDs[k]);
	}
    var p = ot.parentNode;
    TF_SetFilterValuesAndFilter(t.id,
				[ot.x_col_idx, ot.y_col_idx, ot.z_col_idx],
				['', '', '']);
    p.removeChild(ot);
    t.tf_summaryIDs = nids;
}

function TF_CloseAllSummaries(tid)
{
    var t = grabEBI(tid);
    for (k in t.tf_summaryIDs)
	{
		var ot = grabEBI(t.tf_summaryIDs[k]);
		var p = ot.parentNode;
		p.removeChild(ot);
	}
    t.tf_summaryIDs = [];
}

function TF_AddSummary(id, xid, yid, zid, cid, c_op)
/*#====================================================
 *#	- Add a summary
 *#=====================================================*/
{
	checkGrid(id, "AddSummary");
	if (typeof xid == "object") {
		c_op = xid[4];
		cid = xid[3];
		zid = xid[2];
		yid = xid[1];
		xid = xid[0];
	}
	var t = grabEBI(id);
	sorttable.initShadowRows(t);
	id = grabID(id);
	var col_list = [];
	var count_list = [];
	var col_count = sorttable.getColCount(t);
	var x_col;
	var y_col;
	var z_col;
	var c_col;
	for (var c = 0; c < col_count; c++) {
	    var n = sorttable.getRowCell(t, 0, c);
	    if (!(n.className.match(/\bsorttable_index\b/))) {
		var cname = getCellText(n);
		var numeric = n.className.match(/\bsorttable_numeric\b/) ? 1 : 0;
		var date = n.className.match(/\bsorttable_date\b/) ? 1 : 0;
		var multi = n.className.match(/\bsorttable_multi\b/) ? 1 : 0;
		var minmax = !multi && (numeric || date || n.countable);
		col_list.push([cname, n.id, c, numeric, multi, n.countable, minmax]);

		if (xid == n.id) {
		    x_col = c;
		}
		if (yid == n.id) {
		    y_col = c;
		}
		if (zid == n.id) {
		    z_col = c;
		}
		if (cid == n.id) {
		    c_col = c;
		}
	    }
	}
	col_list.sort();
	for (var v in col_list) {
	    var tmp = col_list[v];
	    col_list[v] = [ tmp[1], tmp[2], tmp[3], tmp[4], tmp[0], tmp[5], tmp[6] ];
	    if (x_col == col_list[v][1]) {
		x_col = col_list[v].join();
	    }
	    if (y_col == col_list[v][1]) {
		y_col = col_list[v].join();
	    }
	    if (z_col == col_list[v][1]) {
		z_col = col_list[v].join();
	    }
	    if (c_col == col_list[v][1]) {
		c_col = col_list[v].join();
	    }
	}
	var slcx = document.createElement("select");
	var slcy = document.createElement("select");
	var slcz = document.createElement("select");
	var slcc = document.createElement("select");
	var null_opt = [undefined, undefined, undefined, undefined,
		    undefined, undefined]
	var currOpt = new Option("Select the rows...", null_opt, false, false);
	var optidx = 0;
	slcx.options[optidx] = currOpt;
	currOpt = new Option("Select the columns...", null_opt, false, false);
	slcy.options[optidx] = currOpt;
	currOpt = new Option("Select the groups (optional)...", null_opt, false, false);
	slcz.options[optidx] = currOpt;
	currOpt = new Option("Select the count (optional)...", null_opt, false, false);
	slcc.options[optidx] = currOpt;
	optidx++;
	var cidx = 1;
	for (var v in col_list) {
	    slcx.options[optidx] = new Option(col_list[v][4], col_list[v], false, false);
	    slcy.options[optidx] = new Option(col_list[v][4], col_list[v], false, false);
	    slcz.options[optidx] = new Option(col_list[v][4], col_list[v], false, false);
	    if (col_list[v][5]) {
	    	slcc.options[cidx++] = new Option(col_list[v][4], col_list[v], false, false);
		if (cid == col_list[v][0] && (c_op == "Total" || c_op == "")) {
		    c_col = col_list[v].join();
		}
	    }
	    if (col_list[v][6]) {
		for (var op in TF_summaryOpTable) {
		    col_list[v][6] = op;
	    	    slcc.options[cidx++] =
			new Option(col_list[v][4] + " ("+op+")",
				   col_list[v], false, false);
		    if (cid == col_list[v][0] && c_op == col_list[v][6]) {
			c_col = col_list[v].join();
		    }
		}
	    }
	    optidx++;
	}
	var sdiv = grabEBI(t.tf_summaryDiv);
	var nid = id + "_summary_" + t.tf_summaryIdx;
	t.tf_summaryIdx++;
	slcx.onchange = function() { TF_UpdateSummary(nid); }
	slcy.onchange = function() { TF_UpdateSummary(nid); }
	slcz.onchange = function() { TF_UpdateSummary(nid); }
	slcc.onchange = function() { TF_UpdateSummary(nid); }
	if (x_col)
	    slcx.value = x_col;
	if (y_col)
	    slcy.value = y_col;
	if (z_col)
	    slcz.value = z_col;
	if (c_col)
	    slcc.value = c_col;
	var otable = createElm("table", ["id", nid]);
	otable.slcx = slcx;
	otable.slcy = slcy;
	otable.slcz = slcz;
	otable.slcc = slcc;
	otable.table_parent = t;
	var ntr0 = document.createElement("tr");
	var nt00 = document.createElement("td");
	var close_button = createElm("input",
				     ["type","button"],
				     ["value","Close Summary"],
				     ["onclick","javascript:TF_CloseSummary('"+nid+"')"]);
	nt00.appendChild(close_button);
	ntr0.appendChild(nt00);
	var nt01 = createElm("td");
	var center = createElm("center");
	center.appendChild(slcy);
	nt01.appendChild(center);
	ntr0.appendChild(nt01);
	nt01 = createElm("td");
	nt01.appendChild(slcz);
	ntr0.appendChild(nt01);
	otable.appendChild(ntr0);

	var ntr1 = createElm("tr");
	var nt10 = createElm("td");
	ntr1.appendChild(nt10);
	if (cidx > 1) {
	    var t20 = createElm("table");
	    nt10.appendChild(t20);
	    var ntr2 = createElm("tr");
	    t20.appendChild(ntr2);
	    var nt20 = createElm("td");
	    ntr2.appendChild(nt20);
	    nt20.appendChild(slcx);
	    ntr2 = createElm("tr");
	    t20.appendChild(ntr2);
	    nt20 = createElm("td");
	    ntr2.appendChild(nt20);
	    nt20.appendChild(slcc);
	} else {
	    nt10.appendChild(slcx);
	}
	var nt11 = createElm("td");
	ntr1.appendChild(nt11);
	otable.appendChild(ntr1);
	otable.summaryRow = ntr1;

	sdiv.appendChild(otable);
	t.tf_summaryIDs.push(nid);
}

function TF_ClearFilters(id)
/*#====================================================
 *#	- clears grid filters only, table is not filtered
 *#=====================================================*/
{
	checkGrid(id, "ClearFilters");
	clearFilters(id);
}

function TF_SetFilterValue(id,index,searcharg)
/*#====================================================
 *#	- Inserts value in a specified filter
 *#	- Params:
 *#		- id: table id (string)
 *#		- index: filter column index (numeric value)
 *#		- searcharg: search string
 *#=====================================================*/
{
	checkGrid(id, "SetFilterValue");
	var flts = getFilters(id);
	clearFilterValue(flts, index);
	setFilterValue(flts, index, searcharg);
}

function TF_SetFilterValueAndFilter(id,index,searcharg)
/*#====================================================
 *#	- Inserts value in a specified filter
 *#	- Params:
 *#		- id: table id (string)
 *#		- index: filter column index (numeric value)
 *#		- searcharg: search string
 *#=====================================================*/
{
	TF_SetFilterValue(id, index, searcharg);
	Filter(id);
}

function TF_SetFilterValuesAndFilter(id,indices,searchargs)
/*#====================================================
 *#	- Inserts value in a specified filter
 *#	- Params:
 *#		- id: table id (string)
 *#		- index: filter column index (numeric value)
 *#		- searcharg: search string
 *#=====================================================*/
{
	for (var i = 0; i < indices.length; i++)
		TF_SetFilterValue(id, indices[i], searchargs[i]);
	Filter(id);
}

/*#====================================================
 *#	- bind an external script fns
 *#	- fns below do not belong to filter grid script
 *#	and are used to interface with external
 *#	autocomplete script found at the following URL:
 *#	http://www.codeproject.com/jscript/jsactb.asp
 *#	(credit to zichun)
 *#	- fns used to merge filter grid with external
 *#	scripts
 *#=====================================================*/

function setAutoComplete(id)
{
	var t = grabEBI(id);
	var bindScript = t.tf_bindScript;
	var scriptName = bindScript["name"];
	var scriptPath = bindScript["path"];
	initAutoComplete();
	t.colValues = new Array();

	function initAutoComplete()
	{
		var filters = TF_GetFilters(id);
		for(var i=0; i < filters.length; i++)
		{
			if( filters[i].nodeName.toLowerCase()=="input")
				t.colValues.push( getColValues(id,i) );
			else
				t.colValues.push( '' );
		}//#for i

		try{ actb( filters[0], t.colValues[0] ); }
		catch(e){ alert(scriptPath + " script may not be loaded"); }

	}//#fn
}
