import apple from "./icons/applesvg.svg";
import canal from "./icons/canal.svg";
import disney from "./icons/disney.svg";
import france from "./icons/france.svg";
import netflix from "./icons/netflix.svg";
import ocs from "./icons/ocs.svg";
import prime from "./icons/prime.svg";
import rakuten from "./icons/rakuten.svg";
import tf1 from "./icons/tf1.svg";
const itemSize = 120;
export default function Land() {
  return (
    <div
      style={{ fontFamily: "Poetsen One" }}
      className="flex items-center justify-center h-screen w-screen"
    >
      <div>
        <div className="text-6xl mb-44">Une Platform Pas comme les autres</div>
        <div>
          <div className="text-6xl text-center flex justify-center">
            Toutes ces platformes en 1 endroit
          </div>
          <div className="flex justify-center m-4">
            {[
              apple,
              canal,
              disney,
              france,
              netflix,
              ocs,
              prime,
              rakuten,
              tf1,
            ].map((item, index) => (
              <img src={item} className="ml-4" width={itemSize} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
