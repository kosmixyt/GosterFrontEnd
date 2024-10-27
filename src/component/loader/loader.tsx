import "./loader.css";
import faucille from "./faucille.svg";
import marteau from "./marteau.svg";
import { createPortal } from "react-dom";
import { useEffect } from "react";
import { SpinnerInfinity } from "spinners-react";
const animationDuration = 1.5;

export function Loader() {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  return createPortal(
    <div
      className="
    absolute
    w-screen
    h-full
    flex justify-center items-center

    "
    >
      <SpinnerInfinity color="black" secondaryColor="white" size={100} />
    </div>,
    document.body
  );
}
