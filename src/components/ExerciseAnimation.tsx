import React from 'react';
import Biomechanical3DViewer from './Biomechanical3DViewer';

interface Props {
  type: string;
}

export default function ExerciseAnimation({ type }: Props) {
  return (
    <div className="w-full h-full relative" id="biomechanical-3d-wrapper">
      <Biomechanical3DViewer exerciseName={type} isRest={type === 'Rest'} />
    </div>
  );
}
