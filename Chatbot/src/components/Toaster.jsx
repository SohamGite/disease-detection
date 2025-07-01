import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// const FaustAPI expects you to be logged in to perform this action.

const Toast = () => {
  return (
    <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
  );
};

export default Toast;
