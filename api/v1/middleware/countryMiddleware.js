const dotenv = require('dotenv');

// Country to code mapping
const countryMapping = {
  'Afghanistan': 'AF',
  'Albania': 'AL',
  'Algeria': 'DZ',
  'Andorra': 'AD',
  'Angola': 'AO',
  'Argentina': 'AR',
  'Armenia': 'AM',
  'Australia': 'AU',
  'Austria': 'AT',
  'Azerbaijan': 'AZ',
  'Bahamas': 'BS',
  'Bahrain': 'BH',
  'Bangladesh': 'BD',
  'Barbados': 'BB',
  'Belarus': 'BY',
  'Belgium': 'BE',
  'Belize': 'BZ',
  'Benin': 'BJ',
  'Bhutan': 'BT',
  'Bolivia': 'BO',
  'Bosnia and Herzegovina': 'BA',
  'Botswana': 'BW',
  'Brazil': 'BR',
  'Brunei': 'BN',
  'Bulgaria': 'BG',
  'Burkina Faso': 'BF',
  'Burundi': 'BI',
  'Cambodia': 'KH',
  'Cameroon': 'CM',
  'Canada': 'CA',
  'Cape Verde': 'CV',
  'Central African Republic': 'CF',
  'Chad': 'TD',
  'Chile': 'CL',
  'China': 'CN',
  'Colombia': 'CO',
  'Comoros': 'KM',
  'Congo': 'CG',
  'Congo, Democratic Republic of the': 'CD',
  'Costa Rica': 'CR',
  'Croatia': 'HR',
  'Cuba': 'CU',
  'Cyprus': 'CY',
  'Czech Republic': 'CZ',
  'Denmark': 'DK',
  'Djibouti': 'DJ',
  'Dominica': 'DM',
  'Dominican Republic': 'DO',
  'Ecuador': 'EC',
  'Egypt': 'EG',
  'El Salvador': 'SV',
  'Equatorial Guinea': 'GQ',
  'Eritrea': 'ER',
  'Estonia': 'EE',
  'Eswatini': 'SZ',
  'Ethiopia': 'ET',
  'Fiji': 'FJ',
  'Finland': 'FI',
  'France': 'FR',
  'Gabon': 'GA',
  'Gambia': 'GM',
  'Georgia': 'GE',
  'Germany': 'DE',
  'Ghana': 'GH',
  'Greece': 'GR',
  'Grenada': 'GD',
  'Guatemala': 'GT',
  'Guinea': 'GN',
  'Guinea-Bissau': 'GW',
  'Guyana': 'GY',
  'Haiti': 'HT',
  'Honduras': 'HN',
  'Hungary': 'HU',
  'Iceland': 'IS',
  'India': 'IN',
  'Indonesia': 'ID',
  'Iran': 'IR',
  'Iraq': 'IQ',
  'Ireland': 'IE',
  'Israel': 'IL',
  'Italy': 'IT',
  'Jamaica': 'JM',
  'Japan': 'JP',
  'Jordan': 'JO',
  'Kazakhstan': 'KZ',
  'Kenya': 'KE',
  'Kiribati': 'KI',
  'Kuwait': 'KW',
  'Kyrgyzstan': 'KG',
  'Laos': 'LA',
  'Latvia': 'LV',
  'Lebanon': 'LB',
  'Lesotho': 'LS',
  'Liberia': 'LR',
  'Libya': 'LY',
  'Liechtenstein': 'LI',
  'Lithuania': 'LT',
  'Luxembourg': 'LU',
  'Madagascar': 'MG',
  'Malawi': 'MW',
  'Malaysia': 'MY',
  'Maldives': 'MV',
  'Mali': 'ML',
  'Malta': 'MT',
  'Marshall Islands': 'MH',
  'Mauritania': 'MR',
  'Mauritius': 'MU',
  'Mexico': 'MX',
  'Micronesia': 'FM',
  'Moldova': 'MD',
  'Monaco': 'MC',
  'Mongolia': 'MN',
  'Montenegro': 'ME',
  'Morocco': 'MA',
  'Mozambique': 'MZ',
  'Myanmar': 'MM',
  'Namibia': 'NA',
  'Nauru': 'NR',
  'Nepal': 'NP',
  'Netherlands': 'NL',
  'New Zealand': 'NZ',
  'Nicaragua': 'NI',
  'Niger': 'NE',
  'Nigeria': 'NG',
  'North Korea': 'KP',
  'North Macedonia': 'MK',
  'Norway': 'NO',
  'Oman': 'OM',
  'Pakistan': 'PK',
  'Palau': 'PW',
  'Panama': 'PA',
  'Papua New Guinea': 'PG',
  'Paraguay': 'PY',
  'Peru': 'PE',
  'Philippines': 'PH',
  'Poland': 'PL',
  'Portugal': 'PT',
  'Qatar': 'QA',
  'Romania': 'RO',
  'Russia': 'RU',
  'Rwanda': 'RW',
  'Saint Kitts and Nevis': 'KN',
  'Saint Lucia': 'LC',
  'Saint Vincent and the Grenadines': 'VC',
  'Samoa': 'WS',
  'San Marino': 'SM',
  'Sao Tome and Principe': 'ST',
  'Saudi Arabia': 'SA',
  'Senegal': 'SN',
  'Serbia': 'RS',
  'Seychelles': 'SC',
  'Sierra Leone': 'SL',
  'Singapore': 'SG',
  'Slovakia': 'SK',
  'Slovenia': 'SI',
  'Solomon Islands': 'SB',
  'Somalia': 'SO',
  'South Africa': 'ZA',
  'South Korea': 'KR',
  'South Sudan': 'SS',
  'Spain': 'ES',
  'Sri Lanka': 'LK',
  'Sudan': 'SD',
  'Suriname': 'SR',
  'Sweden': 'SE',
  'Switzerland': 'CH',
  'Syria': 'SY',
  'Taiwan': 'TW',
  'Tajikistan': 'TJ',
  'Tanzania': 'TZ',
  'Thailand': 'TH',
  'Timor-Leste': 'TL',
  'Togo': 'TG',
  'Tonga': 'TO',
  'Trinidad and Tobago': 'TT',
  'Tunisia': 'TN',
  'Turkey': 'TR',
  'Turkmenistan': 'TM',
  'Tuvalu': 'TV',
  'Uganda': 'UG',
  'Ukraine': 'UA',
  'United Arab Emirates': 'AE',
  'United Kingdom': 'GB',
  'United States': 'US',
  'Uruguay': 'UY',
  'Uzbekistan': 'UZ',
  'Vanuatu': 'VU',
  'Vatican City': 'VA',
  'Venezuela': 'VE',
  'Vietnam': 'VN',
  'Yemen': 'YE',
  'Zambia': 'ZM',
  'Zimbabwe': 'ZW'
};

