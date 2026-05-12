"use client";
import React, { useState } from "react";
import ToggleButton from "../../../components/buttons/ToggleButton";
import Colors from "./Colors";
import SoundSettings from "./SoundSettings";

const Customization = () => {
  const [tab, setTab] = useState("COLORS");

  return (
    <div className="page-wrapper space-y-4 h-full flex flex-col items-start">
      <ToggleButton
        variant="layout"
        options={["COLORS", "SOUND"]}
        value={tab}
        onChange={setTab}
      />
      {tab === "COLORS" ? <Colors /> : <SoundSettings />}
    </div>
  );
};

export default Customization;
