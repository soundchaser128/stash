import { SceneQueue } from "src/models/sceneQueue";
import * as GQL from "src/core/generated-graphql";
import { useRef, useState } from "react";
import ScenePlayer from "../ScenePlayer/ScenePlayer";
import { useFindScene } from "src/core/StashService";
import { useTransition } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";

interface ILightboxProps {
  scenes: GQL.SlimSceneDataFragment[];
  queue?: SceneQueue;
}

const SceneLightbox: React.FC<ILightboxProps> = ({ scenes }) => {
  const [index, setIndex] = useState(0);
  const _setTimestamp = useRef<(value: number) => void>();
  const { data, loading, error } = useFindScene(scenes[index].id);
  const currentScene = data?.findScene;
  const [direction, setDirection] = useState(1);

  const nextItem = async () => {
    let nextIndex = index + 1;
    setIndex(nextIndex);
    setDirection(1);
    // onItemChange && onItemChange(nextIndex);
  };

  const previousItem = async () => {
    let nextIndex = index - 1;

    if (nextIndex < 0) {
      // await onPreviousPage();
      // nextIndex = PER_PAGE - 1;
    }
    setIndex(nextIndex);
    setDirection(-1);
    // onItemChange && onItemChange(nextIndex);
  };

  const transitions = useTransition(index, {
    from: { transform: `translateY(${direction === 1 ? "100%" : "-100%"})` },
    enter: { transform: "translateY(0%)" },
    leave: { transform: `translateY(${direction === 1 ? "-100%" : "100%"})` },
    config: {
      friction: 15,
      tension: 100,
    },
  });

  const bind = useDrag((props) => {
    const [, swipeY] = props.swipe;
    if (swipeY === -1) {
      nextItem();
    } else if (swipeY === 1) {
      previousItem();
    }
  });

  function getSetTimestamp(fn: (value: number) => void) {
    _setTimestamp.current = fn;
  }

  if (error) {
    throw error;
  }

  if (!currentScene || loading) {
    return null;
  }

  return (
    <div {...bind()}>
      {transitions((style, idx) => (
        <ScenePlayer
          scene={scenes[idx]}
          hideScrubberOverride
          initialTimestamp={0}
          onComplete={() => setIndex((i) => i + 1)}
          sendSetTimestamp={getSetTimestamp}
          onNext={() => setIndex((i) => i + 1)}
          onPrevious={() => setIndex((i) => i - 1)}
        />
      ))}
    </div>
  );
};

export default SceneLightbox;
