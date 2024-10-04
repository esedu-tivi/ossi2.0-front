// import React, { createContext, useState, useEffect } from 'react';
// import { IUser } from '../interfaces/IUser';
// // Import MSAL or your auth library to fetch user data

// interface IUserContext {
//   user: IUser | null;
// }

// export const UserContext = createContext<IUserContext>({ user: null });

// export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<IUser | null>(null);

//   useEffect(() => {
//     // Fetch user data from MSAL or your auth provider
//     // For example, using MSAL:
//     // const account = msalInstance.getActiveAccount();
//     // if (account) {
//     //   setUser({
//     //     id: account.homeAccountId,
//     //     name: account.name,
//     //     email: account.username,
//     //     role: 'student', // Assign role based on your logic
//     //   });
//     // }

//     // Placeholder user data
//     setUser({
//       id: '12345',
//       name: 'Jane Doe',
//       email: 'jane.doe@example.com',
//       role: 'student',
//     });
//   }, []);

//   return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
// };
