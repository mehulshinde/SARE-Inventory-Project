/**
* SARE project App data handling code
* @author Mehul Shinde
* List of executable methods-
* Execute checkInHandler : for checkIn master routing logic
* Execure writeTotalBoxes : for updating number of boxes in CheckIn sheet
* Execute extractCSV: to update box_data using CSV files on google drive
* Execute logSheets: to log the current fhm_input and checkIn data
* Execute statusCheck: to check and store any status chenge in any of the entries 
*/
var ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1svBNo3pPurUPaASgPlSfpV7iMWPvfU4HWNUpGblo_WA/edit?usp=sharing");//Stores the checkIn spreadsheet
var bss= SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1svMKc7p-T54V1v41gVeH8RAyzW_Z2rvgUQfk02l2c3Y/edit?usp=sharing");// Store backup sheet
SpreadsheetApp.setActiveSheet(ss.getSheets()[3]);// get master_routing sheet
var data= ss.getDataRange().getValues();// store master routing data in data
var backup=new Array([]);
var backup_sheet; //array for backed up data for status change
var checkin_logValues=new Array([]);
var curR=2;
var curBox=2;
var prod, hub, pickDrop, from, at, forBy, concatKey, address;
var status="Yellow";
var boxes="NA";
var newEntry="FALSE";
var exceptNotice=" ";
var checkedIn="No";
var comments=" ";
var image=" ";
var checkInTime=" ";
var actualTime=" ";
var checkInLoc=" ";
var prodEmail=" ";
var finalDestinationFlag=" ";
var cell;
var fhm_producer_arr;//for storing producers separated by commas
var lok=new Array();
var lok2d= new Array();
var fileNameArray=new Array("7P","BC","BW","CV","DA","EB","EM","GF","HD","KO","LG","MM","NF","RH","SL","WW","YR","ZZ");//list of producer files
var lastRunDay, lastRunHour, lastRunMin;// stores when the function last ran
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
* Modifies global variable array(fhm_producer_arr) of producer names from the string
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

  SpreadsheetApp.setActiveSheet(ss.getSheets()[2]);// Activate the fhm_input sheet
  var fhmData=ss.getDataRange().getValues();
  var flagHub=0;
  var flagProd=0;
  var row=1;

   try{
 if(!(fhmData[1][1].valueOf()))
 return -1;
 }
 catch(err)
 {
 Logger.log("fhm_input empty");
 return -1;
 }
  
 // Finding if the hub is in the list
  try
  {
  for(var i=1; i<fhmData.length; i++)
  {
    if(fhmData[i][1]==hub)
    {
      flagHub=1;
      row=i;
      Logger.log("found the hub");
      break;
    }
    
    //Checking if the producer is in the list
    
   
    
   }
   
  
    wordArray(fhmData[row][2]);
     
    
    for(var x=0; x< fhm_producer_arr.length; x++)
    {
      if(prod==fhm_producer_arr[x])
      {
      flagProd=1;
      break;
      }
    }
    }
    catch (err)
    {
    Logger.log("error thrown in fhm_inputTally, returning -1");
    return -1;
    }
     
   
   Logger.log("returning fhm_imputTally value as %s & %s",flagHub,flagProd);
  return (flagHub && flagProd);

}
/**
* Gets the address of elements in 'At' column
* @param {choice is 'a' when looking for address and 'e' whe looking for email} 
* @returns {String} address
*/
function getAddress(choice)
{
SpreadsheetApp.setActiveSpreadsheet(ss);
SpreadsheetApp.setActiveSheet(ss.getSheets()[1]);
var addressArr= SpreadsheetApp.getActiveSpreadsheet().getDataRange().getValues();
for(var i=1; i<addressArr.length; i++)
{
if(at && at.equals(addressArr[i][0]) && choice== 'a')//if looking fo raddress and at column is not empty and at matches the address we're looking for
return addressArr[i][2];
if(prod && prod.equals(addressArr[i][0]) && choice== 'e')//if looking for email
return addressArr[i][3];


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
Logger.log("if fhm tally %s",fhm_inputTally());
//if(fhm_inputTally()==1)// Checks if the producer hub combination exists in fhm_input sheet<*****************UNCOMMENT THIS****************************-
//{
//if(!backup[1][1])

address=getAddress('a');
concatKey=pickDrop+forBy+prod+hub;
prodEmail=getAddress('e');

SpreadsheetApp.setActiveSpreadsheet(bss);//The backup sheet

status ="Yellow";
boxes="NA";
checkedIn="No";
exceptNotice=" ";
newEntry="FALSE";
var log=bss;//SpreadsheetApp.getActiveSpreadsheet();
SpreadsheetApp.setActiveSheet(bss.getSheets()[2]);
backup_sheet= bss.getDataRange().getValues();
var flagBackup_sheet=0;
if(backup_sheet[0][19])//if backup has values
{
//stores the last column of backup array in a 1d array
            Logger.log("Inside the backup_sheet if block");
for(var x1=0; x1<backup_sheet.length; x1++)
{
            Logger.log("comparing %s and %s",backup_sheet[x1][18], concatKey);
if(backup_sheet[x1][19].equals(concatKey))
{
            Logger.log("backup sheet value matched with the concatkey %s",backup_sheet[x1][18]);
from=backup_sheet[x1][0];
address=backup_sheet[x1][1];
pickDrom=backup_sheet[x1][2];
exceptNotice=backup_sheet[x1][3];
forBy=backup_sheet[x1][4];
at=backup_sheet[x1][5];
prod=backup_sheet[x1][6];
hub=backup_sheet[x1][7];
boxes=backup_sheet[x1][8];
status=backup_sheet[x1][9];
newEntry=backup_sheet[x1][10];
checkedIn=backup_sheet[x1][11];
comments=backup_sheet[x1][12];
image=backup_sheet[x1][13];
checkInTime=backup_sheet[x1][14];
actualTime=backup_sheet[x1][15];
checkInLoc=backup_sheet[x1][16];
prodEmail=backup_sheet[x1][17];
finalDestinationFlag=backup_sheet[x1][18];
flagBackup_sheet=1;
bss.getSheets()[2].deleteRow(x1+1);
backup_sheet[x1]=new Array();//"\0","\0","\0","\0","\0","\0","\0","\0","\0","\0","\0","\0","\0","\0","\0","\0","\0","\0","\0","\0"
writeData2();
return;
//break;
}
}





}


writeData2();
//}


}
/**
* Writes the data on Check in sheet, fills in values in the checkIn sheet
* @param {} 
* @returns {} 
*/
function writeData2()
{
SpreadsheetApp.setActiveSpreadsheet(ss);
SpreadsheetApp.setActiveSheet(ss.getSheets()[4]);//Activate the checkin sheet
//var activeSheet=SpreadsheetApp.getActiveSheet();
var sheetData=ss.getSheets()[4].getRange(1, 1, 1000, 1000);
if(pickDrop.equals("Receive"))
{
address=" ";
cell=sheetData.getCell(curR, 1);
if(from.toString().indexOf("Arrival")>-1)
cell.setValue(from);
else
cell.setValue(from+" Arrival");// From column
cell=sheetData.getCell(curR, 6);
cell.setValue(" ");
}

else
{
cell=sheetData.getCell(curR, 1);
cell.setValue(" ");
cell=sheetData.getCell(curR, 6);
if(at.toString().indexOf("Facility")>-1)
cell.setValue(at);
else
cell.setValue(at+" Facility");// At column
}
cell=sheetData.getCell(curR, 4);
cell.setValue(exceptNotice);
cell=sheetData.getCell(curR, 2);
cell.setValue(address);
cell=sheetData.getCell(curR, 3);
cell.setValue(pickDrop);
cell=sheetData.getCell(curR, 5);
cell.setValue(forBy);
cell=sheetData.getCell(curR, 7);
cell.setValue(prod);
cell=sheetData.getCell(curR, 8);
cell.setValue(hub);
cell=sheetData.getCell(curR, 9);
cell.setValue(boxes);
cell=sheetData.getCell(curR, 10);
cell.setValue(status);
cell=sheetData.getCell(curR, 11);
cell.setValue(newEntry);
cell=sheetData.getCell(curR, 12);
cell.setValue(checkedIn);
cell=sheetData.getCell(curR, 13);
cell.setValue(comments);
comments=" ";
cell=sheetData.getCell(curR, 14);
cell.setValue(image);
cell=sheetData.getCell(curR, 15);
cell.setValue(checkInTime);
cell=sheetData.getCell(curR, 16);
cell.setValue(actualTime);
cell=sheetData.getCell(curR, 17);
cell.setValue(checkInLoc);
cell=sheetData.getCell(curR, 18);
cell.setValue(prodEmail);
cell=sheetData.getCell(curR, 19);
cell.setValue(finalDestinationFlag);
cell=sheetData.getCell(curR, 20);
cell.setValue(concatKey);
curR++;
}
/**
* Writes the ramaining data from status check backup sheet if there's any
*
*/
function writeRemainingBackupData()
{
Logger.log("Backup_sheet %s",backup_sheet);
try
{
if(!backup_sheet[0][0])
{
backup_sheet=new Array([]);
Logger.log("Back up Empty");
return;
}
}
catch(e)
{
backup_sheet=new Array([]);
return;
}
for(var x1=0; x1<backup_sheet.length; x1++)
{
if(backup_sheet[x1])
{
from=backup_sheet[x1][0];
address=backup_sheet[x1][1];
pickDrom=backup_sheet[x1][2];
exceptNotice=backup_sheet[x1][3];
forBy=backup_sheet[x1][4];
at=backup_sheet[x1][5];
prod=backup_sheet[x1][6];
hub=backup_sheet[x1][7];
boxes=backup_sheet[x1][8];
status=backup_sheet[x1][9];
newEntry=backup_sheet[x1][10];
checkedIn=backup_sheet[x1][11];
comments=backup_sheet[x1][12];
image=backup_sheet[x1][13];
checkInTime=backup_sheet[x1][14];
actualTime=backup_sheet[x1][15];
checkInLoc=backup_sheet[x1][16];
prodEmail=backup_sheet[x1][17];
finalDestinationFlag=backup_sheet[x1][18];
writeData2();
}
}
backup_sheet=new Array([]);
SpreadsheetApp.setActiveSpreadsheet(bss);
SpreadsheetApp.setActiveSheet(bss.getSheets()[2]);
bss.getSheets()[2].clear();

}

/**
* Checks changes in status of entries and stores them in backup spread sheets if the status has changed
*
*/
function statusCheck()
{
var ts;
var fhm_ss = ss;

SpreadsheetApp.setActiveSheet(fhm_ss.getSheets()[4]);
checkin_logValues= fhm_ss.getDataRange().getValues();//Values of CheckIn

var counter=0;

for(var i=1;i<checkin_logValues.length;i++)
{
if(!(checkin_logValues[i][9].equals("Yellow")))
{

lok[counter]=[checkin_logValues[i][0],checkin_logValues[i][1],checkin_logValues[i][2],checkin_logValues[i][3],
checkin_logValues[i][4],checkin_logValues[i][5],checkin_logValues[i][6],
checkin_logValues[i][7],checkin_logValues[i][8],checkin_logValues[i][9],checkin_logValues[i][10],checkin_logValues[i][11],checkin_logValues[i][12],checkin_logValues[i][13],checkin_logValues[i][14],checkin_logValues[i][15],checkin_logValues[i][16],checkin_logValues[i][17],checkin_logValues[i][18],checkin_logValues[i][2]+checkin_logValues[i][4]+checkin_logValues[i][6]+checkin_logValues[i][7]];
lok2d.push(lok);
//Logger.log("concat key %s",checkin_logValues[i][2]+checkin_logValues[i][4]+checkin_logValues[i][6]+checkin_logValues[i][7]);
//checkin_logValues[i]=[];      FTD Truck-1WW HomesteadFTD and Receive IFH WWHomestead IFH
//Logger.log(checkin_logValues);

counter++;
}
}
SpreadsheetApp.setActiveSpreadsheet(bss);//The backup sheet
var log=SpreadsheetApp.getActiveSpreadsheet();
ts=log.getActiveSheet();
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
//empty catch block
} 
}
/**
*
Writes column headers for checkin sheet
*/
function writeCheckInHeaders()
{
SpreadsheetApp.setActiveSpreadsheet(ss);
SpreadsheetApp.setActiveSheet(ss.getSheets()[4]);//Activate the checkin sheet
var sheetData=ss.getSheets()[4].getRange(1, 1, 1000, 1000);


cell=sheetData.getCell(1, 1);
cell.setValue("From");
cell=sheetData.getCell(1, 2);
cell.setValue("Address");
cell=sheetData.getCell(1, 3);
cell.setValue("Task");
cell=sheetData.getCell(1, 4);
cell.setValue("Exception Notice");
cell=sheetData.getCell(1, 5);
cell.setValue("By");
cell=sheetData.getCell(1, 6);
cell.setValue("At");
cell=sheetData.getCell(1, 7);
cell.setValue("Producer");
cell=sheetData.getCell(1, 8);
cell.setValue("Final Hub");
cell=sheetData.getCell(1, 9);
cell.setValue("Boxes");
cell=sheetData.getCell(1, 10);
cell.setValue("Status");
cell=sheetData.getCell(1, 11);
cell.setValue("New Entry");
cell=sheetData.getCell(1, 12);
cell.setValue("Checked In");
cell=sheetData.getCell(1, 13);
cell.setValue("Comments");
cell=sheetData.getCell(1, 14);
cell.setValue("Image");
cell=sheetData.getCell(1, 15);
cell.setValue("Check-in Time");
cell=sheetData.getCell(1, 16);
cell.setValue("Actual Time");
cell=sheetData.getCell(1, 17);
cell.setValue("Check-in Location");
cell=sheetData.getCell(1, 18);
cell.setValue("Email Producers");
cell=sheetData.getCell(1, 19);
cell.setValue("Final destination");
cell=sheetData.getCell(1, 20);
cell.setValue("Concat Key");



SpreadsheetApp.setActiveSheet(ss.getSheets()[0]);
var sheet = SpreadsheetApp.getActiveSheet();



sheet.getRange(1, 1, 1, 1).setValue("Date");
sheet.getRange(1, 2, 1, 1).setValue("Producer");
sheet.getRange(1, 3, 1, 1).setValue("Hub");
sheet.getRange(1, 4 ,1,1).setValue("Number of boxes");

SpreadsheetApp.setActiveSheet(ss.getSheets()[2]);
sheet=SpreadsheetApp.getActiveSheet();
sheet.getRange(1, 1, 1, 1).setValue("Last Modified");
sheet.getRange(1, 2, 1, 1).setValue("Food Hub");
sheet.getRange(1, 3, 1, 1).setValue("Check the producers");
}
/**
* collects check in data based on the Master routing
* @param {} 
* @returns {} 
*/
function checkInHandler() {

writeCheckInHeaders();

for(var i=1; i<data.length; i++)//for rows
{
  
   hub=data[i][data[0].length-1];
  prod=data[i][0];
  if(fhm_inputTally()==-1)
     continue;
  if(fhm_inputTally()==1)
  {
  for(var j=1; j<data[0].length; j=getNextPos(i,j))//for columns
  {
 
 
     
  if(data[i][j] )
  {
  
      
        
       if (j==3||(j-3)%4==0) // If this is a truck
      {
          pickDrop="Pick";
          forBy=data[i][j];
          at=getPrev(i,j);
          writeData();
          Logger.log("found a truck %s",concatKey);
        
      }
      else if(j==4||j%4==0||j==data[i].length-1) //If this is a hub/temp storage
      {
        
         if(getPrevPos(i,j)!=-1 && getPrevPos(i,j)!=0 && (getPrevPos(i,j)==3||(getPrevPos(i,j)-3)%4==0 ))//If previous is a truck
          {
          pickDrop="Drop";
          forBy=getPrev(i,j);
          at=data[i][j];
          writeData();
          Logger.log("found a truck(drop) %s",concatKey);
          pickDrop="Receive";
          from=getPrev(i,j);
          forBy=data[i][j];
            if(data[i][j].equals(data[i][data[i].length-1]))//If this is a final hub
            {
            finalDestinationFlag="Yes";
            writeData();
            Logger.log("found a final hub %s",concatKey);
            finalDestinationFlag=" ";
            break;
            }
            else{
            writeData();
            Logger.log("found a hub %s",concatKey);
            }
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
          if(data[i][j].equals(data[i][data[i].length-1]))//If this is a final hub
            {
            finalDestinationFlag="Yes";
            writeData();
            Logger.log("found a final hub %s",concatKey);
            finalDestinationFlag=" ";
            break;
            }
            else{
            writeData();
            Logger.log("found a hub %s",concatKey);
            }
          
          
          }
        if(data[i][j].equals(data[i][data[i].length-1])&& !(getPrevPos(i,j)!=-1 && getPrevPos(i,j)!=0 && (getPrevPos(i,j)==3||(getPrevPos(i,j)-3)%4==0 )))//If this is a final hub & previous isn't a truck
        {
        finalDestinationFlag="Yes";
        writeData();
        Logger.log("found a final hub, prevoius wasn't a truck %s",concatKey);
        finalDestinationFlag=" ";
        break;
        }
          
                    
      }
      else if(j==1 || (j-1)%4==0)//if this is a temporary storage
      {
        if(getPrevPos(i,j)!=-1 && getPrevPos(i,j)!=0 && (getPrevPos(i,j)==3||(getPrevPos(i,j)-3)%4==0 ))// if previous is a truck
        {
         pickDrop="Drop";
            forBy=getPrev(i,j);
            at=data[i][j];
            writeData();
            Logger.log("found a temporary storage %s",concatKey);
        }
      }
      

  }
  

}

}

} 

writeRemainingBackupData();
//writeExceptionNotice();
}
/**
* Extracts data from CSV files on google drive folder to box_data
* @param {} 
* @returns {} 
*/
function extractCSV()
{
  
  var activeRow=1;
  var activeColumn=1;
  
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
* Finds corresponding values to a given producer hub combination
* @param {the supplier name, customer name, and 2D array of the table (box_data or en data), whether the function is being called for boxes or for exception notice(1 for box, 0 for e.n.)} 
* @returns {}
*/
function findProdHub(sup, cust, data2, choice)
{
var supArr=new Array();// Array for storing the supplier names from Sheet2
var custArr=new Array();// Array for storing the customer names from Sheet2
var correspond=new Array();// Array for storing the corresponding(total number of boxes/exception notice) value for prod hub combination
var preCorrespond=new Array();// Array to store the corresponding date/generated by value

  /**
  Copying data2 into 3 separate arrays
  */
  for(var copy=0;copy<data2.length;copy++)
  {
    if(data2[copy][1])
    {
    preCorrespond[copy]=data2[copy+1][0];
    supArr[copy]=data2[copy+1][1];
    custArr[copy]=data2[copy+1][2];
    correspond[copy]=data2[copy+1][3];
    }
    else
    break;
  }
  var answer;
  var answer0;
  var flag=0;
/**
Checking for matches
*/
  
  for(var i=0; i<supArr.length;i++)// Keeps track of suppplier comparisons
  {
    if(sup==supArr[i] && cust==custArr[i])//Checks for match in supplier name
    {
      answer=correspond[i];
      answer0=preCorrespond[i];
      flag=1;
      break;

    }
    
  }
  
  
  if(choice==1)//if boxes is the choice
  {
  if(flag==0)
    return "NA";
  
  return answer;
  }
  else if(choice==0)//returns <exception notice>"-"<generated by>
  {
  if (flag==0)
    return ' ';
  
  return answer+"-"+answer0;
  }


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
var box_dataArray=ss.getSheets()[0].getRange(1,1,10000, 10000).getValues();//stores box_data sheet in a 2d array
var cell2;
var i=2;
while(1)
{
if(sheetData.getCell(i, 7).getValue())
{
cell2=sheetData.getCell(i, 9);
cell2.setValue(findProdHub(sheetData.getCell(i, 7).getValue(),sheetData.getCell(i, 8).getValue(), box_dataArray, 1));
curBox=i;
i++;// From column
}
else 
break;
}

}

/**
*
*/
function writeExceptionNotice()
{
SpreadsheetApp.setActiveSheet(ss.getSheets()[4]);//Activate the checkin sheet
Logger.log("ss activated!");
var sheetData=ss.getSheets()[4].getRange(1, 1, 10000, 1000);
//SpreadsheetApp.setActiveSheet(ss.getSheets()[4]);//Activate the checkin sheet
var en_dataArray=ss.getSheets()[5].getRange(1,1,10000,10000).getValues();//stores exception notice sheet in an array
Logger.log("got the data!");
var cell2;
var i=2;
while(1)
{
if(sheetData.getCell(i, 7).getValue())
{
cell2=sheetData.getCell(i, 4);
Logger.log("Checking for cell %s",i);
cell2.setValue(findProdHub(sheetData.getCell(i, 7).getValue(),sheetData.getCell(i, 8).getValue(), en_dataArray, 0));
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
//Deteting the CSV files---------------------------------------------------------------------
var docs= DriveApp.getFoldersByName("Producer Data").next();
  
for(var i=0; i<fileNameArray.length; i++)
                    {
                      try
                      {
                      var thisFile=docs.getFilesByName(fileNameArray[i]+".CSV").next();
                      //var file = DriveApp.getFilesByName(fileNameArray[i]+".CSV").next();
                      deleteDocByName(thisFile.getName());
                      
                      }
                      catch(err)//If File doesn't exist
                     {
                      // System.err.println("File not found");
                     continue;
                     }
                     
                    }


//---------------------------------------------------------------------------------------------
var fhm_ss = ss;
SpreadsheetApp.setActiveSheet(fhm_ss.getSheets()[2]);
var fhm_logValues= fhm_ss.getDataRange().getValues();//Values of fhm_input
SpreadsheetApp.setActiveSheet(fhm_ss.getSheets()[4]);
checkin_logValues= fhm_ss.getDataRange().getValues();//Values of CheckIn
fhm_ss.getActiveSheet().clear();
fhm_ss.getSheets()[2].clear();
SpreadsheetApp.setActiveSpreadsheet
(SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1svMKc7p-T54V1v41gVeH8RAyzW_Z2rvgUQfk02l2c3Y/edit?usp=sharing"));//The backup sheet
var log=bss;
//logging fhm data
SpreadsheetApp.setActiveSheet(log.getSheets()[0]);
var ts=log.getActiveSheet();
ts.getRange(ts.getLastRow()+1, 1,fhm_logValues.length,fhm_logValues[0].length).setValues(fhm_logValues); //you will need to define the size of the copied data see getRange()
SpreadsheetApp.setActiveSheet(log.getSheets()[1]);
//ts.clear();
//itterating through checkIn to save changes to backup
var counter=0;

//logging checkin data
ts=log.getActiveSheet();
ts.getRange(ts.getLastRow()+1, 1,checkin_logValues.length,checkin_logValues[0].length).setValues(checkin_logValues); //you will need to define the size of the copied data see getRange()
SpreadsheetApp.setActiveSheet(log.getSheets()[2]);
ts=log.getActiveSheet();
//ts.clear();
writeCheckInHeaders();

try
{
if(lok[0][0])
ts.getRange(ts.getLastRow()+1, 1,lok.length,lok[0].length).setValues(lok);
}
catch(err)
{

} 




}

function deleteDocByName(fileName){
  
var files = DriveApp.getFilesByName(fileName);
 while (files.hasNext()) {
 
   files.next().setTrashed(true);
   }
  
 }



/**
* Checks whethers or not to run a function
*
*/
function timerFunction() {
  var d = new Date();
  var timeStamp = d.getTime();  // Number of ms since Jan 1, 1970

  var currentTime = d.toLocaleTimeString(); // "12:35 PM", for instance
  Logger.log("cheching timer function %s", currentTime);
}