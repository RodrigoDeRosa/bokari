import { Controls } from "reactflow";

export default ({saveToLocalStorage, resetGraph}) => {
  return (
    <aside>
      <div>
        <h2>How to use</h2>
        <h4>
          You can create new nodes by dragging them from the right pane to the
          center.
        </h4>
        <h4>You can edit them by clicking on their fields.</h4>
        <h4>
          To connect them, click on the parent's bottom connector (the black
          one) and drag the edge to the child's top connector (the white one).
        </h4>
      </div>
      <Controls showFitView={false} showZoom={false} showInteractive={false}>
        <button className="control-button save" onClick={saveToLocalStorage}>Save</button>
        <button className="control-button reset" onClick={resetGraph}>Reset</button>
      </Controls>
    </aside>
  );
};
