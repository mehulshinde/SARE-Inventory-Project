/**
* SARE project App data handling code
* @author Mehul Shinde
* List of executable methods-
* Execute checkInHandler : for checkIn master routing logic
* Execure writeTotalBoxes : for updating number of boxes in CheckIn sheet
* Execute extractCSV: to update box_data using CSV files on google drive
* Execute logSheets: to log the current fhm_input and checkIn data
*/
var ss = SpreadsheetApp.openByUrl("https://docs.google.com/a/iastate.edu/spreadsheets/d/1kEnRrfJtPxuLYCj1QTRsHjkdRZ7fOYoxE3_1lHAsIJw/edit?usp=sharing");//Stores the checkIn spreadsheet
SpreadsheetApp.setActiveSheet(ss.getSheets()[3]);
var data= ss.getDataRange().getValues();
var backup=new Array([]);
var checkin_logValues=new Array([]);
var curR=2;
var curBox=2;
var prod, hub, pickDrop, from, at, forBy, concatKey, address;
var status="Yellow";
var boxes="NA";
var newEntry="FALSE";
var checkedIn="No";
var cell;
var fhm_producer_arr;//for storing producers separated by commas
var lok=new Array();
var lok2d= new Array();
/**
* Finds next element
* @param {current index of the row, current Position(column index) } input any number
* @returns {String} next element in Routing.
*/
function getNext(i,curPos)
{
for(var k=curPos+1; k<data[0].length; k++)
        {
          if(data[i][k])
          return data[i][k];
        }
return -1;
}
/**
* Finds position of next element
* @param {current index of the row, current Position(column index) } input any number
* @returns {number} index of next element in Routing.
*/
function getNextPos(i, curPos)
{
for(var k=curPos+1; k<data[0].length; k++)
        {
          if(data[i][k])
          {
          return k;
          
          }
          
        }

return -1;
}
/**
* Finds previous element
* @param {current index of the row, current Position(column index) } input any number
* @returns {String} previous element in Routing.
*/
function getPrev(i, curPos)
{
for(var r=curPos-1; r>=0;r--)
        {
          if(data[i][r])
          {
          return data[i][r];
          }
        }
        return data[i][0];
}
/**
* Finds previous element
* @param {current index of the row, current Position(column index) } input any number
* @returns {String} index of previous element in Routing.
*/
function getPrevPos(i, curPos)
{
for(var r=curPos-1; r>=0;r--)
        {
        if(data[i][r])
        {
        return r;
        }
        }
        return -1;

}
/**
* Returns array of words from the producer column
* @param {String with producer names separated with commas } 
* @returns {Array} array of producer names from the string
*/
function wordArray(str)
{
fhm_producer_arr=new Array();
var wordStart=-1; 
var wordEnd=0;
var count=0;
var word;
str=str+", ";
for(var j=0; j<str.length-1; j++)
    {
      if(str.charAt(j)==','&&str.charAt(j+1)==' ')
      {
      
      wordEnd=j-1;
      if(j!=str.length-2)
      fhm_producer_arr[count]=str.substring(wordStart+1,wordEnd);
      else
      fhm_producer_arr[count]=str.substring(wordStart+1,wordEnd+1);
      fhm_producer_arr[count].trim();
      wordStart=wordEnd+2;
      count++;
      }

      
      
    }
    

}

