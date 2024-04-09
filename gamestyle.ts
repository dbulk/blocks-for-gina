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
    display: inline-block;
    border: 2px solid;
    border-radius: 8px;
    height: 100%;
    position: relative;
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
}
`;

export default styleElement;
