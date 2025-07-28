import React, { useEffect } from "react";
import { IsLogged } from "../../Redux/slices/Log";
import { useSelector, useDispatch } from "react-redux";
const Auth = ({children}) => {
  const userState = useSelector((state) => state);
  return <>{userState.IsLogged ? <h1>Login Please</h1> : children}</>;
};

export default Auth;
