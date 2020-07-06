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
    const offset = document.getElementById("variable-start-space").style.gridColumnEnd
    for(let i = 0; i < dates.length; i++) {
        // TODO: if not holiday
        

        // Not a weekday
        dayOfWeek = (parseInt(dates[i].innerHTML) + parseInt(offset) - 1) % 7;
        if(dayOfWeek == 1 | dayOfWeek == 7) continue;

        // we didn't finish the month
        if(i > processedClose.length - 2) break;

        let color = "red";
        if(processedClose[i+1] - processedClose[i] >= 0) {   // if it closed higher than the previous day
            color = "green";
        }
        dates[i].style.backgroundColor = color;
    }

}

function calculateCalendarRange() {
    var date = new Date();
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
            day.style.display = "none";
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

window.onload = function() {
    offsetCalendar();
    document.getElementById('search').addEventListener('click', ()=>{
        fetch();
    });
}