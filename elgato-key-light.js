/*
 * Version: 0.1
 * Arguments: IP Address, On/Off, Brightness, Temprature
 * On/Off is either 1 or 0.  If no valid values provided as argument light will toggle on or off
 * Brightness minimum is 3 for 3%, maximum is 100 for 100% and default is is 20
 * Temperature minimum is 143 for 7000K, maximum is 344 for 2900K and default is 213 for 4700K
 * Unit for temperature used in Elgato Key Light is "mired"
 * mired = 1000000 / kelvin. https://en.wikipedia.org/wiki/Mired
 * e.g. argument '192.168.0.20'           -- toggle light on and off
 * e.g. argument '192.168.0.20,0'         -- turn light off
 * e.g. argument '192.168.0.20,1,50, 215' -- turn light on at 50% brightness and 4650K
 * e.g. argument '192.168.0.20,,20'       -- toggle light on and off at 20% brightness
 */

let argument = args[0];

let ipaddress = ''
let onoff = 0;
let brightness = 0;
let temperature = 0;

if(typeof(argument) == "undefined") {
  // this code is executed if it is triggered from a flow without arguments
  throw new Error('Run script from flow with specified argument!');
}

//  Process argument and find the IP address and other arguments if provided
const array = argument.split(",")
if (typeof(array[0]) == "string")
{
  ipaddress = array[0].trim();  // WARNING: any string is assumed as IP address in this version
}
let url = 'http://' + ipaddress + ':9123/elgato/lights'

// Query URL for current values
const response = await fetch(url);
if (!response.ok) {
  throw new Error(response.statusText);
}
let json =  await response.json();

// Process the argument to find the on or off if provided
// If argument is not provided or it is invalid, then toggle the current on or off values
json.lights[0].on = 1 - json.lights[0].on; // flip on off between 0 and 1 by default
if (typeof(array[1]) != "undefined") {
  onoff = parseInt(array[1].trim());
  if(onoff == 1 || onoff == 0) {
  // set the value if on off argument is valid 0 or 1 value
    json.lights[0].on = onoff; // on or off value can only be 0 or 1
  }
}

//  Argument 2: Brightness
// If argument is not provided, it will be set to value read from the light
if (typeof(array[2]) != "undefined")
{
  brightness = parseInt(array[2].trim());
  if(brightness >= 3 && brightness <=100) {
    json.lights[0].brightness = brightness; // set brightness if it is in valid range or leave unchanged 
  }
}
// Argument 3: Temprature
// If argument is not provided, it will be set to value read from the light
if (typeof(array[3]) != "undefined")
{
  let temperature = parseInt(array[3].trim());
  // check for temperature range
  json.lights[0].temperature = temperature;
}

let put = JSON.stringify(json);

fetch(url,{
  method: 'PUT',
	headers:{
    'Content-Type': 'application/json'
	},
	body: put
})
