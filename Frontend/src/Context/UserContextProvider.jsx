import React, { useState } from "react";
import UserContext from "./UserContext.jsx";

const UserContextProvider = ({children}) => {
    const [isLogged,SetIsLogged]=useState(false);
    return (
        <UserContext.Provider value={{isLogged,SetIsLogged}}>
            {children}
        </UserContext.Provider>
    )
}

export default UserContextProvider;