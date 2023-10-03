export default ({ saveToLocalStorage, resetGraph }) => {
  return (
    <aside>
      <div>
        <h2>What is Bokari?</h2>
        <p>
          Bokari is a personal finance tool inspired by the Zero-Based Budgeting principle. 
          Start with your total budget as the root of a tree and allocate portions to various 
          expenses, visualizing your financial plan. Each node represents a budget category 
          with a name and value, and different node types offer varied functionalities, 
          detailed in the right-hand pane.
        </p>
      </div>
      <div>
        <h2>How to Use Bokari</h2>
        <p>
          - <strong>Create Nodes:</strong> Drag nodes from the right pane to the center to create them.
        </p>
        <p>
          - <strong>Edit Nodes:</strong> Click on a node's fields to edit them. The cursor will indicate 
          if a field is not editable, which varies by node type.
        </p>
        <p>
          - <strong>Connect Nodes:</strong> Drag from a black connector to a white connector to establish 
          a parent-child relationship between nodes.
        </p>
      </div>
      <div>
        <button className="control-button save" onClick={saveToLocalStorage}>
          Save
        </button>
        <button className="control-button reset" onClick={resetGraph}>
          Reset
        </button>
      </div>
    </aside>
  );
};