/**
* Checks if the producer hub combination is in the fhm_input sheet
* @param {} 
* @returns {1 or 0 or -1} 1 or 0 if fhm_input tallies, -1 if there's no fhm_input
*/
function fhm_inputTally()
{
//hub="IFC";// for testing 
  //prod="WW Homestead";// for testing
  SpreadsheetApp.setActiveSheet(ss.getSheets()[2]);// Activate the fhm_input sheet
  var fhmData=ss.getDataRange().getValues();
  var flagHub=0;
  var flagProd=0;
  var row=1;

   
 //if(!(fhmData[1][1].valueOf()))
 //return -1;
  
 // Finding if the hub is in the list
  try
  {
  for(var i=1; i<fhmData.length; i++)
  {
    if(fhmData[i][1]==hub)
    {
      flagHub=1;
      row=i;
      break;
    }
    
    //Checking if the producer is in the list
    
   
    
   }
   
  
    wordArray(fhmData[row][2]);
     
    
    for(var x=0; x< fhm_producer_arr.length; x++)
    {
      if(prod==arr[x])
      {
      flagProd=1;
      break;
      }
    }
    }
    catch (err)
    {
    return -1;
    }
     /**
    
    Test if the arr is accurate
    */
   // var sheetData=ss.getSheets()[3].getRange(1, 1, 1000, 1000);
    //cell=sheetData.getCell(1, 5);
    //cell.setValue(flagHub && flagProd);
   
   
  return (flagHub && flagProd);

}
/**
* Gets the address of elements in 'At' column
* @param {} 
* @returns {String} address
*/
function getAddress()
{
ss=SpreadsheetApp.openByUrl("https://docs.google.com/a/iastate.edu/spreadsheets/d/1kEnRrfJtPxuLYCj1QTRsHjkdRZ7fOYoxE3_1lHAsIJw/edit?usp=sharing");
SpreadsheetApp.setActiveSpreadsheet(ss);
SpreadsheetApp.setActiveSheet(ss.getSheets()[1]);
var addressArr= SpreadsheetApp.getActiveSpreadsheet().getDataRange().getValues();
for(var i=1; i<addressArr.length; i++)
{
if(at && at.equals(addressArr[i][0]))
return addressArr[i][2];
}
return " ";
}
/**
* Writes the data on Check in sheet, handles fhm_input tally and checks for logged values(non-Yellow status values)
* @param {} 
* @returns {} 
*/
function writeData()
{
//if(fhm_inputTally()==-1)// if fhm input is empty or throws a null pointer 
//return;

//if(fhm_inputTally())// Checks if the producer hub combination exists in fhm_input sheet<*****************UNCOMMENT THIS****************************-
//{
//if(!backup[1][1])

address=getAddress();
concatKey=pickDrop+forBy+prod+hub;

//var colBackupArray=new Array();
//var extra=0;
SpreadsheetApp.setActiveSpreadsheet(SpreadsheetApp.openByUrl("https://docs.google.com/a/iastate.edu/spreadsheets/d/17nXsjfD1wTyGiPj-4SZtWvm5mpC52sbb8VAQmz8vjwI/edit?usp=sharing"));//The backup sheet

status ="Yellow";
boxes="NA";
checkedIn="No";
newEntry="FALSE";
var log=SpreadsheetApp.getActiveSpreadsheet();
SpreadsheetApp.setActiveSheet(log.getSheets()[2]);
var backup_sheet= log.getDataRange().getValues();
var flagBackup_sheet=0;
if(backup_sheet[0][15])// if backup isn't empty
{
//stores the last column of backup array in a 1d array
for(var x1=0; x1<backup_sheet.length; x1++)
{
if(backup_sheet[x1][15].equals(concatKey))
{
from=backup_sheet[x1][0];
address=backup_sheet[x1][1];
pickDrom=backup_sheet[x1][2];
forBy=backup_sheet[x1][3];
at=backup_sheet[x1][4];
prod=backup_sheet[x1][5];
hub=backup_sheet[x1][6];
boxes=backup_sheet[x1][7];
status=backup_sheet[x1][8];
newEntry=backup_sheet[x1][9];
checkedIn=backup_sheet[x1][10];
flagBackup_sheet=1;
backup_sheet[x1]={};
writeData2();
return;
//break;
}
}

if(flagBackup_sheet=0)
{
for(var x1=0; x1<backup_sheet.length; x1++)
{
if(backup_sheet[x1])
{
from=backup_sheet[x1][0];
address=backup_sheet[x1][1];
pickDrom=backup_sheet[x1][2];
forBy=backup_sheet[x1][3];
at=backup_sheet[x1][4];
prod=backup_sheet[x1][5];
hub=backup_sheet[x1][6];
boxes=backup_sheet[x1][7];
status=backup_sheet[x1][8];
newEntry=backup_sheet[x1][9];
checkedIn=backup_sheet[x1][10];
writeData2();
return;
}
}
}



}


writeData2();


}
/**
* Writes the data on Check in sheet, fills in values in the checkIn sheet
* @param {} 
* @returns {} 
*/
function writeData2()
{
SpreadsheetApp.setActiveSpreadsheet(SpreadsheetApp.openByUrl("https://docs.google.com/a/iastate.edu/spreadsheets/d/1kEnRrfJtPxuLYCj1QTRsHjkdRZ7fOYoxE3_1lHAsIJw/edit?usp=sharing"));
SpreadsheetApp.setActiveSheet(ss.getSheets()[4]);//Activate the checkin sheet


//var activeSheet=SpreadsheetApp.getActiveSheet();
var sheetData=ss.getSheets()[4].getRange(1, 1, 1000, 1000);

if(pickDrop.equals("Receive"))
{

cell=sheetData.getCell(curR, 1);
cell.setValue(from+" Arrival");// From column
cell=sheetData.getCell(curR, 2);
cell.setValue(address);
cell=sheetData.getCell(curR, 3);
cell.setValue(pickDrop);
cell=sheetData.getCell(curR, 4);
cell.setValue(forBy);
cell=sheetData.getCell(curR, 5);
cell.setValue(" ");


}

else
{

cell=sheetData.getCell(curR, 1);
cell.setValue(" ");
cell=sheetData.getCell(curR, 2);
cell.setValue(address);
cell=sheetData.getCell(curR, 3);
cell.setValue(pickDrop);
cell=sheetData.getCell(curR, 4);
cell.setValue(forBy);
cell=sheetData.getCell(curR, 5);
cell.setValue(at+" Facility");// At column

}
cell=sheetData.getCell(curR, 6);
cell.setValue(prod);
cell=sheetData.getCell(curR, 7);
cell.setValue(hub);
cell=sheetData.getCell(curR, 8);
cell.setValue(boxes);
cell=sheetData.getCell(curR, 9);
cell.setValue(status);
cell=sheetData.getCell(curR, 10);
cell.setValue(newEntry);
cell=sheetData.getCell(curR, 11);
cell.setValue(checkedIn);
cell=sheetData.getCell(curR, 15);
cell.setValue(concatKey);




curR++;



}

