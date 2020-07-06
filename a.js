let currentDate = new Date();

function getData(symbol, start, end, timeframe="D") {
    var req = new XMLHttpRequest();
    req.onreadystatechange = ()=>{
        if(req.readyState != 4) return
        parsed = JSON.parse(req.response)
        if(parsed["s"] != "ok") return fetch(); // Retry on failure (TODO: set a timeout)
        processData(parsed)
    };
    
    req.open("GET", `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${timeframe}&from=${start}&to=${end}&token=bs160tvrh5r8enj76u7g`)
    req.send();
    return;
}

function processData(data) {
    processedClose = data.c
    let dates = document.querySelectorAll("#variable-start-space ~ div")
    offset = parseInt(document.getElementById("variable-start-space").style.gridColumnEnd)
    for(let i = 0; i < dates.length; i++) {
        // TODO: if not holiday


        // Not a weekday
        dayOfWeek = (parseInt(dates[i].innerHTML) + offset - 1) % 7;
        if(dayOfWeek == 1 | dayOfWeek == 7) continue;

        // we didn't finish the month
        if(i > processedClose.length - 2) break;

        let color = "red";
        if(processedClose[i+1] - processedClose[i] >= 0) {   // if it closed higher than the previous day
            let bubble = document.createElement("div"); 
            color = "green";
        }
        dates[i].style.backgroundColor = color;


    }

    // Go through each of the dates
    startColumn = offset;
    for(let i = 0; i < dates.length; i++) {
        if(i > processedClose.length - 2) break;
        dayOfWeek = (parseInt(dates[i].innerHTML) + parseInt(offset) - 1) % 7;
        if(dayOfWeek == 1 | dayOfWeek == 7) continue;

        
        /*
        if(dates[i].style.backgroundColor != dates[i+1].style.backgroundColor) {
            endColumn = i + 1 + offset;
            console.log(startColumn, endColumn)
            startColumn = i + 2 + offset;
        }*/
    }



}

function calculateCalendarRange(date=new Date()) {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    firstDayOfMonth = new Date(year, month, 1);
    lastDayLastMonth = new Date(new Date(firstDayOfMonth.getTime()).setDate(firstDayOfMonth.getDate() - 1)) // Previous Day
    lastDayOfMonth = new Date(year, month + 1, 0);
    
    return {
        firstDayOfWeek: firstDayOfMonth.getDay() + 1,
        lastDayOfMonth: lastDayOfMonth.getDate(),
        firstDate: firstDayOfMonth,
        lastDate: lastDayOfMonth,
        lastDayLastMonth: lastDayLastMonth
    }
}

function offsetCalendar(date=new Date()) {
    // Display current month and year in calendar
    document.getElementById("month").innerHTML = new Intl.DateTimeFormat('en-US', {month: 'long', year: 'numeric'}).format(date);
    
    const range = calculateCalendarRange(date);
    if(range == null) return

    // Empty space at beginning of calendar
    console.log(range.firstDayOfWeek)
    
    if(range.firstDayOfWeek == 1) {
        document.getElementById("variable-start-space").style.display = "none";
    }
    document.getElementById("variable-start-space").style.gridColumnEnd = range.firstDayOfWeek;
    console.log("fdsfasfsa ", document.getElementById("variable-start-space").style.gridColumnEnd)

    // Correct number of days in month
    for (let day of document.getElementsByClassName("last-days")) {
        if(parseInt(day.innerHTML) > parseInt(range.lastDayOfMonth)) {
            day.style.display = "none";
        } else {
            day.style.display = "block";
        }
    }
}

function unixFromDate(date) {
    return date.getTime() / 1000 | 0;
}

function fetch() {
    const range = calculateCalendarRange();
    tickerSymbol = document.getElementById('symbol').value;
    getData(tickerSymbol, unixFromDate(range.lastDayLastMonth), unixFromDate(range.lastDate));
}

function configureGrid() {
    let grid = document.querySelectorAll("#variable-start-space ~ div")
    let offset = parseInt(document.getElementById("variable-start-space").style.gridColumnEnd) - 2
    grid.forEach(element => {
        let itemNum = parseInt(element.innerHTML) + offset // Day number + offset
        let row = Math.floor(itemNum / 7) + 1   // default value 1
        let column = itemNum % 7 + 1;
        
        element.style.gridColumnStart = column
        element.style.gridRowStart = row
    });
}

function changeMonth(newMonth) {
    console.log(newMonth)
    offsetCalendar(newMonth);
    configureGrid();
    return
}


window.onload = function() {
    offsetCalendar();
    configureGrid();
    document.getElementById('search').addEventListener('click', ()=>{
        fetch();
    });

    document.getElementById('previousMonth').addEventListener('click', ()=>{
        currentDate.setMonth(currentDate.getMonth() - 1);
        changeMonth(currentDate);
    });

    document.getElementById('nextMonth').addEventListener('click', ()=>{
        currentDate.setMonth(currentDate.getMonth() + 1);
        changeMonth(currentDate);
    });
}