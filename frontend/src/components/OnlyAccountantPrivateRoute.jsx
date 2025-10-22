import React from 'react'
import { useSelector } from 'react-redux'
import { Outlet, Navigate } from 'react-router-dom'


export default function OnlyAccountantPrivateRoute() {

    const { currentUser } = useSelector((state) => state.user)

    return currentUser && currentUser.isAccountant ? (<Outlet />) : (<Navigate to='/dashboard-director' />);
}
