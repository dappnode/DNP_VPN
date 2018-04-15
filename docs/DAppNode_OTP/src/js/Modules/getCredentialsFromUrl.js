import base64url from 'base64url';
import { Base64 } from 'js-base64';

let otpVariableTag = 'otp';

function getJsonFromUrl(hashBased) {
  var query;
  if(hashBased) {
    var pos = location.href.indexOf("#");
    if(pos==-1) return [];
    query = location.href.substr(pos+1);
  } else {
    query = location.search.substr(1);
  }
  var result = {};
  query.split("&").forEach(function(part) {
    if(!part) return;
    part = part.split("+").join(" "); // replace every + with space, regexp-free version
    var eq = part.indexOf("=");
    var key = eq>-1 ? part.substr(0,eq) : part;
    var val = eq>-1 ? decodeURIComponent(part.substr(eq+1)) : "";
    var from = key.indexOf("[");
    if(from==-1) result[decodeURIComponent(key)] = val;
    else {
      var to = key.indexOf("]",from);
      var index = decodeURIComponent(key.substring(from+1,to));
      key = decodeURIComponent(key.substring(0,from));
      if(!result[key]) result[key] = [];
      if(!index) result[key].push(val);
      else result[key][index] = val;
    }
  });
  return result;
}

export default function() {
  let urlVariables = getJsonFromUrl(true);

  // Make sure the link only contains the otp variable
  if (!(otpVariableTag in urlVariables)) {
    console.warn('incorrect url format, no otp variable found');
    return;
  }
  let encodedOTP = urlVariables[otpVariableTag];
  // let otpDemo = 'eyJzZXJ2ZXIiOiIxMjcuMC4wLjEiLCJuYW1lIjoiZGFwcG5vZGUtZ2l2ZXRoIiwidXNlciI6InZwbl91c2VyIiwicGFzcyI6Ik1DNHhPMlZrZFR0d1lYTnoiLCJwc2siOiJUSTNMakF1TUM0eCJ9';

  // Make sure the decoded OTP is valid an can be safely parsed
  let decodedOTP = base64url.decode(encodedOTP);
  let credentials;
  try {
    credentials = JSON.parse(decodedOTP);
  } catch (e) {
    if (e instanceof SyntaxError) {
      console.log('Syntax Error, invalid otp')
      return;
    } else {
      console.log(err);
      return;
    }
  }

  // Make sure the credentials object has all required keys
  let requiredKeys = ['name','pass','psk','server','user']
  requiredKeys.forEach(function(key) {
    if (!(key in credentials)) {
      console.log('The OTP is missing a required key: ',key,credentials)
      return;
    }
  });

  // Encode the password
  credentials.psk = Base64.encode(credentials.psk)

  // Return the valid credentials object
  return credentials;

};
