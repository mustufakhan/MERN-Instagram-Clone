import React, {useState,useContext}  from 'react'
import {Link, useHistory} from 'react-router-dom'
import M from 'materialize-css'
import {UserContext} from '../../App'
const Login = () => {
	const {state, dispatch} = useContext(UserContext)
	const history = useHistory()
	const [password, setpassword] = useState("")
	const [email, setemail] = useState("")

	const PostData = () => {
		if(!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)){
			M.toast({html: "invalid email",classes:"#c62828 red darken-3"})
			return
	}
		fetch("/signin",{
			method:"post",
			headers:{
				"Content-Type":"application/json"
			},
			body: JSON.stringify({
				password,
				email
			})
		}).then(res=>res.json())
			.then(data=>{
				console.log({data})
				if(data.error){
					M.toast({html: data.error, classes:"#ef9a9a red lighten-3"})
				}
				else{
					localStorage.setItem("jwt",data.token)
					localStorage.setItem("user",JSON.stringify(data.user))
					dispatch({type:"USER", payload:data.user})
					M.toast({html: "Signedin success", classes:"#4caf50 green"})
					history.push('/')
				}
			})
	}
	return(
		<div className="mycard">
			<div className="card auth-card">
				<h2>Instagram</h2>
				<input type='text' placeholder='email' value={email} onChange={(e)=>setemail(e.target.value)} />
				<input type='password' placeholder='password' value={password} onChange={(e)=>setpassword(e.target.value)}/>
				<button className="btn waves-effect waves-light" onClick={()=>{PostData()}}>
					Login
				</button>
				<h5>
				<Link to='/signup'>Dont have an account ?</Link>
				</h5>
				<h6>
                <Link to="/reset" style={{color:"red"}}>Forgot password ?</Link>
            </h6>
      </div>
		</div>
	)
}
export default Login