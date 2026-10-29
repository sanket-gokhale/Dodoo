

import React from 'react'
import logo from "../assets/dodoo01.png"
import { FaRegHeart } from "react-icons/fa6";
import dp from "../assets/dp.jpg"
import { useDispatch, useSelector } from "react-redux";
import axios from 'axios';
import { serverUrl } from '../App'
import { setUserData } from '../redux/userSlice';
import OtherUser from './OtherUser';
import {
  Home,
  MessageCircle,
  Users,
  Search,
  User,
  Plus,
  SquarePlay
} from "lucide-react";
import { useNavigate } from "react-router-dom";


function LeftHome() {

  const { userData,suggestedUsers } = useSelector(state => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const handleLogOut = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
      dispatch(setUserData(null))

    } catch (error) {
      console.log(error)
    }
  }



  return (



    


    
    <aside className="w-64 h-screen border-r bg-white px-4 py-6 flex flex-col hidden lg:block ">
         <div className='w-full flex flex-col gap-[20px] p-[20px]'>
          {/* <h1 className='text-[black] text-[19px]'>Suggetion for you</h1>
          {suggestedUsers && suggestedUsers.slice(0,4).map((user,index)=>
          (
            <OtherUser key={index} user={user}/>
          ))} */}
          <div  >
     

     
      
      {/* Logo */}
      <h1 className="text-2xl font-bold text-blue-600 mb-8">
        Dodoo
      </h1>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-1">
        
        {/* Active Item */}
        <NavItem icon={<Home />} text="Home" active />

        <div > <NavItem icon={<MessageCircle />} text="Messages" /> </div>
        <div> <NavItem icon={<SquarePlay />} text="Scrolls" /> </div>
       <div> <NavItem icon={<Search />} text="Search" /> </div>
       <div onClick={()=>navigate(`/profile/${userData.userName}`)}> <NavItem icon={<User />} text="Profile"    /></div>
     
      
 
      {/* Create Post Button */}
      <button className='flex items-center justify-center gap-2
       py-2.5 mt-6 mx-6 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 
       hover:from-purple-700 hover:to-purple-800 active:scale-95 transition text-white cursor-pointer' onClick={()=>navigate("/upload")}>
        <Plus size={20} />
        Create Post
      </button>
            
             </nav>



      <div className='flex items-center w-full justify-between   gap-[10px] px-[10px] border-b-2 border-b-white-900 py-[10px] fixed bottom-0 border-t  -left-1'>
              <div className='flex items-center gap-[10px] items-center'>
                <div className='w-[70px] border-2 border-black rounded-full cursor-pointer overflow-hidden'>
                  <img src={userData.profileImage || dp} alt='' className='w-full object-cover' />
                </div >
                <div >
                  <div className='text-[18px] text-black font-semibold'>{userData.name} </div>
                  <div className='text-[15px] text-[#36454F] charcoal font-semibold'>{userData.userName}</div>
                   
                </div>
              </div>
              <div className='text-red-500 font-bold cursor-pointer '
          onClick={handleLogOut}>Log Out</div>
              
            </div>
           
            

    </aside>

          
  
 


        
          
            

          </div>
         </div>
    </div>
  )
}

export default LeftHome

/* Nav Item Component */
const NavItem = ({ icon, text, active }) => {
  return (
    <div 
   
      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer 
      ${
        active
          ? "bg-blue-50 text-blue-600 font-semibold"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {icon}
      <span>{text}</span>
    </div>
  );
};