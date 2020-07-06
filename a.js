function getData(symbol, start, end, timeframe="D") {
    var req = new XMLHttpRequest();
    req.onreadystatechange = ()=>{
        if(req.readyState != 4) return
        console.log(req.response)
    };
    
    req.open("GET", `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${timeframe}&from=${start}&to=${end}&token=bs160tvrh5r8enj76u7g`)
    console.log(start, end);
    req.send();
    return;
}

function calculateCalendarRange() {
    var date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    
    firstDayOfMonth = new Date(year, month, 1);
    lastDayOfMonth = new Date(year, month + 1, 0);
    return {
        firstDayOfWeek: firstDayOfMonth.getDay() + 1,
        lastDayOfMonth: lastDayOfMonth.getDate(),
        firstDate: firstDayOfMonth,
        lastDate: lastDayOfMonth
    }
}

function offsetCalendar() {
    const range = calculateCalendarRange();
    if(range == null) return

    // Empty space at beginning of calendar
    if(range.firstDayOfWeek != 0) { // if start date is not Sunday
        document.getElementById("variable-start-space").style.display = "block";
        document.getElementById("variable-start-space").style.gridColumnEnd = range.firstDayOfWeek;
    } 

    // Correct number of days in month
    for (let day of document.getElementsByClassName("last-days")) {
        if(parseInt(day.innerHTML) > parseInt(range.lastDayOfMonth)) {
            console.log(parseInt(day.innerHTML), parseInt(range.lastDayOfMonth))
            day.style.display = "none";
        }
    }
}

function unixFromDate(date) {
    return date.getTime() / 1000 | 0;
}

window.onload = function() {
    offsetCalendar();
    const range = calculateCalendarRange();
    document.getElementById('search').addEventListener('click', ()=>{
        tickerSymbol = document.getElementById('symbol').value;
        getData(tickerSymbol, unixFromDate(range.firstDate), unixFromDate(range.lastDate));
    });
}