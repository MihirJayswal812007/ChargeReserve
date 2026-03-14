"use client"

import { useEffect, useState } from "react"

export function ProgressRing({ progress, strokeWidth = 8, radius = 60 }: { progress: number, strokeWidth?: number, radius?: number }) {

  const normalizedRadius = radius - strokeWidth * 2
  const circumference = normalizedRadius * 2 * Math.PI

  const offset = circumference - (progress / 100) * circumference

  return (
    <svg
      height={radius * 2}
      width={radius * 2}
      className="transform -rotate-90"
    >
      <circle
        stroke="currentColor"
        fill="transparent"
        strokeWidth={strokeWidth}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        className="text-muted"
      />
      <circle
        stroke="currentColor"
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference + " " + circumference}
        style={{ strokeDashoffset: offset }}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        className="text-primary transition-all duration-500 ease-in-out"
      />
    </svg>
  )
}
