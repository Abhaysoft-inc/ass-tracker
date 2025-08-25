import { Router } from "express";

const router = Router();

// Todo: Get userId of logged in user from the request or from the session storage

// View own attendance

router.get("/view-attendance", async (req, res) => {
    // Todo: implement function to retreive the attendance of current user
});

// Todo: fetch the informations like the current class and the batch so that user can get the schedules as per their semester

router.get("/view-notifications", async (req, res) => {

});

// Todo: fetch schedules using the current class and batch

router.get("/view-schedule", async (req, res) => {

});

