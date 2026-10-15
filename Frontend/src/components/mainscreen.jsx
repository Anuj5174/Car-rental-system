import React from "react";
import Spline from "@splinetool/react-spline";
import "../styles/mainscreen.css";

const SplineScene = () => {
  return (
    <div className="spline-wrapper">
      <Spline scene="https://prod.spline.design/tLuRMD2BmYRDbyUh/scene.splinecode" />
    </div>
  );
};

export default SplineScene;