var GRAPH_DATA;

function display_graph(graph_data, label, years, element_id) {
  // Extracting data for Chart.js
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
        data: prevalenceValuesForGender("M"),
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgb(75, 192, 192)',
        hoverBackgroundColor: 'rgba(75, 192, 192, 0.8)',
        hoverBorderColor: 'rgba(75, 192, 192, 1)',
        percentage:`${countries.join(',')} ${prevalenceValues.join(',')}`/``,

      },
      {
        label:"Women",
        data: prevalenceValuesForGender("W"),
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        hoverBackgroundColor: 'rgba(255, 99, 132, 0.8)',
        hoverBorderColor: 'rgba(255, 99, 132, 1)',
        percentage:`${countries.join(',')} ${prevalenceValues.join(',')}`/``
      }
    ]
  };
  
  function prevalenceValuesForGender(gender) {
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
  
  // Rest of your code remains the same...
  

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
  // API endpoint URLs
  // const countriesApiUrl = "http://127.0.0.1:5000/countries";
  const countriesApiUrl = "https://effective-goldfish-jgwv59jjqj43qv4p-5000.app.github.dev/countries";

  // const yearApiUrl = "http://127.0.0.1:5000/year";
  const yearApiUrl = "https://effective-goldfish-jgwv59jjqj43qv4p-5000.app.github.dev/year";

  var Year_List = []

  // Get the container where checkboxes will be rendered
  const checkboxContainer = document.getElementById("location-checkboxes");

  // Get the button container
  const buttonContainer = document.getElementById("button-container");

  // Get the dropdown element
  const start_dropdown = document.getElementById("start_year_dropdown");
  const end_dropdown = document.getElementById("end_year_dropdown");

  // Fetch Country and Country ISO Code from the API
  fetch(countriesApiUrl)
    .then(response => response.json())
    .then(data => {
      const checkboxes = data.map(entry => {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `checkbox_${entry[0]}`;
        checkbox.value = entry[1];

        const label = document.createElement("label");
        label.htmlFor = `checkbox_${entry[1]}`;
        label.appendChild(document.createTextNode(entry[0]));

        const checkboxWrapper = document.createElement("div");
        checkboxWrapper.appendChild(checkbox);
        checkboxWrapper.appendChild(label);

        return checkboxWrapper;
      });

      checkboxes.forEach(checkbox => {
        checkboxContainer.appendChild(checkbox);
      });

      // Create the log button
      const logButton = createButton("Get Data", get_data);
      buttonContainer.appendChild(logButton);

      // Create the reset button
      const resetButton = createButton("Reset", reset_checkboxes);
      buttonContainer.appendChild(resetButton);
    })
    .catch(error => console.error("Error fetching data:", error));
  
  // Fetch All Years
  fetch(yearApiUrl)
    .then(response => response.json())
    .then(data => {
      Year_List = data
      // Populate the dropdown with options
      data.forEach(optionText => {
        const option = document.createElement("option");
        option.value = optionText;
        option.text = optionText;
        start_dropdown.add(option);

      });

      data.forEach(optionText => {
        const option = document.createElement("option");
        option.value = optionText;
        option.text = optionText;
        end_dropdown.add(option);
      });

    })
    .catch(error => console.error("Error fetching data:", error));

  function createButton(text, onClickFunction) {
    const button = document.createElement("button");
    button.innerText = text;
    button.onclick = onClickFunction;
    return button;
  }

  function reset_checkboxes() {
    // const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    // allCheckboxes.forEach(checkbox => {
    //   checkbox.checked = false;
    // });
    
    // document.getElementById("myChart_man").style.display = '';
    // document.getElementById("myChart_woman").style.display = '';
    // Refresh the page
    location.reload();
  }

  start_dropdown.addEventListener("change", function () {
    console.log("Selected Option:", start_dropdown.value);
  });

  end_dropdown.addEventListener("change", function () {
    console.log("Selected Option:", end_dropdown.value);

    if (parseInt(start_dropdown.value) > parseInt(end_dropdown.value)) {
      alert("Start Year can't be greater than End Year !!!");

      end_dropdown.value = Year_List[Year_List.length -1];
    }
  });

  // Function to get all plotting data based on user filter
  function get_data() {
    const genderDropdown = document.getElementById("gender");
    const selectedGender = genderDropdown.value;

    // Use the selected value as needed, e.g., log it to the console
    console.log("Selected Gender:", selectedGender);

    const checkedCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const checkedValues = Array.from(checkedCheckboxes).map(checkbox => checkbox.value);
    console.log("Checked Checkboxes:", checkedValues.join(","));

    if (checkedValues.join(",") < 3){
      alert("Please Select At least One Country !!!");
    }
    if ((parseInt(start_dropdown.value) > parseInt(end_dropdown.value)) && (start_dropdown.value != null) && (end_dropdown.value != null)){
      alert("Please Select correct Year sequence !!!");

      end_dropdown.value = Year_List[Year_List.length -1];
    }


    const country_data_url = "https://effective-goldfish-jgwv59jjqj43qv4p-5000.app.github.dev/country/" + checkedValues.join(",") + "/" + selectedGender +"?start_year="+start_dropdown.value+"&end_year="+end_dropdown.value

    fetch(country_data_url)
      .then(response => response.json())
      .then(data => {
        console.log(222222, data)
        if (selectedGender == "A"){
          display_graph(data, "All Data", data["M"]["years"], "myChart_man");
          // display_graph(data["W"], "Woman Data", "myChart_woman");
        }
        
        if (selectedGender == "M"){
          delete data["W"];
          display_graph(data, "Man Data", data["M"]["years"], "myChart_man");
        }

        if (selectedGender == "W"){
          delete data["M"];
          display_graph(data, "Woman Data", data["W"]["years"], "myChart_woman");
        }
        
      })
  }

});



