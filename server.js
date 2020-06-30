const express = require("express")
const nunjucks = require("nunjucks")
const routes = require('./routes')

const server = express();

server.set("view engine", "njk")
server.use(express.urlencoded({ extended: true }))
server.use(express.static("public"))
server.use(routes)

nunjucks.configure("views", {
    express: server,
    noCache: true,
    autoescape: false,
})

server.listen(3000, () => {
    console.log("Server is on!")
})