/**
* collects check in data based on the Master routing
* @param {} 
* @returns {} 
*/
function checkInHandler() {


for(var i=1; i<data.length; i++)//for rows
{

  for(var j=1; j<data[0].length; j=getNextPos(i,j))//for columns
  {
 
  hub=data[i][data[0].length-1];
  prod=data[i][0]; 
     
  if(data[i][j])
  {
  
      
        
       if (j==3||(j-3)%4==0) // If this is a truck
      {
          pickDrop="Pick";
          forBy=data[i][j];
          at=getPrev(i,j);
          writeData();
        
      }
      else if(j==4||j%4==0||j==data[i].length-1) //If this is a hub/temp storage
      {
        
         if(getPrevPos(i,j)!=-1 && getPrevPos(i,j)!=0 && (getPrevPos(i,j)==3||(getPrevPos(i,j)-3)%4==0 ))//If previous is a truck
          {
          pickDrop="Drop";
          forBy=getPrev(i,j);
          at=data[i][j];
          writeData();
          pickDrop="Receive";
          from=getPrev(i,j);
          forBy=data[i][j];
          writeData();
          }
          else if(getPrevPos(i,j)==2||(getPrevPos(i,j)-2)%4==0)//If the prevous element is a temp truck
          {
          pickDrop="Receive";
          from=getPrev(i,j);
          forBy=data[i][j];
          writeData();
          }
          else if(getPrevPos(i,j)!=-1 &&(getPrevPos(i,j)==0||getPrevPos(i,j)==4||(getPrevPos(i,j)-1)%4==0||getPrevPos(i,j)%4==0|| getPrevPos(i,j)==0))// if previous is producer/hub
          {
          forBy=data[i][j];
          from=getPrev(i,j);
          pickDrop="Receive";
          writeData();
          }
          if(data[i][j].equals(data[i][data[i].length-1]))//If this is a final hub
          break;
      }
      else if(j==1 || (j-1)%4==0)//if this is a temporary storage
      {
        if(getPrevPos(i,j)!=-1 && getPrevPos(i,j)!=0 && (getPrevPos(i,j)==3||(getPrevPos(i,j)-3)%4==0 ))// if previous is a truck
        {
         pickDrop="Drop";
            forBy=getPrev(i,j);
            at=data[i][j];
            writeData();
        }
      }
      

  }
  

}


} 

//logSheets();

}
/**
* Extracts data from CSV files on google drive folder
* @param {} 
* @returns {} 
*/
function extractCSV()
{
  
  var activeRow=1;
  var activeColumn=1;
  var fileNameArray=new Array("7P","BC","BW","CV","DA","EB","EM","GF","HD","KO","LG","MM","NF","RH","SL","WW","YR","ZZ");
  SpreadsheetApp.setActiveSheet(ss.getSheets()[0]);
  var sheet = SpreadsheetApp.getActiveSheet();
  sheet.clear();
  sheet.getRange(activeRow, 1, 1, 1).setValue("Date");
  sheet.getRange(activeRow, 2, 1, 1).setValue("Producer");
  sheet.getRange(activeRow, 3, 1, 1).setValue("Hub");
  sheet.getRange(activeRow, 4 ,1,1).setValue("Number of boxes");
                    for(var i=0; i<fileNameArray.length; i++)
                    {
                      try
                      {
                      var file = DriveApp.getFilesByName(fileNameArray[i]+".CSV").next();
                      }
                      catch(err)//If File doesn't exist
                     {
                      // System.err.println("File not found");
                     continue;
                     }
                     var csvData = Utilities.parseCsv(file.getBlob().getDataAsString());
                     
                     activeRow=sheet.getLastRow()+1;
                      csvData.splice(0, 1);
                     sheet.getRange(activeRow, 1, csvData.length, csvData[0].length).setValues(csvData);
                    }
                     
 
}

