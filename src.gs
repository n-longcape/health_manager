function doPost(e) {
  var postData = JSON.parse(e.postData.getDataAsString());
  var res = {};
  
  if(postData.type == 'url_verification') {
    res = {'challenge':postData.challenge}
  } else {
    
  }
  
  return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
}

