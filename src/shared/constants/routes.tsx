import SignIn from "../../pages/signin";

export const routes = [
  {
    name: "Sign In",
    path: "/login",
    component: <SignIn />,
  },
];

export type routesType = typeof routes;
