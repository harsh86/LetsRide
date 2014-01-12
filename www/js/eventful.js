
if (window.EVDB === undefined) window.EVDB = {};
if (EVDB.API === undefined) EVDB.API = {};

EVDB.API.idRequest = 1;
EVDB.API.requests = [];
EVDB.API.elHead = null;
EVDB.API.URL = "http://api.evdb.com/json";
EVDB.API.version = 0.4;

EVDB.API.call = function(sMethod, args, fnCallback)
{
  try {
    // serialize args if necessary
    if (typeof args == "object")
    {
      // add user-specific details to every call automatically if we have them
      if (EVDB.API.app_key) args.app_key = EVDB.API.app_key;
      if (EVDB.API.user) args.user = EVDB.API.user;
      if (EVDB.API.user_key) args.user_key = EVDB.API.user_key;

      args = EVDB.API._serialize(args);
    }
    else
    {
      // add user-specific details to every call automatically if we have them
      var sUserArgs = '', oUserArgs = {};
      if (EVDB.API.app_key) oUserArgs.app_key = EVDB.API.app_key;
      if (EVDB.API.user) oUserArgs.user = EVDB.API.user;
      if (EVDB.API.user_key) oUserArgs.user_key = EVDB.API.user_key;
      args += (args.length ? '&' : '') + EVDB.API._serialize(oUserArgs);
    }

    // create the script element for the api call
    var elScript = document.createElement("script");
    elScript.src = EVDB.API.URL + sMethod +'?'+ args +"&json_request_id="+
    EVDB.API.idRequest;

    // add the call to the requests queue
    EVDB.API.requests[EVDB.API.idRequest++] = {el: elScript, cb: fnCallback};

    // append the script element to the dom (to fetch the data)
    if (!EVDB.API.elHead)
    {
      EVDB.API.elHead = document.getElementsByTagName("head")[0];
    }
    
    EVDB.API.elHead.appendChild(elScript);

  } catch(e) {
      EVDB.API.error(e.toString());
      return false;
  }
  return true;
}
EVDB.API.error = function(sText)
{
  var elDiv = document.createElement("div");
  elDiv.appendChild(document.createTextNode(sText));
  document.body.insertBefore(elDiv, document.body.firstChild);
  elDiv.setAttribute("style", "margin:1em;padding:0.5em;border:2px dashed "+
  "#ff9999;font-size:12px;color:red;");
  return true;
}
EVDB.API._complete = function(idRequest, oData)
{
  var requestData = EVDB.API.requests[idRequest] || null;

  if (requestData)
  {
    // if we have a valid callback
    if (typeof requestData.cb == "function")
    {
      var fnCallback = requestData.cb;

      // clean up the request
      try { EVDB.API.elHead.removeChild(requestData.el); } catch (e) {}
      EVDB.API.requests[idRequest] = null;

      // fire the callback with the data
      fnCallback(oData);
      return true;
    }
    else
    {
      EVDB.API.error("Invalid callback function.");
    }
  }
  else
  {
    EVDB.API.error("Invalid request id.");
  }
  return false;
}
EVDB.API._serialize = function(oFrom)
{
  var aTemp = [];
  for (var i in oFrom)
  {
    aTemp.push(encodeURIComponent(i) +'='+ encodeURIComponent(oFrom[i]));
  }
  return aTemp.join('&');
}