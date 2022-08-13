import { VideoController } from "./videosController";

const express = require('express');
const videoRoute = express.Route()





videoRoute.get("/",VideoController.createVideo)

module.exports = videoRoute()
