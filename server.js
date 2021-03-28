'use strict';
require('dotenv').config();
// Application dependencies
const express = require('express');//from node modules
const cors = require('cors');//from node modules
const PORT =process.env.PORT;
const app=express(); //create new instance for express //express is a framework

app.listen(3000,()=>console.log('Listening to Port 3000'));//start point for the application"initialisation"