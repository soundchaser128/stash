import { SceneQueue } from "src/models/sceneQueue";
import * as GQL from "src/core/generated-graphql";
import { useState } from "react";

interface ILightboxProps {
  scenes: GQL.SlimSceneDataFragment[];
  queue?: SceneQueue;
}

const SceneLightbox: React.FC<ILightboxProps> = ({ scenes, queue }) => {
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
  const currentScene = scenes[selectedSceneIndex];

  return (
    <video src={`http://localhost:9999/scene/${currentScene.id}/stream`} />
  );
};

export default SceneLightbox;