// Country to currency mapping
const countryCurrencyMapping = {
  'Afghanistan': 'AFN',
  'Albania': 'ALL',
  'Algeria': 'DZD',
  'Andorra': 'EUR',
  'Angola': 'AOA',
  'Argentina': 'ARS',
  'Armenia': 'AMD',
  'Australia': 'AUD',
  'Austria': 'EUR',
  'Azerbaijan': 'AZN',
  'Bahamas': 'BSD',
  'Bahrain': 'BHD',
  'Bangladesh': 'BDT',
  'Barbados': 'BBD',
  'Belarus': 'BYN',
  'Belgium': 'EUR',
  'Belize': 'BZD',
  'Benin': 'XOF',
  'Bhutan': 'BTN',
  'Bolivia': 'BOB',
  'Bosnia and Herzegovina': 'BAM',
  'Botswana': 'BWP',
  'Brazil': 'BRL',
  'Brunei': 'BND',
  'Bulgaria': 'BGN',
  'Burkina Faso': 'XOF',
  'Burundi': 'BIF',
  'Cambodia': 'KHR',
  'Cameroon': 'XAF',
  'Canada': 'CAD',
  'Cape Verde': 'CVE',
  'Central African Republic': 'XAF',
  'Chad': 'XAF',
  'Chile': 'CLP',
  'China': 'CNY',
  'Colombia': 'COP',
  'Comoros': 'KMF',
  'Congo': 'XAF',
  'Congo, Democratic Republic of the': 'CDF',
  'Costa Rica': 'CRC',
  'Croatia': 'HRK',
  'Cuba': 'CUP',
  'Cyprus': 'EUR',
  'Czech Republic': 'CZK',
  'Denmark': 'DKK',
  'Djibouti': 'DJF',
  'Dominica': 'XCD',
  'Dominican Republic': 'DOP',
  'Ecuador': 'USD',
  'Egypt': 'EGP',
  'El Salvador': 'USD',
  'Equatorial Guinea': 'XAF',
  'Eritrea': 'ERN',
  'Estonia': 'EUR',
  'Eswatini': 'SZL',
  'Ethiopia': 'ETB',
  'Fiji': 'FJD',
  'Finland': 'EUR',
  'France': 'EUR',
  'Gabon': 'XAF',
  'Gambia': 'GMD',
  'Georgia': 'GEL',
  'Germany': 'EUR',
  'Ghana': 'GHS',
  'Greece': 'EUR',
  'Grenada': 'XCD',
  'Guatemala': 'GTQ',
  'Guinea': 'GNF',
  'Guinea-Bissau': 'XOF',
  'Guyana': 'GYD',
  'Haiti': 'HTG',
  'Honduras': 'HNL',
  'Hungary': 'HUF',
  'Iceland': 'ISK',
  'India': 'INR',
  'Indonesia': 'IDR',
  'Iran': 'IRR',
  'Iraq': 'IQD',
  'Ireland': 'EUR',
  'Israel': 'ILS',
  'Italy': 'EUR',
  'Jamaica': 'JMD',
  'Japan': 'JPY',
  'Jordan': 'JOD',
  'Kazakhstan': 'KZT',
  'Kenya': 'KES',
  'Kiribati': 'AUD',
  'Kuwait': 'KWD',
  'Kyrgyzstan': 'KGS',
  'Laos': 'LAK',
  'Latvia': 'EUR',
  'Lebanon': 'LBP',
  'Lesotho': 'LSL',
  'Liberia': 'LRD',
  'Libya': 'LYD',
  'Liechtenstein': 'CHF',
  'Lithuania': 'EUR',
  'Luxembourg': 'EUR',
  'Madagascar': 'MGA',
  'Malawi': 'MWK',
  'Malaysia': 'MYR',
  'Maldives': 'MVR',
  'Mali': 'XOF',
  'Malta': 'EUR',
  'Marshall Islands': 'USD',
  'Mauritania': 'MRU',
  'Mauritius': 'MUR',
  'Mexico': 'MXN',
  'Micronesia': 'USD',
  'Moldova': 'MDL',
  'Monaco': 'EUR',
  'Mongolia': 'MNT',
  'Montenegro': 'EUR',
  'Morocco': 'MAD',
  'Mozambique': 'MZN',
  'Myanmar': 'MMK',
  'Namibia': 'NAD',
  'Nauru': 'AUD',
  'Nepal': 'NPR',
  'Netherlands': 'EUR',
  'New Zealand': 'NZD',
  'Nicaragua': 'NIO',
  'Niger': 'XOF',
  'Nigeria': 'NGN',
  'North Korea': 'KPW',
  'North Macedonia': 'MKD',
  'Norway': 'NOK',
  'Oman': 'OMR',
  'Pakistan': 'PKR',
  'Palau': 'USD',
  'Panama': 'PAB',
  'Papua New Guinea': 'PGK',
  'Paraguay': 'PYG',
  'Peru': 'PEN',
  'Philippines': 'PHP',
  'Poland': 'PLN',
  'Portugal': 'EUR',
  'Qatar': 'QAR',
  'Romania': 'RON',
  'Russia': 'RUB',
  'Rwanda': 'RWF',
  'Saint Kitts and Nevis': 'XCD',
  'Saint Lucia': 'XCD',
  'Saint Vincent and the Grenadines': 'XCD',
  'Samoa': 'WST',
  'San Marino': 'EUR',
  'Sao Tome and Principe': 'STN',
  'Saudi Arabia': 'SAR',
  'Senegal': 'XOF',
  'Serbia': 'RSD',
  'Seychelles': 'SCR',
  'Sierra Leone': 'SLL',
  'Singapore': 'SGD',
  'Slovakia': 'EUR',
  'Slovenia': 'EUR',
  'Solomon Islands': 'AUD',
  'Somalia': 'SOS',
  'South Africa': 'ZAR',
  'South Korea': 'KRW',
  'South Sudan': 'SSP',
  'Spain': 'EUR',
  'Sri Lanka': 'LKR',
  'Sudan': 'SDG',
  'Suriname': 'SRD',
  'Sweden': 'SEK',
  'Switzerland': 'CHF',
  'Syria': 'SYP',
  'Taiwan': 'TWD',
  'Tajikistan': 'TJS',
  'Tanzania': 'TZS',
  'Thailand': 'THB',
  'Timor-Leste': 'USD',
  'Togo': 'XOF',
  'Tonga': 'TOP',
  'Trinidad and Tobago': 'TTD',
  'Tunisia': 'TND',
  'Turkey': 'TRY',
  'Turkmenistan': 'TMT',
  'Tuvalu': 'AUD',
  'Uganda': 'UGX',
  'Ukraine': 'UAH',
  'United Arab Emirates': 'AED',
  'United Kingdom': 'GBP',
  'United States': 'USD',
  'Uruguay': 'UYU',
  'Uzbekistan': 'UZS',
  'Vanuatu': 'VUV',
  'Vatican City': 'EUR',
  'Venezuela': 'VES',
  'Vietnam': 'VND',
  'Yemen': 'YER',
  'Zambia': 'ZMW',
  'Zimbabwe': 'ZWL',
};

// Function to get country code
const getCountryCode = (country) => {
  console.log(country);
  return countryMapping[country] || null; // Return null if the country is not found
};

// Function to get country currency
const getCountryCurrency = (country) => {
  return countryCurrencyMapping[country] || null; // Return null if the country is not found
};

module.exports = {
  getCountryCode,
  getCountryCurrency,
};