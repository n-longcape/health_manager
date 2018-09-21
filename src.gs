function doPost(e) {
  var postData = JSON.parse(e.postData.getDataAsString());
  var res = {};
  console.log(postData);
  if(postData.type === 'url_verification') {
    res = {'challenge':postData.challenge}
  } else if(postData.type === 'event_callback'){
    console.log('event_callback');
    eventHandler(postData.event);
  }
  
  return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
}

function getSpreadsheet(){
  var spreadsheetId = '<SpreadSheetID>';
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName('シート1');
  return spreadsheet;
}

function recodeWeight(w, utime){
  //console.log('recodeWeight');
  var spreadsheet = getSpreadsheet();
  var d = new Date(utime*1000);
  spreadsheet.appendRow([d.getFullYear(), d.getMonth()+1, d.getDate(), d.getHours(), d.getMinutes(), w])
}

function eventHandler(e){
  //console.log('eventHandler');
  switch(e.type){
    case "message":
      if (e.channel_type === 'im') {
        messageIm(e);
      }
      break;
  }
}

function messageIm(e) {
  //console.log('messageIm');
  var regFloat = /^\d+\.\d+$/;
  switch(true){
    case regFloat.test(e.text):
      recodeWeight(parseFloat(e.text), parseFloat(e.ts));
      replyDM(e, '記録されました');
      break;
  }
}

function replyDM(e, message){
  var url = 'https://slack.com/api/chat.postMessage'
  var token = '<Bot User OAuth Access Token>';
  
  var data = {
    'channel' : e.channel,
    'text' : message,
    'as_user' : true
  };
  
  var options = {
    'method' : 'post',
    'contentType' : 'application/json; charset=UTF-8',
    'headers' : {'Authorization': 'Bearer '+token},
    'payload' : JSON.stringify(data)
  };
  
  var response = UrlFetchApp.fetch(url, options)
  console.log(response.getContentText());
}
