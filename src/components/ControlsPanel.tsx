import type { ChangeEvent } from 'react'
import type { GestureConfig } from '../types'

interface ControlsPanelProps {
  config: GestureConfig
  onConfigChange: (config: GestureConfig) => void
  onFileSelect: (file: File) => void
  webcamRunning: boolean
  webcamLoading: boolean
  onStartWebcam: () => void
  onStopWebcam: () => void
}

export function ControlsPanel(props: ControlsPanelProps) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) props.onFileSelect(file)
  }

  return (
    <section className="panel">
      <div className="panel__header">
        <h2>Controls</h2>
        <p>Upload a PDF, calibrate your thresholds, then start the webcam.</p>
      </div>

      <label className="file-input">
        <span>Upload PDF</span>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
      </label>

      <div className="button-row">
        <button onClick={props.onStartWebcam} disabled={props.webcamRunning || props.webcamLoading}>
          {props.webcamLoading ? 'Starting…' : 'Start webcam'}
        </button>
        <button className="button button--secondary" onClick={props.onStopWebcam} disabled={!props.webcamRunning}>
          Stop webcam
        </button>
      </div>

      <div className="field-grid">
        <label>
          <span>Wink threshold</span>
          <input
            type="range"
            min="0.18"
            max="0.5"
            step="0.01"
            value={props.config.winkThreshold}
            onChange={(event) => props.onConfigChange({ ...props.config, winkThreshold: Number(event.target.value) })}
          />
          <strong>{props.config.winkThreshold.toFixed(2)}</strong>
        </label>

        <label>
          <span>Head turn threshold</span>
          <input
            type="range"
            min="0.15"
            max="0.45"
            step="0.01"
            value={props.config.yawThreshold}
            onChange={(event) => props.onConfigChange({ ...props.config, yawThreshold: Number(event.target.value) })}
          />
          <strong>{props.config.yawThreshold.toFixed(2)}</strong>
        </label>

        <label>
          <span>Cooldown (ms)</span>
          <input
            type="range"
            min="500"
            max="2000"
            step="100"
            value={props.config.cooldownMs}
            onChange={(event) => props.onConfigChange({ ...props.config, cooldownMs: Number(event.target.value) })}
          />
          <strong>{props.config.cooldownMs}</strong>
        </label>
      </div>
    </section>
  )
}
