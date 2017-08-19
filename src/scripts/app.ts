import "../styles/base.scss";

import { Greeter } from "./greeter";

export const greeter: Greeter = new Greeter("dr-chrono-client");

const el = document.getElementById("greeting");
if (el) {
  el.innerHTML = greeter.greet();
}
