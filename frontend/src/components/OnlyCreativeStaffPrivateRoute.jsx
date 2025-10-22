import React from 'react'
import { useSelector } from 'react-redux'
import { Outlet, Navigate } from 'react-router-dom'


export default function OnlyCreativeStaffPrivateRoute() {

    const { currentUser } = useSelector((state) => state.user)

    return currentUser && currentUser.isCreativeStaff ? (<Outlet />) : (<Navigate to='/dashboard-director' />);
}
