from operator import countOf
from flask import Flask, send_file, request
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins='*')
DEFAULT_FILE_NAME = "data.csv"
# Route for serving index.html
@app.route('/')
def index():
    return send_file('static/index.html')

# Route for serving script.js
@app.route('/script.js')
def get_script():
    return send_file('static/script.js')

# Route for serving styles.css
@app.route('/style.css')
def get_styles():
    return send_file('static/style.css')

@app.route('/countries')
def countries():
    country_list = list()
    head_line = True
    with open(DEFAULT_FILE_NAME, "r") as file:
        for line in file:
            if head_line:
                head_line = False
                continue
            
            line_data = line.replace('"', '').split("\n")[0].split(',')
            
            # country = line_data[0]
            # country_code = line_data[1]
            
            if [line_data[0], line_data[1]] not in country_list:
              country_list.append([line_data[0], line_data[1]])

    return country_list

@app.route("/year")
def get_years():
    Years_List = list()
    
    head_line = True
    with open(DEFAULT_FILE_NAME, "r") as file:
        for line in file:
            if head_line:
                head_line = False
                continue
            
            line_data = line.replace('"', '').split("\n")[0].split(',')
            if int(line_data[3]) not in Years_List:
                Years_List.append(int(line_data[3]))

    return Years_List


@app.route("/country/<ISO_CODE>/<GENDER>")
def country_data(ISO_CODE, GENDER):
    
    ISO_CODE = ISO_CODE.split(",")
    if GENDER == "M":
        GENDER = ["man", "men"]
        
    elif GENDER == "W":
        GENDER = ["women", "woman"]
    
    
    START_YEAR = int(request.args.get('start_year'))
    END_YEAR = int(request.args.get('end_year'))    
    
    
    GENDER_SET = set()
    country_data_list = list()

    """
        label: containing list of all the Years in ascending order
        data: age_standardised data in proper sequence with year list present in label
        
    """
    
    with open(DEFAULT_FILE_NAME, "r") as file:
        for line in file:            
            line_data = line.replace('"', '').split("\n")[0].split(',')

            if line_data[1] in ISO_CODE:
    
                if ( (line_data[2].lower() in GENDER) and ( (int(line_data[3]) >= START_YEAR) and ( int(line_data[3]) <= END_YEAR ) ) ):
                    
                    info = dict()
                    info["country"] = line_data[0]
                    info["ISO_CODE"] = line_data[1]
                    info["Sex"] = line_data[2]
                    info["Year"] = int(line_data[3])
                    info["Age_standardised_diabetes_prevalence"] = float(line_data[4]) * 100
                    # info["Lower_95%_uncertainty_interval"] = float(line_data[5]) * 100
                    # info["Upper_95%_uncertainty_interval"] = float(line_data[6]) * 100
                    
                    country_data_list.append(info)
                    
                    
                    
                if ( (GENDER == "A")  and ( (int(line_data[3]) >= START_YEAR) and ( int(line_data[3]) <= END_YEAR ) ) ):
                    
                    info = dict()
                    info["country"] = line_data[0]
                    info["ISO_CODE"] = line_data[1]
                    info["Sex"] = line_data[2]
                    info["Year"] = int(line_data[3])
                    info["Age_standardised_diabetes_prevalence"] = float(line_data[4]) * 100
                    # info["Lower_95%_uncertainty_interval"] = float(line_data[5]) * 100
                    # info["Upper_95%_uncertainty_interval"] = float(line_data[6]) * 100
                    
                    country_data_list.append(info)
                    
                    
    
    men_data = {'is_male': True, 'years': [], 'prevalence': []}
    women_data = {'is_male': False, 'years': [], 'prevalence': []}

    for entry in country_data_list:
        
        sex = entry['Sex']
        if sex == 'Men':
            men_data['years'].append(entry['Year'])
            men_data['prevalence'].append([entry['Age_standardised_diabetes_prevalence'], entry['country']])
        elif sex == 'Women':
            women_data['years'].append(entry['Year'])
            women_data['prevalence'].append([entry['Age_standardised_diabetes_prevalence'], entry['country']])

    
    
    del country_data_list
    
    
    if GENDER == "A":
        
        men_data['years'], men_data['prevalence'] = zip(*sorted(zip(men_data['years'], men_data['prevalence'])))
        women_data['years'], women_data['prevalence'] = zip(*sorted(zip(women_data['years'], women_data['prevalence'])))
        return {"M": men_data, "W": women_data}
    
    if GENDER == ["man", "men"]:
        
        men_data['years'], men_data['prevalence'] = zip(*sorted(zip(men_data['years'], men_data['prevalence'])))
        return {"M": men_data, "W": ""}

    if GENDER == ["women", "woman"]:
        women_data['years'], women_data['prevalence'] = zip(*sorted(zip(women_data['years'], women_data['prevalence'])))
        return {"W": women_data, "M": ""}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)    
            
    