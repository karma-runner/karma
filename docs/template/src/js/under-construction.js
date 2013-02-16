// Tooltips
$(document).ready(function(){

	/* Adding a colortip to any tag with a title attribute: */

	$('[data]').colorTip({color:'yellow'});

});

/*
Count down until any date script-
By JavaScript Kit (www.javascriptkit.com)
Over 200+ free scripts here!
Modified by Robert M. Kuhnhenn, D.O. 
on 5/30/2006 to count down to a specific date AND time,
and on 1/10/2010 to include time zone offset.
*/

/*  Change the items below to create your countdown target date and announcement once the target date and time are reached.  */
var current="Message After Time End!";        //—>enter what you want the script to display when the target date and time are reached, limit to 20 characters
var year=2012;        //—>Enter the count down target date YEAR
var month=12;          //—>Enter the count down target date MONTH
var day=21;           //—>Enter the count down target date DAY
var hour=18;          //—>Enter the count down target date HOUR (24 hour clock)
var minute=38;        //—>Enter the count down target date MINUTE
var tz=-5;            //—>Offset for your timezone in hours from UTC (see http://wwp.greenwichmeantime.com/index.htm to find the timezone offset for your location)

//—>    DO NOT CHANGE THE CODE BELOW!    <—
var montharray=new Array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec");

function countdown(yr,m,d,hr,min){
theyear=yr;themonth=m;theday=d;thehour=hr;theminute=min;
var today=new Date();
var todayy=today.getYear();
if (todayy < 1000) { todayy+=1900; }
var todaym=today.getMonth();
var todayd=today.getDate();
var todayh=today.getHours();
var todaymin=today.getMinutes();
var todaysec=today.getSeconds();
var todaystring1=montharray[todaym]+" "+todayd+", "+todayy+" "+todayh+":"+todaymin+":"+todaysec;
var todaystring=Date.parse(todaystring1)+(tz*1000*60*60);
var futurestring1=(montharray[m-1]+" "+d+", "+yr+" "+hr+":"+min);
var futurestring=Date.parse(futurestring1)-(today.getTimezoneOffset()*(1000*60));
var dd=futurestring-todaystring;
var dday=Math.floor(dd/(60*60*1000*24)*1);
var dhour=Math.floor((dd%(60*60*1000*24))/(60*60*1000)*1);
var dmin=Math.floor(((dd%(60*60*1000*24))%(60*60*1000))/(60*1000)*1);
var dsec=Math.floor((((dd%(60*60*1000*24))%(60*60*1000))%(60*1000))/1000*1);
if(dday<=0&&dhour<=0&&dmin<=0&&dsec<=0){
document.getElementById('count2').innerHTML=current;
document.getElementById('count2').style.display="block";
document.getElementById('dday').style.display="none";
document.getElementById('dhour').style.display="none";
document.getElementById('dmin').style.display="none";
document.getElementById('dsec').style.display="none";
document.getElementById('days').style.display="none";
document.getElementById('hours').style.display="none";
document.getElementById('minutes').style.display="none";
document.getElementById('seconds').style.display="none";
document.getElementById('spacer1').style.display="none";
/*document.getElementById('spacer2').style.display="none";*/
return;
}
else {
document.getElementById('count2').style.display="none";
document.getElementById('dday').innerHTML=dday;
document.getElementById('dhour').innerHTML=dhour;
document.getElementById('dmin').innerHTML=dmin;
document.getElementById('dsec').innerHTML=dsec;
setTimeout("countdown(theyear,themonth,theday,thehour,theminute)",1000);
}
}

countdown(year,month,day,hour,minute);