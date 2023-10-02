const FixedCostInput = ({ labelInput, valueInput, onInputChange, onAdd }) => (
  <div>
    <label>Add Fixed Cost:</label>
    <div className="input-group">
      <input
        name="labelInput"
        value={labelInput}
        placeholder="Name"
        onChange={onInputChange}
      />
      <input
        name="valueInput"
        type="number"
        value={valueInput}
        placeholder="Value"
        onChange={onInputChange}
      />
      <button className="icon-button" onClick={onAdd}>
        <i className="fa fa-plus"></i>
      </button>
    </div>
  </div>
);

export default FixedCostInput;
