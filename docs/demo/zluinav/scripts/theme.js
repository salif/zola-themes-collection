/*
JS functions for zluinav theme which is distributed under the terms of the MIT License
*/
function ts_to_readable_time(timestamp, showsecond = false, ltext = '', show_full=true) {
	/*
	This function converts a given timestamp to human readable format.
	Options:
		timestamp(required): the timestamp to process.
		showsecond(optional): should seconds be shown too even if minute/hour/day is greater than 0? This does not apply on show_full parameter if used.
		ltext(optional): the text after the time. Usually this is recommended to add a space before the text, such as " ago".
		show_full(optional): should the time be fully shown? If false, only the biggest value will be shown.
	*/
	var seconds = Math.floor(Date.now() / 1000) - Math.floor(timestamp / 1000);
	var minutes = Math.floor(seconds / 60);
	var hours = Math.floor(minutes / 60);
	var days = Math.floor(hours / 24);
	var months = Math.floor(days / 30);
	var years = Math.floor(months / 12);
	var output = '';
	if(!show_full) {
		if (years > 0) {
			output = years + " year";
			if (years > 1) output += "s";
		} else if (months > 0) {
			output = (months % 12) + " month";
			if (months % 12 > 1) output += "s";
		} else if (days > 0) {
			output = (days % 30) + " day";
			if (days % 30 > 1) output += "s";
		} else if (hours > 0) {
			output = (hours % 24) + " hour";
			if (hours % 24 > 1) output += "s";
		} else if (minutes > 0) {
			output = (minutes % 60) + " minute";
			if (minutes % 60 > 1) output += "s";
		} else if (seconds>0) {
			output = (seconds % 60) + " second";
			if (seconds % 60 > 1) output += "s";
		}
	} else {
		if (years > 0) {
			output += years + " year";
			if (years > 1) output += "s";
			output += ", ";
		} if (months > 0) {
			output += (months % 12) + " month";
			if (months % 12 > 1) output += "s";
			output += ", ";
		} if (days > 0) {
			output += (days % 30) + " day";
			if (days % 30 > 1) output += "s";
			output += ", ";
		} if (hours > 0) {
			output += (hours % 24) + " hour";
			if (hours % 24 > 1) output += "s";
			output += ", ";
		} if (minutes > 0) {
			output += (minutes % 60) + " minute";
			if (minutes % 60 > 1) output += "s";
			output += ", ";
		} if (showsecond || (days == 0 && hours == 0 && minutes == 0)) {
			output += (seconds % 60) + " second";
			if (seconds % 60 > 1) output += "s";
			output += ", ";
		}
	}//
	output = output.trim().replace(/,\s*$/, '');
	if (output.includes(',')) {
		var lastCommaPos = output.lastIndexOf(',');
		output = output.slice(0, lastCommaPos) + ' and' + output.slice(lastCommaPos + 1);
	}
	output += ltext;
	return output;
}
function normalize_iso_datetime(dateString) {
	// Convert date string into a valid ISO format (inserting colon in the timezone)
	const valid_dateString = dateString.replace(/([+-]\d{2})(\d{2})$/, '$1:$2');
	return valid_dateString;
}
function local_datetime_string(date_input) {
	var r = new Date(date_input);
	if (!r) r = new Date(normalize_iso_datetime(date_input));
	const options = {
		weekday: "long", 
		month: "long", 
		day: "numeric",
		year: "numeric"
	};
	const toptions = {
		hour: "numeric",
		minute: "numeric",
		second: "numeric",
		hour12: false,
		timeZoneName: "short"
	};
	var final = r.toLocaleDateString("EN-US", options) + " at " + r.toLocaleTimeString("EN-US", toptions);
	return final;
}
function get_timestamp(dateString) {
	// Convert date string into a valid ISO format (inserting colon in the timezone)
	const valid_dateString = normalize_iso_datetime(dateString);
	// Create a new Date object from the valid date string
	const date = new Date(valid_dateString);
	// Return the timestamp (milliseconds since epoch)
	return date.getTime();
}
function switch_tab(tab_id) {
	// Hide all tab contents
	const contents = document.querySelectorAll(".tab-content");
	contents.forEach(content => {
		content.style.display = "none";
	});
	// Remove active class from all tabs
	const tabs = document.querySelectorAll(".tab");
	tabs.forEach(tab => {
		tab.classList.remove("active");
		tab.setAttribute("aria-selected", "false");
		tab.setAttribute("tabindex", "-1");
	});
	// Show the selected tab content and set it as active
	if (tab_id !== null) {
		const selected_content = document.getElementById("tab-content-" + tab_id);
		if (selected_content) {
			selected_content.style.display = "block";
		}
		const selected_tab = document.querySelector(`.tab[data-tab-id="${tab_id}"]`);
		if (selected_tab) {
			selected_tab.classList.add("active");
			selected_tab.setAttribute("aria-selected", "true");
			selected_tab.setAttribute("tabindex", "0");
		}
	}
}