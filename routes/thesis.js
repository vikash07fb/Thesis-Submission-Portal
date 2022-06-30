const express = require('express');
const router = express.Router();
require('dotenv').config();
const nodemailer = require('nodemailer')
const Thesis = require('../models/Thesis');
const { body, validationResult } = require('express-validator');
const emails = require('../profemails.json');

//professor emails
// const emails = [
//     "prof1@gmail.com",
//     "prof2@gmail.com",
//     "prof3@gmail.com"
// ];

//route 1: recieve data to mongodb using POST /api/thesis/add
router.post('/add', [
    //required constraints
    body('name', 'enter a valid name (more than 3 characters)').isLength({ min: 3 }),
    body('supervisor_name', 'enter a valid supervisor_name (more than 3 characters)').isLength({ min: 3 }),
    body('supervisor_email', 'supervisor_email address must be valid').isEmail(),
    body('thesis_title', 'Please enter a valid thesis_title').isLength({ min: 3 }),
    body('thesis_abstract', 'Please enter a valid abstract').isLength({ min: 3 }),
    body('thesis_keywords', 'Please enter valid thesis keywords').isLength({ min: 3 }),

], async (req, res) => {
    try {
        const { name, email, roll, supervisor_name, supervisor_email, co_supervisor_name, co_supervisor_email, thesis_title, thesis_abstract, thesis_keywords, thesis, certificate } = req.body;
        //check for validation errors
        const errors = validationResult(req);
        //if errors are present
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        let flg = 0;
        for(let i=0; i<emails.length; i++){
            if(emails[i].localeCompare(supervisor_email)===0 || emails[i].localeCompare(co_supervisor_email)===0 ){
                flg= flg+1;
            }
        }
        if(co_supervisor_email.length === 0) flg++;

        if(flg !== 2){
            return res.status(400).json({ errors: "Supervisor and co supervisor email must be valid " });
        }

        //if errors are empty
        let thesis_existing = await Thesis.find({ email });
        console.log(thesis_existing)
        if (thesis_existing.length !== 0) { await Thesis.findByIdAndDelete(thesis_existing[0]._id) };
        const newthesis = new Thesis({
            name, email, roll, supervisor_name, supervisor_email, co_supervisor_name, co_supervisor_email, thesis_title, thesis_abstract, thesis_keywords, thesis, certificate, approved: 'false'
        })
        const saveThesis = await newthesis.save();
        res.json(saveThesis);

        //enable email alerts to prof
        const mailID = process.env.MAILID;
        const recipent = supervisor_email
        const passwd = process.env.PASSWORD;
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: mailID,
                pass: passwd
            },
            tls: {
                rejectUnauthorized: false
            }
        })

        let mailOptions = {
            from: mailID,
            to: recipent,
            subject: `Thesis Submitted`,
            text: `Dear Professor,
Name : ${name}
Roll : ${roll}
Tittle : ${thesis_title}

has requested for thesis approval.
Please check your portal. You can also see it in the attachment of this mail.`,
            attachments: [
                {
                    filename: 'thesis.pdf',
                    path: thesis
                }
            ]
        }

        transporter.sendMail(mailOptions, function (err, success) {
            if (err) console.log(err)
            else console.log("email sent")
        })
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured. Please see console for further details")
    }

})

//route 2: Get data from mongoDB for professores using POST /api/thesis/view
router.post('/view', async (req, res) => {
    try {
        const email = req.body.email;
        let list = await Thesis.find({ supervisor_email: email });
        res.json(list);
    } catch (error) {
        res.json(error)
    }
})

//route 3: Get data from mongoDB for professores by using email using GET /api/thesis/view
router.get('/view', async (req, res) => {
    try {
        let list = await Thesis.find();
        res.json(list);
    } catch (error) {
        res.json(error)
    }
})

//Route 4: approve a thesis by profs using PUT /api/thesis/approve
router.put('/approve/:id', async (req, res) => {
    let Asthesis = await Thesis.findById(req.params.id);
    var { name, email, roll, supervisor_name, supervisor_email, co_supervisor_name, co_supervisor_email, thesis_title, thesis_abstract, thesis_keywords, thesis, certificate } = Asthesis
    const newthesis = {
        name, email, roll, supervisor_name, supervisor_email, co_supervisor_name, co_supervisor_email, thesis_title, thesis_abstract, thesis_keywords, thesis, certificate, approved: 'true'
    }
    response = await Thesis.findByIdAndUpdate(req.params.id, { $set: newthesis }, { new: true })

    //enable email alerts
    const mailID = process.env.MAILID;
    const recipent = email
    const passwd = process.env.PASSWORD;
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: mailID,
            pass: passwd
        },
        tls: {
            rejectUnauthorized: false
        }
    })

    let mailOptions = {
        from: mailID,
        to: recipent,
        subject: `Thesis Approved`,
        text: `Dear Student,

 Your Thesis titled ${thesis_title} has been approved.
 
 Regards,
 ${supervisor_name}
 Indian Institute of Technology Patna`
    }

    transporter.sendMail(mailOptions, function (err, success) {
        if (err) console.log(err)
        else console.log("email sent")
    })
    res.json(response);
})
module.exports = router;