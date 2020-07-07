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
    timestamps = data.t
    let dates = document.querySelectorAll("#variable-start-space ~ div")
    offset = parseInt(document.getElementById("variable-start-space").style.gridColumnEnd)

    priceIndex = 0;

    for (let i = 0; i < dates.length; i++) {
        // TODO: if not holiday
        


        const itemNum = (parseInt(dates[i].innerHTML) + offset - 2)
        const dayOfWeek = itemNum % 7;
        const rowNum = Math.floor(itemNum / 7) + 1;
        // FIXME: OFFSET NOT BEING UPDATED

        if (dayOfWeek == 0 | dayOfWeek == 6) {  // skip weekends
            continue;
        }
        

        // we didn't finish the month
        /*if (i > processedClose.length - 2) {
            
        }*/ //TODO: Implement timestamps

        let color = "red";
        const ptsChange = processedClose[priceIndex + 1] - processedClose[priceIndex];
        console.log(ptsChange, dates[i].innerHTML)
        if(ptsChange == null) continue
        if (ptsChange >= 0) { // if it closed higher than the previous day
            //let bubble = document.createElement("div");
            color = "green";
        }
        dates[i].style.backgroundColor = color;

        priceIndex++;
    }

    let startColumn = offset;
    let netPLInterval = 0;
    for(let i = 0; i < dates.length; i++) {
        const itemNum = (parseInt(dates[i].innerHTML) + offset - 1)
        const dayOfWeek = itemNum % 7;
        const rowNum = Math.floor(itemNum / 7) + 1;
        if (dayOfWeek == 1 | dayOfWeek == 7) continue;
        const ptsChange = processedClose[i + 1] - processedClose[i];

        netPLInterval += ptsChange;
        
        // we didn't finish the month
        if (i > processedClose.length - 2) break;
        if(dates[i].style.backgroundColor != dates[i+1].style.backgroundColor) {
            let color = dates[i].style.backgroundColor;

            /*let bubble = document.createElement('div');
            let arrow = ""
            if(color == "green") {
                bubble.style.backgroundColor = "rgb(88, 196, 128)"
                arrow = "&uarr;"
            } else {
                bubble.style.backgroundColor = "rgb(207, 128, 112)";
                arrow = "&darr;"
            }
            
            netPLInterval = Number.parseFloat(netPLInterval).toPrecision(4);
            bubble.innerHTML = `<div>Price ${arrow} by ${netPLInterval} points.</div>`;

            bubble.className = 'bubble';            
            bubble.style.gridColumnStart = startColumn
            bubble.style.gridColumnEnd = i + 1 + offset;
            bubble.style.gridRow = `${rowNum}`;

            document.getElementById('dates').insertBefore(bubble, document.getElementById('variable-start-space'));*/
        }
    }
}

function calculateCalendarRange(date = currentDate) {
    const year = date.getFullYear();
    const month = date.getMonth();

    firstDayOfMonth = new Date(year, month, 1);
    //console.log(firstDayOfMonth.getMonth(), firstDayOfMonth.getDay());
    lastDayLastMonth = getLastWeekday(firstDayOfMonth);
    lastDayOfMonth = new Date(year, month + 1, 0, 23);

    //console.log(firstDayOfMonth.getDay())
    return {
        firstDayOfWeek: firstDayOfMonth.getDay(),
        lastDayOfMonth: lastDayOfMonth.getDate(),
        firstDate: firstDayOfMonth,
        lastDate: lastDayOfMonth,
        lastDayLastMonth: lastDayLastMonth
    }
}

function getLastWeekday(date) {
    let newDate = new Date(date)
    newDate.setHours(-24);
    while (date.getDay() == 0 && date.getDay() == 6) {  // must be weekday
        newDate.setHours(-24);
    } 
    return newDate;
}

function offsetCalendar(date = currentDate) {
    // Display current month and year in calendar
    document.getElementById("month").innerHTML = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric'
    }).format(date);

    const range = calculateCalendarRange(date);
    if (range == null) return

    // Empty space at beginning of calendar
    if (range.firstDayOfWeek == 0) {
        document.getElementById("variable-start-space").style.display = "none";
    }
    
    document.getElementById("variable-start-space").style.gridColumnEnd = range.firstDayOfWeek + 1;

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

function dateFromUnix(unixDate) {
    return new Date(unixDate * 1000);
}

function fetch(date = new Date()) {
    if(page.currentDate > Date.now()) return;
    if(document.getElementById('symbol').value=="") return;
    const range = calculateCalendarRange(date);
    tickerSymbol = document.getElementById('symbol').value;
    getData(tickerSymbol, unixFromDate(range.lastDayLastMonth), unixFromDate(range.lastDate));
    console.log(lastDayLastMonth, range.lastDate, "DHJAHDKJHSAJKDHJKSAHDJHj")
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
    //fetch();
    return
}

function clearEvents() {
    for(let bubble of document.getElementsByClassName('bubble')) {
        bubble.remove();
    }

    for(let date of document.querySelectorAll("#variable-start-space ~ div")) {
        date.style.backgroundColor = "initial";
    }
}


window.onload = function () {
    displayMonth(page.currentDate);
    document.getElementById('search').addEventListener('click', () => {
        displayMonth(page.currentDate);
        fetch(page.currentDate);
    });

    document.getElementById('previousMonth').addEventListener('click', () => {
        page.currentDate.setMonth(page.currentDate.getMonth() - 1);
        displayMonth(page.currentDate);
        fetch(page.currentDate);
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        page.currentDate.setMonth(page.currentDate.getMonth() + 1);
        displayMonth(page.currentDate);
        fetch(page.currentDate);
    });
}