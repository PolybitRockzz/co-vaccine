var vaccine = "";

setstates();
setDate();

async function setDate() {
    var date = new Date();
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();

    if (month < 10) month = "0" + month;
    if (day < 10) day = "0" + day;
    var today = year + "-" + month + "-" + day;

    document.getElementById("date-selection").value = today;
}

async function setstates() {

    const reponse = await fetch('https://cdn-api.co-vin.in/api/v2/admin/location/states');

    var data = await reponse.json();
    console.log(data);

    tab = `<option value="">---Select State---</option>`;
    for (var i = 0; i < data.states.length; i++) {
        tab += `<option value="${data.states[i].state_id}">${data.states[i].state_name}</option>`;
    }
    document.getElementById("state-selection").innerHTML = tab;
}

async function setdistricts() {

    var state_select = document.getElementById("state-selection");
    var state_id = state_select.options[state_select.selectedIndex].value;

    if (state_id !== "") {
        const response = await fetch(`https://cdn-api.co-vin.in/api/v2/admin/location/districts/${state_id}`);

        var data = await response.json();
        console.log(data);

        tab = `<option value="">---Select District---</option>`;
        for (var i = 0; i < data.districts.length; i++) {
            tab += `<option value="${data.districts[i].district_id}">${data.districts[i].district_name}</option>`;
        }
        document.getElementById("district-selection").innerHTML = tab;
    } else {
        document.getElementById("district-selection").innerHTML = `<option value="">---Select a State first---</option>`;
        document.getElementById("finish-button").style.display = "none";
    }

}

async function showfinishbutton() {
    var district_select = document.getElementById("district-selection");
    var district_id = district_select.options[district_select.selectedIndex].value;

    if (district_id !== "") {
        document.getElementById("finish-button").style.display = "block";
    } else {
        document.getElementById("finish-button").style.display = "none";
    }
}

async function showdata() {
    vaccine = document.getElementById("vaccine-selection").value;
    var district_select = document.getElementById("district-selection");
    var district_id = district_select.options[district_select.selectedIndex].value;

    var date_select = document.getElementById("date-selection");
    var date = date_select.value;
    date_arr = date.split("-");
    new_date = date_arr[2] + "-" + date_arr[1] + "-" + date_arr[0];

    if (district_id !== "") {
        const response = await fetch(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${district_id}&date=${new_date}`);

        var data = await response.json();

        console.log(data);

        var tab = `
        <tr>
        <th>Centre Name</th>
        <th>PIN Code</th>
        <th>Time</th>
        <th>More Info</th>
        </tr>`;

        console.log(data.centers[0].name);
        var centers_count = 0;

        for (let i in data.centers) {
            var flag = 0;
            for (let j in data.centers[i].sessions) {
                if (data.centers[i].sessions[j].vaccine === vaccine) {
                    flag = 1;
                    break;
                }
            }
            if (flag === 1) {
                centers_count++;
                var start_timing = JSON.stringify(data.centers[i].from);
                var end_timing = JSON.stringify(data.centers[i].to);
                var time = start_timing.substring(1,6) + " - " + end_timing.substring(1,6);
                tab += `
                <tr>
                    <td>${data.centers[i].name}</td>
                    <td>${data.centers[i].pincode}</td>
                    <td>${time}</td>
                    <td><button class="more-info-button" onclick="showmoreinfo(${data.centers[i].center_id}, ${new_date})">More Info</button></td>
                </tr>`;
            }
        }
        if (centers_count == 0) {
            tab += `
            <tr>
                <td colspan="4">No centers available 😢</td>
            </tr>`;
        }
        document.getElementById("data-holder").style.display = "block";
        document.getElementById("all-centres").innerHTML = tab;
        document.getElementById("finish-button").scrollIntoView();
    } else {
        alert("Could not find any data");
    }
}

async function showmoreinfo(center_id) {
    date = document.getElementById("date-selection").value;
    date_arr = date.split("-");
    new_date = date_arr[2] + "-" + date_arr[1] + "-" + date_arr[0];

    const response = await fetch(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByCenter?center_id=${center_id}&date=${new_date}`);

    var data = await response.json();

    console.log(data);

    document.getElementById("center-info-title").innerHTML = data.centers.name;
    document.getElementById("center-info-address").innerHTML = data.centers.address + " - " + data.centers.pincode;
    document.getElementById("google-maps-a").href = `https://www.google.com/maps/search/?api=1&query=${data.centers.name + " " + data.centers.address + " " + data.centers.pincode}`;
    document.getElementById("center-info-id").innerHTML = data.centers.center_id;
    document.getElementById("center-info-openingtime").innerHTML = data.centers.from;
    document.getElementById("center-info-closingtime").innerHTML = data.centers.to;
    document.getElementById("center-info-feetype").innerHTML = data.centers.fee_type;

    for (let i in data.centers.sessions) {
        if (data.centers.sessions[i].vaccine === vaccine && data.centers.sessions[i].date === new_date) {
            document.getElementById("session-content-date").innerHTML = data.centers.sessions[i].date;
            document.getElementById("session-content-vaccine").innerHTML = vaccine;
            document.getElementById("session-content-minage").innerHTML = data.centers.sessions[i].min_age_limit;
            document.getElementById("session-content-capacity1").innerHTML = data.centers.sessions[i].available_capacity_dose1;
            document.getElementById("session-content-capacity2").innerHTML = data.centers.sessions[i].available_capacity_dose2;
            timings = "";
            for (let j in data.centers.sessions[i].slots) {
                timings += data.centers.sessions[i].slots[j] + " <br>";
            }
            document.getElementById("session-content-slots").innerHTML = timings;
            break;
        }
    }

    document.getElementById("center-info-holder").style.display = "block";
    document.getElementById("center-info-holder").scrollIntoView();
}