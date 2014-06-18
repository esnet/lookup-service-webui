////////////////////////////////////////
// Utility Functions
////////////////////////////////////////

Array.prototype.contains = function(key) {
	for (var i = 0 ; i < this.length ; i++)
	{
		if(this[i] === key)
			return true;
	}
	return false;
};

Array.prototype.unique = function() {
	var arr = [];
	for (var i = 0 ; i < this.length ; i++)
	{
		if(!arr.contains(this[i]))
			arr.push(this[i]);
	}
	return arr; 
};

function compareHostnames(hostname_a, hostname_b)
{
	order = {
		"Hostname": 0,
		"IPv4": 1,
		"IPv6": 2
	};
	hostname_a = hostname_a.replace("-v6", "~");
	hostname_b = hostname_b.replace("-v6", "~");
	order_a = order[getAddressType(hostname_a)];
	order_b = order[getAddressType(hostname_b)];
	return order_a > order_b ? 1 : order_a < order_b ? -1 : hostname_a > hostname_b ? 1 : hostname_a < hostname_b ? -1 : 0;
}

function getAddressType(address)
{
	var IPv4Format = /^\[?([\d]{1,3}\.){3}[\d]{1,3}\]?(:\d*){0,1}$/;
	var IPv6Format = /^\[?([\da-fA-F]{0,4}:){3,7}[\da-fA-F]{0,4}\]?(:\d*){0,1}$/;
	if (IPv4Format.test(address))
		return "IPv4";
	else if (IPv6Format.test(address))
		return "IPv6";
	else
		return "Hostname";
}

function getHostnameFromURL(url)
{
	var hostname = getURLParser(url).hostname;
	if ((hostname) && (hostname != window.location.hostname))
		return hostname.replace(/[\[\]]+/g, "");
	else
		return url;
}

function getURLParser(url)
{
	var parser = document.createElement("a");
	parser.href = url;
	return parser;
}

function parseMetricPrefix(prefix)
{
	var prefixes = {
		"K": Math.pow(10, 3),
		"M": Math.pow(10, 6),
		"G": Math.pow(10, 9),
		"T": Math.pow(10, 12),
		"P": Math.pow(10, 15),
		"E": Math.pow(10, 18),
		"Z": Math.pow(10, 21),
		"Y": Math.pow(10, 24)
	};
	if (prefixes[prefix])
		return prefixes[prefix];
	else
		return Math.pow(10, 0);
}

function parseRate(rateString)
{
	var units = [ "b/s", "bit/s", "bps" ];
	var rate = parseFloat(rateString);
	var unit = $.trim(rateString.split(rate)[1]);
	var prefix = unit.charAt(0).toUpperCase();
	rate *= parseMetricPrefix(prefix);
	return Math.round(rate);
}

function parseSize(sizeString)
{
	var units = [ "B" ];
	var size = parseFloat(sizeString);
	var unit = $.trim(sizeString.split(size)[1]);
	var prefix = unit.charAt(0).toUpperCase();
	size *= parseMetricPrefix(prefix);
	return Math.round(size);
}

function parseSpeed(speedString)
{
	var units = [ "Hz" ];
	var speed = parseFloat(speedString);
	var unit = $.trim(speedString.split(speed)[1]);
	var prefix = unit.charAt(0).toUpperCase();
	speed *= parseMetricPrefix(prefix);
	return Math.round(speed);
}

