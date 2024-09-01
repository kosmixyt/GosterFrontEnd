import { useEffect, useRef } from "react";
import React from "react";
import { app_url } from "..";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Card } from "primereact/card";
import { Panel } from "primereact/panel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Fieldset } from "primereact/fieldset";
import "primereact/resources/themes/bootstrap4-dark-blue/theme.css";

export const LoginComp = (props: {}) => {
  const Input = useRef<HTMLInputElement>(null);
  const nav = useNavigate();
  const [visible, setVisible] = React.useState(true);
  const connect = () => {
    fetch(app_url + `/login?uuid=${Input.current?.value}`, {
      credentials: "include",
    }).then((res) => {
      res.json().then((data) => {
        console.log(data);
        if (data.error) {
          toast.error(data.error);
        } else {
          nav("/");
        }
      });
    });
  };
  return (
    <div
      style={{ height: "100vh" }}
      className="flex justify-center items-center"
    >
      <Card title="Authentification">
        <h3>Disclaimer</h3>
        <Fieldset legend="Disclaimer">
          Ce site associe un film à un torrent et les télécharge / stream sur
          des serveurs hébergé par @guy@. il ne cherche en aucun cas à "faire"
          de l'argent.
          <br />
          Les données sont stocké sur un serveur privé et ne sont pas partagé,
          vendu ou utilisé à des fins commerciales.
          <br />
          L'algorithme de recommendation est basé sur la popularité et sur vos
          derniers médias visionné.
          <br />
          Si ce site perce son modèle economique sera l'autosufisance.
          <br />
          Il cherche un équilibre entre la qualité, la quantité et
          l'accessibilité.
          <br />
          Merci de ne pas partager le token de connection.
          <br />
          !! Merci de ne pas télécharger de média issue de petites productions
          !!
          <br />
          0 pubs sur tout le site
          <br />
        </Fieldset>
        <br />
        <br />
        <br />
        <div className="centered">
          <InputText
            tooltipOptions={{ position: "top" }}
            tooltip="Token De connection donné par l'admin"
            placeholder="Token "
            ref={Input}
          />{" "}
          &nbsp;
          <Button label="Connect" onClick={connect} />
        </div>
      </Card>
    </div>
  );
};

{
}
