// Appliance details and default power ratings

const applianceList = {

    "Ceiling Fan": 75,

    "LED Bulb": 9,

    "Television": 100,

    "Refrigerator": 200,

    "Washing Machine": 500,

    "Air Conditioner": 1500,

    "Microwave Oven": 1200,

    "Laptop": 65,

    "Water Heater": 2000,

    "Water Pump": 750

};


// Appliance colors

let colors = [
    "#2196F3",
    "#FF9800",
    "#4CAF50",
    "#E91E63",
    "#9C27B0",
    "#795548",
    "#00BCD4",
    "#FF5722",
    "#607D8B",
    "#8BC34A"
];

let chart;

let count = 0;


// Create appliance dropdown

function addAppliance() {

    if (count >= 10) {

        alert("Maximum 10 appliances can be selected.");

        return;

    }

    count++;

    let container = document.getElementById(
        "applianceContainer"
    );

    let div = document.createElement("div");

    div.className = "appliance";

    div.id = "appliance" + count;

    let options = Object.keys(applianceList).map(
        function(name) {

            return `<option value="${name}">
                ${name}
            </option>`;

        }
    ).join("");


    div.innerHTML = `

        <h3>Appliance ${count}</h3>

        <label>Select Appliance</label>

        <select class="applianceName"
        onchange="updatePower(this)">

            <option value="">Choose Appliance</option>

            ${options}

        </select>

        <label>Power Rating (Watts)</label>

        <input type="number"
        class="watts"
        min="0"
        placeholder="Enter power rating">

        <label>Usage Hours Per Day</label>

        <input type="number"
        class="hours"
        min="0"
        max="24"
        step="0.1"
        placeholder="Enter daily usage hours">

        <button type="button"
        class="remove-btn"
        onclick="removeAppliance(${count})">

            Remove Appliance

        </button>

    `;

    container.appendChild(div);

    updateAddButton();

}


// Automatically update power rating

function updatePower(select) {

    let card = select.closest(".appliance");

    let watts = card.querySelector(".watts");

    let selected = select.value;

    if (selected !== "") {

        watts.value = applianceList[selected];

    } else {

        watts.value = "";

    }

}


// Remove appliance

function removeAppliance(id) {

    if (count <= 4) {

        alert("Minimum 4 appliances must be selected.");

        return;

    }

    let element = document.getElementById(
        "appliance" + id
    );

    element.remove();

    count--;

    // Renumber appliance cards

    let cards = document.querySelectorAll(
        ".appliance"
    );

    cards.forEach(function(card, index) {

        card.querySelector("h3").innerText =
            "Appliance " + (index + 1);

    });

    updateAddButton();

}


// Update add button

function updateAddButton() {

    let button = document.getElementById("addBtn");

    if (count >= 10) {

        button.disabled = true;

        button.innerText = "Maximum 10 Appliances Reached";

    } else {

        button.disabled = false;

        button.innerText = "+ Add Another Appliance";

    }

}


// Add initial 4 appliances

for (let i = 0; i < 4; i++) {

    addAppliance();

}


// Main calculation function

function calculate() {

    let cards = document.querySelectorAll(
        ".appliance"
    );

    let days = Number(
        document.getElementById("days").value
    );

    let appliances = [];

    let selectedNames = [];

    let totalDaily = 0;

    let totalMonthly = 0;


    // Minimum appliance validation

    if (cards.length < 4) {

        alert("Please select at least 4 appliances.");

        return;

    }


    // Read appliance details

    for (let card of cards) {

        let name = card.querySelector(
            ".applianceName"
        ).value;

        let wattsInput = card.querySelector(
            ".watts"
        );

        let hoursInput = card.querySelector(
            ".hours"
        );

        let watts = Number(wattsInput.value);

        let hours = Number(hoursInput.value);


        if (name === "") {

            alert("Please select all 4 appliances.");

            return;

        }


        if (selectedNames.includes(name)) {

            alert("Please select different appliances. " +
                name + " is already selected.");

            return;

        }

        selectedNames.push(name);


        if (
            wattsInput.value === "" ||
            hoursInput.value === "" ||
            !Number.isFinite(watts) ||
            !Number.isFinite(hours) ||
            watts < 0 ||
            hours < 0 ||
            hours > 24
        ) {

            alert("Enter valid power and usage hours for " + name);

            return;

        }


        // Daily consumption

        let daily = (watts * hours) / 1000;


        // Monthly consumption

        let monthly = daily * days;


        appliances.push({

            name: name,

            daily: daily,

            monthly: monthly

        });


        totalDaily += daily;

        totalMonthly += monthly;

    }


    // Display calculation results

    let output = "";

    appliances.forEach(function(a) {

        output += `

            <h3>${a.name}</h3>

            Daily Consumption:
            ${a.daily.toFixed(3)} kWh

            <br>

            Monthly Consumption:
            ${a.monthly.toFixed(3)} kWh

            <br>

        `;

    });


    output += `

        <hr>

        <h3>Total Consumption</h3>

        Total Daily Consumption:
        ${totalDaily.toFixed(3)} kWh

        <br>

        Total Monthly Consumption:
        ${totalMonthly.toFixed(3)} kWh

    `;


    document.getElementById(
        "results"
    ).innerHTML = output;


    // Generate graph

    generateGraph(appliances, days);

}


// Graph generation function

function generateGraph(appliances, days) {

    if (typeof Chart === "undefined") {

        alert("Chart library not loaded. Check internet connection.");

        return;

    }


    let labels = [];

    for (let i = 1; i <= days; i++) {

        labels.push("Day " + i);

    }


    let datasets = [];


    // Individual appliance graphs

    appliances.forEach(function(a, index) {

        datasets.push({

            label: a.name,

            data: Array(days).fill(a.daily),

            borderColor: colors[index],

            backgroundColor: colors[index],

            borderWidth: 2,

            pointRadius: 3,

            tension: 0.3

        });

    });


    // Total consumption

    let totalDaily = appliances.reduce(

        function(sum, a) {

            return sum + a.daily;

        }, 0

    );


    datasets.push({

        label: "Total Consumption",

        data: Array(days).fill(totalDaily),

        borderColor: "#E53935",

        backgroundColor: "#E53935",

        borderWidth: 3,

        pointRadius: 4

    });


    // Destroy previous chart

    if (chart) {

        chart.destroy();

    }


    // Create new chart

    let ctx = document.getElementById("myChart");

    chart = new Chart(ctx, {

        type: "line",

        data: {

            labels: labels,

            datasets: datasets

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            interaction: {

                intersect: false,

                mode: "index"

            },

            plugins: {

                title: {

                    display: true,

                    text: "Daily Electricity Consumption (kWh)",

                    font: {

                        size: 18

                    }

                },

                legend: {

                    display: true,

                    position: "bottom"

                }

            },

            scales: {

                x: {

                    title: {

                        display: true,

                        text: "Days of the Month"

                    }

                },

                y: {

                    beginAtZero: true,

                    title: {

                        display: true,

                        text: "Energy Consumption (kWh)"

                    }

                }

            }

        }

    });

}