function getCountryString(country)
{
	var countryCodes = {
		"AC": "Ascension Island",
		"AD": "Andorra",
		"AE": "United Arab Emirates",
		"AF": "Afghanistan",
		"AG": "Antigua and Barbuda",
		"AI": "Anguilla",
		"AL": "Albania",
		"AM": "Armenia",
		"AN": "Netherlands Antilles",
		"AO": "Angola",
		"AQ": "Antarctica",
		"AR": "Argentina",
		"AS": "American Samoa",
		"AT": "Austria",
		"AU": "Australia",
		"AW": "Aruba",
		"AZ": "Azerbaijan",
		"BA": "Bosnia and Herzegovina",
		"BB": "Barbados",
		"BD": "Bangladesh",
		"BE": "Belgium",
		"BF": "Burkina Faso",
		"BG": "Bulgaria",
		"BH": "Bahrain",
		"BI": "Burundi",
		"BJ": "Benin",
		"BM": "Bermuda",
		"BN": "Brunei",
		"BO": "Bolivia",
		"BR": "Brazil",
		"BS": "Bahamas",
		"BT": "Bhutan",
		"BV": "Bouvet Island",
		"BW": "Botswana",
		"BY": "Belarus",
		"BZ": "Belize",
		"CA": "Canada",
		"CC": "Cocos (Keeling) Islands",
		"CD": "Congo, Democratic People's Republic",
		"CF": "Central African Republic",
		"CG": "Congo, Republic of",
		"CH": "Switzerland",
		"CI": "C&ocirc;te d'Ivoire",
		"CK": "Cook Islands",
		"CL": "Chile",
		"CM": "Cameroon",
		"CN": "China",
		"CO": "Colombia",
		"CR": "Costa Rica",
		"CU": "Cuba",
		"CV": "Cape Verde",
		"CX": "Christmas Island",
		"CY": "Cyprus",
		"CZ": "Czech Republic",
		"DE": "Germany",
		"DJ": "Djibouti",
		"DK": "Denmark",
		"DM": "Dominica",
		"DO": "Dominican Republic",
		"DZ": "Algeria",
		"EC": "Ecuador",
		"EE": "Estonia",
		"EG": "Egypt",
		"EH": "Western Sahara",
		"ER": "Eritrea",
		"ES": "Spain",
		"ET": "Ethiopia",
		"FI": "Finland",
		"FJ": "Fiji",
		"FK": "Falkland Islands (Malvina)",
		"FM": "Micronesia, Federal State of",
		"FO": "Faroe Islands",
		"FR": "France",
		"GA": "Gabon",
		"GD": "Grenada",
		"GE": "Georgia",
		"GF": "French Guiana",
		"GG": "Guernsey",
		"GH": "Ghana",
		"GI": "Gibraltar",
		"GL": "Greenland",
		"GM": "Gambia",
		"GN": "Guinea",
		"GP": "Guadeloupe",
		"GQ": "Equatorial Guinea",
		"GR": "Greece",
		"GS": "South Georgia and the South Sandwich Islands",
		"GT": "Guatemala",
		"GU": "Guam",
		"GW": "Guinea-Bissau",
		"GY": "Guyana",
		"HK": "Hong Kong",
		"HM": "Heard and McDonald Islands",
		"HN": "Honduras",
		"HR": "Croatia/Hrvatska",
		"HT": "Haiti",
		"HU": "Hungary",
		"ID": "Indonesia",
		"IE": "Ireland",
		"IL": "Israel",
		"IM": "Isle of Man",
		"IN": "India",
		"IO": "British Indian Ocean Territory",
		"IQ": "Iraq",
		"IR": "Iran",
		"IS": "Iceland",
		"IT": "Italy",
		"JE": "Jersey",
		"JM": "Jamaica",
		"JO": "Jordan",
		"JP": "Japan",
		"KE": "Kenya",
		"KG": "Kyrgyzstan",
		"KH": "Cambodia",
		"KI": "Kiribati",
		"KM": "Comoros",
		"KN": "Saint Kitts and Nevis",
		"KP": "North Korea",
		"KR": "South Korea",
		"KW": "Kuwait",
		"KY": "Cayman Islands",
		"KZ": "Kazakstan",
		"LA": "Laos",
		"LB": "Lebanon",
		"LC": "Saint Lucia",
		"LI": "Liechtenstein",
		"LK": "Sri Lanka",
		"LR": "Liberia",
		"LS": "Lesotho",
		"LT": "Lithuania",
		"LU": "Luxembourg",
		"LV": "Latvia",
		"LY": "Lybia",
		"MA": "Morocco",
		"MC": "Monaco",
		"MD": "Modolva",
		"MG": "Madagascar",
		"MH": "Marshall Islands",
		"MK": "Macedonia, Former Yugoslav Republic",
		"ML": "Mali",
		"MM": "Myanmar",
		"MN": "Mongolia",
		"MO": "Macau",
		"MP": "Northern Mariana Islands",
		"MQ": "Martinique",
		"MR": "Mauritania",
		"MS": "Montserrat",
		"MT": "Malta",
		"MU": "Mauritius",
		"MV": "Maldives",
		"MW": "Malawi",
		"MX": "Mexico",
		"MY": "Maylaysia",
		"MZ": "Mozambique",
		"NA": "Namibia",
		"NC": "New Caledonia",
		"NE": "Niger",
		"NF": "Norfolk Island",
		"NG": "Nigeria",
		"NI": "Nicaragua",
		"NL": "Netherlands",
		"NO": "Norway",
		"NP": "Nepal",
		"NR": "Nauru",
		"NU": "Niue",
		"NZ": "New Zealand",
		"OM": "Oman",
		"PA": "Panama",
		"PE": "Peru",
		"PF": "French Polynesia",
		"PG": "Papua New Guinea",
		"PH": "Philippines",
		"PK": "Pakistan",
		"PL": "Poland",
		"PM": "St. Pierre and Miquelon",
		"PN": "Pitcairn Island",
		"PR": "Puerto Rico",
		"PS": "Palestinian Territories",
		"PT": "Portugal",
		"PW": "Palau",
		"PY": "Paraguay",
		"QA": "Qatar",
		"RE": "Reunion",
		"RO": "Romania",
		"RU": "Russian Federation",
		"RW": "Twanda",
		"SA": "Saudi Arabia",
		"SB": "Solomon Islands",
		"SC": "Seychelles",
		"SU": "Sudan",
		"SE": "Sweden",
		"SG": "Singapore",
		"SH": "St. Helena",
		"SI": "Slovenia",
		"SJ": "Svalbard and Jan Mayan Islands",
		"SK": "Slovakia",
		"SL": "Sierra Leone",
		"SM": "San Marino",
		"SN": "Senegal",
		"SO": "Somalia",
		"SR": "Suriname",
		"ST": "S&atilde;o Tome and Principe",
		"SV": "El Salvador",
		"SY": "Syria",
		"SZ": "Swaziland",
		"TC": "Turks and Ciacos Islands",
		"TD": "Chad",
		"TF": "French Southern Territories",
		"TG": "Togo",
		"TH": "Thailand",
		"TJ": "Tajikistan",
		"TK": "Tokelau",
		"TM": "Turkmenistan",
		"TN": "Tunisia",
		"TO": "Tonga",
		"TP": "East Timor",
		"TR": "Turkey",
		"TT": "Trinidad and Tobago",
		"TV": "Tuvalu",
		"TW": "Taiwan",
		"TZ": "Tanzania",
		"UA": "Ukraine",
		"UG": "Uganda",
		"UK": "UK",
		"UM": "US Minor Outlying Islands",
		"US": "USA",
		"UY": "Uruguay",
		"UZ": "Uzbekistan",
		"VA": "Vatican City",
		"VC": "Saint Vincent and the Grenadines",
		"VE": "Venezuela",
		"VG": "British Virgin Islands",
		"VI": "US Virgin Islands",
		"VN": "Vietnam",
		"VU": "Vanuatu",
		"WF": "Wallis and Futuna Islands",
		"WS": "Western Samoa",
		"YE": "Yemen",
		"YT": "Mayotte",
		"YU": "Yugoslavia",
		"ZA": "South Africa",
		"ZM": "Zambia",
		"ZR": "Zaire",
		"ZW": "Zimbabwe"
	};
	if (countryCodes[country])
		return countryCodes[country];
	else
		return country;
}

