////////////////////////////////////////
// Location Code Mappings
////////////////////////////////////////

var countryCodes = {
	"AC": "Ascension Island",
	"AD": "Andorra",
	"AE": "United Arab Emirates",
	"AF": "Afghanistan",
	"AG": "Antigua and Barbuda",
	"AI": "Anguilla",
	"AL": "Albania",
	"AM": "Armenia",
	"AO": "Angola",
	"AQ": "Antarctica",
	"AR": "Argentina",
	"AS": "American Samoa",
	"AT": "Austria",
	"AU": "Australia",
	"AW": "Aruba",
	"AX": "Åland Islands",
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
	"BL": "Saint Barthélemy",
	"BM": "Bermuda",
	"BN": "Brunei Darussalam",
	"BO": "Plurinational State of Bolivia",
	"BQ": "Bonaire, Sint Eustatius and Saba",
	"BR": "Brazil",
	"BS": "Bahamas",
	"BT": "Bhutan",
	"BV": "Bouvet Island",
	"BW": "Botswana",
	"BY": "Belarus",
	"BZ": "Belize",
	"CA": "Canada",
	"CC": "Cocos (Keeling) Islands",
	"CD": "The Democratic Republic of the Congo",
	"CF": "Central African Republic",
	"CG": "Congo",
	"CH": "Switzerland",
	"CI": "Côte d'Ivoire",
	"CK": "Cook Islands",
	"CL": "Chile",
	"CM": "Cameroon",
	"CN": "China",
	"CO": "Colombia",
	"CP": "Clipperton Island",
	"CR": "Costa Rica",
	"CU": "Cuba",
	"CV": "Cabo Verde",
	"CW": "Curaçao",
	"CX": "Christmas Island",
	"CY": "Cyprus",
	"CZ": "Czech Republic",
	"DE": "Germany",
	"DG": "Diego Garcia",
	"DJ": "Djibouti",
	"DK": "Denmark",
	"DM": "Dominica",
	"DO": "Dominican Republic",
	"DZ": "Algeria",
	"EA": "Ceuta and Melilla",
	"EC": "Ecuador",
	"EE": "Estonia",
	"EG": "Egypt",
	"EH": "Western Sahara",
	"ER": "Eritrea",
	"ES": "Spain",
	"ET": "Ethiopia",
	"EU": "European Union",
	"FI": "Finland",
	"FJ": "Fiji",
	"FK": "Falkland Islands (Malvinas)",
	"FM": "Federated States of Micronesia",
	"FO": "Faroe Islands",
	"FR": "France",
	"GA": "Gabon",
	"GB": "United Kingdom",
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
	"HM": "Heard Island and McDonald Islands",
	"HN": "Honduras",
	"HR": "Croatia",
	"HT": "Haiti",
	"HU": "Hungary",
	"IC": "Canary Islands",
	"ID": "Indonesia",
	"IE": "Ireland",
	"IL": "Israel",
	"IM": "Isle of Man",
	"IN": "India",
	"IO": "British Indian Ocean Territory",
	"IQ": "Iraq",
	"IR": "Islamic Republic of Iran",
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
	"KP": "Democratic People's Republic of Korea",
	"KR": "Republic of Korea",
	"KW": "Kuwait",
	"KY": "Cayman Islands",
	"KZ": "Kazakhstan",
	"LA": "Lao People's Democratic Republic",
	"LB": "Lebanon",
	"LC": "Saint Lucia",
	"LI": "Liechtenstein",
	"LK": "Sri Lanka",
	"LR": "Liberia",
	"LS": "Lesotho",
	"LT": "Lithuania",
	"LU": "Luxembourg",
	"LV": "Latvia",
	"LY": "Libya",
	"MA": "Morocco",
	"MC": "Monaco",
	"MD": "Republic of Moldova",
	"ME": "Montenegro",
	"MF": "Saint Martin (French part)",
	"MG": "Madagascar",
	"MH": "Marshall Islands",
	"MK": "The former Yugoslav Republic of Macedonia",
	"ML": "Mali",
	"MM": "Myanmar",
	"MN": "Mongolia",
	"MO": "Macao",
	"MP": "Northern Mariana Islands",
	"MQ": "Martinique",
	"MR": "Mauritania",
	"MS": "Montserrat",
	"MT": "Malta",
	"MU": "Mauritius",
	"MV": "Maldives",
	"MW": "Malawi",
	"MX": "Mexico",
	"MY": "Malaysia",
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
	"PM": "Saint Pierre and Miquelon",
	"PN": "Pitcairn",
	"PR": "Puerto Rico",
	"PS": "State of Palestine",
	"PT": "Portugal",
	"PW": "Palau",
	"PY": "Paraguay",
	"QA": "Qatar",
	"RE": "Réunion",
	"RO": "Romania",
	"RS": "Serbia",
	"RU": "Russian Federation",
	"RW": "Rwanda",
	"SA": "Saudi Arabia",
	"SB": "Solomon Islands",
	"SC": "Seychelles",
	"SD": "Sudan",
	"SE": "Sweden",
	"SG": "Singapore",
	"SH": "Saint Helena, Ascension and Tristan da Cunha",
	"SI": "Slovenia",
	"SJ": "Svalbard and Jan Mayen",
	"SK": "Slovakia",
	"SL": "Sierra Leone",
	"SM": "San Marino",
	"SN": "Senegal",
	"SO": "Somalia",
	"SR": "Suriname",
	"SS": "South Sudan",
	"ST": "Sao Tome and Principe",
	"SV": "El Salvador",
	"SX": "Sint Maarten (Dutch part)",
	"SY": "Syrian Arab Republic",
	"SZ": "Swaziland",
	"TA": "Tristan da Cunha",
	"TC": "Turks and Caicos Islands",
	"TD": "Chad",
	"TF": "French Southern Territories",
	"TG": "Togo",
	"TH": "Thailand",
	"TJ": "Tajikistan",
	"TK": "Tokelau",
	"TL": "Timor-Leste",
	"TM": "Turkmenistan",
	"TN": "Tunisia",
	"TO": "Tonga",
	"TR": "Turkey",
	"TT": "Trinidad and Tobago",
	"TV": "Tuvalu",
	"TW": "Taiwan, Province of China",
	"TZ": "United Republic of Tanzania",
	"UA": "Ukraine",
	"UG": "Uganda",
	"UK": "United Kingdom",
	"UM": "United States Minor Outlying Islands",
	"US": "United States",
	"UY": "Uruguay",
	"UZ": "Uzbekistan",
	"VA": "Holy See (Vatican City State)",
	"VC": "Saint Vincent and the Grenadines",
	"VE": "Bolivarian Republic of Venezuela",
	"VG": "British Virgin Islands",
	"VI": "United States Virgin Islands",
	"VN": "Viet Nam",
	"VU": "Vanuatu",
	"WF": "Wallis and Futuna",
	"WS": "Samoa",
	"YE": "Yemen",
	"YT": "Mayotte",
	"ZA": "South Africa",
	"ZM": "Zambia",
	"ZW": "Zimbabwe"
};

