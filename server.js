const express = require('express')
const mysql = require('mysql')
const cors = require('cors')
const corsOption = {
    origin: ['http://localhost:3000'],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}

const app = express();
app.use(cors(corsOption));
app.use(express.json());

const db = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"library"
})

db.connect((err) => {
    if(err)
    {
        throw err;
    }
    console.log("MySQL Connected");
})


app.post('/register',(req,res)=>{
    const sql = "INSERT INTO users (`username`,`email`,`password`) VALUES (?,?,?)";
    console.log(req.body.username);
    const values = [
        req.body.username,
        req.body.email,
        req.body.password,
    ]
    db.query(sql,values,(err, data) => {
        if(err) return res.json(err);
        return res.json("created");
    })

})

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    db.query(sql, [email, password], (err, data) => {
        if (err) {
            console.error('Database error: ',err);
            return res.status(500).json({ error: "Internal server error" });
        }

        if (data.length > 0) {
            // User found, login successful
            return res.json({ message: "Login successful" });
        } else {
            // User not found or invalid credentials
            return res.status(401).json({ error: "Invalid username or password" });
        }
    });
});

app.get('/admin',(req, res)=>{
    const sql = "SELECT * FROM books";
    db.query(sql,(err,data) => {
        if(err) return res.json(err);
        return res.json(data);
    })
})

app.post('/admin/addbook', (req, res) => {
    const { title, author, subject, published, count} = req.body;
    
    const insertSql = "INSERT INTO books (title, author, subject, published, count) VALUES (?, ?, ?, ?, ?)";
    const values = [title, author, subject, published, count];
    db.query(insertSql, values, (err, data) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: "Failed to add center" });
                }
                res.status(200).json({ message: "Book added successfully" });
    });
        
});


app.get('/user',(req, res)=>{
    const sql = "SELECT * FROM books";
    db.query(sql,(err,data) => {
        if(err) return res.json(err);
        return res.json(data);
    })
})

app.get('/user', (req, res) => {
    const sql = "SELECT id, title, author, subject, published, count FROM books";
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching Books:', err);
            return res.status(500).json({ error: "Internal server error" });
        }
        return res.json(results);
    });
});


app.post('/user/borrowbook', (req, res) => {
    const { id } = req.body;

    const decreaseSlotsSQL = "UPDATE books SET count = count - 1 WHERE id = ?";
    db.query(decreaseSlotsSQL, [id], (err, result) => {
        if (err) {
            console.error('Error decreasing slots:', err);
            return res.status(500).json({ error: "Internal server error" });
        }
        return res.json({ message: "Book borrowed successfully" });
    });
});

app.get('/user/filter/:field/:value', (req, res) => {
    const field = req.params.field;
    const value = req.params.value;

    let sql = "";
    let placeholder = "";
    switch (field) {
        case "title":
            sql = "SELECT * FROM books WHERE title LIKE ?";
            placeholder = `%${value}%`;
            break;
        case "author":
            sql = "SELECT * FROM books WHERE author LIKE ?";
            placeholder = `%${value}%`;
            break;
        case "subject":
            sql = "SELECT * FROM books WHERE subject LIKE ?";
            placeholder = `%${value}%`;
            break;
        case "published":
            sql = "SELECT * FROM books WHERE published = ?";
            placeholder = value;
            break;
        default:
            return res.status(400).json({ error: "Invalid field" });
    }

    db.query(sql, [placeholder], (err, results) => {
        if (err) {
            console.error(`Error filtering Books by ${field}:`, err);
            return res.status(500).json({ error: "Internal server error" });
        }
        return res.json(results);
    });
});



app.listen(8081,()=>{
    console.log("Listening...");
})