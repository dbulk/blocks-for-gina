const styleElement = document.createElement('style');
styleElement.textContent = `  
.blocks4Gina { 
  
  font-family: Helvetica, Arial, Sans-Serif;
  canvas {
    border: 1px solid;
  }
  button {
    background-color: #555;
    border: none;
    color: #fff;
    padding: 15px 18px;
    text-align: center;
    display: inline-block;
    font-size: 16px;
    margin: 2px 2px;
    cursor: pointer;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    line-height: 16px;
  }
  button:hover {
    background-color: #777;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }
    
  button:active {
    background-color: #444;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  button:disabled,
  button[disabled]{
    background-color: #888;
    color: #aaa;
    box-shadow: 0 0 0;
  }

  button.toggle:hover {
    background-color: #777;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }

  button.toggle:active {
    background-color: #444;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  button.toggle.active {
    background-color: #0089b3;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .ui-toolbar {
    display: flex;
    padding-top: 10px;
    flex-wrap: wrap;
    flex-shrink: 1;
    gap: 4px;
    align-items: flex-start;
  }

  span {
    color: #fff;
    font-size: 22px;
    user-select: none;
  }

  span.selected {
    color: #0089b3;
    font-size: 22px;
    user-select: none;
  }

  p {
    color: #fff;
    margin: 2px 10px;
    font-size: 14px;
  }
  a {
    color: #dff;
  }

  div.settings-expandy {
    color: #0089b3;
    display: inline-flex;
    flex-direction: column;
    gap: 6px;
    border: 2px solid;
    border-radius: 8px;
    height: 100%;
    position: relative;
    padding: 8px;
    margin-top: 4px;
    min-width: 320px;
  }

  .settings-panel {
    background-color: rgba(0, 0, 0, 0.2);
  }

  .settings-section {
    border: 1px solid rgba(0, 137, 179, 0.65);
    border-radius: 8px;
    padding: 8px;
    background-color: rgba(0, 0, 0, 0.12);
  }

  .settings-section-title {
    color: #d5f4ff;
    font-size: 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 6px;
    user-select: none;
  }

  .settings-section-body {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .settings-row {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: nowrap;
    gap: 8px;
  }

  .settings-row-wrap {
    flex-wrap: wrap;
  }

  .settings-row-inline {
    gap: 6px;
  }

  .settings-row-grid {
    display: grid;
    grid-template-columns: repeat(2, max-content);
    gap: 10px;
    justify-content: start;
    align-items: end;
  }

  .settings-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  input.settings-number {
    width: 80px;
  }

  input.settings-range {
    width: 140px;
  }

  .settings-colors {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 2px;
  }

  .settings-section label {
    padding: 0;
    font-size: 14px;
    min-width: 0;
  }
  input[type=number] {
    background-color: #555;
    border: none;
    color: #fff;
    padding: 10px 0px;
    text-align: center;
    display: inline-block;
    font-size: 16px;
    margin: 4px 2px;
    border-radius: 8px;
    line-height: 16px;
  }
  input[type=number]:hover {
    background-color: #777;
  }
  input[type=number]:focus {
    outline: 2px solid #0089b3;
    background-color: #777;
  }
  label {
    color: #fff;
    font-size: 16px;
    padding: 15px 2px 15px 18px;
  }

  input[type="color"] {
    background-color: #777;
    height: 24px;
    width: 24px;
    border-radius: 24px;
    border: 1px solid #0089b3;
    box-sizing: content-box;
    margin: 0px 1px;
  }

  button.settings-mini {
    padding: 8px 10px;
    font-size: 13px;
    line-height: 1.2;
    margin: 0;
  }

  button.settings-primary {
    background-color: #0089b3;
  }

  button.settings-primary:hover {
    background-color: #1aaad8;
  }

  button.settings-primary:active {
    background-color: #00779d;
  }

  span.cluster-value {
    color: #d5f4ff;
    font-size: 13px;
    margin-left: 8px;
    user-select: none;
    min-width: 38px;
    text-align: right;
  }

  .start-overlay-backdrop {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    box-sizing: border-box;
    background-color: rgba(0, 0, 0, 0.2);
    overflow: auto;
  }

  .start-overlay {
    position: relative;
    width: min(100%, 900px);
    max-height: 100%;
    overflow: auto;
    padding: 14px;
    border: 2px solid #0089b3;
    border-radius: 12px;
    background-color: rgba(0, 0, 0, 0.35);
    box-sizing: border-box;
  }

  .start-overlay-title {
    margin: 0;
    text-align: center;
    color: #d5f4ff;
    font-size: clamp(28px, 4.8vw, 46px);
    line-height: 1.1;
    text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  }

  .start-overlay-subtitle {
    margin: 10px auto 0 auto;
    max-width: 56ch;
    text-align: center;
    color: #fff;
    font-size: clamp(14px, 2vw, 18px);
    line-height: 1.35;
    opacity: 0.95;
  }

  button.start-overlay-play {
    margin: 80px auto;
    display: block;
    min-width: 150px;
    padding-top: 16px;
    padding-bottom: 16px;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.04em;
    background-color: #0089b3;
  }

  button.start-overlay-play:hover {
    background-color: #1aaad8;
  }

  button.start-overlay-play:active {
    background-color: #00779d;
  }

  .start-overlay-meta-grid {
    margin-top: 14px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    user-select: none;
  }

  .start-overlay-meta-card {
    border: 1px solid #0089b3;
    border-radius: 8px;
    padding: 10px;
    background-color: rgba(0, 0, 0, 0.2);
    min-height: 120px;
  }

  .start-overlay-meta-card h2 {
    margin: 0 0 6px 0;
    color: #d5f4ff;
    font-size: 15px;
  }

  .start-overlay-meta-card p {
    margin: 2px 0;
    font-size: 13px;
    line-height: 1.3;
  }

  @media (max-width: 900px) {
    .start-overlay {
      padding: 12px;
    }

    .start-overlay-meta-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    div.settings-expandy {
      min-width: 0;
      width: 100%;
    }

    .settings-row {
      flex-wrap: wrap;
      gap: 6px;
    }

    .settings-row-grid {
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .settings-section label {
      min-width: 0;
      width: 100%;
    }

    input.settings-number,
    input.settings-range {
      width: 100%;
      max-width: 220px;
    }

    .start-overlay-backdrop {
      padding: 8px;
    }

    .start-overlay {
      padding: 10px;
    }

    .start-overlay-subtitle {
      margin-top: 8px;
    }

    .start-overlay-meta-grid {
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .start-overlay-meta-card {
      min-height: auto;
    }
  }
}
`;

export default styleElement;