var stateCodes = {
	"AK": "Alaska",
	"AL": "Alabama",
	"AR": "Arkansas",
	"AS": "American Samoa",
	"AZ": "Arizona",
	"CA": "California",
	"CO": "Colorado",
	"CT": "Connecticut",
	"DC": "District of Columbia",
	"DE": "Delaware",
	"FL": "Florida",
	"GA": "Georgia",
	"GU": "Guam",
	"HI": "Hawaii",
	"IA": "Iowa",
	"ID": "Idaho",
	"IL": "Illinois",
	"IN": "Indiana",
	"KS": "Kansas",
	"KY": "Kentucky",
	"LA": "Louisiana",
	"MA": "Massachusetts",
	"MD": "Maryland",
	"ME": "Maine",
	"MI": "Michigan",
	"MN": "Minnesota",
	"MO": "Missouri",
	"MP": "Northern Mariana Islands",
	"MS": "Mississippi",
	"MT": "Montana",
	"NC": "North Carolina",
	"ND": "North Dakota",
	"NE": "Nebraska",
	"NH": "New Hampshire",
	"NJ": "New Jersey",
	"NM": "New Mexico",
	"NV": "Nevada",
	"NY": "New York",
	"OH": "Ohio",
	"OK": "Oklahoma",
	"OR": "Oregon",
	"PA": "Pennsylvania",
	"PR": "Puerto Rico",
	"RI": "Rhode Island",
	"SC": "South Carolina",
	"SD": "South Dakota",
	"TN": "Tennessee",
	"TX": "Texas",
	"UM": "United States Minor Outlying Islands",
	"UT": "Utah",
	"VA": "Virginia",
	"VI": "United States Virgin Islands",
	"VT": "Vermont",
	"WA": "Washington",
	"WI": "Wisconsin",
	"WV": "West Virginia",
	"WY": "Wyoming",
};

////////////////////////////////////////
// Regexes
////////////////////////////////////////

