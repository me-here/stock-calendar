function login(username, password) {
    return;
}

function getData() {
    return;
}

function calculateCalendarRange() {
    var date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    
    firstDayOfMonth = new Date(year, month, 1);
    lastDayOfMonth = new Date(year, month + 1, 0);
    return {
        firstDay: firstDayOfMonth.getDay() + 1,
        lastDate: lastDayOfMonth.getDate()
    }
}

function offsetCalendar() {
    const range = calculateCalendarRange();
    if(range == null) return

    // Empty space at beginning of calendar
    if(range.firstDay != 0) { // if start date is not Sunday
        document.getElementById("variable-start-space").style.display = "block";
        document.getElementById("variable-start-space").style.gridColumnEnd = range.firstDay;
    } 

    // Correct number of days in month
    for (let day of document.getElementsByClassName("last-days")) {
        if(parseInt(day.innerHTML) > parseInt(range.lastDate)) {
            console.log(parseInt(day.innerHTML), parseInt(range.lastDate))
            day.style.display = "none";
        }
    }
    
}

window.onload = function() {
    offsetCalendar();
}