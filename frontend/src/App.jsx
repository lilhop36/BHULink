import React, { useEffect, useState } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Posts from "./pages/Posts";
import Error from "./pages/Error";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Provider, useDispatch, useSelector } from "react-redux";
import store from "./redux/store";
import ProfileDetail from "./components/ProfileDetail";
import Loading from "./components/loading/Loading";
import GroupChatBox from "./components/chatComponents/GroupChatBox";
import EnhancedNotificationBox from "./components/EnhancedNotificationBox";
import Reels from "./pages/Reels";
import FacultyResources from "./components/FacultyResources";
// Import the new dashboards
import AdminDashboard from "./pages/Admin";
import FacultyDashboard from "./pages/Faculty";

const Applayout = () => {
    const [toastPosition, setToastPosition] = useState("bottom-left");
    const isProfileDetails = useSelector(
        (store) => store.condition.isProfileDetail
    );
    const isGroupChatBox = useSelector(
        (store) => store.condition.isGroupChatBox
    );
    const isNotificationBox = useSelector(
        (store) => store.condition.isNotificationBox
    );
    const isLoading = useSelector((store) => store.condition.isLoading);
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 600) {
                setToastPosition("bottom-left");
            } else {
                setToastPosition("top-left");
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);
    return (
        <div>
            <ToastContainer
                position={toastPosition}
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                stacked
                limit={3}
                toastStyle={{
                    border: "1px solid #dadadaaa",
                    textTransform: "capitalize",
                }}
            />
            <Header />
            <div className="h-16 md:h-20"></div>
            <div className="min-h-[85vh] p-2 sm:p-4 bg-gradient-to-tr to-black via-blue-900 from-black">
                <Outlet />
                {isProfileDetails && <ProfileDetail />}
                {isGroupChatBox && <GroupChatBox />}
                {isNotificationBox && <EnhancedNotificationBox />}
            </div>
            {isLoading && <Loading />}
            <Footer />
        </div>
    );
};

const routers = createBrowserRouter([
    {
        path: "/",
        element: <Applayout />,
        children: [
            {
                path: "/",
                element: <Landing />,
            },
            {
                path: "/home",
                element: <Home />,
            },
            {
                path: "/landing",
                element: <Landing />,
            },
            {
                path: "/dashboard",
                element: <Dashboard />,
            },
            {
                path: "/posts",
                element: <Posts />,
            },
            {
                path: "/reels",
                element: <Reels />,
            },
            {
                path: "/resources",
                element: <FacultyResources />,
            },
            {
                path: "/signup",
                element: <SignUp />,
            },
            {
                path: "/signin",
                element: <SignIn />,
            },
            {
                path: "*",
                element: <Error />,
            },
        ],
        errorElement: <Error />,
    },
    // New standalone routes for dashboards (no Header/Footer)
    {
        path: "/admin",
        element: <AdminDashboard />,
    },
    {
        path: "/faculty",
        element: <FacultyDashboard />,
    },
]);

function App() {
    return (
        <Provider store={store}>
            <RouterProvider router={routers} />
        </Provider>
    );
}

export default App;