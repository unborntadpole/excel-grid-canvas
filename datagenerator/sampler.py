import json
import random

list = []
first_names = ["Emma", "Liam", "Olivia", "Noah", "Ava", "Elijah", "Sophia", "James", "Isabella", "William"]
last_names = ["Adani", "Advani", "Agarwal", "Amarnath", "Amra", "Anand", "Arasaratnam", "Aron", "Badesha"]


rows = 50_000

for i in range(rows):
    row = {
        "id": i+1,
        "firstName": random.choice(first_names),
        "lastName": random.choice(last_names),
        "age": random.randint(21,35),
        "salary": random.randint(7_00_000,10_00_000)
    }
    list.append(row)

with open("./public/data.json", 'w') as file:
    json.dump(list, file, indent=4)
