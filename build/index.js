"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var express_1 = __importDefault(require("express"));
var sqlite3_1 = __importDefault(require("sqlite3"));
var path_1 = __importDefault(require("path"));
var app = express_1.default();
var port = 3000;
var db = new sqlite3_1.default.Database("users.sqlite3");
app.use(express_1.default.json());
app.use(express_1.default.urlencoded());
// create database if it doesn't exist
db.serialize(function () {
    db.run("CREATE TABLE IF NOT EXISTS users(username text,password text,salt text );");
});
app.get("/", function (_, res) {
    res.sendFile(path_1.default.join(__dirname, "/pages/index.html"));
});
app.get("/register", function (_, res) {
    res.sendFile(path_1.default.join(__dirname, "/pages/register.html"));
});
app.post("/register", function (req, res) {
    var salt = bcryptjs_1.default.genSaltSync();
    var username = req.body.username;
    var password = bcryptjs_1.default.hashSync(req.body.password, salt);
    db.run("\n    INSERT INTO users (username, password, salt)\n    VALUES ($username, $password, $salt);\n    ", username, password, salt);
    res.statusCode = 200;
    res.redirect("/");
});
app.get("/login", function (req, res) {
    res.sendFile(path_1.default.join(__dirname, "/pages/login.html"));
});
app.post("/login", function (req, res) {
    var username, password, salt;
    db.get("\n    SELECT username, password, salt FROM users WHERE username = ?", req.body.username, function (_, row) {
        var salted_password = bcryptjs_1.default.hashSync(req.body.password, row.salt);
        if (salted_password == row.password) {
            res.send(showUserHomePage(req.body.username));
        }
        else {
            res.sendStatus(400);
        }
    });
});
function showUserHomePage(username) {
    return "\n  <!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Login to your account</title>\n</head>\n<body>\n    <h3>Welcome back, " + username + "</h3>\n    <p>This is your personal feed</p>\n</body>\n</html>\n    ";
}
app.listen(port, function () {
    console.log("App running on http://localhost:" + port + "/");
});
