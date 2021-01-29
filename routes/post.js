const express = require('express')
const mongoose = require('mongoose')
const Post = mongoose.model("Post")
const router = express.Router()
const requirelogin = require('../middleware/requirelogin')

// router.get('/allpost',requirelogin,(req,res)=>{
// 	Post.find()
// 	.populate('postedBy',"_id name")
// 	.populate('comments.postedBy',"_id name")
// 	.then(posts=>{
// 		res.json({posts})
// 	})
// 	.catch(err=>{
// 		console.log(err)
// 	})
// })
router.get('/allpost',requirelogin,(req,res)=>{
    Post.find()
    .populate("postedBy","_id name pic")
    .populate("comments.postedBy","_id name pic")
    .sort('-createdAt')
    .then((posts)=>{
        res.json({posts})
    }).catch(err=>{
        console.log(err)
    })  
})

router.get('/getsubpost',requirelogin,(req,res)=>{

    // if postedBy in following
    Post.find({postedBy:{$in:req.user.following}})
    .populate("postedBy","_id name pic")
    .populate("comments.postedBy","_id name pic")
    .sort('-createdAt')
    .then(posts=>{
        res.json({posts})
    })
    .catch(err=>{
        console.log(err)
    })
})
router.post('/createpost', requirelogin, (req,res)=>{
	const {title, body, pic} = req.body
	if(!title || !body || !pic){
		return res.status(422).json({error:"please add all the field"})
	}
	req.user.password = undefined
	const post = new Post({
		title,
		body,
		photo:pic,
		postedBy:req.user
	})
	post.save().then(result=>{
		res.json({post:result})
	})
	.catch(err=>{
		console.log(err)
	})
})

router.get('/mypost',requirelogin,(req,res)=>{
    Post.find({postedBy:req.user._id})
    .populate("PostedBy","_id name pic")
    .then(mypost=>{
        res.json({mypost})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.put('/like',requirelogin,(req,res)=>{
	Post.findByIdAndUpdate(req.body.postId,{
		$push:{likes:req.user._id}
	},{
		new:true
	}).exec((err,result)=>{
		if(err){
			return res.status(422).json({error:err})
		}else{
			res.json(result)
		}
	})
})

router.put('/unlike',requirelogin,(req,res)=>{
	Post.findByIdAndUpdate(req.body.postId,{
		$pull:{likes:req.user._id}
	},{
		new:true
	}).exec((err,result)=>{
		if(err){
			return res.status(422).json({error:err})
		}else{
			res.json(result)
		}
	})
})

// router.put('/comment',requirelogin,(req,res)=>{
// 	const comment = {
// 		text:req.body.text,
// 		postedBy:req.user._id
// 	}
// 	Post.findByIdAndUpdate(req.body.postId,{
// 		$push:{comments:comment}
// 	},{
// 		new:true
// 	}).populate("comment.postedBy","_id name")
// 	.populate("postedBy","_id name")
// 	.exec((err,result)=>{
// 		if(err){
// 			return res.status(422).json({error:err})
// 		}else{
// 			res.json(result)
// 		}
// 	})
// })
router.put('/comment',requirelogin,(req,res)=>{
    const comment = {
        text:req.body.text,
        postedBy:req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{comments:comment}
    },{
        new:true
    })
    .populate("comments.postedBy","_id name pic")
    .populate("postedBy","_id name pic")
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            res.json(result)
        }
    })
})

router.delete('/deletepost/:postId',requirelogin,(req,res)=>{
    Post.findOne({_id:req.params.postId})
    .populate("postedBy","_id")
    .exec((err,post)=>{
        if(err || !post){
            return res.status(422).json({error:err})
        }
        if(post.postedBy._id.toString() === req.user._id.toString()){
              post.remove()
              .then(result=>{
                  res.json(result)
              }).catch(err=>{
                  console.log(err)
              })
        }
    })
})

module.exports = router