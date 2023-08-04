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
    `CREATE TABLE IF NOT EXISTS student (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255)
    );`,
    (err, result) => {
        if (err) throw err;
        console.log("Table student created.");
    }
);

connection.query(
    `CREATE TABLE IF NOT EXISTS register (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student INT,
        class INT,
        register_date DATE,
        FOREIGN KEY (student) REFERENCES student(id),
        FOREIGN KEY (class) REFERENCES class(id)
    );`,
    (err, result) => {
        if (err) throw err;
        console.log("Table register created.");
    }
);
// Thêm dữ liệu ban đầu
// Tạo dữ liệu mẫu cho bảng catelogy
const classes = [
    "C++",
    "Java"
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
const students = [
    "Tuong" ,
    "Nguyen" ,
    "Huy",
    "Hehe"
];

;

// Thực hiện lặp để thêm dữ liệu vào bảng user
for (let i = 0; i < classes.length; i++) {
    connection.query(
        "INSERT INTO student (name) VALUES (?)", [[students[i]]],
        (err, result) => {
            if (err) throw err;
        }
    );
}
// thêm dữ liệu vào bảng register
connection.query(
    `INSERT INTO register (student, class, register_date) VALUES 
    (1, 1, '2023-04-13'), 
    (1, 2, '2023-04-11'), 
    (2, 2, '2023-04-12'), 
    (2, 1, '2023-04-13'),
    (3, 1, '2023-04-13'),
    (4, 1, '2023-04-13')`,
    (err, result) => {
        if (err) throw err;
        console.log(`${result.affectedRows} rows inserted.`);
    }
);

connection.end(); // Đóng kết nối connection khi đã hoàn tất thao tác

