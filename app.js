// Set environment variable
const dotenv = require('dotenv');
dotenv.config();
//--------

// Require Express et set an instance
const express = require('express');
const app = express();
//--------

// Static files
app.use(express.static('public'));
//--------

// Module to parse sent form data 
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
//--------

// Module to allow others domains to communicate with this server
const cors = require('cors');
app.use(cors());
//--------

// Module for security
const helmet = require('helmet');
app.use(helmet.xssFilter());
//--------

// Require Mongoose and connect to remote database server
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE, {useNewUrlParser: true, useUnifiedTopology: true});
//--------

// Get notification if connection is successfull or if a connection error occurs
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => console.log("We're connected!")); 
//--------

// Set database schema and model
// 1- Set the schema
const IssueSchema = new mongoose.Schema({
  'issue_title': String,
  'issue_text': String,
  'created_by': String,
  'assigned_to': String,
  'created_on': Date,
  'updated_on': Date,
  'status_text': String,
  'open': Boolean
});
// 2- Compile schema into model
const Issue = mongoose.model('Issue', IssueSchema);
//--------

// Set routes

app.get('/', (req, res) => res.send("/public/index.html"));

app.post('/api/issues/edimocms', (req, res) => {
  let issue_title = req.body.issue_title,
      issue_text = req.body.issue_text,
      created_by = req.body.created_by,
      assigned_to = req.body.assigned_to,
      status_text = req.body.status_text,
      created_on = new Date(),
      update_on = new Date(),
      open = true;
  if (assigned_to === "") assigned_to = created_by;
  let issue = new Issue({'issue_title': issue_title, 'issue_text': issue_text, 'created_by': created_by, 'assigned_to': assigned_to, 'status_text': status_text, 'created_on': created_on, 'update_on': update_on, 'open': open});
  issue.save((err, issue) => {
    if (err) console(err);
    res.json(issue);
  });
});

app.put('/api/issues/edimocms', (req, res) => {
  let _id = req.body._id,
      issue_title = req.body.issue_title,
      issue_text = req.body.issue_text,
      created_by = req.body.created_by,
      assigned_to = req.body.assigned_to,
      update_on = new Date(),
      status_text = req.body.status_text,
      open = req.body.open;
  if (issue_title === "" && issue_text === "" && created_by === "" && assigned_to === "" && status_text === "" && open === undefined) res.send('no updated field sent');
  else {
    Issue.findById(_id, (err, issue) => {
      if (err) res.send('_id error');
      else if (issue['open'] === false) res.send('could not update ' + issue['_id']);
      else {
        if (issue_title !== undefined) issue['issue_title'] = issue_title;
        if (issue_text !== undefined) issue['issue_text'] = issue_text;
        if (created_by !== undefined) issue['created_by'] = created_by;
        if (assigned_to !== undefined) issue['assigned_to'] = assigned_to;
        if (status_text !== undefined) issue['status_text'] = status_text;
        if (open !== undefined) issue['open'] = false;
        issue['update_on'] = update_on;
        issue.save((err, issue) => res.send('successfully updated'));
      }
    });
  }
});

app.delete('/api/issues/edimocms', (req, res) => {
  let _id = req.body._id;
  Issue.findById(_id, (err, issue) => {
    if (err) res.send('_id error');
    else if (issue['open'] === true) res.send( 'could not delete ' + issue['_id']);
    else issue.remove((err, issue) => res.send( 'deleted ' + issue['_id']));
  });
});

app.get('/api/issues/edimocms', (req, res) => {
  let _id = req.params._id,
      issue_title = req.params.issue_title,
      created_by = req.params.created_by,
      assigned_to = req.params.assigned_to,
      created_on_from = req.params.created_on_from ? req.params.created_on_from : -8640000000000000,
      created_on_to = req.params.created_on_to ? req.params.created_on_to : 8640000000000000,
      update_on_from = req.params.update_on_from ? req.params.update_on_from : -8640000000000000,
      update_on_to = req.params.update_on_to ? req.params.update_on_to : 8640000000000000,
      status_text = req.params.status_text,
      open = req.params.open;
  if (_id != undefined) Issue.findById(_id, (err, issue) => {
    if (err) res.send('_id error');
    else res.json(issue); 
  });
  else {
     let obj = {};
     if (issue_title != undefined) obj['issue_title'] = issue_title;
     if (created_by != undefined) obj['created_by'] = created_by;
     if (assigned_to != undefined) obj['assigned_to'] = assigned_to;
     if (status_text != undefined) obj['status_text'] = status_text;
     if (open == 'open') obj['open'] = true;
     else if (open == 'close') obj['open'] = false;
     obj['created_on'] = {$gte: new Date(created_on_from), $lte: new Date(created_on_to)};
     obj['update_on'] = {$gte: new Date(update_on_from), $lte: new Date(update_on_to)};
     Issue.find(obj, (err, issues) => res.json(issues));
  }
});

app.use((err, req, res, next) => res.status(500).send('Something broke!'));

app.use((req, res, next) => res.status(404).send('Sorry cant find that!'));

app.listen(3000);



