/**
* SARE project App data handling code
* @author Mehul Shinde
*/
var ss = SpreadsheetApp.getActiveSpreadsheet();
SpreadsheetApp.setActiveSheet(ss.getSheets()[3]);
var data= ss.getDataRange().getValues();



var curR=2;
var curBox=2;
var prod, hub, pickDrop, from, at, forBy;
var truckDue=0;
var cell;
var arr;//for storing producers separated by commas
/**
Finds next element
*/
function findNext(i,curPos)
{
for(var k=curPos+1; k<data[0].length; k++)
        {
          if(data[i][k])
          {
          return data[i][k];
          
          }
          
        }

return 0;

}
function findNextPos(i, curPos)
{
for(var k=curPos+1; k<data[0].length; k++)
        {
          if(data[i][k])
          {
          return k;
          
          }
          
        }

return 100;
}

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
Returns array of words from the producer column
*/
function wordArray(str)
{
arr=new Array();
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
      arr[count]=str.substring(wordStart+1,wordEnd);
      else
      arr[count]=str.substring(wordStart+1,wordEnd+1);
      arr[count].trim();
      wordStart=wordEnd+2;
      count++;
      }

      
      
    }
    

}

/**
Checks if the producer hub combination is in the fhm_input sheet
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
  //var arr=new Array();
 // arr=wordArray(fhmData[1][2]);
   
 
  
 // Finding if the hub is in the list
  
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
     
    
    for(var x=0; x< arr.length; x++)
    {
      if(prod==arr[x])
      {
      flagProd=1;
      break;
      }
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
* Gets the address og elements in 'At' column
*/
function getAddress()
{
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
* Writes the data on Check in sheet
*/
function writeData()
{
if(fhm_inputTally())// Checks if the producer hub combination exists in fhm_input sheet<*****************UNCOMMENT THIS****************************-
{
SpreadsheetApp.setActiveSheet(ss.getSheets()[4]);//Activate the checkin sheet


//var activeSheet=SpreadsheetApp.getActiveSheet();
var sheetData=ss.getSheets()[4].getRange(1, 1, 1000, 1000);

if(pickDrop.equals("Receive"))
{

cell=sheetData.getCell(curR, 1);
cell.setValue(from+" Arrival");// From column
cell=sheetData.getCell(curR, 2);
cell.setValue(" ");
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
cell.setValue(getAddress());
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
cell.setValue(totalBoxes(prod,hub));
cell=sheetData.getCell(curR, 9);
cell.setValue("Yellow");
cell=sheetData.getCell(curR, 10);
cell.setValue("FALSE");
cell=sheetData.getCell(curR, 11);
cell.setValue("No");




curR++;
}


}


function main() {

//extractCSV();
for(var i=1; i<data.length; i++)//for rows
{

  for(var j=1; j<data[0].length; j=findNextPos(i,j))//for columns
  {
 
  hub=data[i][data[0].length-1];
  prod=data[i][0]; 
     
  if(data[i][j])
  {
  //  if(j==0)// if this is a producer
   // continue;
//    {
//     
//      
//      fromAt=data[i][j];
//          
//         if(findNext(i,j)==hub)// If the next element is the final destination
//         {
//         pickDrop="Receive";
//         fromAt=data[i][j];
//         forBy=findNext(i,j);
//         truckDue=0;
//         writeData();
//         break;
//       
//         }
//         else if(findNextPos(i,j)==2||findNextPos(i,j)==3||findNextPos(i,j)%4==0||findNextPos(i,j)%4==0 ) //If next element is (position has) a truck
//         {
//             pickDrop="Pick";
//             truckDue=1;
//             forBy=findNext(i,j);
//            
//                
//         }
//         else if(findNextPos(i,j)==1||findNextPos(i,j)==4||(findNextPos(i,j)-1)%4==0||(findNextPos(i,j))%4==0) // if next is a hub/temp storage
//         {
//           pickDrop="Receive";// Change this
//           fromAt=findNext(i,j);
//           forBy=data[i][j];
//           truckDue=0;
//         
//         }
//        
//         writeData();
//        // break;
//         
//      }
      
        
       if (/**j==2||*/j==3||/**(j-2)%4==0||*/(j-3)%4==0) // If this is a truck
      {
        
       //   if(truckDue==0)
          //{
          pickDrop="Pick";
          forBy=data[i][j];
          at=getPrev(i,j);
          truckDue=1;
          writeData();
//          pickDrop="Drop";
//          truckDue=0;
//          forBy=findNext(i,j);
//          fromAt=data[i][j];
//          if(findNext(i,j)==hub)
//            {
//            fromAt=data[i][j];
//            forBy=hub;
//            pickDrop="Receive";
//            truckDue=0;
//            writeData();
//            break;
//            }
          //}
//          else
//          {
//          pickDrop="Drop";
//          truckDue=0;
//          forBy=data[i][j];
//          at=findNext(i,j);
//          writeData();
          
//            if(findNext(i,j)==hub)
//            {
//            fromAt=data[i][j];
//            forBy=hub;
//            pickDrop="Receive";
//            truckDue=0;
//            writeData();
//            break;
//            }
//          }
       
         
        
      }
      else if(/**j==1||*/j==4||/**(j-1)%4==0||*/j%4==0||j==data[i].length-1) //If this is a hub/temp storage
      {
        
          //if(data[i][j].equals(data[i][data[i].length-1])) // if the current hub is the final destination
         // {
          if(getPrevPos(i,j)!=-1 && getPrevPos(i,j)!=0 && (/**getPrevPos(i,j)==2||*/getPrevPos(i,j)==3||/**(getPrevPos(i,j)-2)%4==0||*/(getPrevPos(i,j)-3)%4==0 ))//If previous is a truck
          {
          pickDrop="Drop";
          forBy=getPrev(i,j);
          at=data[i][j];
          writeData();
          pickDrop="Receive";
          from=getPrev(i,j);
          forBy=data[i][j];
          truckDue=0;
          writeData();
          }
          else if(getPrevPos(i,j)==2||(getPrevPos(i,j)-2)%4==0)//If the prevous element is a temp truck
          {
          pickDrop="Receive";
          from=getPrev(i,j);
          forBy=data[i][j];
          truckDue=0;
          writeData();
          }
          
        
          
//         else if(getPrevPos(i,j)!=-1 && getPrevPos(i,j)!=0 && /**(getPrevPos(i,j)==2||*/getPrevPos(i,j)==3||/**(getPrevPos(i,j)-2)%4==0||*/(getPrevPos(i,j)-3)%4==0 ))// If prev is a turck (For a food hub receiving )
//          {
//          pickDrop="Drop";
//          forBy=getPrev(i,j);
//          at=data[i][j];
//          writeData();
//          forBy=data[i][j];
//          from=getPrev(i,j);
//          pickDrop="Receive";
//          truckDue=0;
//          writeData();
//          }
          else if(getPrevPos(i,j)!=-1 &&(getPrevPos(i,j)==0||getPrevPos(i,j)==4||(getPrevPos(i,j)-1)%4==0||getPrevPos(i,j)%4==0|| getPrevPos(i,j)==0))// if previous is producer/hub
          {
          forBy=data[i][j];
          from=getPrev(i,j);
          pickDrop="Receive";
          truckDue=0;
          writeData();
          
          }
          if(data[i][j].equals(data[i][data[i].length-1]))//If this is a final hub
          break;
//          else if(findNextPos(i,j)==2||findNextPos(i,j)==3||(findNextPos(i,j)-2)%4==0||(findNextPos(i,j)-3)%4==0) //If next element is (position has) a truck
//          {
//          forBy=findNext(i,j);
//          fromAt=data[i][j];
//          pickDrop="Pick";
//          truckDue=1;
//          writeData();
//          }
      
       
       
      }
      else if(j==1 || (j-1)%4==0)//if this is a temporary storage
      {
      if(getPrevPos(i,j)!=-1 && getPrevPos(i,j)!=0 && (/**getPrevPos(i,j)==2||*/getPrevPos(i,j)==3||/**(getPrevPos(i,j)-2)%4==0||*/(getPrevPos(i,j)-3)%4==0 ))
      {
       pickDrop="Drop";
          forBy=getPrev(i,j);
          at=data[i][j];
          truckDue=0;
          writeData();
      }
      
      }
      

  }
  

}


} 



}
/**
*Extracts data from CSV files on google drive folder
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
*/
function totalBoxes(sup, cust) 
{
  
 // var sup=data1[0][0].toString();// stores the inpu supplier name
 // var cust=data1[0][1].toString();// stores input customer name
  var supArr=new Array();// Array for storing the supplier names from Sheet2
  var custArr=new Array();// Array for storing the customer names from Sheet2
  var total=new Array();// Array for storing the total boxes from Sheet2

/**
Copying data from box_data to data2
*/
//var ss2 = SpreadsheetApp.getActiveSpreadsheet();
//SpreadsheetApp.setActiveSheet(ss2.getSheets()[0]);
//var data2= ss2.getDataRange().getValues();


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
*
*/
function writeTotalBoxes()
{
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




