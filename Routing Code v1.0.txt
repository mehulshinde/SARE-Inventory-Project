var globalS="Stuff";


var ss = SpreadsheetApp.getActiveSpreadsheet();
SpreadsheetApp.setActiveSheet(ss.getSheets()[5]);
var data= ss.getDataRange().getValues();


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
          //.else continue;
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

return 0;
}

function getPrev(i, curPos)
{
for(var r=curPos-1; r>0;r--)
        {
        if(data[i][r])
        {
        return data[i][r];
        }
        }
}

function nextIndex() {

var curR=2;
var prod, hub, pickDrop, fromAt, forBy;
var truckDue=0;
for(var i=1; i<data.length; i++)//for rows
{
  for(var j=0; j<data[0].length; j++)//for columns
  {
 
  hub=data[i][data[0].length-1];
  prod=data[i][0]; 
     
  
    if(j==0)// if this is a producer
    {
      prod=data[i][0];
      hub=data[i][data[0].length-1];// storing prev hub and prod
      
      fromAt=data[i][j];
          
         if(findNext(i,j)==hub)// If the next element is the final destination
         {
         pickDrop="receive";
         forBy=findNext(i,j);
         truckDue=0;
         break;
         }
         else if(findNextPos(i,j)==2||findNextPos(i,j)==3||findNextPos(i,j)%4==0||findNextPos(i,j)%4==0 ) //If next element is (position has) a truck
         {
             pickDrop="pick";
             truckDue=1;
             forBy=findNext(i,j);
             break;
                
         }
         else if(findNextPos(i,j)==1||findNextPos(i,j)==4||(findNextPos(i,j)-1)%4==0||(findNextPos(i,j))%4==0) // if next is a hub/temp storage
         {
           pickDrop="pick";
           forBy=findNext(i,j);
           truckDue=0;
         break;
         }
         
      }
      
        
      else if (j==2||j==3||(j-2)%4==0||(j-3)%4==0) // If this is a truck
      {
        
          if(truckDue==0)
          {
          pickDrop="pick";
          forBy=data[i][j];
          fromAt=getPrev(i,j);
          truckDue=1;
          }
          else if(truckDue==1)
          {
          pickDrop="drop";
          truckDue=0;
          forBy=findNext(i,j);
          fromAt=data[i][j];
          }
       
          break;
      }
      else if(j==1||j==4||(j-1)%4==0||j%4==0) //If this is a hub/temp storage
      {
        
          if(data[i][j]==hub) // if the current hub is the final destination
          {
          pickDrop=="receive";
          fromAt=getPrev(i,j);
          forBy=data[i][j];
          truckDue=0;
          }
          else if(findNextPos(i,j)==2||findNextPos(i,j)==3||(findNextPos(i,j)-2)%4==0||(findNextPos(i,j)-3)%4==0) //If next element is (position has) a truck
          {
          forBy=findNext(i,j);
          fromAt=data[i][j];
          pickDrop="pick";
          truckDue=1;
          }
      
        break;
      }
      

}

//Writting the current row to the desired table


//ss = SpreadsheetApp.getActiveSpreadsheet();
SpreadsheetApp.setActiveSheet(ss.getSheets()[6]);


var activeSheet=SpreadsheetApp.getActiveSheet();
var sheetData=activeSheet.getActiveRange();

var cell;
var sheetData=ss.getSheets()[6].getRange(curR, 1, 20);
cell=sheetData.getCell(curR, 1);
cell.setValue(forBy);

//sheetData=activeSheet.getActiveRange();
//sheetData=ss.getSheets()[6].getRange(0, 0, 20);





sheetData=ss.getSheets()[6].getRange(curR,2,20);  
cell=sheetData.getCell(curR, 1);
cell.setValue(fromAt);

sheetData=ss.getSheets()[6].getRange(curR,3,20);  
cell=sheetData.getCell(curR, 1);
cell.setValue(pickDrop);

sheetData=ss.getSheets()[6].getRange(curR,4,20);  
cell=sheetData.getCell(curR, 1);
cell.setValue(prod);

sheetData=ss.getSheets()[6].getRange(curR,5,20);  
cell=sheetData.getCell(curR, 1);
cell.setValue(hub);

//cell=sheetData.getCell(curR, 3);
//cell.setValue(pickDrop);
//cell=sheetData.getCell(curR, 4);
//cell.setValue(prod);
//cell=sheetData.getCell(curR, 5);
//cell.setValue(hub);
curR++;
fromAt="";
forBy="";
prod="";
hub="";
if(pickDrop=="receive")
{
pickDrop="";
}
//---------------------------------------------
//var activeSheet=SpreadsheetApp.getActiveSheet();
//var sheetData=activeSheet.getDataRange();
//var cell;
//cell=sheetData.getCell(1, 1);
// cell.setValue(ss.getSheets()[2].getName());
} 
//curR=2;
//SpreadsheetApp.setActiveSheet(ss.getSheets()[5]);

}
