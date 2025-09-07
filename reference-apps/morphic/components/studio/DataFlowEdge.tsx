import React from 'react'

import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  useReactFlow,
} from '@xyflow/react'

export function DataFlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
}: EdgeProps) {
  const { setEdges } = useReactFlow()
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })

  // Determine if this edge is actively flowing data
  const isFlowing = data?.isFlowing || false
  const flowData = data?.flowData

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: isFlowing ? 3 : 2,
          stroke: isFlowing ? '#10b981' : '#64748b',
          filter: isFlowing ? 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.5))' : 'none',
        }}
      />

      {/* Animated flow indicator */}
      {isFlowing && (
        <circle r="4" fill="#10b981">
          <animateMotion dur="1s" repeatCount="indefinite">
            <mpath href={`#${id}-path`} />
          </animateMotion>
        </circle>
      )}

      {/* Invisible path for animation */}
      <path
        id={`${id}-path`}
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth="1"
      />

      {/* Data flow label */}
      {flowData && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 10,
              pointerEvents: 'all',
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '2px 4px',
              borderRadius: '3px',
              border: '1px solid #e2e8f0',
              color: '#374151',
              maxWidth: '120px',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
            className="nodrag nopan"
          >
            {typeof flowData === 'string'
              ? flowData.length > 15
                ? `${flowData.slice(0, 15)}...`
                : flowData
              : JSON.stringify(flowData).slice(0, 15) + '...'
            }
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}