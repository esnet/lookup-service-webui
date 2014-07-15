////////////////////////////////////////
// Declare Variables
////////////////////////////////////////

var sortOrder = {
	"hostname": {
		"Hostname": 0,
		"URL": 0,
		"IPv4": 1,
		"IPv6": 2
	}
};

var metricPrefixes = {
	"short": [ "K", "M", "G", "T", "P", "E", "Z", "Y" ],
	"long": [ "kilo", "mega", "giga", "tera", "peta", "exa", "zetta", "yotta" ]
};

var units = {
	"rate": [ "b/s", "bit/s", "bps" ],
	"size": [ "byte", "bytes", "B" ],
	"speed": [ "hertz", "Hz" ]
};

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
	var unique = [];
	for (var i = 0 ; i < this.length ; i++)
	{
		if(!unique.contains(this[i]))
			unique.push(this[i]);
	}
	return unique; 
};

function compareHostnames(hostname_a, hostname_b)
{
	hostname_a = hostname_a.replace(/(-v6|-ip6|-ipv6)/i, "~");
	hostname_b = hostname_b.replace(/(-v6|-ip6|-ipv6)/i, "~");
	order_a = sortOrder["hostname"][getAddressType(hostname_a)];
	order_b = sortOrder["hostname"][getAddressType(hostname_b)];
	return order_a > order_b ? 1 : order_a < order_b ? -1 : hostname_a > hostname_b ? 1 : hostname_a < hostname_b ? -1 : 0;
}

function formatRate(rate, precision, unit, nounit)
{
	if (!precision)
		precision = 0;
	if (!unit)
		unit = units["rate"][1];
	return formatUnitString(rate, precision, unit, units["rate"], nounit);
}

function formatSize(size, precision, unit, nounit)
{
	if (!precision)
		precision = 0;
	if (!unit)
		unit = units["size"][1];
	return formatUnitString(size, precision, unit, units["size"], nounit);
}

function formatSpeed(speed, precision, unit, nounit)
{
	if (!precision)
		precision = 0;
	if (!unit)
		unit = units["speed"][1];
	return formatUnitString(speed, precision, unit, units["speed"], nounit);
}

function formatUnitString(number, precision, unit, units, nounit)
{
	number /= parseUnitPrefix($.trim(unit), units, nounit);
	return ((number) || (number === 0)) ? number.toFixed(precision) + unit : null;
}

function getAddressType(address)
{
	var IPv4Format = /^\[?([\d]{1,3}\.){3}[\d]{1,3}\]?(:\d*){0,1}$/;
	var IPv6Format = /^\[?([\da-fA-F]{0,4}:){3,7}[\da-fA-F]{0,4}\]?(:\d*){0,1}$/;
	var hostnameFormat = /^[A-Za-z0-9]+((\-|\.)[A-Za-z0-9]+)*$/;
	if (IPv4Format.test(address))
		return "IPv4";
	else if (IPv6Format.test(address))
		return "IPv6";
	else if (hostnameFormat.test(address))
		return "Hostname";
	else
		return "URL";
}

function getHostFromURI(uri)
{
	var host = new URI(uri).host();
	if (host)
	    return host;
	return uri;
}

function getHostnameFromURI(uri)
{
	var hostname = new URI(uri).hostname();
	if (hostname)
	    return hostname;
	return uri;
}

function getLinks(addresses, prefix)
{
	if (!prefix)
		prefix = "";
	var links = [];
	for (var i = 0 ; i < addresses.length ; i++)
		links.push("<a href=\"" + prefix + addresses[i] + "/\" target=\"_blank\">" + addresses[i] + "</a>");
	return links;
}

function parseMetricPrefix(prefix)
{
	var power = 0;
	if ((prefix) && (prefix.length > 0))
	{
		if (prefix.length > 1)
		{
			prefix = prefix.toLowerCase();
			power = ($.inArray(prefix, metricPrefixes["long"]) + 1) * 3;
		}
		else
		{
			prefix = prefix.toUpperCase();
			power = ($.inArray(prefix, metricPrefixes["short"]) + 1) * 3;
		}
		if (power === 0)
			return NaN;
	}
	return Math.pow(10, power);
}

function parseRate(rateString, nounit)
{
	return parseUnitString(rateString, units["rate"], nounit);
}

function parseSize(sizeString, nounit)
{
	return parseUnitString(sizeString, units["size"], nounit);
}

function parseSpeed(speedString, nounit)
{
	return parseUnitString(speedString, units["speed"], nounit);
}

function parseUnitPrefix(unit, units, nounit)
{
	var parser = new RegExp("^(.+)?(" + units.join("|") + ")$", "i");
	var parts = unit.match(parser);
	if (!parts)
	{
		if (nounit)
			return parseMetricPrefix(unit);
		else
			return NaN;
	}
	return parseMetricPrefix(parts[1]);
}

function parseUnitString(unitString, units, nounit)
{
	var parser = /^(\d+\.?\d*|\.\d+)(.+)?$/;
	var parts = unitString.match(parser);
	if (!parts)
		return NaN;
	var number = parseFloat(parts[1]);
	number *= parseUnitPrefix($.trim(parts[2]), units, nounit);
	return number;
}

function getCountryString(country)
{
	if (countryCodes[country])
		return countryCodes[country];
	else
		return country;
}

function getStateString(state)
{
	if (stateCodes[state])
		return stateCodes[state];
	else
		return state;
}
