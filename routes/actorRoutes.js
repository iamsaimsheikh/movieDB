const express = require("express");
const router = express.Router();
const ActorServ = require("../services/actorServices");
const { requiresAuth } = require("express-openid-connect");

// Get All Actors

router.get("/all/:page/:limit", requiresAuth(), (req, res) => {
  ActorServ.getAll(req, res);
});

// Find One Name

router.get("/find/:name", requiresAuth(), (req, res) => {
  ActorServ.findOne(req, res);
});

// Add Actor

router.post("/add", async (req, res) => {
  ActorServ.addActor(req, res);
});

// Update Actor

router.post("/update", async (req, res) => {
  ActorServ.updateActor(req, res);
});

// Get Actors From Dummy Api

router.get("/getActorFromApi", async (req, res, next) => {
  ActorServ.getActorFromApi(req, res, next);
});

module.exports = router;
