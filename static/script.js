var GRAPH_DATA;

function display_graph(graph_data, label, years, element_id) {

  var prevalenceData
  if (label == "Man Data"){
    prevalenceData = graph_data['M']['prevalence'];
  }
  if (label == "Woman Data"){
    prevalenceData = graph_data['W']['prevalence'];
  }
  if (label == "All Data"){
    prevalenceData = graph_data['M']['prevalence'];
  }

  const countries = prevalenceData.map(entry => entry[1]);
  const prevalenceValues = prevalenceData.map(entry => entry[0]);
  const data = {
    labels: graph_data["years"],
    datasets: [
      {
        label:  "Men",
        data: prevalenceValuesForGender(graph_data, "M"),
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgb(75, 192, 192)',
        hoverBackgroundColor: 'rgba(75, 192, 192, 0.8)',
        hoverBorderColor: 'rgba(75, 192, 192, 1)',
        percentage:`${countries.join(',')} ${prevalenceValues.join(',')}`/``,

      },
      {
        label:"Women",
        data: prevalenceValuesForGender(graph_data, "W"),
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        hoverBackgroundColor: 'rgba(255, 99, 132, 0.8)',
        hoverBorderColor: 'rgba(255, 99, 132, 1)',
        percentage:`${countries.join(',')} ${prevalenceValues.join(',')}`/``
      }
    ]
  };

  function prevalenceValuesForGender(graph_data, gender) {
    try {
      if (graph_data && graph_data[gender] && graph_data[gender]["prevalence"]) {
        return graph_data[gender]["prevalence"].map(entry => entry[0]);
      } else {
        console.warn("Missing or invalid data structure for gender:", gender);
        return [];
      }
    } catch (error) {
      console.error("Error while extracting prevalence values:", error);
      return [];
    }
  }

  // Chart configuration
  const config = {
    type: 'bar',
    data: data,
    options: {
      scales: {
        x: {
          type: 'category', // Use a category scale for the x-axis
          labels: years,
        },
        y: {
          beginAtZero: true,
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              // Display both the value and the country name in the tooltip
              return context.dataset.percentage || '' + ': ' + context.parsed.y.toFixed(2) + ' (' + countries[context.dataIndex] + ')';
            }
          }
        }
      }
    }
  };

  // Assuming you have a canvas element with id 'myChart'
  var ctx = document.getElementById(element_id).getContext('2d');
  var myChart = new Chart(ctx, config);
  document.getElementById(element_id).style.display = 'block'
}

document.addEventListener("DOMContentLoaded", function () {
  const countriesApiUrl = "https://effective-goldfish-jgwv59jjqj43qv4p-5000.app.github.dev/countries";
  const yearApiUrl = "https://effective-goldfish-jgwv59jjqj43qv4p-5000.app.github.dev/year";
  var Year_List = [];

  const checkboxContainer = d3.select("#location-checkboxes");
  const buttonContainer = d3.select("#button-container");
  const start_dropdown = d3.select("#start_year_dropdown");
  const end_dropdown = d3.select("#end_year_dropdown");

  d3.json(countriesApiUrl).then(data => {
    const checkboxes = checkboxContainer
      .selectAll("div")
      .data(data)
      .enter()
      .append("div");

    checkboxes
      .append("input")
      .attr("type", "checkbox")
      .attr("id", d => `checkbox_${d[0]}`)
      .attr("value", d => d[1]);

    checkboxes
      .append("label")
      .attr("for", d => `checkbox_${d[1]}`)
      .text(d => d[0]);

    const logButton = createButton("Get Data", get_data);
    buttonContainer.append(() => logButton);

    const resetButton = createButton("Reset", reset_checkboxes);
    buttonContainer.append(() => resetButton);
  });

  d3.json(yearApiUrl).then(data => {
    Year_List = data;

    start_dropdown
      .selectAll("option")
      .data(data)
      .enter()
      .append("option")
      .attr("value", d => d)
      .text(d => d);

    end_dropdown
      .selectAll("option")
      .data(data)
      .enter()
      .append("option")
      .attr("value", d => d)
      .text(d => d);
  });

  function createButton(text, onClickFunction) {
    const button = document.createElement("button");
    button.innerText = text;
    button.onclick = onClickFunction;
    return button;
  }

  function reset_checkboxes() {
    location.reload();
  }

  start_dropdown.on("change", function () {
    console.log("Selected Option:", start_dropdown.property("value"));
  });

  end_dropdown.on("change", function () {
    console.log("Selected Option:", end_dropdown.property("value"));

    if (
      parseInt(start_dropdown.property("value")) >
      parseInt(end_dropdown.property("value"))
    ) {
      alert("Start Year can't be greater than End Year !!!");

      end_dropdown.property(
        "value",
        Year_List[Year_List.length - 1]
      );
    }
  });

  function get_data() {
    const genderDropdown = d3.select("#gender");
    const selectedGender = genderDropdown.property("value");

    console.log("Selected Gender:", selectedGender);

    const checkedCheckboxes = d3.selectAll('input[type="checkbox"]:checked');
    const checkedValues = checkedCheckboxes.nodes().map(checkbox => checkbox.value);
    console.log("Checked Checkboxes:", checkedValues.join(","));

    if (checkedValues.length < 3) {
      alert("Please Select At least One Country !!!");
    }
    if (
      parseInt(start_dropdown.property("value")) >
        parseInt(end_dropdown.property("value")) &&
      start_dropdown.property("value") !== null &&
      end_dropdown.property("value") !== null
    ) {
      alert("Please Select correct Year sequence !!!");

      end_dropdown.property(
        "value",
        Year_List[Year_List.length - 1]
      );
    }

    const country_data_url =
      "https://effective-goldfish-jgwv59jjqj43qv4p-5000.app.github.dev/country/" +
      checkedValues.join(",") +
      "/" +
      selectedGender +
      "?start_year=" +
      start_dropdown.property("value") +
      "&end_year=" +
      end_dropdown.property("value");

    d3.json(country_data_url).then(data => {
      if (selectedGender === "A") {
        display_graph(data, "All Data", data["M"]["years"], "myChart_man");
      }

      if (selectedGender === "M") {
        delete data["W"];
        display_graph(data, "Man Data", data["M"]["years"], "myChart_man");
      }

      if (selectedGender === "W") {
        delete data["M"];
        display_graph(data, "Woman Data", data["W"]["years"], "myChart_woman");
      }
    });
  }
});