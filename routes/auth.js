const express = require('express')
const mongoose = require('mongoose')
const User = mongoose.model("User")
const router = express.Router()
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('../config/keys')
const requirelogin = require('../middleware/requirelogin')
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport');
const {SENDGRID_API,EMAIL} = require('../config/keys')

const transporter = nodemailer.createTransport(sendgridTransport({
    auth:{
        api_key:SENDGRID_API
    }
}))

router.post('/signup',(req,res)=>{
	const {name, email, password,pic} = req.body
	if(!email || !name || !password){
		res.status(422).json({error:"please add all details"})
	}
	User.findOne({email:email})
	.then((savedUser)=>{
		if(savedUser){
			res.status(422).json({error:"user already exits"})
		}
		bcrypt.hash(password, 12)
		.then(hash=>{
			const user = new User({
				email,
				name,
				password:hash,
				pic
			})
			user.save()
			.then(user=>{
				// transporter.sendMail({
                //     to:user.email,
                //     from:"no-reply@insta.com",
                //     subject:"signup success",
                //     html:"<h1>welcome to instagram</h1>"
                // })
				res.json({message:"saved successfully"})
			})
			.catch(err=>{
				console.log(err)
			})
		})
	})
	.catch(err=>{
		console.log(err)
	})
})

router.post('/signin',(req,res)=>{
	const {email, password} = req.body
	if(!email || !password){
		return res.status(422).json({error:"please add email or password"})
	}
	User.findOne({email:email})
	.then(savedUser=>{
		if(!savedUser){
			return res.status(422).json({error:"invalid email or password"})
			
		}
		bcrypt.compare(password, savedUser.password)
		.then(domatch=>{
			if(domatch){
				// res.json({mes/sage:"succesfully signed in"})
				const token = jwt.sign({_id:savedUser._id},JWT_SECRET)
				const {_id, name, email,followers,following,pic} = savedUser
				res.json({token, user:{_id, name, email,followers,following,pic}})
			}
			else{
				return res.status(422).json({error:"invalid email or password"})
			}
		})
		.catch(err=>{
			console.log(err)
		})
	})
})

router.post('/reset-password',(req,res)=>{
	crypto.randomBytes(32,(err,buffer)=>{
		if(err){
			console.log(err)
		}
		const token = buffer.toString("hex")
		User.findOne({email:req.body.email})
		.then(user=>{
			if(!user){
				return res.status(422).json({error:"User dont exists with that email"})
			}
			user.resetToken = token
			user.expireToken = Date.now() + 3600000
			user.save().then((result)=>{
				transporter.sendMail({
					to:user.email,
					from:"mohd.mustufa@adwaretech.com",
					subject:"password reset",
					html:`
					<p>You requested for password reset</p>
					<h5>click in this <a href="${EMAIL}/reset/${token}">link</a> to reset password</h5>
					`
				})
				res.json({message:"check your email"})
			})

		})
	})
})

router.post('/new-password',(req,res)=>{
    const newPassword = req.body.password
    const sentToken = req.body.token
    User.findOne({resetToken:sentToken,expireToken:{$gt:Date.now()}})
    .then(user=>{
        if(!user){
            return res.status(422).json({error:"Try again session expired"})
        }
        bcrypt.hash(newPassword,12).then(hashedpassword=>{
           user.password = hashedpassword
           user.resetToken = undefined
           user.expireToken = undefined
           user.save().then((saveduser)=>{
               res.json({message:"password updated success"})
           })
        })
    }).catch(err=>{
        console.log(err)
    })
})
module.exports = router