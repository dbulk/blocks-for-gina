
const styleElement = document.createElement("style");
styleElement.textContent = `  
.blocks4Gina canvas {
  border: 1px solid;
}
.blocks4Gina button {
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

.blocks4Gina button:hover {
  background-color: #777;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

.blocks4Gina button:active {
  background-color: #444;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.blocks4Gina button.toggle:hover {
    background-color: #777;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }
  
  .blocks4Gina button.toggle:active {
    background-color: #444;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  .blocks4Gina button.toggle.active {
    background-color: #0089b3;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
  .blocks4Gina h1 {
    color: #fff;
    margin: 10px 10px;
    font-size: 18px;
    font-family: Helvetica, Arial, Sans-Serif;
  }

  .blocks4Gina p {
    color: #fff;
    margin: 0 10px;
    font-size: 14px;
    font-family: Helvetica, Arial, Sans-Serif;
  }
  .blocks4Gina a {
    color: #dff;
  }
`;

export default styleElement;