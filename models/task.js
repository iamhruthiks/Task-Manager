// defining the task model

const mongoose = require("mongoose")
const Schema = mongoose.Schema

const taskSchema = new Schema({
    title: String,
    description: String,
    duedate: Date
})

module.exports = mongoose.model("Task", taskSchema)