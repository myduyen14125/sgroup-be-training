const connection = require("./connection.js");
connection.query(
    `CREATE TABLE IF NOT EXISTS Class (
        id INT PRIMARY KEY NOT NULL AUTO_INCREMENT UNIQUE,
        name VARCHAR(255)
    );`,
    (err, result) => {
        if (err) throw err;
        console.log("Table class created.");
    }
);

connection.query(
    `CREATE TABLE IF NOT EXISTS user (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        age INT,
        gender VARCHAR(6),
        class_id INT,
        FOREIGN KEY (class_id) REFERENCES class(id)
    );`,
    (err, result) => {
        if (err) throw err;
        console.log("Table user created.");
    }
);


// Thêm dữ liệu ban đầu
// Tạo dữ liệu mẫu cho bảng catelogy
const classes = [
    "21T",
    "20T",
    "22T",
    "19T",
    "21T2",
    "12A",
    "SGroup",
    "30T",
    "Duy",
    "23T",
];

// Thực hiện lặp để thêm dữ liệu vào bảng catelogy 
for (let i = 0; i < classes.length; i++) {
    connection.query(
        "INSERT INTO class (name) VALUES (?)", [[classes[i]]],
        (err, result) => {
            if (err) throw err;
        }
    );
}

// Tạo dữ liệu mẫu cho bảng user
const users = [
    { name: "Tran Thi Anh", age: 20, gender: "Female", class_id: 1 },
    { name: "Nguyen Van Tai", age: 21, gender: "Male", class_id: 2 },
    { name: "Pham Thanh Dat", age: 22, gender: "Male", class_id: 1 }
];

;

// Thực hiện lặp để thêm dữ liệu vào bảng user
for (let i = 0; i < users.length; i++) {
    const { name, age, gender, class_id } = users[i];

    connection.query(
        "INSERT INTO user (name, age, gender, class_id) VALUES (?, ?, ?, ?)" , [name, age,gender, class_id],
        (err, result) => {
            if (err) throw err;
        }
    );
}

connection.end(); // Đóng kết nối connection khi đã hoàn tất thao tác

