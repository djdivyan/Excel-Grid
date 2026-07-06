import { writeFileSync } from 'fs';

const firstNames = ["Divyan", "Dhara", "Michael", "Aditya", "Karan"];

const lastNames = [ "Jain", "Mehta", "Sharma", "Shah", "Singh"];

const data = [];

for (let i = 1; i <= 50000; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    data.push({
        id: i,
        firstName,
        lastName,
        age: Math.floor(Math.random() * 41) + 20, // 20 to 60
        salary: Math.floor(Math.random() * 90000) + 10000 //10000 to 99999
    });
}

writeFileSync('data.json', JSON.stringify(data, null, 2));

console.log('Successfully generated 50000 records');