/**
* Finds boxes for the producer hub combination
* * @param {supplier name, customer name} Strings of the two names 
* @returns {number} number of boxes 
*/
function totalBoxes(sup, cust) 
{
  
 
  var supArr=new Array();// Array for storing the supplier names from Sheet2
  var custArr=new Array();// Array for storing the customer names from Sheet2
  var total=new Array();// Array for storing the total boxes from Sheet2




SpreadsheetApp.setActiveSheet(ss.getSheets()[0]);
//var data2= ss.getDataRange().getValues();
var data2 = SpreadsheetApp.getActiveSheet().getRange(1, 1, 100, 10).getValues();

  /**
  Copying data2 into 3 separate arrays
  */
  for(var copy=0;copy<data2.length;copy++)
  {
    if(data2[copy][1])
    {
    supArr[copy]=data2[copy+1][1];
    custArr[copy]=data2[copy+1][2];
    total[copy]=data2[copy+1][3];
    }
    else
    break;
  }
  var answer;
  var flag=0;
/**
Checking for matches
*/
  
  for(var i=0; i<supArr.length;i++)// Keeps track of suppplier comparisons
  {
    if(sup==supArr[i] && cust==custArr[i])//Checks for match in supplier name
    {
      answer=total[i];
      flag=1;
      break;

    }
    
  }
  if(flag==0)
  return "NA";
  
  
  return answer;
  
}
/**
* Writes the number of Boxes for each produce-hub combination
* @param {} 
* @returns {} 
*/
function writeTotalBoxes()
{
extractCSV();
SpreadsheetApp.setActiveSheet(ss.getSheets()[4]);//Activate the checkin sheet
var sheetData=ss.getSheets()[4].getRange(1, 1, 10000, 1000);
var cell2;
var i=2;
while(1)
{
if(sheetData.getCell(i, 6).getValue())
{
cell2=sheetData.getCell(i, 8);
cell2.setValue(totalBoxes(sheetData.getCell(i, 6).getValue(),sheetData.getCell(i, 7).getValue()));
curBox=i;
i++;// From column
}
else 
break;
}

}
/**
* Stores all the previous check-in and fhm_inputs 
* @param {} 
* @returns {} 
*/
function logSheets()
{
var fhm_ss = SpreadsheetApp.openByUrl("https://docs.google.com/a/iastate.edu/spreadsheets/d/1kEnRrfJtPxuLYCj1QTRsHjkdRZ7fOYoxE3_1lHAsIJw/edit?usp=sharing");//Check.xlsx
SpreadsheetApp.setActiveSheet(fhm_ss.getSheets()[2]);
var fhm_logValues= fhm_ss.getDataRange().getValues();//Values of fhm_input
SpreadsheetApp.setActiveSheet(fhm_ss.getSheets()[4]);
checkin_logValues= fhm_ss.getDataRange().getValues();//Values of CheckIn
fhm_ss.getActiveSheet().clear();
SpreadsheetApp.setActiveSpreadsheet
(SpreadsheetApp.openByUrl("https://docs.google.com/a/iastate.edu/spreadsheets/d/17nXsjfD1wTyGiPj-4SZtWvm5mpC52sbb8VAQmz8vjwI/edit?usp=sharing"));//The backup sheet
var log=SpreadsheetApp.getActiveSpreadsheet();
//logging fhm data
SpreadsheetApp.setActiveSheet(log.getSheets()[0]);
var ts=log.getActiveSheet();
ts.getRange(ts.getLastRow()+1, 1,fhm_logValues.length,fhm_logValues[0].length).setValues(fhm_logValues); //you will need to define the size of the copied data see getRange()
SpreadsheetApp.setActiveSheet(log.getSheets()[1]);
//itterating through checkIn to save changes to backup
var counter=0;



for(var i=1;i<checkin_logValues.length;i++)
{
if(!(checkin_logValues[i][8].equals("Yellow")))
{

lok[counter]=[checkin_logValues[i][0],checkin_logValues[i][1],checkin_logValues[i][2],checkin_logValues[i][3],
checkin_logValues[i][4],checkin_logValues[i][5],checkin_logValues[i][6],
checkin_logValues[i][7],checkin_logValues[i][8],checkin_logValues[i][9],checkin_logValues[i][10],checkin_logValues[i][11],checkin_logValues[i][12],checkin_logValues[i][13],checkin_logValues[i][14],checkin_logValues[i][2]+checkin_logValues[i][3]+checkin_logValues[i][5]+checkin_logValues[i][6]];
lok2d.push(lok);


counter++;
}



}
//logging checkin data
ts=log.getActiveSheet();
ts.getRange(ts.getLastRow()+1, 1,checkin_logValues.length,checkin_logValues[0].length).setValues(checkin_logValues); //you will need to define the size of the copied data see getRange()
SpreadsheetApp.setActiveSheet(log.getSheets()[2]);
ts=log.getActiveSheet();
ts.clear();
try
{
if(lok[0][0])
ts.getRange(ts.getLastRow()+1, 1,lok.length,lok[0].length).setValues(lok);
}
catch(err)
{

} 
//logging fhm data
SpreadsheetApp.setActiveSheet(log.getSheets()[0]);
var ts=log.getActiveSheet();
ts=log.getActiveSheet();
ts.getRange(ts.getLastRow()+1, 1,checkin_logValues.length,checkin_logValues[0].length).setValues(checkin_logValues); //you will need to define the size of the copied data see getRange()
SpreadsheetApp.setActiveSheet(log.getSheets()[2]);
ts=log.getActiveSheet();
ts.clear();
try
{
if(lok[0][0])
ts.getRange(ts.getLastRow()+1, 1,lok.length,lok[0].length).setValues(lok);
}
catch(err)
{

}



}



/**
* Implements binary search and returns the position the element is at. 
* if not found, returns -1
* @param {element to search, array} 
* @returns {number} position if found, -1 if not found 
*/
function binarySearch(searchElement, searchArray) {
    'use strict';
    searchArray.sort();
    var stop = searchArray.length;
    var last, p = 0,
        delta = 0;

    do {
        last = p;

        if (searchArray[p] > searchElement) {
            stop = p + 1;
            p -= delta;
        } else if (searchArray[p] === searchElement) {
            // FOUND A MATCH!
            return p;
        }

        delta = Math.floor((stop - p) / 2);
        p += delta; //if delta = 0, p is not modified and loop exits

    }while (last !== p);

    return -1; //nothing found

}






