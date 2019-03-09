/* %A% */
/* javascript for submitting with full url */

function submitForm(form, table)
{
	document.forms[form].url.value = generateURL(table);
	document.forms[form].submit();
}

function financialsubmitForm(form)
{
	url = generateURL('table_report');

	if (/[?]/.test(url)) {
		url = url + '&';
	} else {
		url = url + '?';
	}

	for (i = 0; i < document.forms['year'].year.length; i++) {
		if (document.forms['year'].year[i].checked) {
			url = url + 'year=' + document.forms['year'].year[i].value;
		}
	}

	document.forms['year'].action = url;
	document.forms[form].url.value = url;
	document.forms[form].submit();
}
