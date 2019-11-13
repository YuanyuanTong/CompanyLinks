# -*- coding: utf-8 -*-
"""
Created on Tue Nov 12 20:57:35 2019

@author: Yuanyuan Tong
"""

import csv
import json

# Open the CSV for reading
f = open( 'data/partial_company_coordinates.csv', 'rU' )
# Create csv reader object
reader = csv.DictReader(f)
# Parse the CSV into JSON
out = json.dumps( [ row for row in reader ] )
f.close()

# Save the string as JSON object
company_data = json.loads(out)

# Delete the de-listed companies
def fun(company):
    company_name = company["company"]
    if "De-listed" in company_name:
        return False
    else:
        return True

company_data = filter(fun, company_data)

# Open the file for writing
f = open('data/processed_company_data.csv', 'w')
# Create the csv writer object
writer = csv.writer(f)

count = 0

for company in company_data:
    if count == 0:
        header = company.keys()
        writer.writerow(header)
        count += 1
    company_name = company["company"]
    if "prior to" in company_name:
        company["company"] = company_name.split('(')[0]
    writer.writerow(company.values())

f.close()