import React from "react";
import "./top.css";
import { SKINNY_RENDER } from "../poster";
import { Swiper, SwiperSlide } from "swiper/react";

export type TopProps = SKINNY_RENDER & { number: number };

export class TopElement extends React.Component<TopProps> {
  constructor(props: TopProps) {
    super(props);
  }
  render(): React.ReactNode {
    return (
      <div className="top-el">
        <img src={this.props.POSTER} alt={this.props.NAME} className="top-img" />
      </div>
    );
  }
}

export const TopRender = (props: { top: SKINNY_RENDER[] }): React.ReactNode => {
  return (
    <Swiper>
      <div className="top">
        {props.top.map((v, i) => (
          <SwiperSlide>
            <TopElement key={i} {...v} number={i + 1} />
          </SwiperSlide>
        ))}
      </div>
    </Swiper>
  );
};
