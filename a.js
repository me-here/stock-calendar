let page = {
    currentDate: new Date()
}

function getData(symbol, start, end, timeframe = "D") {
    var req = new XMLHttpRequest();
    req.onreadystatechange = () => {
        if (req.readyState != 4) return
        parsed = JSON.parse(req.response)
        if (parsed["s"] != "ok") return fetch(); // Retry on failure (TODO: set a timeout)
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

    let startColumn = offset;
    console.log(processedClose.length)
    for (let i = 0; i < dates.length; i++) {
        // TODO: if not holiday


        // Not a weekday
        const itemNum = (parseInt(dates[i].innerHTML) + offset - 1)
        const dayOfWeek = itemNum % 7;
        const rowNum = Math.floor(itemNum / 7) + 1;
        if (dayOfWeek == 1 | dayOfWeek == 7) continue;

        // we didn't finish the month
        if (i > processedClose.length - 2) break;

        let color = "red";
        const ptsChange = processedClose[i + 1] - processedClose[i];
        console.log(ptsChange)
        if (ptsChange >= 0) { // if it closed higher than the previous day
            //let bubble = document.createElement("div");
            color = "green";
        }
        dates[i].style.backgroundColor = color;

        
    }

    for(let i = 0; i < dates.length; i++) {
        const itemNum = (parseInt(dates[i].innerHTML) + offset - 1)
        const dayOfWeek = itemNum % 7;
        const rowNum = Math.floor(itemNum / 7) + 1;
        if (dayOfWeek == 1 | dayOfWeek == 7) continue;

        // we didn't finish the month
        if (i > processedClose.length - 2) break;
        if(dates[i].style.backgroundColor != dates[i+1].style.backgroundColor) {
            let color = dates[i].style.backgroundColor;

            let bubble = document.createElement('div');
            let arrow = ""
            if(color == "green") {
                bubble.style.backgroundColor = "rgb(88, 196, 128)"
                arrow = "&uarr;"
            } else {
                bubble.style.backgroundColor = "rgb(207, 128, 112)";
                arrow = "&darr;"
            }

            bubble.innerHTML = `<div>Price ${arrow} by 20 points.</div>`;
            bubble.className = 'bubble';            
            bubble.style.gridColumnStart = startColumn
            bubble.style.gridColumnEnd = i + 1 + offset;
            bubble.style.gridRow = `${rowNum}`;

            document.getElementById('dates').insertBefore(bubble, document.getElementById('variable-start-space'));
        }
    }
}

function calculateCalendarRange(date = new Date()) {
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

function offsetCalendar(date = new Date()) {
    // Display current month and year in calendar
    document.getElementById("month").innerHTML = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric'
    }).format(date);

    const range = calculateCalendarRange(date);
    if (range == null) return

    // Empty space at beginning of calendar
    if (range.firstDayOfWeek == 1) {
        document.getElementById("variable-start-space").style.display = "none";
    }
    document.getElementById("variable-start-space").style.gridColumnEnd = range.firstDayOfWeek;

    // Correct number of days in month
    for (let day of document.getElementsByClassName("last-days")) {
        if (parseInt(day.innerHTML) > parseInt(range.lastDayOfMonth)) {
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
        let row = Math.floor(itemNum / 7) + 1 // default value 1
        let column = itemNum % 7 + 1;

        element.style.gridColumnStart = column
        element.style.gridRowStart = row
    });
}

function displayMonth(newMonth) {
    clearEvents();
    offsetCalendar(newMonth);
    configureGrid();
    return
}

function clearEvents() {
    for(let bubble of document.getElementsByClassName('bubble')) {
        bubble.remove();
    }
}


window.onload = function () {
    displayMonth(page.currentDate);
    document.getElementById('search').addEventListener('click', () => {
        displayMonth(page.currentDate);
        fetch();
    });

    document.getElementById('previousMonth').addEventListener('click', () => {
        page.currentDate.setMonth(page.currentDate.getMonth() - 1);
        displayMonth(page.currentDate);
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        page.currentDate.setMonth(page.currentDate.getMonth() + 1);
        displayMonth(page.currentDate);
    });
}