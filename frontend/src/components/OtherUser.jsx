import React from 'react'


import dp from "../assets/dp.jpg"
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function OtherUser({ user }) {
    const { userData } = useSelector(state => state.user)
    const navigate=useNavigate()
    return (
        <div className='w-full h-[70px] flex items-center justify-between border-b-2 border-gray-800'>

            <div className='flex items-center gap-[10px]'>
                <div className='w-[50px] h-[50px] border-2 border-black rounded-full cursor-pointer overflow-hidden'
                onClick={()=>navigate(`/profile/${user.userName}`)}>
                    <img src={user.profileImage || dp} alt='' className='w-full object-cover' />
                </div >
                <div >
                    <div className='text-[18px] text-black font-semibold'>{user.name} </div>
                    <div className='text-[15px] text-[#36454F] font-semibold'>{user.userName}</div>
                </div>
                
            </div>
            <button className='px-[10px] w-[100px] py-[px] h-[40px] bg-[black] text-white rounded-4xl'>follow</button>
        </div>
    )
}

export default OtherUser