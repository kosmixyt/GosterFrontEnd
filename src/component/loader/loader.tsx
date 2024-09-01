import "./loader.css";
//@ts-ignore
import faucille from "./faucille.svg";
//@ts-ignore
import marteau from "./marteau.svg";
import { createPortal } from "react-dom";
import { useEffect } from "react";
const animationDuration = 1.5;

export function Loader() {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const startScroll = window.scrollY;
    window.scrollTo(0, 0);
    setTimeout(() => {
      window.scrollTo(0, startScroll);
      document.body.style.overflow = "auto";
    }, animationDuration * 1000);
  }, [])
  return (
    createPortal(
      <div className="main">
        <div className="cen">
          <img className="fau ig" src={faucille} />
          <img className="mar ig" src={marteau} />
        </div>
      </div>, document.body)
  );
}
