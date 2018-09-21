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

var credentials = {
  spreadSheetId:'<SpreadSheetID>',
  slackToken:'<Bot User OAuth Access Token>'
}

function getSpreadsheet(){
  var spreadsheetId = credentials['spreadSheetId'];
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
  var token = credentials['slackToken'];
  
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

function buildLineChart(){
  var sheet = getSpreadsheet();
  var dates = sheet.getRange(1, 1, sheet.getLastRow(), 3).getValues();
  var weights = sheet.getRange(1, 6, sheet.getLastRow(), 1).getValues();
  var dataTable = Charts.newDataTable()
                        .addColumn(Charts.ColumnType.DATE, 'date')
                        .addColumn(Charts.ColumnType.NUMBER, 'weight');
  
  for(var i=0; i<sheet.getLastRow(); i++){
    var date = new Date(dates[i][0], dates[i][1], dates[i][2])
    dataTable.addRow([date, weights[i][0]])
  }
  
  var chart = Charts.newLineChart()
                    .setDataTable(dataTable)
                    .setTitle('My Weight')
                    .setTitleTextStyle(Charts.newTextStyle().setFontSize(40))
                    .setDimensions(800, 600)
                    .setColors(['#4aa0f7'])
                    .setPointStyle(Charts.PointStyle.MEDIUM)
                    .setOption('vAxis.minValue', 50)
                    .setOption('vAxis.maxValue', 70)
                    .setXAxisTextStyle(Charts.newTextStyle().setFontSize(13))
                    .setXAxisTitle('Date').setXAxisTitleTextStyle(Charts.newTextStyle().setFontSize(20))
                    .setYAxisTextStyle(Charts.newTextStyle().setFontSize(13))
                    .setYAxisTitle('Weight').setYAxisTitleTextStyle(Charts.newTextStyle().setFontSize(20))
                    .build()

  return chart
}