var IPv4Format = /^([\d]{1,3}\.){3}[\d]{1,3}(:\d+)?$/;
var IPv6Format = /^(([\da-fA-F]{0,4}:){3,7}[\da-fA-F]{0,4}|\[([\da-fA-F]{0,4}:){3,7}[\da-fA-F]{0,4}\](:\d+)?)$/;
var hostnameFormat = /^[A-Za-z0-9]+((\-|\.)[A-Za-z0-9]+)*(:\d+)?$/;
var hostnamev6 = /(-v6|-ip6|-ipv6)/i;

////////////////////////////////////////
// Sort Order Mappings
////////////////////////////////////////

var sortOrder = {
	"hostname": {
		"Hostname": 0,
		"URL": 0,
		"IPv4": 1,
		"IPv6": 2
	}
};

////////////////////////////////////////
// Unit and Prefix Mappings
////////////////////////////////////////

var metricPrefixes = {
	"short": [ "K", "M", "G", "T", "P", "E", "Z", "Y" ],
	"long": [ "kilo", "mega", "giga", "tera", "peta", "exa", "zetta", "yotta" ]
};

var units = {
	"rate": [ "b/s", "bit/s", "bps" ],
	"size": [ "byte", "bytes", "B" ],
	"speed": [ "hertz", "Hz" ]
};

////////////////////////////////////////
// Array Prototype Functions
////////////////////////////////////////

Array.prototype.equals = function(compare) {
	if (this.length != compare.length)
		return false;
	for (var i = 0 ; i < this.length ; i++)
	{
		if (this[i] !== compare[i])
			return false;
	}
	return true;
};

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

////////////////////////////////////////
// Address Functions
////////////////////////////////////////

function getAddressType(address)
{
	if (IPv4Format.test(address))
		return "IPv4";
	else if (IPv6Format.test(address))
		return "IPv6";
	else if (hostnameFormat.test(address))
		return "Hostname";
	else
		return "URL";
}

function getHostFromURL(url)
{
	var host = new URI(url).host();
	if (host)
		return host;
	return url;
}

function getHostnameFromURL(url)
{
	var hostname = new URI(url).hostname();
	if (hostname)
		return hostname;
	return url;
}

function getLinks(addresses, prefix, suffix)
{
	if (!prefix)
		prefix = "";
	if (!suffix)
		suffix = "";
	var links = [];
	for (var i = 0 ; i < addresses.length ; i++)
		links.push("<a href=\"" + prefix + IPv6Fix(addresses[i]) + suffix + "\" target=\"_blank\">" + addresses[i] + "</a>");
	return links;
}

function IPv6Fix(address)
{
	var nonLiteral = /^([\da-fA-F]{0,4}:){3,7}[\da-fA-F]{0,4}$/;
	if (nonLiteral.test(address))
		return "[" + address + "]";
	return address;
}

////////////////////////////////////////
// Formatting Functions
////////////////////////////////////////

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

////////////////////////////////////////
// Parsing Functions
////////////////////////////////////////

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

////////////////////////////////////////
// Location Functions
////////////////////////////////////////

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

////////////////////////////////////////
// Query Functions
////////////////////////////////////////

function hashToQuery(hash)
{
	var query = "";
	var params = [];
	for (var param in hash)
	{
		var args = "";
		if (hash[param] instanceof Array)
			args = hash[param].join(",");
		else
			args = hash[param];
		params.push(encodeURIComponent(param) + "=" + encodeURIComponent(args));
	}
	query += params.join("&");
	return query;
}

function queryToHash(query)
{
	var hash = {};
	var params = query.substring(1).split("&");
	for (var i = 0 ; i < params.length ; i++)
	{
		var parts = params[i].split("=");
		if (parts[0])
		{
			var param = decodeURIComponent(parts[0]);
			var args = [];
			if (parts.length > 1)
				args = decodeURIComponent(parts[1]).split(",");
			hash[param] = args;
		}
	}
	return hash;
}

////////////////////////////////////////
// Sorting Functions
////////////////////////////////////////

function compareHostnames(hostname_a, hostname_b)
{
	hostname_a = hostname_a.replace(hostnamev6, "~");
	hostname_b = hostname_b.replace(hostnamev6, "~");
	var order_a = sortOrder["hostname"][getAddressType(hostname_a)];
	var order_b = sortOrder["hostname"][getAddressType(hostname_b)];
	return order_a > order_b ? 1 : order_a < order_b ? -1 : hostname_a > hostname_b ? 1 : hostname_a < hostname_b ? -1 : 0;
}
