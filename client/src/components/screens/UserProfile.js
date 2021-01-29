import React,{useEffect, useState, useContext} from 'react'
import {UserContext} from '../../App'
import {useParams} from 'react-router-dom'

const UserProfile = () => {
	const [UserProfile, setProfile] = useState(null)
		const {state, dispatch} = useContext(UserContext)
		const {userId} = useParams()
		const [showfollow,setShowFollow] = useState(state?!state.following.includes(userId):true)
	useEffect(()=>{
		fetch(`/user/${userId}`,{
			headers:{
				"Authorization": "Bearer "+localStorage.getItem("jwt")
			}
		}).then(res=>res.json())
		.then(result=>{
			console.log(result)
			setProfile(result)
		})
	},[])

	const followUser = ()=>{
		fetch('/follow',{
				method:"put",
				headers:{
						"Content-Type":"application/json",
						"Authorization":"Bearer "+localStorage.getItem('jwt')
				},
				body:JSON.stringify({
						followId:userId
				})
		}).then(res=>res.json())
		.then(data=>{
		
				dispatch({type:"UPDATE",payload:{following:data.following,followers:data.followers}})
				 localStorage.setItem("user",JSON.stringify(data))
				 setProfile((prevState)=>{
						 return {
								 ...prevState,
								 user:{
										 ...prevState.user,
										 followers:[...prevState.user.followers,data._id]
										}
						 }
				 })
				 setShowFollow(false)
		})
}
const unfollowUser = ()=>{
		fetch('/unfollow',{
				method:"put",
				headers:{
						"Content-Type":"application/json",
						"Authorization":"Bearer "+localStorage.getItem('jwt')
				},
				body:JSON.stringify({
						unfollowId:userId
				})
		}).then(res=>res.json())
		.then(data=>{
				
				dispatch({type:"UPDATE",payload:{following:data.following,followers:data.followers}})
				 localStorage.setItem("user",JSON.stringify(data))
				
				 setProfile((prevState)=>{
						const newFollower = prevState.user.followers.filter(item=>item != data._id )
						 return {
								 ...prevState,
								 user:{
										 ...prevState.user,
										 followers:newFollower
										}
						 }
				 })
				 setShowFollow(true)
				 
		})
}
	return(
        <> {UserProfile ? 
            <div style={{maxWidth:'550px', margin:"0px auto"}}>
			<div style={{display:'flex', justifyContent:'space-around', margin:'18px 0px', borderBottom:"1px solid grey"}}>
				<div>
				<img style={{width:"160px",height:"160px",borderRadius:"80px"}}
					src={UserProfile.user.pic}
					/>
				</div>
				<div>
					<h4>{UserProfile.user.name}</h4>
					<div style={{display:"flex",justifyContent:"space-between",width:"108%"}}>
						<h6>{UserProfile.posts.length} posts</h6>
						<h6>{UserProfile.user.followers.length} followers</h6>
						<h6>{UserProfile.user.following.length} following</h6>
					</div>
					{showfollow?
					<button style={{
							margin:"10px"
					}} className="btn waves-effect waves-light #64b5f6 blue darken-1"
					onClick={()=>followUser()}
					>
							Follow
					</button>
					: 
					<button
					style={{
							margin:"10px"
					}}
					className="btn waves-effect waves-light #64b5f6 blue darken-1"
					onClick={()=>unfollowUser()}
					>
							UnFollow
					</button>
					}
                   
  				</div>
			</div>
			<div className="gallery">
				{
					UserProfile.posts.map((item)=>{
						return(
							<img className="item" src={item.photo} alt={item.title}/>
						)
					})
				}
			</div>
		</div>

        : <h4>Loading ...</h4>}
        </>
	)
}
export default UserProfile