function getStateString(state)
{
	var stateCodes = {
		"AL": "Alabama",
		"AK": "Alaska",
		"AZ": "Arizona",
		"AR": "Arkansas",
		"CA": "California",
		"CO": "Colorado",
		"CT": "Connecticut",
		"DE": "Delaware",
		"FL": "Florida",
		"GA": "Georgia",
		"HI": "Hawaii",
		"ID": "Idaho",
		"IL": "Illinois",
		"IN": "Indiana",
		"IA": "Iowa",
		"KS": "Kansas",
		"KY": "Kentucky",
		"LA": "Louisiana",
		"ME": "Maine",
		"MD": "Maryland",
		"MA": "Massachusetts",
		"MI": "Michigan",
		"MN": "Minnesota",
		"MS": "Mississippi",
		"MO": "Missouri",
		"MT": "Montana",
		"NE": "Nebraska",
		"NV": "Nevada",
		"NH": "New Hampshire",
		"NJ": "New Jersey",
		"NM": "New Mexico",
		"NY": "New York",
		"NC": "North Carolina",
		"ND": "North Dakota",
		"OH": "Ohio",
		"OK": "Oklahoma",
		"OR": "Oregon",
		"PA": "Pennsylvania",
		"RI": "Rhode Island",
		"SC": "South Carolina",
		"SD": "South Dakota",
		"TN": "Tennessee",
		"TX": "Texas",
		"UT": "Utah",
		"VT": "Vermont",
		"VA": "Virginia",
		"WA": "Washington",
		"WV": "West Virginia",
		"WI": "Wisconsin",
		"WY": "Wyoming"
	};
	if (stateCodes[state])
		return stateCodes[state];
	else
		return state;
}
