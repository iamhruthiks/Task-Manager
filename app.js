//creating the express app
const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const Task = require("./models/task")
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate")
const catchAsync = require("./utils/catchAsync")
const ExpressError = require("./utils/ExpressError")

mongoose.connect('mongodb://127.0.0.1:27017/task')
    .then(() => {
        console.log("connection to mongoose task db is sucesssfull")
    })
    .catch(err => {
        console.log("connection to mongoooe task db has failed")
        console.log(err)
    })

const app = express()

app.engine("ejs", ejsMate)
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))

app.get("/", (req, res) => {
    res.render("home")
})


app.get("/tasks", catchAsync(async (req, res, next) => {
    const tasks = await Task.find({})
    res.render("tasks/index.ejs", { tasks })
}))


//Create
app.use("/tasks/new", (req, res) => {
    res.render("tasks/new.ejs")
})

// adding new tasks to db
app.post("/tasks", catchAsync(async (req, res, next) => {
    //res.send(req.body)
    const task = new Task(req.body.task)
    await task.save()
    res.redirect(`/tasks/${task._id}`)
}))

// Read
app.get("/tasks/:id", catchAsync(async (req, res, next) => {
    const task = await Task.findById(req.params.id)
    res.render("tasks/show.ejs", { task })
}))

// Update
app.get("/tasks/:id/edit", catchAsync(async (req, res, next) => {
    const task = await Task.findById(req.params.id)
    res.render("tasks/edit.ejs", { task })
}))

// Updating changes to the task
app.put("/tasks/:id", catchAsync(async (req, res, next) => {
    const { id } = req.params
    await Task.findByIdAndUpdate(id, { ...req.body.task })
    res.redirect(`/tasks/${id}`)
}))

// Delete
app.delete("/tasks/:id", catchAsync(async (req, res, next) => {
    const { id } = req.params
    await Task.findByIdAndDelete(id)
    res.redirect("/tasks")
}))

app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found!", 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "opps!, something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { err })
})


app.listen(3000, () => {
    console.log("serving on port 3000")
})